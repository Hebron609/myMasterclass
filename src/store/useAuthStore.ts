import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Program } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  activeProgram: Program | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setActiveProgram: (program: Program) => void;
  verifySession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      activeProgram: null,
      login: (user, token) => {
        set({
          user,
          token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          // keep activeProgram as is if it exists, or null
        });
      },
      logout: () => {
        set({ user: null, token: null, expiresAt: null, activeProgram: null });
      },
      setActiveProgram: (program) => {
        set({ activeProgram: program });
      },
      verifySession: () => {
        const state = get();
        if (state.expiresAt && state.expiresAt < Date.now()) {
          set({ user: null, token: null, expiresAt: null, activeProgram: null });
          return false;
        }
        return !!state.user;
      },
    }),
    {
      name: "vision2535_auth_session", // unique name to match old key
      storage: createJSONStorage(() => sessionStorage), // persist in sessionStorage
    }
  )
);
