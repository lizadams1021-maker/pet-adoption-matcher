"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string; // Added imageUrl to User interface
  preferences: {
    location: string | null;
    housingType: string | null;
    hasChildren: boolean;
    experienceLevel: string | null;
    activityLevel: string | null;
    petSizePreference: string | null;
    temperamentPreference: string[];
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updatePreferences: (preferences: User["preferences"]) => Promise<void>;
  updateProfileImage: (imageUrl: string) => Promise<void>; // Added updateProfileImage function
  addPet: (pet: any) => Promise<void>;
  getUserPets: () => Promise<any[]>;
  deletePet: (petId: string) => Promise<void>;
  updatePet: (petId: string, updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[v0] Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("currentUser");
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[v0] Registration error:", error);
      return false;
    }
  };

  const updatePreferences = async (preferences: User["preferences"]) => {
    if (!user) return;

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, preferences }),
      });

      if (response.ok) {
        const updatedUser = { ...user, preferences };
        setUser(updatedUser);
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("[v0] Update preferences error:", error);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return;

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, imageUrl }),
      });

      if (response.ok) {
        const updatedUser = { ...user, imageUrl };
        setUser(updatedUser);
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("[v0] Update profile image error:", error);
    }
  };

  const addPet = async (petData: any) => {
    if (!user) return;

    try {
      await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...petData, ownerId: user.id }),
      });
    } catch (error) {
      console.error("[v0] Add pet error:", error);
    }
  };

  const getUserPets = async () => {
    if (!user) return [];

    try {
      const response = await fetch(`/api/pets?ownerId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.pets;
      }
      return [];
    } catch (error) {
      console.error("[v0] Get pets error:", error);
      return [];
    }
  };

  const deletePet = async (petId: string) => {
    try {
      await fetch(`/api/pets?petId=${petId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("[v0] Delete pet error:", error);
    }
  };

  const updatePet = async (petId: string, updates: any) => {
    try {
      await fetch("/api/pets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, updates }),
      });
    } catch (error) {
      console.error("[v0] Update pet error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updatePreferences,
        updateProfileImage,
        addPet,
        getUserPets,
        deletePet,
        updatePet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
