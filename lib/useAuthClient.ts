"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAccess } from "@/lib/auth";

export function useAuthClient() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      let token = sessionStorage.getItem("accessToken");
      const storedUser = sessionStorage.getItem("user");

      if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

      if (!token) {
        token = await refreshAccess();
      }

      if (!token) {
        setUser(null);
        router.push("/login");
        return;
      }

      try {
        console.log("Access tokennnnn:", token);

        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invalid token");
        const data = await res.json();
        
        setUser(data.user);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("accessToken", token);

      } catch {
        setUser(null);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  return { user, loading };
}
