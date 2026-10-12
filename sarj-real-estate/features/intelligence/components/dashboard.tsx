"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Layers, Map, Users, Target, Lightbulb, Clock3, Check, TrendingUp, CircleAlert, Database, ChevronDown } from "lucide-react";
import { useBusiness, DataBoundary } from "./provider";
import { AreaChart, PortfolioChart, PipelineChart, LandTypeDemand } from "./charts";
import { compact, currency, lower } from "../lib/analytics";
export function PageHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const {
    t
  } = useLanguage();
  return <div className="bi-page-heading">
    <div>
      <span className="bi-eyebrow">
        {t(eyebrow)}
      </span>
      <h1>
        {t(title)}
      </h1>
      <p>
        {t(description)}
      </p>
    </div>
    {t(action)}
  </div>;
}
export function InsightCards({
  all = false
}: {
  all?: boolean;
}) {
  const {
    t
  } = useLanguage();
  const {
    observations
  } = useBusiness();
  const icons: Record<string, typeof Lightbulb> = {
    "DEMAND SIGNAL": TrendingUp, "OPPORTUNITY GAP": CircleAlert,
    "INVENTORY TO REVISIT": Clock3, "HIGH-INTENT PIPELINE": Target,
    "FOLLOW-UP OPPORTUNITY": Users, "READY FOR OPPORTUNITY": Lightbulb
  };
  return <>
    <p className="bi-insights-method"><Database size={13} />{t("Current records · largest groups first")}</p>
    <div className={`bi-insight-grid ${all ? "bi-insight-grid-all" : ""}`}>
    {(all ? observations : observations.slice(0, 3)).map(i => {
      const Icon = icons[i.label] ?? Lightbulb;
      return <article className={`bi-insight-card tone-${i.tone}`} key={i.label}>
      <div className="bi-insight-label">
        <span className="bi-insight-icon"><Icon size={19} /></span>
        <span>{t(i.label)}</span>
      </div>
      <div className="bi-insight-metric">
        <strong>{t(i.affected)}</strong>
        <span>{t(i.unit === "parcels" ? "affected parcels" : "affected inquiries")}</span>
      </div>
      <h3>
        {t(i.title)}
      </h3>
      <details className="bi-insight-basis"><summary>{t("Why this signal")}<ChevronDown size={14} /></summary><p>{t(i.body)}</p><p>{t(i.basis)}</p></details>
      <Link href={i.href} className="bi-insight-action">{t(i.unit === "parcels" ? "View parcels" : "View inquiries")}<ArrowRight size={14} /></Link>
    </article>;
    })}
  </div></>;
}
export function Dashboard() {
  const {
    t,
    locale
  } = useLanguage();
  const {
    parcels,
    inquiries,
    analysis,
    openParcel,
    openInquiry
  } = useBusiness();
  const sold = parcels.filter(p => lower(p.status) === "sold").length;
  const leased = parcels.filter(p => lower(p.status) === "leased").length;
  const reserved = parcels.filter(p => lower(p.status) === "reserved").length;
  const priority = [...analysis.priority].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  return <>
    <PageHeading eyebrow="THE LEADERSHIP PERSPECTIVE" title="Portfolio overview" description="Your portfolio, your investors, and the opportunities between them." action={<Link href="/admin/demand" className="bi-button">{t("Understand demand")}<ArrowUpRight size={15} /></Link>} />
    <DataBoundary>
      <div className="bi-overview-label">
        <span><i className="bi-live-dot" />{t("BUSINESS AT A GLANCE")}</span>
        <span>{t("Current portfolio · All recorded inquiries")}</span>
      </div>
      <div className="bi-stat-grid">
        <Link href="/admin/parcels" className="bi-stat">
          <span>{t("Total land parcels")}<Layers size={17} /></span>
          <strong>
            {t(parcels.length)}
            <small>{t("across ")}{t(new Set(parcels.map(p => p.district_en)).size)}{t(" districts")}</small>
          </strong>
          <p>{t(sold)}{t(" sold ")}<i />{t(leased)}{t(" leased")}<i />{t(reserved)}{t(" reserved")}</p>
        </Link>
        <Link href="/admin/parcels?status=available" className="bi-stat">
          <span>{t("Available opportunities")}<Map size={17} /></span>
          <strong>
            {t(analysis.available.length)}
            <small>{t(parcels.length ? Math.round(analysis.available.length / parcels.length * 100) : 0)}{t("% of the portfolio")}</small>
          </strong>
          <p><span className="bi-live-dot" />{t("Ready for the right investor")}</p>
        </Link>
        <Link href="/admin/inquiries" className="bi-stat">
          <span>{t("Investor inquiries")}<Users size={17} /></span>
          <strong>
            {t(inquiries.length)}
            <small>{t(analysis.open.length)}{t(" conversations still open")}</small>
          </strong>
          <p>{t(analysis.priority.length)}{t(" priority investors")}<i />{t(analysis.noMatch.length)}{t(" without a fit")}</p>
        </Link>
        <Link href="/admin/inquiries?listing=sale" className="bi-stat">
          <span>{t("Average purchase budget")}<Target size={17} /></span>
          <strong>
            {t(analysis.purchaseBudget.average !== null ? `SAR ${compact(analysis.purchaseBudget.average)}` : "—")}
            <small>{t(analysis.purchaseBudget.count)}{t(" disclosed purchase budgets")}</small>
          </strong>
          <p>{t("Annual lease avg: ")}{t(analysis.leaseBudget.average !== null ? `SAR ${compact(analysis.leaseBudget.average)}` : "not provided")}</p>
        </Link>
      </div>
      <div className="bi-section-title bi-spaced">
        <div>
          <span className="bi-eyebrow">{t("SIGNALS WORTH YOUR ATTENTION")}</span>
          <h2>{t("What needs your attention")}</h2>
        </div>
        <Link href="/admin/insights" className="bi-text-link">{t("All business insights")}<ArrowUpRight size={14} /></Link>
      </div>
      <InsightCards />
      <div className="bi-chart-grid">
        <AreaChart />
        <PortfolioChart />
      </div>
      <div className="bi-two-columns">
        <PipelineChart />
        <LandTypeDemand />
      </div>
      <div className="bi-two-columns">
        <section className="bi-panel">
          <div className="bi-panel-head">
            <div>
              <span className="bi-eyebrow">{t("A FRESH LOOK AT EXISTING LAND")}</span>
              <h2>{t("Inventory to revisit")}</h2>
            </div>
            <Clock3 size={18} className="bi-gold" />
          </div>
          <div className="bi-small-records">
            {analysis.oldest.map((p, index) => <button key={p.parcel_id} onClick={() => openParcel(p.parcel_id)}>
              <span className="bi-record-rank">{t("0")}{t(index + 1)}</span>
              <span>
                <strong>
                  {locale === "ar" ? p.district_ar : p.district_en}
                </strong>
                <small>{t(p.area_of_city)}{t(" · ")}{t(p.land_type)}{t(" · ")}{t(p.listing_type)}</small>
              </span>
              <span className="bi-days">
                {t(p.days_on_market)}
                <small>{t("days")}</small>
              </span>
              <ArrowUpRight size={14} />
            </button>)}
          </div>
          {!analysis.oldest.length && <p className="bi-empty-small">{t("No available inventory to review.")}</p>}
          <div className="bi-panel-footer">
            <span>{t("Reported days on market from parcel records.")}</span>
            <Link href="/admin/parcels?stale=1&status=available">{t("Review stale inventory")}<ArrowUpRight size={13} /></Link>
          </div>
        </section>
        <section className="bi-panel">
          <div className="bi-panel-head">
            <div>
              <span className="bi-eyebrow">{t("THE NEXT HUMAN CONVERSATION")}</span>
              <h2>{t("Priority follow-ups")}</h2>
            </div>
            <Users size={18} className="bi-gold" />
          </div>
          <div className="bi-small-records">
            {priority.map(q => <button key={q.inquiry_id} onClick={() => openInquiry(q.inquiry_id)}>
              <span className="bi-initials">
                {t(q.investor_name.split(" ").slice(0, 2).map(w => w[0]).join(""))}
              </span>
              <span>
                <strong>
                  {q.investor_name}
                </strong>
                <small>{t(q.area_of_city_wanted)}{t(" · ")}{t(q.land_type_wanted)}{t(" · ")}{t(currency(q.budget_sar))}</small>
              </span>
              <span className="bi-priority-tag">
                {t(q.intent === "ready to move" ? "Ready to move" : q.status)}
              </span>
              <ArrowUpRight size={14} />
            </button>)}
          </div>
          {!priority.length && <p className="bi-empty-small">{t("No priority inquiries yet. Qualify the current pipeline to surface next actions.")}</p>}
          <div className="bi-panel-footer">
            <span>{t("Ready to move, qualified, or negotiating; oldest first.")}</span>
            <Link href="/admin/inquiries?priority=1">{t("Inspect priority investors")}<ArrowUpRight size={13} /></Link>
          </div>
        </section>
      </div>
      <div className="bi-method-note">
        <Lightbulb size={15} />
        <span>{t("Demand means open inquiries. Gaps use the available portfolio and stated budgets. A matching opportunity is a starting point for a conversation, not confirmed suitability.")}</span>
      </div>
    </DataBoundary>
  </>;
}
export function InsightsPage() {
  const {
    t
  } = useLanguage();
  return <>
    <PageHeading eyebrow="BUSINESS INTELLIGENCE" title="Business insights" description="Observations from your portfolio and investor demand, with a clear next action." />
    <DataBoundary>
      <InsightCards all />
      <div className="bi-two-columns">
        <AreaChart />
        <PipelineChart />
      </div>
      <div className="bi-method-note">
        <Check size={15} />
        <span>{t("Every observation is derived from loaded records. Open demand excludes closed, won, and lost inquiries. No historical growth or conversion claims are inferred from current counts.")}</span>
      </div>
    </DataBoundary>
  </>;
}
