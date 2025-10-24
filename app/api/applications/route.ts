import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("petId")

    if (!petId) {
      return NextResponse.json({ error: "Pet ID required" }, { status: 400 })
    }

    const applications = await sql`
      SELECT 
        upa.id, upa.created_at as applied_at,
        u.id as user_id, u.name, u.email, u.location, 
        u.housing_type, u.has_children, u.experience_level,
        u.activity_level, u.preferred_pet_size, u.preferred_temperament
      FROM user_pet_applications upa
      JOIN users u ON upa.user_id = u.id
      WHERE upa.pet_id = ${petId}
      ORDER BY upa.created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[v0] Fetch applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, petId } = await request.json()

    if (!userId || !petId) {
      return NextResponse.json({ error: "User ID and Pet ID required" }, { status: 400 })
    }

    const applicationId = `app-${Date.now()}`

    await sql`
      INSERT INTO user_pet_applications (id, user_id, pet_id)
      VALUES (${applicationId}, ${userId}, ${petId})
      ON CONFLICT (user_id, pet_id) DO NOTHING
    `

    return NextResponse.json({ success: true, applicationId })
  } catch (error) {
    console.error("[v0] Create application error:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
