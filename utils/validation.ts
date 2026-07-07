const MAX_MESSAGE_LENGTH = 500;
const MIN_MESSAGE_LENGTH = 1;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates and sanitizes user chat input before it is ever sent to the
 * LLM or used to build a prompt. This is the single choke point for
 * untrusted user input in the app.
 */
export function validateChatMessage(input: unknown): ValidationResult {
  if (typeof input !== "string") {
    return { valid: false, error: "Message must be text." };
  }

  const trimmed = input.trim();

  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return { valid: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
    };
  }

  // Strip control characters that have no legitimate use in a chat
  // message and could otherwise be used for terminal/log injection.
  const sanitized = trimmed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  return { valid: true, sanitized };
}

export function validateSeatSection(input: unknown): ValidationResult {
  if (input === undefined || input === null || input === "") {
    return { valid: true, sanitized: undefined };
  }

  if (typeof input !== "string") {
    return { valid: false, error: "Seat section must be text." };
  }

  const trimmed = input.trim();

  // Section IDs in our dataset are short numeric/alphanumeric codes.
  if (!/^[A-Za-z0-9\- ]{1,10}$/.test(trimmed)) {
    return { valid: false, error: "Seat section format looks invalid." };
  }

  return { valid: true, sanitized: trimmed };
}
