import { apiCall } from "@/lib/api";
export interface EngagementReport {
  summary?: Record<string, unknown>;
  participants?: Array<Record<string, unknown>>;
  cohorts?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}
export function fetchEngagementReport(token: string) {
  return apiCall<{ data: EngagementReport }>(
    "/v1/admin/reports/engagement",
    {},
    token,
  ).then((response) => response.data);
}
export interface EngagementHistoryItem {
  week: string;
  sessions: number;
}

export function fetchEngagementHistory(
  token: string,
): Promise<EngagementHistoryItem[]> {
  return apiCall<{
    data: EngagementHistoryItem[] | { data: EngagementHistoryItem[] };
  }>("/v1/admin/analytics/engagement-history", {}, token).then((response) => {
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (
      raw &&
      typeof raw === "object" &&
      "data" in raw &&
      Array.isArray(raw.data)
    ) {
      return raw.data as EngagementHistoryItem[];
    }
    return [];
  });
}

export function downloadEngagementCsv(token: string) {
  return apiCall<Blob>(
    "/v1/admin/reports/engagement.csv",
    { headers: { Accept: "text/csv, application/json" } },
    token,
    "blob",
  );
}
