import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Verificar si ya existe el usuario
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Generar hash seguro de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userId = `user-${Date.now()}`;

    await sql`
      INSERT INTO users (id, email, password_hash, name, has_children)
      VALUES (${userId}, ${email}, ${passwordHash}, ${name}, false)
    `;

    const user = {
      id: userId,
      email,
      name,
      imageUrl: null,
      preferences: {
        location: null,
        housingType: null,
        hasChildren: false,
        experienceLevel: null,
        activityLevel: null,
        petSizePreference: null,
        temperamentPreference: [],
      },
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[v0] Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
