"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
      <div className="bi-mini-stats">
        <Link href="/admin/inquiries?open=1"><Users size={16}/><strong>{analysis.open.length}</strong>{t("open conversations")}</Link>
        <Link href="/admin/parcels?status=available"><Layers size={16}/><strong>{analysis.available.length}</strong>{t("available parcels")}</Link>
        <Link href="/admin/inquiries?unmatched=1"><Target size={16}/><strong>{analysis.noMatch.length}</strong>{t("without a good fit")}</Link>
        <button onClick={() => update("gap", search.get("gap") === "High" ? "" : "High")} className={search.get("gap") === "High" ? "selected" : ""}><ChartNoAxesCombined size={16}/><strong>{high}</strong>{t("segments with a high gap")}</button>
      </div>
      <Filters primaryKeys={["area", "gap"]} placeholder={t("Search by area, land type, or market segment…")} definitions={[{
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
      <div className="bi-result-toolbar">
        <span aria-live="polite"><strong>{rows.length}</strong> {t("market segments")}</span>
        <div className="bi-chart-legend"><span><i className="bi-color-demand" />{t("Open inquiries")}</span><span><i className="bi-color-supply" />{t("Available parcels")}</span></div>
      </div>
      <div className="bi-table-panel bi-demand-panel">
        <div className="bi-demand-table-scroll">
          <Table className="bi-table bi-demand-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("Market segment")}</TableHead>
                <TableHead>{t("Demand vs available supply")}</TableHead>
                <TableHead>{t("Without a fit")}</TableHead>
                <TableHead>{t("Opportunity gap")}</TableHead>
                <TableHead>{t("Take a closer look")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(s => <TableRow key={`${s.area}-${s.type}-${s.listing}`}>
                <TableCell>
                  <strong>{t(s.area)}{t(" Riyadh")}</strong>
                  <small>{t(title(s.type))}{t(" · For ")}{t(s.listing)}</small>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <span className={s.unmatched ? "bi-gap-unmatched" : "bi-muted"}>
                    {t(s.unmatched)}
                  </span>
                  <small>{t("investors")}</small>
                </TableCell>
                <TableCell>
                  <span className={`bi-gap-badge gap-${s.gap.toLowerCase().replaceAll(" ", "-")}`}>
                    {t(s.gap)}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={inquiryHref(s)} className="bi-text-link">{t("Inspect demand")}<ArrowUpRight size={13} /></Link>
                  <Link href={`/admin/parcels?area=${s.area}&type=${s.type}&listing=${s.listing}&status=available`} className="bi-demand-supply-link">{t("View available land")}</Link>
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </div>
        {!rows.length && <div className="bi-empty-small">{t("No segments match these filters.")}</div>}
        <div className="bi-panel-footer">
          <span>{t(rows.length)}{t(" market segments · ")}{t(analysis.unassigned)}{t(" open inquiries have preferences too broad to assign to one segment.")}</span>
        </div>
      </div>
      <details className="bi-record-method"><summary>{t("How gap levels are calculated")}</summary>
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
      <p className="bi-demand-explanation">{t("A good fit satisfies area, type, buy/lease preference, and a comparable budget when provided. Counts are signals, not reserved capacity: several inquiries may match the same parcel. Unknown budgets need qualification.")}</p>
      </details>
    </DataBoundary>
  </>;
}
