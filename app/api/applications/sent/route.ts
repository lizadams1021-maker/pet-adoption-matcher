import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const applications = await sql`
      SELECT 
        upa.id,
        upa.created_at AS applied_at,
        p.id AS pet_id,
        p.name AS pet_name,
        p.type AS pet_type,
        p.image_url AS pet_image,
        p.status AS pet_status,
        p.breed AS pet_breed,
        p.age_group AS pet_age_group
      FROM user_pet_applications upa
      JOIN pets p ON upa.pet_id = p.id
      WHERE upa.user_id = ${userId}
      ORDER BY upa.created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[API] Fetch sent applications error:", error)
    return NextResponse.json({ error: "Failed to fetch sent applications" }, { status: 500 })
  }
}
