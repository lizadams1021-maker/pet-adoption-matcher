"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AppLayout } from "@/components/app-layout"

export default function ProfilePage() {
  const { user, updatePreferences, logout } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  const [experienceLevel, setExperienceLevel] = useState<"first-time" | "experienced" | "expert">("first-time")
  const [housingType, setHousingType] = useState<"apartment" | "house-no-yard" | "house-with-yard" | "farm">(
    "apartment",
  )
  const [hasChildren, setHasChildren] = useState(false)
  const [activityLevel, setActivityLevel] = useState<"low" | "moderate" | "high">("moderate")
  const [petSizePreference, setPetSizePreference] = useState<"small" | "medium" | "large" | "any">("any")
  const [temperamentPreferences, setTemperamentPreferences] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setExperienceLevel(user.preferences.experienceLevel)
    setHousingType(user.preferences.housingType)
    setHasChildren(user.preferences.hasChildren)
    setActivityLevel(user.preferences.activityLevel)
    setPetSizePreference(user.preferences.petSizePreference)
    setTemperamentPreferences(user.preferences.temperamentPreference)
  }, [user, router])

  const handleSave = () => {
    updatePreferences({
      experienceLevel,
      housingType,
      hasChildren,
      activityLevel,
      petSizePreference,
      temperamentPreference: temperamentPreferences,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTemperamentToggle = (temperament: string) => {
    setTemperamentPreferences((prev) =>
      prev.includes(temperament) ? prev.filter((t) => t !== temperament) : [...prev, temperament],
    )
  }

  const temperamentOptions = [
    "friendly",
    "energetic",
    "playful",
    "calm",
    "independent",
    "affectionate",
    "loyal",
    "protective",
    "intelligent",
    "gentle",
    "sociable",
    "quiet",
  ]

  if (!user) {
    return null
  }

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Update your preferences to get better pet matches tailored to your lifestyle
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-6">
            <h2 className="text-xl font-semibold">Adoption Preferences</h2>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={experienceLevel} onValueChange={(v: any) => setExperienceLevel(v)}>
                <SelectTrigger id="experience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-time">First-time pet owner</SelectItem>
                  <SelectItem value="experienced">Experienced pet owner</SelectItem>
                  <SelectItem value="expert">Expert / Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="housing">Housing Type</Label>
              <Select value={housingType} onValueChange={(v: any) => setHousingType(v)}>
                <SelectTrigger id="housing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house-no-yard">House without yard</SelectItem>
                  <SelectItem value="house-with-yard">House with yard</SelectItem>
                  <SelectItem value="farm">Farm / Large property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select value={activityLevel} onValueChange={(v: any) => setActivityLevel(v)}>
                <SelectTrigger id="activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Prefer relaxed activities</SelectItem>
                  <SelectItem value="moderate">Moderate - Balanced lifestyle</SelectItem>
                  <SelectItem value="high">High - Very active lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Pet Size Preference</Label>
              <Select value={petSizePreference} onValueChange={(v: any) => setPetSizePreference(v)}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any size</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="children" checked={hasChildren} onCheckedChange={(checked) => setHasChildren(!!checked)} />
              <Label htmlFor="children" className="cursor-pointer">
                I have children at home
              </Label>
            </div>

            <div className="space-y-3">
              <Label>Preferred Temperament (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {temperamentOptions.map((temperament) => (
                  <div key={temperament} className="flex items-center space-x-2">
                    <Checkbox
                      id={temperament}
                      checked={temperamentPreferences.includes(temperament)}
                      onCheckedChange={() => handleTemperamentToggle(temperament)}
                    />
                    <Label htmlFor={temperament} className="cursor-pointer capitalize">
                      {temperament}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {saved ? "Saved!" : "Save Preferences"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/matches")}>
              View Matches
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive">
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
