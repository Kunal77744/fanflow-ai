import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MessageBubble } from "@/components/MessageBubble";
import type { ChatMessage } from "@/types";

describe("MessageBubble", () => {
  it("renders the message content", () => {
    const message: ChatMessage = {
      role: "user",
      content: "Where is my gate?",
      timestamp: Date.now(),
    };

    render(<MessageBubble message={message} />);
    expect(screen.getByText("Where is my gate?")).toBeInTheDocument();
  });

  it("aligns user messages to the right and assistant messages to the left", () => {
    const userMessage: ChatMessage = {
      role: "user",
      content: "Hi",
      timestamp: 1,
    };
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "Hello!",
      timestamp: 2,
    };

    const { container: userContainer } = render(<MessageBubble message={userMessage} />);
    expect(userContainer.querySelector(".justify-end")).not.toBeNull();

    const { container: assistantContainer } = render(
      <MessageBubble message={assistantMessage} />
    );
    expect(assistantContainer.querySelector(".justify-start")).not.toBeNull();
  });
});
