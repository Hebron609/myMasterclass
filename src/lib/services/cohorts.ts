/**
 * MyMasterclass — Cohorts API Service
 *
 * All CRUD operations for Cohorts.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import { transformCohortFromAPI } from "@/lib/transforms";
import type {
  ApiCohort,
  ApiListResponse,
  Cohort,
  CreateCohortPayload,
} from "@/types";

const BASE = "/v1";

/** Fetch all cohorts */
export async function fetchCohorts(token: string): Promise<Cohort[]> {
  return (await apiCollection<ApiCohort>(`${BASE}/cohorts`, token)).map(
    transformCohortFromAPI,
  );
}

/** Fetch a single cohort by ID */
export async function fetchCohort(token: string, id: number): Promise<Cohort> {
  const response = await apiCall<{ data: ApiCohort }>(
    `${BASE}/cohorts/${id}`,
    { method: "GET" },
    token,
  );
  return transformCohortFromAPI(apiEntity<ApiCohort>(response, "cohort"));
}

/** Create a new cohort */
export async function createCohort(
  token: string,
  payload: CreateCohortPayload,
): Promise<Cohort> {
  const response = await apiCall<{ data: ApiCohort }>(
    `${BASE}/cohorts`,
    {
      method: "POST",
      body: JSON.stringify({
        ...cohortBody(payload),
      }),
    },
    token,
  );
  return transformCohortFromAPI(apiEntity<ApiCohort>(response, "cohort"));
}

/** Update an existing cohort */
export async function updateCohort(
  token: string,
  id: number,
  payload: Partial<CreateCohortPayload>,
): Promise<Cohort> {
  const response = await apiCall<{ data: ApiCohort }>(
    `${BASE}/cohorts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(cohortBody(payload)),
    },
    token,
  );
  return transformCohortFromAPI(apiEntity<ApiCohort>(response, "cohort"));
}

/** Delete a cohort */
export async function deleteCohort(token: string, id: number): Promise<void> {
  await apiCall(`${BASE}/cohorts/${id}`, { method: "DELETE" }, token);
}

function cohortBody(payload: Partial<CreateCohortPayload>) {
  const { start_date, end_date, ...rest } = payload;
  return {
    ...rest,
    ...(start_date !== undefined ? { starts_at: start_date } : {}),
    ...(end_date !== undefined ? { ends_at: end_date } : {}),
  };
}
export function addCohortMember(token: string, id: number, userId: string) {
  return apiCall(
    `/v1/cohorts/${id}/members`,
    { method: "POST", body: JSON.stringify({ user_id: userId }) },
    token,
  );
}
export function removeCohortMember(token: string, id: number, userId: string) {
  return apiCall(
    `/v1/cohorts/${id}/members/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
    token,
  );
}
