import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const segments = pathname.split("/"); // ["", "api", "pets", "[id]"]
    const petId = segments[segments.length - 1];

    const result = await sql`
      SELECT * FROM pets 
      WHERE id = ${petId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json({ pet: result[0] });
  } catch (error) {
    console.error("[v0] Fetch pet error:", error);
    return NextResponse.json({ error: "Failed to fetch pet" }, { status: 500 });
  }
}
