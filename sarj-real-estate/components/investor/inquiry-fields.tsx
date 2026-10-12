"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/shared/language";
import type { InvestorParcel } from "@/lib/investor/parcels";

const purposes = ["build a family home", "build a residential compound", "build apartments to rent", "build villas to sell", "open a showroom", "open a car showroom", "open a retail store", "open a warehouse", "open an office building", "long-term investment", "explore my options"];

export function InquiryFields({ parcels, selected, onSelect }: {
  parcels: InvestorParcel[]; selected?: InvestorParcel;
  onSelect: (parcel?: InvestorParcel) => void;
}) {
  const { t, locale, direction } = useLanguage();
  const [transaction, setTransaction] = useState(selected?.listing.toLowerCase() ?? "any");
  const [type, setType] = useState(selected?.type.toLowerCase() ?? "any");
  const [area, setArea] = useState(selected?.area ?? "Any");
  return <div className="inquiry-fields" dir={direction}>
    <label><span>{t("Your name")}</span><Input name="name" placeholder={t("Full name")} required autoComplete="name" minLength={2} maxLength={120} /></label>
    <label><span>{t("Phone number")}</span><Input name="phone" type="tel" dir="ltr" placeholder={locale === "ar" ? "مثال: ٠٥٥١٢٣٤٥٦٧" : "+966 5X XXX XXXX"} required autoComplete="tel" maxLength={24} /></label>
    <label><span>{t("What do you want to do with the land?")}</span><select name="purpose" required defaultValue=""><option value="" disabled>{t("Select your goal")}</option>{purposes.map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label>
    <label><span>{t("How soon are you looking to move?")}</span><select name="readiness" required defaultValue=""><option value="" disabled>{t("Select your readiness")}</option>{["exploring", "comparing options", "ready to move"].map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label>
    <label><span>{t("Land type")}</span><select name="landType" value={type} onChange={e => setType(e.target.value)}>{["any", "residential", "commercial"].map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label>
    <label><span>{t("Buy or lease?")}</span><select name="transaction" value={transaction} onChange={e => setTransaction(e.target.value)}><option value="any">{t("Open to either")}</option><option value="sale">{t("Buy")}</option><option value="lease">{t("Lease")}</option></select></label>
    <label><span>{t("Preferred area of Riyadh")}</span><select name="area" value={area} onChange={e => setArea(e.target.value)}>{["Any", "North", "East", "West", "South", "Central"].map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label>
    <label><span>{t(transaction === "lease" ? "Annual rent budget (SAR)" : "Purchase budget (SAR)")}</span><Input key={transaction} name="budget" type="number" min={1} max={2147483647} step={1} disabled={transaction === "any"} placeholder={t("Optional")} /></label>
    <label className="inquiry-field-wide"><span>{t("Selected opportunity (optional)")}</span><select value={selected?.id ?? ""} onChange={e => {
      const parcel = parcels.find(p => p.id === e.target.value);
      onSelect(parcel);
      if (parcel) { setTransaction(parcel.listing.toLowerCase()); setType(parcel.type.toLowerCase()); setArea(parcel.area); }
    }} name="parcel"><option value="">{t("Help me find the right land")}</option>{parcels.filter(p => p.available).map(p => <option key={p.id} value={p.id}>{locale === "ar" ? p.districtAr : p.district} · {t(p.type)} · {p.id}</option>)}</select></label>
  </div>;
}
