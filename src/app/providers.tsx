"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PageLoadingBoundary } from "@/context/PageLoadingContext";
import DevTokenSetter from "@/components/dev/DevTokenSetter";

/**
 * Client-side providers wrapper.
 * Wraps the app with AuthProvider and renders the DevTokenSetter widget.
 * This is a client component so the root layout can remain a server component.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PageLoadingBoundary>
        {children}
        {process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_ENABLE_TOKEN_TOOL === "true" && (
            <DevTokenSetter />
          )}
      </PageLoadingBoundary>
    </AuthProvider>
  );
}
