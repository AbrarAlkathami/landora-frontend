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
  const write = request.method === "PATCH" && path[0] === "inquiries" && path.length === 2;
  if (!read && !write) return NextResponse.json({
    detail: "Endpoint not found"
  }, {
    status: 404
  });
  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  try {
    let body: string | undefined;
    if (write) {
      const input = await request.json();
      if (typeof input.status !== "string" || !["new", "contacted", "qualified", "negotiating", "closed", "won", "lost"].includes(input.status)) return NextResponse.json({
        detail: "Choose a valid inquiry status."
      }, {
        status: 400
      });
      body = JSON.stringify({
        status: input.status
      });
    }
    const response = await fetch(`${base}/${path.map(encodeURIComponent).join("/")}${read ? "/" : ""}${request.nextUrl.search}`, {
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
    return new NextResponse(await response.text(), {
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
