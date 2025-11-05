"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";
import React from "react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Application {
  id: string;
  applied_at: string;
  pet_id: string;
  pet_name: string;
  pet_type: string;
  pet_breed: string;
  pet_age_group: string;
  pet_image: string | null;
  pet_status: string;
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchApps = async () => {
      try {
        const res = await fetch(`/api/applications/sent?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch applications");

        const data = await res.json();
        console.log("Applications sent", data.applications);
        setApps(data.applications || []);
      } catch (err) {
        console.error("[MyApplicationsPage] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [user, router]);

  const handleWithdraw = async (
    appId: string,
    petId: string,
    petName: string
  ) => {
    if (!user) return;
    setLoadingAppId(appId);

    try {
      const res = await fetch("/api/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, petId }),
      });

      if (!res.ok) throw new Error("Failed to withdraw application");

      // Actualizar estado local de apps
      setApps((prev) => prev.filter((a) => a.id !== appId));

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "Application Withdrawn",
        html: `You have withdrawn your application for <strong>${petName}</strong>. You can always apply again later if you change your mind.`,
        icon: undefined,
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("[v0] Withdraw error:", error);
      Swal.fire({
        title: "Error",
        text: "There was an error withdrawing your application. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoadingAppId(null); // termina animación
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Manage and track all your submitted pet adoption applications in one
            convenient view.
          </p>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground mb-4">
              You don't have any applications yet.
            </p>
            <Button onClick={() => router.push("/matches")}>
              Send your first application
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={app.pet_image || "/placeholder.jpg"}
                  alt={app.pet_name}
                  className="w-full h-48 object-cover rounded-xl mb-3"
                />
                <h2 className="text-lg font-medium">{app.pet_name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {app.pet_type} • {app.pet_breed} • {app.pet_age_group}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Applied on {new Date(app.applied_at).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm font-medium capitalize">
                  Status: {app.pet_status}
                </p>

                <div className="mt-3 flex gap-2">
                  <Link href={`/pet/${app.pet_id}`} className="flex-1">
                    <Button className="w-full bg-transparent" variant="outline">
                      View Details
                    </Button>
                  </Link>

                  <Button
                    onClick={() =>
                      handleWithdraw(app.id, app.pet_id, app.pet_name)
                    }
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    disabled={loadingAppId === app.id} // bloquea mientras carga
                  >
                    {loadingAppId === app.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Cancel"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
