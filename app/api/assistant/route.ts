import { NextRequest, NextResponse } from "next/server";
import { validateChatMessage, validateSeatSection } from "@/utils/validation";
import { isRateLimited } from "@/utils/rateLimiter";
import { buildPrompt } from "@/services/promptBuilder";
import { generateAssistantReply, GeminiRequestError } from "@/services/geminiClient";
import { getSimulatedCrowdLevels, findLowestCrowdGate } from "@/utils/crowdSimulator";
import type { ChatApiResponse, ApiErrorResponse } from "@/types";
import { logger } from "@/utils/logger";
import { TTLCache } from "@/utils/ttlCache";
import { MAX_REQUEST_BODY_BYTES, RESPONSE_CACHE_TTL_MS } from "@/utils/constants";

export const dynamic = "force-dynamic";

const queryCache = new TTLCache<ChatApiResponse>(RESPONSE_CACHE_TTL_MS);

/**
 * Best-effort client identifier for rate limiting. Falls back to a
 * shared bucket if no forwarding header is present (e.g. local dev).
 */
function getClientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for") ?? "anonymous";
}

/** Rejects requests with an oversized body before we touch anything else. */
function checkPayloadSize(request: NextRequest): NextResponse<ApiErrorResponse> | null {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Payload too large." },
      { status: 413 }
    );
  }
  return null;
}

/** Blocks cross-origin POSTs where the Origin header doesn't match the Host. */
function checkCsrf(request: NextRequest): NextResponse<ApiErrorResponse> | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return null;

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      logger.warn("CSRF check failed: origin host mismatch", { origin, host });
      return NextResponse.json<ApiErrorResponse>(
        { error: "Forbidden: CSRF verification failed." },
        { status: 403 }
      );
    }
    return null;
  } catch (err) {
    logger.error("CSRF check failed: invalid origin header", err);
    return NextResponse.json<ApiErrorResponse>(
      { error: "Forbidden: Invalid origin header." },
      { status: 403 }
    );
  }
}

/** Parses and validates the JSON body, returning either the parsed fields or an error response. */
async function parseAndValidateBody(
  request: NextRequest
): Promise<
  | { ok: true; message: string; seatSection?: string; accessibilityMode: boolean }
  | { ok: false; response: NextResponse<ApiErrorResponse> }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json<ApiErrorResponse>(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      ),
    };
  }

  const { message, seatSection, accessibilityMode } =
    (body as Record<string, unknown>) ?? {};

  const messageCheck = validateChatMessage(message);
  if (!messageCheck.valid) {
    return {
      ok: false,
      response: NextResponse.json<ApiErrorResponse>(
        { error: messageCheck.error ?? "Invalid message." },
        { status: 400 }
      ),
    };
  }

  const sectionCheck = validateSeatSection(seatSection);
  if (!sectionCheck.valid) {
    return {
      ok: false,
      response: NextResponse.json<ApiErrorResponse>(
        { error: sectionCheck.error ?? "Invalid seat section." },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true,
    message: messageCheck.sanitized!,
    seatSection: sectionCheck.sanitized,
    accessibilityMode: Boolean(accessibilityMode),
  };
}

export async function POST(request: NextRequest) {
  const payloadError = checkPayloadSize(request);
  if (payloadError) return payloadError;

  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  const parsed = await parseAndValidateBody(request);
  if (!parsed.ok) return parsed.response;

  const { message, seatSection, accessibilityMode } = parsed;
  const cacheKey = `${message}_${seatSection || ""}_${accessibilityMode}`;
  const cached = queryCache.get(cacheKey);

  if (cached) {
    logger.info("Serving response from cache", { cacheKey });
    return NextResponse.json<ChatApiResponse>(cached);
  }

  const crowdLevels = getSimulatedCrowdLevels();
  const prompt = buildPrompt({ message, seatSection, accessibilityMode, crowdLevels });

  try {
    const reply = await generateAssistantReply(prompt);
    const lowestCrowdGate = findLowestCrowdGate(crowdLevels);

    const response: ChatApiResponse = {
      reply,
      ...(lowestCrowdGate && {
        crowdAdvisory: { gate: lowestCrowdGate, level: crowdLevels[lowestCrowdGate] },
      }),
    };

    queryCache.set(cacheKey, response);
    logger.info("Cached new response", { cacheKey });

    return NextResponse.json<ChatApiResponse>(response);
  } catch (err) {
    logger.error("Error generating assistant reply", err);
    const message =
      err instanceof GeminiRequestError
        ? err.message
        : "Something went wrong while reaching the assistant.";

    return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 502 });
  }
}
