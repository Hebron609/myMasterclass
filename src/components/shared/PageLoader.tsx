import Image from "next/image";
import logo from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

interface PageLoaderProps {
  className?: string;
  isFadingOut?: boolean;
}

/** Branded professional loading screen with official logo, ambient glow, and animated luxury gold bar. */
export function PageLoader({
  className = "",
  isFadingOut = false,
}: PageLoaderProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Loading your workspace"
      className={`brand-page-loader fixed inset-0 z-[99999] flex min-h-screen items-center justify-center px-6 text-center select-none transition-opacity duration-300 ease-out ${
        isFadingOut
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto"
      } ${className}`}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Brand Logo with warm ambient glow */}
        <div className="relative mb-8">
          <div
            aria-hidden="true"
            className="brand-loader-glow absolute -inset-10 rounded-full bg-[#DB911E]/15 blur-3xl pointer-events-none"
          />
          <Image
            src={logo}
            alt="Diba Leagleship Institute"
            priority
            className="relative h-auto w-[240px] max-w-[72vw] object-contain drop-shadow-sm"
          />
        </div>

        {/* Status text */}
        <h2 className="font-heading text-xl font-semibold tracking-tight text-[#173F3D]">
          Getting your space ready
        </h2>
        <p className="mt-1.5 text-sm text-[#7B8087] font-sans">
          Vision2535 Mentorship Platform
        </p>

        {/* Luxury Gold Progress Bar */}
        <div
          aria-hidden="true"
          className="mt-7 h-[3.5px] w-48 max-w-[65vw] overflow-hidden rounded-full bg-[#EAE7E0]/90 shadow-inner"
        >
          <div className="brand-loader-bar h-full w-1/3 rounded-full bg-gradient-to-r from-[#BA7815] via-[#DB911E] to-[#F5B041] shadow-[0_0_8px_rgba(219,145,30,0.6)]" />
        </div>
      </div>
    </section>
  );
}
