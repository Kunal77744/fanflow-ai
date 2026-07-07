import { getSimulatedCrowdLevels, findLowestCrowdGate } from "@/utils/crowdSimulator";

describe("getSimulatedCrowdLevels", () => {
  it("returns a crowd level for every gate", () => {
    const levels = getSimulatedCrowdLevels(1);
    const gateIds = Object.keys(levels);
    expect(gateIds.length).toBeGreaterThan(0);
    gateIds.forEach((gate) => {
      expect(["low", "medium", "high"]).toContain(levels[gate]);
    });
  });

  it("is deterministic for the same time bucket", () => {
    const a = getSimulatedCrowdLevels(42);
    const b = getSimulatedCrowdLevels(42);
    expect(a).toEqual(b);
  });

  it("can vary across different time buckets", () => {
    const snapshots = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => getSimulatedCrowdLevels(seed));
    const serialized = snapshots.map((s) => JSON.stringify(s));
    const uniqueCount = new Set(serialized).size;
    // Not every bucket must differ, but across 8 buckets we expect some drift.
    expect(uniqueCount).toBeGreaterThan(1);
  });
});

describe("findLowestCrowdGate", () => {
  it("picks the gate with the lowest crowd level", () => {
    const result = findLowestCrowdGate({
      "Gate A": "high",
      "Gate B": "low",
      "Gate C": "medium",
    });
    expect(result).toBe("Gate B");
  });

  it("returns null for an empty input", () => {
    expect(findLowestCrowdGate({})).toBeNull();
  });
});
