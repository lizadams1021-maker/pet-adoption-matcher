"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function PetDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/pets/${params.id}`)

        if (response.ok) {
          const data = await response.json()
          setPet(data.pet)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch pet")
        }
      } catch (error) {
        console.error("Error fetching pet:", error)
        setError("An error occurred while fetching the pet")
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [user, params.id, router])

  if (!user || loading) {
    return null
  }

  if (error || !pet) {
    return (
      <AppLayout>
        <div className="max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12 bg-card rounded-lg border">
            <h2 className="text-2xl font-semibold mb-2">Pet Not Found</h2>
            <p className="text-muted-foreground mb-6">The pet you're looking for doesn't exist or has been removed.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/my-pets")}>View My Pets</Button>
              <Button variant="outline" onClick={() => router.push("/add-pet")}>
                Add New Pet
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="relative h-96 bg-muted">
            <Image src={pet.image_url || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{pet.name}</h1>
                <p className="text-xl text-muted-foreground">
                  {pet.breed} • {pet.age_group} • {pet.type}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">{pet.status}</Badge>
            </div>

            <div className="space-y-6">
              {pet.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">About {pet.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-3">Characteristics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium capitalize">{pet.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight Range</p>
                    <p className="font-medium capitalize">{pet.weight_range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Level</p>
                    <p className="font-medium capitalize">{pet.energy_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age Group</p>
                    <p className="font-medium capitalize">{pet.age_group}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Good with Children</p>
                    <p className="font-medium">{pet.good_with_children ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Good with Other Pets</p>
                    <p className="font-medium">{pet.good_with_pets ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">House Trained</p>
                    <p className="font-medium">{pet.house_trained ? "Yes" : "No"}</p>
                  </div>
                  {pet.special_needs && (
                    <div>
                      <p className="text-sm text-muted-foreground">Special Needs</p>
                      <p className="font-medium">{pet.special_needs}</p>
                    </div>
                  )}
                </div>
              </div>

              {pet.temperament && pet.temperament.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Temperament</h2>
                  <div className="flex flex-wrap gap-2">
                    {pet.temperament.map((trait: string) => (
                      <Badge key={trait} variant="secondary" className="capitalize">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
