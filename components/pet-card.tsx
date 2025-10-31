"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/mock-data";
import type { MatchScore } from "@/lib/matching-algorithm";

interface PetCardProps {
  pet: Pet;
  matchScore: MatchScore;
  hasApplied?: boolean;
  onApply?: () => void;
}

export function PetCard({
  pet,
  matchScore,
  hasApplied = false,
  onApply,
}: PetCardProps) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/pet/${pet.id}`}>
        <div className="relative h-48 bg-muted cursor-pointer">
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
      </Link>

      <div className="p-4">
        <Link href={`/pet/${pet.id}`}>
          <h3 className="text-xl font-bold mb-1 cursor-pointer hover:text-primary">
            {pet.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">
          {pet.breed} • {pet.age} {pet.age === 1 ? "yr" : "yrs"} • {pet.gender}
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

        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Energy:</span>
            <span className="font-medium capitalize">{pet.energyLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium capitalize">{pet.size}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href={`/pet/${pet.id}`} className="w-full">
            <Button className="w-full bg-transparent" variant="outline">
              View Details
            </Button>
          </Link>

          {hasApplied ? (
            <div className="flex items-center justify-center px-3 py-2 bg-green-50 border border-green-200 rounded-md">
              <span className="text-sm font-medium text-green-700">
                ✓ Applied
              </span>
            </div>
          ) : (
            <Button
              onClick={(e) => {
                e.preventDefault();
                onApply?.();
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
