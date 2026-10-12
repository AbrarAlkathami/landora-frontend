const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export type ChatMode = "investor" | "admin";

export type ParcelChatResult = {
  parcel_id: string;
  district_en: string;
  district_ar: string;
  land_type: string;
  listing_type: string;
  status: string;
  total_price_sar: number | null;
};

export type InquiryChatResult = {
  inquiry_id: string;
  investor_name: string;
  land_type_wanted: string;
  area_of_city_wanted: string;
  status: string;
};

export type ChatResponse = {
  answer: string;
  parcels: ParcelChatResult[];
  inquiries: InquiryChatResult[];
};

export async function sendChatMessage(
  message: string,
  mode: ChatMode,
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat/${mode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}