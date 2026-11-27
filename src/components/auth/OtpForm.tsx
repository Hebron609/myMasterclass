"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "@/components/shared/AppLink";
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

export function OtpForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      setCodeSent(true);
      setSuccess("Verification code sent! Please check your email inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      setSuccess(
        data.message || "Account successfully verified! Redirecting to sign in...",
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to verify code.",
      );
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

      <div className="mb-6">
        <div className="w-12 h-12 bg-[#FFF6EA] text-[#DB911E] rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-[22px] font-bold text-[#1F2937] mb-2 font-heading tracking-tight">
          Two-Step Verification
        </h1>
        <p className="text-[14px] text-gray-500 leading-relaxed">
          {codeSent
            ? `Enter the 6-digit code sent to ${email} to verify your account.`
            : "Enter your registered email address to receive a secure 6-digit verification code."}
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

      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <label htmlFor="otp-email" className="block text-[13px] font-semibold text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="otp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
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
                <span>Sending Code...</span>
              </>
            ) : (
              "Send Verification Code"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="otp-code" className="block text-[13px] font-semibold text-gray-700 mb-2">
              6-Digit Code
            </label>
            <input
              id="otp-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              className="w-full tracking-widest text-center text-[22px] font-bold py-3 bg-white border border-gray-200 rounded-[10px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DB911E] focus:border-transparent transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className={`w-full font-medium py-3 rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2
              ${
                code.length === 6 && !isLoading
                  ? "bg-[#DB911E] hover:bg-[#b87614] text-white cursor-pointer shadow-md"
                  : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isLoading}
              className="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Didn’t receive the code? Resend
            </button>
          </div>
        </form>
      )}

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
