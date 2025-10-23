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
        a.id, a.match_rank, a.compatibility_score, a.status, a.applied_at,
        ad.id as adopter_id, ad.name, ad.email, ad.location, ad.distance_miles,
        ad.housing_type, ad.has_yard, ad.experience_level, ad.experience_description,
        ad.family_adults, ad.family_children, ad.verified, ad.image_url
      FROM applications a
      JOIN adopters ad ON a.adopter_id = ad.id
      WHERE a.pet_id = ${petId}
      ORDER BY a.match_rank ASC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[v0] Fetch applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
