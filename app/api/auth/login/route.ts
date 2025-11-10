import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, createRefreshToken, setRefreshCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const users = await sql`
      SELECT id, email, name, image_url, password_hash,
             location, housing_type, has_children,
             experience_level, activity_level,
             preferred_pet_size, preferred_temperament
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate tokens
    const accessToken = await signAccessToken({ sub: user.id, email: user.email, name: user.name });
    const refreshToken = await createRefreshToken(user.id);
    await setRefreshCookie(refreshToken);

    const response = NextResponse.json({
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
      accessToken,
    });

    return response;
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
