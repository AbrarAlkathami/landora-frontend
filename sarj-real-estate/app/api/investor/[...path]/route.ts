import { NextRequest, NextResponse } from "next/server";

// A narrow same-origin bridge keeps backend configuration server-side and avoids CORS.
async function proxy(request: NextRequest, context: {
  params: Promise<{
    path: string[];
  }>;
}) {
  const {
    path
  } = await context.params;
  const read = request.method === "GET" && path[0] === "parcels" && path.length <= 2;
  const write = request.method === "POST" && (path.join("/") === "inquiries" || path.join("/") === "chat/investor");
  if (!read && !write) return NextResponse.json({
    detail: "Endpoint not found"
  }, {
    status: 404
  });
  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const endpoint = path.map(encodeURIComponent).join("/") + (path.length === 1 ? "/" : "");
  try {
    const response = await fetch(`${base}/${endpoint}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      ...(write ? {
        body: await request.text()
      } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(path[0] === "chat" ? 90000 : 15000)
    });
    if (response.status >= 500) {
      // Log only route and status; upstream bodies may contain sensitive database details.
      console.error("[Sarj investor API] Backend request failed", {
        method: request.method, endpoint: path.join("/"), status: response.status
      });
      return NextResponse.json({
        detail: "The Sarj service is temporarily unavailable. Please try again.",
        code: "BACKEND_ERROR",
        upstream_status: response.status
      }, { status: 503 });
    }
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    console.error("[Sarj investor API] Backend connection failed", {
      method: request.method, endpoint: path.join("/"), reason: timeout ? "timeout" : "unreachable"
    });
    return NextResponse.json({
      detail: "We couldn’t reach Sarj. Please try again shortly.",
      code: timeout ? "BACKEND_TIMEOUT" : "BACKEND_UNREACHABLE"
    }, {
      status: 503
    });
  }
}
export const GET = proxy;
export const POST = proxy;
