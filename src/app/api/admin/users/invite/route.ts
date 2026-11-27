import { NextResponse } from "next/server";
import { sendWelcomeUserEmail } from "@/lib/mailer";
import { verifyBearerUser } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const auth = await verifyBearerUser(req, { requireAdmin: true });
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { email, name, role, temporaryPassword } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing required user details (email and name)." },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const loginUrl = `${protocol}://${host}/login`;

    await sendWelcomeUserEmail({
      to: email.trim(),
      name,
      role: role || "mentee",
      temporaryPassword,
      loginUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Welcome email sent successfully to ${email}.`,
    });
  } catch (error) {
    console.error("Send welcome user email error:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email." },
      { status: 500 }
    );
  }
}
