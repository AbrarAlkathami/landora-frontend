"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Maximize, MoveHorizontal } from "lucide-react";
import { compactMoney, money, type InvestorParcel } from "@/lib/investor/parcels";
export function ParcelCard({
  parcel,
  score,
  reasons,
  tradeoffs
}: {
  parcel: InvestorParcel;
  score?: number;
  reasons?: string[];
  tradeoffs?: string[];
}) {
  const {
    t,
    locale
  } = useLanguage();
  return <article className="land-card group">
    <Link href={`/lands/${parcel.id}`} className="card-image block" aria-label={`View ${parcel.district} ${parcel.type.toLowerCase()} land`}>
      <Image src={parcel.image} alt={`Illustrative aerial view of ${parcel.type.toLowerCase()} land`} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="card-badges">
        <span className="property-badge">
          {t(parcel.type)}
        </span>
        <span className="property-badge">{t("For ")}{t(parcel.listing.toLowerCase())}</span>
      </div>
      <span className="card-image-label">{t("ILLUSTRATIVE VIEW")}</span>
      {score !== undefined && <span className="match-badge">{t(score)}{t("% match")}</span>}
      <span className="card-open">
        <ArrowUpRight size={18} />
      </span>
    </Link>
    <div className="card-body">
      <div className="card-location"><MapPin size={13} />{t(parcel.area)}{t(" Riyadh ")}<span className={parcel.available ? "available" : "reserved"}>
          {t(parcel.available ? "Available" : parcel.status.charAt(0).toUpperCase() + parcel.status.slice(1))}
        </span></div>
      <Link href={`/lands/${parcel.id}`} className="card-title">
        {locale === "ar" ? parcel.districtAr : parcel.district}
        <span lang={locale === "ar" ? "en" : "ar"}>
          {locale === "ar" ? parcel.district : parcel.districtAr}
        </span>
      </Link>
      <div className="card-facts">
        <span><Maximize size={14} />{t(money(parcel.size))}{t(" m²")}</span>
        <span><MoveHorizontal size={15} />{t(parcel.streetWidth)}{t("m street")}</span>
      </div>
      <p className="card-highlight">
        {t(parcel.highlight)}
      </p>
      {reasons && <ul className="match-reasons">
        {reasons.slice(0, 3).map(reason => <li key={reason}>{t("✓ ")}{t(reason)}</li>)}
      </ul>}
      {tradeoffs && tradeoffs.length > 0 && <p className="tradeoff">{t("Consider: ")}{tradeoffs.map(tradeoff => t(tradeoff)).join(" · ")}</p>}
      <div className="card-bottom">
        <div>
          <span className="price-label">
            {t(parcel.listing === "Lease" ? "Annual lease" : "Total price")}
          </span>
          <strong>
            {parcel.price !== null && <small>{t("SAR")}</small>}
            {t(compactMoney(parcel.price))}
            {parcel.listing === "Lease" && parcel.price !== null && <small>{t(" / year")}</small>}
          </strong>
        </div>
        <Link href={`/lands/${parcel.id}`} aria-label={`View opportunity in ${parcel.district}`} className="card-detail-arrow">
          <ArrowUpRight size={20} />
        </Link>
      </div>
    </div>
  </article>;
}
