"use client";

import { useState, useEffect } from "react";
import { Download, ArrowUpToLine, Check, FileText, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchAdminOverview,
  fetchAdminActivity,
  fetchAdminUsers,
} from "@/lib/services/admin";
import { fetchCohorts } from "@/lib/services/cohorts";
import {
  fetchEngagementReport,
  downloadEngagementCsv,
  fetchEngagementHistory,
} from "@/lib/services/reports";
import { ApiState } from "@/components/shared/ApiUI";
import { records } from "@/components/shared/ApiDataDisplay";
import { userModuleRole } from "@/lib/transforms";
import type { ApiUser } from "@/types";
import { errorMessage } from "@/lib/api";
// Custom Sleek Tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111928] text-white text-[11.5px] px-2.5 py-1 rounded-[6px] shadow-lg font-sans">
        <span>{payload[0].value} sessions</span>
      </div>
    );
  }
  return null;
};

export default function AdminReportsPage() {
  const { token } = useAuth();
  const { activeProgram } = useAuthStore();
  const report = useApiResource("reports", fetchEngagementReport);
  const overview = useApiResource("report-overview", fetchAdminOverview);
  const activity = useApiResource("report-activity", fetchAdminActivity);
  const cohorts = useApiResource("report-cohorts", fetchCohorts);
  const users = useApiResource("report-users", fetchAdminUsers);
  const history = useApiResource(
    "report-engagement-history",
    fetchEngagementHistory,
  );
  const activeRoles = records(activity.data?.active).map((item) =>
    userModuleRole(item as unknown as ApiUser),
  );
  const figure = (value: unknown) =>
    typeof value === "number" ? value.toLocaleString() : "—";

  const allCohorts = cohorts.data || [];
  const programCohorts = allCohorts.filter((c) => {
    if (!activeProgram) return true;
    const progIdNum = Number(activeProgram.id);
    if (Number.isFinite(progIdNum) && c.programId != null) {
      return Number(c.programId) === progIdNum;
    }
    const activeName = activeProgram.name
      .replace(/\s+program$/i, "")
      .trim()
      .toLowerCase();
    if (c.programId == null && activeName.includes("vision")) return true;
    return false;
  });
  const isSubsetProgram =
    Boolean(activeProgram) &&
    cohorts.data !== null &&
    programCohorts.length < allCohorts.length;
  const programCohortIds = new Set(programCohorts.map((c) => Number(c.id)));

  const activeParticipants =
    isSubsetProgram && users.data
      ? users.data.filter(
          (u) =>
            u.role === "mentee" &&
            u.status === "active" &&
            (u.cohorts?.some((c) => programCohortIds.has(Number(c.id))) ||
              (u.cohortId != null && programCohortIds.has(Number(u.cohortId)))),
        ).length
      : Array.isArray(activity.data?.active) && activeRoles.every(Boolean)
        ? activeRoles.filter((role) => role === "mentee").length
        : overview.data?.total_participants !== undefined
          ? overview.data.total_participants
          : undefined;

  const sessionsMonthly = isSubsetProgram
    ? figure(
        programCohorts.reduce(
          (sum, c) =>
            sum + (typeof c.sessionsCount === "number" ? c.sessionsCount : 0),
          0,
        ),
      )
    : overview.data?.sessions_logged_monthly !== undefined
      ? figure(overview.data.sessions_logged_monthly)
      : "—";

  // Check if backend report summary provides median_reflection or retention_rate
  const medianReflection =
    typeof report.data?.summary?.median_reflection === "string" ||
    typeof report.data?.summary?.median_reflection === "number"
      ? String(report.data.summary.median_reflection)
      : "—";

  // 10-Year Retention Data: dynamic from server (scoped by activeProgram if a subset program is selected)
  const retentionYears = Array.isArray(report.data?.cohort_retention)
    ? (
        report.data.cohort_retention as Array<{
          year?: string | number;
          name?: string;
          rate?: number;
          cohort_id?: number;
          weeks?: Array<{ week?: number; retained_pct?: number; rate?: number }>;
        }>
      )
        .filter((item) => {
          if (!isSubsetProgram) return true;
          if (item.cohort_id != null) {
            return programCohortIds.has(Number(item.cohort_id));
          }
          if (item.name) {
            return programCohorts.some(
              (c) => c.name.trim().toLowerCase() === item.name?.trim().toLowerCase(),
            );
          }
          return true;
        })
        .map((item, i) => {
        let rate = 0;
        if (typeof item.rate === "number") {
          rate = item.rate;
        } else if (Array.isArray(item.weeks) && item.weeks.length > 0) {
          const lastWeek = item.weeks[item.weeks.length - 1];
          rate = Number(lastWeek?.retained_pct ?? lastWeek?.rate ?? 0);
        }
        const year =
          item.name ||
          (typeof item.year === "string"
            ? item.year
            : `Year ${item.year || item.cohort_id || i + 1}`);
        return {
          year,
          rate,
          isFirst: i === 0,
        };
      })
    : [];

  const averageCohortRetention =
    retentionYears.length > 0
      ? Math.round(
          retentionYears.reduce((sum, item) => sum + (item.rate || 0), 0) /
            retentionYears.length,
        )
      : null;

  const tenYearRetention =
    typeof report.data?.summary?.retention_rate === "string" ||
    typeof report.data?.summary?.retention_rate === "number"
      ? `${report.data.summary.retention_rate}%`
      : typeof (report.data?.summary as Record<string, unknown> | undefined)
            ?.retention === "number"
        ? `${(report.data?.summary as Record<string, unknown>).retention}%`
        : averageCohortRetention !== null
          ? `${averageCohortRetention}%`
          : "—";

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for header Export CSV event
  useEffect(() => {
    const handleExport = () => {
      handleDownloadReport("Vision2535_Program_Summary.csv");
    };
    window.addEventListener("export-reports-csv", handleExport);
    return () => window.removeEventListener("export-reports-csv", handleExport);
  }, [token, busy]);

  const handleDownloadReport = async (filename: string) => {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await downloadEngagementCsv(token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "masterclass-engagement.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setToastMessage("Engagement report downloaded.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  // 12 Weeks Sessions Data for Recharts
  const chartData = (history.data || []).map((item) => ({
    week: String(item.week),
    sessions: Number(item.sessions || 0),
  }));

  // Recent reports: dynamic from server
  const recentReports = Array.isArray(report.data?.reports)
    ? (report.data.reports as Array<{
        id: number;
        title: string;
        details: string;
        filename: string;
      }>)
    : [];

  return (
    <div className="font-sans space-y-6 pb-12">
      <ApiState {...report} onRetry={report.reload} />
      <ApiState {...overview} onRetry={overview.reload} />
      <ApiState {...activity} onRetry={activity.reload} />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111928] text-white px-4 py-2.5 rounded-[10px] text-[13px] font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#DB911E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Stats Cards Grid (Normal/Subtle font weights per user design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-[13px] text-[#6B7280] font-sans font-normal mb-2.5">
            Active participants
          </p>
          <p className="text-[26px] sm:text-[28px] font-normal text-[#111928] font-sans leading-none tracking-tight">
            {figure(activeParticipants)}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-[13px] text-[#6B7280] font-sans font-normal mb-2.5">
            Sessions / month
          </p>
          <p className="text-[26px] sm:text-[28px] font-normal text-[#111928] font-sans leading-none tracking-tight">
            {sessionsMonthly}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-[13px] text-[#6B7280] font-sans font-normal mb-2.5">
            Median reflection
          </p>
          <p className="text-[26px] sm:text-[28px] font-normal text-[#111928] font-sans leading-none tracking-tight">
            {medianReflection}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-[13px] text-[#6B7280] font-sans font-normal mb-2.5">
            10-yr retention
          </p>
          <p className="text-[26px] sm:text-[28px] font-normal text-[#111928] font-sans leading-none tracking-tight">
            {tenYearRetention}
          </p>
        </div>
      </div>

      {/* 2. Middle Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Engagement · Sessions per week */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-normal text-[#6B7280] font-sans mb-1">
              Engagement
            </p>
            <h3 className="text-[15px] font-medium text-[#111928] font-sans mb-4">
              Sessions per week
            </h3>
          </div>

          {history.loading ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm font-sans">
              Loading engagement history...
            </div>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 font-sans">
              No weekly engagement history recorded yet.
            </p>
          ) : (
            /* Bar Chart Container using Recharts with ResponsiveContainer */
            <div className="w-full h-56 sm:h-64 pt-2">
              {isMounted ? (
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
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                    />
                    <Bar
                      dataKey="sessions"
                      fill="#95BA97"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  Loading chart...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Card: Retention · Participants remaining, by year */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-normal text-[#6B7280] font-sans mb-1">
              Retention
            </p>
            <h3 className="text-[15px] font-medium text-[#111928] font-sans mb-4">
              Participants remaining, by year
            </h3>
          </div>

          {/* Horizontal Progress Bars */}
          {retentionYears.length > 0 ? (
            <div className="space-y-3.5 my-auto py-2">
              {retentionYears.map((item) => (
                <div key={item.year} className="space-y-1">
                  {/* Year Label & Percentage (normal weight) */}
                  <div className="flex items-center justify-between text-[11px] font-sans text-[#6B7280] font-normal">
                    <span>{item.year}</span>
                    <span>{item.rate === null ? "—" : `${item.rate}%`}</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="h-[5px] w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.rate || 0}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isFirst ? "bg-[#7CA77D]" : "bg-[#DB911E]"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-gray-400">
              Retention rate history not returned by server yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Section: Recent reports */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="text-[15px] font-medium text-[#111928] font-sans mb-4">
          Recent reports
        </h3>

        <div className="divide-y divide-[#F3F4F6]">
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <div
                key={report.id}
                className="py-4 first:pt-2 last:pb-2 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-[13.5px] font-medium text-[#111928] font-sans">
                    {report.title}
                  </h4>
                  <p className="text-[12px] text-[#6B7280] font-sans font-normal mt-0.5">
                    {report.details}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDownloadReport(report.filename)}
                  className="px-4 py-1.5 border border-[#E5E7EB] bg-white hover:bg-gray-50 disabled:opacity-50 text-[#111928] text-[12.5px] font-medium rounded-[8px] transition-colors font-sans cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{busy ? "Downloading..." : "Download"}</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                No archived report documents in database yet.
              </p>
              <button
                disabled={busy}
                onClick={() => handleDownloadReport("masterclass-engagement.csv")}
                className="px-4 py-1.5 border border-[#E5E7EB] bg-white hover:bg-gray-50 disabled:opacity-50 text-[#111928] text-[12.5px] font-medium rounded-[8px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {busy ? "Downloading..." : "Download live engagement CSV"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
