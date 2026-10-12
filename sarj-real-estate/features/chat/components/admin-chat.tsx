"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { sendChatMessage } from "../api/chat";
import type { Message } from "../types/chat";

export function AdminChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
  
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
  
    try {
      const response = await sendChatMessage(message, "admin");
  
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        parcels: response.parcels,
        inquiries: response.inquiries,
      };
  
      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 size-12 rounded-full"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="size-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] flex-col rounded-xl border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <p className="font-semibold">Landora Assistant</p>
          <p className="text-xs text-muted-foreground">
            Ask about parcels or investor inquiries
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ask something like “Which inquiries are looking for commercial
            land in East Riyadh?”
          </p>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Landora is thinking...
          </p>
        )}
      </div>

      <div className="border-t p-4">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}