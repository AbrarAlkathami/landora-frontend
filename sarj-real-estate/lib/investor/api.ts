import type { PaginatedParcelsResponse, Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry, InquiryCreate } from "@/features/inquiries/types/inquiry";
import type { ChatResponse } from "@/features/chat/api/chat";
import { toInvestorParcel, type InvestorParcel } from "./parcels";
export async function investorRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/investor/${path}`, {
    ...options,
    cache: "no-store"
  });
  if (!response.ok) {
    let message = "We couldn’t complete your request. Please try again.";
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {/* Keep a user-friendly message for non-JSON failures. */}
    throw new Error(message);
  }
  return response.json();
}
export async function getInvestorPortfolio(signal?: AbortSignal): Promise<InvestorParcel[]> {
  const first = await investorRequest<PaginatedParcelsResponse>("parcels?page=1&page_size=100", {
    signal
  });
  const items = [...first.items];
  // The API caps a page at 100. Read every page so discovery and metrics use the full DB.
  for (let page = 2; page <= first.total_pages; page++) {
    const next = await investorRequest<PaginatedParcelsResponse>(`parcels?page=${page}&page_size=100`, {
      signal
    });
    items.push(...next.items);
  }
  return [...new Map(items.map(item => [item.parcel_id, item])).values()].map(toInvestorParcel);
}
export async function getInvestorParcel(id: string): Promise<InvestorParcel> {
  return toInvestorParcel(await investorRequest<Parcel>(`parcels/${encodeURIComponent(id)}`));
}
export function submitInvestorInquiry(data: InquiryCreate): Promise<Inquiry> {
  return investorRequest("inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}
export function askInvestorAdvisor(message: string, parcelIds?: string[]): Promise<ChatResponse> {
  return investorRequest("chat/investor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      ...(parcelIds?.length ? {
        parcel_ids: parcelIds
      } : {})
    })
  });
}
