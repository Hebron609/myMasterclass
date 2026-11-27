"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/components/shared/AppLink";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If no reset token/email query params, fall back to authenticated onboarding flow
  if (!email || !token) {
    return <OnboardingForm />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to reset password.");
      }
      setSuccess(data.message || "Password reset successfully! Redirecting...");
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <Image
          src={logoIcon}
          alt="Diba Leagleship Institute"
          className="h-9 w-auto"
        />
      </div>

      <div className="mb-6">
        <div className="w-12 h-12 bg-[#FFF6EA] text-[#DB911E] rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-[22px] font-bold text-[#1F2937] mb-2 font-heading tracking-tight">
          Set a New Password
        </h1>
        <p className="text-[14px] text-gray-500 leading-relaxed">
          Enter a new password for <span className="font-medium text-gray-800">{email}</span>.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[10px] text-red-700 text-[13px] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-[10px] text-green-700 text-[13px] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="reset-new-password"
            className="block text-[13px] font-semibold text-gray-700 mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-new-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full pl-4 pr-11 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB911E] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="reset-confirm-password"
            className="block text-[13px] font-semibold text-gray-700 mb-2"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Re-enter your new password"
              required
              minLength={8}
              className="w-full pl-4 pr-11 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB911E] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmation}
          className="w-full font-medium py-3 rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2 bg-[#DB911E] hover:bg-[#b87614] text-white disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign in
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
