/**
 * Structured server-side logging utility.
 * Helps with observability and tracking of API operations without relying on
 * raw console calls in production code.
 */

type LogMeta = Record<string, unknown>;

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.log(
      `[INFO] ${new Date().toISOString()}: ${message}${
        meta ? ` | Meta: ${JSON.stringify(meta)}` : ""
      }`
    );
  },

  warn: (message: string, meta?: LogMeta) => {
    console.warn(
      `[WARN] ${new Date().toISOString()}: ${message}${
        meta ? ` | Meta: ${JSON.stringify(meta)}` : ""
      }`
    );
  },

  error: (message: string, error?: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(
      `[ERROR] ${new Date().toISOString()}: ${message} | Details: ${errorMessage}${
        errorStack ? ` | Stack: ${errorStack}` : ""
      }`
    );
  },
};
