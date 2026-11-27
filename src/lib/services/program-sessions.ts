import { apiCall, apiCollection } from "@/lib/api";

export interface ProgramSession {
  id: string | number;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  duration_minutes?: number;
  session_type: string;
  cohort_id?: number | null;
  program_id?: number | null;
  location?: string;
  meeting_link?: string | null;
  status: string;
}
export type ProgramSessionPayload = Omit<ProgramSession, "id">;
export const fetchProgramSessions = (token: string, upcomingOnly = false) =>
  apiCollection<ProgramSession>(
    `/v1/sessions?tab=in_house${upcomingOnly ? "&from=" + new Date().toISOString() : ""}`,
    token,
  );
export function saveProgramSession(
  token: string,
  payload: ProgramSessionPayload,
  id?: string | number,
) {
  return apiCall<{ data: ProgramSession }>(
    id === undefined
      ? "/v1/sessions"
      : `/myMasterclass/admin/program-sessions/${encodeURIComponent(String(id))}`,
    {
      method: id === undefined ? "POST" : "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
}
export function deleteProgramSession(token: string, id: string | number) {
  return apiCall(
    `/myMasterclass/admin/program-sessions/${encodeURIComponent(String(id))}`,
    { method: "DELETE" },
    token,
  );
}
