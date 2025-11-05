"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";

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
      </div>
    </AppLayout>
  );
}
