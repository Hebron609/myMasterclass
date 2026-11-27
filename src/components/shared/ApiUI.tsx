"use client";
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export const inputClass =
  "w-full rounded-[8px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DB911E]/40 disabled:bg-gray-50 disabled:text-gray-500";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#DB911E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#BA7815] disabled:opacity-50 disabled:cursor-not-allowed";
export const secondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-[8px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50";
export const cardClass =
  "rounded-[16px] border border-gray-200 bg-white p-6 shadow-sm";
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
      {children}
    </p>
  );
}
export function ApiState({
  loading,
  error,
  onRetry,
  skeleton,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
}) {
  if (loading) {
    if (skeleton) return <>{skeleton}</>;
    return null;
  }
  if (error)
    return (
      <div
        role="alert"
        className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {error}
        {onRetry && (
          <button onClick={onRetry} className="ml-3 underline">
            Retry
          </button>
        )}
      </div>
    );
  return null;
}
export function FormError({ message }: { message: string | null }) {
  return message ? (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {message}
    </p>
  ) : null;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className="space-y-2 text-sm font-medium text-gray-700">
      <label htmlFor={id} className="block">
        {label}
      </label>
      {cloneElement(children, { id })}
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
  busy = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const elements = ref.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]",
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-white p-6 shadow-2xl outline-none"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button aria-label="Close" disabled={busy} onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export function PhaseNotice({ feature }: { feature: string }) {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-lg font-medium">{feature}</h2>
      <Notice>{feature} will be available in a future release.</Notice>
    </div>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
export function formatDateTime(value?: string | null) {
  if (!value) return "Time not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time not provided"
    : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}
export function safeWebUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
/** Preserve a datetime-local input's local timezone when sending UTC to the API. */
export function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
