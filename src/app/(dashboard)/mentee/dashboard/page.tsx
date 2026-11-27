"use client";

import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trophy,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApiResource } from "@/hooks/useApiResource";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchDashboard, fetchLeaderboard } from "@/lib/services/dashboard";
import { fetchGoals } from "@/lib/services/goals";
import { fetchMyMentor, fetchMentors } from "@/lib/services/users";
import { fetchReflections } from "@/lib/services/reflections";
import { resolveAvatarUrl } from "@/lib/transforms";
import {
  ApiState,
  formatDate,
  formatDateTime,
} from "@/components/shared/ApiUI";
import { record } from "@/components/shared/ApiDataDisplay";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";
import { WriteReflectionModal } from "@/components/dashboard/reflections/WriteReflectionModal";
import {
  JourneyTimelineSkeleton,
  GoalCardsSkeleton,
  AssignedMentorSkeleton,
  ReflectionsSkeleton,
} from "@/components/shared/Skeletons";

export default function MenteeDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const dashboard = useApiResource("mentee-dashboard", fetchDashboard);
  const goals = useApiResource("mentee-dashboard-goals", fetchGoals);
  const mentor = useApiResource("mentee-dashboard-mentor", fetchMyMentor);
  const mentorsDirectory = useApiResource(
    "mentee-dashboard-mentors-dir",
    fetchMentors,
  );
  const directoryMentorMatch = (mentorsDirectory.data || []).find(
    (m) =>
      (mentor.data?.mentor?.id &&
        String(m.id) === String(mentor.data.mentor.id)) ||
      m.isAssigned,
  );
  const assignedMentorAvatar =
    resolveAvatarUrl(
      mentor.data?.mentor?.profile?.avatar_url ||
        (mentor.data?.mentor as unknown as Record<string, unknown>)
          ?.avatar_url ||
        (mentor.data?.mentor as unknown as Record<string, unknown>)?.avatar,
    ) ||
    resolveAvatarUrl(directoryMentorMatch?.avatarUrl) ||
    "/icons/user-placeholder.svg";
  const leaderboard = useApiResource(
    "mentee-dashboard-leaderboard",
    fetchLeaderboard,
  );
  const reflections = useApiResource(
    "mentee-dashboard-reflections",
    fetchReflections,
  );
  const [booking, setBooking] = useState(false);
  const [writing, setWriting] = useState(false);
  const journey = record(dashboard.data?.data.journey);
  const year =
    typeof journey.current_year === "number"
      ? journey.current_year
      : user?.journeyYear;
  const current =
    leaderboard.data?.data.items.find(
      (item) => String(item.user_id) === user?.id,
    ) || leaderboard.data?.data.current_user;
  const position =
    typeof current?.position === "number" ? current.position : null;
  const score = typeof current?.score === "number" ? current.score : null;
  const ranked = leaderboard.data?.data.items || [];
  const previous = ranked.find(
    (item) =>
      typeof item.position === "number" &&
      position !== null &&
      item.position === position - 1,
  );
  const figure = (value: unknown) =>
    typeof value === "number" ? value.toLocaleString() : "—";
  return (
    <div className="space-y-4 md:space-y-6 w-full pb-10">
      <ApiState {...dashboard} onRetry={dashboard.reload} />
      {/* 1. Your Journey Timeline */}
      {dashboard.loading ? (
        <JourneyTimelineSkeleton />
      ) : (
        <section className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">
                Your Journey
              </p>
              <h2 className="text-[18px] md:text-[20px] font-medium text-gray-900 font-heading">
                Year {year || "—"} of 10
              </h2>
            </div>
            <p className="text-[13px] md:text-[14px] font-medium text-gray-700">
              {typeof journey.module_name === "string" &&
              journey.module_name.trim()
                ? journey.module_name
                : year && year >= 7
                  ? "Phase 3 · Branching"
                  : year && year >= 4
                    ? "Phase 2 · Tending"
                    : "Phase 1 · Rooting"}
            </p>
          </div>

          <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center justify-between relative px-2 md:px-4 mt-4 min-w-[600px] md:min-w-full">
              {/* Background Track Line */}
              <div className="absolute top-5 left-0 right-0 h-[1px] bg-gray-200 z-0" />

              {/* Steps */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                const isDone = year !== undefined && step < year;
                const isActive = step === year;

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center z-10 bg-white px-2"
                  >
                    {isDone ? (
                      <>
                        <div className="h-10 w-10 rounded-full bg-[#DB911E] flex items-center justify-center text-white font-medium text-[15px]">
                          {step}
                        </div>
                        <span className="text-[12px] font-medium text-gray-500 mt-3">
                          Done
                        </span>
                      </>
                    ) : isActive ? (
                      <>
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900 font-medium text-[15px] border border-[#DB911E] shadow-[0_0_12px_rgba(219,145,30,0.3)]">
                          {step}
                        </div>
                        <span className="text-[12px] font-medium text-gray-500 mt-3">
                          Y{step}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-600 font-medium text-[15px] border border-gray-200">
                          {step}
                        </div>
                        <span className="text-[12px] font-medium text-gray-300 mt-3">
                          —
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 2. Grid: Goals & Mentorship */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Goals */}
        <section className="lg:col-span-2 bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-[13px] text-gray-500 font-medium mb-1">Goals</p>
            <h2 className="text-[18px] md:text-[20px] font-medium text-gray-900 font-heading">
              What you're working on
            </h2>
          </div>

          <ApiState {...goals} onRetry={goals.reload} />
          {goals.loading ? (
            <GoalCardsSkeleton count={3} />
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {goals.data?.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3 sm:gap-0"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#F8F7F5] flex items-center justify-center shrink-0">
                      {goal.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#47B378]" />
                      ) : (
                        <Clock className="h-5 w-5 text-[#DB911E]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[14px] md:text-[15px] font-medium text-gray-900 mb-0.5">
                        {goal.title}
                      </h3>
                      <p className="text-[12px] md:text-[13px] text-gray-500">
                        {goal.category} • {formatDate(goal.endDate)}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#DB911E]/10 text-[#D2850D] text-[12px] font-medium rounded-full w-fit">
                    {goal.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
              {goals.data?.length === 0 && (
                <p className="py-5 text-sm text-gray-500">No goals yet.</p>
              )}
            </div>
          )}
        </section>

        {/* Right: Mentorship */}
        <section className="lg:col-span-1 bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <p className="text-[13px] text-gray-500 font-medium mb-1">
              Mentorship
            </p>
            <h2 className="text-[18px] md:text-[20px] font-medium text-gray-900 font-heading">
              Your Mentor
            </h2>
          </div>

          <ApiState {...mentor} onRetry={mentor.reload} />
          {mentor.loading ? (
            <AssignedMentorSkeleton />
          ) : (
            <div className="flex flex-col flex-1 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={assignedMentorAvatar}
                  alt={
                    mentor.data?.mentor?.name ||
                    directoryMentorMatch?.name ||
                    "Your Mentor"
                  }
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/user-placeholder.svg";
                  }}
                  className="h-12 w-12 rounded-full bg-gray-100 object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] md:text-[16px] font-medium text-gray-900 leading-tight truncate">
                    {mentor.data?.mentor?.name ||
                      directoryMentorMatch?.name ||
                      "Not yet assigned"}
                  </h3>
                  <p className="text-[13px] text-gray-500 truncate">
                    {mentor.data?.mentor?.email ||
                      directoryMentorMatch?.email ||
                      "Your mentor will appear here once assigned."}
                  </p>
                </div>
              </div>

              <div className="bg-[#FBF7EE] border border-gray-100 rounded-[12px] p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-[12px] text-gray-500 font-medium">
                    Next Session
                  </p>
                </div>
                <p className="text-[13px] md:text-[14px] font-medium text-gray-900">
                  {mentor.data?.next_session
                    ? formatDateTime(
                        mentor.data.next_session.session_date ||
                          mentor.data.next_session.starts_at,
                      )
                    : "No upcoming session"}
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => setBooking(true)}
                  disabled={!mentor.data?.mentor}
                  className="disabled:opacity-50 w-full bg-[#DB911E] hover:bg-[#BA7815] text-white font-medium py-3 rounded-[8px] text-[13px] md:text-[14px] transition-colors"
                >
                  Book Virtual Meeting
                </button>
                <button
                  onClick={() => setWriting(true)}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-[8px] text-[13px] md:text-[14px] transition-colors border border-gray-200"
                >
                  Log Reflection
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 3. Leaderboard */}
      <section className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
          <div>
            <p className="text-[13px] text-gray-500 font-medium mb-1">
              Leaderboard
            </p>
            <h2 className="text-[18px] md:text-[20px] font-medium text-gray-900 font-heading">
              {position === null ? "Your standing" : `You’re #${position}`}
            </h2>
          </div>
          <button
            onClick={() => router.push("/mentee/leaderboard")}
            className="flex items-center gap-1 text-[13px] md:text-[14px] font-medium text-[#DB911E] hover:text-[#BA7815] transition-colors border-b border-[#DB911E] pb-2.5 hover:border-[#BA7815] w-fit"
          >
            View Leaderboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar Area */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-[#DB911E]/10 text-gray-700 text-[13px] font-medium rounded-md">
                {position === null ? "—" : `#${position}`}
              </div>
              <p className="text-[13px] md:text-[14px] font-medium text-gray-900">
                <span className="text-[16px] md:text-[18px]">
                  {figure(score)}
                </span>{" "}
                points
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] md:text-[13px] text-gray-500">
                {position === 1
                  ? "Leading the cohort board"
                  : previous &&
                      typeof previous.score === "number" &&
                      score !== null
                    ? `${Math.max(0, previous.score - score)} to catch ${previous.name}`
                    : "Steady cohort standing"}
              </p>
              <div className="flex items-center gap-0.5 text-[#8DB58D] text-[12px] font-medium">
                <ArrowUp className="h-3 w-3" />{" "}
                {current?.weekly_movement !== undefined &&
                current?.weekly_movement !== null
                  ? String(current.weekly_movement)
                  : "0"}
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#DB911E] rounded-full transition-all duration-300"
              style={{
                width: `${
                  score !== null && score > 0
                    ? Math.min(
                        100,
                        Math.max(
                          10,
                          Math.round(
                            (score /
                              Math.max(
                                1,
                                typeof previous?.score === "number"
                                  ? previous.score
                                  : typeof ranked[0]?.score === "number"
                                    ? ranked[0].score
                                    : score,
                              )) *
                              100,
                          ),
                        ),
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 border-t border-b border-gray-100 py-6">
          <div>
            <p className="text-[16px] md:text-[18px] font-medium text-gray-900 mb-1">
              {figure(current?.sessions_attended)}
            </p>
            <p className="text-[12px] md:text-[13px] text-gray-500">Sessions</p>
          </div>
          <div>
            <p className="text-[16px] md:text-[18px] font-medium text-gray-900 mb-1">
              {figure(current?.reflections)}
            </p>
            <p className="text-[12px] md:text-[13px] text-gray-500">
              Reflections
            </p>
          </div>
          <div>
            <p className="text-[16px] md:text-[18px] font-medium text-gray-900 mb-1">
              {figure(current?.goals_completed)}
            </p>
            <p className="text-[12px] md:text-[13px] text-gray-500">
              Goals closed
            </p>
          </div>
          <div>
            <p className="text-[16px] md:text-[18px] font-medium text-gray-900 mb-1">
              {figure(current?.streak)}
            </p>
            <p className="text-[12px] md:text-[13px] text-gray-500">
              Steady streak
            </p>
          </div>
        </div>

        <ApiState {...leaderboard} onRetry={leaderboard.reload} />
        <div>
          <h3 className="text-[14px] md:text-[15px] font-medium text-gray-900 mb-4">
            Around you
          </h3>
          <div className="space-y-4">
            {ranked
              .filter(
                (item) =>
                  position !== null &&
                  typeof item.position === "number" &&
                  Math.abs(item.position - position) <= 1,
              )
              .map((item) => (
                <div
                  key={String(item.user_id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[12px] font-medium shrink-0">
                      {figure(item.position)}
                    </div>
                    <p className="text-[13px] md:text-[14px] text-gray-900">
                      {String(item.name || "Participant")}
                    </p>
                  </div>
                  <p className="text-[13px] md:text-[14px] font-medium text-gray-900">
                    {figure(item.score)}
                  </p>
                </div>
              ))}
            {ranked.length === 0 &&
              !leaderboard.loading &&
              !leaderboard.error && (
                <p className="text-sm text-gray-500">
                  No leaderboard entries yet.
                </p>
              )}
          </div>
        </div>
      </section>

      {/* 4. Reflections */}
      <section className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 border-b border-gray-100 pb-6 gap-4 sm:gap-0">
          <div>
            <p className="text-[13px] text-gray-500 font-medium mb-1">
              Reflections
            </p>
            <h2 className="text-[18px] md:text-[20px] font-medium text-gray-900 font-heading">
              Your journal
            </h2>
          </div>
          <button
            onClick={() => router.push("/mentee/reflections")}
            className="flex items-center gap-1 text-[13px] md:text-[14px] font-medium text-[#DB911E] hover:text-[#BA7815] transition-colors border-b border-[#DB911E] pb-2.5 hover:border-[#BA7815] w-fit"
          >
            Open Journal <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <ApiState {...reflections} onRetry={reflections.reload} />
        {reflections.loading ? (
          <ReflectionsSkeleton count={2} />
        ) : (
          <div className="space-y-0 animate-in fade-in duration-300">
            {reflections.data?.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8 py-5 border-b border-gray-100"
              >
                <div className="w-full sm:w-[100px] shrink-0">
                  <p className="text-[13px] md:text-[14px] font-medium text-gray-900">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed pt-0.5">
                  {item.content}
                </p>
              </div>
            ))}
            {reflections.data?.length === 0 && (
              <p className="py-5 text-sm text-gray-500">No reflections yet.</p>
            )}
          </div>
        )}
      </section>

      <BookSessionModal
        isOpen={booking}
        onClose={() => setBooking(false)}
        onSuccess={mentor.reload}
      />
      <WriteReflectionModal
        isOpen={writing}
        onClose={() => setWriting(false)}
        onSuccess={reflections.reload}
      />
    </div>
  );
}
