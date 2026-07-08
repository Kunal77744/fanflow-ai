import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/utils/logger";

const MODEL_NAME = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 10_000;

export class GeminiRequestError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GeminiRequestError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new GeminiRequestError("The assistant took too long to respond.")),
      ms
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Sends a fully-built prompt to Gemini and returns the plain-text reply.
 * Retries once on transient failure before giving up, and always fails
 * closed with a user-safe error message (never leaks raw provider errors).
 */
export async function generateAssistantReply(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiRequestError(
      "The assistant is not configured yet. Missing GEMINI_API_KEY."
    );
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: MODEL_NAME });

  const attempt = async (): Promise<string> => {
    const result = await withTimeout(model.generateContent(prompt), REQUEST_TIMEOUT_MS);
    const text = result.response.text();

    if (!text || !text.trim()) {
      throw new GeminiRequestError("The assistant returned an empty response.");
    }

    return text.trim();
  };

  try {
    logger.info("Sending request to Gemini API", { model: MODEL_NAME });
    return await attempt();
  } catch (firstError) {
    logger.warn("First attempt failed, retrying Gemini API request", { error: String(firstError) });
    try {
      return await attempt();
    } catch (secondError) {
      logger.error("All Gemini API attempts failed", secondError);
      if (firstError instanceof GeminiRequestError) throw firstError;
      throw new GeminiRequestError(
        "The assistant is temporarily unavailable. Please try again.",
        { cause: secondError }
      );
    }
  }
}
