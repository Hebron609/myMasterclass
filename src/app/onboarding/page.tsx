import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Vision2535",
  description: "Complete your profile to personalize your mentorship journey.",
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
