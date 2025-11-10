import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const offset = (page - 1) * limit;

    if (!petId) {
      return NextResponse.json({ error: "Pet ID required" }, { status: 400 });
    }

    const applications = await sql`
      SELECT 
        upa.id,
        upa.created_at AS applied_at,
        upa.status,
        u.*
      FROM user_pet_applications upa
      JOIN users u ON upa.user_id = u.id
      WHERE upa.pet_id = ${petId}
      ORDER BY upa.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;


    const [{ count }] =
      await sql`SELECT COUNT(*)::int AS count FROM user_pet_applications WHERE pet_id = ${petId}`;

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      applications,
      total: count,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("[v0] Fetch applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
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

export async function DELETE(request: NextRequest) {
  try {
    const { userId, petId } = await request.json()

    if (!userId || !petId) {
      return NextResponse.json({ error: "User ID and Pet ID required" }, { status: 400 })
    }

    await sql`
      DELETE FROM user_pet_applications
      WHERE user_id = ${userId} AND pet_id = ${petId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete application error:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}

