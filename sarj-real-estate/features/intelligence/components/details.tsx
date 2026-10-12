"use client";

import { useLanguage } from "@/components/shared/language";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Loader2, MapPin, Phone, MessageCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useBusiness, useDetailSelection } from "./provider";
import { currency, title, statuses, matchInquiry, isOpen, lower } from "../lib/analytics";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
import type { Parcel } from "@/features/parcels/types/parcel";
export function StatusBadge({
  status
}: {
  status: string;
}) {
  const {
    t
  } = useLanguage();
  return <span className={`bi-badge status-${lower(status)}`}>
    {t(title(status))}
  </span>;
}
function Field({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  const {
    t
  } = useLanguage();
  return <div>
    <dt>
      {t(label)}
    </dt>
    <dd>
      {t(value || "—")}
    </dd>
  </div>;
}
export function DetailDrawers() {
  const {
    t
  } = useLanguage();
  const {
    parcels,
    inquiries
  } = useBusiness();
  const {
    parcelId,
    inquiryId,
    closeDetail
  } = useDetailSelection();
  const inquiry = inquiries.find(q => q.inquiry_id === inquiryId);
  const parcel = parcels.find(p => p.parcel_id === parcelId);
  return <Sheet open={!!inquiry || !!parcel} onOpenChange={open => {
    if (!open) closeDetail();
  }}>
    <SheetContent className="bi-drawer w-full! sm:max-w-[620px]! overflow-y-auto">
      {inquiry ? <InquiryDetail key={inquiry.inquiry_id} inquiry={inquiry} /> : parcel ? <ParcelDetail parcel={parcel} /> : <SheetTitle>{t("Record details")}</SheetTitle>}
    </SheetContent>
  </Sheet>;
}
function InquiryDetail({
  inquiry: q
}: {
  inquiry: Inquiry;
}) {
  const {
    t,
    locale
  } = useLanguage();
  const {
    parcels,
    analysis,
    updateStatus,
    openParcel
  } = useBusiness();
  const [status, setStatus] = useState(q.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const matches = (analysis.matches.get(q.inquiry_id) ?? matchInquiry(q, parcels)).slice(0, 3);
  const phone = q.phone.replace(/[^\d+]/g, "");
  const statusOptions = Array.from(new Set([...statuses, q.status]));
  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateStatus(q.inquiry_id, status);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t save status.");
    } finally {
      setSaving(false);
    }
  }
  return <>
    <div className="bi-detail-head">
      <span className="bi-eyebrow">{t("INVESTOR OPPORTUNITY · ")}{q.inquiry_id}</span>
      <SheetTitle>
        {q.investor_name}
      </SheetTitle>
      <SheetDescription>{t("Understand the ambition. Find the right next step.")}</SheetDescription>
      <div className="bi-detail-tags">
        <StatusBadge status={q.status} />
        <span className="bi-badge">
          {t(title(q.intent))}
        </span>
      </div>
    </div>
    <div className="bi-contact-actions">
      {phone ? <>
        <a href={`tel:${phone}`} className="bi-button"><Phone size={14} />{t("Call investor")}</a>
        <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="bi-button bi-button-outline"><MessageCircle size={15} />{t("WhatsApp")}<ArrowUpRight size={13} /></a>
      </> : <p className="bi-muted">{t("No contact number provided.")}</p>}
    </div>
    <dl className="bi-detail-grid">
      <Field label="Inquiry date" value={q.date} />
      <Field label="Phone" value={q.phone} />
      <Field label="Land type" value={title(q.land_type_wanted)} />
      <Field label="Riyadh area" value={q.area_of_city_wanted} />
      <Field label="Transaction" value={title(q.prefers)} />
      <Field label="Investor budget" value={currency(q.budget_sar)} />
      <Field label="Budget basis" value={q.budget_basis} />
      <Field label="Channel" value={title(q.channel)} />
    </dl>
    {q.selected_parcel_id && <div className="bi-detail-section">
      <h3>{t("Selected opportunity")}</h3>
      <button type="button" className="bi-button bi-button-outline" onClick={() => openParcel(q.selected_parcel_id!)}>{q.selected_parcel_id}<ArrowUpRight size={14} /></button>
    </div>}
    <div className="bi-detail-section">
      <h3>{t("The investor’s ambition")}</h3>
      <p className="bi-note-text">
        {q.wants_to}
      </p>
    </div>
    <div className="bi-detail-section">
      <div className="bi-section-title">
        <h3>{t("Move the conversation forward")}</h3>
        {saved && <span className="bi-saved" role="status"><Check size={13} />{t("Status saved")}</span>}
      </div>
      <div className="bi-status-editor">
        <label className="sr-only" htmlFor="inquiry-status">{t("Inquiry status")}</label>
        <select id="inquiry-status" value={status} disabled={saving} onChange={e => {
          setStatus(e.target.value);
          setSaved(false);
        }}>
          {statusOptions.map(s => <option key={s} value={s}>
            {t(title(s))}
          </option>)}
        </select>
        <Button className="bi-button" disabled={saving || status === q.status} onClick={save}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{t("Save status")}</Button>
      </div>
      {error && <p className="bi-error" role="alert">
        {t(error)}
      </p>}
    </div>
    <div className="bi-detail-section">
      <h3>{t("Matching land opportunities")}</h3>
      <p className="bi-muted">{t("Available inventory ranked by area, type, transaction, and budget. Permitted use requires confirmation.")}</p>
      {!matches.length && <div className="bi-empty-small">{t("No available parcels. Discuss flexibility and future inventory.")}</div>}
      {matches.map(m => <div className="bi-match-card" key={m.parcel.parcel_id}>
        <div className="bi-section-title">
          <div>
            <strong>
              {locale === "ar" ? m.parcel.district_ar : m.parcel.district_en}
            </strong>
            <small>{m.parcel.parcel_id}{t(" · ")}{t(m.parcel.area_of_city)}{t(" · ")}{t(m.parcel.listing_type)}</small>
          </div>
          <span className={`bi-badge ${m.good ? "status-available" : "status-reserved"}`}>{t(m.score)}{t("% alignment")}</span>
        </div>
        <div className="bi-match-facts">{t(m.parcel.area_sqm.toLocaleString())}{t(" m² · ")}{t(m.parcel.total_price_sar === null ? "Price on request" : currency(m.parcel.total_price_sar))}{t(m.parcel.listing_type === "lease" ? " / year" : "")}</div>
        <ul>
          {m.reasons.map(r => <li key={r}>
            <Check size={12} />
            {t(r)}
          </li>)}
        </ul>
        {m.tradeoffs.length > 0 && <div className="bi-match-tradeoffs">
          <AlertCircle size={12} />
          {t(m.tradeoffs.join(" · "))}
        </div>}
        <button className="bi-text-link" onClick={() => openParcel(m.parcel.parcel_id)}>{t("Inspect this parcel")}<ArrowUpRight size={14} /></button>
      </div>)}
    </div>
  </>;
}
function ParcelDetail({
  parcel: p
}: {
  parcel: Parcel;
}) {
  const {
    t,
    locale
  } = useLanguage();
  const {
    inquiries,
    analysis,
    openInquiry
  } = useBusiness();
  const matches = inquiries.filter(isOpen).filter(q => analysis.matches.get(q.inquiry_id)?.some(m => m.parcel.parcel_id === p.parcel_id && m.good));
  return <>
    <div className="bi-detail-head">
      <span className="bi-eyebrow">{t("PORTFOLIO RECORD · ")}{p.parcel_id}</span>
      <SheetTitle>
        {locale === "ar" ? p.district_ar : p.district_en}
        <span lang={locale === "ar" ? "en" : "ar"} className="bi-arabic">
          {locale === "ar" ? p.district_en : p.district_ar}
        </span>
      </SheetTitle>
      <SheetDescription>{t(p.area_of_city)}{t(" Riyadh · ")}{t(title(p.land_type))}{t(" land")}</SheetDescription>
      <div className="bi-detail-tags">
        <StatusBadge status={p.status} />
        <span className="bi-badge">{t("For ")}{t(p.listing_type)}</span>
        {p.status === "available" && p.days_on_market >= 90 && <span className="bi-badge status-reserved">{t("90+ days on market")}</span>}
      </div>
    </div>
    <div className="bi-detail-price">
      {t(p.total_price_sar === null ? "Price on request" : currency(p.total_price_sar))}
      <small>
        {t(p.price_basis)}
      </small>
    </div>
    <dl className="bi-detail-grid">
      <Field label="Plot size" value={`${p.area_sqm.toLocaleString()} m²`} />
      <Field label="Street width" value={`${p.street_width_m} meters`} />
      <Field label="Price per m²" value={p.price_per_sqm_sar === null ? "On request" : currency(p.price_per_sqm_sar)} />
      <Field label="Reported days on market" value={`${p.days_on_market} days`} />
      <Field label="Listed date" value={p.listed_date} />
      <Field label="Area / district" value={`${p.area_of_city} / ${p.district_en}`} />
    </dl>
    <div className="bi-location-preview">
      <MapPin size={28} />
      <span>{locale === "ar" ? p.district_ar : p.district_en}{t(", Riyadh")}</span>
      <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer">{t("Open listing coordinates")}<ArrowUpRight size={13} /></a>
    </div>
    <Link href={`/lands/${p.parcel_id}`} className="bi-text-link" target="_blank">{t("View investor-facing opportunity")}<ArrowUpRight size={14} /></Link>
    <div className="bi-detail-section">
      <h3>{t(matches.length)}{t(" open investors may be a fit")}</h3>
      <p className="bi-muted">{t("Matches respect stated preferences and comparable budgets. Missing budgets need follow-up.")}</p>
      {matches.length === 0 && <div className="bi-empty-small">{t("No current preference-and-budget matches. Review demand or revisit the listing proposition.")}</div>}
      {matches.slice(0, 8).map(q => <button key={q.inquiry_id} className="bi-related-record" onClick={() => openInquiry(q.inquiry_id)}>
        <span>
          <strong>
            {q.investor_name}
          </strong>
          <small>{t(q.intent)}{t(" · ")}{t(currency(q.budget_sar))}</small>
        </span>
        <StatusBadge status={q.status} />
        <ArrowRight size={14} />
      </button>)}
    </div>
  </>;
}
