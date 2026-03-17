import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const next = String(form.get("next") ?? "/admin") || "/admin";

  const expected = process.env.ADMIN_PAGE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PAGE_TOKEN is not configured on frontend." },
      { status: 500 },
    );
  }

  if (token !== expected) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }

  const jar = await cookies();
  jar.set("vibe_admin", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(new URL(next, req.url));
}

