import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createRefreshToken, signAccessToken, setRefreshCookie } from "@/lib/auth";
import { validatePassword } from "@/lib/password-policy";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const passwordIssues = validatePassword(password);
  if (passwordIssues.length) {
    return NextResponse.json({ error: passwordIssues }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length) return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `user-${Date.now()}`;

  await sql`
    INSERT INTO users (id, email, password_hash, name, has_children)
    VALUES (${userId}, ${email}, ${passwordHash}, ${name}, false)
  `;

  // ✅ Create refresh token
  const refreshToken = await createRefreshToken(userId);
  await setRefreshCookie(refreshToken);

  // ✅ Create access token
  const accessToken = await signAccessToken({ sub: userId });

  return NextResponse.json({
    user: { id: userId, email, name },
    accessToken,
  });
}
