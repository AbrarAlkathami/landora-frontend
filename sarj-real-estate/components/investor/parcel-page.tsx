"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import { usePortfolio } from "./portfolio";
import { ParcelDetails } from "./details";
export function ParcelPage({
  id
}: {
  id: string;
}) {
  const {
    t
  } = useLanguage();
  const {
    parcels
  } = usePortfolio();
  const parcel = parcels.find(parcel => parcel.id === id);
  if (!parcel) return <div className="site-width section empty-state">
    <h3>{t("This opportunity couldn’t be found.")}</h3>
    <p>{t("The listing may have been removed. Explore our current opportunities.")}</p>
    <Link className="cta cta-green mt-6" href="/explore">{t("Explore lands")}</Link>
  </div>;
  return <ParcelDetails parcel={parcel} />;
}
