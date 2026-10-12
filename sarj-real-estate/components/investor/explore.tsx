"use client";

import { useLanguage } from "@/components/shared/language";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, Sparkles, X, MapPin } from "lucide-react";
import { type InvestorParcel } from "@/lib/investor/parcels";
import { ParcelCard } from "./parcel-card";
import { usePortfolio } from "./portfolio";
import { Button } from "@/components/ui/button";
type Filters = {
  search: string;
  area: string;
  district: string;
  type: string;
  listing: string;
  budget: string;
  size: string;
  availability: string;
};
const defaults: Filters = {
  search: "",
  area: "",
  district: "",
  type: "",
  listing: "",
  budget: "",
  size: "",
  availability: "available"
};
export function ExploreLands() {
  const {
    t, locale
  } = useLanguage();
  const {
    parcels,
    portfolioMetrics,
    loading,
    error
  } = usePortfolio();
  const [filters, setFilters] = useState<Filters>(defaults);
  const [sort, setSort] = useState("featured");
  const [pending, startTransition] = useTransition();
  function update(key: keyof Filters, value: string) {
    startTransition(() => setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === "area" ? {
        district: ""
      } : {})
    })));
  }
  const results = useMemo(() => {
    const filtered = parcels.filter(p => (!filters.search || `${p.id} ${p.district} ${p.districtAr} ${p.area} ${p.type} ${p.highlight}`.toLowerCase().includes(filters.search.toLowerCase())) && (!filters.area || p.area === filters.area) && (!filters.district || p.district === filters.district) && (!filters.type || p.type === filters.type) && (!filters.listing || p.listing === filters.listing) && (!filters.budget || p.price !== null && p.price <= Number(filters.budget)) && (!filters.size || (filters.size === "small" ? p.size < 1000 : filters.size === "medium" ? p.size >= 1000 && p.size <= 2000 : p.size > 2000)) && (filters.availability === "all" || (filters.availability === "available" ? p.available : p.status === filters.availability)));
    return [...filtered].sort((a, b) => sort === "price-asc" ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === "price-desc" ? (b.price ?? -Infinity) - (a.price ?? -Infinity) : sort === "size" ? b.size - a.size : 0);
  }, [filters, sort, parcels]);
  const chips = (Object.entries(filters) as [keyof Filters, string][]).filter(([key, value]) => value && key !== "availability" && key !== "search");
  function chipLabel(key: keyof Filters, value: string) {
    return key === "budget" ? `Under SAR ${(Number(value) / 1000000).toLocaleString()}M${filters.listing === "Lease" ? " / year" : ""}` : key === "size" ? {
      small: "Under 1,000 m²",
      medium: "1,000–2,000 m²",
      large: "Over 2,000 m²"
    }[value] ?? value : key === "area" ? `${value} Riyadh` : key === "listing" ? `For ${value.toLowerCase()}` : value;
  }
  function options(key: keyof Filters, values: string[]) {
    return <div className="filter-options">
      {values.map(value => <button key={value} className={filters[key] === value ? "selected" : ""} onClick={() => update(key, filters[key] === value ? "" : value)} aria-pressed={filters[key] === value}>
        {t(value)}
      </button>)}
    </div>;
  }
  return <div className="site-width">
    <div className="page-intro">
      <div className="breadcrumb">
        <Link href="/">{t("Home")}</Link>
        <ArrowRight size={11} />
        <span>{t("Explore lands")}</span>
      </div>
      <span className="eyebrow">{t("A PLACE FOR EVERY AMBITION")}</span>
      <h1>{t("Find your next ")}<em>{t("opportunity.")}</em></h1>
      <p>{t("Discover Riyadh’s possibilities, one thoughtfully chosen parcel at a time.")}</p>
    </div>
    <div className="explore-layout">
      <aside className="filter-panel" aria-label={t("Filter land opportunities")}>
        <div className="filter-heading">
          <span className="flex items-center gap-2"><SlidersHorizontal size={14} />{t("Refine your search")}</span>
          <button onClick={() => setFilters(defaults)}>{t("Reset all")}</button>
        </div>
        <div className="filter-fields">
          <label className="filter-field">
            <span>{t("Area of Riyadh")}</span>
            <select value={filters.area} onChange={e => update("area", e.target.value)}>
              <option value="">{t("All areas")}</option>
              {["North", "East", "West", "South", "Central"].map(area => <option key={area} value={area}>{t(area)}{t(" Riyadh")}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>{t("District")}</span>
            <select value={filters.district} onChange={e => update("district", e.target.value)}>
              <option value="">{t("All districts")}</option>
              {Array.from(new Set(parcels.filter(p => !filters.area || p.area === filters.area).map(p => p.district))).sort().map(district => <option key={district} value={district}>
                {locale === "ar" ? parcels.find(p=>p.district===district)?.districtAr ?? district : district}
              </option>)}
            </select>
          </label>
          <div className="filter-field">
            <span>{t("Land type")}</span>
            {t(options("type", ["Residential", "Commercial"]))}
          </div>
          <div className="filter-field">
            <span>{t("Looking to")}</span>
            {t(options("listing", ["Sale", "Lease"]))}
          </div>
          <label className="filter-field">
            <span>
              {t(filters.listing === "Lease" ? "Annual lease budget" : "Maximum budget")}
            </span>
            <select value={filters.budget} onChange={e => update("budget", e.target.value)}>
              <option value="">{t("Any budget")}</option>
              {[500000, 1000000, 3000000, 5000000, 10000000, 20000000].map(value => <option key={value} value={value}>{t("SAR ")}{t((value / 1000000).toLocaleString())}{t("M")}</option>)}
            </select>
            {!filters.listing && <p className="filter-hint">{t("Sale: total price · Lease: annual price")}</p>}
          </label>
          <label className="filter-field">
            <span>{t("Plot size")}</span>
            <select value={filters.size} onChange={e => update("size", e.target.value)}>
              <option value="">{t("Any size")}</option>
              <option value="small">{t("Under 1,000 m²")}</option>
              <option value="medium">{t("1,000–2,000 m²")}</option>
              <option value="large">{t("Over 2,000 m²")}</option>
            </select>
          </label>
          <label className="filter-field">
            <span>{t("Availability")}</span>
            <select value={filters.availability} onChange={e => update("availability", e.target.value)}>
              <option value="available">{t("Available now")}</option>
              <option value="all">{t("All opportunities")}</option>
              <option value="reserved">{t("Reserved")}</option>
              <option value="sold">{t("Sold")}</option>
              <option value="leased">{t("Leased")}</option>
            </select>
          </label>
        </div>
        <div className="portfolio-note"><Sparkles size={15} className="mb-2" />{t("Not sure where to begin?")}<br /><Link href="/match" className="underline underline-offset-4">{t("Let’s find your match →")}</Link></div>
      </aside>
      <div>
        <div className="search-input">
          <Search size={17} />
          <input aria-label={t("Search by district, parcel ID, or area")} placeholder={t("Search by district, parcel ID, or area…")} value={filters.search} onChange={e => update("search", e.target.value)} />
          {filters.search && <button aria-label={t("Clear search")} onClick={() => update("search", "")}>
            <X size={15} />
          </button>}
        </div>
        <AnimatePresence>
          <div className="active-filters">
            {chips.map(([key, value]) => <motion.button layout initial={{
              opacity: 0,
              scale: .9
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: .9
            }} key={key} className="filter-chip" onClick={() => update(key, "")} aria-label={`Remove ${chipLabel(key, value)} filter`}>
              {t(chipLabel(key, value))}
              <X size={10} />
            </motion.button>)}
          </div>
        </AnimatePresence>
        <div className="results-toolbar">
          <span aria-live="polite"><strong>{t(results.length)}{t(" opportunities")}</strong>{t(" match your preferences")}</span>
          <label>
            <span className="sr-only">{t("Sort opportunities")}</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">{t("Featured first")}</option>
              <option value="price-asc">{t("Price: low to high")}</option>
              <option value="price-desc">{t("Price: high to low")}</option>
              <option value="size">{t("Largest plots")}</option>
            </select>
          </label>
        </div>
        {pending ? <div className="parcel-grid explore-grid" aria-label={t("Updating opportunities")}>
          {[0, 1, 2, 3].map(i => <div className="skeleton" key={i} />)}
        </div> : results.length ? <div className="parcel-grid explore-grid">
          {results.map((parcel: InvestorParcel) => <motion.div key={parcel.id} initial={{
            opacity: 0,
            y: 7
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: .25
          }}>
            <ParcelCard parcel={parcel} />
          </motion.div>)}
        </div> : loading ? <div className="parcel-grid" role="status" aria-label={t("Loading land opportunities")}>{[0, 1, 2].map(i => <div key={i} className="skeleton" />)}</div> : error ? null : <div className="empty-state">
          <MapPin size={30} />
          <h3>{t("A small shift. New possibilities.")}</h3>
          <p>{t("No opportunities match all your filters.")}<br />{t("Try broadening your budget, area, or land type.")}</p>
          <Button onClick={() => setFilters(defaults)} className="cta cta-green">{t("Reset filters")}<ArrowRight size={15} /></Button>
        </div>}
        <p className="portfolio-note">{t(portfolioMetrics.parcels)}{t(" parcels across ")}{t(portfolioMetrics.districts)}{t(" districts, with ")}{t(portfolioMetrics.onMarket)}{t(" currently on the market. Lease prices are annual. Images are illustrative.")}</p>
      </div>
    </div>
  </div>;
}
