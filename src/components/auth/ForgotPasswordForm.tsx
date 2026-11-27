"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "@/components/shared/AppLink";
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link.");
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <Image src={logoIcon} alt="Diba Leagleship Institute" className="h-9 w-auto" />
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 animate-in fade-in">
          <div className="w-14 h-14 bg-[#FFF6EA] text-[#DB911E] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-2 font-heading">
            Check your email
          </h2>
          <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
            We have sent password recovery instructions to: <br />
            <strong className="text-gray-900 font-medium">{email}</strong>
          </p>

          <div className="bg-[#f9fafb] border border-gray-100 rounded-[12px] p-4 text-[13px] text-gray-500 mb-8 text-left">
            <p className="mb-1 text-gray-700 font-medium">Next steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click the reset link in the email to set a new password.</li>
              <li>If you don’t see the email, check your spam or junk folder.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="w-full py-2.5 text-[13px] font-semibold text-[#DB911E] hover:text-[#b87614] transition-colors"
            >
              Didn’t receive an email? Click here to resend
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors w-full py-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#1F2937] mb-2 font-heading tracking-tight">
              Forgot password?
            </h1>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              No worries! Enter your registered email address below and we will send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[10px] text-red-700 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="block text-[13px] font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full font-medium py-3 rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2
                ${
                  email && !isLoading
                    ? "bg-[#1F2937] hover:bg-black text-white cursor-pointer"
                    : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
