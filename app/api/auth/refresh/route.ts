"use server";

import { NextResponse } from "next/server";
import { rotateRefreshToken, signAccessToken, setRefreshCookie, clearRefreshCookie } from "@/lib/auth";

export async function POST() {
  const { cookies } = require("next/headers");
  const refreshPlain = cookies().get("refresh_token")?.value;

  if (!refreshPlain) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const data = await rotateRefreshToken(refreshPlain);

  if (!data) {
    clearRefreshCookie();
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const newAccess = signAccessToken({ sub: data.userId });
  setRefreshCookie(data.newPlain);

  return NextResponse.json({ accessToken: newAccess });
}
