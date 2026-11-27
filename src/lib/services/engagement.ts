import { apiCall, apiCollection } from "@/lib/api";

export interface NotificationItem {
  id: string;
  type: "session" | "goal" | "message" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
const text = (value: unknown) => (typeof value === "string" ? value : "");
export async function fetchNotifications(
  token: string,
): Promise<NotificationItem[]> {
  const rows = await apiCollection<Record<string, unknown>>(
    "/v1/notifications",
    token,
  );
  return rows.map((row) => {
    const data =
      row.data && typeof row.data === "object"
        ? (row.data as Record<string, unknown>)
        : row;
    const type = text(data.type || row.type);
    return {
      id: String(row.id),
      type: (["session", "goal", "message"].includes(type)
        ? type
        : "system") as NotificationItem["type"],
      title: text(data.title || row.title),
      message: text(data.message || data.body || row.message),
      timestamp: text(row.created_at || data.created_at),
      isRead: row.is_read === true || Boolean(row.read_at),
    };
  });
}

export function markAllNotificationsRead(token: string) {
  return apiCall<{ data?: Record<string, unknown>; message?: string }>(
    "/v1/notifications/read-all",
    { method: "POST" },
    token,
  );
}

export function markNotificationRead(token: string, id: string | number) {
  return apiCall<{ data?: Record<string, unknown>; message?: string }>(
    `/v1/notifications/${encodeURIComponent(String(id))}/read`,
    { method: "PATCH" },
    token,
  );
}
export interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  subtitle?: string;
}
export function searchPlatform(token: string, query: string) {
  return apiCollection<SearchResult>(
    `/v1/search?q=${encodeURIComponent(query.trim())}`,
    token,
  );
}
export function fetchFollowUps(token: string) {
  return apiCollection<Record<string, unknown>>("/v1/follow-ups", token);
}

export interface CreateFollowUpPayload {
  user_id?: string;
  session_id?: string;
  body: string;
  title?: string;
}

export function createFollowUp(token: string, payload: CreateFollowUpPayload) {
  return apiCall(
    "/v1/follow-ups",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}
