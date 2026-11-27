"use client";

import {
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/engagement";
import { ApiState, formatDateTime } from "@/components/shared/ApiUI";
export default function NotificationsPage() {
  const { token } = useAuth();
  const resource = useApiResource("notifications", fetchNotifications);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [locallyReadIds, setLocallyReadIds] = useState<string[]>([]);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const notifications = (resource.data || []).map((n) => ({
    ...n,
    isRead: n.isRead || locallyReadIds.includes(String(n.id)),
  }));
  const unread = notifications.filter((n) => !n.isRead).length;
  const handleMarkAllRead = async () => {
    if (unread === 0 || markingAllRead) return;
    setMarkingAllRead(true);
    try {
      if (token) {
        await markAllNotificationsRead(token);
      }
      setLocallyReadIds(notifications.map((n) => String(n.id)));
      resource.reload();
    } catch {
      setLocallyReadIds(notifications.map((n) => String(n.id)));
    } finally {
      setMarkingAllRead(false);
    }
  };
  const handleMarkSingleRead = async (id: string | number, isRead: boolean) => {
    if (isRead) return;
    const idStr = String(id);
    if (!locallyReadIds.includes(idStr)) {
      setLocallyReadIds((prev) => [...prev, idStr]);
    }
    if (token) {
      try {
        await markNotificationRead(token, id);
      } catch {}
    }
  };
  const filtered = notifications.filter(
    (n) =>
      (filter === "All" || (filter === "Read" ? n.isRead : !n.isRead)) &&
      `${n.title} ${n.message}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  return (
    <div className="w-full pb-10">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 md:gap-0">
        {/* Search */}
        <div className="relative w-full max-w-full md:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#DB911E]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-full sm:w-auto overflow-x-auto custom-scrollbar">
            <button
              onClick={() => {
                setFilter("All");
                setPage(1);
              }}
              aria-pressed={filter === "All"}
              className={`px-3 md:px-4 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-md transition-colors whitespace-nowrap ${
                filter === "All"
                  ? "bg-[#F8F7F5] text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All ({resource.data ? notifications.length : "—"})
            </button>
            <button
              onClick={() => {
                setFilter("Unread");
                setPage(1);
              }}
              aria-pressed={filter === "Unread"}
              className={`px-3 md:px-4 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-md transition-colors whitespace-nowrap ${
                filter === "Unread"
                  ? "bg-[#F8F7F5] text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Unread ({resource.data ? unread : "—"})
            </button>
            <button
              onClick={() => {
                setFilter("Read");
                setPage(1);
              }}
              aria-pressed={filter === "Read"}
              className={`px-3 md:px-4 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-md transition-colors whitespace-nowrap ${
                filter === "Read"
                  ? "bg-[#F8F7F5] text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Read ({resource.data ? notifications.length - unread : "—"})
            </button>
          </div>

          <button
            type="button"
            disabled={unread === 0 || markingAllRead}
            onClick={handleMarkAllRead}
            className="disabled:opacity-50 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] md:text-[12.5px] font-medium text-gray-700 font-sans hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            {markingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {markingAllRead ? "Marking..." : "Mark all read"}
          </button>
        </div>
      </div>

      <ApiState {...resource} onRetry={resource.reload} />
      <div className="space-y-4">
        {!resource.loading && !resource.error && filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
            No notifications found.
          </div>
        )}
        {filtered.slice((current - 1) * 10, current * 10).map((n) => (
          <div
            key={n.id}
            onClick={() => void handleMarkSingleRead(n.id, n.isRead)}
            className={`rounded-[14px] p-5 md:p-6 border cursor-pointer transition-colors ${n.isRead ? "bg-white border-gray-200" : "bg-[#FEFBF6] border-[#DB911E]"}`}
          >
            <div className="flex items-start gap-3.5">
              {n.isRead ? (
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-[#DB911E]" />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{n.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <p className="mt-3 text-xs text-gray-400">
                  {formatDateTime(n.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1 mt-8">
        <button
          aria-label="Previous notifications page"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            aria-current={number === current ? "page" : undefined}
            onClick={() => setPage(number)}
            className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] ${number === current ? "bg-[#DB911E] text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {number}
          </button>
        ))}
        <button
          aria-label="Next notifications page"
          disabled={current >= pages}
          onClick={() => setPage(current + 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-600"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
