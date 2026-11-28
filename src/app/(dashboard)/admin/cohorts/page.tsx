"use client";
import { useEffect, useState } from "react";
import { useApiResource } from "@/hooks/useApiResource";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchCohorts } from "@/lib/services/cohorts";
import { fetchAdminUsers } from "@/lib/services/admin";
import { fetchPrograms } from "@/lib/services/programs";
import { CohortDetailView } from "@/components/dashboard/admin/CohortDetailView";
import type { CohortData } from "@/components/dashboard/admin/ManageCohortModal";
import { CreateCohortModal } from "@/components/dashboard/cohorts/CreateCohortModal";
import { ApiState } from "@/components/shared/ApiUI";
import { CardGridSkeleton } from "@/components/shared/Skeletons";

export default function AdminCohortsPage() {
  const resource = useApiResource("cohort-cards", async (token) => {
    const [cohorts, programsList] = await Promise.all([
      fetchCohorts(token),
      fetchPrograms(token).catch(() => []),
    ]);
    const programMap = new Map(
      programsList.map((p) => [Number(p.id), p.name]),
    );

    return Promise.all(
      cohorts.map(async (cohort) => {
        const users = await fetchAdminUsers(token, { cohort_id: cohort.id });
        const start = cohort.startsAt ? new Date(cohort.startsAt) : null;
        const started =
          start && !Number.isNaN(start.getTime()) ? start.getFullYear() : "—";
        const menteeUsers = users.filter((user) => user.role === "mentee");
        const menteeCount = menteeUsers.length;
        const mentorCount = users.filter((user) => user.role === "mentor").length;

        const backendRate =
          (cohort as unknown as { active_rate?: number; rate?: number })
            .active_rate ??
          (cohort as unknown as { active_rate?: number; rate?: number }).rate;

        const rate =
          typeof backendRate === "number"
            ? `${backendRate}%`
            : menteeCount > 0
              ? `${Math.round(
                  (menteeUsers.filter((u) => u.status === "active").length /
                    menteeCount) *
                    100,
                )}%`
              : "—";

        const toTitleCase = (str: string): string => {
          if (!str) return "Convergence";
          return str
            .trim()
            .split(/\s+/)
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" ");
        };

        const namePrefix =
          cohort.name && cohort.name.includes(" ")
            ? cohort.name.replace(/['’]?\d+.*$/, "").trim()
            : undefined;

        const cleanNamePrefix =
          namePrefix &&
          !["cohort", "group", "class", "batch"].includes(
            namePrefix.toLowerCase(),
          )
            ? namePrefix
            : undefined;

        const rawProgramName =
          (cohort as unknown as { program?: { name?: string } }).program
            ?.name ||
          (cohort.programId
            ? programMap.get(Number(cohort.programId))
            : undefined);

        const cleanProgramName = rawProgramName
          ? rawProgramName.replace(/\s+program$/i, "").trim()
          : undefined;

        const resolvedCategory =
          cleanNamePrefix ||
          (cohort as unknown as { category?: string }).category ||
          cleanProgramName ||
          cohort.description ||
          "Convergence";

        const category = toTitleCase(resolvedCategory);

        return {
          id: cohort.id,
          name: cohort.name,
          category,
          rate,
          participants: menteeCount,
          mentors: mentorCount,
          started,
          sessions:
            typeof cohort.sessionsCount === "number"
              ? cohort.sessionsCount
              : "—",
          programId: cohort.programId,
          cadence: cohort.cadence,
          capacity: cohort.capacity,
          isEnrollmentOpen: cohort.isEnrollmentOpen,
          status: cohort.status,
          year:
            typeof started === "number"
              ? Math.min(
                  10,
                  Math.max(1, new Date().getFullYear() - started + 1),
                )
              : 0,
        };
      }),
    );
  });
  const { activeProgram } = useAuthStore();
  const [selected, setSelected] = useState<CohortData | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const back = () => setSelected(null);
    const openCreate = () => setCreating(true);
    window.addEventListener("admin-cohort-back", back);
    window.addEventListener("open-create-cohort-modal", openCreate);
    return () => {
      window.removeEventListener("admin-cohort-back", back);
      window.removeEventListener("open-create-cohort-modal", openCreate);
    };
  }, []);
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("admin-cohort-view-change", {
        detail: { selectedCohort: selected },
      }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("admin-cohort-view-change", {
          detail: { selectedCohort: null },
        }),
      );
    };
  }, [selected]);
  if (selected)
    return (
      <CohortDetailView
        key={selected.id}
        cohort={selected}
        onBack={() => setSelected(null)}
        onUpdateCohort={(updated) => {
          setSelected(updated);
          resource.reload();
        }}
      />
    );

  const allCohorts = resource.data || [];
  const displayCohorts = allCohorts.filter((cohort) => {
    if (!activeProgram) return true;
    const progIdNum = Number(activeProgram.id);
    if (Number.isFinite(progIdNum) && cohort.programId != null) {
      return Number(cohort.programId) === progIdNum;
    }
    const activeName = activeProgram.name
      .replace(/\s+program$/i, "")
      .trim()
      .toLowerCase();
    if (cohort.category.trim().toLowerCase() === activeName) return true;
    if (cohort.programId == null && activeName.includes("vision")) return true;
    return false;
  });

  return (
    <div className="w-full pb-10">
      <ApiState {...resource} onRetry={resource.reload} />
      {resource.loading ? (
        <CardGridSkeleton count={6} />
      ) : displayCohorts.length > 0 ? (
        /* 3-Column Cohorts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {displayCohorts.map((cohort) => (
          <div
            key={cohort.id}
            className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow font-sans"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13.5px] font-normal text-[#8DB58D] font-sans">
                  {cohort.category}
                </span>
                {cohort.rate !== "—" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-normal bg-[#EBEFE4] text-[#1F2937] font-sans">
                    {cohort.rate}
                  </span>
                )}
              </div>

              <h2 className="text-[19px] md:text-[20px] font-medium text-[#111928] font-sans mt-2 tracking-tight">
                {cohort.name}
              </h2>

              {/* Two-Column, Two-Row Metrics Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 mt-6">
                <div>
                  <span className="text-[13px] text-[#6B7280] font-normal font-sans block mb-1">
                    Participants
                  </span>
                  <span className="text-[17px] font-normal text-[#111928] font-sans">
                    {cohort.participants}
                  </span>
                </div>
                <div>
                  <span className="text-[13px] text-[#6B7280] font-normal font-sans block mb-1">
                    Mentors
                  </span>
                  <span className="text-[17px] font-normal text-[#111928] font-sans">
                    {cohort.mentors}
                  </span>
                </div>
                <div>
                  <span className="text-[13px] text-[#6B7280] font-normal font-sans block mb-1">
                    Started
                  </span>
                  <span className="text-[17px] font-normal text-[#111928] font-sans">
                    {cohort.started}
                  </span>
                </div>
                <div>
                  <span className="text-[13px] text-[#6B7280] font-normal font-sans block mb-1">
                    Year
                  </span>
                  <span className="text-[17px] font-normal text-[#111928] font-sans">
                    {cohort.year || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Manage CTA */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(cohort)}
                className="text-[13.5px] font-medium text-[#DB911E] hover:text-[#BA7815] transition-colors flex items-center gap-1.5 group cursor-pointer font-sans"
              >
                <span>Manage</span>
                <span className="transition-transform group-hover:translate-x-0.5 font-normal">
                  →
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="py-12 text-center text-gray-500 bg-white rounded-[16px] border border-gray-200 p-8">
          <p className="text-[15px] font-medium text-gray-800 mb-1">
            {activeProgram && allCohorts.length > 0
              ? `No cohorts assigned to ${activeProgram.name} yet.`
              : "No cohorts in the database yet."}
          </p>
          <p className="text-[13px] text-gray-500">
            {activeProgram && allCohorts.length > 0
              ? "Assign a cohort to this program from Cohort Overview or create a new cohort."
              : "Create your first cohort or seed the database to populate this section."}
          </p>
        </div>
      )}

      <CreateCohortModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        onSuccess={resource.reload}
      />
    </div>
  );
}
