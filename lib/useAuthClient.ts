"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAccess } from "@/lib/auth";

type AuthUser = {
  first_name: string;
  last_name: string;
  home_phone: string;
  cell_phone: string;
  gender: string;
  birthday: string;
  address_line: string;
  city: string;
  state: string;
  zip_code: string;
  willing_out_of_state: boolean;
  has_pets: boolean;
  pets_types: never[];
  pets_good_with_others: boolean;
  has_fenced_yard: boolean;
  home_type: string;
  landlord_allows_pets: boolean;
  landlord_phone: string;
  landlord_email: string;
  association_restrictions: boolean;
  works_outside_home: boolean;
  hours_home_alone: string;
  where_pets_when_away: string;
  has_children: boolean;
  children_count: number;
  children_ages: string;
  adults_in_home: number;
  home_activity_level: string;
  pet_live_location: string;
  adoption_timeline: string;
  preferred_dog_breed: string;
  preferred_cat_type: string;
  preferred_age: string;
  preferred_weight: string;
  preferred_temperament_detailed: never[];
  preferred_energy: string;
  undesired_characteristics: never[];
  take_pets_to_vet: boolean;
  vet_name: string;
  vet_phone: string;
  vet_email: string;
  reference1_name: string;
  reference1_phone: string;
  reference1_email: string;
  reference2_name: string;
  reference2_phone: string;
  reference2_email: string;
  adopted_before: boolean;
  owned_pet_before: boolean;
  spayed_neutered: boolean;
  vaccinated: boolean;
  had_pets_no_longer_have: string;
  willing_behavior_training: boolean;
  reasons_give_up: string;
  plan_for_vet_costs: string;
  additional_comments: string;
  image_url: string;
  id: string;
  email: string;
  name: string;
};

export function useAuthClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const persistUser = useCallback((userData: AuthUser) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates } as AuthUser;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  useEffect(() => {
    async function initAuth() {
      let token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

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
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invalid token");
        const data = await res.json();

        persistUser(data.user);
        localStorage.setItem("accessToken", token);

      } catch {
        setUser(null);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  return { user, loading, updateUser };
}
