/**
 * MyMasterclass — Goals API Service
 *
 * All CRUD operations for Goals and Goal Categories.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import {
  transformGoalFromAPI,
  transformGoalCategoryFromAPI,
} from "@/lib/transforms";
import type {
  ApiGoal,
  ApiGoalCategory,
  ApiListResponse,
  ApiProfile,
  Goal,
  GoalCategory,
  CreateGoalPayload,
} from "@/types";

const BASE = "/v1";

// ── User Profile ───────────────────────────────────────────

/** Fetch the logged-in user's profile (returns UUID needed for goal creation) */
export async function fetchUserProfile(
  token: string,
): Promise<ApiProfile["user"]> {
  const response = await apiCall<{ data: ApiProfile }>(
    `/v1/me`,
    { method: "GET" },
    token,
  );
  return response.data.user;
}

// ── Goals ──────────────────────────────────────────────────

/** Fetch all goals */
export async function fetchGoals(
  token: string,
  userId?: string,
): Promise<Goal[]> {
  return (
    await apiCollection<ApiGoal>(
      `${BASE}/goals${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`,
      token,
    )
  ).map(transformGoalFromAPI);
}

/** Fetch a single goal by ID */
export async function fetchGoal(token: string, id: number): Promise<Goal> {
  const response = await apiCall<{ data: ApiGoal }>(
    `${BASE}/goals/${id}`,
    { method: "GET" },
    token,
  );
  return transformGoalFromAPI(apiEntity<ApiGoal>(response, "goal"));
}

/** Create a new goal */
export async function createGoal(
  token: string,
  payload: CreateGoalPayload,
): Promise<Goal> {
  const response = await apiCall<{ data: ApiGoal }>(
    `${BASE}/goals`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformGoalFromAPI(apiEntity<ApiGoal>(response, "goal"));
}

/** Update an existing goal */
export async function updateGoal(
  token: string,
  id: number,
  payload: Partial<CreateGoalPayload>,
): Promise<Goal> {
  const response = await apiCall<{ data: ApiGoal }>(
    `${BASE}/goals/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformGoalFromAPI(apiEntity<ApiGoal>(response, "goal"));
}

/** Delete a goal */
export async function deleteGoal(token: string, id: number): Promise<void> {
  await apiCall(`${BASE}/goals/${id}`, { method: "DELETE" }, token);
}

// ── Goal Categories ────────────────────────────────────────

/** Default choices are active only; admin management can include inactive records. */
export async function fetchGoalCategories(
  token: string,
  includeInactive = false,
): Promise<GoalCategory[]> {
  return (
    await apiCollection<ApiGoalCategory>(
      `${BASE}/goal-categories${includeInactive ? "?include_inactive=1" : ""}`,
      token,
    )
  ).map(transformGoalCategoryFromAPI);
}

export async function createGoalCategory(
  token: string,
  payload: { name: string; description: string; is_active: boolean },
) {
  const response = await apiCall<{ data: ApiGoalCategory }>(
    `${BASE}/goal-categories`,
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
  return transformGoalCategoryFromAPI(
    apiEntity<ApiGoalCategory>(response, "category"),
  );
}
export async function updateGoalCategory(
  token: string,
  id: number,
  payload: { name?: string; description?: string; is_active?: boolean },
) {
  const response = await apiCall<{ data: ApiGoalCategory }>(
    `${BASE}/goal-categories/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    token,
  );
  return transformGoalCategoryFromAPI(
    apiEntity<ApiGoalCategory>(response, "category"),
  );
}
export function deleteGoalCategory(token: string, id: number, hard = false) {
  const query = hard ? "?hard=1" : "";
  return apiCall(`${BASE}/goal-categories/${id}${query}`, { method: "DELETE" }, token);
}
