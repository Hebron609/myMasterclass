import { apiCall, apiCollection, apiEntity, ApiError } from "@/lib/api";

export interface CertificateItem {
  id: string | number;
  user_id?: string;
  mentee_id?: string;
  title?: string;
  name?: string;
  certificate?: string | { title?: string; name?: string };
  status?: string;
  issue_date?: string;
  issued_at?: string;
  reference?: string;
  certificate_number?: string;
  description?: string;
  dedication?: string;
  signatory?: string;
  program?: { name?: string };
  cohort?: { name?: string };
  user?: { id?: string; name?: string; email?: string };
  mentee?: { id?: string; name?: string; email?: string };
  criteria?: Array<{ label: string; completed: boolean; description?: string }>;
}
export interface CertificateCatalog {
  items: CertificateItem[];
  summary?: {
    earned?: number;
    in_progress?: number;
    available_to_unlock?: number;
  };
}
export async function fetchCertificateCatalog(
  token: string,
  admin = false,
): Promise<CertificateCatalog> {
  const path = admin ? "/v1/admin/certificates" : "/v1/certificates";
  const response = await apiCall<{
    data: CertificateCatalog | CertificateItem[];
    meta?: { last_page?: number };
  }>(path, {}, token);
  const data = response.data;
  const items = Array.isArray(data) ? data : data?.items;
  if (!Array.isArray(items))
    throw new ApiError(
      "The service returned an invalid certificate list.",
      200,
    );
  const nested = data as CertificateCatalog & { meta?: { last_page?: number } };
  const all =
    (response.meta?.last_page || nested.meta?.last_page || 1) > 1
      ? await apiCollection<CertificateItem>(path, token)
      : items;
  return {
    items: all,
    summary: Array.isArray(data) ? undefined : data.summary,
  };
}
export const fetchMyCertificates = (token: string) =>
  fetchCertificateCatalog(token);
export const fetchAdminCertificates = (token: string) =>
  fetchCertificateCatalog(token, true);
export async function fetchCertificate(
  token: string,
  id: string | number,
): Promise<CertificateItem> {
  const response = await apiCall(
    `/v1/certificates/${encodeURIComponent(String(id))}`,
    {},
    token,
  );
  return apiEntity<CertificateItem>(response, "certificate");
}
export const certificateTitle = (item: CertificateItem) =>
  item.title ||
  item.name ||
  (typeof item.certificate === "string"
    ? item.certificate
    : item.certificate?.title || item.certificate?.name) ||
  "Certificate";
export const certificateStatus = (item: CertificateItem) =>
  (item.status || (item.issued_at || item.issue_date ? "issued" : "unknown"))
    .toLowerCase()
    .replace(/ /g, "_");
export function downloadCertificate(token: string, id: string | number) {
  return apiCall<Blob>(
    `/v1/certificates/${encodeURIComponent(String(id))}/download`,
    {},
    token,
    "pdf",
  );
}
export async function shareCertificate(token: string, id: string | number) {
  const response = await apiCall<{
    data: { url?: string; share_url?: string };
  }>(`/v1/certificates/${encodeURIComponent(String(id))}/share`, {}, token);
  const url = response.data?.share_url || response.data?.url;
  if (!url || !/^https?:\/\//i.test(url))
    throw new Error("The service did not return a valid sharing link.");
  return url;
}
export function requestCertificate(token: string, id: string | number) {
  return apiCall(
    `/v1/certificates/${encodeURIComponent(String(id))}/request`,
    { method: "POST" },
    token,
  );
}

export function endorseCertificate(
  token: string,
  id: string | number,
  payload: { notes?: string } = {},
) {
  return apiCall(
    `/v1/certificates/${encodeURIComponent(String(id))}/endorse`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

/** Required issuing fields confirmed by the backend status document. */
export async function issueCertificate(
  token: string,
  payload: {
    user_id: string;
    title: string;
    issue_date?: string;
    dedication?: string;
    signatory?: string;
    notify_by_email?: boolean;
  },
) {
  const body: Record<string, unknown> = {
    user_id: payload.user_id,
    title: payload.title,
  };
  if (payload.issue_date) body.issue_date = payload.issue_date;
  if (payload.dedication) body.dedication = payload.dedication;
  if (payload.signatory) body.signatory = payload.signatory;
  if (payload.notify_by_email !== undefined)
    body.notify_by_email = payload.notify_by_email;

  const response = await apiCall(
    "/v1/admin/certificates",
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
  return apiEntity<CertificateItem>(response, "certificate");
}
