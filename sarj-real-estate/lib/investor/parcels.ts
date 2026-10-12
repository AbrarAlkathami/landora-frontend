import type { Parcel } from "@/features/parcels/types/parcel";
export type LandType = "Residential" | "Commercial";
export type ListingType = "Sale" | "Lease";
export type Area = "North" | "East" | "West" | "South" | "Central";
export type InvestorParcel = {
  id: string;
  district: string;
  districtAr: string;
  area: Area;
  type: LandType;
  listing: ListingType;
  size: number;
  price: number | null;
  pricePerSqm: number | null;
  streetWidth: number;
  available: boolean;
  status: string;
  image: string;
  highlight: string;
  description: string;
  uses: string[];
  lat: number;
  lng: number;
};
export type PortfolioMetrics = {
  parcels: number;
  districts: number;
  onMarket: number;
};
export function toInvestorParcel(parcel: Parcel): InvestorParcel {
  const type: LandType = parcel.land_type.toLowerCase() === "commercial" ? "Commercial" : "Residential";
  const listing: ListingType = parcel.listing_type.toLowerCase() === "lease" ? "Lease" : "Sale";
  const available = parcel.status.toLowerCase() === "available";
  return {
    id: parcel.parcel_id,
    district: parcel.district_en,
    districtAr: parcel.district_ar,
    area: parcel.area_of_city as Area,
    type,
    listing,
    size: parcel.area_sqm,
    price: parcel.total_price_sar,
    pricePerSqm: parcel.price_per_sqm_sar,
    streetWidth: parcel.street_width_m,
    available,
    status: parcel.status.toLowerCase(),
    image: type === "Commercial" ? "/images/commercial.webp" : parcel.area_sqm >= 1000 ? "/images/neighborhood.webp" : "/images/residential.webp",
    highlight: `${money(parcel.area_sqm)} m² with access to a ${parcel.street_width_m}m street`,
    description: `${money(parcel.area_sqm)} m² of ${type.toLowerCase()} land in ${parcel.district_en}, ${parcel.area_of_city} Riyadh, with a ${parcel.street_width_m}-meter-wide street. ${available ? `Offered for ${listing.toLowerCase()}.` : `Currently ${parcel.status.toLowerCase()}.`} Speak with Sarj to confirm permitted uses and discuss your plans.`,
    // Indicative discovery categories; zoning and suitability are not in the database.
    uses: type === "Commercial" ? ["Open a showroom", "Develop a project", "Long-term investment"] : ["Build a home", "Develop a project", "Long-term investment"],
    lat: parcel.lat,
    lng: parcel.lng
  };
}
export function getPortfolioMetrics(parcels: InvestorParcel[]): PortfolioMetrics {
  return {
    parcels: parcels.length,
    districts: new Set(parcels.map(p => p.district)).size,
    onMarket: parcels.filter(p => p.available).length
  };
}
export const money = (value: number | null) => value === null ? "Price on request" : new Intl.NumberFormat("en-SA", {
  maximumFractionDigits: 0
}).format(value);
export const compactMoney = (value: number | null) => value === null ? "Price on request" : value >= 1000000 ? `${Number((value / 1000000).toFixed(2))}M` : `${money(value / 1000)}K`;
export type Preferences = {
  intent: string;
  type: string;
  listing: string;
  area: string;
  budget: number;
};
export function recommend(preferences: Preferences, parcels: InvestorParcel[]) {
  return parcels.filter(p => p.available).map(parcel => {
    const criteria = [{
      fits: parcel.uses.includes(preferences.intent),
      reason: `Land type aligned with your goal: ${preferences.intent.toLowerCase()} (subject to use approval)`,
      miss: "Your intended use needs a closer review"
    }, {
      fits: parcel.type === preferences.type,
      reason: `${parcel.type} land, as requested`,
      miss: `${parcel.type} rather than ${preferences.type.toLowerCase()} land`
    }, {
      fits: parcel.listing === preferences.listing,
      reason: `Available to ${parcel.listing === "Sale" ? "buy" : "lease"}`,
      miss: `Offered for ${parcel.listing.toLowerCase()}`
    }, {
      fits: preferences.area === "Anywhere" || parcel.area === preferences.area,
      reason: `${parcel.area} Riyadh${preferences.area === "Anywhere" ? " — open to your preferred location" : ", your preferred area"}`,
      miss: `Located in ${parcel.area} Riyadh`
    }, {
      fits: parcel.price !== null && parcel.price <= preferences.budget,
      reason: `Within your SAR ${compactMoney(preferences.budget)} ${parcel.listing === "Lease" ? "annual " : ""}budget`,
      miss: parcel.price === null ? "Price on request — budget fit needs confirmation" : `Above your budget by SAR ${money(parcel.price - preferences.budget)}`
    }];
    return {
      parcel,
      score: criteria.filter(c => c.fits).length * 20,
      reasons: criteria.filter(c => c.fits).map(c => c.reason),
      tradeoffs: criteria.filter(c => !c.fits).map(c => c.miss)
    };
  }).sort((a, b) => b.score - a.score || (a.parcel.price ?? Infinity) - (b.parcel.price ?? Infinity)).slice(0, 3);
}
