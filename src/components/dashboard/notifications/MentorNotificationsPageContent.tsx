"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/engagement";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { ApiState, formatDateTime } from "@/components/shared/ApiUI";
type NotificationType = "session" | "goal" | "message" | "system";
export default function MentorNotificationsPageContent() {
  const { token } = useAuth();
  const resource = useApiResource("notifications", fetchNotifications);
  const [locallyReadIds, setLocallyReadIds] = useState<string[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const notifications = (resource.data || []).map((n) => ({
    ...n,
    isRead: n.isRead || locallyReadIds.includes(String(n.id)),
  }));
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      if (token) {
        await markAllNotificationsRead(token);
      }
      setLocallyReadIds(notifications.map((n) => String(n.id)));
      resource.reload();
    } catch {
      setLocallyReadIds(notifications.map((n) => String(n.id)));
    } finally {
      setMarkingAll(false);
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
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "session":
        return <Calendar className="w-5 h-5 text-[#DB911E]" />;
      case "goal":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case "session":
        return "bg-[#FFF8ED]";
      case "goal":
        return "bg-emerald-50";
      case "message":
        return "bg-blue-50";
      case "system":
        return "bg-gray-100";
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="bg-white border border-gray-200 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <ApiState {...resource} onRetry={resource.reload} />
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-medium text-[#0F172A] font-sans">
              All Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-[#DB911E] text-white text-[12px] font-medium rounded-full font-sans">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={markingAll}
              onClick={handleMarkAllRead}
              className="disabled:opacity-50 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors font-sans inline-flex items-center gap-1.5 cursor-pointer"
            >
              {markingAll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {!resource.loading &&
          !resource.error &&
          notifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-[16px] font-medium text-gray-900 font-sans mb-1">
                No notifications yet
              </h3>
              <p className="text-[14px] text-gray-500 font-sans">
                When you have new activity, it will show up here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  void handleMarkSingleRead(notification.id, notification.isRead)
                }
                className={`p-6 flex gap-4 transition-colors cursor-pointer hover:bg-gray-50 ${!notification.isRead ? "bg-orange-50/30" : "bg-white"}`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}
                >
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3
                      className={`text-[14.5px] font-sans truncate font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-800"}`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-[12px] text-gray-400 font-sans whitespace-nowrap shrink-0 mt-0.5">
                      {formatDateTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-gray-600 font-sans mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Unread Dot */}
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#DB911E] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
