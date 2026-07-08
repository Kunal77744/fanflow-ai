import { NextResponse } from "next/server";
import { getSimulatedCrowdLevels } from "@/utils/crowdSimulator";

export const dynamic = "force-dynamic";

/**
 * Lightweight, read-only endpoint that powers the live stadium ticker.
 * Deliberately separate from /api/assistant so the UI can poll crowd
 * status frequently without invoking the (rate-limited, LLM-backed)
 * chat endpoint.
 */
export async function GET() {
  const levels = getSimulatedCrowdLevels();
  return NextResponse.json({ levels });
}
