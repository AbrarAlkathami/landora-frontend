"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Compass, MapPin, ShieldCheck, Sparkles, SlidersHorizontal, Check } from "lucide-react";
import { usePortfolio } from "./portfolio";
import { ParcelCard } from "./parcel-card";
import { Reveal } from "./motion";
import { AdvisorEntry } from "./shell";
export function InvestorHome() {
  const {
    t, locale
  } = useLanguage();
  const {
    parcels: allParcels,
    portfolioMetrics, loading, error
  } = usePortfolio();
  const parcels = allParcels.filter(p => p.available).sort((a, b) => Number(a.price === null) - Number(b.price === null)).slice(0, 3);
  return <>
    <section className="hero">
      <div className="hero-photo">
        <Image src="/images/riyadh-hero-v2.webp" alt={t("Illustrative Riyadh skyline with Kingdom Centre, KAFD-style towers, and green trees")} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="hero-shade" />
      <div className="site-width hero-content">
        <Reveal>
          <div className="eyebrow light"><span />{t(" LAND. VISION. POSSIBILITY.")}</div>
          <h1>{t("The right land.")}<br />{t("For your ")}<em>{t("next move.")}</em></h1>
          <p>{t("Discover exceptional land in Riyadh, thoughtfully")}<br className="desktop-break" />{t(" matched to your ambition.")}</p>
          <div className="hero-actions">
            <Link className="cta cta-primary" href="/match"><Compass size={18} />{t("Find my match")}<ArrowUpRight size={18} /></Link>
            <Link href="/explore" className="hero-secondary">{t("Explore opportunities")}<ArrowRight size={17} /></Link>
          </div>
          <div className="hero-note"><ShieldCheck size={15} />{t("Local expertise. A clearer investment journey.")}</div>
        </Reveal>
      </div>
      <div className="hero-caption"><MapPin size={13} />{t(" RIYADH, SAUDI ARABIA ")}<span>{t("01 / A CITY OF POSSIBILITY")}</span></div>
    </section>
    <section className="trust-strip site-width">
      <div className="trust-intro">
        <span className="eyebrow">{t("ROOTED IN RIYADH")}</span>
        <p>{t("A city of opportunity.")}<br /><strong>{t("A partner with perspective.")}</strong></p>
      </div>
      <div className="metric">
        <strong>
          {loading || error ? "—" : t(portfolioMetrics.parcels)}
        </strong>
        <p>{t("Land parcels in our portfolio")}</p>
      </div>
      <div className="metric">
        <strong>
          {loading || error ? "—" : t(portfolioMetrics.districts)}
        </strong>
        <p>{t("Districts across Riyadh")}</p>
      </div>
      <div className="metric">
        <strong>
          {loading || error ? "—" : t(portfolioMetrics.onMarket)}
          <span className="metric-dot" />
        </strong>
        <p>{t("Currently on the market")}</p>
      </div>
    </section>
    <section className="section site-width" id="opportunities">
      <Reveal>
        <div className="section-heading">
          <div>
            <div className="eyebrow">{t("SELECTED WITH INTENTION")}</div>
            <h2>{t("Featured ")}<em>{t("opportunities.")}</em></h2>
            <p>{t("A closer look at a few opportunities worth your attention.")}</p>
          </div>
          <Link className="text-link" href="/explore">{t("Explore all lands")}<ArrowUpRight size={17} /></Link>
        </div>
      </Reveal>
      <div className="parcel-grid">
        {loading && [0, 1, 2].map(i => <div key={i} className="skeleton" role="status" aria-label={t("Loading land opportunities")} />)}
        {parcels.slice(0, 3).map((parcel, i) => <Reveal key={parcel.id} delay={i * .08}>
          <ParcelCard parcel={parcel} />
        </Reveal>)}
      </div>
      <p className="demo-note">{t("Live portfolio listings · Illustrative imagery")}</p>
    </section>
    <section className="site-width match-section">
      <Reveal className="match-banner">
        <div className="match-copy">
          <div className="eyebrow">{t("LESS SEARCHING. MORE CERTAINTY.")}</div>
          <h2>{t("A shortlist built")}<br /><em>{t("around you.")}</em></h2>
          <p>{t("A family home? A commercial venture? Your next investment?")}<br />{t("Tell us what you have in mind. We’ll help you find the fit.")}</p>
          <Link href="/match" className="cta cta-green"><Compass size={18} />{t("Find my match")}<ArrowUpRight size={17} /></Link>
          <span className="time-note">{t("5 simple questions. A shortlist made for you.")}</span>
        </div>
        <div className="match-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-dot" />
          <div className="match-preview">
            <div className="preview-icon">
              <Sparkles size={21} />
            </div>
            <span className="preview-label">{t("YOUR PERSONALIZED SHORTLIST")}</span>
            <div className="preview-row">
              <span>{parcels[0] ? locale === "ar" ? parcels[0].districtAr : parcels[0].district : t("Your next opportunity")}<br /><small>{t(parcels[0] ? `${parcels[0].type} · ${parcels[0].area} Riyadh` : "Discover your ideal location")}</small></span>
              <strong><Check size={12} />{t("Explore the fit")}</strong>
            </div>
            <div className="preview-divider" />
            <span className="preview-fit"><Check size={13} />{t(" Your vision. Your budget. Your location.")}</span>
          </div>
          <div className="floating-tag"><SlidersHorizontal size={15} />{t("Built around you")}</div>
        </div>
      </Reveal>
    </section>
    <section className="section site-width advisor-section">
      <Reveal>
        <div className="advisor-icon">
          <Sparkles size={25} />
        </div>
        <div className="eyebrow">{t("A LITTLE CLARITY GOES A LONG WAY")}</div>
        <h2>{t("Get a clearer view")}<br /><em>{t("with Sarj AI.")}</em></h2>
        <p>{t("Explore areas, compare opportunities, or talk through your idea.")}<br />{t("Your Sarj advisor is a good place to start.")}</p>
        <AdvisorEntry className="cta cta-outline">{t("Meet your AI advisor")}<ArrowUpRight size={17} /></AdvisorEntry>
        <span className="advisor-disclaimer">{t("An intelligent starting point. Backed by a human conversation.")}</span>
      </Reveal>
    </section>
  </>;
}
