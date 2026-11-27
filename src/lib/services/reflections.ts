/**
 * MyMasterclass — Reflections API Service
 *
 * All CRUD operations for Reflections & Mentorship Feedback.
 * Uses the centralized apiCall() client with Bearer token auth.
 */

import { apiCall, apiCollection, apiEntity } from "@/lib/api";
import {
  transformReflectionFromAPI,
  transformFeedbackFromAPI,
} from "@/lib/transforms";
import type {
  ApiReflection,
  ApiFeedback,
  ApiListResponse,
  ApiSingleResponse,
  Reflection,
  Feedback,
  CreateReflectionPayload,
  RespondReflectionPayload,
  SubmitFeedbackPayload,
} from "@/types";

const BASE = "/v1";

/** Fetch all Reflections */
export async function fetchReflections(
  token: string,
  userId?: string,
): Promise<Reflection[]> {
  return (
    await apiCollection<ApiReflection>(
      `${BASE}/reflections${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`,
      token,
    )
  ).map(transformReflectionFromAPI);
}

export async function deleteReflection(
  token: string,
  reflectionId: string | number,
): Promise<void> {
  await apiCall(
    `${BASE}/reflections/${reflectionId}`,
    { method: "DELETE" },
    token,
  );
}

/** Create a new Reflection */
export async function createReflection(
  token: string,
  payload: CreateReflectionPayload,
): Promise<Reflection> {
  const response = await apiCall<ApiSingleResponse<ApiReflection>>(
    `${BASE}/reflections`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return transformReflectionFromAPI(
    apiEntity<ApiReflection>(response, "reflection"),
  );
}

export async function submitReflectionFeedback(
  token: string,
  id: string | number,
  feedbackText: string,
): Promise<Reflection> {
  const response = await apiCall<ApiSingleResponse<ApiReflection>>(
    `${BASE}/reflections/${encodeURIComponent(String(id))}/feedback`,
    {
      method: "POST",
      body: JSON.stringify({ feedback_text: feedbackText }),
    },
    token,
  );
  return transformReflectionFromAPI(
    apiEntity<ApiReflection>(response, "reflection"),
  );
}

export async function respondToReflection(
  token: string,
  id: string | number,
  payload: { feedback_text?: string; responseText?: string },
): Promise<Reflection> {
  const text = payload.feedback_text || payload.responseText || "";
  return submitReflectionFeedback(token, id, text);
}
export async function fetchFeedback(_token: string): Promise<Feedback[]> {
  throw new Error("Feedback is not available in Phase 1.");
}
export async function submitFeedback(
  _token: string,
  _payload: SubmitFeedbackPayload,
): Promise<Feedback> {
  throw new Error("Feedback is not available in Phase 1.");
}

export async function updateReflection(
  token: string,
  id: number,
  payload: CreateReflectionPayload,
): Promise<Reflection> {
  const response = await apiCall<ApiSingleResponse<ApiReflection>>(
    `${BASE}/reflections/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    token,
  );
  return transformReflectionFromAPI(
    apiEntity<ApiReflection>(response, "reflection"),
  );
}
