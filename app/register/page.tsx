"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import {
  MIN_PASSWORD_LENGTH,
  getPasswordChecks,
  passwordStrengthScore,
  validatePassword,
} from "@/lib/password-policy";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const strength = useMemo(() => passwordStrengthScore(password), [password]);

  const strengthLabel = strength >= 80 ? "Strong" : strength >= 50 ? "Moderate" : "Weak";
  const strengthColor =
    strength >= 80 ? "bg-emerald-500" : strength >= 50 ? "bg-amber-500" : "bg-destructive";

  const requirements = [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: passwordChecks.hasMinLength },
    { label: "One uppercase letter", met: passwordChecks.hasUppercase },
    { label: "One lowercase letter", met: passwordChecks.hasLowercase },
    { label: "One number", met: passwordChecks.hasNumber },
    { label: "One special character", met: passwordChecks.hasSymbol },
    { label: "Not a common password", met: passwordChecks.notCommon },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordIssues = validatePassword(password);
    if (passwordIssues.length) {
      setError(passwordIssues.join(" "));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        const serverError = Array.isArray(data.error) ? data.error.join(" ") : data.error;
        setError(serverError || "Registration failed");
        return;
      }

      const data = await res.json();

      localStorage.clear();
      localStorage.setItem("accessToken", data.accessToken);

      router.push("/profile");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-lg border">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join us to find your perfect pet match
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">User Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>

          <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Password strength</span>
              <span className={strengthColor ? `${strengthColor.replace("bg-", "text-")}` : ""}>
                {strengthLabel}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`${strengthColor} h-full rounded-full transition-all`}
                style={{ width: `${strength}%` }}
                aria-hidden
              />
            </div>

            <ul className="space-y-1 text-muted-foreground">
              {requirements.map((req) => (
                <li key={req.label} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={req.met ? "text-foreground" : ""}>{req.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
