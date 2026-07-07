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

  it("prunes expired entries when the map size grows large", () => {
    const realNow = Date.now;
    let mockTime = 1000000;
    Date.now = () => mockTime;

    // Generate 1005 unique client requests to grow map size > 1000
    for (let i = 0; i < 1005; i++) {
      isRateLimited(`cleanup-client-${i}`);
    }

    // Move time forward past the window duration (1 minute)
    mockTime += 61000;

    // This request triggers the map check and prunes the expired entries
    expect(isRateLimited("another-client")).toBe(false);

    Date.now = realNow;
  });
});
