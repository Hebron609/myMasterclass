"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isValid = passwordsMatch && newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - backend developer to implement actual logic
    setTimeout(() => {
      console.log("Password reset successful:", { newPassword });
      setIsLoading(false);
      // Redirect to login page.
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="w-full max-w-[532px]">
      {/* Card Container */}
      <div className="bg-white rounded-[15px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#1a3d3d] mb-3 font-heading">
            Set New Password
          </h1>
          <p className="text-[15px] text-[#6b7280] font-sans leading-relaxed">
            No worries, we'll send a reset code to your inbox
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              className="block text-[16px] font-medium text-[#777777] mb-2 font-sans" 
              htmlFor="new-password"
            >
              Enter New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#fdfdfd] border border-[#d1d5db] rounded-lg text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3d3d]/20 focus:border-[#1a3d3d] transition-all font-sans"
              placeholder="Enter password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label 
              className="block text-[16px] font-medium text-[#777777] mb-2 font-sans" 
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#fdfdfd] border border-[#d1d5db] rounded-lg text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3d3d]/20 focus:border-[#1a3d3d] transition-all font-sans"
              placeholder="Confirm password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-[#333333] hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F8F7F5] font-bold py-3.5 rounded-xl text-[16px] transition-all duration-200 font-sans shadow-sm mt-2"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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
