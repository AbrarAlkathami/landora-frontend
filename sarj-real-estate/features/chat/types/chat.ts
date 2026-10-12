import type { Parcel } from "@/features/parcels/types/parcel";

import type {
    InquiryChatResult,
    ParcelChatResult,
  } from "../api/chat";
  
  export type Message = {
    id: number;
    role: "user" | "assistant";
    content: string;
    parcels?: ParcelChatResult[];
    inquiries?: InquiryChatResult[];
  };
