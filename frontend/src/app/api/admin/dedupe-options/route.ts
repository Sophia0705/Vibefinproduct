import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PAGE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PAGE_TOKEN is not configured on frontend." },
      { status: 500 },
    );
  }

  const jar = await cookies();
  const got = jar.get("vibe_admin")?.value;
  if (got !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
  const adminApiToken = process.env.ADMIN_API_TOKEN;
  if (!adminApiToken) {
    return NextResponse.json(
      { error: "ADMIN_API_TOKEN is not configured on frontend." },
      { status: 500 },
    );
  }

  // no request body needed; keep POST for safety
  void req;

  const res = await fetch(`${backendUrl}/admin/stats/deduplicate-options`, {
    method: "GET",
    headers: {
      "x-admin-token": adminApiToken,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

