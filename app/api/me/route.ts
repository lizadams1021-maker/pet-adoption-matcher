// app/api/me/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const payload: any = await verifyAccessToken(token);

    // Traer todos los campos del usuario desde la DB
    const users = await sql`
      SELECT *
      FROM users
      WHERE id = ${payload.sub}
    `;

    if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = users[0];

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
