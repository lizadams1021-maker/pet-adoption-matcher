import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Home, Briefcase, Users, Check, Sparkles, PawPrint } from "lucide-react"

const adopters = [
  {
    rank: 1,
    name: "Sarah Johnson",
    image: "/professional-woman-smiling.png",
    matchScore: 90,
    verified: true,
    location: "Austin, TX (0 mi)",
    housing: "House with fenced yard",
    experience: "10+ years with large dogs",
    family: "2 adults, no children",
    reasons: [
      "Very close proximity - can visit anytime",
      "Has required experience with large breeds",
      "Active lifestyle matches Max's energy needs",
      "Proven track record - adopted before successfully",
    ],
    appliedDate: "Oct 10, 2025",
    daysAgo: "5 days ago",
    status: "Pending Review",
  },
  {
    rank: 2,
    name: "Alicia Smith",
    image: "/professional-woman-headshot.png",
    matchScore: 75,
    verified: true,
    location: "Austin, TX (3 mi)",
    housing: "House with yard",
    experience: "5+ years with dogs",
    family: "1 adult, 1 child",
    reasons: [],
    appliedDate: "Oct 12, 2025",
    daysAgo: "3 days ago",
    status: "Pending Review",
  },
]

export function MatchedAdopters() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Matched Adopters for Max</h2>
          <p className="text-sm text-muted-foreground">
            German Shepherd Mix • 3 years • <span className="text-green-600 font-medium">Available</span> • ✨ 3 new
            matches today
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {adopters.map((adopter, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={adopter.image || "/placeholder.svg"} />
                    <AvatarFallback>
                      {adopter.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-medium">
                        #{adopter.rank} Match
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{adopter.name}</h3>
                    {adopter.verified && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                          ✓ Verified Adopter
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-green-500 text-white font-bold text-lg">
                    {adopter.matchScore}%
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-sm text-foreground pl-6">{adopter.location}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Housing</span>
                  </div>
                  <p className="text-sm text-foreground pl-6">{adopter.housing}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Experience</span>
                  </div>
                  <p className="text-sm text-foreground pl-6">{adopter.experience}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Family</span>
                  </div>
                  <p className="text-sm text-foreground pl-6">{adopter.family}</p>
                </div>
              </div>

              {/* Why This Match Works */}
              {adopter.reasons.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="w-4 h-4" />
                    Why This Match Works
                  </div>
                  <div className="space-y-2">
                    {adopter.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Applied {adopter.appliedDate} • {adopter.daysAgo}
                  <span className="ml-4 font-medium text-foreground">{adopter.status}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Review Full Application
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Adopter
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Schedule Visit
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive bg-transparent">
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
