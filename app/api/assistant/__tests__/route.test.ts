/**
 * @jest-environment node
 */
import { POST } from "../route";
import { isRateLimited } from "@/utils/rateLimiter";
import { generateAssistantReply, GeminiRequestError } from "@/services/geminiClient";
import { NextRequest } from "next/server";

jest.mock("@/utils/rateLimiter");
jest.mock("@/services/geminiClient", () => {
  const original = jest.requireActual("@/services/geminiClient");
  return {
    ...original,
    generateAssistantReply: jest.fn(),
  };
});

describe("POST /api/assistant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: unknown, headers?: Record<string, string>) => {
    const rawBody = body !== null ? JSON.stringify(body) : "";
    return new NextRequest("http://localhost/api/assistant", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(headers || {}),
      },
      body: rawBody || undefined,
    });
  };

  it("returns 413 Payload Too Large if Content-Length exceeds 5000", async () => {
    const req = createRequest({ message: "a" }, { "content-length": "6000" });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toMatch(/Payload too large/i);
  });

  it("returns 429 Too Many Requests if client is rate limited", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(true);
    const req = createRequest({ message: "Hello" });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/Too many requests/i);
  });

  it("returns 400 Bad Request if request body is empty or invalid JSON", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/assistant", {
      method: "POST",
      body: "invalid-json-string-not-object",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request body must be/i);
  });

  it("returns 400 Bad Request if message validation fails", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    const req = createRequest({ message: "" }); // Empty message

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/cannot be empty/i);
  });

  it("returns 400 Bad Request if seat section validation fails", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    const req = createRequest({ message: "Hello", seatSection: "109<script>" });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Seat section format/i);
  });

  it("returns 200 and assistant reply on successful generation", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    (generateAssistantReply as jest.Mock).mockResolvedValue("You should use Gate B.");
    const req = createRequest({ message: "Where is my seat?", seatSection: "105" });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe("You should use Gate B.");
    expect(data).toHaveProperty("crowdAdvisory");
    expect(generateAssistantReply).toHaveBeenCalled();
  });

  it("returns 502 Bad Gateway if Gemini client throws GeminiRequestError", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    (generateAssistantReply as jest.Mock).mockRejectedValue(
      new GeminiRequestError("The assistant took too long to respond.")
    );
    const req = createRequest({ message: "Help me" });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("The assistant took too long to respond.");
  });

  it("returns 502 Bad Gateway on generic server errors during generation", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    (generateAssistantReply as jest.Mock).mockRejectedValue(new Error("Unexpected crash"));
    const req = createRequest({ message: "Help me" });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toMatch(/Something went wrong while reaching/i);
  });

  it("returns response from cache on repeated requests", async () => {
    (isRateLimited as jest.Mock).mockReturnValue(false);
    const replyText = "First call response";
    (generateAssistantReply as jest.Mock).mockResolvedValue(replyText);

    const req1 = createRequest({ message: "Hello cache test" });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    const req2 = createRequest({ message: "Hello cache test" });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);

    const data2 = await res2.json();
    expect(data2.reply).toBe(replyText);
    expect(generateAssistantReply).toHaveBeenCalledTimes(1);
  });
});
