import { apiCall, apiCollection } from "@/lib/api";
import {
  transformUserFromAPI,
  transformGoalFromAPI,
  transformSessionFromAPI,
} from "@/lib/transforms";
import { fetchCurrentUser } from "./auth";
import type {
  ApiUser,
  ApiGoal,
  ApiSession,
  UpdateProfilePayload,
} from "@/types";
import { fetchAdminUsers } from "./admin";
import type { AvailabilitySlot } from "./availability";

export interface MyMentor {
  mentor: ApiUser | null;
  next_session?: ApiSession | null;
  open_slots?: AvailabilitySlot[];
}
export function fetchMyMentor(token: string) {
  return apiCall<{ data: MyMentor }>("/v1/mentorships/me", {}, token).then(
    (response) => response.data,
  );
}
/** The v1 API exposes the mentor directory directly. */
export async function fetchMentors(token: string) {
  return (await apiCollection<ApiUser>("/v1/mentors", token)).map(
    transformUserFromAPI,
  );
}
export async function fetchMentees(token: string) {
  const list = (await apiCollection<ApiUser>("/v1/mentees", token)).map(
    transformUserFromAPI,
  );
  const seen = new Map<string, ReturnType<typeof transformUserFromAPI>>();
  for (const item of list) {
    const key = String(item.id);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
    } else {
      seen.set(key, {
        ...existing,
        ...item,
        cohorts: item.cohorts?.length ? item.cohorts : existing.cohorts,
        journeyYear: item.journeyYear ?? existing.journeyYear,
        location:
          item.location && item.location !== "—"
            ? item.location
            : existing.location,
      });
    }
  }
  return Array.from(seen.values());
}
export const fetchUsers = (token: string) => fetchAdminUsers(token);

export async function fetchMentee(token: string, id: string) {
  const { data } = await apiCall<{
    data: {
      mentee?: ApiUser;
      user?: ApiUser;
      profile?: Record<string, unknown>;
      goals?: ApiGoal[];
      sessions?: ApiSession[];
      achievements?: Array<{
        title: string;
        year?: string | number;
        subtitle?: string;
        description?: string;
      }>;
      certificates?: Array<{
        id?: string | number;
        title?: string;
        name?: string;
        status?: string;
        issue_date?: string;
        issued_at?: string;
        description?: string;
      }>;
    };
  }>(`/v1/mentees/${encodeURIComponent(id)}`, {}, token);
  const user = data.mentee || data.user;
  if (!user)
    throw new Error(
      "The mentee response is missing the mentee account. Please contact support.",
    );
  const achievements = data.achievements || user.achievements || [];
  const certificates = data.certificates || user.certificates || [];
  return {
    user: transformUserFromAPI({
      ...user,
      achievements,
      certificates,
      profile: { ...user.profile, ...data.profile } as ApiUser["profile"],
    }),
    profile: data.profile,
    goals: (data.goals || []).map(transformGoalFromAPI),
    sessions: (data.sessions || []).map(transformSessionFromAPI),
    achievements,
    certificates,
  };
}
export async function updateProfile(
  token: string,
  _userId: string | number,
  payload: UpdateProfilePayload,
) {
  await apiCall(
    "/v1/me/profile",
    { method: "PUT", body: JSON.stringify(payload) },
    token,
  );
  const me = await fetchCurrentUser(token);
  return transformUserFromAPI({
    ...me.data.user,
    role: me.data.role || me.data.user.role,
    profile: me.data.profile as ApiUser["profile"],
  } as ApiUser);
}

export async function uploadAvatar(token: string, file: File | Blob) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiCall<{
    data?: {
      avatar_url?: string;
      url?: string;
      profile?: { avatar_url?: string };
    };
    avatar_url?: string;
  }>(
    "/v1/me/avatar",
    {
      method: "POST",
      body: formData,
    },
    token,
  );
}
