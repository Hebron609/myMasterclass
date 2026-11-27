import { apiCall } from "@/lib/api";

export function updateAccount(
  token: string,
  payload: { first_name?: string; last_name?: string; phone?: string },
) {
  return apiCall<{
    data: { account: Record<string, unknown> };
  }>(
    "/settings/account",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function uploadAvatar(token: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await apiCall<{
    data: { id?: string | number; url?: string; file?: { url?: string } };
  }>("/files", { method: "POST", body }, token);
  let url = response.data?.url || response.data?.file?.url;

  if (!url && response.data?.id) {
    try {
      const downloadRes = await apiCall<{
        data: { url?: string };
      }>(`/files/${response.data.id}/download`, {}, token);
      url = downloadRes.data?.url;
    } catch {
      // Fallback check below
    }
  }

  if (!url || !/^https?:\/\//i.test(url))
    throw new Error(
      "The upload service did not return a photo URL. Please try again or contact support.",
    );
  await apiCall(
    "/v1/me/profile",
    {
      method: "PATCH",
      body: JSON.stringify({ avatar_url: url }),
    },
    token,
  );
  return url;
}
