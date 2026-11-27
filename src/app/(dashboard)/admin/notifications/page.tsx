"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/engagement";
import { ApiState, formatDateTime } from "@/components/shared/ApiUI";
export default function AdminNotificationsPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<"All" | "Unread" | "Read">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [locallyReadIds, setLocallyReadIds] = useState<string[]>([]);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const resource = useApiResource("notifications", fetchNotifications);
  const notifications = (resource.data || []).map((n) => {
    const isRead = n.isRead || locallyReadIds.includes(String(n.id));
    return {
      ...n,
      isRead,
      description: n.message,
      isUnread: !isRead,
      category: n.type,
      timeAgo: "",
      timestamp: formatDateTime(n.timestamp),
    };
  });
  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const readCount = notifications.filter((n) => !n.isUnread).length;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAllRead) return;
    setMarkingAllRead(true);
    try {
      if (token) {
        await markAllNotificationsRead(token);
      }
      setLocallyReadIds((resource.data || []).map((n) => String(n.id)));
      resource.reload();
    } catch {
      setLocallyReadIds((resource.data || []).map((n) => String(n.id)));
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkSingleRead = async (id: string | number, isUnread: boolean) => {
    if (!isUnread) return;
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

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "All" ? true : filter === "Unread" ? n.isUnread : !n.isUnread;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="w-full max-w-full pb-14 font-sans animate-in fade-in duration-200">
      <ApiState {...resource} onRetry={resource.reload} />
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 md:gap-0">
        {/* Search */}
        <div className="relative w-full max-w-full md:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-sans text-[#111928] placeholder:text-gray-400 focus:outline-none focus:border-[#DB911E]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4">
          <div className="flex bg-white border border-[#E5E7EB] rounded-[8px] p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilter("All")}
              className={`px-3.5 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
                filter === "All"
                  ? "bg-[#F8F7F5] text-[#111928]"
                  : "text-[#6B7280] hover:text-[#111928]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("Unread")}
              className={`px-3.5 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
                filter === "Unread"
                  ? "bg-[#F8F7F5] text-[#111928]"
                  : "text-[#6B7280] hover:text-[#111928]"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("Read")}
              className={`px-3.5 py-1.5 text-[12px] md:text-[12.5px] font-medium font-sans rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
                filter === "Read"
                  ? "bg-[#F8F7F5] text-[#111928]"
                  : "text-[#6B7280] hover:text-[#111928]"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          <button
            type="button"
            disabled={unreadCount === 0 || markingAllRead}
            onClick={() => void handleMarkAllRead()}
            className="disabled:opacity-50 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[12px] md:text-[12.5px] font-medium text-[#374151] font-sans hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            {markingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
            )}
            <span>{markingAllRead ? "Marking..." : "Mark all read"}</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {paginatedNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => void handleMarkSingleRead(notif.id, notif.isUnread)}
            className={`rounded-[14px] p-5 md:p-6 transition-all cursor-pointer ${
              notif.isUnread
                ? "bg-[#FEFBF6] border border-[#DB911E] shadow-sm relative"
                : "bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            }`}
          >
            <div className="flex items-start gap-3.5 mb-2">
              {notif.isUnread ? (
                <AlertCircle
                  className="w-5 h-5 text-[#DB911E] shrink-0 mt-0.5"
                  strokeWidth={2}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3 h-3 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
                    {notif.title}
                  </h3>
                  {notif.category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280]">
                      {notif.category}
                    </span>
                  )}
                </div>
                <p className="text-[13px] md:text-[13.5px] font-normal text-[#4B5563] font-sans mb-3 leading-relaxed">
                  {notif.description}
                </p>
                <div className="flex items-center justify-between text-[11.5px] font-normal text-[#9CA3AF] font-sans pt-1">
                  <span>{notif.timeAgo}</span>
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!resource.loading &&
          !resource.error &&
          filteredNotifications.length === 0 && (
            <div className="py-16 text-center text-gray-400 bg-white border border-[#E5E7EB] rounded-[16px]">
              <p className="text-[14px] font-medium text-[#111928]">
                No notifications found
              </p>
              <p className="text-[12.5px] text-[#6B7280] mt-1">
                New activity will appear here.
              </p>
            </div>
          )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E5E7EB] text-[12.5px] text-[#6B7280]">
        <span>
          {resource.data
            ? `${filteredNotifications.length} notifications`
            : "—"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 border border-[#E5E7EB] rounded-[6px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-[#111928] font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 border border-[#E5E7EB] rounded-[6px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
