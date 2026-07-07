import { buildPrompt } from "@/services/promptBuilder";

describe("buildPrompt", () => {
  const baseCrowdLevels = { "Gate A": "high", "Gate B": "low" } as const;

  it("includes the fan's raw message", () => {
    const prompt = buildPrompt({
      message: "Where is the nearest washroom?",
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).toContain("Where is the nearest washroom?");
  });

  it("includes gate context when a valid seat section is given", () => {
    const prompt = buildPrompt({
      message: "Where do I go?",
      seatSection: "109",
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).toContain("Gate C");
    expect(prompt).toContain("Section 109");
  });

  it("omits seat context gracefully for an unknown section", () => {
    const prompt = buildPrompt({
      message: "Where do I go?",
      seatSection: "999",
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).not.toContain("Fan's seat context");
  });

  it("includes an accessibility instruction when accessibility mode is on", () => {
    const prompt = buildPrompt({
      message: "Help me get around",
      accessibilityMode: true,
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).toMatch(/Accessibility mode is ON/);
  });

  it("always includes live crowd levels for decision support", () => {
    const prompt = buildPrompt({
      message: "Is it busy?",
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).toContain("Gate A: high traffic");
    expect(prompt).toContain("Gate B: low traffic");
  });

  it("instructs the model to respond in the user's own language", () => {
    const prompt = buildPrompt({
      message: "¿Dónde está mi puerta?",
      crowdLevels: baseCrowdLevels,
    });
    expect(prompt).toMatch(/reply fluently in that same language/i);
  });
});
