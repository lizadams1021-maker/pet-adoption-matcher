import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json()

    await sql`
      UPDATE users 
      SET 
        location = ${preferences.location},
        housing_type = ${preferences.housingType},
        has_children = ${preferences.hasChildren},
        experience_level = ${preferences.experienceLevel},
        activity_level = ${preferences.activityLevel},
        preferred_pet_size = ${preferences.petSizePreference},
        preferred_temperament = ${preferences.temperamentPreference},
        updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update preferences error:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
