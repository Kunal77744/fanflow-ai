"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CrowdLevel } from "@/types";

interface GateStatus {
  gate: string;
  level: CrowdLevel;
}

const LEVEL_STYLES: Record<CrowdLevel, { label: string; color: string; dot: string }> = {
  low: { label: "LOW", color: "text-turf", dot: "bg-turf" },
  medium: { label: "MED", color: "text-amber", dot: "bg-amber" },
  high: { label: "HIGH", color: "text-red-400", dot: "bg-red-400" },
};

/**
 * Signature visual element: a departures-board-style live ticker showing
 * gate crowd status. Polls the crowd snapshot endpoint on an interval so
 * the "real-time decision support" feature is visible, not just implied.
 */
export function StadiumTicker() {
  const [statuses, setStatuses] = useState<GateStatus[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/crowd-snapshot");
        if (!res.ok) return;
        const data: { levels: Record<string, CrowdLevel> } = await res.json();
        if (cancelled) return;
        setStatuses(
          Object.entries(data.levels).map(([gate, level]) => ({ gate, level }))
        );
      } catch {
        // Silent — ticker simply keeps showing last-known values.
      }
    }

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="w-full border-y border-line bg-navy-light overflow-hidden"
      role="status"
      aria-label="Live gate crowd status board"
    >
      <div className="flex items-center gap-6 px-4 py-2 overflow-x-auto scoreboard-digits text-sm">
        <span className="text-foreground/50 shrink-0 tracking-widest">LIVE GATE STATUS</span>
        <AnimatePresence mode="popLayout">
          {statuses.map((s) => (
            <motion.div
              key={s.gate}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 shrink-0"
            >
              <span className={`h-2 w-2 rounded-full ${LEVEL_STYLES[s.level].dot}`} aria-hidden />
              <span className="text-foreground/80">{s.gate}</span>
              <span className={`font-semibold ${LEVEL_STYLES[s.level].color}`}>
                {LEVEL_STYLES[s.level].label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
