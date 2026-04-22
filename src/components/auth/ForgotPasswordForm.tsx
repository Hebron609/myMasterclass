"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call - backend developer to implement actual logic
    setTimeout(() => {
      console.log("Password reset code sent to:", email);
      setIsLoading(false);
      // Redirect to OTP page after successful email submission
      router.push('/otp');
    }, 2000);
  };

  return (
    <div className="w-full max-w-[532px]">
      {/* Card Container */}
      <div className="bg-white rounded-[15px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-[#1a3d3d] mb-3 font-heading">
            Forgot Password
          </h1>
          <p className="text-[15px] text-[#6b7280] font-sans leading-relaxed">
            No worries, we'll send a reset code to your inbox
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              className="block text-[16px] font-medium text-[#777777] mb-2 font-sans" 
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#fdfdfd] border border-[#d1d5db] rounded-lg text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3d3d]/20 focus:border-[#1a3d3d] transition-all font-sans"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#333333] hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F8F7F5] font-medium py-3.5 rounded-xl text-[16px] transition-all duration-200 font-sans shadow-sm"
          >
            {isLoading ? "Sending..." : "Send Code"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-[15px] text-[#6b7280] font-sans">
            Remember password?{" "}
            <Link 
              href="/login" 
              className="font-medium text-[#1a3d3d] hover:underline transition-all"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
