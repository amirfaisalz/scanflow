import { Suspense } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Create Account - ScanFlow",
  description: "Create an isolated workspace for dynamic QR code management and conversion analytics.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight">
            <div className="size-10 rounded-xl bg-gradient-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-md">
              <QrCode className="size-6 text-white" />
            </div>
            <span>ScanFlow</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Create an isolated workspace for your QR analytics
          </p>
        </div>

        {/* Register Card wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="text-muted-foreground p-8 text-center text-sm">
              Loading registration...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
