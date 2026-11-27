"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchCurrentUser,
  sessionUser,
  updatePassword,
} from "@/lib/services/auth";
import { ApiError, errorMessage } from "@/lib/api";
import { requiresOnboarding, type User } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  token: string | null;
  userRole: string | null;
  userId: string | null;
  setManualToken: (
    token: string,
    options?: { currentPassword?: string },
  ) => Promise<User>;
  hasLoginPassword: boolean;
  completeOnboarding: (
    password: string,
    confirmation: string,
    currentPassword?: string,
  ) => Promise<User>;
  logout: () => void;
  retrySession: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function writeRouteCookies(role: string) {
  // Routing hints only. The backend must validate every bearer token and permission.
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `auth_token=present; path=/; SameSite=Lax${secure}`;
  document.cookie = `user_role=${role}; path=/; SameSite=Lax${secure}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  // Temporary sign-in password stays in memory only, until onboarding or logout.
  const loginPassword = useRef<string | null>(null);
  const [hasLoginPassword, setHasLoginPassword] = useState(false);
  const logout = useCallback(() => {
    generation.current++;
    loginPassword.current = null;
    setHasLoginPassword(false);
    useAuthStore.getState().logout();
    ["auth_token", "user_role", "user_uuid"].forEach((key) =>
      localStorage.removeItem(key),
    );
    document.cookie = "auth_token=; path=/; max-age=0";
    document.cookie = "user_role=; path=/; max-age=0";
    setAuthError(null);
    setIsLoading(false);
  }, []);

  const setManualToken = useCallback(
    async (value: string, options?: { currentPassword?: string }) => {
      const cleanToken = value.trim().replace(/^Bearer\s+/i, "");
      if (!cleanToken) throw new Error("Enter a bearer token.");
      const request = ++generation.current;
      setIsLoading(true);
      try {
        const me = await fetchCurrentUser(cleanToken);
        if (request !== generation.current)
          throw new Error("The session changed. Please sign in again.");
        const verifiedUser = sessionUser(me.data);
        loginPassword.current = requiresOnboarding(verifiedUser)
          ? options?.currentPassword || null
          : null;
        setHasLoginPassword(Boolean(loginPassword.current));
        useAuthStore.getState().login(verifiedUser, cleanToken);
        writeRouteCookies(verifiedUser.role);
        setAuthError(null);
        return verifiedUser;
      } finally {
        if (request === generation.current) setIsLoading(false);
      }
    },
    [],
  );

  const completeOnboarding = useCallback(
    async (
      password: string,
      confirmation: string,
      currentPassword?: string,
    ) => {
      const activeToken = useAuthStore.getState().token;
      if (!activeToken) throw new Error("Please sign in again.");
      const current = currentPassword || loginPassword.current;
      if (!current)
        throw new Error("Enter your current or temporary password.");
      if (password === current)
        throw new Error(
          "Choose a password different from your temporary password.",
        );
      const request = generation.current;
      await updatePassword(activeToken, current, password, confirmation);
      loginPassword.current = null;
      setHasLoginPassword(false);
      const { data } = await fetchCurrentUser(activeToken);
      if (
        request !== generation.current ||
        useAuthStore.getState().token !== activeToken
      )
        throw new Error("Your session changed. Please sign in again.");
      const updated = sessionUser(data);
      useAuthStore.getState().login(updated, activeToken);
      if (updated.mustChangePassword)
        throw new Error(
          "Your password was updated, but account setup is still required. Please sign in again with your new password or contact support.",
        );
      return updated;
    },
    [],
  );

  useEffect(() => {
    let current = true;
    const request = ++generation.current;
    const storedToken =
      useAuthStore.getState().token || localStorage.getItem("auth_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchCurrentUser(storedToken)
      .then(({ data }) => {
        if (!current || request !== generation.current) return;
        const verifiedUser = sessionUser(data);
        useAuthStore.getState().login(verifiedUser, storedToken);
        writeRouteCookies(verifiedUser.role);
        ["auth_token", "user_role", "user_uuid"].forEach((key) =>
          localStorage.removeItem(key),
        );
        setAuthError(null);
      })
      .catch((error: unknown) => {
        if (!current || request !== generation.current) return;
        if (error instanceof ApiError && error.status === 401) logout();
        else setAuthError(errorMessage(error));
      })
      .finally(() => {
        if (current && request === generation.current) setIsLoading(false);
      });
    return () => {
      current = false;
    };
  }, [attempt, logout]);

  useEffect(() => {
    const expired = (event: Event) => {
      if (
        (event as CustomEvent<{ token: string }>).detail.token ===
        useAuthStore.getState().token
      )
        logout();
    };
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token && user),
        isLoading,
        authError,
        token,
        userRole: user?.role || null,
        userId: user?.id || null,
        setManualToken,
        hasLoginPassword,
        completeOnboarding,
        logout,
        retrySession: () => setAttempt((value) => value + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
