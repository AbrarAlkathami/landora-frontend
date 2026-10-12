"use client";

import { useLanguage } from "@/components/shared/language";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Maximize, MoveHorizontal, Building2, Compass, Sparkles, CheckCircle2 } from "lucide-react";
import { type InvestorParcel, money, compactMoney } from "@/lib/investor/parcels";
import { usePortfolio } from "./portfolio";
import { useInvestor } from "./shell";
import { ParcelCard } from "./parcel-card";
import { Reveal } from "./motion";
export function ParcelDetails({
  parcel
}: {
  parcel: InvestorParcel;
}) {
  const {
    t,
    locale
  } = useLanguage();
  const {
    parcels
  } = usePortfolio();
  const {
    ask,
    inquire
  } = useInvestor();
  const similar = parcels.filter(p => p.id !== parcel.id && p.available).sort((a, b) => Number(b.type === parcel.type) - Number(a.type === parcel.type) || Number(b.area === parcel.area) - Number(a.area === parcel.area)).slice(0, 3);
  const description = locale === "ar"
    ? `${money(parcel.size)} م² من الأراضي ${parcel.type === "Commercial" ? "التجارية" : "السكنية"} في ${parcel.districtAr}، ${t(parcel.area)} الرياض، على شارع بعرض ${parcel.streetWidth} مترًا. ${parcel.available ? `متاحة ${parcel.listing === "Sale" ? "للبيع" : "للإيجار"}.` : `الحالة الحالية: ${t(parcel.status)}.`} تواصل مع سرج لتأكيد الاستخدامات المسموحة ومناقشة خططك.`
    : parcel.description;
  const fits = [{
    icon: Compass,
    title: parcel.highlight,
    text: description
  }, {
    icon: MoveHorizontal,
    title: locale === "ar" ? `وصول عبر شارع بعرض ${parcel.streetWidth} مترًا` : `${parcel.streetWidth}-meter street access`,
    text: "A clear starting point for considering access and frontage requirements for your project."
  }, {
    icon: Maximize,
    title: locale === "ar" ? `${money(parcel.size)} م² لتحقيق رؤيتك` : `${money(parcel.size)} m² to shape your vision`,
    text: locale === "ar"
      ? `فرصة لاستكشاف خيارات ${parcel.uses.map(use => t(use)).join("، ")}. تأكد من ملاءمة الاستخدام الذي تخطط له مع فريق سرج.`
      : `An opportunity to explore ${parcel.uses.map(x => x.toLowerCase()).join(", ")}. Confirm your intended use with the Sarj team.`
  }];
  return <div className="site-width detail-bottom">
    <div className="detail-top">
      <div className="breadcrumb">
        <Link href="/">{t("Home")}</Link>
        <ArrowRight size={10} />
        <Link href="/explore">{t("Explore lands")}</Link>
        <ArrowRight size={10} />
        <span>
          {locale === "ar" ? parcel.districtAr : parcel.district}
        </span>
      </div>
      <span className="detail-id">{t("PARCEL ")}{parcel.id}</span>
    </div>
    <div className="detail-grid">
      <div>
        <Reveal>
          <div className="detail-visual">
            <Image src={parcel.image} alt={`Illustrative aerial view of land in a Riyadh ${parcel.type.toLowerCase()} neighborhood`} fill priority sizes="(max-width: 800px) 100vw, 65vw" />
            <div className="card-badges">
              <span className="property-badge">
                {t(parcel.type)}
              </span>
              <span className="property-badge">{t("For ")}{t(parcel.listing.toLowerCase())}</span>
            </div>
            <span className="card-image-label">{t("ILLUSTRATIVE VIEW")}</span>
          </div>
        </Reveal>
        <div className="detail-heading">
          <span className="eyebrow"><MapPin size={12} />{t(parcel.area.toUpperCase())}{t(" RIYADH, SAUDI ARABIA")}</span>
          <h1>
            {locale === "ar" ? parcel.districtAr : parcel.district}
            <span lang={locale === "ar" ? "en" : "ar"}>
              {locale === "ar" ? parcel.district : parcel.districtAr}
            </span>
          </h1>
          <p className="detail-description">
            {description}
          </p>
        </div>
        <section className="detail-content">
          <h2>{t("Why this land ")}<em>{t("fits.")}</em></h2>
          <div className="fit-list">
            {fits.map(({
              icon: Icon,
              title,
              text
            }) => <div className="fit-item" key={title}>
              <Icon size={20} />
              <div>
                <strong>
                  {t(title)}
                </strong>
                <p>
                  {t(text)}
                </p>
              </div>
            </div>)}
          </div>
        </section>
        <section className="detail-content">
          <h2>{t("A place in ")}<em>{t("the bigger picture.")}</em></h2>
          <div className="location-map" aria-label={`Illustrative location diagram for ${parcel.district}`}>
            <div className="map-pin">
              <MapPin size={22} />
              <span>
                {locale === "ar" ? parcel.districtAr : parcel.district}
              </span>
            </div>
            <span className="map-label">{t("ILLUSTRATIVE LOCATION · NOT A SURVEY")}</span>
          </div>
          <div className="location-link">
            <span><MapPin size={11} className="inline mr-1" />{locale === "ar" ? parcel.districtAr : parcel.district}{t(", ")}{t(parcel.area)}{t(" Riyadh · Listing coordinates")}</span>
            <a href={`https://www.google.com/maps/search/?api=1&query=${parcel.lat},${parcel.lng}`} target="_blank" rel="noopener noreferrer">{t("Open location")}<ArrowUpRight size={12} /></a>
          </div>
        </section>
      </div>
      <aside className="detail-panel">
        <div className="card-location">
          <MapPin size={12} />
          {locale === "ar" ? parcel.districtAr : parcel.district}
          <span className={parcel.available ? "available" : "reserved"}>
            {t(parcel.available ? "Available now" : parcel.status.charAt(0).toUpperCase() + parcel.status.slice(1))}
          </span>
        </div>
        <div className="detail-price">
          {parcel.price !== null && <small>{t("SAR")}</small>}
          {t(money(parcel.price))}
        </div>
        <div className="detail-price-label">
          {t(parcel.listing === "Lease" ? "Annual lease price" : "Total land price")}
          {parcel.pricePerSqm !== null && <>{t(" · SAR ")}{t(money(parcel.pricePerSqm))}{t(" / m²")}{t(parcel.listing === "Lease" ? " / year" : "")}</>}
        </div>
        <div className="detail-facts">
          <div>
            <span>{t("Plot size")}</span>
            <strong><Maximize size={14} />{t(money(parcel.size))}{t(" m²")}</strong>
          </div>
          <div>
            <span>{t("Street width")}</span>
            <strong><MoveHorizontal size={15} />{t(parcel.streetWidth)}{t(" meters")}</strong>
          </div>
          <div>
            <span>{t("Land type")}</span>
            <strong>
              <Building2 size={14} />
              {t(parcel.type)}
            </strong>
          </div>
          <div>
            <span>{t("Listing type")}</span>
            <strong>
              <Compass size={14} />
              {t(parcel.listing === "Sale" ? "For sale" : "For lease")}
            </strong>
          </div>
          <div>
            <span>{t("District")}</span>
            <strong>
              {locale === "ar" ? parcel.districtAr : parcel.district}
            </strong>
          </div>
          <div>
            <span>{t("Area")}</span>
            <strong>{t(parcel.area)}{t(" Riyadh")}</strong>
          </div>
        </div>
        <button className="cta cta-green" onClick={() => inquire(parcel.available ? parcel : undefined)}>
          {t(parcel.available ? "I’m interested" : "Find a similar opportunity")}
          <ArrowUpRight size={17} />
        </button>
        <button className="cta cta-outline" onClick={() => ask(locale === "ar" ? `أخبرني عن هذه الأرض في ${parcel.districtAr}` : `Tell me about this land in ${parcel.district}`, parcel)}><Sparkles size={16} />{t("Ask AI about this land")}<ArrowRight size={16} /></button>
        <p className="form-note"><CheckCircle2 size={11} className="inline mr-1" />{t("A conversation, with no commitment.")}</p>
        <p className="portfolio-note">{t("Listing information from Sarj. Confirm availability and permitted uses with our team before proceeding.")}</p>
      </aside>
    </div>
    <section className="section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("MORE POSSIBILITIES TO CONSIDER")}</div>
          <h2>{t("Another place. ")}<em>{t("The same ambition.")}</em></h2>
          <p>{t("Similar opportunities selected by land type and area.")}</p>
        </div>
        <Link href="/explore" className="text-link">{t("Explore all lands")}<ArrowUpRight size={16} /></Link>
      </div>
      <div className="parcel-grid">
        {similar.map(p => <ParcelCard parcel={p} key={p.id} />)}
      </div>
    </section>
    <div className="detail-mobile-cta">
      <span>
        {t(parcel.price === null ? "Price on request" : `SAR ${compactMoney(parcel.price)}`)}
        {t(parcel.listing === "Lease" && parcel.price !== null ? " / year" : "")}
      </span>
      <button className="cta cta-green" onClick={() => inquire(parcel.available ? parcel : undefined)}>
        {t(parcel.available ? "I’m interested" : "Find similar land")}
        <ArrowUpRight size={15} />
      </button>
    </div>
  </div>;
}
