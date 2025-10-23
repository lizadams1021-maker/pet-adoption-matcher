"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { mockPets, mockAdopters } from "@/lib/mock-data"
import { AppLayout } from "@/components/app-layout"
import { Users, Heart, TrendingUp } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Briefcase, UsersIcon, Check } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPet, setSelectedPet] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (mockPets.length > 0) {
      setSelectedPet(mockPets[0])
    }
  }, [user, router])

  if (!user) {
    return null
  }

  // Calculate stats
  const activePets = mockPets.length
  const newMatches = 8
  const thisWeek = 23

  const petMatchCounts: Record<string, { matches: number; pending: number }> = {
    "1": { matches: 2, pending: 1 },
    "2": { matches: 1, pending: 1 },
    "3": { matches: 3, pending: 2 },
    "4": { matches: 2, pending: 1 },
    "5": { matches: 2, pending: 1 },
  }

  const filteredAdopters = selectedPet
    ? mockAdopters
        .filter((adopter) => adopter.petIds.includes(selectedPet.id))
        .sort((a, b) => a.matchRank - b.matchRank)
    : []

  return (
    <AppLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Paws & Claws Rescue! 👋</h1>
          <p className="text-muted-foreground">Manage your pets and review adoption applications</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{activePets}</p>
                <p className="text-sm text-muted-foreground">Active Pets</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{newMatches}</p>
                <p className="text-sm text-muted-foreground">New Matches</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Column - My Pets */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">MY PETS</h2>
            <div className="space-y-4">
              {mockPets.map((pet) => {
                const counts = petMatchCounts[pet.id] || { matches: 0, pending: 0 }
                const isSelected = selectedPet?.id === pet.id
                return (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">{pet.breed}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {counts.matches} matches • {counts.pending} pending
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column - Matched Adopters */}
          <div>
            {selectedPet && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Matched Adopters for {selectedPet.name}</h2>
                </div>
                <div className="mb-4 text-sm text-muted-foreground">
                  <span className="font-medium">{selectedPet.breed}</span> • {selectedPet.age} years •{" "}
                  <span className="text-green-600 font-medium">Available</span> •{" "}
                  <span className="font-medium">{filteredAdopters.length} matches</span>
                </div>

                {filteredAdopters.length > 0 ? (
                  <div className="space-y-6">
                    {filteredAdopters.map((adopter) => (
                      <div key={adopter.id} className="bg-card rounded-lg border p-6">
                        {/* Adopter Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={adopter.imageUrl || "/placeholder.svg"}
                                alt={adopter.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  #{adopter.matchRank} Match
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg">{adopter.name}</h3>
                              {adopter.verified && (
                                <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 text-xs">
                                  ✓ Verified Adopter
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                              {adopter.matchScore}%
                            </div>
                          </div>
                        </div>

                        {/* Adopter Details Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Location</p>
                                <p className="font-medium">{adopter.location}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-start gap-2 text-sm">
                              <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Housing</p>
                                <p className="font-medium">{adopter.housing}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-start gap-2 text-sm">
                              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Experience</p>
                                <p className="font-medium">{adopter.experience}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-start gap-2 text-sm">
                              <UsersIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Family</p>
                                <p className="font-medium">{adopter.family}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Why This Match Works */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            ✨ Why This Match Works
                          </h4>
                          <div className="space-y-2">
                            {adopter.whyMatch.map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Application Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                          <span>
                            Applied {adopter.appliedDate} • {adopter.daysAgo} days ago
                          </span>
                          <Badge variant="outline">{adopter.status}</Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button className="w-full bg-primary hover:bg-primary/90">Review Full Application</Button>
                          <Button variant="outline" className="w-full bg-transparent">
                            Contact Adopter
                          </Button>
                          <Button variant="outline" className="w-full bg-transparent">
                            Schedule Visit
                          </Button>
                          <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No adopters have applied for {selectedPet.name} yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
