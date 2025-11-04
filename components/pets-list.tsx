import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const pets = [
  {
    name: "Max",
    breed: "German Shepherd Mix",
    image: "/german-shepherd.png",
    matches: 8,
    pending: 3,
  },
  {
    name: "Luna",
    breed: "Domestic Shorthair",
    image: "/orange-tabby-cat.png",
    matches: 5,
    pending: 2,
  },
  {
    name: "Buddy",
    breed: "Labrador Retriever",
    image: "/yellow-labrador-dog-park.jpg",
    matches: 2,
    pending: 0,
  },
  {
    name: "Whiskers",
    breed: "Maine Coon",
    image: "/maine-coon-cat-eating.jpg",
    matches: 4,
    pending: 1,
  },
]

export function PetsList() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">MY PETS</h2>
      <div className="space-y-3">
        {pets.map((pet, index) => (
          <Card
            key={index}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${index === 0 ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-xl">
                <AvatarImage src={pet.image || "/placeholder.svg"} className="object-cover" />
                <AvatarFallback>{pet.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">{pet.breed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pet.matches} matches • {pet.pending} pending
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
