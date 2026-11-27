import { NextResponse } from "next/server";
import { sendSessionBookingEmail } from "@/lib/mailer";
import { verifyBearerUser } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const auth = await verifyBearerUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const {
      mentorEmail,
      menteeEmail,
      mentorName,
      menteeName,
      sessionTitle,
      scheduledAt,
      meetingLink,
    } = await req.json();

    if (!mentorEmail || !menteeEmail || !sessionTitle || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required session notification fields." },
        { status: 400 },
      );
    }

    await sendSessionBookingEmail({
      mentorEmail,
      menteeEmail,
      mentorName: mentorName || "Mentor",
      menteeName: menteeName || "Mentee",
      sessionTitle,
      scheduledAt,
      meetingLink,
    });

    return NextResponse.json({
      success: true,
      message: "Session confirmation emails sent.",
    });
  } catch (error) {
    console.error("Session booking email error:", error);
    return NextResponse.json(
      { error: "Failed to send session confirmation email." },
      { status: 500 },
    );
  }
}
