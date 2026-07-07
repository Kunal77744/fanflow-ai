"use client";

import { useCallback, useState } from "react";
import type { ChatMessage, ChatApiResponse, ApiErrorResponse } from "@/types";

interface UseChatOptions {
  accessibilityMode: boolean;
  seatSection?: string;
}

interface UseChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  crowdAdvisory: ChatApiResponse["crowdAdvisory"];
  sendMessage: (text: string) => Promise<void>;
}

export function useChat({ accessibilityMode, seatSection }: UseChatOptions): UseChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crowdAdvisory, setCrowdAdvisory] = useState<ChatApiResponse["crowdAdvisory"]>();

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            seatSection,
            accessibilityMode,
          }),
        });

        const data: ChatApiResponse | ApiErrorResponse = await res.json();

        if (!res.ok || "error" in data) {
          const errMsg = "error" in data ? data.error : "Something went wrong.";
          setError(errMsg);
          return;
        }

        setCrowdAdvisory(data.crowdAdvisory);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, timestamp: Date.now() },
        ]);
      } catch {
        setError("Couldn't reach the assistant. Check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessibilityMode, seatSection, isLoading]
  );

  return { messages, isLoading, error, crowdAdvisory, sendMessage };
}
