import { NextRequest, NextResponse } from "next/server";
import { validateChatMessage, validateSeatSection } from "@/utils/validation";
import { isRateLimited } from "@/utils/rateLimiter";
import { buildPrompt } from "@/services/promptBuilder";
import { generateAssistantReply, GeminiRequestError } from "@/services/geminiClient";
import { getSimulatedCrowdLevels, findLowestCrowdGate } from "@/utils/crowdSimulator";
import type { ChatApiResponse, ApiErrorResponse } from "@/types";
import { logger } from "@/utils/logger";

export const dynamic = "force-dynamic";

interface CacheEntry {
  response: ChatApiResponse;
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getClientKey(request: NextRequest): string {
  // Best-effort client identifier for rate limiting. Falls back to a
  // shared bucket if no forwarding header is present (e.g. local dev).
  return request.headers.get("x-forwarded-for") ?? "anonymous";
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") && Number(request.headers.get("content-length")) > 5000) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Payload too large." },
      { status: 413 }
    );
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { message, seatSection, accessibilityMode } =
    (body as Record<string, unknown>) ?? {};

  const messageCheck = validateChatMessage(message);
  if (!messageCheck.valid) {
    return NextResponse.json<ApiErrorResponse>(
      { error: messageCheck.error ?? "Invalid message." },
      { status: 400 }
    );
  }

  const sectionCheck = validateSeatSection(seatSection);
  if (!sectionCheck.valid) {
    return NextResponse.json<ApiErrorResponse>(
      { error: sectionCheck.error ?? "Invalid seat section." },
      { status: 400 }
    );
  }

  const cacheKey = `${messageCheck.sanitized!}_${sectionCheck.sanitized || ""}_${Boolean(accessibilityMode)}`;
  const cached = queryCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    logger.info("Serving response from cache", { cacheKey });
    return NextResponse.json<ChatApiResponse>(cached.response);
  }

  const crowdLevels = getSimulatedCrowdLevels();

  const prompt = buildPrompt({
    message: messageCheck.sanitized!,
    seatSection: sectionCheck.sanitized,
    accessibilityMode: Boolean(accessibilityMode),
    crowdLevels,
  });

  try {
    const reply = await generateAssistantReply(prompt);
    const lowestCrowdGate = findLowestCrowdGate(crowdLevels);

    const response: ChatApiResponse = {
      reply,
      ...(lowestCrowdGate && {
        crowdAdvisory: { gate: lowestCrowdGate, level: crowdLevels[lowestCrowdGate] },
      }),
    };

    queryCache.set(cacheKey, { response, timestamp: Date.now() });
    logger.info("Cached new response", { cacheKey });

    return NextResponse.json<ChatApiResponse>(response);
  } catch (err) {
    logger.error("Error generating assistant reply", err);
    const message =
      err instanceof GeminiRequestError || (err instanceof Error && err.constructor.name === "GeminiRequestError")
        ? err.message
        : "Something went wrong while reaching the assistant.";

    return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 502 });
  }
}
