"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { Users, Heart, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Briefcase, Check, Phone, Mail } from "lucide-react";
import {
  calculateApplicationMatches,
  calculateCompatibility,
} from "@/lib/matching-algorithm";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [adopters, setAdopters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activePets: 0,
    newMatches: 0,
    pendingApps: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user's pets
        const petsRes = await fetch(`/api/pets?ownerId=${user.id}`);
        const petsData = await petsRes.json();

        if (petsRes.ok && petsData.pets.length > 0) {
          setPets(petsData.pets);
          setSelectedPet(petsData.pets[0]);
        }

        // Fetch stats
        const statsRes = await fetch(`/api/stats?ownerId=${user.id}`);
        const statsData = await statsRes.json();

        if (statsRes.ok) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("[v0] Fetch dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  useEffect(() => {
    if (!selectedPet) return;

    const fetchAdopters = async () => {
      try {
        const res = await fetch(`/api/applications?petId=${selectedPet.id}`);
        const data = await res.json();

        const applicationsWithPet = data.applications.map((app: any) => ({
          user: app,
          pet: selectedPet,
        }));

        const matchedApplications =
          calculateApplicationMatches(applicationsWithPet);

        console.log("Matched Applications", matchedApplications);

        const applicationsWithMatches = data.applications.map((app: any) => {
          const match = matchedApplications.find((m) => m.userId === app.id);
          return {
            ...app,
            score: match?.score ?? 0,
            reasons: match?.reasons ?? [],
            negativeReasons: match?.negativeReasons ?? [],
          };
        });

        if (res.ok) {
          setAdopters(applicationsWithMatches);
        }
      } catch (error) {
        console.error("[v0] Fetch adopters error:", error);
      }
    };

    fetchAdopters();
  }, [selectedPet]);

  const handleReject = async (
    petId: string,
    adopterId: string,
    adopterName: string
  ) => {
    try {
      const res = await fetch("/api/applications/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, adopterId }),
      });

      if (!res.ok) throw new Error("Failed to reject application");

      // Actualizar el estado local para remover al adoptador del listado
      setAdopters((prev) => prev.filter((a) => a.id !== adopterId));

      // Mensaje informativo (sin icono feliz)
      Swal.fire({
        title: "Application Rejected",
        html: `You have rejected the application from <strong>${adopterName}</strong>.`,
        icon: undefined,
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("[v0] Reject error:", error);
      Swal.fire({
        title: "Error",
        text: "There was an error rejecting the application. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  const staticMatchReasons = [
    "Experience level aligns with pet's needs",
    "Housing situation is ideal for this pet",
    "Activity level matches pet's energy requirements",
    "Family composition is compatible with pet's temperament",
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your pets and review adoption applications
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.activePets}</p>
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
                <p className="text-3xl font-bold">{stats.newMatches}</p>
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
                <p className="text-3xl font-bold">{stats.pendingApps}</p>
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
                <p className="text-3xl font-bold">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Column - My Pets */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
              MY PETS
            </h2>
            {pets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pets added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pets.map((pet) => {
                  const isSelected = selectedPet?.id === pet.id;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={pet.image_url || "/placeholder.svg"}
                          alt={pet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pet.breed}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pet.status}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Matched Adopters */}
          <div>
            {selectedPet && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Matched Adopters for {selectedPet.name}
                  </h2>
                </div>
                <div className="mb-4 text-sm text-muted-foreground">
                  <span className="font-medium">{selectedPet.breed}</span> •{" "}
                  {selectedPet.age_group} •{" "}
                  <span className="text-green-600 font-medium capitalize">
                    {selectedPet.status}
                  </span>{" "}
                  •{" "}
                  <span className="font-medium">{adopters.length} matches</span>
                </div>

                {adopters.length > 0 ? (
                  <div className="space-y-6">
                    {adopters.map((adopter, index) => {
                      const appliedDate = new Date(adopter.applied_at);
                      const daysAgo = Math.floor(
                        (Date.now() - appliedDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const formattedDate = appliedDate.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      );

                      return (
                        <div
                          key={adopter.id}
                          className="bg-card rounded-lg border p-6"
                        >
                          {/* Adopter Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                                {adopter.image_url ? (
                                  <Image
                                    src={
                                      adopter.image_url || "/placeholder.svg"
                                    }
                                    alt={adopter.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                    {adopter.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    #{index + 1} Match
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-lg">
                                  {adopter.name}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Adopter Details Grid */}
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                              <div className="flex items-start gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    Phone
                                  </p>
                                  <p className="font-medium">
                                    {adopter.cell_phone ||
                                      adopter.home_phone ||
                                      "Not provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-start gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    Email
                                  </p>
                                  <p className="font-medium break-all">
                                    {adopter.email || "Not provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    Address
                                  </p>
                                  <p className="font-medium">
                                    {adopter.address_line &&
                                    adopter.city &&
                                    adopter.state
                                      ? `${
                                          adopter.address_line.length > 40
                                            ? adopter.address_line.substring(
                                                0,
                                                40
                                              ) + "..."
                                            : adopter.address_line
                                        }, ${adopter.city}, ${adopter.state}`
                                      : adopter.location || "Not provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-start gap-2 text-sm">
                                <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    Housing
                                  </p>
                                  <p className="font-medium capitalize">
                                    {adopter.home_type ||
                                      adopter.housing_type ||
                                      "Not specified"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-start gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    Experience
                                  </p>
                                  <p className="font-medium capitalize">
                                    {adopter.experience_level ||
                                      "Not specified"}
                                  </p>
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
                              {adopter.reasons.map(
                                (
                                  reason:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactElement<
                                        unknown,
                                        string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | ReactPortal
                                    | Promise<
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactPortal
                                        | ReactElement<
                                            unknown,
                                            string | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | null
                                        | undefined
                                      >
                                    | null
                                    | undefined,
                                  idx: Key | null | undefined
                                ) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                      {reason}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>

                            {/* ---------------- Negatives ---------------- */}
                            {adopter.negativeReasons.length > 0 && (
                              <>
                                <h4 className="font-semibold text-sm mt-4 mb-3 flex items-center gap-2 text-red-600">
                                  ❌ Potential Concerns
                                </h4>
                                <div className="space-y-2">
                                  {adopter.negativeReasons.map(
                                    (
                                      reason:
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactElement<
                                            unknown,
                                            string | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | ReactPortal
                                        | Promise<
                                            | string
                                            | number
                                            | bigint
                                            | boolean
                                            | ReactPortal
                                            | ReactElement<
                                                unknown,
                                                | string
                                                | JSXElementConstructor<any>
                                              >
                                            | Iterable<ReactNode>
                                            | null
                                            | undefined
                                          >
                                        | null
                                        | undefined,
                                      idx: Key | null | undefined
                                    ) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                          {reason}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Application Info */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                            <span>
                              Applied {formattedDate} • {daysAgo}{" "}
                              {daysAgo === 1 ? "day" : "days"} ago
                            </span>
                            <Badge variant="outline">Pending</Badge>
                          </div>

                          {/* Action Buttons */}
                          <div className="gap-3">
                            <Button
                              variant="outline"
                              className="w-full text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() =>
                                handleReject(
                                  selectedPet.id,
                                  adopter.id,
                                  adopter.name
                                )
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
  );
}
