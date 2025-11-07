import { NextResponse } from "next/server";
import { clearRefreshCookie } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie");
  if (cookie?.includes("refresh_token=")) {
    const token = cookie.split("refresh_token=")[1]?.split(";")[0];
    await sql`DELETE FROM refresh_tokens WHERE token_hash = ${token}`;
  }
  clearRefreshCookie();
  return NextResponse.json({ ok: true });
}
