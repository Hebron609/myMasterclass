"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/shared/AppLink";
import { ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { InHouseSessionModal } from "@/components/dashboard/admin/InHouseSessionModal";
import { FollowUpModal } from "@/components/dashboard/admin/FollowUpModal";
import {
  StatsCardsSkeleton,
  TableSkeleton,
  QuietParticipantsSkeleton,
} from "@/components/shared/Skeletons";
import { useApiResource } from "@/hooks/useApiResource";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchAdminOverview,
  fetchAdminActivity,
  fetchAdminUsers,
} from "@/lib/services/admin";
import { fetchCohorts } from "@/lib/services/cohorts";
import { fetchEngagementHistory } from "@/lib/services/reports";
import { fetchSessions } from "@/lib/services/sessions";
import { userModuleRole } from "@/lib/transforms";
import type { ApiUser, Cohort } from "@/types";
import { ApiState } from "@/components/shared/ApiUI";
import { record, records } from "@/components/shared/ApiDataDisplay";

const figure = (value: unknown) =>
  typeof value === "number" ? value.toLocaleString() : "—";

function cohortBelongsToProgram(
  cohort: Cohort,
  activeProgram: { id: string; name: string } | null,
): boolean {
  if (!activeProgram) return true;
  const progIdNum = Number(activeProgram.id);
  if (Number.isFinite(progIdNum) && cohort.programId != null) {
    return Number(cohort.programId) === progIdNum;
  }
  const activeName = activeProgram.name
    .replace(/\s+program$/i, "")
    .trim()
    .toLowerCase();
  const rawProgName = (
    (cohort as unknown as { program?: { name?: string } }).program?.name || ""
  )
    .replace(/\s+program$/i, "")
    .trim()
    .toLowerCase();
  if (rawProgName && rawProgName === activeName) return true;
  if (cohort.programId == null && activeName.includes("vision")) {
    return true;
  }
  return false;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { activeProgram } = useAuthStore();
  const overview = useApiResource("admin-overview", fetchAdminOverview);
  const activity = useApiResource("admin-activity", fetchAdminActivity);
  const cohorts = useApiResource("admin-cohorts", fetchCohorts);
  const users = useApiResource("dashboard-users", fetchAdminUsers);
  const sessions = useApiResource("admin-dashboard-sessions", fetchSessions);
  const history = useApiResource(
    "admin-engagement-history",
    fetchEngagementHistory,
  );

  const allCohorts = cohorts.data || [];
  const programCohorts = allCohorts.filter((c) =>
    cohortBelongsToProgram(c, activeProgram),
  );
  const isSubsetProgram =
    Boolean(activeProgram && activeProgram.id !== "all") &&
    cohorts.data !== null &&
    programCohorts.length < allCohorts.length;

  const programCohortIds = new Set(programCohorts.map((c) => Number(c.id)));

  const membershipKnown = users.data?.every(
    (user) => user.cohorts !== undefined || user.cohortId !== undefined,
  );

  const programMenteesCount =
    isSubsetProgram && users.data
      ? users.data.filter(
          (u) =>
            u.role === "mentee" &&
            (u.cohorts?.some((c) => programCohortIds.has(Number(c.id))) ||
              (u.cohortId != null && programCohortIds.has(Number(u.cohortId)))),
        ).length
      : overview.data?.total_participants;

  const programMentorsCount =
    isSubsetProgram && users.data
      ? users.data.filter(
          (u) =>
            u.role === "mentor" &&
            (u.cohorts?.some((c) => programCohortIds.has(Number(c.id))) ||
              (u.cohortId != null && programCohortIds.has(Number(u.cohortId)))),
        ).length
      : overview.data?.total_mentors;

  const programActiveCohortsCount = isSubsetProgram
    ? programCohorts.filter((c) => c.status === "active").length
    : overview.data?.active_cohorts;

  const programMonthlySessionsCount = isSubsetProgram
    ? programCohorts.reduce(
        (sum, c) =>
          sum + (typeof c.sessionsCount === "number" ? c.sessionsCount : 0),
        0,
      )
    : overview.data?.sessions_logged_monthly;

  const stats = [
    {
      label: "Participants",
      value: figure(programMenteesCount),
    },
    {
      label: "Mentors",
      value: figure(programMentorsCount),
    },
    {
      label: "Active cohorts",
      value: figure(programActiveCohortsCount),
    },
    {
      label: "Sessions this month",
      value: figure(programMonthlySessionsCount),
    },
  ];

  const activeCohorts = programCohorts
    .filter((cohort) => cohort.status === "active")
    .map((cohort) => {
      const cohortUsers = users.data || [];
      const cohortMentees = membershipKnown
        ? cohortUsers.filter(
            (user) =>
              user.role === "mentee" &&
              (user.cohorts?.some((item) => item.id === cohort.id) ||
                user.cohortId === cohort.id),
          )
        : [];
      const mentees = membershipKnown ? cohortMentees.length : undefined;
      const activeCount = cohortMentees.filter(
        (u) => u.status === "active",
      ).length;
      const backendRate =
        cohort.activeRate ??
        (cohort as unknown as { active_rate?: number; rate?: number })
          .active_rate ??
        (cohort as unknown as { active_rate?: number; rate?: number }).rate;
      const activeRate =
        typeof backendRate === "number"
          ? `${backendRate}%`
          : cohortMentees.length > 0
            ? `${Math.round((activeCount / cohortMentees.length) * 100)}%`
            : "—";

      const mentorCount = membershipKnown
        ? cohortUsers.filter(
            (user) =>
              user.role === "mentor" &&
              (user.cohorts?.some((item) => item.id === cohort.id) ||
                user.cohortId === cohort.id),
          ).length
        : undefined;

      const cohortUserIds = new Set(
        cohortUsers
          .filter(
            (user) =>
              user.cohorts?.some((item) => item.id === cohort.id) ||
              user.cohortId === cohort.id,
          )
          .map((u) => u.id),
      );

      const backendSessions =
        cohort.sessionsCount ??
        (
          cohort as unknown as {
            sessions_count?: number;
            sessions_logged?: number;
            sessions?: number;
          }
        ).sessions_count ??
        (cohort as unknown as { sessions_logged?: number; sessions?: number })
          .sessions_logged ??
        (cohort as unknown as { sessions?: number }).sessions;

      const cohortSessionsCount =
        typeof backendSessions === "number"
          ? backendSessions
          : sessions.data
            ? sessions.data.filter(
                (s) =>
                  (s.menteeId && cohortUserIds.has(s.menteeId)) ||
                  (s as unknown as { cohort?: { id?: number } }).cohort?.id ===
                    cohort.id,
              ).length
            : undefined;

      return {
        id: cohort.id,
        name: cohort.name,
        participants: mentees !== undefined ? String(mentees) : "—",
        mentors: mentorCount !== undefined ? String(mentorCount) : "—",
        sessions:
          cohortSessionsCount !== undefined ? String(cohortSessionsCount) : "—",
        active: activeRate,
      };
    });

  const quietParticipants = records(activity.data?.inactive)
    .filter((item) => userModuleRole(item as unknown as ApiUser) === "mentee")
    .map((item) => ({
      id: String(item.user_id || item.id || ""),
      name: String(item.name || record(item.user).name || "Participant"),
      issue:
        typeof item.reason === "string"
          ? item.reason
          : "No activity in the last 30 days",
      lastActivity:
        typeof item.last_active_at === "string"
          ? item.last_active_at
          : undefined,
    }));

  const chartData = (history.data || []).map((item) => ({
    week: String(item.week),
    sessions: Number(item.sessions || 0),
  }));

  const [isInHouseSessionModalOpen, setIsInHouseSessionModalOpen] =
    useState(false);
  const [followUpParticipant, setFollowUpParticipant] = useState<{
    id?: string;
    name: string;
    issue: string;
    lastActivity?: string;
  } | null>(null);

  useEffect(() => {
    const handleOpenInHouseSessionModal = () =>
      setIsInHouseSessionModalOpen(true);
    window.addEventListener(
      "open-in-house-session-modal",
      handleOpenInHouseSessionModal,
    );
    return () =>
      window.removeEventListener(
        "open-in-house-session-modal",
        handleOpenInHouseSessionModal,
      );
  }, []);

  return (
    <div className="space-y-6 pb-10 w-full">
      <ApiState {...overview} onRetry={overview.reload} />
      {/* Top Stats */}
      {overview.loading ? (
        <StatsCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-center"
            >
              <p className="text-[13px] text-gray-500 font-sans mb-2">
                {stat.label}
              </p>
              <p className="text-[28px] font-medium text-gray-900 font-sans leading-none">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Active Cohorts */}
      <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[12px] text-gray-500 font-sans mb-1">Cohorts</p>
            <h2 className="text-[16px] font-medium text-[#0F172A] font-sans">
              Active cohorts
            </h2>
          </div>
          <Link
            href="/admin/cohorts"
            className="text-[#DB911E] text-[13px] font-medium flex items-center gap-1 hover:text-[#BA7815] transition-colors font-sans"
          >
            Manage <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ApiState {...cohorts} onRetry={cohorts.reload} />
        <ApiState {...users} onRetry={users.reload} />
        {cohorts.loading || users.loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <div className="animate-in fade-in duration-300">
            {/* Mobile Cohort Cards (Below md) */}
            <div className="md:hidden space-y-3">
              {!cohorts.loading && !cohorts.error && !activeCohorts.length && (
                <div className="py-8 text-center text-sm text-gray-500">
                  No active cohorts yet.
                </div>
              )}
              {activeCohorts.map((cohort, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push("/admin/cohorts")}
                  className="border border-gray-100 rounded-[12px] p-4 bg-[#FAF9F6]/60 hover:bg-gray-50 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14.5px] font-medium text-gray-900 font-sans truncate">
                      {cohort.name}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[11.5px] font-medium font-sans border border-green-100/50 shrink-0">
                      {cohort.active}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white rounded-[8px] py-1.5 px-2 border border-gray-100">
                      <p className="text-[13px] font-medium text-gray-900 font-sans">
                        {cohort.participants}
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-sans">
                        Participants
                      </p>
                    </div>
                    <div className="bg-white rounded-[8px] py-1.5 px-2 border border-gray-100">
                      <p className="text-[13px] font-medium text-gray-900 font-sans">
                        {cohort.mentors}
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-sans">
                        Mentors
                      </p>
                    </div>
                    <div className="bg-white rounded-[8px] py-1.5 px-2 border border-gray-100">
                      <p className="text-[13px] font-medium text-gray-900 font-sans">
                        {cohort.sessions}
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-sans">
                        Sessions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (md and up) */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F2EB] border-b border-gray-100">
                  <th className="py-3 px-4 text-[13px] font-medium text-gray-700 font-sans rounded-tl-[8px] rounded-bl-[8px]">
                    Cohort
                  </th>
                  <th className="py-3 px-4 text-[13px] font-medium text-gray-700 font-sans">
                    Participants
                  </th>
                  <th className="py-3 px-4 text-[13px] font-medium text-gray-700 font-sans">
                    Mentors
                  </th>
                  <th className="py-3 px-4 text-[13px] font-medium text-gray-700 font-sans">
                    Session Logged
                  </th>
                  <th className="py-3 px-4 text-[13px] font-medium text-gray-700 font-sans rounded-tr-[8px] rounded-br-[8px]">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {!cohorts.loading && !cohorts.error && !activeCohorts.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No active cohorts yet.
                    </td>
                  </tr>
                )}
                {activeCohorts.map((cohort, idx) => (
                  <tr
                    key={idx}
                    onClick={() => router.push("/admin/cohorts")}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 text-[14px] text-gray-900 font-sans">
                      {cohort.name}
                    </td>
                    <td className="py-4 px-4 text-[14px] text-gray-700 font-sans">
                      {cohort.participants}
                    </td>
                    <td className="py-4 px-4 text-[14px] text-gray-700 font-sans">
                      {cohort.mentors}
                    </td>
                    <td className="py-4 px-4 text-[14px] text-gray-700 font-sans">
                      {cohort.sessions}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[12px] font-medium font-sans border border-green-100/50">
                        {cohort.active}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-[12px] text-gray-500 font-sans mb-1">Activity</p>
            <h2 className="text-[16px] font-medium text-[#0F172A] font-sans">
              Engagement this month
            </h2>
          </div>

          {chartData.length > 0 ? (
            <div className="h-[210px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
                  barCategoryGap="16%"
                >
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 400 }}
                    dy={8}
                  />
                  <YAxis hide domain={[0, "dataMax + 5"]} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#111928] text-white text-[11.5px] px-2.5 py-1 rounded-[6px] shadow-lg font-sans">
                            <span>{payload[0].value} sessions</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                  />
                  <Bar
                    dataKey="sessions"
                    fill="#88B090"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    minPointSize={3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg bg-[#F8F9FA] text-center text-sm text-gray-500">
              No engagement history recorded yet.
            </div>
          )}
        </div>

        {/* Quiet Participants */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="mb-6">
            <p className="text-[12px] text-[#E07954] font-medium font-sans mb-1">
              Needs attention
            </p>
            <h2 className="text-[16px] font-medium text-[#0F172A] font-sans">
              Quiet participants
            </h2>
          </div>

          <ApiState {...activity} onRetry={activity.reload} />
          {activity.loading ? (
            <QuietParticipantsSkeleton count={3} />
          ) : (
            <div className="flex flex-col gap-3 flex-1 animate-in fade-in duration-300">
              {!activity.loading &&
                !activity.error &&
                !quietParticipants.length && (
                  <p className="py-8 text-sm text-gray-500">
                    No quiet participants in the last 30 days.
                  </p>
                )}
              {quietParticipants.map((p, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-[12px] p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
                >
                  <div>
                    <div className="text-[14px] font-medium text-gray-900 font-sans">
                      {p.name}
                    </div>
                    <div className="text-[12.5px] text-gray-500 font-sans mt-0.5">
                      {p.issue}
                    </div>
                  </div>
                  <button
                    onClick={() => setFollowUpParticipant(p)}
                    className="px-3 py-1.5 border border-gray-200 rounded-[8px] text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans whitespace-nowrap ml-2"
                  >
                    Follow-up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InHouseSessionModal
        isOpen={isInHouseSessionModalOpen}
        onClose={() => setIsInHouseSessionModalOpen(false)}
      />

      <FollowUpModal
        isOpen={followUpParticipant !== null}
        onClose={() => setFollowUpParticipant(null)}
        participantId={followUpParticipant?.id}
        participantName={followUpParticipant?.name || ""}
        issue={followUpParticipant?.issue || ""}
        lastActivity={followUpParticipant?.lastActivity}
      />
    </div>
  );
}
