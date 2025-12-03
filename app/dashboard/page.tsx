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
import { useAuthClient } from "@/lib/useAuthClient";

export default function DashboardPage() {
  const { user, loading } = useAuthClient();
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [adopters, setAdopters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAdopters, setLoadingAdopters] = useState(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [stats, setStats] = useState({
    activePets: 0,
    newMatches: 0,
    pendingApps: 0,
    thisWeek: 0,
  });
  const [loadingPage, setLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

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
      } catch (error) {
        console.error("[v0] Fetch dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, loading]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const statsRes = await fetch(`/api/stats?ownerId=${user.id}`);
        const statsData = await statsRes.json();

        if (statsRes.ok) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("[v0] Fetch stats error:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (!selectedPet) return;

    fetchAdopters();
  }, [selectedPet, page]);

  const fetchAdopters = async () => {
    try {
      setLoadingAdopters(true);

      // 1️⃣ Bring full pet info
      const petRes = await fetch(`/api/pets/${selectedPet.id}`);
      const petData = await petRes.json();
      if (!petRes.ok || !petData.pet) {
        console.error("Failed to fetch full pet info:", petData.error);
        return;
      }
      const fullPet = petData.pet;

      // 2️⃣ Brring pet applications
      const res = await fetch(
        `/api/applications?petId=${selectedPet.id}&page=${page}&limit=5`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch adopters");

      // 3️⃣ Combine applications with full pet data
      const applicationsWithPet = data.applications.map((app: any) => ({
        user: app,
        pet: fullPet,
      }));

      // 4️⃣ Calculate matches
      const matchedApplications =
        calculateApplicationMatches(applicationsWithPet);

      // 5️⃣ Add score and reasons for every application
      const applicationsWithMatches = data.applications.map((app: any) => {
        const match = matchedApplications.find((m) => m.userId === app.id);
        return {
          ...app,
          score: match?.score ?? 0,
          reasons: match?.reasons ?? [],
          negativeReasons: match?.negativeReasons ?? [],
        };
      });

      console.log("[Dashboard] Adopters: ", applicationsWithMatches);
      setAdopters(applicationsWithMatches);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("[v0] Fetch adopters error:", error);
    } finally {
      setLoadingAdopters(false);
    }
  };

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

      // Update local state to remove adopter from list
      setAdopters((prev) => prev.filter((a) => a.id !== adopterId));

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

  const handleAccept = async (
    petId: string,
    adopterId: string,
    adopterName: string
  ) => {
    const result = await Swal.fire({
      title: "Confirm Adoption",
      html: `
      Are you sure you want to accept <strong>${adopterName}</strong> for this pet?<br>
      This will mark the pet as adopted and remove all other applications.
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, accept",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/applications/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, adopterId }),
      });

      if (!res.ok) throw new Error("Failed to accept application");

      Swal.fire({
        title: "Application Accepted",
        html: `You have accepted <strong>${adopterName}</strong> for adoption.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(async () => {
        // ✅ Update list of adopters for this pet
        await fetchAdopters();

        // ✅ Update pet status to 'adopted'
        setPets((prevPets) =>
          prevPets.map((p) =>
            p.id === petId ? { ...p, status: "adopted" } : p
          )
        );

        setSelectedPet((prev: typeof selectedPet) =>
          prev && prev.id === petId ? { ...prev, status: "adopted" } : prev
        );
      });
    } catch (error) {
      console.error("[v0] Accept error:", error);
      Swal.fire({
        title: "Error",
        text: "There was an error accepting the application. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loadingPage) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const compatibilityTips = [
    "Close proximity to the shelter",
    "Similar activity level",
    "Compatible housing situation",
    "Experience with pets like yours",
    "Stable financial situation",
    "Schedule aligns with pet needs",
    "Family composition is a good fit",
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
        {loadingStats ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Active Pets */}
            <div
              className="bg-card rounded-lg border p-6 cursor-pointer hover:shadow-md transition"
              onClick={() => router.push("/my-pets")}
            >
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

            {/* Pending Apps */}
            <div
              className="bg-card rounded-lg border p-6 cursor-pointer hover:shadow-md transition"
              onClick={() => router.push("/my-applications")}
            >
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

            {/* New Matches */}
            <div
              className="bg-card rounded-lg border p-6 cursor-pointer hover:shadow-md transition"
              onClick={() => router.push("/matches")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.newMatches}</p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div
              className="bg-card rounded-lg border p-6 cursor-pointer hover:shadow-md transition"
              onClick={() => router.push("/matches")}
            >
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
        )}

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
                  const isAdopted = pet.status === "adopted";

                  return (
                    <button
                      key=...}]}