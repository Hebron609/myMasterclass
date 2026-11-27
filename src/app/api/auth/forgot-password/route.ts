import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp, signToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`forgot-password:${ip}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please try again in ${limit.retryAfterSeconds} seconds.`,
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
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const resetToken = signToken(
      { email: normalizedEmail, purpose: "password_reset" },
      60 * 60 * 1000, // 60 minutes
    );
    const resetUrl = `${protocol}://${host}/reset-password?email=${encodeURIComponent(
      normalizedEmail,
    )}&token=${encodeURIComponent(resetToken)}`;

    await sendPasswordResetEmail({
      to: normalizedEmail,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset instructions have been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password email error:", error);
    return NextResponse.json(
      { error: "Unable to send password reset email. Please try again later." },
      { status: 500 },
    );
  }
}
