import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  getClientIp,
  hashCode,
  verifyToken,
} from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`verify-otp:${ip}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification attempts. Please wait ${limit.retryAfterSeconds} seconds.`,
        },
        { status: 429 },
      );
    }

    const { email, code } = await req.json();
    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const challenge = cookieStore.get("v2535_otp_challenge")?.value;
    if (!challenge) {
      return NextResponse.json(
        { error: "Verification code expired or not requested. Please request a new code." },
        { status: 400 },
      );
    }

    const verified = verifyToken<{
      email: string;
      codeHash: string;
      purpose: string;
    }>(challenge);

    if (
      !verified ||
      verified.purpose !== "otp_verify" ||
      verified.email !== email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Verification session expired or does not match this email. Please request a new code." },
        { status: 400 },
      );
    }

    if (hashCode(code.trim()) !== verified.codeHash) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Account successfully verified! Redirecting to sign in...",
    });

    response.cookies.set("v2535_otp_challenge", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Unable to verify code. Please try again." },
      { status: 500 },
    );
  }
}
