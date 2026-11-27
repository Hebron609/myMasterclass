import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import type {
  ApiListResponse,
  ApiSingleResponse,
  ApiUser,
  User,
} from "@/types";
import { transformUserFromAPI } from "@/lib/transforms";

export interface CreateAdminUserPayload {
  role: "mentor" | "mentee";
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  journey_year?: number;
  cohort_id?: number;
  mentor_id?: string;
}

export interface UpdateAdminUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: "mentor" | "mentee";
  cohort_id?: number;
  status?: "active" | "inactive";
}

export function fetchAdminUsers(
  token: string,
  params: {
    role?: "mentor" | "mentee";
    cohort_id?: number;
    status?: string;
    per_page?: number;
  } = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiCollection<ApiUser>(`/v1/admin/users${suffix}`, token).then(
    (users) => users.map(transformUserFromAPI),
  );
}

export function createAdminUser(
  token: string,
  payload: CreateAdminUserPayload,
) {
  const body: Record<string, unknown> = {
    ...payload,
    name: `${payload.first_name} ${payload.last_name}`.trim(),
  };
  if (!payload.password) {
    delete body.password;
    delete body.password_confirmation;
  }
  return apiCall<
    ApiSingleResponse<
      ApiUser & { temporary_password?: string; must_change_password?: boolean }
    >
  >(
    "/v1/admin/users",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token,
  ).then(
    (
      response,
    ): User & {
      temporary_password?: string;
      must_change_password?: boolean;
    } => {
      const rawUser = apiEntity<
        ApiUser & { temporary_password?: string; must_change_password?: boolean }
      >(response, "user");
      const user = transformUserFromAPI(rawUser);
      const tempPass =
        rawUser.temporary_password ||
        (response as { data?: { temporary_password?: string } })?.data
          ?.temporary_password;
      const mustChange =
        rawUser.must_change_password ??
        (response as { data?: { must_change_password?: boolean } })?.data
          ?.must_change_password;
      return {
        ...user,
        temporary_password: tempPass,
        must_change_password: mustChange,
      };
    },
  );
}

export function updateAdminUser(
  token: string,
  id: string | number,
  payload: UpdateAdminUserPayload,
) {
  return apiCall<ApiSingleResponse<ApiUser>>(
    `/v1/admin/users/${encodeURIComponent(String(id))}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  ).then((response): User =>
    transformUserFromAPI(apiEntity<ApiUser>(response, "user")),
  );
}

export function deleteAdminUser(
  token: string,
  id: string | number,
  options: { hard?: boolean } = {},
) {
  const query = options.hard ? "?hard=1" : "";
  return apiCall(
    `/v1/admin/users/${encodeURIComponent(String(id))}${query}`,
    { method: "DELETE" },
    token,
  );
}

export function importAdminUsers(token: string, file: File | Blob) {
  const formData = new FormData();
  formData.append("file", file);
  return apiCall<{ data?: Record<string, unknown>; message?: string }>(
    "/v1/admin/users/import",
    {
      method: "POST",
      body: formData,
    },
    token,
  );
}

export function assignMentor(
  token: string,
  payload: {
    mentor_id: string;
    mentee_id: string;
    title?: string;
    description?: string;
  },
) {
  return apiCall<ApiSingleResponse<Record<string, unknown>>>(
    "/v1/admin/assign-mentor",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}

export function reassignMentor(
  token: string,
  payload: {
    mentor_id: string;
    mentee_id: string;
    title?: string;
    description?: string;
  },
) {
  return apiCall(
    "/v1/admin/reassign-mentor",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}
export function fetchAdminOverview(token: string) {
  return apiCall<{ data: Record<string, unknown> }>(
    "/v1/admin/overview",
    {},
    token,
  ).then((response) => response.data);
}
export function fetchAdminActivity(token: string) {
  return apiCall<{ data: Record<string, unknown> }>(
    "/v1/admin/activity",
    {},
    token,
  ).then((response) => response.data);
}

export interface AdminPreferences {
  email_digest?: boolean;
  public_participant_profiles?: boolean;
  auto_match?: boolean;
  [key: string]: unknown;
}

export function updateAdminPreferences(
  token: string,
  payload: AdminPreferences,
) {
  return apiCall<{ data: { preferences: AdminPreferences } }>(
    "/settings/preferences",
    { method: "PUT", body: JSON.stringify(payload) },
    token,
  );
}

export function messageAdminUser(
  token: string,
  userId: string | number,
  payload: { body: string; title?: string },
) {
  return apiCall<{ data?: Record<string, unknown>; message?: string }>(
    `/v1/admin/users/${encodeURIComponent(String(userId))}/message`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}
