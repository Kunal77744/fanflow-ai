/**
 * Centralized tunables used across the API layer. Keeping these in one
 * place makes limits easy to audit and adjust without hunting through
 * multiple files for magic numbers.
 */

export const MAX_REQUEST_BODY_BYTES = 5000;
export const RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const CHAT_MESSAGE_MAX_LENGTH = 500;
export const CHAT_MESSAGE_MIN_LENGTH = 1;
export const GEMINI_REQUEST_TIMEOUT_MS = 10_000;
