// app/api/applications/reject/route.ts
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { petId, adopterId } = await request.json()

    if (!petId || !adopterId) {
      return NextResponse.json(
        { error: "Pet ID and Adopter ID required" },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM user_pet_applications
      WHERE user_id = ${adopterId} AND pet_id = ${petId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reject application error:", error)
    return NextResponse.json(
      { error: "Failed to reject application" },
      { status: 500 }
    )
  }
}
