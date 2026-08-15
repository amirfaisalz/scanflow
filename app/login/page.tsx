import { Suspense } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login - ScanFlow",
  description: "Sign in to your ScanFlow account to manage dynamic QR codes and conversion analytics.",
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2.5 self-center font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <div className="bg-fire text-white flex size-7 items-center justify-center rounded-lg shadow-xs">
            <QrCode className="size-4 text-white" />
          </div>
          <span className="text-foreground font-bold">ScanFlow</span>
        </Link>
        <Suspense
          fallback={
            <div className="text-muted-foreground p-8 text-center text-sm">
              Loading login...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
