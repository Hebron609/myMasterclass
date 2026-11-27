"use client";
import { useState } from "react";
import { UserCircle, ArrowRight } from "lucide-react";
import { ProgramSwitcherWidget } from "@/components/dashboard/widgets/ProgramSwitcherWidget";
import Link from "@/components/shared/AppLink";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMentees } from "@/lib/services/users";
import { fetchSessions } from "@/lib/services/sessions";
import { RescheduleModal } from "@/components/dashboard/mentor/dashboard/RescheduleModal";
import {
  ApiState,
  formatDate,
  formatDateTime,
} from "@/components/shared/ApiUI";
import {
  Skeleton,
  QuietParticipantsSkeleton,
} from "@/components/shared/Skeletons";

export default function MentorDashboardPageContent() {
  const user = useAuthStore((state) => state.user);
  const [rescheduleSessionId, setRescheduleSessionId] = useState<
    string | number | null
  >(null);
  const mentees = useApiResource("mentor-dashboard-mentees", fetchMentees);
  const sessions = useApiResource("mentor-dashboard-sessions", fetchSessions);
  const now = new Date();
  // Match the Monday-based week used by the existing session calendar.
  const weekEnd = new Date(now);
  weekEnd.setHours(0, 0, 0, 0);
  weekEnd.setDate(weekEnd.getDate() - ((weekEnd.getDay() + 6) % 7) + 7);
  const pastStart = new Date(now);
  pastStart.setDate(pastStart.getDate() - 30);
  const upcoming =
    sessions.data
      ?.filter(
        (session) =>
          new Date(session.sessionDate).getTime() >= now.getTime() &&
          new Date(session.sessionDate).getTime() < weekEnd.getTime() &&
          !["completed", "cancelled"].includes(session.status),
      )
      .sort((a, b) => Date.parse(a.sessionDate) - Date.parse(b.sessionDate)) ||
    [];
  const past =
    sessions.data
      ?.filter((session) => {
        const time = Date.parse(session.sessionDate);
        return (
          time >= pastStart.getTime() &&
          time < now.getTime() &&
          session.status !== "cancelled"
        );
      })
      .sort((a, b) => Date.parse(b.sessionDate) - Date.parse(a.sessionDate)) ||
    [];
  const lastSession = (menteeId: string) => {
    if (!sessions.data) return "Last session unavailable";
    const completed = sessions.data
      .filter(
        (session) =>
          session.menteeId === menteeId &&
          session.status === "completed" &&
          Date.parse(session.sessionDate) < now.getTime(),
      )
      .sort((a, b) => Date.parse(b.sessionDate) - Date.parse(a.sessionDate))[0];
    if (completed) return `Last session ${formatDate(completed.sessionDate)}`;
    return sessions.data.some((session) => !session.menteeId)
      ? "Last session unavailable"
      : "No completed session";
  };
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-medium text-gray-900 font-heading mb-1.5 md:mb-2">
            Hello{user?.firstName ? `, ${user.firstName}` : ""}.
          </h1>
          <p className="text-[13.5px] md:text-[14px] text-gray-600 font-sans max-w-md">
            {mentees.data
              ? `${mentees.data.length} ${mentees.data.length === 1 ? "mentee" : "mentees"} walking beside you.`
              : "Your mentorship journey."}
          </p>
        </div>
        <div className="grid grid-cols-3 sm:flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          <div className="bg-white border border-gray-200 rounded-[12px] px-3 sm:px-6 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-sm sm:min-w-[100px]">
            {mentees.loading ? (
              <Skeleton className="h-6 w-10 mx-auto my-0.5 bg-gray-200" />
            ) : (
              <span className="text-[18px] sm:text-[20px] font-medium text-gray-900 font-heading">
                {mentees.data?.length ?? "—"}
              </span>
            )}
            <span className="text-[11.5px] sm:text-[12px] text-gray-500 font-sans mt-0.5">
              Mentees
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[12px] px-3 sm:px-6 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-sm sm:min-w-[100px]">
            {sessions.loading ? (
              <Skeleton className="h-6 w-10 mx-auto my-0.5 bg-gray-200" />
            ) : (
              <span className="text-[18px] sm:text-[20px] font-medium text-gray-900 font-heading">
                {sessions.data?.length ?? "—"}
              </span>
            )}
            <span className="text-[11.5px] sm:text-[12px] text-gray-500 font-sans mt-0.5">
              Sessions
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[12px] px-3 sm:px-6 py-3.5 sm:py-4 flex flex-col items-center justify-center shadow-sm sm:min-w-[100px]">
            <span className="text-[18px] sm:text-[20px] font-medium text-gray-900 font-heading">
              {user?.journeyYear ?? (mentees.data || sessions.data ? 1 : "—")}
            </span>
            <span className="text-[11.5px] sm:text-[12px] text-gray-500 font-sans mt-0.5">
              Years in
            </span>
          </div>
        </div>
      </div>

      {/* Your circle Section */}
      <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
          <div>
            <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-sans mb-1">
              Mentees
            </h3>
            <h2 className="text-[16px] font-medium text-gray-900 font-heading">
              Your circle
            </h2>
          </div>
          <Link
            href="/mentor/mentees"
            className="text-[13px] font-medium text-[#DB911E] flex items-center gap-1 hover:text-[#BA7815] transition-colors shrink-0 whitespace-nowrap"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col">
          <ApiState {...mentees} onRetry={mentees.reload} />
          {mentees.loading ? (
            <QuietParticipantsSkeleton count={3} />
          ) : (
            <div className="flex flex-col animate-in fade-in duration-300">
              {mentees.data?.slice(0, 4).map((mentee) => {
                const menteeSessions = (sessions.data || []).filter(
                  (s) => s.menteeId === mentee.id || s.menteeName === mentee.name,
                );
                const hasCompleted = menteeSessions.some(
                  (s) => s.status === "completed",
                );
                const hasUpcoming = menteeSessions.some(
                  (s) =>
                    !["completed", "cancelled"].includes(s.status) &&
                    Date.parse(s.sessionDate) >= now.getTime(),
                );
                const rawCategory = (mentee.statusCategory || "")
                  .toLowerCase()
                  .replace(/[-_]/g, " ");
                const statusLabel = rawCategory.includes("on track")
                  ? "On-track"
                  : rawCategory.includes("getting started")
                    ? "Getting started"
                    : rawCategory.includes("needs check")
                      ? "Needs check-in"
                      : hasCompleted
                        ? "On-track"
                        : hasUpcoming
                          ? "Getting started"
                          : "Needs check-in";
                const statusClass =
                  statusLabel === "On-track"
                    ? "bg-[#EBEFE4] text-[#1F2937]"
                    : statusLabel === "Getting started"
                      ? "bg-[#F3F4F6] text-[#6B7280]"
                      : "bg-[#FAF3EA] text-[#9A6D29]";

                return (
                  <Link
                    key={mentee.id}
                    href={`/mentor/mentees/${encodeURIComponent(mentee.id)}`}
                    className="flex items-center justify-between gap-3 py-3.5 sm:py-4 border-b border-gray-100 last:border-0 first:pt-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {mentee.avatarUrl ? (
                        <img
                          src={mentee.avatarUrl}
                          alt={mentee.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/icons/user-placeholder.svg";
                          }}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <UserCircle className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-gray-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[14.5px] sm:text-[15px] font-medium text-gray-900 font-heading mb-0.5 truncate">
                          {mentee.name}
                        </h4>
                        <p className="text-[12px] sm:text-[13px] text-gray-500 font-sans truncate">
                          {mentee.journeyYear
                            ? `Year ${mentee.journeyYear}`
                            : "Year 1"}{" "}
                          • {lastSession(mentee.id)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] font-medium rounded-full whitespace-nowrap shrink-0 ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </Link>
                );
              })}
              {mentees.data?.length === 0 && (
                <p className="py-6 text-sm text-gray-500">
                  No mentees assigned yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming sessions */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="mb-5 sm:mb-6">
            <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-sans mb-1">
              This Week
            </h3>
            <h2 className="text-[16px] font-medium text-gray-900 font-heading">
              Upcoming sessions
            </h2>
          </div>

          <ApiState {...sessions} onRetry={sessions.reload} />
          {sessions.loading ? (
            <QuietParticipantsSkeleton count={2} />
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4 animate-in fade-in duration-300">
              {upcoming.slice(0, 3).map((session) => (
                <Link
                  key={session.id}
                  href="/mentor/sessions"
                  className="border border-gray-100 rounded-[12px] p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[14.5px] sm:text-[15px] font-medium text-gray-900 font-heading mb-1 truncate">
                      {session.menteeName || session.title}
                    </h4>
                    <p className="text-[12px] sm:text-[13px] text-gray-500 font-sans truncate">
                      {session.title} • {formatDateTime(session.sessionDate)}
                    </p>
                  </div>
                  <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#F8F9FA] text-[#6B7280] text-[11px] font-medium rounded-full border border-gray-100 whitespace-nowrap shrink-0">
                    {session.status.replaceAll("_", " ")}
                  </span>
                </Link>
              ))}
              {sessions.data && !upcoming.length && (
                <p className="py-6 text-sm text-gray-500">
                  No upcoming sessions.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Past sessions */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
            <div>
              <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-sans mb-1">
                Last 30 days
              </h3>
              <h2 className="text-[16px] font-medium text-gray-900 font-heading">
                Past sessions
              </h2>
            </div>
            <Link
              href="/mentor/sessions"
              className="text-[13px] font-medium text-[#DB911E] flex items-center gap-1 hover:text-[#BA7815] transition-colors shrink-0 whitespace-nowrap"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ApiState {...sessions} onRetry={sessions.reload} />
          <div className="flex flex-col gap-3 sm:gap-4">
            {past.slice(0, 3).map((session) => (
              <Link
                key={session.id}
                href="/mentor/sessions"
                className="border border-gray-100 rounded-[12px] p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14.5px] sm:text-[15px] font-medium text-gray-900 font-heading mb-1 truncate">
                    {session.menteeName || session.title}
                  </h4>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 font-sans truncate">
                    {session.title} • {formatDateTime(session.sessionDate)}
                  </p>
                </div>
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#F8F9FA] text-[#6B7280] text-[11px] font-medium rounded-full border border-gray-100 whitespace-nowrap shrink-0">
                  {session.status.replaceAll("_", " ")}
                </span>
              </Link>
            ))}
            {sessions.data && !past.length && (
              <p className="py-6 text-sm text-gray-500">No past sessions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Meeting requests */}
      <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="mb-5 sm:mb-6">
          <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-sans mb-1">
            Awaiting your response
          </h3>
          <h2 className="text-[16px] font-medium text-gray-900 font-heading">
            Meeting requests
          </h2>
        </div>

        {upcoming.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-5 sm:pt-6 gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-gray-900 font-heading truncate">
                {upcoming[0].menteeName || upcoming[0].title}
              </p>
              <p className="text-[13px] text-gray-500 font-sans mt-0.5 truncate">
                {upcoming[0].title} • {formatDateTime(upcoming[0].sessionDate)}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setRescheduleSessionId(upcoming[0].id)}
                className="px-4 sm:px-6 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-[8px] text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer shadow-xs text-center"
              >
                Reschedule
              </button>
              <Link
                href="/mentor/sessions"
                className="px-4 sm:px-6 py-2.5 bg-[#DB911E] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#BA7815] transition-colors shadow-xs text-center"
              >
                View Session
              </Link>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-5 sm:pt-6">
            <p className="text-sm text-gray-500">
              No pending meeting requests at this time.
            </p>
          </div>
        )}
      </div>

      <RescheduleModal
        isOpen={Boolean(rescheduleSessionId)}
        sessionId={rescheduleSessionId}
        onClose={() => setRescheduleSessionId(null)}
        onSuccess={() => sessions.reload()}
      />
    </div>
  );
}
