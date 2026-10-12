import { NextRequest, NextResponse } from "next/server";
async function proxy(request: NextRequest, context: {
  params: Promise<{
    path: string[];
  }>;
}) {
  const {
    path
  } = await context.params;
  const read = request.method === "GET" && ["parcels", "inquiries"].includes(path[0]) && path.length === 1;
  const record = ["parcels", "inquiries"].includes(path[0]) && path.length === 2;
  const write = request.method === "PATCH" && record;
  const create = request.method === "POST" && path[0] === "parcels" && path.length === 1;
  const remove = request.method === "DELETE" && record;
  if (!read && !write && !remove && !create) return NextResponse.json({
    detail: "Endpoint not found"
  }, {
    status: 404
  });
  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  try {
    let body: string | undefined;
    if (write || create) {
      let input;
      try { input = await request.json(); } catch { return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 }); }
      const fields = path[0] === "parcels"
        ? ["district_en", "district_ar", "area_of_city", "land_type", "listing_type", "price_basis", "area_sqm", "price_per_sqm_sar", "total_price_sar", "street_width_m", "status", "listed_date", "days_on_market", "lat", "lng"]
        : ["date", "investor_name", "phone", "wants_to", "land_type_wanted", "area_of_city_wanted", "prefers", "budget_sar", "budget_basis", "intent", "channel", "status", "selected_parcel_id"];
      if (create) fields.push("parcel_id");
      if (!input || typeof input !== "object" || Array.isArray(input) || !Object.keys(input).length || Object.keys(input).some(key => !fields.includes(key))) {
        return NextResponse.json({ detail: "Choose valid editable record fields." }, { status: 400 });
      }
      if (path[0] === "inquiries" && "status" in input && !["new", "contacted", "qualified", "negotiating", "closed", "won", "lost"].includes(input.status)) {
        return NextResponse.json({ detail: "Choose a valid inquiry status." }, { status: 400 });
      }
      body = JSON.stringify(input);
    }
    const response = await fetch(`${base}/${path.map(encodeURIComponent).join("/")}${read || create ? "/" : ""}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      ...(body ? {
        body
      } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });
    if (response.status >= 500) return NextResponse.json({
      detail: "Sarj data is temporarily unavailable. Please retry."
    }, {
      status: 503
    });
    return new NextResponse(response.status === 204 ? null : await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({
      detail: "Couldn’t reach the Sarj backend. Please retry."
    }, {
      status: 503
    });
  }
}
export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const POST = proxy;
