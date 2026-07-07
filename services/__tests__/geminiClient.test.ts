import { generateAssistantReply, GeminiRequestError } from "@/services/geminiClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe("generateAssistantReply", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: "mock-api-key" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws an error if GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateAssistantReply("Hello")).rejects.toThrow(
      GeminiRequestError
    );
  });

  it("returns content on successful generation", async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => "Hello! I am your companion.",
      },
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    const reply = await generateAssistantReply("Test prompt");
    expect(reply).toBe("Hello! I am your companion.");
    expect(mockGenerateContent).toHaveBeenCalledWith("Test prompt");
  });

  it("retries once and succeeds if first attempt fails", async () => {
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValueOnce(new Error("Transient network error"))
      .mockResolvedValueOnce({
        response: {
          text: () => "Recovered successfully",
        },
      });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    const reply = await generateAssistantReply("Test prompt");
    expect(reply).toBe("Recovered successfully");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("fails after retrying if all attempts fail", async () => {
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValue(new Error("Fatal API error"));

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    await expect(generateAssistantReply("Test prompt")).rejects.toThrow(
      GeminiRequestError
    );
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });
});
