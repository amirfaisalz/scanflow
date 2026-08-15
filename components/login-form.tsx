"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription, FieldSeparator } from "@/components/ui/field";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleDemoSignIn = async () => {
    setError(null);
    setIsDemoLoading(true);

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to initialize demo session");
      }

      // Smooth transition to dashboard
      window.location.href = callbackUrl;
    } catch (err) {
      console.error("Admin demo sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in to demo admin account.");
      setIsDemoLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      setError("Google OAuth is disabled in this demo environment. Please use 1-Click Demo Admin Sign-In.");
      setIsGoogleLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border shadow-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method to access ScanFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick Evaluation Admin Demo Login */}
            <div className="rounded-xl border border-fire/25 bg-fire/5 dark:bg-fire/10 p-3.5 space-y-2.5 transition-all hover:border-fire/40">
              <div className="flex items-center justify-between text-xs font-semibold text-fire">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 animate-pulse" />
                  Quick Evaluation
                </span>
                <span className="rounded-full bg-fire/15 px-2 py-0.5 text-[10px] font-medium text-fire">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluating ScanFlow? Instant 1-click sign-in with preloaded Admin demo workspace & analytics data.
              </p>
              <Button
                type="button"
                className="w-full text-xs font-semibold bg-fire hover:bg-fire-hover text-white shadow-md shadow-fire/25 transition-all active:scale-[0.99] h-9 gap-1.5 border-0"
                disabled={isDemoLoading || isGoogleLoading}
                onClick={handleDemoSignIn}
              >
                {isDemoLoading ? (
                  "Signing into demo admin..."
                ) : (
                  <>
                    <span>1-Click Demo Admin Sign-In</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs uppercase tracking-wider text-muted-foreground">
              Or
            </FieldSeparator>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in Option */}
            <Button
              variant="outline"
              type="button"
              className="w-full h-10 text-xs font-medium hover:border-fire/40 hover:text-fire transition-all"
              disabled={isDemoLoading || isGoogleLoading}
              onClick={handleGoogleSignIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {isGoogleLoading ? "Connecting to Google..." : "Login with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
