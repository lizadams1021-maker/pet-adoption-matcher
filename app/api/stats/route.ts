import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 })
    }

    // Get active pets count
    const activePetsResult = await sql`
      SELECT COUNT(*) as count FROM pets 
      WHERE owner_id = ${ownerId} AND status = 'available'
    `
    const activePets = Number(activePetsResult[0].count)

    // Get new matches count (pets not owned by this user and still available)
    const newMatchesResult = await sql`
      SELECT COUNT(*) AS count
      FROM pets
      WHERE owner_id != ${ownerId} 
        AND status != 'adopted'
    `
    const newMatches = Number(newMatchesResult[0].count)

    // Get pending applications count
    const pendingAppsResult = await sql`
      SELECT COUNT(*) as count
      FROM user_pet_applications upa
      WHERE upa.user_id = ${ownerId} 
    `
    const pendingApps = Number(pendingAppsResult[0].count)

    // Get pets added in the last 7 days not owned by this user
    const thisWeekResult = await sql`
      SELECT COUNT(*) AS count
      FROM pets
      WHERE owner_id != ${ownerId} 
        AND status != 'adopted'
        AND created_at >= NOW() - INTERVAL '7 days'
    `
    const thisWeek = Number(thisWeekResult[0].count)

    return NextResponse.json({
      activePets,
      newMatches,
      pendingApps,
      thisWeek,
    })
  } catch (error) {
    console.error("[v0] Fetch stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
