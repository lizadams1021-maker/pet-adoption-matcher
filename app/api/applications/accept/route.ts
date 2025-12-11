import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { petId, adopterId } = await request.json();

    if (!petId || !adopterId) {
      return NextResponse.json(
        { error: "Pet ID and Adopter ID required" },
        { status: 400 }
      );
    }

    // 1️⃣ Mark application as accepted
    await sql`
      UPDATE user_pet_applications
      SET status = 'accepted'
      WHERE user_id = ${adopterId} AND pet_id = ${petId}
    `;

    // 2️⃣ Mark pet as in progress while the adoption finalizes
    await sql`
      UPDATE pets
      SET status = 'in progress'
      WHERE id = ${petId}
    `;

    // 3️⃣ Delete other applications for this pet
    await sql`
      DELETE FROM user_pet_applications
      WHERE pet_id = ${petId} AND user_id <> ${adopterId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Accept application error:", error);
    return NextResponse.json(
      { error: "Failed to accept application" },
      { status: 500 }
    );
  }
}
