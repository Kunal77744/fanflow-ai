import type { CrowdLevel, Gate } from "@/types";
import stadiumData from "@/data/stadium.json";

/**
 * Simulates a live crowd-sensor feed.
 *
 * In production this would be replaced by a real IoT/venue-management
 * integration. For this demo, crowd levels drift over time using a
 * seeded pseudo-random walk so the app can showcase "real-time decision
 * support" without needing live hardware.
 */

const CROWD_LEVELS: CrowdLevel[] = ["low", "medium", "high"];

function pseudoRandomFromSeed(seed: number): number {
  // Deterministic, dependency-free PRNG (mulberry32) so behaviour
  // is testable and doesn't require a random-number library.
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Returns crowd levels for all gates at a given point in time.
 * Same `timeBucket` always yields the same result (deterministic),
 * different buckets drift the levels — simulating a slowly changing
 * live feed without needing a stateful server or database.
 */
export function getSimulatedCrowdLevels(
  timeBucket: number = Math.floor(Date.now() / 15000)
): Record<string, CrowdLevel> {
  const gates = stadiumData.gates as Gate[];
  const result: Record<string, CrowdLevel> = {};

  gates.forEach((gate, index) => {
    const seed = timeBucket * 1000 + index;
    const roll = pseudoRandomFromSeed(seed);
    // Bias toward the gate's baseline level from stadium.json so the
    // simulation still feels grounded rather than fully random.
    const baselineIndex = CROWD_LEVELS.indexOf(gate.crowdLevel);
    const drift = roll < 0.33 ? -1 : roll > 0.66 ? 1 : 0;
    const newIndex = Math.min(
      CROWD_LEVELS.length - 1,
      Math.max(0, baselineIndex + drift)
    );
    result[gate.id] = CROWD_LEVELS[newIndex];
  });

  return result;
}

export function findLowestCrowdGate(
  levels: Record<string, CrowdLevel>
): string | null {
  const order: Record<CrowdLevel, number> = { low: 0, medium: 1, high: 2 };
  const entries = Object.entries(levels);
  if (entries.length === 0) return null;

  return entries.reduce((best, current) =>
    order[current[1]] < order[best[1]] ? current : best
  )[0];
}
