import { validateChatMessage, validateSeatSection } from "@/utils/validation";

describe("validateChatMessage", () => {
  it("accepts a normal message", () => {
    const result = validateChatMessage("Where is my gate?");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("Where is my gate?");
  });

  it("rejects non-string input", () => {
    const result = validateChatMessage(12345);
    expect(result.valid).toBe(false);
  });

  it("rejects empty or whitespace-only input", () => {
    expect(validateChatMessage("").valid).toBe(false);
    expect(validateChatMessage("   ").valid).toBe(false);
  });

  it("rejects messages over the max length", () => {
    const longMessage = "a".repeat(501);
    const result = validateChatMessage(longMessage);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too long/i);
  });

  it("strips control characters", () => {
    const result = validateChatMessage("hello\u0007world");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("helloworld");
  });

  it("supports non-Latin scripts (multilingual input)", () => {
    const result = validateChatMessage("मेरा गेट कहाँ है?");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("मेरा गेट कहाँ है?");
  });
});

describe("validateSeatSection", () => {
  it("allows an empty/undefined section", () => {
    expect(validateSeatSection(undefined).valid).toBe(true);
    expect(validateSeatSection("").valid).toBe(true);
  });

  it("accepts a valid section code", () => {
    const result = validateSeatSection("109");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("109");
  });

  it("rejects section codes with unsafe characters", () => {
    const result = validateSeatSection("109<script>");
    expect(result.valid).toBe(false);
  });

  it("rejects non-string section input", () => {
    const result = validateSeatSection(109);
    expect(result.valid).toBe(false);
  });
});
