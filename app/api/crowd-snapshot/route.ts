import { NextResponse } from "next/server";
import { getSimulatedCrowdLevels } from "@/utils/crowdSimulator";

export const dynamic = "force-dynamic";

/**
 * Lightweight, read-only endpoint that powers the live stadium ticker.
 * Deliberately separate from /api/assistant so the UI can poll crowd
 * status frequently without invoking the (rate-limited, LLM-backed)
 * chat endpoint.
 */
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "no-referrer",
};

export async function GET() {
  const levels = getSimulatedCrowdLevels();
  return NextResponse.json({ levels }, { headers: SECURITY_HEADERS });
}
