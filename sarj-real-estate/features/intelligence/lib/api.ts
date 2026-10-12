import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
import type { ChatResponse } from "@/features/chat/api/chat";
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
      else if (Array.isArray(error.detail)) message = error.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(" · ") || message;
    } catch {}
    throw new Error(message);
  }
  return response.status === 204 ? undefined as T : response.json();
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
export function saveRecord(kind: "parcels" | "inquiries", id: string, data: Record<string, unknown>) {
  return request<Parcel | Inquiry>(`${kind}/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
}
export function deleteRecord(kind: "parcels" | "inquiries", id: string) {
  return request<void>(`${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export function createLand(data: Record<string, unknown>) {
  return request<Parcel>("parcels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}
export function askAdminAdvisor(message: string) {
  return request<ChatResponse>("chat/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({message}) });
}
