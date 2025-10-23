import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // In production, use proper password hashing (bcrypt)
    const users = await sql`
      SELECT id, email, name, location, housing_type, has_children, 
             experience_level, activity_level, preferred_pet_size, preferred_temperament
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
