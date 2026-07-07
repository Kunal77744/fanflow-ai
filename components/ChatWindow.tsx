"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/MessageBubble";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { SeatInput } from "@/components/SeatInput";

const SUGGESTIONS = [
  "Where is my gate?",
  "¿Dónde está el baño más cercano?",
  "Nearest metro station?",
  "Is my gate crowded right now?",
];

export function ChatWindow() {
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [seatSection, setSeatSection] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, error, crowdAdvisory, sendMessage } = useChat({
    accessibilityMode,
    seatSection: seatSection || undefined,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-mode", accessibilityMode);
  }, [accessibilityMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <SeatInput value={seatSection} onChange={setSeatSection} />
        <AccessibilityToggle enabled={accessibilityMode} onToggle={setAccessibilityMode} />
      </div>

      {crowdAdvisory && (
        <div
          className="mx-4 mb-2 rounded-lg border border-line bg-navy-light px-3 py-2 text-xs text-foreground/70"
          role="status"
        >
          Lowest-traffic gate right now:{" "}
          <span className="text-turf font-semibold">{crowdAdvisory.gate}</span> (
          {crowdAdvisory.level})
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-3 min-h-[320px] max-h-[50vh]"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
            <p className="text-foreground/60 text-sm max-w-xs">
              Ask me anything about getting around the stadium today — in any language.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-foreground/70 hover:border-turf hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, index) => (
          <MessageBubble key={`${m.role}-${m.timestamp}-${index}`} message={m} />
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
            aria-label="Assistant is typing"
          >
            <div className="bg-cream text-navy rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm flex gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.15s]">●</span>
              <span className="animate-bounce [animation-delay:0.3s]">●</span>
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <p role="alert" className="mx-4 mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about gates, transport, amenities…"
          maxLength={500}
          className="flex-1 rounded-full border border-line bg-navy-light px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-full bg-turf px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-turf-dim transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
