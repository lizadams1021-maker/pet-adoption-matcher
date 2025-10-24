import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const petId = searchParams.get("petId")

    if (!userId || !petId) {
      return NextResponse.json({ error: "User ID and Pet ID required" }, { status: 400 })
    }

    const result = await sql`
      SELECT id FROM user_pet_applications
      WHERE user_id = ${userId} AND pet_id = ${petId}
      LIMIT 1
    `

    return NextResponse.json({ hasApplied: result.length > 0 })
  } catch (error) {
    console.error("[v0] Check application error:", error)
    return NextResponse.json({ error: "Failed to check application" }, { status: 500 })
  }
}