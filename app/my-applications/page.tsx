"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";
import React from "react";

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

  if (!user) return null;

  if (loading) {
    return (
      <p className="text-center text-muted-foreground">
        Loading applications...
      </p>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl">
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
          <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
