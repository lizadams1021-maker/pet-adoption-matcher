"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { PetCard } from "@/components/pet-card";
import Swal from "sweetalert2";
import { useAuthClient } from "@/lib/useAuthClient";
import { Button } from "@/components/ui/button";

export default function MatchesPage() {
  const { user, loading } = useAuthClient();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingPetId, setLoadingPetId] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingApplied, setLoadingApplied] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedPets, setAppliedPets] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const limit = 6; // pets for every page

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchPets = async (pageToLoad = 0) => {
      try {
        if (pageToLoad === 0) setLoadingInitial(true);
        else setLoadingMore(true);
        const res = await fetch(
          `/api/pets?excludeOwnerId=${user.id}&page=${pageToLoad}&limit=${limit}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch pets");

        const newPets = data.pets || [];

        setMatches(newPets);

        if (data.totalCount) {
          const total = Math.ceil(data.totalCount / limit);
          setTotalPages(total);
        } else {
          setHasMore(newPets.length === limit);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    };

    fetchPets(page);
  }, [user, router, loading, page]);

  // ---------------------------
  // Verify pet application
  // ---------------------------
  useEffect(() => {
    if (!matches.length) return;

    setLoadingApplied(true);

    const checkApplications = async () => {
      try {
        const petIds = matches.map((pet) => pet.id);
        const queryParams = petIds.map((id) => `petId=${id}`).join("&");

        if (user) {
          const res = await fetch(
            `/api/applications/check?userId=${user.id}&${queryParams}`
          );
          const data = await res.json();

          const updatedSet = new Set<string>();
          Object.entries(data).forEach(([petId, hasApplied]) => {
            if (hasApplied) updatedSet.add(petId);
          });

          setAppliedPets(updatedSet);
        } else {
          console.error("[Authentication] User is not logged in:");
          router.push("/login");
        }
      } catch (err) {
        console.error("Error checking applications:", err);
      } finally {
        setLoadingApplied(false);
      }
    };

    checkApplications();
  }, [matches, user]);

  const handleApply = async (
    petId: string,
    petName: string,
    owner_name: string
  ) => {
    if (!user) return;
    setLoadingPetId(petId);

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

        // Update local state
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
    } finally {
      setLoadingPetId(null);
    }
  };

  if (loadingInitial) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
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

        {/* Listado de mascotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingInitial ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No pets found.
            </div>
          ) : (
            matches.map((pet) => (
              <PetCard
                key={pet.id}
                user={user}
                pet={pet}
                matchScore={pet.matchScore}
                hasApplied={appliedPets.has(pet.id)}
                loadingApplied={loadingApplied}
                loading={loadingPetId === pet.id}
                onApply={() => handleApply(pet.id, pet.name, pet.owner_name)}
              />
            ))
          )}
        </div>

        {/* Spinner mientras cambia de página */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Paginador */}
        {!loadingInitial && totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              ← Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page + 1 === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            >
              Next →
            </Button>
          </div>
        )}

        {/* Si no hay más páginas y no está cargando */}
        {!loadingInitial && totalPages === 1 && matches.length > 0 && (
          <div className="text-center text-muted-foreground py-8">
            End of results
          </div>
        )}
      </div>
    </AppLayout>
  );
}
