"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
    onSend: (message: string) => void;
    disabled?: boolean;
  };

export function ChatInput({
    onSend,
    disabled = false,
  }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <div className="rounded-2xl border bg-background p-3 shadow-sm">
      <Textarea
        value={message}
        disabled={disabled}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g. I need commercial land in East Riyadh..."
        className="min-h-24 resize-none border-0 shadow-none focus-visible:ring-0"
      />

      <div className="mt-2 flex justify-end">
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
                  >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}