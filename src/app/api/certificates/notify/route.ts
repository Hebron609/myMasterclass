import { NextResponse } from "next/server";
import { sendCertificateEmail } from "@/lib/mailer";
import { verifyBearerUser } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const auth = await verifyBearerUser(req, { requireAdmin: true });
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { email, menteeName, certificateTitle, certificateId } = await req.json();

    if (!email || !menteeName || !certificateTitle) {
      return NextResponse.json(
        { error: "Missing required certificate details." },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const certificateUrl = certificateId
      ? `${protocol}://${host}/mentee/certificates?id=${encodeURIComponent(certificateId)}`
      : `${protocol}://${host}/mentee/certificates`;

    await sendCertificateEmail({
      to: email.trim(),
      menteeName,
      certificateTitle,
      certificateUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Certificate notification email sent to ${email}.`,
    });
  } catch (error) {
    console.error("Certificate notification email error:", error);
    return NextResponse.json(
      { error: "Failed to send certificate email." },
      { status: 500 }
    );
  }
}
