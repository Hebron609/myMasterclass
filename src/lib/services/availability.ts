import { apiCall, apiCollection } from "@/lib/api";

export interface AvailabilitySlot {
  id: number;
  mentor_id?: string;
  starts_at: string;
  ends_at: string;
  duration_minutes?: number;
  status?: string;
}

export function fetchAvailabilitySlots(token: string, mentorId?: string) {
  const path = mentorId
    ? `/v1/availability-slots/open?mentor_id=${encodeURIComponent(mentorId)}`
    : "/v1/availability-slots";
  return apiCollection<AvailabilitySlot>(path, token).then((data) => ({
    data,
  }));
}

export function createAvailabilitySlot(
  token: string,
  payload: Pick<AvailabilitySlot, "starts_at" | "ends_at"> & {
    duration_minutes?: number;
  },
) {
  return apiCall<{ data: AvailabilitySlot }>(
    "/v1/availability-slots",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}

export function deleteAvailabilitySlot(token: string, id: number) {
  return apiCall(`/v1/availability-slots/${id}`, { method: "DELETE" }, token);
}

export function bookSession(
  token: string,
  payload: { availability_slot_id: number; title: string; notes?: string },
) {
  return apiCall<{ data: Record<string, unknown> }>(
    "/v1/sessions/book",
    {
      method: "POST",
      body: JSON.stringify({
        availability_slot_id: payload.availability_slot_id,
        topic: payload.title,
        description: payload.notes,
        session_type: "mentorship",
      }),
    },
    token,
  );
}

/** The documented date/time booking path does not require an availability slot. */
export function bookSessionAtTime(
  token: string,
  payload: {
    topic: string;
    description?: string;
    session_type: string;
    date: string;
    time: string;
    mentor_id: string;
    mentee_id: string;
  },
) {
  return apiCall(
    "/v1/sessions/book",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}
