"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMentees, fetchMentee } from "@/lib/services/users";
import { fetchSessions } from "@/lib/services/sessions";
import { fetchGoals } from "@/lib/services/goals";
import { fetchCohorts } from "@/lib/services/cohorts";
import { ApiState } from "@/components/shared/ApiUI";

export interface MenteeRecord {
  id: string;
  name: string;
  location: string;
  avatar: string;
  yearLabel: string;
  title: string;
  cohort: string;
  interests: string[];
  progress: number;
  statusCategory: "On-track" | "Needs check in" | "Getting started";
  goals: {
    completed: number;
    total: number;
  };
  sessions: number;
}

const mockMentees: MenteeRecord[] = [];

interface MenteeTableProps {
  onViewProfile: (mentee: MenteeRecord) => void;
}

export default function MenteeTable({ onViewProfile }: MenteeTableProps) {
  const { token } = useAuth();
  const resource = useApiResource("mentor-mentees", fetchMentees);
  const sessionsResource = useApiResource(
    "mentor-table-sessions",
    fetchSessions,
  );
  const cohortsResource = useApiResource("mentor-table-cohorts", fetchCohorts);
  const [enrichedByMentee, setEnrichedByMentee] = useState<
    Record<
      string,
      {
        completed: number;
        total: number;
        categories: string[];
        journeyYear?: number;
        cohortName?: string;
        location?: string;
        sessionsCount?: number;
      }
    >
  >({});

  useEffect(() => {
    if (!token || !resource.data?.length) return;
    let cancelled = false;
    Promise.all(
      resource.data.map(async (mentee) => {
        try {
          const [detailResult, goalsResult] = await Promise.allSettled([
            fetchMentee(token, mentee.id),
            fetchGoals(token, mentee.id),
          ]);
          const detail =
            detailResult.status === "fulfilled" ? detailResult.value : null;
          const list =
            goalsResult.status === "fulfilled"
              ? goalsResult.value
              : detail?.goals || [];
          const completed = list.filter((g) => g.status === "completed").length;
          const categories = Array.from(
            new Set(list.map((g) => g.category).filter(Boolean)),
          );
          const detailCohorts =
            detail?.user.cohorts?.map((c) => c.name).filter(Boolean).join(", ") ||
            (typeof detail?.profile?.cohort === "string"
              ? detail.profile.cohort
              : typeof detail?.profile?.cohort_name === "string"
                ? detail.profile.cohort_name
                : undefined);
          const detailLocation = [detail?.profile?.city, detail?.profile?.country]
            .filter((v) => typeof v === "string" && v.trim())
            .join(", ");
          const detailYear =
            detail?.user.journeyYear ??
            (typeof detail?.profile?.journey_year === "number"
              ? detail.profile.journey_year
              : undefined);
          return [
            mentee.id,
            {
              completed,
              total: list.length,
              categories,
              journeyYear: detailYear,
              cohortName: detailCohorts,
              location: detailLocation || undefined,
              sessionsCount: detail?.sessions?.length,
            },
          ] as const;
        } catch {
          return [
            mentee.id,
            { completed: 0, total: 0, categories: [] },
          ] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) {
        setEnrichedByMentee(Object.fromEntries(entries));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, resource.data]);

  const uniqueUsers = Array.from(
    new Map((resource.data || []).map((u) => [String(u.id), u])).values(),
  );

  const mentees: MenteeRecord[] = uniqueUsers.map((user) => {
    const enriched = enrichedByMentee[user.id] || {
      completed: 0,
      total: 0,
      categories: [],
    };
    const menteeSessions = (sessionsResource.data || []).filter(
      (s) => s.menteeId === user.id || s.menteeName === user.name,
    );
    const completedSessions = menteeSessions.filter(
      (s) => s.status === "completed",
    ).length;
    const totalSessionsCount =
      typeof user.sessionsCount === "number"
        ? user.sessionsCount
        : menteeSessions.length > 0
          ? menteeSessions.length
          : (enriched.sessionsCount ?? 0);
    const goalsCompleted =
      typeof user.goalsCompletedCount === "number"
        ? user.goalsCompletedCount
        : enriched.completed;
    const goalsTotal =
      typeof user.goalsTotalCount === "number"
        ? user.goalsTotalCount
        : enriched.total;
    const progress =
      typeof user.progress === "number" && user.progress > 0
        ? Math.min(100, Math.round(user.progress))
        : goalsTotal > 0
          ? Math.round((goalsCompleted / goalsTotal) * 100)
          : completedSessions > 0
            ? Math.min(100, completedSessions * 25)
            : 0;

    const normalizeStatusCategory = (
      raw?: string,
    ): MenteeRecord["statusCategory"] | null => {
      if (!raw) return null;
      const lower = raw.toLowerCase().replace(/[-_]/g, " ");
      if (lower.includes("on track")) return "On-track";
      if (lower.includes("needs check")) return "Needs check in";
      if (lower.includes("getting started")) return "Getting started";
      return null;
    };

    const statusCategory: MenteeRecord["statusCategory"] =
      normalizeStatusCategory(user.statusCategory) ||
      (progress >= 50 || completedSessions > 0
        ? "On-track"
        : goalsTotal > 0 || totalSessionsCount > 0
          ? "Getting started"
          : "Needs check in");

    const resolvedYear = enriched.journeyYear ?? user.journeyYear ?? 1;
    const yearLabel = `Year ${resolvedYear}`;

    // Resolve cohort name from user.cohorts, enriched detail, or cohorts directory membership/id
    const matchedCohortFromDirectory = (cohortsResource.data || []).find(
      (c) =>
        (user.cohortId && String(c.id) === String(user.cohortId)) ||
        c.members?.some((m) => String(m.id) === String(user.id)),
    );
    const resolvedCohort =
      user.cohorts?.map((cohort) => cohort.name).filter(Boolean).join(", ") ||
      enriched.cohortName ||
      matchedCohortFromDirectory?.name ||
      cohortsResource.data?.[0]?.name ||
      "Cohort 2025A";

    return {
      id: user.id,
      name: user.name,
      location:
        (user.location && user.location !== "—" ? user.location : null) ||
        enriched.location ||
        "Accra, Ghana",
      avatar: user.avatarUrl || "/icons/user-placeholder.svg",
      yearLabel,
      title: `${yearLabel} Participant`,
      cohort: resolvedCohort,
      interests:
        user.interests && user.interests.length > 0
          ? user.interests.slice(0, 2)
          : enriched.categories.length > 0
            ? enriched.categories.slice(0, 2)
            : user.expertise
              ? [user.expertise]
              : ["Leadership"],
      progress,
      statusCategory,
      goals: {
        completed: goalsCompleted,
        total: goalsTotal,
      },
      sessions: totalSessionsCount,
    };
  });
  const [activeTab, setActiveTab] = useState("All Mentees");
  const filteredMentees =
    activeTab === "All Mentees"
      ? mentees
      : mentees.filter((m) => m.statusCategory === activeTab);

  return (
    <div className="w-full">
      <ApiState {...resource} onRetry={resource.reload} />
      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 mb-5 sm:mb-6 overflow-x-auto scrollbar-hide">
        <div className="inline-flex bg-white rounded-full p-1 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {["All Mentees", "On-track", "Needs check in", "Getting started"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 sm:px-4 py-1.5 text-[12.5px] sm:text-[13px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#0F172A] text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Mobile Mentee Cards (Below md) */}
      <div className="md:hidden px-4 space-y-3">
        {!resource.loading &&
          !resource.error &&
          filteredMentees.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 bg-[#FAF9F6] rounded-[12px] border border-gray-100">
              No mentees in this category.
            </div>
          )}
        {filteredMentees.map((mentee) => (
          <div
            key={mentee.id}
            onClick={() => onViewProfile(mentee)}
            className="bg-white border border-gray-200 rounded-[14px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3.5 active:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Top Row: Avatar, Name, Location & Profile CTA */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={mentee.avatar}
                  alt={mentee.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/user-placeholder.svg";
                  }}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <div className="text-[14.5px] font-medium text-gray-900 truncate font-sans">
                    {mentee.name}
                  </div>
                  <div className="text-[12px] text-gray-400 truncate font-sans">
                    {mentee.location}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(mentee);
                }}
                className="px-3 py-1 bg-[#FCF9F0] text-[#DB911E] rounded-full text-[12px] font-medium hover:bg-[#DB911E]/15 transition-colors shrink-0 font-sans cursor-pointer"
              >
                Profile →
              </button>
            </div>

            {/* Middle Row: Cohort, Year & Interests */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 bg-[#F3F4F6] text-gray-700 rounded-full text-[11px] font-medium font-sans">
                {mentee.yearLabel} Participant
              </span>
              <span className="px-2.5 py-0.5 bg-[#EBF2EB] text-[#486B52] rounded-full text-[11px] font-medium font-sans">
                {mentee.cohort}
              </span>
              {mentee.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-[#F8F9FA] border border-gray-100 rounded-full text-[11px] text-gray-500 font-medium font-sans"
                >
                  {interest}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[12px] text-gray-500 font-sans mb-1.5">
                <span>Journey progress</span>
                <span className="font-medium text-gray-700">
                  {mentee.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#DB911E] h-full rounded-full transition-all duration-300"
                  style={{ width: `${mentee.progress}%` }}
                />
              </div>
            </div>

            {/* Bottom Metrics Row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[12px] font-sans">
              <div className="flex items-center justify-between bg-[#F8F7F5] rounded-[8px] px-3 py-1.5">
                <span className="text-gray-500">Goals</span>
                <span className="font-medium text-gray-800">
                  {mentee.goals.completed}/{mentee.goals.total}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#F8F7F5] rounded-[8px] px-3 py-1.5">
                <span className="text-gray-500">Sessions</span>
                <span className="font-medium text-gray-800">
                  {mentee.sessions}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Section (md and up) */}
      <div className="hidden md:block w-full overflow-x-auto px-6">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-[#F8F7F5] text-[13.5px] font-medium text-gray-700 font-sans border-b border-gray-100">
              <th className="px-4 py-3 rounded-l-[8px] font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Cohorts</th>
              <th className="px-4 py-3 font-medium">Interests</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium text-center">Goals</th>
              <th className="px-4 py-3 font-medium text-center">Session</th>
              <th className="px-4 py-3 rounded-r-[8px] font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-[13.5px] font-sans text-gray-800">
            {!resource.loading &&
              !resource.error &&
              filteredMentees.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No mentees in this category.
                  </td>
                </tr>
              )}
            {filteredMentees.map((mentee) => (
              <tr
                key={mentee.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mentee.avatar}
                      alt={mentee.name}
                      className="w-[36px] h-[36px] rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {mentee.name}
                      </div>
                      <div className="text-[12px] text-gray-400">
                        {mentee.location}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Title */}
                <td className="px-4 py-4 text-gray-600">
                  <div className="flex flex-col">
                    <span>{mentee.yearLabel}</span>
                    <span>Participant</span>
                  </div>
                </td>

                {/* Cohorts */}
                <td className="px-4 py-4 text-gray-600">{mentee.cohort}</td>

                {/* Interests */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
                    {mentee.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#F8F9FA] border border-gray-100 rounded-full text-[11px] text-gray-500 font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Progress */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 w-[120px]">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#DB911E] h-full rounded-full transition-all duration-300"
                        style={{ width: `${mentee.progress}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">
                      {mentee.progress}%
                    </span>
                  </div>
                </td>

                {/* Goals */}
                <td className="px-4 py-4 text-center text-gray-600">
                  {mentee.goals.completed}/{mentee.goals.total}
                </td>

                {/* Session */}
                <td className="px-4 py-4 text-center text-gray-600">
                  {mentee.sessions}
                </td>

                {/* Action */}
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onViewProfile(mentee)}
                    className="text-[#DB911E] text-[13px] font-medium hover:text-[#BA7815] transition-colors cursor-pointer"
                  >
                    Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
