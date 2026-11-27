"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/shared/AppLink";
import { Modal, ApiState, inputClass } from "@/components/shared/ApiUI";
import { useApiResource } from "@/hooks/useApiResource";
import { searchPlatform, type SearchResult } from "@/lib/services/engagement";
import type { UserRole } from "@/lib/auth";

/** Routes are constructed locally; API strings never become external links. */
function resultRoute(item: SearchResult, role: UserRole): string | null {
  const prefix = `/${role.toLowerCase()}`;
  const type = item.type.toLowerCase();
  if (type === "mentor")
    return role === "MENTEE"
      ? `${prefix}/mentors`
      : role === "ADMIN"
        ? `${prefix}/users`
        : null;
  if (type === "mentee" || type === "user")
    return role === "ADMIN"
      ? `${prefix}/users`
      : role === "MENTOR"
        ? `${prefix}/mentees/${encodeURIComponent(String(item.id))}`
        : null;
  if (type === "cohort") return role === "ADMIN" ? `${prefix}/cohorts` : null;
  const pages: Record<string, string> = {
    goal: "goals",
    session: "sessions",
    reflection: "reflections",
    certificate: "certificates",
  };
  if (role === "ADMIN" && ["goal", "session", "reflection"].includes(type))
    return null;
  return pages[type] ? `${prefix}/${pages[type]}` : null;
}
export function GlobalSearch({
  role,
  onClose,
}: {
  role: UserRole;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const resource = useApiResource(
    `search:${debounced}`,
    (token) => searchPlatform(token, debounced),
    debounced.length >= 2,
  );
  const current = debounced === query.trim() && debounced.length >= 2;
  return (
    <Modal title="Search" onClose={onClose}>
      <label htmlFor="global-search" className="sr-only">
        Search the platform
      </label>
      <input
        ref={input}
        id="global-search"
        autoFocus
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people, sessions, goals…"
      />
      {query.trim().length < 2 ? (
        <p className="mt-4 text-sm text-gray-500">
          Enter at least two characters.
        </p>
      ) : !current ? (
        <p role="status" className="mt-4 text-sm text-gray-500">
          Searching…
        </p>
      ) : (
        <>
          <ApiState {...resource} onRetry={resource.reload} />
          {!resource.loading &&
            !resource.error &&
            resource.data?.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">No results found.</p>
            )}
          <ul className="mt-4 divide-y divide-gray-100">
            {(resource.data || []).map((item) => {
              const href = resultRoute(item, role);
              const content = (
                <>
                  <span className="block font-medium text-gray-900">
                    {item.title}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {item.subtitle || item.type}
                  </span>
                </>
              );
              return (
                <li key={`${item.type}:${item.id}`}>
                  {href ? (
                    <Link
                      href={href}
                      onClick={onClose}
                      className="block rounded-lg p-3 hover:bg-gray-50"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="p-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Modal>
  );
}
