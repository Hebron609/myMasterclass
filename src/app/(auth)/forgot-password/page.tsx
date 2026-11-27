import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafa] px-4 py-12 sm:px-6 lg:px-8 font-sans w-full">
      <div className="w-full flex justify-center">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
