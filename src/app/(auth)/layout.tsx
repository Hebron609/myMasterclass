import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Vision2535",
  description: "Secure access to the Vision2535 Mentorship Platform.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafa] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[532px] space-y-8">
        {children}
      </div>
    </div>
  );
}
