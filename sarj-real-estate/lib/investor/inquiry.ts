import type { InquiryCreate } from "@/features/inquiries/types/inquiry";

export function normalizePhone(value: string) {
  let phone = value.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) - (digit >= "۰" ? 1776 : 1632)))
    .replace(/[\s()-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^05\d{8}$/.test(phone)) phone = `+966${phone.slice(1)}`;
  if (/^9665\d{8}$/.test(phone)) phone = `+${phone}`;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error("Enter a valid phone number with country code.");
  return phone;
}

export function buildInquiry(data: FormData, inquiryId: string): InquiryCreate {
  const value = (key: string) => String(data.get(key) ?? "").trim();
  const budget = value("budget");
  const amount = budget ? Number(budget) : null;
  if (amount !== null && (!Number.isSafeInteger(amount) || amount <= 0 || amount > 2147483647)) {
    throw new Error("Enter a positive whole-number budget in SAR.");
  }
  const prefers = value("transaction");
  if (amount !== null && !["sale", "lease"].includes(prefers)) {
    throw new Error("Choose buy or lease before entering a budget.");
  }
  return {
    inquiry_id: inquiryId, date: new Date().toISOString().slice(0, 10),
    investor_name: value("name"), phone: normalizePhone(value("phone")),
    wants_to: value("purpose"), intent: value("readiness"),
    land_type_wanted: value("landType"), area_of_city_wanted: value("area"),
    prefers, budget_sar: amount,
    budget_basis: amount === null ? null : prefers === "lease" ? "annual rent" : "total purchase",
    selected_parcel_id: value("parcel") || null, channel: "website", status: "new",
  };
}
