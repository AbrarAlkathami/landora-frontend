import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...options,
    cache: "no-store"
  });
  if (!response.ok) {
    let message = "Couldn’t complete the request.";
    try {
      const error = await response.json();
      if (typeof error.detail === "string") message = error.detail;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}
async function allPages<T>(endpoint: string, signal?: AbortSignal) {
  const items: T[] = [];
  let page = 1,
    totalPages = 1;
  do {
    const result = await request<{
      items: T[];
      total_pages: number;
    }>(`${endpoint}?page=${page}&page_size=100`, {
      signal
    });
    items.push(...result.items);
    totalPages = result.total_pages;
    page++;
  } while (page <= totalPages);
  return items;
}
export async function getBusinessData(signal?: AbortSignal) {
  const [parcels, inquiries] = await Promise.all([allPages<Parcel>("parcels", signal), allPages<Inquiry>("inquiries", signal)]);
  return {
    parcels,
    inquiries
  };
}
export function saveInquiryStatus(id: string, status: string) {
  return request<Inquiry>(`inquiries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status
    })
  });
}
