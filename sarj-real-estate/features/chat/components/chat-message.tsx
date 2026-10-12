import { ParcelResultCard } from "./parcel-result-card";
import type { Message } from "../types/chat";
import { InquiryResultCard } from "./inquiry-result-card";

type ChatMessageProps = {
    message: Message;
  };

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[80%]" : "w-full"}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.content}
        </div>

        {message.parcels && message.parcels.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {message.parcels.map((parcel) => (
              <ParcelResultCard
              key={parcel.parcel_id}
              parcel={parcel}
            />
            ))}
          </div>
        )}
        {message.inquiries && message.inquiries.length > 0 && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {message.inquiries.map((inquiry) => (
                <InquiryResultCard
                    key={inquiry.inquiry_id}
                    inquiry={inquiry}
                />
                ))}
            </div>
            )}
      </div>
    </div>
  );
}