/**
 * MyMasterclass — Mentorships API Service
 *
 * All CRUD operations for Mentorships.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import { transformMentorshipFromAPI } from "@/lib/transforms";
import type {
  ApiMentorship,
  ApiListResponse,
  ApiSingleResponse,
  Mentorship,
} from "@/types";

// The updated document has no admin pairing-list replacement. Retain the legacy route pending backend confirmation.
const BASE = "/myMasterclass";

/** Fetch all mentorships */
export async function fetchMentorships(token: string): Promise<Mentorship[]> {
  return (await apiCollection<ApiMentorship>(`${BASE}/mentorships`, token)).map(
    transformMentorshipFromAPI,
  );
}

/** Create a new mentorship pairing */
export async function createMentorship(
  token: string,
  payload: {
    title?: string;
    mentor_id: string | number;
    mentee_id: string | number;
    description?: string;
    status?: string;
  },
): Promise<Mentorship> {
  const response = await apiCall<ApiSingleResponse<ApiMentorship>>(
    `${BASE}/mentorships`,
    {
      method: "POST",
      body: JSON.stringify({
        title: payload.title || "Mentorship Program",
        mentor_id: payload.mentor_id,
        mentee_id: payload.mentee_id,
        description: payload.description || "Active mentorship relationship",
        status: payload.status || "active",
      }),
    },
    token,
  );
  return transformMentorshipFromAPI(
    apiEntity<ApiMentorship>(response, "mentorship"),
  );
}
