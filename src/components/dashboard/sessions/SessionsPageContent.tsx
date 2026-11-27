"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  X,
  Clock,
  Video,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Users,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Session } from "@/types";
import { MentorAvailabilityModal } from "./MentorAvailabilityModal";
import { SessionLogPanel } from "./SessionLogPanel";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";
import { RescheduleModal } from "@/components/dashboard/mentor/dashboard/RescheduleModal";

import { useApiResource } from "@/hooks/useApiResource";
import { fetchSessions } from "@/lib/services/sessions";
import { fetchProgramSessions } from "@/lib/services/program-sessions";
import {
  ApiState,
  formatDate,
  formatDateTime,
  safeWebUrl,
} from "@/components/shared/ApiUI";
import { QuietParticipantsSkeleton } from "@/components/shared/Skeletons";
interface SessionItem {
  id: string;
  title: string;
  type: "Mentorship" | "In-house";
  details: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  dateFormatted?: string;
  time?: string;
  duration?: string;
  participants?: string;
  cohort?: string;
  meetingUrl?: string;
  agenda?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "Mentorship" | "In-house";
  dayIndex: number; // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri, 5: Sat, 6: Sun
  startHour: number; // e.g. 9 for 09:00
  startMinutes?: number;
  durationHours: number; // e.g. 2 for 2 hours
  timeBadges: string[]; // ["09:00", "11:00"] or ["11:00"]
  colorScheme: "green" | "orange" | "purple" | "cyan" | "pink" | "amber";
  hasAvatarChip?: boolean;
  avatarUrl?: string;
  details?: string;
  meetingUrl?: string;
  participants?: string;
  agenda?: string;
}

const HOURS = Array.from({ length: 12 }, (_, index) =>
  String(index + 9).padStart(2, "0"),
);

export default function SessionsPageContent() {
  const { userRole } = useAuth();
  const mentorship = useApiResource("sessions", fetchSessions);
  const program = useApiResource("program-sessions", fetchProgramSessions);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDayIdx, setSelectedDayIdx] = useState(
    () => (new Date().getDay() + 6) % 7,
  );
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() - ((anchorDate.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const now = new Date();
    const isToday =
      day.getFullYear() === now.getFullYear() &&
      day.getMonth() === now.getMonth() &&
      day.getDate() === now.getDate();
    return {
      name: day.toLocaleDateString("en-US", { weekday: "long" }),
      shortName: day.toLocaleDateString("en-US", { weekday: "short" }),
      date: String(day.getDate()),
      fullDate: day,
      isToday,
    };
  });
  const allSessions: SessionItem[] = [
    ...(mentorship.data || []).map((item) => ({
      id: "mentor-" + item.id,
      title: item.title,
      type: "Mentorship" as const,
      details: formatDateTime(item.sessionDate),
      status: ["cancelled", "completed"].includes(item.status)
        ? item.status[0].toUpperCase() + item.status.slice(1)
        : new Date(item.sessionDate).getTime() >= Date.now()
          ? "Upcoming"
          : "Past",
      dateFormatted: formatDate(item.sessionDate),
      time: new Date(item.sessionDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: item.durationMinutes ? item.durationMinutes + " min" : "—",
      participants: [item.mentorName, item.menteeName]
        .filter(Boolean)
        .join(" & "),
      meetingUrl: safeWebUrl(item.meetingLink) || undefined,
      agenda: item.notes,
      startsAt: item.sessionDate,
      endsAt: item.endsAt,
    })),
    ...(program.data || []).map((item) => ({
      id: "program-" + item.id,
      title: item.title,
      type: "In-house" as const,
      details: formatDateTime(item.starts_at),
      status:
        item.status === "cancelled"
          ? "Cancelled"
          : new Date(item.starts_at).getTime() >= Date.now()
            ? "Upcoming"
            : "Past",
      dateFormatted: formatDate(item.starts_at),
      time: new Date(item.starts_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: item.duration_minutes ? item.duration_minutes + " min" : "—",
      meetingUrl: safeWebUrl(item.meeting_link) || undefined,
      agenda: item.description,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
    })),
  ].sort(
    (a, b) =>
      new Date(a.startsAt || "").getTime() -
      new Date(b.startsAt || "").getTime(),
  );
  const UPCOMING_SESSIONS = allSessions.filter(
    (item) => item.status === "Upcoming",
  );
  const HISTORY_SESSIONS = allSessions
    .filter((item) => item.status !== "Upcoming")
    .reverse();
  const CALENDAR_EVENTS: CalendarEvent[] = allSessions
    .filter(
      (item) =>
        item.status !== "Cancelled" &&
        new Date(item.startsAt || "") >= weekStart &&
        new Date(item.startsAt || "") < weekEnd,
    )
    .map((item) => {
      const start = new Date(item.startsAt || "");
      const end = item.endsAt ? new Date(item.endsAt) : null;
      return {
        id: item.id,
        title: item.title,
        type: item.type,
        dayIndex: (start.getDay() + 6) % 7,
        startHour: start.getHours(),
        startMinutes: start.getMinutes(),
        durationHours: end
          ? Math.max(0.25, (end.getTime() - start.getTime()) / 3600000)
          : 0.5,
        timeBadges: [
          start.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        ],
        colorScheme: item.type === "Mentorship" ? "green" : "orange",
        details: item.details,
        meetingUrl: item.meetingUrl,
        participants: item.participants,
        agenda: item.agenda,
      };
    });
  useEffect(() => {
    const reload = () => {
      mentorship.reload();
      program.reload();
    };
    window.addEventListener("sessions_updated", reload);
    return () => window.removeEventListener("sessions_updated", reload);
  }, [mentorship.reload, program.reload]);
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [sessionFilterTab, setSessionFilterTab] = useState<
    "Upcoming" | "Mentorship" | "In-house" | "Past"
  >("Upcoming");
  const [calendarViewMode, setCalendarViewMode] = useState<
    "Year" | "Week" | "Month" | "Day"
  >("Week");
  const weekRangeText =
    weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " – " +
    new Date(weekEnd.getTime() - 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const dateRangeText =
    calendarViewMode === "Year"
      ? String(anchorDate.getFullYear())
      : calendarViewMode === "Month"
        ? anchorDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : calendarViewMode === "Day"
          ? anchorDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : weekRangeText;
  const moveCalendar = (direction: number) =>
    setAnchorDate((date) => {
      const next = new Date(date);
      if (calendarViewMode === "Year")
        next.setFullYear(next.getFullYear() + direction);
      else if (calendarViewMode === "Month") {
        next.setDate(1);
        next.setMonth(next.getMonth() + direction);
      } else
        next.setDate(
          next.getDate() + direction * (calendarViewMode === "Day" ? 1 : 7),
        );
      return next;
    });
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(
    null,
  );
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [savedLog, setSavedLog] = useState<Session | null>(null);
  const [logBusy, setLogBusy] = useState(false);
  const logLock = useRef(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const [notesNotice, setNotesNotice] = useState<string | null>(null);
  const closeDetails = () => {
    if (logLock.current) return;
    setSelectedSession(null);
    setSavedLog(null);
  };
  const openDetails = (session: SessionItem) => {
    setNotesNotice(null);
    setSavedLog(null);
    setSelectedSession(session);
  };
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Listen for events from RoleAwareHeader
    const handleOpenBookModal = () => setIsBookModalOpen(true);
    const handleCalendarBack = () => setIsCalendarView(false);

    window.addEventListener("open-book-session-modal", handleOpenBookModal);
    window.addEventListener("session-calendar-back", handleCalendarBack);

    return () => {
      window.removeEventListener(
        "open-book-session-modal",
        handleOpenBookModal,
      );
      window.removeEventListener("session-calendar-back", handleCalendarBack);
    };
  }, []);

  useEffect(() => {
    const open = () => {
      if (userRole === "MENTOR") setAvailabilityOpen(true);
    };
    window.addEventListener("open-availability-modal", open);
    return () => window.removeEventListener("open-availability-modal", open);
  }, [userRole]);
  useEffect(() => {
    if (!selectedSession || !isMounted) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    detailRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !logLock.current) {
        setSelectedSession(null);
        setSavedLog(null);
      }
      if (event.key !== "Tab") return;
      const elements = detailRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]",
      );
      if (!elements?.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === detailRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === detailRef.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [selectedSession?.id, isMounted, isCalendarView]);
  const recordId =
    selectedSession?.type === "Mentorship" ? selectedSession.id.slice(7) : null;
  const selectedRecord =
    String(savedLog?.id) === recordId
      ? savedLog
      : mentorship.data?.find((item) => String(item.id) === recordId);
  const notesPanel = selectedRecord ? (
    <SessionLogPanel
      key={selectedRecord.id}
      session={selectedRecord}
      onBusyChange={(value) => {
        logLock.current = value;
        setLogBusy(value);
      }}
      onSaved={(updated) => {
        setSavedLog(updated);
        setNotesNotice("Session notes saved.");
        setSelectedSession((current) =>
          current
            ? {
                ...current,
                status:
                  updated.status.charAt(0).toUpperCase() +
                  updated.status.slice(1),
              }
            : current,
        );
        mentorship.reload();
        window.dispatchEvent(new Event("sessions_updated"));
      }}
    />
  ) : null;
  const availabilityDialog =
    userRole === "MENTOR" && availabilityOpen ? (
      <MentorAvailabilityModal onClose={() => setAvailabilityOpen(false)} />
    ) : null;

  const openCalendarView = () => {
    setIsCalendarView(true);
    window.dispatchEvent(
      new CustomEvent("session-calendar-view-change", {
        detail: { isCalendarView: true },
      }),
    );
  };

  const closeCalendarView = () => {
    setIsCalendarView(false);
    window.dispatchEvent(
      new CustomEvent("session-calendar-view-change", {
        detail: { isCalendarView: false },
      }),
    );
  };

  const handleCopyLink = async (url: string) => {
    const safe = safeWebUrl(url);
    if (!safe) return;
    try {
      await navigator.clipboard.writeText(safe);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCalendarError("Could not copy the meeting link.");
    }
  };

  const openEventDetail = (event: CalendarEvent) => {
    const session = allSessions.find((item) => item.id === event.id);
    if (session) openDetails(session);
  };

  // ----------------------------------------------------
  // FULL DYNAMIC SESSION CALENDAR VIEW
  // ----------------------------------------------------
  if (isCalendarView) {
    const activeWeekDay = WEEK_DAYS[selectedDayIdx] || WEEK_DAYS[0];
    const selectedDayEvents = CALENDAR_EVENTS.filter(
      (e) => e.dayIndex === selectedDayIdx,
    );
    const monthDaysCount = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() + 1,
      0,
    ).getDate();
    const monthDaysWithEvents = Array.from(
      { length: monthDaysCount },
      (_, i) => i + 1,
    )
      .map((dayNum) => {
        const daySessions = allSessions.filter((item) => {
          const date = new Date(item.startsAt || "");
          return (
            item.status !== "Cancelled" &&
            date.getFullYear() === anchorDate.getFullYear() &&
            date.getMonth() === anchorDate.getMonth() &&
            date.getDate() === dayNum
          );
        });
        return { dayNum, daySessions };
      })
      .filter((d) => d.daySessions.length > 0);

    return (
      <div className="w-full pb-12 animate-in fade-in duration-150">
        {availabilityDialog}
        <ApiState {...mentorship} onRetry={mentorship.reload} />
        <ApiState {...program} onRetry={program.reload} />
        {calendarError && <p role="alert">{calendarError}</p>}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Top Control Bar: Today | < Date Range > | Year/Week/Month/Day */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 md:gap-4 pb-5 md:pb-6">
            {/* Row 1 on Mobile: Today + Date Range Navigator */}
            <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setAnchorDate(now);
                  setSelectedDayIdx((now.getDay() + 6) % 7);
                }}
                className="px-3.5 sm:px-4 py-1.5 bg-white border border-gray-200 rounded-[8px] text-[12.5px] sm:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                Today
              </button>

              {/* Mobile Date Range Navigator (hidden on md since md shows it centered) */}
              <div className="flex md:hidden items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveCalendar(-1)}
                  className="w-8 h-8 rounded-[8px] border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer shrink-0"
                  aria-label="Previous date range"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-[12.5px] font-medium text-gray-800 px-1.5 select-none text-center">
                  {dateRangeText}
                </span>

                <button
                  type="button"
                  onClick={() => moveCalendar(1)}
                  className="w-8 h-8 rounded-[8px] border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer shrink-0"
                  aria-label="Next date range"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center on Desktop: Prev/Next Chevron + Date Range */}
            <div className="hidden md:flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => moveCalendar(-1)}
                className="w-8 h-8 rounded-[8px] border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                aria-label="Previous date range"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[13px] sm:text-[13.5px] font-medium text-gray-700 px-3 select-none">
                {dateRangeText}
              </span>

              <button
                type="button"
                onClick={() => moveCalendar(1)}
                className="w-8 h-8 rounded-[8px] border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                aria-label="Next date range"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Year | Week | Month | Day segmented toggle (full-width equal grid on mobile) */}
            <div className="flex items-center justify-end w-full md:w-auto">
              <div className="grid grid-cols-4 md:inline-flex w-full md:w-auto rounded-[8px] border border-gray-200 divide-x divide-gray-200 overflow-hidden bg-white shadow-sm text-[12px] font-medium text-gray-600">
                {(["Year", "Week", "Month", "Day"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCalendarViewMode(mode)}
                    className={`px-3 sm:px-3.5 py-1.5 transition-colors cursor-pointer text-center ${
                      calendarViewMode === mode
                        ? "bg-[#111928] md:bg-gray-50 text-white md:text-gray-900 font-medium md:font-semibold"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VIEW MODE: WEEK */}
          {calendarViewMode === "Week" && (
            <>
              {/* Mobile Week View (Below md): 7-Day Interactive Strip + Timeline Agenda */}
              <div className="md:hidden space-y-4">
                {/* 7-Day Selector Strip */}
                <div className="grid grid-cols-7 gap-1.5 bg-[#FAF9F6] p-2 rounded-[14px] border border-gray-100">
                  {WEEK_DAYS.map((day, idx) => {
                    const isSelected = selectedDayIdx === idx;
                    const dayEventCount = CALENDAR_EVENTS.filter(
                      (e) => e.dayIndex === idx,
                    ).length;
                    return (
                      <button
                        key={day.name}
                        type="button"
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-[10px] transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-[#111928] text-white shadow-sm"
                            : day.isToday
                              ? "bg-white border border-[#DB911E] text-gray-900"
                              : "text-gray-600 hover:bg-white/60"
                        }`}
                      >
                        <span
                          className={`text-[10.5px] font-sans ${
                            isSelected ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {day.shortName}
                        </span>
                        <span
                          className={`text-[14px] font-medium font-sans mt-0.5 ${
                            isSelected ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {day.date}
                        </span>
                        {/* Dot indicator if day has sessions */}
                        <div className="h-1.5 mt-1 flex items-center justify-center gap-0.5">
                          {dayEventCount > 0 && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-[#DB911E]" : "bg-[#8DB58D]"
                              }`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Header */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h4 className="text-[14.5px] font-medium text-gray-900 font-sans">
                      {activeWeekDay.fullDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-sans">
                      {selectedDayEvents.length === 0
                        ? "No sessions scheduled"
                        : `${selectedDayEvents.length} ${selectedDayEvents.length === 1 ? "session" : "sessions"} scheduled`}
                    </p>
                  </div>
                  {activeWeekDay.isToday && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FCF9F0] text-[#DB911E] font-sans">
                      Today
                    </span>
                  )}
                </div>

                {/* Selected Day Events List or Whole-Week Fallback */}
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedDayEvents.map((event) => {
                      const isMentorship = event.type === "Mentorship";
                      return (
                        <div
                          key={event.id}
                          onClick={() => openEventDetail(event)}
                          className={`rounded-[14px] border p-4 cursor-pointer transition-all active:scale-[0.99] ${
                            isMentorship
                              ? "border-[#22C55E]/40 bg-[#F0FDF4]/60"
                              : "border-[#F97316]/40 bg-[#FFF7ED]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {event.timeBadges.map((badge) => (
                                <span
                                  key={badge}
                                  className={`px-2 py-0.5 rounded-[6px] text-white text-[11px] font-medium ${
                                    isMentorship
                                      ? "bg-[#22C55E]"
                                      : "bg-[#F97316]"
                                  }`}
                                >
                                  {badge}
                                </span>
                              ))}
                              <span className="text-[11.5px] font-medium text-gray-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-gray-200/60">
                                {event.type}
                              </span>
                            </div>
                            <span className="text-[12px] text-[#DB911E] font-medium">
                              Details →
                            </span>
                          </div>
                          <h5 className="text-[15px] font-medium text-gray-900 font-sans">
                            {event.title}
                          </h5>
                          {event.participants && (
                            <p className="text-[12.5px] text-gray-600 font-sans mt-1">
                              {event.participants}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-dashed border-gray-200 bg-[#FAF9F6]/50 p-6 text-center space-y-2">
                    <Clock className="w-6 h-6 text-gray-400 mx-auto stroke-[1.5]" />
                    <p className="text-[13.5px] font-medium text-gray-700 font-sans">
                      Open day on the calendar
                    </p>
                    <p className="text-[12px] text-gray-500 font-sans">
                      {CALENDAR_EVENTS.length > 0
                        ? `Tap a highlighted day above to view this week's ${CALENDAR_EVENTS.length} scheduled ${CALENDAR_EVENTS.length === 1 ? "session" : "sessions"}.`
                        : "No sessions are scheduled for this week yet."}
                    </p>
                  </div>
                )}

                {/* All Sessions This Week Summary (if any exist on other days) */}
                {CALENDAR_EVENTS.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider px-1 font-sans">
                      This week’s schedule ({CALENDAR_EVENTS.length})
                    </p>
                    {CALENDAR_EVENTS.map((event) => {
                      const eventDay = WEEK_DAYS[event.dayIndex];
                      return (
                        <div
                          key={`week-summary-${event.id}`}
                          onClick={() => {
                            setSelectedDayIdx(event.dayIndex);
                            openEventDetail(event);
                          }}
                          className="flex items-center justify-between gap-3 p-3 rounded-[12px] border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-[10px] bg-[#FAF9F6] border border-gray-200/70 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] text-gray-400 leading-none">
                                {eventDay?.shortName}
                              </span>
                              <span className="text-[13px] font-medium text-gray-900 leading-tight mt-0.5">
                                {eventDay?.date}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-medium text-gray-900 truncate font-sans">
                                {event.title}
                              </p>
                              <p className="text-[12px] text-gray-500 font-sans">
                                {event.timeBadges.join(" – ")} · {event.type}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop Week Grid (md and up) */}
              <div className="hidden md:block w-full overflow-x-auto border border-[#E5E7EB] rounded-[12px] hide-scrollbar">
              <div className="min-w-[840px] select-none">
                {/* 1. Header Row: Clock Icon + Days of Week */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E5E7EB] bg-white sticky top-0 z-20">
                  {/* Time col header with clock icon */}
                  <div className="h-[56px] flex items-center justify-center border-r border-[#F0F2F5]">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400">
                      <Clock className="w-4 h-4 stroke-[1.6]" />
                    </div>
                  </div>

                  {/* Day headers */}
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day.name}
                      className={`h-[56px] flex flex-col items-center justify-center ${
                        idx < 6 ? "border-r border-[#F0F2F5]" : ""
                      }`}
                    >
                      <span className="text-[12px] text-gray-500 font-normal">
                        {day.name}
                      </span>
                      <span className="text-[13px] text-gray-800 font-medium">
                        {day.date}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 2. Grid Body: Hours 09 to 20 */}
                <div className="relative grid grid-cols-[60px_repeat(7,1fr)] bg-white">
                  {/* Hours column labels */}
                  <div className="flex flex-col border-r border-[#F0F2F5] select-none">
                    {HOURS.map((hr, idx) => (
                      <div
                        key={hr}
                        className={`h-[58px] flex items-center justify-center text-[12px] text-gray-500 font-medium ${
                          idx < HOURS.length - 1
                            ? "border-b border-[#F0F2F5]"
                            : ""
                        }`}
                      >
                        {hr}
                      </div>
                    ))}
                  </div>

                  {/* Day columns & background grid cells */}
                  {WEEK_DAYS.map((day, dayIdx) => (
                    <div
                      key={day.name}
                      className={`relative flex flex-col ${
                        dayIdx < 6 ? "border-r border-[#F0F2F5]" : ""
                      }`}
                    >
                      {HOURS.map((hr, hrIdx) => (
                        <div
                          key={`${day.name}-${hr}`}
                          className={`h-[58px] transition-colors hover:bg-gray-50/50 ${
                            hrIdx < HOURS.length - 1
                              ? "border-b border-[#F0F2F5]"
                              : ""
                          }`}
                        />
                      ))}

                      {/* Render Events for this day column */}
                      {CALENDAR_EVENTS.filter((e) => e.dayIndex === dayIdx).map(
                        (event) => {
                          // Calculate position
                          const hourOffset = event.startHour - 9;
                          const topPx = hourOffset * 58 + 4;
                          const heightPx = event.durationHours * 58 - 8;

                          // Color styles
                          let borderClass = "border-[#22C55E]";
                          let bgClass = "bg-[#F0FDF4]";
                          let badgeBg = "bg-[#22C55E]";

                          if (event.colorScheme === "orange") {
                            borderClass = "border-[#F97316]";
                            bgClass = "bg-[#FFF7ED]";
                            badgeBg = "bg-[#F97316]";
                          } else if (event.colorScheme === "purple") {
                            borderClass = "border-[#8B5CF6]";
                            bgClass = "bg-[#FAF5FF]";
                            badgeBg = "bg-[#8B5CF6]";
                          } else if (event.colorScheme === "cyan") {
                            borderClass = "border-[#38BDF8]";
                            bgClass = "bg-[#F0F9FF]";
                            badgeBg = "bg-[#0EA5E9]";
                          } else if (event.colorScheme === "pink") {
                            borderClass = "border-[#FB7185]";
                            bgClass = "bg-[#FFF1F2]";
                            badgeBg = "bg-[#F43F5E]";
                          } else if (event.colorScheme === "amber") {
                            borderClass = "border-[#F59E0B]";
                            bgClass = "bg-[#FFFBEB]";
                            badgeBg = "bg-[#F59E0B]";
                          }

                          return (
                            <div
                              key={event.id}
                              onClick={() => openEventDetail(event)}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                              }}
                              className={`absolute left-1 right-1 rounded-[8px] border ${borderClass} ${bgClass} p-2 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md transition-all z-10`}
                            >
                              <div>
                                {/* Top row: Badges and optional avatar chip */}
                                <div className="flex items-center gap-1 flex-wrap">
                                  {event.timeBadges.map((badge) => (
                                    <span
                                      key={badge}
                                      className={`px-1.5 py-0.5 rounded-[4px] ${badgeBg} text-white text-[9.5px] font-semibold leading-none`}
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                  {event.hasAvatarChip && event.avatarUrl && (
                                    <img
                                      src={event.avatarUrl}
                                      alt="Attendee"
                                      className="w-3.5 h-3.5 rounded-full object-cover inline-block align-middle ml-0.5"
                                    />
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="text-[11px] sm:text-[11.5px] font-medium text-gray-900 mt-1.5 leading-tight line-clamp-2">
                                  {event.title}
                                </h4>
                              </div>

                              {/* Bottom avatar if not in top header */}
                              {!event.hasAvatarChip && event.avatarUrl && (
                                <div className="pt-1">
                                  <img
                                    src={event.avatarUrl}
                                    alt="Participant"
                                    className="w-4 h-4 rounded-full object-cover shadow-xs"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
          )}

          {/* VIEW MODE: MONTH */}
          {calendarViewMode === "Month" && (
            <div className="space-y-4">
              <div className="w-full border border-[#E5E7EB] rounded-[12px] p-2.5 sm:p-4 bg-white">
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-[12px] font-medium text-gray-500 pb-2.5 sm:pb-3 border-b border-gray-100">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2.5 sm:pt-3">
                  {Array.from(
                    {
                      length: monthDaysCount,
                    },
                    (_, i) => i + 1,
                  ).map((dayNum) => {
                    const daySessions = allSessions.filter((item) => {
                      const date = new Date(item.startsAt || "");
                      return (
                        item.status !== "Cancelled" &&
                        date.getFullYear() === anchorDate.getFullYear() &&
                        date.getMonth() === anchorDate.getMonth() &&
                        date.getDate() === dayNum
                      );
                    });
                    const hasSessions = daySessions.length > 0;
                    return (
                      <div
                        key={dayNum}
                        onClick={() => {
                          if (hasSessions) {
                            openDetails(daySessions[0]);
                          }
                        }}
                        style={
                          dayNum === 1
                            ? {
                                gridColumnStart:
                                  ((new Date(
                                    anchorDate.getFullYear(),
                                    anchorDate.getMonth(),
                                    1,
                                  ).getDay() +
                                    6) %
                                    7) +
                                  1,
                              }
                            : undefined
                        }
                        className={`min-h-[44px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-[8px] border transition-colors flex flex-col items-center sm:items-start justify-between ${
                          hasSessions
                            ? "border-[#DB911E]/40 bg-[#FAF3EA]/30 cursor-pointer hover:border-[#DB911E]"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <span
                          className={`text-[12px] font-medium ${hasSessions ? "text-[#DB911E] font-semibold" : "text-gray-700"}`}
                        >
                          {dayNum}
                        </span>
                        {hasSessions && (
                          <div className="mt-1 w-full flex justify-center sm:justify-start">
                            <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#DB911E]" />
                            <span className="hidden sm:block text-[10px] truncate text-[#486B52] bg-[#EEF3ED] px-1.5 py-0.5 rounded font-medium w-full">
                              {daySessions.length === 1
                                ? daySessions[0].title
                                : `${daySessions.length} sessions`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Month Agenda List */}
              {monthDaysWithEvents.length > 0 && (
                <div className="sm:hidden space-y-2 pt-1">
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider px-1 font-sans">
                    Sessions this month
                  </p>
                  {monthDaysWithEvents.flatMap(({ dayNum, daySessions }) =>
                    daySessions.map((sess) => (
                      <div
                        key={`month-mob-${sess.id}`}
                        onClick={() => openDetails(sess)}
                        className="flex items-center justify-between gap-3 p-3 rounded-[12px] border border-gray-100 bg-white active:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-[8px] bg-[#FAF3EA] text-[#DB911E] flex items-center justify-center text-[13px] font-medium shrink-0">
                            {dayNum}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-medium text-gray-900 truncate font-sans">
                              {sess.title}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate font-sans">
                              {sess.time || sess.details} · {sess.type}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    )),
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE: DAY */}
          {calendarViewMode === "Day" && (
            <div className="w-full border border-[#E5E7EB] rounded-[12px] p-4 sm:p-6 bg-white space-y-4">
              <h3 className="text-[14.5px] sm:text-[15px] font-medium text-gray-900">
                {anchorDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {CALENDAR_EVENTS.filter(
                  (e) => e.dayIndex === (anchorDate.getDay() + 6) % 7,
                ).length === 0 ? (
                  <p className="text-[13px] text-gray-500 py-4">
                    No sessions scheduled for this day.
                  </p>
                ) : (
                  CALENDAR_EVENTS.filter(
                    (e) => e.dayIndex === (anchorDate.getDay() + 6) % 7,
                  ).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => openEventDetail(evt)}
                      className="p-3.5 sm:p-4 border border-gray-200 rounded-[10px] hover:border-[#DB911E] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[14px] font-medium text-gray-900">
                            {evt.title}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {evt.type}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-gray-500">
                          {evt.details}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-[#EEF3ED] text-[#486B52] rounded-full text-[12px] font-medium w-fit shrink-0">
                        {allSessions.find((item) => item.id === evt.id)
                          ?.status || "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE: YEAR */}
          {calendarViewMode === "Year" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border border-[#E5E7EB] rounded-[12px] bg-white">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m, idx) => (
                <div
                  key={m}
                  className="p-3 border border-gray-100 rounded-[8px] text-center hover:border-gray-300 transition-colors"
                >
                  <h4 className="text-[13px] font-medium text-gray-800">
                    {m} {anchorDate.getFullYear()}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {mentorship.loading || program.loading
                      ? "Loading..."
                      : mentorship.error || program.error
                        ? "Session count unavailable"
                        : `${
                            allSessions.filter((item) => {
                              const date = new Date(item.startsAt || "");
                              return (
                                item.status !== "Cancelled" &&
                                date.getFullYear() ===
                                  anchorDate.getFullYear() &&
                                date.getMonth() === idx
                              );
                            }).length
                          } sessions`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOOK SESSION MODAL */}
        <BookSessionModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
        />

        {/* SESSION DETAIL MODAL */}
        {selectedSession &&
          isMounted &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="absolute inset-0" onClick={closeDetails} />

              <div
                ref={detailRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Session details"
                className="relative max-h-[90vh] overflow-y-auto outline-none w-full max-w-[540px] bg-white rounded-[16px] shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Top Close */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium tracking-wide ${
                        selectedSession.type === "Mentorship"
                          ? "bg-[#F3F4F6] text-[#6B7280]"
                          : "bg-[#FAF3EA] text-[#9A6D29]"
                      }`}
                    >
                      {selectedSession.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
                        selectedSession.status === "Upcoming"
                          ? "bg-[#EEF3ED] text-[#486B52]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetails}
                    disabled={logBusy}
                    className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Close details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title & Details */}
                <h2 className="text-[20px] font-medium text-gray-900 font-heading mb-1.5">
                  {selectedSession.title}
                </h2>
                <p className="text-[13.5px] text-gray-500 font-sans mb-5">
                  {selectedSession.details}
                </p>

                {/* Info Cards */}
                <div className="space-y-3 bg-[#F9FAFB] p-4 rounded-[12px] border border-gray-100 mb-5 font-sans text-[13px]">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" /> Date
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedSession.dateFormatted}
                    </span>
                  </div>

                  {selectedSession.time && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" /> Time &
                        Duration
                      </span>
                      <span className="font-medium text-gray-800">
                        {selectedSession.time} ({selectedSession.duration})
                      </span>
                    </div>
                  )}

                  {selectedSession.participants && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" /> Participants
                      </span>
                      <span className="font-medium text-gray-800 truncate max-w-[280px]">
                        {selectedSession.participants}
                      </span>
                    </div>
                  )}

                  {selectedSession.meetingUrl && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-400" /> Meeting Link
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#DB911E] underline truncate max-w-[200px]">
                          {selectedSession.meetingUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyLink(selectedSession.meetingUrl || "")
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-800 cursor-pointer"
                          title="Copy meeting link"
                          aria-label="Copy meeting link"
                        >
                          {copiedLink ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agenda / Topic Note */}
                {selectedSession.agenda && (
                  <div className="mb-6">
                    <h4 className="text-[12.5px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5 font-sans">
                      Agenda & Focus
                    </h4>
                    <p className="text-[13.5px] text-gray-600 bg-white border border-gray-200 rounded-[10px] p-3.5 leading-relaxed font-sans">
                      {selectedSession.agenda}
                    </p>
                  </div>
                )}

                {notesNotice && (
                  <p role="status" className="mb-3 text-sm text-emerald-800">
                    {notesNotice}
                  </p>
                )}
                {notesPanel}
                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  {selectedSession.status === "Upcoming" &&
                    safeWebUrl(selectedSession.meetingUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          const link = safeWebUrl(selectedSession.meetingUrl);
                          if (link)
                            window.open(link, "_blank", "noopener,noreferrer");
                        }}
                        className="px-4 py-2.5 bg-[#DB911E] hover:bg-[#BA7815] text-white text-[13.5px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Session</span>
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={closeDetails}
                    disabled={logBusy}
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13.5px] font-medium rounded-[8px] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SESSIONS LIST VIEW (Upcoming & History Cards + Figma Tabs)
  // ----------------------------------------------------
  const displayedUpcoming =
    sessionFilterTab === "Mentorship"
      ? UPCOMING_SESSIONS.filter((s) => s.type === "Mentorship")
      : sessionFilterTab === "In-house"
        ? UPCOMING_SESSIONS.filter((s) => s.type === "In-house")
        : UPCOMING_SESSIONS;
  const displayedHistory =
    sessionFilterTab === "Mentorship"
      ? HISTORY_SESSIONS.filter((s) => s.type === "Mentorship")
      : sessionFilterTab === "In-house"
        ? HISTORY_SESSIONS.filter((s) => s.type === "In-house")
        : HISTORY_SESSIONS;

  return (
    <div className="w-full pb-12 animate-in fade-in duration-150">
      {availabilityDialog}
      {/* Figma Session Filter Tabs: Upcoming | Mentorship | In-house | Past | Calendar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {(["Upcoming", "Mentorship", "In-house", "Past"] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSessionFilterTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium font-sans transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                sessionFilterTab === tab
                  ? "bg-[#111827] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={openCalendarView}
          className="px-4 py-1.5 rounded-full text-[13px] font-medium font-sans bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Calendar
        </button>
      </div>

      {/* 1. UPCOMING SESSIONS CARD */}
      {sessionFilterTab !== "Past" && (
        <section className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4 pb-2">
            <div className="flex items-center gap-2 text-[#6B7280] font-sans text-[13px] font-normal">
              <Calendar className="w-4 h-4 text-[#6B7280] stroke-[1.8]" />
              <span>
                {sessionFilterTab === "Mentorship"
                  ? "Mentorship Sessions"
                  : sessionFilterTab === "In-house"
                    ? "In-house Sessions"
                    : "Upcoming"}
              </span>
            </div>

            <button
              type="button"
              onClick={openCalendarView}
              className="text-[#DB911E] hover:text-[#BA7815] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>View Calendar</span>
              <span className="text-[15px] transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex flex-col">
            {mentorship.loading ? (
              <QuietParticipantsSkeleton count={3} />
            ) : (
              <>
                {!mentorship.error && !displayedUpcoming.length && (
                  <p className="py-6 text-sm text-gray-500">
                    No upcoming mentorship sessions.
                  </p>
                )}
                {displayedUpcoming.map((session, index) => (
                  <div
                    key={session.id}
                    onClick={() => openDetails(session)}
                    className={`py-4 sm:py-4.5 flex items-center justify-between gap-4 cursor-pointer group hover:bg-[#FAFAFA] -mx-4 px-4 rounded-[10px] transition-colors ${
                      index < displayedUpcoming.length - 1
                        ? "border-b border-[#F0F2F5]"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-[15px] sm:text-[15.5px] font-medium text-gray-900 font-sans group-hover:text-[#DB911E] transition-colors">
                          {session.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
                            session.type === "Mentorship"
                              ? "bg-[#F3F4F6] text-[#6B7280]"
                              : "bg-[#FAF3EA] text-[#9A6D29]"
                          }`}
                        >
                          {session.type}
                        </span>
                      </div>
                      <p className="text-[12.5px] sm:text-[13px] text-[#6B7280] font-sans truncate">
                        {session.details}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="px-3.5 py-1 bg-[#EEF3ED] text-[#486B52] rounded-full text-[12px] font-medium font-sans">
                        Upcoming
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. HISTORY CARD */}
      <section
        className={`bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
          sessionFilterTab !== "Past" ? "mt-6" : ""
        } transition-shadow`}
      >
        {/* Card Header */}
        <div className="text-[12.5px] text-[#6B7280] font-sans font-medium mb-3">
          {sessionFilterTab === "Past" ? "Past Sessions" : "History"}
        </div>

        {/* History Sessions List */}
        <div className="flex flex-col">
          {mentorship.loading ? (
            <QuietParticipantsSkeleton count={2} />
          ) : (
            <>
              {!mentorship.error && !displayedHistory.length && (
                <p className="py-6 text-sm text-gray-500">
                  No mentorship session history yet.
                </p>
              )}
              {displayedHistory.map((session, index) => (
                <div
                  key={session.id}
                  onClick={() => openDetails(session)}
                  className={`py-4 sm:py-4.5 flex items-center justify-between gap-4 cursor-pointer group hover:bg-[#FAFAFA] -mx-4 px-4 rounded-[10px] transition-colors ${
                    index < displayedHistory.length - 1
                      ? "border-b border-[#F0F2F5]"
                      : ""
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[15px] sm:text-[15.5px] font-medium text-gray-900 font-sans group-hover:text-[#DB911E] transition-colors">
                        {session.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
                          session.type === "Mentorship"
                            ? "bg-[#F3F4F6] text-[#6B7280]"
                            : "bg-[#FAF3EA] text-[#9A6D29]"
                        }`}
                      >
                        {session.type}
                      </span>
                    </div>
                    <p className="text-[12.5px] sm:text-[13px] text-[#6B7280] font-sans truncate">
                      {session.details}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className="px-3.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[12px] font-medium font-sans">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* 3. SESSION DETAIL MODAL (triggered by clicking any session row) */}
      {selectedSession &&
        isMounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={closeDetails} />

            <div
              ref={detailRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Session details"
              className="relative max-h-[90vh] overflow-y-auto outline-none w-full max-w-[540px] bg-white rounded-[16px] shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Top Close */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium tracking-wide ${
                      selectedSession.type === "Mentorship"
                        ? "bg-[#F3F4F6] text-[#6B7280]"
                        : "bg-[#FAF3EA] text-[#9A6D29]"
                    }`}
                  >
                    {selectedSession.type}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
                      selectedSession.status === "Upcoming"
                        ? "bg-[#EEF3ED] text-[#486B52]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {selectedSession.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={logBusy}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Details */}
              <h2 className="text-[20px] font-semibold text-gray-900 font-heading mb-1.5">
                {selectedSession.title}
              </h2>
              <p className="text-[13.5px] text-gray-500 font-sans mb-5">
                {selectedSession.details}
              </p>

              {/* Info Cards */}
              <div className="space-y-3 bg-[#F9FAFB] p-4 rounded-[12px] border border-gray-100 mb-5 font-sans text-[13px]">
                <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Date
                  </span>
                  <span className="font-medium text-gray-800">
                    {selectedSession.dateFormatted}
                  </span>
                </div>

                {selectedSession.time && (
                  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" /> Time &
                      Duration
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedSession.time} ({selectedSession.duration})
                    </span>
                  </div>
                )}

                {selectedSession.participants && (
                  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" /> Participants
                    </span>
                    <span className="font-medium text-gray-800 truncate max-w-[280px]">
                      {selectedSession.participants}
                    </span>
                  </div>
                )}

                {selectedSession.meetingUrl && (
                  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-400" /> Meeting Link
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#DB911E] underline truncate max-w-[200px]">
                        {selectedSession.meetingUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyLink(selectedSession.meetingUrl || "")
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-800 cursor-pointer"
                        title="Copy meeting link"
                        aria-label="Copy meeting link"
                      >
                        {copiedLink ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Agenda / Topic Note */}
              {selectedSession.agenda && (
                <div className="mb-6">
                  <h4 className="text-[12.5px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5 font-sans">
                    Agenda & Focus
                  </h4>
                  <p className="text-[13.5px] text-gray-600 bg-white border border-gray-200 rounded-[10px] p-3.5 leading-relaxed font-sans">
                    {selectedSession.agenda}
                  </p>
                </div>
              )}

              {notesNotice && (
                <p role="status" className="mb-3 text-sm text-emerald-800">
                  {notesNotice}
                </p>
              )}
              {notesPanel}
              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {selectedSession.status === "Upcoming" &&
                  safeWebUrl(selectedSession.meetingUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        const link = safeWebUrl(selectedSession.meetingUrl);
                        if (link)
                          window.open(link, "_blank", "noopener,noreferrer");
                      }}
                      className="px-4 py-2.5 bg-[#DB911E] hover:bg-[#BA7815] text-white text-[13.5px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Session</span>
                    </button>
                  )}
                {selectedSession.status === "Upcoming" && (
                  <button
                    type="button"
                    onClick={() => setIsRescheduleOpen(true)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13.5px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Reschedule</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={logBusy}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13.5px] font-medium rounded-[8px] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 4. RESCHEDULE MODAL */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        sessionId={selectedSession?.id?.replace(/^mentor-|^program-/, "")}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={() => {
          mentorship.reload();
          program.reload();
        }}
      />

      {/* 5. BOOK SESSION MODAL (wired to header button) */}
      <BookSessionModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </div>
  );
}
