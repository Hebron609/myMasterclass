/**
 * MyMasterclass — Programs API Service
 *
 * All CRUD operations for Programs.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import { transformProgramFromAPI } from "@/lib/transforms";
import type {
  ApiProgram,
  ApiListResponse,
  Program,
  CreateProgramPayload,
} from "@/types";

const BASE = "/v1";

/** Fetch all programs */
export async function fetchPrograms(token: string): Promise<Program[]> {
  return (await apiCollection<ApiProgram>(`${BASE}/programs`, token)).map(
    transformProgramFromAPI,
  );
}

/** Fetch a single program by ID */
export async function fetchProgram(
  token: string,
  id: number,
): Promise<Program> {
  const response = await apiCall<{ data: ApiProgram }>(
    `${BASE}/programs/${id}`,
    { method: "GET" },
    token,
  );
  return transformProgramFromAPI(apiEntity<ApiProgram>(response, "program"));
}

/** Create a new program */
export async function createProgram(
  token: string,
  payload: CreateProgramPayload,
): Promise<Program> {
  const response = await apiCall<{ data: ApiProgram }>(
    `${BASE}/programs`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformProgramFromAPI(apiEntity<ApiProgram>(response, "program"));
}

/** Update an existing program */
export async function updateProgram(
  token: string,
  id: number,
  payload: Partial<CreateProgramPayload>,
): Promise<Program> {
  const response = await apiCall<{ data: ApiProgram }>(
    `${BASE}/programs/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformProgramFromAPI(apiEntity<ApiProgram>(response, "program"));
}

/** Delete a program */
export async function deleteProgram(token: string, id: number): Promise<void> {
  await apiCall(`${BASE}/programs/${id}`, { method: "DELETE" }, token);
}
