import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/mock-data";
import type { MatchScore } from "@/lib/matching-algorithm";

interface PetCardProps {
  pet: Pet;
  matchScore: MatchScore;
}

export function PetCard({ pet, matchScore }: PetCardProps) {
  return (
    <Link href={`/pet/${pet.id}`}>
      <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-muted">
          <Image
            src={pet.image_url || "/placeholder.svg"}
            alt={pet.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-bold">
              {matchScore.score}% Match
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold mb-1">{pet.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {pet.breed} • {pet.age} {pet.age === 1 ? "yr" : "yrs"} •{" "}
            {pet.gender}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {pet.temperament.slice(0, 3).map((trait) => (
              <Badge
                key={trait}
                variant="secondary"
                className="text-xs capitalize"
              >
                {trait}
              </Badge>
            ))}
            {pet.temperament.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{pet.temperament.length - 3}
              </Badge>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy:</span>
              <span className="font-medium capitalize">{pet.energyLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium capitalize">{pet.size}</span>
            </div>
          </div>

          <Button className="w-full mt-4 bg-transparent" variant="outline">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
