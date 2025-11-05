"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMatchesForUser } from "@/lib/matching-algorithm";
import { AppLayout } from "@/components/app-layout";
import { PetCard } from "@/components/pet-card";
import Swal from "sweetalert2";

export default function MatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedPets, setAppliedPets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchPets = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/pets?excludeOwnerId=${user.id}`);
        const data = await res.json();

        console.log("Pets", data.pets);
        if (res.ok) {
          const matchedPets = getMatchesForUser(user, data.pets);
          setMatches(matchedPets);

          const petIds = matchedPets.map((p) => p.id);
          const appliedSet = new Set<string>();

          for (const petId of petIds) {
            const checkRes = await fetch(
              `/api/applications/check?userId=${user.id}&petId=${petId}`
            );
            const checkData = await checkRes.json();
            if (checkData.hasApplied) {
              appliedSet.add(petId);
            }
          }

          setAppliedPets(appliedSet);
        } else {
          console.error("Error fetching pets:", data.error);
          setError(data.error || "Failed to fetch pets");
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("An error occurred while fetching pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [user, router]);

  const handleApply = async (
    petId: string,
    petName: string,
    owner_name: string
  ) => {
    if (!user) return;

    try {
      const hasApplied = appliedPets.has(petId);

      if (hasApplied) {
        const res = await fetch("/api/applications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, petId }),
        });

        if (!res.ok) throw new Error("Failed to delete application");

        Swal.fire({
          title: "Application Withdrawn",
          html: `You have withdrawn your application for <strong>${petName}</strong>. You can always apply again later if you change your mind.`,
          icon: undefined,
          confirmButtonText: "OK",
        });

        // Actualizar el estado local
        const updated = new Set(appliedPets);
        updated.delete(petId);
        setAppliedPets(updated);
      } else {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, petId }),
        });

        if (res.ok) {
          setAppliedPets((prev) => new Set(prev).add(petId));

          // SweetAlert message when application is successful
          Swal.fire({
            title: "Application Submitted!",
            html: `
            Thanks for showing interest in <strong>${petName}</strong>. 
            We shared your interest, details, and match criteria with <strong>${owner_name}</strong>. 
            We hope it’s a perfect match.<br><br>
            There are still so many pets that are looking for good homes. 
            We encourage you to keep looking while you wait to hear from <strong>${owner_name}</strong>
            in case there’s an even better pet out there for you!
          `,
            icon: "success",
            confirmButtonText: "OK",
            width: 600,
            padding: "2em",
          });
        }
      }
    } catch (error) {
      console.error("[v0] Apply error:", error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-red-500">{error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Pet Matches</h1>
          <p className="text-muted-foreground">
            Pets are ranked by compatibility based on your preferences. Higher
            scores mean better matches!
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No matches found. Try updating your preferences.
            </p>
            <button
              onClick={() => router.push("/profile")}
              className="text-primary hover:underline"
            >
              Update Preferences
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                matchScore={pet.matchScore}
                hasApplied={appliedPets.has(pet.id)}
                onApply={() => handleApply(pet.id, pet.name, pet.owner_name)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
