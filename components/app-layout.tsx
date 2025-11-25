"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  PawPrint,
  User,
  LogOut,
  Heart,
  Plus,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { refreshAccess } from "@/lib/auth";
import { useAuthClient } from "@/lib/useAuthClient";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { user } = useAuthClient();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-pets", label: "My Pets", icon: PawPrint },
    { href: "/my-applications", label: "My Applications", icon: ClipboardList },
    { href: "/matches", label: "Matches", icon: Heart },
    { href: "/add-pet", label: "Add Pet", icon: Plus },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    async function initAuth() {
      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await refreshAccess();
      }
      if (!token) {
        router.push("/login");
      }
    }
    initAuth();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Button onClick={() => setIsOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0 sm:static sm:flex" // desktop siempre visible
        )}
      >
        <div className="p-4 sm:hidden flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">
            Pet Protect & Connect
          </h1>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
          )}
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  pathname === "/profile"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center gap-3 justify-start bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
