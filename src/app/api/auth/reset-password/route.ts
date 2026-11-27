import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, verifyToken } from "@/lib/server-auth";

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://appsuite.butterflytech.io/api"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`reset-password:${ip}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many reset attempts. Please try again in ${limit.retryAfterSeconds} seconds.`,
        },
        { status: 429 },
      );
    }

    const { email, token, password, password_confirmation } = await req.json();

    if (!email || !token || !password || !password_confirmation) {
      return NextResponse.json(
        { error: "All fields are required to reset your password." },
        { status: 400 },
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const verified = verifyToken<{ email: string; purpose: string }>(token);
    if (
      !verified ||
      verified.purpose !== "password_reset" ||
      verified.email !== String(email).trim().toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // Forward to upstream backend reset-password route
    const upstream = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: verified.email,
        token,
        password,
        password_confirmation,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error:
            (data as { message?: string }).message ||
            "Could not complete password reset with the authentication server. Please contact your administrator if this persists.",
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password right now. Please try again later." },
      { status: 500 },
    );
  }
}
