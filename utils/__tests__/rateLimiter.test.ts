import { isRateLimited } from "@/utils/rateLimiter";

describe("isRateLimited", () => {
  it("allows the first request from a new client", () => {
    expect(isRateLimited("client-a")).toBe(false);
  });

  it("allows repeated requests under the limit", () => {
    const client = "client-b";
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(client)).toBe(false);
    }
  });

  it("blocks a client once it exceeds the per-window request limit", () => {
    const client = "client-c";
    for (let i = 0; i < 20; i++) {
      isRateLimited(client);
    }
    // 21st request in the same window should be blocked.
    expect(isRateLimited(client)).toBe(true);
  });

  it("tracks separate clients independently", () => {
    const busyClient = "client-d";
    const freshClient = "client-e";

    for (let i = 0; i < 25; i++) {
      isRateLimited(busyClient);
    }

    // A different client key must not be affected by another client's usage.
    expect(isRateLimited(freshClient)).toBe(false);
  });
});
