import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const users = await sql`
      SELECT id, email, name, location, housing_type, has_children,
             experience_level, activity_level, preferred_pet_size, preferred_temperament,
             image_url, password_hash
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];

    // Comparar contraseña con hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.image_url,
        preferences: {
          location: user.location,
          housingType: user.housing_type,
          hasChildren: user.has_children,
          experienceLevel: user.experience_level,
          activityLevel: user.activity_level,
          petSizePreference: user.preferred_pet_size,
          temperamentPreference: user.preferred_temperament || [],
        },
      },
    });
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
