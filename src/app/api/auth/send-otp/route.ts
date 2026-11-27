import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";
import {
  checkRateLimit,
  getClientIp,
  hashCode,
  signToken,
} from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`send-otp:${ip}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification requests. Please try again in ${limit.retryAfterSeconds} seconds.`,
        },
        { status: 429 },
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOtpEmail({
      to: normalizedEmail,
      otpCode,
    });

    const challengeToken = signToken(
      {
        email: normalizedEmail,
        codeHash: hashCode(otpCode),
        purpose: "otp_verify",
      },
      10 * 60 * 1000, // 10 minutes
    );

    const response = NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been sent to your email.",
      expiresIn: "10 minutes",
    });

    response.cookies.set("v2535_otp_challenge", challengeToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Unable to send verification code. Please try again later." },
      { status: 500 },
    );
  }
}
