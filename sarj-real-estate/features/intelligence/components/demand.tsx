"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, Users, Layers, Target } from "lucide-react";
import { useBusiness, DataBoundary } from "./provider";
import { Filters, useRecordFilters } from "./records";
import { PageHeading } from "./dashboard";
import { areas, title, inquiryHref, lower } from "../lib/analytics";
export function DemandPage() {
  const {
    t
  } = useLanguage();
  const {
    analysis
  } = useBusiness();
  const {
    search,
    update
  } = useRecordFilters();
  const rows = analysis.segments.filter(s => (!search.get("search") || lower(`${s.area} ${s.type} ${s.listing} ${s.gap}`).includes(lower(search.get("search")))) && (!search.get("area") || s.area === search.get("area")) && (!search.get("type") || s.type === search.get("type")) && (!search.get("listing") || s.listing === search.get("listing")) && (!search.get("gap") || s.gap === search.get("gap")));
  const max = Math.max(1, ...rows.flatMap(s => [s.demand, s.supply]));
  const high = analysis.segments.filter(s => s.gap === "High").length;
  return <>
    <PageHeading eyebrow="CONNECT DEMAND WITH THE RIGHT SUPPLY" title="Demand vs inventory" description="See where investors are looking, what’s available, and which conversations need alternatives." action={<Link className="bi-button" href="/admin/inquiries?unmatched=1">{t("Review unmatched demand")}<ArrowUpRight size={15} /></Link>} />
    <DataBoundary>
      <div className="bi-demand-summary">
        <div>
          <Users size={20} />
          <span><strong>
              {t(analysis.open.length)}
            </strong>{t("open investor inquiries")}</span>
        </div>
        <div>
          <Layers size={20} />
          <span><strong>
              {t(analysis.available.length)}
            </strong>{t("available parcels")}</span>
        </div>
        <div>
          <Target size={20} />
          <span><strong>
              {t(analysis.noMatch.length)}
            </strong>{t("investors without a good fit")}</span>
        </div>
        <button onClick={() => update("gap", search.get("gap") === "High" ? "" : "High")} className={search.get("gap") === "High" ? "selected" : ""}>
          <ChartNoAxesCombined size={20} />
          <span><strong>
              {t(high)}
            </strong>{t("segments with a high gap")}</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
      <Filters placeholder={t("Search by area, land type, or market segment…")} definitions={[{
        key: "area",
        label: "All areas",
        options: areas.map(value => ({
          value,
          label: `${value} Riyadh`
        }))
      }, {
        key: "type",
        label: "All land types",
        options: ["commercial", "residential"].map(value => ({
          value,
          label: title(value)
        }))
      }, {
        key: "listing",
        label: "Sale or lease",
        options: ["sale", "lease"].map(value => ({
          value,
          label: title(value)
        }))
      }, {
        key: "gap",
        label: "All gap levels",
        options: ["High", "Watch", "Balanced", "No demand"].map(value => ({
          value,
          label: value
        }))
      }]} />
      <div className="bi-panel bi-demand-panel">
        <div className="bi-panel-head">
          <div>
            <span className="bi-eyebrow">{t("A DIRECT VIEW OF THE MARKET")}</span>
            <h2>{t("Demand, inventory & opportunity")}</h2>
          </div>
          <div className="bi-chart-legend">
            <span><i className="bi-color-demand" />{t("Open inquiries")}</span>
            <span><i className="bi-color-supply" />{t("Available parcels")}</span>
          </div>
        </div>
        <div className="bi-demand-table-scroll">
          <table className="bi-demand-table">
            <thead>
              <tr>
                <th>{t("Market segment")}</th>
                <th>{t("Demand vs available supply")}</th>
                <th>{t("Without a fit")}</th>
                <th>{t("Opportunity gap")}</th>
                <th>{t("Take a closer look")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(s => <tr key={`${s.area}-${s.type}-${s.listing}`}>
                <td>
                  <strong>{t(s.area)}{t(" Riyadh")}</strong>
                  <small>{t(title(s.type))}{t(" · For ")}{t(s.listing)}</small>
                </td>
                <td>
                  <div className="bi-segment-bars">
                    <Link href={inquiryHref(s)} aria-label={`${s.demand} open inquiries for ${s.area} ${s.type} ${s.listing}`}>
                      <i className="bi-color-demand" style={{
                        width: `${s.demand / max * 100}%`
                      }} />
                      <span>
                        {t(s.demand)}
                      </span>
                    </Link>
                    <Link href={`/admin/parcels?area=${s.area}&type=${s.type}&listing=${s.listing}&status=available`} aria-label={`${s.supply} available matching parcels`}>
                      <i className="bi-color-supply" style={{
                        width: `${s.supply / max * 100}%`
                      }} />
                      <span>
                        {t(s.supply)}
                      </span>
                    </Link>
                  </div>
                </td>
                <td>
                  <span className={s.unmatched ? "bi-gap-unmatched" : "bi-muted"}>
                    {t(s.unmatched)}
                  </span>
                  <small>{t("investors")}</small>
                </td>
                <td>
                  <span className={`bi-gap-badge gap-${s.gap.toLowerCase().replaceAll(" ", "-")}`}>
                    {t(s.gap)}
                  </span>
                </td>
                <td>
                  <Link href={inquiryHref(s)} className="bi-text-link">{t("Inspect demand")}<ArrowUpRight size={13} /></Link>
                  <Link href={`/admin/parcels?area=${s.area}&type=${s.type}&listing=${s.listing}&status=available`} className="bi-demand-supply-link">{t("View available land")}</Link>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="bi-empty-small">{t("No segments match these filters.")}</div>}
        <div className="bi-panel-footer">
          <span>{t(rows.length)}{t(" market segments · ")}{t(analysis.unassigned)}{t(" open inquiries have preferences too broad to assign to one segment.")}</span>
        </div>
      </div>
      <div className="bi-demand-method">
        <div>
          <span className="bi-gap-badge gap-high">{t("High")}</span>
          <p>{t("At least half of a segment’s open inquiries have no good parcel fit.")}</p>
        </div>
        <div>
          <span className="bi-gap-badge gap-watch">{t("Watch")}</span>
          <p>{t("Some inquiries are unmatched, or inquiry count exceeds available parcel count.")}</p>
        </div>
        <div>
          <span className="bi-gap-badge gap-balanced">{t("Balanced")}</span>
          <p>{t("All stated requirements can find a current fit, with sufficient parcel count.")}</p>
        </div>
      </div>
      <div className="bi-method-note">{t("A good fit satisfies area, type, buy/lease preference, and a comparable budget when provided. Counts are signals, not reserved capacity: several inquiries may match the same parcel. Unknown budgets need qualification.")}</div>
    </DataBoundary>
  </>;
}
