"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleDashboardRoute, requiresOnboarding } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
export default function DevTokenSetter() {
  const { setManualToken, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (process.env.NODE_ENV !== "development") return null;
  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await setManualToken(input);
      setInput("");
      setOpen(false);
      router.push(
        requiresOnboarding(user)
          ? "/onboarding"
          : getRoleDashboardRoute(user.role),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-gray-900 p-3 text-sm text-white">
      <button onClick={() => setOpen(!open)} aria-label="Test token tool">
        Test Token
      </button>
      {open && (
        <div className="mt-3 w-72 space-y-3">
          <p className="text-xs text-gray-300">
            The API verifies your identity and role.
          </p>
          {error && (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          )}
          {isAuthenticated ? (
            <button onClick={logout}>Sign out</button>
          ) : (
            <>
              <input
                type="password"
                aria-label="Bearer token"
                className="w-full rounded border border-gray-600 bg-gray-800 p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
              />
              <button
                disabled={busy || !input.trim()}
                onClick={() => void save()}
              >
                {busy ? "Checking…" : "Verify Token"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
