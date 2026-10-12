"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ArrowUpRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useLanguage } from "@/components/shared/language";
import { useBusiness, useDetailSelection } from "./provider";
import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
import { normalizePhone } from "@/lib/investor/inquiry";

type Field = { key: string; label: string; type?: "number" | "date" | "tel"; options?: string[]; nullable?: boolean; min?: number; max?: number; step?: number | "any" };
const areas = ["North", "East", "West", "South", "Central"];
const parcelFields: Field[] = [
  {key:"district_en",label:"District (English)"}, {key:"district_ar",label:"District (Arabic)"},
  {key:"area_of_city",label:"Riyadh area",options:areas}, {key:"land_type",label:"Land type",options:["residential","commercial"]},
  {key:"listing_type",label:"Listing type",options:["sale","lease"]}, {key:"status",label:"Status",options:["available","reserved","sold","leased"]},
  {key:"area_sqm",label:"Plot size (m²)",type:"number",min:0.01}, {key:"street_width_m",label:"Street width (m)",type:"number",min:0},
  {key:"total_price_sar",label:"Total price (SAR)",type:"number",nullable:true,min:0}, {key:"price_per_sqm_sar",label:"Price per m² (SAR)",type:"number",nullable:true,min:0},
  {key:"price_basis",label:"Price basis",options:["asking price","annual rent"]}, {key:"listed_date",label:"Listed date",type:"date"},
  {key:"days_on_market",label:"Days on market",type:"number",min:0,step:1},
  {key:"lat",label:"Latitude",type:"number",min:-90,max:90}, {key:"lng",label:"Longitude",type:"number",min:-180,max:180}
];
const inquiryFields: Field[] = [
  {key:"investor_name",label:"Investor name"}, {key:"phone",label:"Phone number",type:"tel"},
  {key:"wants_to",label:"Investment purpose"}, {key:"intent",label:"Readiness",options:["exploring","comparing options","ready to move"]},
  {key:"land_type_wanted",label:"Land type",options:["any","residential","commercial"]}, {key:"area_of_city_wanted",label:"Riyadh area",options:["Any",...areas]},
  {key:"prefers",label:"Buy or lease",options:["any","sale","lease"]}, {key:"budget_sar",label:"Budget (SAR)",type:"number",nullable:true,min:1,max:2147483647,step:1},
  {key:"status",label:"Status",options:["new","contacted","qualified","negotiating","closed","won","lost"]},
  {key:"channel",label:"Channel"}, {key:"date",label:"Inquiry date",type:"date"}
];

export function RecordActions({ record, kind, create = false }: { record: Parcel | Inquiry; kind: "parcels" | "inquiries"; create?: boolean }) {
  const { t, locale } = useLanguage();
  const { editRecord, removeRecord, addLand, openParcel, openInquiry, parcels } = useBusiness();
  const { closeDetail } = useDetailSelection();
  const [mode, setMode] = useState<"edit" | "delete" | "create" | null>(null);
  const [values, setValues] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const id = "parcel_id" in record ? record.parcel_id : record.inquiry_id;
  const name = "district_en" in record ? (locale === "ar" ? record.district_ar : record.district_en) : record.investor_name;
  const fields: Field[] = create ? [{key:"parcel_id",label:"Parcel ID"}, ...parcelFields] : kind === "parcels" ? parcelFields : inquiryFields;
  function start(next: "edit" | "delete" | "create") {
    setValues(Object.fromEntries(Object.entries(record).map(([key,value]) => [key,value == null ? "" : String(value)])));
    if(next === "create") setValues({ listed_date: new Date().toISOString().slice(0,10), days_on_market: "0" });
    setError(""); setMode(next);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if(lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if(mode === "delete") { await removeRecord(kind,id); closeDetail(); }
      else {
        if(kind === "parcels" && values.price_basis !== (values.listing_type === "lease" ? "annual rent" : "asking price")) {
          throw new Error("Price basis must match sale or annual lease.");
        }
        const patch: Record<string,unknown> = {};
        for(const field of fields) {
          const raw = (values[field.key] ?? "").trim();
          const value = field.nullable && !raw ? null : field.type === "number" ? Number(raw) : raw;
          if(field.type === "number" && value !== null && !Number.isFinite(value)) throw new Error("Enter valid numeric values.");
          if(mode === "create" || value !== record[field.key as keyof typeof record]) patch[field.key] = value;
        }
        if(kind === "inquiries") {
          const budget = values.budget_sar ? Number(values.budget_sar) : null;
          if(budget !== null && !["sale","lease"].includes(values.prefers)) throw new Error("Choose buy or lease before entering a budget.");
          if("phone" in patch) patch.phone = normalizePhone(String(patch.phone));
          if("budget_sar" in patch || "prefers" in patch) patch.budget_basis = budget === null ? null : values.prefers === "lease" ? "annual rent" : "total purchase";
          const selected = values.selected_parcel_id || null;
          if(selected !== (record as Inquiry).selected_parcel_id && (selected !== null || (record as Inquiry).selected_parcel_id)) patch.selected_parcel_id = selected;
        }
        if(mode === "create") await addLand(patch);
        else if(Object.keys(patch).length) await editRecord(kind,id,patch);
      }
      setMode(null);
    } catch(e) { setError(e instanceof Error ? e.message : "Couldn’t complete the request."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <>
    {create ? <Button onClick={() => start("create")} className="bg-green-700 text-white hover:bg-green-800"><Plus size={15}/>{t("Add land")}</Button> : <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="bi-record-actions" aria-label={`${t("Record actions")} · ${id}`} />}><MoreHorizontal size={17}/></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onClick={() => kind === "parcels" ? openParcel(id) : openInquiry(id)}><ArrowUpRight size={14}/>{t("View details")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => start("edit")}><Pencil size={14}/>{t("Edit")}</DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem className="text-red-600" onClick={() => start("delete")}><Trash2 size={14}/>{t("Delete")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>}
    <Dialog open={mode !== null} onOpenChange={open => { if(!busy && !open) setMode(null); }}>
      <DialogContent className={`bi-record-dialog ${mode !== "delete" ? "bi-record-editor" : ""}`}>
        <div><DialogTitle>{t(mode === "create" ? "Add land" : mode === "delete" ? kind === "parcels" ? "Delete this parcel?" : "Delete this inquiry?" : kind === "parcels" ? "Edit parcel" : "Edit inquiry")}</DialogTitle>
        <DialogDescription className="mt-2">{mode === "create" ? t("Enter the new land details.") : <>{name} · <bdi>{id}</bdi></>}{mode === "delete" && <span className="block mt-3">{t("This permanently deletes the record. This action cannot be undone.")}</span>}</DialogDescription></div>
        <form onSubmit={submit}>
          {mode !== "delete" && <fieldset disabled={busy} className="bi-edit-fields">
            {fields.map(field => <label key={field.key}><span>{t(field.label)}</span>{field.options ? <Select required name={field.key} value={values[field.key] ?? ""} onValueChange={value => setValues(prev => ({...prev,[field.key]:value ?? "", ...(field.key === "listing_type" ? {price_basis: value === "lease" ? "annual rent" : "asking price"} : {})}))}>
              <SelectTrigger className="w-full" aria-label={t(field.label)}><SelectValue>{t(values[field.key] || field.label)}</SelectValue></SelectTrigger>
              <SelectContent>{Array.from(new Set([...field.options, values[field.key]])).filter(Boolean).map(option => <SelectItem key={option} value={option}>{t(option)}</SelectItem>)}</SelectContent>
            </Select> : <Input name={field.key} value={values[field.key] ?? ""} onChange={e => setValues(prev => ({...prev,[field.key]:e.target.value}))} type={field.type ?? "text"} required={!field.nullable} min={field.min} max={field.max} step={field.type === "number" ? field.step ?? "any" : undefined} dir={field.key === "district_en" || field.type === "tel" ? "ltr" : field.key === "district_ar" ? "rtl" : undefined} />}</label>)}
            {kind === "inquiries" && <label className="bi-edit-wide"><span>{t("Selected opportunity (optional)")}</span><Select value={values.selected_parcel_id ?? ""} onValueChange={value => setValues(prev=>({...prev,selected_parcel_id:value ?? ""}))}><SelectTrigger className="w-full"><SelectValue>{values.selected_parcel_id || t("None")}</SelectValue></SelectTrigger><SelectContent><SelectItem value="">{t("None")}</SelectItem>{parcels.map(p=><SelectItem key={p.parcel_id} value={p.parcel_id}>{locale === "ar" ? p.district_ar : p.district_en} · {p.parcel_id}</SelectItem>)}</SelectContent></Select></label>}
          </fieldset>}
          {error && <p role="alert" className="bi-error mt-4">{t(error)}</p>}
          <div className="bi-edit-footer"><Button type="button" variant="outline" disabled={busy} onClick={()=>setMode(null)}>{t("Cancel")}</Button><Button type="submit" disabled={busy} className={mode === "delete" ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-700 text-white hover:bg-green-800"}>{busy && <Loader2 size={14} className="animate-spin"/>}{t(busy ? "Saving…" : mode === "delete" ? "Delete permanently" : mode === "create" ? "Create parcel" : "Save changes")}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}

export function AddLandButton() {
  const record: Parcel = { parcel_id: "", district_en: "", district_ar: "", area_of_city: "", land_type: "", listing_type: "", price_basis: "", area_sqm: 0, street_width_m: 0, total_price_sar: null, price_per_sqm_sar: null, status: "", listed_date: "", days_on_market: 0, lat: 0, lng: 0 };
  return <RecordActions kind="parcels" record={record} create />;
}
