"use client";

import { useLanguage } from "@/components/shared/language";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Search, SlidersHorizontal, X, LayoutGrid, List, ArrowLeft, ArrowRight, Users, Map as MapIcon, Clock3 } from "lucide-react";
import { useBusiness, DataBoundary } from "./provider";
import { PageHeading } from "./dashboard";
import { StatusBadge } from "./details";
import { AddLandButton, RecordActions } from "./record-actions";
import { areas, currency, lower, title, transaction, isOpen, isPriority } from "../lib/analytics";
export function useRecordFilters() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  function update(key: string, value: string) {
    const next = new URLSearchParams(search.toString());
    if (value) next.set(key, value);else next.delete(key);
    if (key !== "page") next.delete("page");
    if (key === "area") next.delete("district");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false
    });
  }
  function reset() {
    router.replace(pathname, {
      scroll: false
    });
  }
  return {
    search,
    update,
    reset
  };
}
type FilterDef = {
  key: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
};
function RecordSelect({ label, options, value, onChange }: {
  label: string; options: FilterDef["options"]; value: string; onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const selectedLabel = options.find(option => option.value === value)?.label ?? label;
  return <div className="bi-filter-control"><Select value={value} onValueChange={value => onChange(value ?? "")}>
    <SelectTrigger className="bi-record-select" aria-label={t(label)}><SelectValue>{t(selectedLabel)}</SelectValue></SelectTrigger>
    <SelectContent align="start" alignItemWithTrigger={false}>
      <SelectItem value="">{t(label)}</SelectItem>
      {options.map(option => <SelectItem key={option.value} value={option.value}>{t(option.label)}</SelectItem>)}
    </SelectContent>
  </Select></div>;
}
export function Filters({
  definitions,
  placeholder,
  primaryKeys = ["status", "area"]
}: {
  definitions: FilterDef[];
  placeholder: string;
  primaryKeys?: string[];
}) {
  const {
    t
  } = useLanguage();
  const {
    search,
    update,
    reset
  } = useRecordFilters();
  const [expanded, setExpanded] = useState(false);
  const primary = definitions.filter(d => primaryKeys.includes(d.key));
  const secondary = definitions.filter(d => !primaryKeys.includes(d.key));
  const extraCount = secondary.filter(d => search.get(d.key)).length;
  const keys = Array.from(new Set([...definitions.map(d => d.key), "priority", "unmatched", "stale", "highDemand", "open"]));
  const active = keys.filter(k => search.get(k));
  const renderFilter = (d: FilterDef) => <RecordSelect key={d.key} label={d.label} options={d.options} value={search.get(d.key) ?? ""} onChange={value => update(d.key, value)} />;
  return <div className="bi-filter-panel">
    <div className="bi-filter-row">
      <div className="bi-search">
        <Search size={16} />
        <Input aria-label={placeholder} placeholder={placeholder} value={search.get("search") ?? ""} onChange={e => update("search", e.target.value)} />
        {search.get("search") && <Button variant="ghost" size="icon-sm" aria-label={t("Clear search")} onClick={() => update("search", "")}><X size={13} /></Button>}
      </div>
      {primary.map(renderFilter)}
      <Button variant={expanded ? "secondary" : "outline"} className="bi-more-filters" aria-expanded={expanded} aria-controls="record-extra-filters" onClick={() => setExpanded(value => !value)}>
        <SlidersHorizontal size={15} />{t("More filters")}{extraCount > 0 && <span>{extraCount}</span>}
      </Button>
    </div>
    {expanded && <div className="bi-extra-filters" id="record-extra-filters">{secondary.map(renderFilter)}</div>}
    <AnimatePresence>
      {active.length > 0 && <div className="bi-filter-chips">
        {active.map(key => <motion.button key={key} initial={{
          opacity: 0,
          scale: .9
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: .9
        }} onClick={() => update(key, "")} className="bi-filter-chip" aria-label={`Remove ${key} filter`}>
          {t(["priority", "unmatched", "stale", "highDemand", "open"].includes(key) ? {
            priority: "Priority investors",
            unmatched: "No good parcel match",
            stale: "90+ days on market",
            highDemand: "Matching open demand",
            open: "Open inquiries"
          }[key] : title(search.get(key) ?? ""))}
          <X size={11} />
        </motion.button>)}
        <button className="bi-clear" onClick={reset}>{t("Clear all")}</button>
      </div>}
    </AnimatePresence>
  </div>;
}
const options = (values: string[]) => values.map(v => ({
  value: v,
  label: title(v)
}));
function Pagination({
  total
}: {
  total: number;
}) {
  const {
    t
  } = useLanguage();
  const {
    search,
    update
  } = useRecordFilters();
  const pages = Math.max(1, Math.ceil(total / 12));
  const page = Math.max(1, Math.min(Number(search.get("page")) || 1, pages));
  return <div className="bi-pagination">
    <span>
      {t(total ? `${(page - 1) * 12 + 1}–${Math.min(page * 12, total)} of ${total}` : "0 results")}
    </span>
    <div>
      <button aria-label={t("Previous results page")} disabled={page <= 1} onClick={() => update("page", String(page - 1))}>
        <ArrowLeft size={14} />
      </button>
      <span>{t("Page ")}{t(page)}{t(" of ")}{t(pages)}</span>
      <button aria-label={t("Next results page")} disabled={page >= pages} onClick={() => update("page", String(page + 1))}>
        <ArrowRight size={14} />
      </button>
    </div>
  </div>;
}
function EmptyRecords({
  kind
}: {
  kind: string;
}) {
  const {
    t
  } = useLanguage();
  const {
    reset
  } = useRecordFilters();
  return <div className="bi-empty">
    <SlidersHorizontal size={28} />
    <h2>{t("A broader view may reveal more.")}</h2>
    <p>{t("No ")}{t(kind)}{t(" match these filters. Try another area or a wider preference.")}</p>
    <button className="bi-button bi-button-outline" onClick={reset}>{t("Reset filters")}</button>
  </div>;
}
export function InquiriesPage() {
  const {
    t
  } = useLanguage();
  const {
    inquiries,
    analysis,
    openInquiry
  } = useBusiness();
  const {
    search,
    update
  } = useRecordFilters();
  const s = lower(search.get("search"));
  const results = useMemo(() => inquiries.filter(q => (!s || lower(`${q.investor_name} ${q.phone} ${q.inquiry_id} ${q.wants_to}`).includes(s)) && (!search.get("status") || lower(q.status) === search.get("status")) && (!search.get("area") || lower(q.area_of_city_wanted) === lower(search.get("area"))) && (!search.get("type") || lower(q.land_type_wanted) === search.get("type")) && (!search.get("listing") || transaction(q.prefers) === search.get("listing")) && (!search.get("intent") || q.intent === search.get("intent")) && (!search.get("open") || isOpen(q)) && (!search.get("priority") || isPriority(q)) && (!search.get("unmatched") || analysis.noMatch.some(i => i.inquiry_id === q.inquiry_id))).sort((a, b) => search.get("sort") === "oldest" ? a.date.localeCompare(b.date) : search.get("sort") === "budget" ? (b.budget_sar ?? -Infinity) - (a.budget_sar ?? -Infinity) : b.date.localeCompare(a.date)), [inquiries, analysis.noMatch, s, search]);
  const page = Math.max(1, Math.min(Number(search.get("page")) || 1, Math.ceil(results.length / 12) || 1));
  const rows = results.slice((page - 1) * 12, page * 12);
  const definitions: FilterDef[] = [{
    key: "status",
    label: "All statuses",
    options: options(Array.from(new Set(inquiries.map(q => lower(q.status)))))
  }, {
    key: "intent",
    label: "All intents",
    options: Array.from(new Set(inquiries.map(q => q.intent))).map(value => ({
      value,
      label: title(value)
    }))
  }, {
    key: "area",
    label: "All areas",
    options: options(areas)
  }, {
    key: "type",
    label: "All land types",
    options: options(["residential", "commercial", "any"])
  }, {
    key: "listing",
    label: "Buy or lease",
    options: [{
      value: "sale",
      label: "Buy"
    }, {
      value: "lease",
      label: "Lease"
    }]
  }];
  return <>
    <PageHeading eyebrow="THE PEOPLE BEHIND THE DEMAND" title="Investor inquiries" description="Understand investor ambitions, find the fit, and move the conversation forward." />
    <DataBoundary>
      <div className="bi-mini-stats">
        <button className={search.get("open") ? "selected" : ""} onClick={() => update("open", search.get("open") ? "" : "1")}><Users size={16} /><strong>
            {t(analysis.open.length)}
          </strong>{t("open conversations")}</button>
        <button className={search.get("priority") ? "selected" : ""} onClick={() => update("priority", search.get("priority") ? "" : "1")}><span className="bi-live-dot" /><strong>
            {t(analysis.priority.length)}
          </strong>{t("priority investors")}</button>
        <button className={search.get("unmatched") ? "selected" : ""} onClick={() => update("unmatched", search.get("unmatched") ? "" : "1")}><SlidersHorizontal size={15} /><strong>
            {t(analysis.noMatch.length)}
          </strong>{t("without a good fit")}</button>
      </div>
      <Filters definitions={definitions} placeholder={t("Search investors, phone, intent, or inquiry ID…")} />
      <div className="bi-result-toolbar">
        <span aria-live="polite"><strong>
            {t(results.length)}
          </strong>{t(" investor inquiries match this view")}</span>
        <RecordSelect label="Sort inquiries" value={search.get("sort") ?? "newest"} onChange={value => update("sort", value)} options={[
          {value:"newest",label:"Newest first"}, {value:"oldest",label:"Oldest first"}, {value:"budget",label:"Budget: high to low"}
        ]} />
      </div>
      <div className="bi-table-panel">
        <div className="bi-table-scroll">
          <Table className="bi-table bi-inquiry-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("Investor / inquiry")}</TableHead>
                <TableHead>{t("Date / intent")}</TableHead>
                <TableHead>{t("Land / area")}</TableHead>
                <TableHead>{t("Preference")}</TableHead>
                <TableHead>{t("Budget")}</TableHead>
                <TableHead>{t("Channel")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>
                  <span className="sr-only">{t("Inspect inquiry")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(q => <TableRow key={q.inquiry_id}>
                <TableCell>
                  <button className="bi-cell-link" onClick={() => openInquiry(q.inquiry_id)}>
                    {q.investor_name}
                    <small>
                      {q.inquiry_id}
                    </small>
                  </button>
                </TableCell>
                <TableCell>
                  {q.date}
                  <small>
                    {t(title(q.intent))}
                  </small>

                </TableCell>
                <TableCell>
                  {t(title(q.land_type_wanted))}
                  <small>{t(q.area_of_city_wanted)}{t(" Riyadh")}</small>
                </TableCell>
                <TableCell>
                  {t(transaction(q.prefers) === "sale" ? "Buy" : title(q.prefers))}
                </TableCell>
                <TableCell className="bi-budget-cell">
                  {t(q.budget_sar === null ? "Not provided" : currency(q.budget_sar))}
                  <small>
                    {t(q.budget_basis ?? "Confirm budget basis")}
                  </small>
                </TableCell>
                <TableCell>
                  {t(title(q.channel))}
                </TableCell>
                <TableCell>
                  <StatusBadge status={q.status} />
                </TableCell>
                <TableCell>
                  <RecordActions kind="inquiries" record={q} />
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </div>
        {!rows.length && <EmptyRecords kind="inquiries" />}
        <Pagination total={results.length} />
      </div>
    </DataBoundary>
  </>;
}
export function ParcelsPage() {
  const {
    t,
    locale
  } = useLanguage();
  const {
    parcels,
    analysis,
    openParcel
  } = useBusiness();
  const {
    search,
    update
  } = useRecordFilters();
  const [view, setView] = useState("table");
  const s = lower(search.get("search"));
  const demand = useMemo(() => {
    const counts = new Map(parcels.map(p => [p.parcel_id, 0]));
    analysis.matches.forEach(matches => matches.filter(m => m.good).forEach(m => counts.set(m.parcel.parcel_id, (counts.get(m.parcel.parcel_id) ?? 0) + 1)));
    return counts;
  }, [parcels, analysis]);
  const rowsAll = useMemo(() => parcels.filter(p => (!s || lower(`${p.parcel_id} ${p.district_en} ${p.district_ar} ${p.area_of_city}`).includes(s)) && (!search.get("status") || lower(p.status) === search.get("status")) && (!search.get("type") || lower(p.land_type) === search.get("type")) && (!search.get("listing") || lower(p.listing_type) === search.get("listing")) && (!search.get("area") || lower(p.area_of_city) === lower(search.get("area"))) && (!search.get("district") || p.district_en === search.get("district")) && (!search.get("budget") || p.total_price_sar !== null && p.total_price_sar <= Number(search.get("budget"))) && (!search.get("stale") || p.status === "available" && p.days_on_market >= 90) && (!search.get("highDemand") || (demand.get(p.parcel_id) ?? 0) > 0)).sort((a, b) => search.get("sort") === "price" ? (a.total_price_sar ?? Infinity) - (b.total_price_sar ?? Infinity) : search.get("sort") === "demand" ? (demand.get(b.parcel_id) ?? 0) - (demand.get(a.parcel_id) ?? 0) : b.days_on_market - a.days_on_market), [parcels, search, s, demand]);
  const page = Math.max(1, Math.min(Number(search.get("page")) || 1, Math.ceil(rowsAll.length / 12) || 1));
  const rows = rowsAll.slice((page - 1) * 12, page * 12);
  const stale = parcels.filter(p => p.status === "available" && p.days_on_market >= 90).length;
  const definitions: FilterDef[] = [{
    key: "status",
    label: "All statuses",
    options: options(Array.from(new Set(parcels.map(p => lower(p.status)))))
  }, {
    key: "type",
    label: "All land types",
    options: options(["residential", "commercial"])
  }, {
    key: "listing",
    label: "Sale or lease",
    options: options(["sale", "lease"])
  }, {
    key: "area",
    label: "All areas",
    options: options(areas)
  }, {
    key: "district",
    label: "All districts",
    options: Array.from(new Set(parcels.filter(p => !search.get("area") || p.area_of_city === search.get("area")).map(p => p.district_en))).sort().map(value => ({
      value,
      label: locale === "ar" ? parcels.find(p=>p.district_en===value)?.district_ar ?? value : value
    }))
  }, {
    key: "budget",
    label: "Maximum price",
    options: [500000, 1000000, 5000000, 10000000, 20000000].map(value => ({
      value: String(value),
      label: currency(value)
    }))
  }];
  return <>
    <PageHeading eyebrow="A PORTFOLIO WITH PERSPECTIVE" title="Land portfolio" description="Find stale inventory, identify investor demand, and give every opportunity a clear next step." action={<AddLandButton />} />
    <DataBoundary>
      <div className="bi-mini-stats">
        <button onClick={() => update("status", search.get("status") === "available" ? "" : "available")} className={search.get("status") === "available" ? "selected" : ""}><MapIcon size={16} /><strong>
            {t(parcels.filter(p => p.status === "available").length)}
          </strong>{t("available parcels")}</button>
        <button onClick={() => update("stale", search.get("stale") ? "" : "1")} className={search.get("stale") ? "selected" : ""}><Clock3 size={15} /><strong>
            {t(stale)}
          </strong>{t("at 90+ days")}</button>
        <button onClick={() => update("highDemand", search.get("highDemand") ? "" : "1")} className={search.get("highDemand") ? "selected" : ""}><Users size={16} /><strong>
            {t(parcels.filter(p => (demand.get(p.parcel_id) ?? 0) > 0).length)}
          </strong>{t("with matching open demand")}</button>
      </div>
      <Filters definitions={definitions} placeholder={t("Search by district, area, or parcel ID…")} />
      <div className="bi-result-toolbar">
        <span aria-live="polite"><strong>
            {t(rowsAll.length)}
          </strong>{t(" parcels match this view")}</span>
        <div className="bi-toolbar-controls">
          <RecordSelect label="Sort parcels" value={search.get("sort") ?? "days"} onChange={value => update("sort", value)} options={[
            {value:"days",label:"Longest on market"}, {value:"price",label:"Price: low to high"}, {value:"demand",label:"Most investor matches"}
          ]} />
          <div className="bi-toggle">
            <button onClick={() => setView("table")} className={view === "table" ? "selected" : ""} aria-pressed={view === "table"} aria-label={t("Table view")}>
              <List size={15} />
            </button>
            <button onClick={() => setView("cards")} className={view === "cards" ? "selected" : ""} aria-pressed={view === "cards"} aria-label={t("Card view")}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>
      {view === "table" ? <div className="bi-table-panel">
        <div className="bi-table-scroll">
          <Table className="bi-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("Parcel / district")}</TableHead>
                <TableHead>{t("Land / transaction")}</TableHead>
                <TableHead>{t("Size")}</TableHead>
                <TableHead>{t("Price")}</TableHead>
                <TableHead>{t("Days on market")}</TableHead>
                <TableHead>{t("Investor fit")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>
                  <span className="sr-only">{t("Inspect parcel")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(p => <TableRow key={p.parcel_id} className={p.status === "available" && p.days_on_market >= 90 ? "bi-stale-row" : ""}>
                <TableCell>
                  <button className="bi-cell-link" onClick={() => openParcel(p.parcel_id)}>
                    {locale === "ar" ? p.district_ar : p.district_en}
                    <small>{p.parcel_id}{t(" · ")}{t(p.area_of_city)}{t(" Riyadh")}</small>
                  </button>
                </TableCell>
                <TableCell>
                  {t(title(p.land_type))}
                  <small>{t("For ")}{t(p.listing_type)}</small>
                </TableCell>
                <TableCell>{t(p.area_sqm.toLocaleString())}{t(" m²")}</TableCell>
                <TableCell>
                  {t(p.total_price_sar === null ? "On request" : currency(p.total_price_sar))}
                  <small>
                    {t(p.listing_type === "lease" ? "Annual rent" : "Total asking price")}
                  </small>
                </TableCell>
                <TableCell>
                  <span className={p.days_on_market >= 90 && p.status === "available" ? "bi-stale-days" : ""}>{t(p.days_on_market)}{t(" days")}</span>
                  {p.days_on_market >= 90 && p.status === "available" && <small>{t("Review opportunity")}</small>}
                </TableCell>
                <TableCell>
                  {demand.get(p.parcel_id) ? <span className="bi-fit-count">{t(demand.get(p.parcel_id))}{t(" potential investors")}</span> : <span className="bi-muted">{t("—")}</span>}
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell>
                  <RecordActions kind="parcels" record={p} />
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </div>
        {!rows.length && <EmptyRecords kind="parcels" />}
        <Pagination total={rowsAll.length} />
      </div> : <>
        <div className="bi-parcel-card-grid">
          {rows.map(p => <div key={p.parcel_id} className="bi-parcel-card-frame"><button className="bi-parcel-card" onClick={() => openParcel(p.parcel_id)}>
            <div className="bi-parcel-illustration" style={{
              backgroundImage: `url(/images/${p.land_type === "commercial" ? "commercial" : "residential"}.webp)`
            }}>
              <StatusBadge status={p.status} />
              <span>{t("ILLUSTRATIVE VIEW")}</span>
            </div>
            <div>
              <small>{p.parcel_id}{t(" · ")}{t(p.area_of_city)}{t(" Riyadh")}</small>
              <h3>
                {locale === "ar" ? p.district_ar : p.district_en}
                <ArrowUpRight size={18} />
              </h3>
              <p>{t(title(p.land_type))}{t(" · For ")}{t(p.listing_type)}{t(" · ")}{t(p.area_sqm.toLocaleString())}{t(" m²")}</p>
              <strong>
                {t(p.total_price_sar === null ? "Price on request" : currency(p.total_price_sar))}
                {p.listing_type === "lease" && <small>{t(" / year")}</small>}
              </strong>
              <footer>{t(p.days_on_market)}{t(" days on market")}<span>{t(demand.get(p.parcel_id) ?? 0)}{t(" investor fits")}</span></footer>
            </div>
          </button><RecordActions kind="parcels" record={p} /></div>)}
        </div>
        {!rows.length && <EmptyRecords kind="parcels" />}
        <Pagination total={rowsAll.length} />
      </>}
      <div className="bi-method-note">{t("Stale inventory = available for 90+ reported days. Investor fits check open inquiries, stated preferences, and comparable budgets. Missing prices require confirmation.")}</div>
    </DataBoundary>
  </>;
}
