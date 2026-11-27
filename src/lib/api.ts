/**
 * Centralized MyMasterclass API client.
 *
 * Every request uses the suite's JSON envelope and, when supplied, the
 * Bearer token returned by POST /api/auth/login.
 */
// next.config.ts forwards this fixed prefix to the configured API host.
// This works on any frontend port without cross-origin browser requests.
const BASE_URL = "/backend-api";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const fields = Object.values(error.errors).flat().join(" ");
    return fields ? `${error.message} ${fields}` : error.message;
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/** Live resources use data.program/data.cohort/etc.; accept documented flat data too. */
export function apiEntity<T>(response: unknown, key: string): T {
  const data = (response as { data?: Record<string, unknown> } | null)?.data;
  const entity = data?.[key] ?? data;
  if (
    !entity ||
    typeof entity !== "object" ||
    Array.isArray(entity) ||
    !["string", "number"].includes(typeof (entity as { id?: unknown }).id)
  ) {
    throw new ApiError(
      "The service returned an invalid resource response. Please contact support.",
      200,
    );
  }
  return entity as T;
}

export async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
  responseType: "json" | "blob" | "pdf" = "json",
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot connect to the service through this app. Please try again or contact support.",
      0,
    );
  }

  if (response.status === 204) return {} as T;

  const contentType = response.headers.get("content-type") || "";
  if (response.ok && responseType !== "json") {
    if (responseType === "pdf") {
      if (!contentType.includes("application/pdf"))
        throw new ApiError(
          "The service did not return a PDF file.",
          response.status,
        );
      return (await response.blob()) as T;
    }
    if (
      !contentType.includes("text/csv") &&
      !contentType.includes("application/csv") &&
      !contentType.includes("application/octet-stream")
    ) {
      throw new ApiError(
        "The service did not return a CSV file. Please contact support.",
        response.status,
      );
    }
    return (await response.blob()) as T;
  }
  let body: unknown;
  try {
    body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    throw new ApiError(
      "The service returned invalid JSON. Please contact support.",
      response.status,
    );
  }

  if (!response.ok) {
    if (response.status === 401 && token && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-expired", { detail: { token } }),
      );
    }
    const errorBody =
      typeof body === "object" && body !== null
        ? (body as { message?: string; errors?: Record<string, string[]> })
        : {};
    throw new ApiError(
      errorBody.message ||
        `API Error: ${response.status} ${response.statusText}`,
      response.status,
      errorBody.errors || {},
    );
  }

  if (!contentType.includes("application/json")) {
    throw new ApiError(
      "The service returned an unexpected response. Please contact support.",
      response.status,
    );
  }

  return body as T;
}

/** Laravel resource collections and paginators. Never follow a response URL with a bearer token. */
export async function apiCollection<T>(
  endpoint: string,
  token: string,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= 100; page++) {
    const path =
      page === 1
        ? endpoint
        : `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}`;
    const response = await apiCall<{
      data:
        | T[]
        | {
            data?: T[];
            items?: T[];
            meta?: { current_page?: number; last_page?: number };
            current_page?: number;
            last_page?: number;
            next_page_url?: string | null;
          };
      meta?: { current_page?: number; last_page?: number };
      links?: { next?: string | null };
      current_page?: number;
      last_page?: number;
      next_page_url?: string | null;
    }>(path, {}, token);
    const nested = Array.isArray(response.data) ? null : response.data;
    const rows = nested ? (nested.items ?? nested.data) : response.data;
    if (!Array.isArray(rows))
      throw new ApiError("The service returned an invalid list response.", 200);
    items.push(...rows);
    const pagination = response.meta || nested?.meta || nested || response;
    const lastPage = pagination.last_page;
    const hasNext =
      lastPage !== undefined
        ? page < lastPage
        : Boolean(
            nested?.next_page_url ||
            response.next_page_url ||
            response.links?.next,
          );
    if (!hasNext) return items;
  }
  throw new ApiError(
    "Too many result pages. Please narrow the selection.",
    200,
  );
}
