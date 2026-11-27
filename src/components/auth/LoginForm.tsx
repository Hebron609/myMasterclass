"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getRoleDashboardRoute, requiresOnboarding } from "@/lib/auth";
import { login } from "@/lib/services/auth";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import loginSideImage from "../../../public/images/login-page-image.jpg";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

export function LoginForm() {
  const router = useRouter();
  const { setManualToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login(email.trim(), password);
      const { token } = response.data;
      const verifiedUser = await setManualToken(token, {
        currentPassword: password,
      });
      setPassword("");
      router.push(
        requiresOnboarding(verifiedUser) ? "/onboarding" : "/select-program",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen flex w-full font-sans">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-[420px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src={logoIcon}
              alt="Diba Leagleship Institute"
              className="h-[56px] w-auto object-contain"
              priority
            />
          </div>

          {/* Headlines */}
          <div className="text-center mb-10">
            <h1 className="text-[24px] font-bold text-[#1F2937] mb-2 font-heading tracking-tight">
              Hello, Welcome to Leagleship
            </h1>
            <p className="text-[14px] text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-4 pr-11 py-3 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-600 text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full font-medium py-3 rounded-[10px] text-[14px] transition-colors mt-2 flex items-center justify-center gap-2
                ${
                  isFormValid && !isLoading
                    ? "bg-[#1F2937] hover:bg-black text-white"
                    : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="text-[11.5px] text-gray-500 text-center mt-6 leading-relaxed">
              By signing in, you agree to our Terms of Service and <br />{" "}
              Privacy Policy. Your data is encrypted and secure.
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Image & Text */}
      <div className="hidden lg:flex flex-1 bg-[#F4F5F7] relative items-center justify-center p-8">
        <div className="w-full max-w-[540px] bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <Image
            src={loginSideImage}
            alt="The Journey Begins"
            className="w-full h-auto object-contain rounded-[20px] mb-10 bg-[#F9FAFB]"
            priority
          />
          <div className="text-center px-4">
            <h2 className="text-[22px] font-bold text-[#1F2937] mb-4 font-heading">
              The Journey Begins
            </h2>
            <p className="text-[14.5px] text-gray-500 mb-10 leading-relaxed max-w-[400px] mx-auto">
              Leagleship connects you with mentors, structured programs,
              practical assignments, and lifelong personal development.
            </p>
            <div className="flex justify-center items-center gap-2 pb-2">
              <div className="w-8 h-2 bg-[#1F2937] rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
