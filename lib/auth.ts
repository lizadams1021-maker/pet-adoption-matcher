"use server";

import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "cambia-esto";
const ACCESS_EXP = "15m";
const REFRESH_EXP_DAYS = 30;
const COOKIE_NAME = "refresh_token";

// --- Tokens ---

export async function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

export async function verifyAccessToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

// --- Refresh Tokens ---

export async function createRefreshToken(userId: string) {
  const plain = crypto.randomBytes(64).toString("hex");
  const expires = new Date(Date.now() + REFRESH_EXP_DAYS * 86400000);

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${plain}, ${expires})
  `;
  return plain;
}

export async function rotateRefreshToken(oldPlain: string) {
  const tokens = await sql`
    SELECT id, user_id, token_hash, expires_at
    FROM refresh_tokens
    WHERE expires_at > now()
  `;

  for (const t of tokens) {
    if (t.token_hash === oldPlain) {
      await sql`DELETE FROM refresh_tokens WHERE id = ${t.id}`;
      const newPlain = await createRefreshToken(t.user_id);
      return { userId: t.user_id, newPlain };
    }
  }
  return null;
}

// --- Cookies ---

export async function setRefreshCookie(tokenPlain: string) {
  const cookieStore = await cookies(); // ✅ await aquí
  cookieStore.set({
    name: "refresh_token",
    value: tokenPlain,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 3600,
    path: "/",
  });
}

export async function clearRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("refresh_token");
}


export async function refreshAccess() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (typeof window !== "undefined") {
    sessionStorage.setItem("accessToken", data.accessToken);
  }
  return data.accessToken;
}
