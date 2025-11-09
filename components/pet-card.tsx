"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateCompatibility,
  type MatchScore,
} from "@/lib/matching-algorithm";
import { useEffect, useMemo, useState } from "react";

interface PetCardProps {
  user: any;
  pet: any;
  matchScore: MatchScore;
  hasApplied?: boolean;
  onApply?: () => void;
  loading: boolean;
  loadingApplied: boolean;
}

export function PetCard({
  user,
  pet,
  matchScore,
  hasApplied = false,
  onApply,
  loading,
  loadingApplied,
}: PetCardProps) {
  const [fullPet, setFullPet] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  // Full pet info fetch
  useEffect(() => {
    if (!pet?.id) return;

    let isCancelled = false; // para evitar actualizar estado si se desmonta

    const fetchAndCalculateMatch = async () => {
      setLoadingMatch(true);

      // fetch del pet completo
      try {
        const res = await fetch(`/api/pets/${pet.id}`);
        const data = await res.json();
        if (!res.ok || !data.pet) {
          console.error("Error fetching pet:", data.error);
          return;
        }

        if (!isCancelled) {
          setFullPet(data.pet);

          // calcular compatibilidad
          const matchResult = calculateCompatibility(user, data.pet);
          setMatch(matchResult);
        }
      } catch (err) {
        console.error("Error fetching or calculating match:", err);
      } finally {
        if (!isCancelled) setLoadingMatch(false);
      }
    };

    fetchAndCalculateMatch();

    return () => {
      isCancelled = true;
    };
  }, [pet?.id, user]);

  return (
    <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/pet/${pet.id}`}>
        <div className="relative h-48 bg-muted cursor-pointer flex items-center justify-center">
          {loadingMatch ? (
            <div className="w-12 h-12 border-4 rounded-full animate-spin border-t-transparent border-white"></div>
          ) : (
            <Image
              src={fullPet?.image_url || "/placeholder.svg"}
              alt={pet.name}
              fill
              className="object-cover"
            />
          )}

          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-bold">
              {loadingMatch ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin border-t-transparent border-white"></div>
              ) : (
                `${match?.score ?? 0}% Match`
              )}
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
            <span className="font-medium capitalize">{pet.energy_level}</span>
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

          <Button
            onClick={(e) => {
              e.preventDefault();
              onApply?.();
            }}
            className={`w-full ${
              hasApplied
                ? "text-green-700 flex items-center justify-center px-3 py-2 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                : "bg-primary hover:bg-primary/90"
            }`}
            disabled={loading || loadingApplied} // deshabilitado mientras cargue applied o se aplique
          >
            {loadingApplied ? (
              // Spinner mientras se revisa applied
              <div
                className={`w-5 h-5 border-2 rounded-full animate-spin border-t-transparent ${
                  hasApplied
                    ? "border-green-700 border-l-green-700 border-b-green-700 border-r-green-700"
                    : "border-white"
                }`}
              ></div>
            ) : loading ? (
              // Spinner mientras se aplica
              <div
                className={`w-5 h-5 border-2 rounded-full animate-spin border-t-transparent ${
                  hasApplied
                    ? "border-green-700 border-l-green-700 border-b-green-700 border-r-green-700"
                    : "border-white"
                }`}
              ></div>
            ) : hasApplied ? (
              <span className="text-green-700 font-medium">✓ Applied</span>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
