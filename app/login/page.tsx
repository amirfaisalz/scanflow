"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsDemoLoading(true);

    const demoEmail = "demo@scanflow.io";
    const demoPassword = "DemoPassword123!";

    try {
      // Try signing in first
      const signInResult = await authClient.signIn.email({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInResult.error) {
        // If demo account does not exist, create it first
        const signUpResult = await authClient.signUp.email({
          email: demoEmail,
          password: demoPassword,
          name: "Recruiter Demo User",
        });

        if (signUpResult.error) {
          setError("Could not sign in with demo account. Please try manual sign up.");
          setIsDemoLoading(false);
          return;
        }
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Demo sign-in error:", err);
      setError("Failed to initialize demo session. Please try again.");
      setIsDemoLoading(false);
    }
  };


  return (
    <Card className="border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Sign in to your account</CardTitle>
        <CardDescription>
          Enter your credentials below to access your analytics dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Login */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Quick Evaluation
            </span>
            <span className="text-muted-foreground font-normal">No setup needed</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Evaluating the project? Instant sign-in with preloaded demo profile.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            disabled={isDemoLoading || isLoading}
            onClick={handleDemoSignIn}
          >
            {isDemoLoading ? "Signing into demo..." : "1-Click Demo Recruiter Sign-In"}
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={isLoading || isDemoLoading}
          >
            {isLoading ? "Signing in..." : "Sign in to Dashboard"}
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"

            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight">
            <div className="size-10 rounded-xl bg-linear-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-md">
              <QrCode className="size-6 text-white" />
            </div>
            <span>ScanFlow</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Programmable QR Analytics & Conversion Platform
          </p>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading login form...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
