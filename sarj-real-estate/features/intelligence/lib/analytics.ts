import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
export const areas = ["North", "East", "West", "South", "Central"];
export const statuses = ["new", "contacted", "qualified", "negotiating", "closed", "won", "lost"];
export const lower = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();
export const title = (value: string) => value.replace(/\b\w/g, c => c.toUpperCase());
export const transaction = (value: string) => ["buy", "purchase", "sale"].includes(lower(value)) ? "sale" : lower(value);
export const isOpen = (inquiry: Inquiry) => !["closed", "won", "lost"].includes(lower(inquiry.status));
export const isPriority = (inquiry: Inquiry) => isOpen(inquiry) && (lower(inquiry.intent) === "ready to move" || ["qualified", "negotiating"].includes(lower(inquiry.status)));
const unconstrained = (value: string) => ["", "any", "anywhere", "all"].includes(lower(value));
export function budgetBasisMatches(inquiry: Inquiry, parcel: Parcel) {
  if (!inquiry.budget_basis) return true;
  const basis = lower(inquiry.budget_basis);
  return lower(parcel.listing_type) === "lease" ? basis.includes("annual") || basis.includes("rent") : basis.includes("purchase") || basis.includes("asking") || basis.includes("total");
}
export function matchInquiry(inquiry: Inquiry, parcels: Parcel[]) {
  return parcels.filter(p => lower(p.status) === "available").map(parcel => {
    const checks = [{
      fits: unconstrained(inquiry.area_of_city_wanted) || lower(parcel.area_of_city) === lower(inquiry.area_of_city_wanted),
      reason: `${parcel.area_of_city} Riyadh matches the area preference`,
      miss: `${parcel.area_of_city} Riyadh differs from the preferred area`
    }, {
      fits: unconstrained(inquiry.land_type_wanted) || lower(parcel.land_type) === lower(inquiry.land_type_wanted),
      reason: `${title(parcel.land_type)} land aligns with the requested type`,
      miss: `${title(parcel.land_type)} rather than ${inquiry.land_type_wanted} land`
    }, {
      fits: unconstrained(inquiry.prefers) || lower(parcel.listing_type) === transaction(inquiry.prefers),
      reason: `Available for ${parcel.listing_type}`,
      miss: `Offered for ${parcel.listing_type}, outside the transaction preference`
    }, {
      fits: inquiry.budget_sar !== null && parcel.total_price_sar !== null && budgetBasisMatches(inquiry, parcel) && parcel.total_price_sar <= inquiry.budget_sar,
      reason: `Within the ${parcel.listing_type === "lease" ? "annual lease" : "purchase"} budget`,
      miss: inquiry.budget_sar === null ? "Budget not provided — confirm with investor" : !budgetBasisMatches(inquiry, parcel) ? "Budget basis differs from the listing" : parcel.total_price_sar === null ? "Parcel price requires confirmation" : "Above the stated budget"
    }];
    return {
      parcel,
      score: checks.filter(c => c.fits).length * 25,
      good: checks.slice(0, 3).every(c => c.fits) && (inquiry.budget_sar === null || checks[3].fits),
      reasons: checks.filter(c => c.fits).map(c => c.reason),
      tradeoffs: checks.filter(c => !c.fits).map(c => c.miss)
    };
  }).sort((a, b) => b.score - a.score || (a.parcel.total_price_sar ?? Infinity) - (b.parcel.total_price_sar ?? Infinity));
}
export type DemandSegment = {
  area: string;
  type: string;
  listing: string;
  demand: number;
  supply: number;
  unmatched: number;
  gap: "High" | "Watch" | "Balanced" | "No demand";
};
export function analyze(parcels: Parcel[], inquiries: Inquiry[]) {
  const available = parcels.filter(p => lower(p.status) === "available");
  const open = inquiries.filter(isOpen);
  const priority = open.filter(isPriority);
  const matches = new Map(open.map(q => [q.inquiry_id, matchInquiry(q, parcels)]));
  const noMatch = open.filter(q => !matches.get(q.inquiry_id)?.some(m => m.good));
  const segments: DemandSegment[] = areas.flatMap(area => ["commercial", "residential"].flatMap(type => ["sale", "lease"].map(listing => {
    const demandRows = open.filter(q => lower(q.area_of_city_wanted) === lower(area) && lower(q.land_type_wanted) === type && transaction(q.prefers) === listing);
    const supply = available.filter(p => lower(p.area_of_city) === lower(area) && lower(p.land_type) === type && lower(p.listing_type) === listing).length;
    const unmatched = demandRows.filter(q => !matches.get(q.inquiry_id)?.some(m => m.good)).length;
    return {
      area,
      type,
      listing,
      demand: demandRows.length,
      supply,
      unmatched,
      gap: !demandRows.length ? "No demand" : unmatched / demandRows.length >= .5 ? "High" : unmatched > 0 || supply < demandRows.length ? "Watch" : "Balanced"
    } as DemandSegment;
  }))).sort((a, b) => b.unmatched - a.unmatched || b.demand - a.demand);
  const budget = (listing: string) => {
    const records = inquiries.filter(q => transaction(q.prefers) === listing && q.budget_sar !== null && budgetBasisMatches(q, {
      listing_type: listing
    } as Parcel));
    return {
      count: records.length,
      average: records.length ? Math.round(records.reduce((sum, q) => sum + (q.budget_sar ?? 0), 0) / records.length) : null
    };
  };
  const areaDemand = areas.map(area => ({
    label: area,
    demand: open.filter(q => lower(q.area_of_city_wanted) === lower(area)).length,
    supply: available.filter(p => lower(p.area_of_city) === lower(area)).length
  }));
  const oldest = [...available].sort((a, b) => b.days_on_market - a.days_on_market).slice(0, 5);
  return {
    available,
    open,
    priority,
    matches,
    noMatch,
    segments,
    areaDemand,
    oldest,
    purchaseBudget: budget("sale"),
    leaseBudget: budget("lease"),
    unassigned: open.filter(q => !areas.some(a => lower(a) === lower(q.area_of_city_wanted)) || !["commercial", "residential"].includes(lower(q.land_type_wanted)) || !["sale", "lease"].includes(transaction(q.prefers))).length
  };
}
export type BusinessInsight = {
  label: string;
  title: string;
  body: string;
  href: string;
  tone: "gold" | "green" | "red";
};
export function insights(parcels: Parcel[], inquiries: Inquiry[], a = analyze(parcels, inquiries)): BusinessInsight[] {
  const observations: BusinessInsight[] = [];
  const commercial = areas.map(area => ({
    area,
    count: a.open.filter(q => lower(q.land_type_wanted) === "commercial" && lower(q.area_of_city_wanted) === lower(area)).length
  })).sort((x, y) => y.count - x.count);
  if (commercial[0]?.count) {
    const top = commercial.filter(x => x.count === commercial[0].count);
    observations.push({
      label: "DEMAND SIGNAL",
      title: `Commercial demand leads in ${top.map(x => x.area).join(" & ")} Riyadh.`,
      body: `${commercial[0].count} open commercial inquiries per leading area. Review the investors and their budget requirements.`,
      href: `/admin/inquiries?area=${commercial[0].area}&type=commercial&open=1`,
      tone: "green"
    });
  }
  const gap = a.segments.find(s => s.unmatched > 0);
  if (gap) observations.push({
    label: "OPPORTUNITY GAP",
    title: `${gap.area} ${gap.type} ${gap.listing}: ${gap.unmatched} investors without a fit.`,
    body: `${gap.demand} open inquiries against ${gap.supply} available parcels. Area, type, transaction, and supplied budgets are checked.`,
    href: `/admin/demand?area=${gap.area}&type=${gap.type}&listing=${gap.listing}`,
    tone: "red"
  });
  if (a.oldest[0]) observations.push({
    label: "INVENTORY TO REVISIT",
    title: `${a.oldest[0].district_en}: ${a.oldest[0].days_on_market} reported days on market.`,
    body: `Review the ${a.oldest.length} oldest available parcels and identify investor matches before changing the proposition.`,
    href: "/admin/parcels?stale=1&status=available",
    tone: "gold"
  });
  const buyers = a.priority.filter(q => transaction(q.prefers) === "sale").length;
  const lessees = a.priority.filter(q => transaction(q.prefers) === "lease").length;
  if (a.priority.length) observations.push({
    label: "HIGH-INTENT PIPELINE",
    title: buyers > lessees ? "Priority investors lean toward buying." : lessees > buyers ? "Priority investors lean toward leasing." : "Priority investors show balanced transaction demand.",
    body: `${buyers} buyers and ${lessees} lease prospects are ready to move, qualified, or negotiating. Prioritize a tailored shortlist and follow-up.`,
    href: "/admin/inquiries?priority=1",
    tone: "green"
  });
  if (a.noMatch.length) observations.push({
    label: "FOLLOW-UP OPPORTUNITY",
    title: `${a.noMatch.length} open inquiries need a different approach.`,
    body: "No currently available parcel meets all supplied preferences and budget. Explore alternatives or clarify the investor’s flexibility.",
    href: "/admin/inquiries?unmatched=1",
    tone: "gold"
  });
  if (!observations.length) observations.push({
    label: "READY FOR OPPORTUNITY",
    title: "Your next business signal starts with an inquiry.",
    body: "As inventory and investor demand develop, observations and matching opportunities will appear here.",
    href: "/admin/inquiries",
    tone: "green"
  });
  return observations;
}
export const currency = (value: number | null) => value === null ? "Not provided" : `SAR ${new Intl.NumberFormat("en-SA", {
  maximumFractionDigits: 0
}).format(value)}`;
export const compact = (value: number | null) => value === null ? "—" : value >= 1000000 ? `${Number((value / 1000000).toFixed(1))}M` : new Intl.NumberFormat("en-SA", {
  notation: "compact",
  maximumFractionDigits: 1
}).format(value);
export const inquiryHref = (s: {
  area: string;
  type?: string;
  listing?: string;
}) => `/admin/inquiries?${new URLSearchParams({
  area: s.area,
  ...(s.type ? {
    type: s.type
  } : {}),
  ...(s.listing ? {
    listing: s.listing
  } : {}),
  open: "1"
})}`;
