"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous field
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
      
      // Focus the next empty field or last field
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setIsLoading(true);
      console.log("OTP submitted:", otpValue);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/reset-password');
      }, 1500);
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full max-w-[532px]">
      {/* Card Container */}
      <div className="bg-white rounded-[15px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-[#1a3d3d] mb-3 font-heading">
            Enter your OTP
          </h1>
          <p className="text-[15px] text-[#6b7280] font-sans leading-relaxed">
            We've sent a verification code to{" "}
            <span className="font-medium text-gray-900">daphnesm@gmail.com</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[16px] font-medium text-[#777777] mb-3 font-sans">
              Email
            </label>
            
            {/* OTP Input Grid */}
            <div className="flex gap-5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-[60px] h-[48px] text-center text-[24px] font-normal bg-[#fdfdfd] border-2 border-[#d1d5db] rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a3d3d]/20 focus:border-[#1a3d3d] transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  data-filled={digit !== ""}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isComplete || isLoading}
            className="w-full bg-[#333333] hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F8F7F5] font-medium py-3.5 rounded-xl text-[16px] transition-all duration-200 font-sans shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              "Next"
            )}
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
