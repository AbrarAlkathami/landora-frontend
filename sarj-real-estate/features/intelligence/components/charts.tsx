"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useBusiness } from "./provider";
import { lower, title, statuses } from "../lib/analytics";
export function AreaChart() {
  const {
    t
  } = useLanguage();
  const {
    analysis
  } = useBusiness();
  const [mode, setMode] = useState("both");
  const max = Math.max(1, ...analysis.areaDemand.flatMap(a => [a.demand, a.supply]));
  return <div className="bi-panel">
    <div className="bi-panel-head">
      <div>
        <span className="bi-eyebrow">{t("THE GEOGRAPHY OF OPPORTUNITY")}</span>
        <h2>{t("Demand and available inventory")}</h2>
      </div>
      <div className="bi-toggle" aria-label={t("Chart series")}>
        {["both", "demand", "supply"].map(v => <button aria-pressed={mode === v} className={mode === v ? "selected" : ""} key={v} onClick={() => setMode(v)}>
          {t(v === "both" ? "Compare" : title(v))}
        </button>)}
      </div>
    </div>
    <div className="bi-chart-legend">
      <span><i className="bi-color-demand" />{t("Open inquiries")}</span>
      <span><i className="bi-color-supply" />{t("Available parcels")}</span>
    </div>
    <div className="bi-area-chart">
      {analysis.areaDemand.map(a => <Link href={`/admin/demand?area=${a.label}`} className="bi-area-row" key={a.label} aria-label={`${a.label} Riyadh: ${a.demand} open inquiries, ${a.supply} available parcels. Inspect demand.`}>
        <span>
          {t(a.label)}
          <small>{t("Riyadh")}</small>
        </span>
        <div>
          {mode !== "supply" && <div className="bi-bar-track">
            <div className="bi-bar bi-color-demand" style={{
              width: `${a.demand / max * 100}%`
            }} />
            <strong>
              {t(a.demand)}
            </strong>
          </div>}
          {mode !== "demand" && <div className="bi-bar-track">
            <div className="bi-bar bi-color-supply" style={{
              width: `${a.supply / max * 100}%`
            }} />
            <strong>
              {t(a.supply)}
            </strong>
          </div>}
        </div>
        <ArrowUpRight size={13} />
      </Link>)}
    </div>
    <div className="bi-panel-footer">
      <span>{t("Click an area to inspect its demand and supply.")}</span>
      <Link href="/admin/demand">{t("Understand the gaps")}<ArrowUpRight size={13} /></Link>
    </div>
  </div>;
}
export function PortfolioChart() {
  const {
    t
  } = useLanguage();
  const {
    parcels
  } = useBusiness();
  const [view, setView] = useState("type");
  const labels = view === "type" ? ["residential", "commercial"] : ["sale", "lease"];
  const counts = labels.map(l => parcels.filter(p => lower(view === "type" ? p.land_type : p.listing_type) === l).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const ratio = total ? counts[0] / total * 100 : 0;
  return <div className="bi-panel">
    <div className="bi-panel-head">
      <div>
        <span className="bi-eyebrow">{t("PORTFOLIO COMPOSITION")}</span>
        <h2>{t("Portfolio composition")}</h2>
      </div>
      <div className="bi-toggle">
        <button aria-pressed={view === "type"} className={view === "type" ? "selected" : ""} onClick={() => setView("type")}>{t("Type")}</button>
        <button aria-pressed={view === "listing"} className={view === "listing" ? "selected" : ""} onClick={() => setView("listing")}>{t("Transaction")}</button>
      </div>
    </div>
    <div className="bi-donut-wrap">
      <div className="bi-donut" role="img" aria-label={`${labels[0]} ${counts[0]}, ${labels[1]} ${counts[1]}`} style={{
        background: total ? `conic-gradient(#16a34a 0 ${ratio}%, #bbf7d0 ${ratio}% 100%)` : "#f4f4f5"
      }}>
        <div>
          <strong>
            {t(total)}
          </strong>
          <span>{t("LAND PARCELS")}</span>
        </div>
      </div>
      <div className="bi-donut-legend">
        {labels.map((l, i) => <Link href={`/admin/parcels?${view}=${l}`} key={l}>
          <span>
            <i style={{
              background: i === 0 ? "#16a34a" : "#bbf7d0"
            }} />
            {t(title(l))}
          </span>
          <strong>
            {t(counts[i])}
            <small>{t(total ? Math.round(counts[i] / total * 100) : 0)}{t("%")}</small>
          </strong>
        </Link>)}
      </div>
    </div>
    <div className="bi-composition-summary">
      {t(view === "type" ? `${parcels.filter(p => p.listing_type === "sale").length} for sale · ${parcels.filter(p => p.listing_type === "lease").length} for lease` : `${parcels.filter(p => p.land_type === "residential").length} residential · ${parcels.filter(p => p.land_type === "commercial").length} commercial`)}
    </div>
  </div>;
}
export function PipelineChart() {
  const {
    t
  } = useLanguage();
  const {
    inquiries
  } = useBusiness();
  const stages = Array.from(new Set([...statuses, ...inquiries.map(q => lower(q.status))])).map(s => ({
    status: s,
    count: inquiries.filter(q => lower(q.status) === s).length
  })).filter(s => s.count);
  const max = Math.max(1, ...stages.map(s => s.count));
  return <div className="bi-panel">
    <div className="bi-panel-head">
      <div>
        <span className="bi-eyebrow">{t("CONVERSATIONS TO CONVERSION")}</span>
        <h2>{t("The investor pipeline")}</h2>
      </div>
      <Link href="/admin/inquiries" className="bi-icon-link" aria-label={t("Inspect investor pipeline")}>
        <ArrowUpRight size={18} />
      </Link>
    </div>
    <div className="bi-pipeline">
      {stages.map(s => <Link key={s.status} href={`/admin/inquiries?status=${s.status}`}>
        <span>
          <i className={`bi-stage-dot stage-${s.status}`} />
          {t(title(s.status))}
        </span>
        <div>
          <i style={{
            width: `${s.count / max * 100}%`
          }} />
        </div>
        <strong>
          {t(s.count)}
        </strong>
      </Link>)}
    </div>
    {!stages.length && <p className="bi-empty-small">{t("No investor inquiries yet.")}</p>}
    <div className="bi-panel-footer">
      <span>{t("Current status counts, not a conversion-rate funnel.")}</span>
    </div>
  </div>;
}
export function LandTypeDemand() {
  const {
    t
  } = useLanguage();
  const {
    analysis
  } = useBusiness();
  const data = ["commercial", "residential"].map(type => ({
    type,
    count: analysis.open.filter(q => lower(q.land_type_wanted) === type).length
  }));
  const total = data.reduce((s, v) => s + v.count, 0);
  return <div className="bi-panel">
    <div className="bi-panel-head">
      <div>
        <span className="bi-eyebrow">{t("WHAT INVESTORS ARE ASKING FOR")}</span>
        <h2>{t("Demand by land type")}</h2>
      </div>
    </div>
    <div className="bi-demand-types">
      {data.map(d => <Link href={`/admin/inquiries?type=${d.type}&open=1`} key={d.type}>
        <div>
          <span>
            {t(title(d.type))}
          </span>
          <strong>
            {t(d.count)}
            <small>{t("open inquiries")}</small>
          </strong>
        </div>
        <div className="bi-type-track">
          <span style={{
            width: `${total ? d.count / total * 100 : 0}%`
          }} />
        </div>
      </Link>)}
    </div>
    <div className="bi-panel-footer">
      <span>{t(analysis.open.length - total)}{t(" inquiries have other / unspecified types.")}</span>
    </div>
  </div>;
}
