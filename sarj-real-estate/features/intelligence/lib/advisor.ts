import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
import { analyze, insights, lower } from "./analytics";
export const adminPrompts = ["Which areas have the highest demand?", "Which available parcels have been on the market longest?", "Show investors looking for commercial land in East Riyadh.", "Which inquiries currently have no good parcel match?", "What should leadership pay attention to this week?"];
export function adminAnswer(question: string, parcels: Parcel[], inquiries: Inquiry[]) {
  const a = analyze(parcels, inquiries);
  const raw = lower(question);
  const q = /أطول|الأطول|الأقدم/.test(raw) ? "oldest" : /مطابق|مناسب/.test(raw)&&/استفسار|طلبات/.test(raw) ? "no match" : /شرق/.test(raw)&&/تجاري/.test(raw) ? "east commercial" : /أعلى|المناطق/.test(raw) ? "highest" : raw;
  if (q.includes("longest") || q.includes("oldest")) return {
    text: a.oldest.length ? `The oldest available listing is ${a.oldest[0].district_en} (${a.oldest[0].parcel_id}), at ${a.oldest[0].days_on_market} reported days on market. Review the shortlist below and its matching open inquiries.` : "There are no available parcels to review.",
    parcels: a.oldest,
    inquiries: [],
    links: []
  };
  if (q.includes("no good") || q.includes("no match")) return {
    text: `${a.noMatch.length} of ${a.open.length} open inquiries have no available parcel meeting all stated type, area, transaction, and budget requirements. Missing budgets need follow-up; unknown parcel prices cannot be treated as confirmed budget matches.`,
    parcels: [],
    inquiries: a.noMatch.slice(0, 5),
    links: [{
      label: "Review all unmatched inquiries",
      href: "/admin/inquiries?unmatched=1"
    }]
  };
  if (q.includes("east") && q.includes("commercial")) {
    const rows = a.open.filter(i => lower(i.area_of_city_wanted) === "east" && lower(i.land_type_wanted) === "commercial");
    return {
      text: `${rows.length} open investors are looking for commercial land in East Riyadh. Start with their preferred transaction and budget before proposing a parcel.`,
      parcels: [],
      inquiries: rows.slice(0, 5),
      links: [{
        label: "Inspect this demand",
        href: "/admin/inquiries?area=East&type=commercial&open=1"
      }]
    };
  }
  if (q.includes("highest") || q.includes("areas")) {
    const ranked = [...a.areaDemand].sort((x, y) => y.demand - x.demand);
    return {
      text: ranked.filter(x => x.demand).map(x => `${x.label} Riyadh: ${x.demand} open inquiries and ${x.supply} available parcels.`).join("\n") || "No open area-specific investor demand has been recorded yet.",
      parcels: [],
      inquiries: [],
      links: [{
        label: "Understand demand vs inventory",
        href: "/admin/demand"
      }]
    };
  }
  return {
    text: insights(parcels, inquiries).slice(0, 3).map(i => `${i.title} ${i.body}`).join("\n\n") + "\n\nThese observations use the current loaded records across all dates; they are not a measured week-over-week change.",
    parcels: [],
    inquiries: [],
    links: [{
      label: "Open business insights",
      href: "/admin/insights"
    }]
  };
}
