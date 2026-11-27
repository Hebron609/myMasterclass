/**
 * MyMasterclass — Sessions API Service
 *
 * All CRUD operations for Sessions.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import { transformSessionFromAPI } from "@/lib/transforms";
import type {
  ApiSession,
  ApiListResponse,
  Session,
  CreateSessionPayload,
} from "@/types";

const BASE = "/v1";

/** Fetch all sessions */
export async function fetchSessions(
  token: string,
  filter?: "upcoming" | "past" | "completed",
): Promise<Session[]> {
  const query = `?tab=${filter === "upcoming" ? "upcoming" : filter ? "history" : "mentorship"}`;
  return (
    await apiCollection<ApiSession>(`${BASE}/sessions${query}`, token)
  ).map(transformSessionFromAPI);
}

export async function logSession(
  token: string,
  id: string | number,
  payload: {
    discussion_summary?: string;
    action_points?: string;
    follow_up_notes?: string;
    status: "completed";
  },
): Promise<Session> {
  const response = await apiCall<{ data: ApiSession }>(
    `${BASE}/sessions/${encodeURIComponent(String(id))}/log`,
    { method: "PATCH", body: JSON.stringify(payload) },
    token,
  );
  return transformSessionFromAPI(apiEntity<ApiSession>(response, "session"));
}

/** Fetch a single session by ID */
export async function fetchSession(
  token: string,
  id: string | number,
): Promise<Session> {
  const response = await apiCall<{ data: ApiSession }>(
    `${BASE}/sessions/${encodeURIComponent(String(id))}`,
    { method: "GET" },
    token,
  );
  return transformSessionFromAPI(apiEntity<ApiSession>(response, "session"));
}

/** Create a new session */
export async function createSession(
  token: string,
  payload: CreateSessionPayload,
): Promise<Session> {
  const response = await apiCall<{ data: ApiSession }>(
    `${BASE}/sessions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformSessionFromAPI(apiEntity<ApiSession>(response, "session"));
}

/** Update an existing session */
export async function updateSession(
  token: string,
  id: string | number,
  payload: Partial<CreateSessionPayload>,
): Promise<Session> {
  const response = await apiCall<{ data: ApiSession }>(
    `/myMasterclass/sessions/manage/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformSessionFromAPI(apiEntity<ApiSession>(response, "session"));
}

/** Delete a session */
export async function deleteSession(
  token: string,
  id: string | number,
): Promise<void> {
  await apiCall(
    `/myMasterclass/sessions/manage/${encodeURIComponent(String(id))}`,
    { method: "DELETE" },
    token,
  );
}

export interface RescheduleSessionPayload {
  proposed_date: string;
  proposed_time: string;
  note?: string;
}

export async function rescheduleSession(
  token: string,
  id: string | number,
  payload: RescheduleSessionPayload,
): Promise<{ message?: string; data?: unknown }> {
  return apiCall(
    `${BASE}/sessions/${encodeURIComponent(String(id))}/reschedule`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}
