import { logger } from "@/utils/logger";

describe("logger utility", () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("logs info messages with timestamp", () => {
    logger.info("Test info message");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[INFO\] .* Test info message/)
    );
  });

  it("logs info messages with meta data", () => {
    logger.info("Test info message with meta", { key: "value" });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[INFO\] .* Test info message with meta \| Meta: \{"key":"value"\}/)
    );
  });

  it("logs warn messages with timestamp", () => {
    logger.warn("Test warn message");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[WARN\] .* Test warn message/)
    );
  });

  it("logs warn messages with meta data", () => {
    logger.warn("Test warn message with meta", { key: "value" });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[WARN\] .* Test warn message with meta \| Meta: \{"key":"value"\}/)
    );
  });

  it("logs error messages with error stack", () => {
    const testError = new Error("Detailed crash info");
    logger.error("Database failure", testError);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ERROR\] .* Database failure \| Details: Detailed crash info \| Stack: /)
    );
  });

  it("logs error messages with plain string errors", () => {
    logger.error("Generic fail", "Something bad");
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ERROR\] .* Generic fail \| Details: Something bad/)
    );
  });
});
