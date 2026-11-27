"use client";

import { useState } from "react";

import { Trophy, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

import { useApiResource } from "@/hooks/useApiResource";
import { fetchLeaderboard } from "@/lib/services/dashboard";
import { fetchCohorts } from "@/lib/services/cohorts";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiState, safeWebUrl } from "@/components/shared/ApiUI";
import { LeaderboardSkeleton } from "@/components/shared/Skeletons";
const TOP_3 = [];

const TABLE_DATA = [];

export default function LeaderboardPageContent() {
  const [activeTab, setActiveTab] = useState("All Cohorts");
  const cohorts = useApiResource("leaderboard-cohorts", fetchCohorts);
  const selectedCohort = (cohorts.data || []).find(
    (c) => c.name === activeTab,
  );
  const selectedCohortId =
    activeTab === "All Cohorts" ? undefined : selectedCohort?.id;

  const resource = useApiResource(
    "leaderboard:" + (selectedCohortId || "all"),
    (token) => fetchLeaderboard(token, selectedCohortId),
  );
  const identity = useAuthStore((state) => state.user);
  const figure = (value: unknown) =>
    typeof value === "number" ? value.toLocaleString() : "—";

  const parseMovement = (mov: unknown) => {
    if (mov === undefined || mov === null) return { dir: "neutral", val: "—" };
    const str = String(mov).trim();
    if (str.startsWith("+")) return { dir: "up", val: str };
    if (str.startsWith("-")) return { dir: "down", val: str };
    const num = Number(str);
    if (!isNaN(num)) {
      if (num > 0) return { dir: "up", val: `+${num}` };
      if (num < 0) return { dir: "down", val: `${num}` };
      return { dir: "neutral", val: "0" };
    }
    return { dir: "neutral", val: str || "0" };
  };

  const rawItems = Array.isArray(resource.data?.data)
    ? (resource.data?.data as Array<Record<string, unknown>>)
    : resource.data?.data.items || [];

  const topScore = Math.max(
    1,
    ...rawItems.map((item) =>
      typeof item.score === "number" ? item.score : Number(item.score) || 0,
    ),
  );

  const TABLE_DATA = rawItems.map((item) => {
    const numericScore =
      typeof item.score === "number" ? item.score : Number(item.score) || 0;
    return {
      rank: Number(item.position),
      name: String(item.name || "Participant"),
      program:
        typeof item.journey_year === "number"
          ? "Year " + item.journey_year
          : "—",
      points: figure(item.score),
      sessions: figure(item.sessions_attended),
      reflections: figure(item.reflections),
      goals: figure(item.goals_completed),
      streak: figure(item.streak),
      move: parseMovement(item.weekly_movement ?? item.movement),
      isYou: String(item.user_id) === identity?.id,
      avatar:
        safeWebUrl(
          typeof item.avatar_url === "string" ? item.avatar_url : null,
        ) || "/icons/user-placeholder.svg",
      progress:
        numericScore > 0
          ? Math.min(100, Math.max(8, Math.round((numericScore / topScore) * 100)))
          : 0,
    };
  });
  const TOP_3 = TABLE_DATA.slice(0, 3).map((item, i) => ({
    ...item,
    id: item.rank,
    color: i === 0 ? "#8DB58D" : "#DB911E",
  }));
  const self =
    rawItems.find(
      (item) => String(item.user_id) === identity?.id,
    ) || (resource.data?.data as { current_user?: Record<string, unknown> })?.current_user;

  const filteredData = TABLE_DATA;

  return (
    <div className="w-full pb-10 space-y-6">
      <ApiState {...resource} onRetry={resource.reload} />
      {resource.loading ? (
        <LeaderboardSkeleton />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {TOP_3.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/user-placeholder.svg";
                  }}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <h3 className="text-[14px] font-medium text-gray-900 font-sans truncate">
                    {user.name}
                  </h3>
                  <p className="text-[12px] text-gray-500 font-sans">
                    {user.program}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans shrink-0 ${
                  user.id === 1
                    ? "bg-[#8DB58D]/[0.15] text-[#8DB58D]"
                    : "bg-[#DB911E]/[0.10] text-[#DB911E]"
                }`}
              >
                #{user.id}
              </span>
            </div>

            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[22px] font-medium text-gray-900 leading-none font-sans">
                  {user.points.toLocaleString()}
                </p>
                <p className="text-[12px] text-gray-500 mt-1 font-sans">
                  Points
                </p>
              </div>
              <div
                className={`flex items-center gap-0.5 text-[12px] font-medium font-sans ${
                  user.move.dir === "up"
                    ? "text-[#8DB58D]"
                    : user.move.dir === "down"
                      ? "text-[#DB911E]"
                      : "text-gray-400"
                }`}
              >
                {user.move.dir === "up" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : user.move.dir === "down" ? (
                  <ArrowDown className="w-3 h-3" />
                ) : null}
                {user.move.val}
              </div>
            </div>

            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${user.progress}%`,
                  backgroundColor: user.color,
                }}
              ></div>
            </div>

            <p className="text-[11px] text-gray-400 font-sans">
              {user.sessions} sessions • {user.reflections} reflections •{" "}
              {user.goals} goals closed
            </p>
          </div>
        ))}
      </div>

      {/* Your Stats Bar */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] gap-5 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FCF9F0] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#DB911E]" />
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-sans">
              Where you're at
            </p>
            <p className="text-[15px] md:text-[16px] font-medium text-gray-900 font-sans">
              #{figure(self?.position)} of {rawItems.length || "—"} •{" "}
              {figure(self?.score)} points
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap items-center gap-3 sm:gap-6 md:gap-12 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
          <div className="bg-[#FAF9F6] md:bg-transparent rounded-[10px] p-2.5 md:p-0 text-center">
            <p className="text-[15px] md:text-[16px] font-medium text-gray-900 font-sans">
              {figure(self?.sessions_attended)}
            </p>
            <p className="text-[11.5px] md:text-[12px] text-gray-500 font-sans">
              Sessions
            </p>
          </div>
          <div className="bg-[#FAF9F6] md:bg-transparent rounded-[10px] p-2.5 md:p-0 text-center">
            <p className="text-[15px] md:text-[16px] font-medium text-gray-900 font-sans">
              {figure(self?.reflections)}
            </p>
            <p className="text-[11.5px] md:text-[12px] text-gray-500 font-sans">
              Reflections
            </p>
          </div>
          <div className="bg-[#FAF9F6] md:bg-transparent rounded-[10px] p-2.5 md:p-0 text-center">
            <p className="text-[15px] md:text-[16px] font-medium text-gray-900 font-sans">
              {figure(self?.goals_completed)}
            </p>
            <p className="text-[11.5px] md:text-[12px] text-gray-500 font-sans">
              Goals closed
            </p>
          </div>
          <div className="bg-[#FAF9F6] md:bg-transparent rounded-[10px] p-2.5 md:p-0 text-center">
            <p className="text-[15px] md:text-[16px] font-medium text-gray-900 font-sans">
              {figure(self?.streak)}
            </p>
            <p className="text-[11.5px] md:text-[12px] text-gray-500 font-sans">
              Steady streak
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[16px] border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Filters */}
        <div className="p-4 md:p-5 flex items-center gap-2.5 overflow-x-auto scrollbar-hide border-b border-gray-100">
          {[
            "All Cohorts",
            ...(cohorts.data || []).map((cohort) => cohort.name),
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium font-sans transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab
                  ? "bg-[#1e293b] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mobile Standing Cards (Below md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredData.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 font-sans">
              No leaderboard entries found.
            </div>
          ) : (
            filteredData.map((row) => (
              <div
                key={row.rank}
                className={`p-4 space-y-3 ${
                  row.isYou ? "bg-[#DB911E]/[0.07]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {row.rank <= 3 ? (
                      <div className="w-7 h-7 rounded-full bg-[#8DB58D] text-white flex items-center justify-center text-[12px] font-medium font-sans shrink-0">
                        {row.rank}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#DB911E]/[0.10] text-[#DB911E] flex items-center justify-center text-[12px] font-medium font-sans shrink-0">
                        {row.rank}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 font-sans truncate">
                        {row.name}{" "}
                        {row.isYou && (
                          <span className="text-gray-500 font-normal">(you)</span>
                        )}
                      </p>
                      <p className="text-[12px] text-gray-500 font-sans">
                        {row.program}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-medium text-gray-900 font-sans">
                      {row.points}{" "}
                      <span className="text-[11.5px] text-gray-500 font-normal">
                        pts
                      </span>
                    </p>
                    <div
                      className={`flex items-center justify-end gap-0.5 text-[11.5px] font-medium font-sans ${
                        row.move.dir === "up"
                          ? "text-[#8DB58D]"
                          : row.move.dir === "down"
                            ? "text-[#DB911E]"
                            : "text-gray-400"
                      }`}
                    >
                      {row.move.dir === "up" ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : row.move.dir === "down" ? (
                        <ArrowDown className="w-3 h-3" />
                      ) : null}
                      {row.move.val}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      row.rank === 1 ? "bg-[#8DB58D]" : "bg-[#DB911E]"
                    }`}
                    style={{ width: `${row.progress}%` }}
                  />
                </div>

                {/* 4 Mini Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-0.5 text-center">
                  <div className="bg-[#F8F7F5] rounded-[8px] py-1.5 px-1">
                    <p className="text-[12.5px] font-medium text-gray-800 font-sans">
                      {row.sessions}
                    </p>
                    <p className="text-[10.5px] text-gray-500 font-sans">
                      Sessions
                    </p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-[8px] py-1.5 px-1">
                    <p className="text-[12.5px] font-medium text-gray-800 font-sans">
                      {row.reflections}
                    </p>
                    <p className="text-[10.5px] text-gray-500 font-sans">
                      Reflects
                    </p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-[8px] py-1.5 px-1">
                    <p className="text-[12.5px] font-medium text-gray-800 font-sans">
                      {row.goals}
                    </p>
                    <p className="text-[10.5px] text-gray-500 font-sans">
                      Goals
                    </p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-[8px] py-1.5 px-1">
                    <p className="text-[12.5px] font-medium text-gray-800 font-sans">
                      {row.streak}
                    </p>
                    <p className="text-[10.5px] text-gray-500 font-sans">
                      Streak
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (md and up) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-gray-200">
                <th className="py-3 px-6 text-[13px] font-medium text-gray-600 font-sans w-16">
                  #
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Mentee
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans w-32">
                  Standing
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Points
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Sessions
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Reflections
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Goals
                </th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 font-sans">
                  Streak
                </th>
                <th className="py-3 px-6 text-[13px] font-medium text-gray-600 font-sans text-right">
                  Move
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr
                  key={row.rank}
                  className={`border-b border-gray-100 last:border-0 ${row.isYou ? "bg-[#DB911E]/[0.07]" : "hover:bg-gray-50 transition-colors"}`}
                >
                  <td className="py-4 px-6">
                    {row.rank <= 3 ? (
                      <div className="w-7 h-7 rounded-full bg-[#8DB58D] text-white flex items-center justify-center text-[12px] font-medium font-sans">
                        {row.rank}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#DB911E]/[0.10] text-[#DB911E] flex items-center justify-center text-[12px] font-medium font-sans">
                        {row.rank}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-[14px] font-medium text-gray-900 font-sans">
                      {row.name}{" "}
                      {row.isYou && (
                        <span className="text-gray-500 font-normal">(you)</span>
                      )}
                    </p>
                    <p className="text-[12px] text-gray-500 font-sans mt-0.5">
                      {row.program}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.rank === 1 ? "bg-[#8DB58D]" : "bg-[#DB911E]"}`}
                        style={{ width: `${row.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[13.5px] text-gray-800 font-sans">
                    {row.points}
                  </td>
                  <td className="py-4 px-4 text-[13.5px] text-gray-800 font-sans">
                    {row.sessions}
                  </td>
                  <td className="py-4 px-4 text-[13.5px] text-gray-800 font-sans">
                    {row.reflections}
                  </td>
                  <td className="py-4 px-4 text-[13.5px] text-gray-800 font-sans">
                    {row.goals}
                  </td>
                  <td className="py-4 px-4 text-[13.5px] text-gray-800 font-sans">
                    {row.streak}
                  </td>
                  <td className="py-4 px-6 text-[12.5px] font-medium font-sans text-right">
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        row.move.dir === "up"
                          ? "text-[#8DB58D]"
                          : row.move.dir === "down"
                            ? "text-[#DB911E]"
                            : "text-gray-400"
                      }`}
                    >
                      {row.move.dir === "up" ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : row.move.dir === "down" ? (
                        <ArrowDown className="w-3 h-3" />
                      ) : null}
                      {row.move.val}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      <p className="text-[12.5px] text-gray-500 font-sans px-2 pb-4">
        Points: 40 per completed session, 20 per reflection, 100 per goal
        closed. Movement compares against last month's board.
      </p>
    </div>
  );
}
