"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getRoleDashboardRoute } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

type Role = "MENTEE" | "MENTOR" | "ADMIN";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Dummy logic: Infer role from email address
      let inferredRole: Role = "MENTEE";
      if (email.toLowerCase().includes("admin")) {
        inferredRole = "ADMIN";
      } else if (email.toLowerCase().includes("mentor")) {
        inferredRole = "MENTOR";
      }

      // Simulated API call - Backend developer to implement actual authentication
      const mockUser = {
        id: "user-123",
        email,
        firstName: "John",
        lastName: "Doe",
        role: inferredRole,
        enrolledPrograms: ["vision-2535", "fellowship"], // Dummy programs
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Set user session using Zustand store
      useAuthStore.getState().login(mockUser, mockToken);

      // Set cookies (for middleware verification)
      document.cookie = `user_role=${inferredRole}; path=/`;
      document.cookie = `auth_token=${mockToken}; path=/`;

      console.log("Login successful with:", { email, role: inferredRole });

      // Redirect to program selection instead of directly to dashboard
      setTimeout(() => {
        router.push("/select-program");
      }, 500);
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF9] flex items-center justify-center p-4">
      <div className="w-full max-w-[532px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-semibold tracking-tight text-[#003F3A] leading-none mb-4 font-heading">
            VISION2535
          </h1>
          <p className="text-[17px] font-regular text-gray-600 font-sans">
            Mentorship Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-[24px] font-semibold text-[#003F3A] mb-6 pb-4 border-b border-gray-200 font-heading">
            Sign into your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAF9] border border-[#ADADAD] rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="username@gmail.com"
                required
              />
            </div>

            <div>
              <label
                className="block text-[16px] font-medium text-[#777777] mb-2 font-sans"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAF9] border border-[#ADADAD] rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="password"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Link
                href="/forgot-password"
                className="text-[14px] font-medium text-[#003F3A] hover:underline font-sans"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#333333] hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F8F7F5] font-medium py-3 rounded-lg text-[16px] transition-colors mt-2"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Role grid removed per new flow */}
      </div>
    </div>
  );
}
