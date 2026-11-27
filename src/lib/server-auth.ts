import crypto from "crypto";

const SECRET =
  process.env.APP_SIGNING_SECRET ||
  process.env.SMTP_PASS ||
  "vision2535-default-signing-secret-change-in-prod";

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://appsuite.butterflytech.io/api"
).replace(/\/+$/, "");

/** Hash a short-lived secret (like an OTP code) with SHA-256 */
export function hashCode(value: string): string {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

/** Create a stateless HMAC-SHA256 signed token with expiration */
export function signToken(
  payload: Record<string, unknown>,
  ttlMs: number,
): string {
  const data = { ...payload, exp: Date.now() + ttlMs };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

/** Verify a stateless HMAC-SHA256 signed token */
export function verifyToken<T extends Record<string, unknown>>(
  token: string,
): (T & { exp: number }) | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(encoded)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expBuf)
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as T & { exp: number };
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Simple in-memory rate limiter for public auth email endpoints */
const rateStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 10 * 60 * 1000,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Verify Bearer token against the upstream backend /v1/me */
export async function verifyBearerUser(
  req: Request,
  options: { requireAdmin?: boolean } = {},
): Promise<
  | { ok: true; role: string; token: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  try {
    const res = await fetch(`${API_BASE}/v1/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        status: 401,
        error: "Invalid or expired authentication token.",
      };
    }

    const json = (await res.json()) as {
      data?: {
        role?: string;
        user?: { role?: string; roles?: Array<string | { name?: string }> };
      };
    };
    const rawRole = String(
      json?.data?.role || json?.data?.user?.role || "",
    ).toLowerCase();
    const isAdmin = ["admin", "administrator", "owner", "super_admin"].includes(
      rawRole,
    );

    if (options.requireAdmin && !isAdmin) {
      return {
        ok: false,
        status: 403,
        error: "Administrator permission is required for this action.",
      };
    }

    return { ok: true, role: rawRole, token };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Unable to verify authentication with the backend service.",
    };
  }
}
