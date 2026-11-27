import { apiCall } from "@/lib/api";

export interface DashboardPayload {
  [key: string]: unknown;
}

export interface LeaderboardPayload {
  items: Array<Record<string, unknown>>;
  current_user?: Record<string, unknown>;
}

export function fetchDashboard(token: string) {
  return apiCall<{ data: DashboardPayload }>(
    "/v1/dashboard",
    { method: "GET" },
    token,
  );
}

export function fetchLeaderboard(token: string, cohortId?: number | string) {
  const query = cohortId
    ? `?cohort_id=${encodeURIComponent(String(cohortId))}`
    : "";
  return apiCall<{ data: LeaderboardPayload }>(
    `/v1/leaderboard${query}`,
    { method: "GET" },
    token,
  );
}
