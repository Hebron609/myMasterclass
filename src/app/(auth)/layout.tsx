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
  return children;
}
