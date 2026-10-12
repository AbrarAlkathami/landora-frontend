"use client";

import { useState } from "react";

import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";
import { sendChatMessage } from "../api/chat";
import type { Message } from "../types/chat";

export function Chat() {
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
      const response = await sendChatMessage(message, "investor");
        
      console.log("FULL RESPONSE:", response);
console.log("FIRST PRICE:", response.parcels[0]?.total_price_sar);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        parcels: response.parcels,
      };
  
      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);
  
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Something went wrong while getting a response. Please try again.",
      };
  
      setMessages((current) => [
        ...current,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Landora</h1>
      </header>

      <main className="flex flex-1 flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-3xl">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-semibold">
                  Find the right land in Riyadh
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Tell me what you&apos;re looking for and I&apos;ll help you
                  find matching parcels.
                </p>
              </div>

              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
              />

              <ChatSuggestions
                onSelect={handleSend}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
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

            <div className="sticky bottom-0 border-t bg-background px-6 py-4">
              <div className="mx-auto max-w-3xl">
                <ChatInput
                  onSend={handleSend}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}