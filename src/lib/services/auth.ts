import { apiCall } from "@/lib/api";
import type { ApiSingleResponse } from "@/types";

export interface AuthUser {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  roles?: Array<string | { name: string }>;
  must_change_password?: boolean;
  [key: string]: unknown;
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  user: AuthUser;
}

export interface MasterclassMe {
  user: AuthUser;
  role?: string;
  profile?: Record<string, unknown>;
  mentor?: AuthUser | null;
  mentees?: AuthUser[];
  cohorts?: unknown[];
  must_change_password?: boolean;
}

export function normalizeRole(value: unknown): import("@/lib/auth").UserRole {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["owner", "admin", "administrator"].includes(raw)) return "ADMIN";
  if (
    ["lecturer", "teacher", "instructor", "facilitator", "mentor"].includes(raw)
  )
    return "MENTOR";
  if (["student", "learner", "mentee"].includes(raw)) return "MENTEE";
  throw new Error(
    "Your account does not have a supported dashboard role. Please contact support.",
  );
}

export function sessionUser(me: MasterclassMe): import("@/lib/auth").User {
  if (!me?.user?.id)
    throw new Error(
      "The current-user response is missing the user ID. Please contact support.",
    );
  const { user, profile } = me;
  const roleNames =
    user.roles?.map((role) => (typeof role === "string" ? role : role.name)) ||
    [];
  const role = normalizeRole(
    me.role ||
      profile?.role ||
      user.role ||
      roleNames.find((r) =>
        ["owner", "admin", "administrator", "mentor", "mentee"].includes(
          r.toLowerCase(),
        ),
      ),
  );
  const name =
    user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const [firstName, ...rest] = name.split(" ");
  const rawAvatar =
    profile?.avatar_url ||
    user.avatar_url ||
    (me as unknown as Record<string, unknown>).avatar_url ||
    profile?.avatar ||
    user.avatar ||
    user.profile_photo_url;
  const resolvedAvatar =
    typeof rawAvatar === "string" && rawAvatar.trim()
      ? rawAvatar.trim().startsWith("/storage/") ||
        rawAvatar.trim().startsWith("storage/")
        ? `https://appsuite.butterflytech.io/${rawAvatar.trim().replace(/^\/+/, "")}`
        : rawAvatar.trim()
      : undefined;
  return {
    id: String(user.id),
    email: user.email,
    firstName,
    lastName: rest.join(" "),
    role,
    avatarUrl: resolvedAvatar,
    mustChangePassword: Boolean(
      me.must_change_password ||
      profile?.must_change_password ||
      user.must_change_password,
    ),
    enrolledPrograms: [],
    journeyYear:
      typeof profile?.journey_year === "number"
        ? profile.journey_year
        : undefined,
  };
}

export function login(email: string, password: string) {
  return apiCall<ApiSingleResponse<LoginResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchCurrentUser(token: string) {
  return apiCall<ApiSingleResponse<MasterclassMe>>(
    "/v1/me",
    { method: "GET" },
    token,
  );
}

/** Suite route, deliberately outside /v1. Field validation errors remain visible. */
export function updatePassword(
  token: string,
  currentPassword: string,
  password: string,
  confirmation: string,
) {
  return apiCall(
    "/settings/account/password",
    {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      }),
    },
    token,
  );
}
