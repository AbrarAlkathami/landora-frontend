import type { InvestorParcel } from "./parcels";
export const advisorPrompts = ["Find commercial land in East Riyadh", "What can I buy for SAR 10M?", "Compare these two parcels", "Find land suitable for a showroom"];
export type ChatMessage = {
  role: "user" | "advisor";
  text: string;
  lands?: InvestorParcel[];
};
