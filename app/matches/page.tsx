"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { mockPets } from "@/lib/mock-data"
import { getMatchesForUser } from "@/lib/matching-algorithm"
import { AppLayout } from "@/components/app-layout"
import { PetCard } from "@/components/pet-card"

export default function MatchesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const matchedPets = getMatchesForUser(user, mockPets)
    setMatches(matchedPets)
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Pet Matches</h1>
          <p className="text-muted-foreground">
            Pets are ranked by compatibility based on your preferences. Higher scores mean better matches!
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No matches found. Try updating your preferences.</p>
            <button onClick={() => router.push("/profile")} className="text-primary hover:underline">
              Update Preferences
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((pet) => (
              <PetCard key={pet.id} pet={pet} matchScore={pet.matchScore} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
