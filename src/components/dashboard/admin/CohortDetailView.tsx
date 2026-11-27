"use client";

import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  UserPlus,
  Calendar,
  Search,
  Check,
  X,
  Users,
  UserCheck,
  Award,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronDown,
  Clock,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import type { CohortData } from "./ManageCohortModal";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchAdminUsers,
  assignMentor,
  reassignMentor,
  messageAdminUser,
} from "@/lib/services/admin";
import {
  updateCohort,
  addCohortMember,
  removeCohortMember,
} from "@/lib/services/cohorts";
import { fetchPrograms } from "@/lib/services/programs";
import { fetchMentorships } from "@/lib/services/mentorships";
import {
  fetchProgramSessions,
  saveProgramSession,
} from "@/lib/services/program-sessions";
import { fetchSessions } from "@/lib/services/sessions";
import { createFollowUp } from "@/lib/services/engagement";
import { AssignProgramModal } from "./AssignProgramModal";
import { ApiState, formatDate } from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";

interface CohortDetailViewProps {
  cohort: CohortData;
  onBack: () => void;
  onUpdateCohort: (updated: CohortData) => void;
}

export function CohortDetailView({
  cohort,
  onBack,
  onUpdateCohort,
}: CohortDetailViewProps) {
  const { token } = useAuth();
  const roster = useApiResource(`cohort-roster:${cohort.id}`, (auth) =>
    fetchAdminUsers(auth, { cohort_id: Number(cohort.id) }),
  );
  const programs = useApiResource("cohort-programs", fetchPrograms);
  const assignments = useApiResource("cohort-assignments", fetchMentorships);
  const programSessions = useApiResource(
    `cohort-program-sessions:${cohort.id}`,
    (auth) => fetchProgramSessions(auth, true),
  );
  const allSessions = useApiResource(
    `cohort-mentor-sessions:${cohort.id}`,
    fetchSessions,
  );
  const nextConvergenceDate = (() => {
    const items = (programSessions.data || []).filter(
      (s) =>
        (!s.cohort_id || Number(s.cohort_id) === Number(cohort.id)) &&
        s.starts_at,
    );
    if (!items.length) return "—";
    const sorted = [...items].sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
    return formatDate(sorted[0].starts_at);
  })();
  const activeAssignments = assignments.data?.filter(
    (assignment) => assignment.isActive,
  );
  const mentorFor = (id: string) =>
    activeAssignments?.find((assignment) => assignment.menteeId === id)
      ?.mentorId;
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const transactionPending = useRef(false);
  const transact = async (action: () => Promise<unknown>) => {
    if (!token || transactionPending.current) return false;
    transactionPending.current = true;
    setBusy(true);
    setActionError(null);
    try {
      await action();
      return true;
    } catch (error) {
      setActionError(errorMessage(error));
      return false;
    } finally {
      roster.reload();
      assignments.reload();
      transactionPending.current = false;
      setBusy(false);
    }
  };
  const unavailable = () =>
    setActionError("This action is not available yet. No changes were saved.");
  const [activeTab, setActiveTab] = useState<
    "overview" | "participants" | "mentors" | "settings"
  >("overview");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssignProgramModalOpen, setIsAssignProgramModalOpen] =
    useState(false);

  // Edit Form state
  const [editName, setEditName] = useState(cohort.name);
  const [editCategory, setEditCategory] = useState(cohort.category);
  const [editStarted, setEditStarted] = useState(cohort.started);
  const [editYear, setEditYear] = useState(cohort.year || 1);
  const [editCadence, setEditCadence] = useState(cohort.cadence || "Monthly");
  const [editCapacity, setEditCapacity] = useState<number | "">(
    cohort.capacity ?? 80,
  );
  const [editRate, setEditRate] = useState(cohort.rate);
  const [isEnrolmentClosed, setIsEnrolmentClosed] = useState(
    cohort.isEnrollmentOpen === false,
  );
  const [isCohortArchived, setIsCohortArchived] = useState(
    cohort.status === "archived",
  );
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  useEffect(() => {
    setEditName(cohort.name);
    setEditCategory(cohort.category);
    setEditStarted(cohort.started);
    setEditYear(cohort.year || 1);
    setEditRate(cohort.rate);
    if (cohort.cadence) setEditCadence(cohort.cadence);
    if (cohort.capacity !== undefined && cohort.capacity !== null)
      setEditCapacity(cohort.capacity);
    if (cohort.isEnrollmentOpen !== undefined)
      setIsEnrolmentClosed(!cohort.isEnrollmentOpen);
    if (cohort.status) setIsCohortArchived(cohort.status === "archived");
    try {
      const savedMeta = localStorage.getItem(`cohort_meta_${cohort.id}`);
      if (savedMeta) {
        const parsed = JSON.parse(savedMeta) as {
          cadence?: string;
          capacity?: number | "";
        };
        if (!cohort.cadence && parsed.cadence) setEditCadence(parsed.cadence);
        if (
          (cohort.capacity === undefined || cohort.capacity === null) &&
          parsed.capacity !== undefined
        )
          setEditCapacity(parsed.capacity);
      }
    } catch {}
  }, [
    cohort.id,
    cohort.name,
    cohort.category,
    cohort.started,
    cohort.year,
    cohort.rate,
    cohort.cadence,
    cohort.capacity,
    cohort.isEnrollmentOpen,
    cohort.status,
  ]);

  // Search state for tables
  const [participantSearch, setParticipantSearch] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");

  // Add Member state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberType, setNewMemberType] = useState<"participant" | "mentor">(
    "participant",
  );
  const [addMemberSuccess, setAddMemberSuccess] = useState(false);

  // Schedule Gathering state
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [gatheringTopic, setGatheringTopic] = useState("");
  const [gatheringDescription, setGatheringDescription] = useState("");
  const [gatheringDate, setGatheringDate] = useState("");
  const [gatheringDuration, setGatheringDuration] = useState("45m");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("02 : 00");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const timeSlots = [
    { time: "10 : 00", available: true },
    { time: "12 : 30", available: true },
    { time: "02 : 00", available: true },
    { time: "03 : 00", available: true },
    { time: "04 : 00", available: true },
    { time: "05 : 00", available: false },
  ];

  const participants = (roster.data || [])
    .filter((user) => user.role === "mentee")
    .map((user) => {
      const raw = user as unknown as {
        progress?: number | string;
        progress_percentage?: number | string;
        profile?: { journey_year?: number; progress?: number };
      };

      const rawProgress =
        raw.progress_percentage ?? raw.progress ?? raw.profile?.progress;

      let progressPercent: number | null = null;
      let progressDisplay = "—";

      if (typeof rawProgress === "number") {
        progressPercent = Math.min(100, Math.max(0, Math.round(rawProgress)));
        progressDisplay = `${progressPercent}%`;
      } else if (typeof rawProgress === "string" && rawProgress.trim()) {
        const num = parseFloat(rawProgress);
        if (!Number.isNaN(num)) {
          progressPercent = Math.min(100, Math.max(0, Math.round(num)));
          progressDisplay = `${progressPercent}%`;
        }
      } else if (typeof raw.profile?.journey_year === "number") {
        // Derive journey progress from 10-year cohort decade (e.g. Year 3 = 30%)
        progressPercent = Math.min(
          100,
          Math.max(0, Math.round((raw.profile.journey_year / 10) * 100)),
        );
        progressDisplay = `${progressPercent}%`;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        mentor:
          (roster.data || []).find((mentor) => mentor.id === mentorFor(user.id))
            ?.name || "—",
        progressPercent,
        progressDisplay,
        status: user.status || "—",
      };
    });

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenActionId(null);
    };
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  const handleRemoveParticipant = async (id: string) => {
    if (!token || !window.confirm("Remove this member from the cohort?"))
      return;
    if (
      await transact(() => removeCohortMember(token, Number(cohort.id), id))
    ) {
      onUpdateCohort({
        ...cohort,
        participants: Math.max(0, cohort.participants - 1),
      });
      setOpenActionId(null);
    }
  };
  const mentors = (roster.data || [])
    .filter((user) => user.role === "mentor")
    .map((user) => {
      const apiCount = (user as unknown as { sessions_count?: number })
        .sessions_count;
      const computedCount = allSessions.data
        ? allSessions.data.filter(
            (s) =>
              s.mentorId === user.id ||
              s.mentorName === user.name ||
              (s.menteeId && mentorFor(s.menteeId) === user.id),
          ).length
        : undefined;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: `Mentor · ${cohort.name}`,
        mentees: activeAssignments
          ? activeAssignments.filter(
              (assignment) =>
                assignment.mentorId === user.id &&
                roster.data?.some(
                  (member) => member.id === assignment.menteeId,
                ),
            ).length
          : 0,
        sessions:
          typeof apiCount === "number"
            ? apiCount
            : computedCount !== undefined
              ? computedCount
              : "—",
        status:
          user.status === "active" || !user.status ? "Active" : user.status,
        avatarUrl: user.avatarUrl || "",
      };
    });

  const [isMessageMentorModalOpen, setIsMessageMentorModalOpen] =
    useState(false);
  const [isAssignMenteesModalOpen, setIsAssignMenteesModalOpen] =
    useState(false);
  const [selectedMentorForAction, setSelectedMentorForAction] = useState<
    any | null
  >(null);
  const [mentorMessageText, setMentorMessageText] = useState("");
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const assignableMentees = (roster.data || [])
    .filter((user) => user.role === "mentee")
    .map((user) => ({
      ...user,
      role: user.journeyYear
        ? `Year ${user.journeyYear} Participant`
        : "Participant",
      avatarUrl: user.avatarUrl || "",
    }));
  const assignedMenteeIds = assignableMentees
    .filter((mentee) => mentorFor(mentee.id) === selectedMentorForAction?.id)
    .map((mentee) => mentee.id);
  const [assignMenteesSuccess, setAssignMenteesSuccess] = useState(false);
  const [assigningMenteeId, setAssigningMenteeId] = useState<string | null>(
    null,
  );
  const [assigningAll, setAssigningAll] = useState(false);
  const handleAssignMentee = async (id: string) => {
    if (!token || !selectedMentorForAction || !assignments.data) return;
    const mentor_id = String(selectedMentorForAction.id);
    const currentMentor = mentorFor(id);
    if (currentMentor === mentor_id) return;
    setAssigningMenteeId(id);
    try {
      await transact(() =>
        (currentMentor ? reassignMentor : assignMentor)(token, {
          mentee_id: id,
          mentor_id,
        }),
      );
    } finally {
      setAssigningMenteeId(null);
    }
  };
  const handleAssignAll = async () => {
    if (!token || !selectedMentorForAction || !assignableMentees.length) return;
    if (!assignments.data) {
      setActionError(
        "Could not verify current mentor assignments. Please retry.",
      );
      return;
    }
    const mentor_id = String(selectedMentorForAction.id);
    setAssigningAll(true);
    try {
      if (
        await transact(async () => {
          for (const id of assignableMentees.map((mentee) => mentee.id)) {
            const currentMentor = mentorFor(id);
            if (currentMentor === mentor_id) continue;
            await (currentMentor ? reassignMentor : assignMentor)(token, {
              mentee_id: id,
              mentor_id,
            });
          }
        })
      ) {
        setAssignMenteesSuccess(true);
        setIsAssignMenteesModalOpen(false);
      }
    } finally {
      setAssigningAll(false);
    }
  };
  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !editName.trim()) return;
    const currentYear = new Date().getFullYear();
    const rawStarted = Number(editStarted);
    const hasValidStartYear =
      !Number.isNaN(rawStarted) && rawStarted >= 1900 && rawStarted <= 2100;
    const yearChanged =
      Number(editYear) !== Number(cohort.year || 1) &&
      Number(editYear) >= 1 &&
      Number(editYear) <= 10;
    const startYearNum =
      editStarted !== cohort.started && hasValidStartYear
        ? rawStarted
        : yearChanged
          ? currentYear - Number(editYear) + 1
          : hasValidStartYear
            ? rawStarted
            : currentYear;
    const computedYear = yearChanged
      ? Number(editYear)
      : Math.min(10, Math.max(1, currentYear - startYearNum + 1));

    const nextCadence = editCadence.trim() || "Monthly";
    const nextCapacity = editCapacity === "" ? 80 : Number(editCapacity);
    if (
      await transact(() =>
        updateCohort(token, Number(cohort.id), {
          name: editName.trim(),
          start_date: `${startYearNum}-01-01`,
          end_date: `${startYearNum + 10}-12-31`,
          cadence: nextCadence,
          capacity: nextCapacity,
          is_enrollment_open: !isEnrolmentClosed,
        }),
      )
    ) {
      try {
        localStorage.setItem(
          `cohort_meta_${cohort.id}`,
          JSON.stringify({
            cadence: nextCadence,
            capacity: nextCapacity,
          }),
        );
      } catch {}
      onUpdateCohort({
        ...cohort,
        name: editName.trim(),
        started: startYearNum,
        year: computedYear,
        cadence: nextCadence,
        capacity: nextCapacity,
        isEnrollmentOpen: !isEnrolmentClosed,
      });
      setIsEditModalOpen(false);
      setSaveSettingsSuccess(true);
    }
  };

  const handleToggleEnrollment = async () => {
    if (!token || busy) return;
    const nextClosed = !isEnrolmentClosed;
    if (
      await transact(() =>
        updateCohort(token, Number(cohort.id), {
          name: editName.trim() || cohort.name,
          is_enrollment_open: !nextClosed,
        }),
      )
    ) {
      setIsEnrolmentClosed(nextClosed);
      onUpdateCohort({
        ...cohort,
        isEnrollmentOpen: !nextClosed,
      });
      setSaveSettingsSuccess(true);
    }
  };

  const handleToggleArchiveCohort = async () => {
    if (!token || busy) return;
    const nextArchived = !isCohortArchived;
    const nextStatus = nextArchived ? "archived" : "active";
    if (
      await transact(() =>
        updateCohort(token, Number(cohort.id), {
          name: editName.trim() || cohort.name,
          status: nextStatus,
        }),
      )
    ) {
      setIsCohortArchived(nextArchived);
      onUpdateCohort({
        ...cohort,
        status: nextStatus,
      });
      setSaveSettingsSuccess(true);
    }
  };
  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    await transact(async () => {
      const users = await fetchAdminUsers(token, {
        role: newMemberType === "participant" ? "mentee" : "mentor",
      });
      const user = users.find(
        (user) =>
          user.email.toLowerCase() === newMemberEmail.trim().toLowerCase(),
      );
      if (!user)
        throw new Error(
          "Create this person's account from Users first, then add them here.",
        );
      await addCohortMember(token, Number(cohort.id), user.id);
      setIsAddMemberModalOpen(false);
      setNewMemberName("");
      setNewMemberEmail("");
      onUpdateCohort({
        ...cohort,
        [newMemberType === "participant" ? "participants" : "mentors"]:
          cohort[newMemberType === "participant" ? "participants" : "mentors"] +
          1,
      });
    });
  };
  const handleScheduleGathering = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !gatheringDate || !gatheringTopic.trim()) return;
    const start = new Date(
      `${gatheringDate}T${selectedTimeSlot.replaceAll(" ", "")}:00`,
    );
    const duration = parseInt(gatheringDuration, 10);
    if (Number.isNaN(start.getTime())) {
      setActionError("Choose a valid date and time.");
      return;
    }
    if (
      await transact(() =>
        saveProgramSession(token, {
          title: gatheringTopic.trim(),
          description: gatheringDescription,
          starts_at: start.toISOString(),
          ends_at: new Date(start.getTime() + duration * 60000).toISOString(),
          duration_minutes: duration,
          cohort_id: Number(cohort.id),
          session_type: "in_house",
          status: "scheduled",
        }),
      )
    ) {
      programSessions.reload();
      setIsScheduleModalOpen(false);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.mentor.toLowerCase().includes(participantSearch.toLowerCase()),
  );

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(mentorSearch.toLowerCase()),
  );

  const assignedProgram = (() => {
    const list = programs.data || [];
    if (cohort.programId) {
      const byId = list.find((p) => Number(p.id) === Number(cohort.programId));
      if (byId) return byId;
    }
    if (cohort.category) {
      const cleanCat = cohort.category.trim().toLowerCase();
      const byName = list.find(
        (p) =>
          p.name.trim().toLowerCase() === cleanCat ||
          p.name.replace(/\s+program$/i, "").trim().toLowerCase() === cleanCat,
      );
      if (byName) return byName;
    }
    return null;
  })();

  const assignedProgramTitle =
    assignedProgram?.name ||
    (cohort.category && cohort.category !== "Convergence"
      ? `${cohort.category.replace(/\s+program$/i, "").trim()} Program`
      : "Vision2535 Program");

  const cohortGatheringsCount = (programSessions.data || []).filter(
    (s) => !s.cohort_id || Number(s.cohort_id) === Number(cohort.id),
  ).length;

  const matchedParticipantsCount = participants.filter(
    (p) => p.mentor && p.mentor !== "—",
  ).length;

  const currentCohortYear = Number(cohort.year) || 1;

  const dynamicMilestones = [
    {
      step: 1,
      title: "Rooting",
      subtitle:
        participants.length > 0
          ? `Onboarding (${participants.length} enrolled), mentor matching (${matchedParticipantsCount} matched), first goals`
          : "Onboarding, mentor matching, first goals",
      status:
        currentCohortYear > 1 || matchedParticipantsCount > 0
          ? "Completed"
          : "In progress",
      isReached: true,
    },
    {
      step: 2,
      title: "Tending",
      subtitle:
        typeof cohort.sessions === "number" && cohort.sessions > 0
          ? `${editCadence || "Monthly"} sessions (${cohort.sessions} logged), quarterly reflections`
          : `${editCadence || "Monthly"} sessions, quarterly reflections`,
      status:
        currentCohortYear > 3
          ? "Completed"
          : currentCohortYear >= 2 ||
              (typeof cohort.sessions === "number" && cohort.sessions > 0) ||
              cohortGatheringsCount > 0
            ? "Active"
            : "Upcoming",
      isReached:
        currentCohortYear >= 2 ||
        (typeof cohort.sessions === "number" && cohort.sessions > 0) ||
        cohortGatheringsCount > 0,
    },
    {
      step: 3,
      title: "Branching",
      subtitle: assignedProgram?.description
        ? `${assignedProgram.description.replace(/\.$/, "")} · mid-decade certificate`
        : "Community project, mid-decade certificate",
      status:
        currentCohortYear >= 5
          ? "Active"
          : `Year 5+`,
      isReached: currentCohortYear >= 5,
    },
  ];

  return (
    <div className="w-full pb-12">
      <ApiState {...roster} onRetry={roster.reload} />
      <ApiState {...assignments} onRetry={assignments.reload} />
      {actionError && (
        <p
          role="alert"
          className="fixed right-6 top-6 z-[10000] max-w-md rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}
      {/* 1. Hero Banner (Dark Navy Card) */}
      <div className="bg-[#111928] rounded-[16px] p-5 sm:p-7 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <span className="text-[13px] text-slate-400 font-sans block mb-1">
              {cohort.category}
            </span>
            <h1 className="text-[22px] sm:text-[24px] md:text-[26px] font-medium text-white font-sans tracking-tight">
              {cohort.name}
            </h1>
            <p className="text-[13px] text-slate-400 font-sans mt-1.5">
              Year {cohort.year || "—"} of ten · started {cohort.started} ·{" "}
              {editCadence
                ? editCadence.toLowerCase().includes("cadence")
                  ? editCadence
                  : `${editCadence} cadence`
                : "Monthly cadence"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 rounded-[8px] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans whitespace-nowrap"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Cohort</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 bg-[#DB911E] hover:bg-[#BA7815] text-white rounded-[8px] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer font-sans whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-slate-800 my-6" />

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-slate-800/90">
          <div className="md:pr-6">
            <span className="text-[12.5px] text-slate-400 font-sans block mb-1">
              Participants
            </span>
            <span className="text-[20px] font-normal text-white font-sans">
              {cohort.participants}
            </span>
          </div>

          <div className="md:px-6">
            <span className="text-[12.5px] text-slate-400 font-sans block mb-1">
              Mentors
            </span>
            <span className="text-[20px] font-normal text-white font-sans">
              {cohort.mentors}
            </span>
          </div>

          <div className="md:px-6">
            <span className="text-[12.5px] text-slate-400 font-sans block mb-1">
              Active
            </span>
            <span className="text-[20px] font-normal text-white font-sans">
              {cohort.rate}
            </span>
          </div>

          <div className="md:pl-6">
            <span className="text-[12.5px] text-slate-400 font-sans block mb-1">
              Year
            </span>
            <span className="text-[20px] font-normal text-white font-sans">
              {cohort.year} / 10
            </span>
          </div>
        </div>
      </div>

      {/* 2. Decade Progress Card */}
      <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mt-6">
        <h3 className="text-[13px] text-gray-500 font-normal font-sans mb-6">
          Decade progress
        </h3>

        {/* Stepper Timeline */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="relative flex items-center justify-between px-2 sm:px-6 min-w-[560px] sm:min-w-full">
            {/* Background Connecting Line */}
            <div className="absolute top-[18px] left-6 right-6 h-[1px] bg-gray-200 z-0" />

          {/* 10 Year Nodes */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
            const isCompleted = step < cohort.year;
            const isCurrent = step === cohort.year;

            return (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center"
              >
                {isCompleted ? (
                  <div className="w-9 h-9 rounded-full bg-[#DB911E] text-white flex items-center justify-center text-[13px] font-medium shadow-sm">
                    {step}
                  </div>
                ) : isCurrent ? (
                  <div className="w-9 h-9 rounded-full border-2 border-[#DB911E] bg-white text-gray-900 flex items-center justify-center text-[13px] font-medium">
                    {step}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-400 flex items-center justify-center text-[13px] font-normal">
                    {step}
                  </div>
                )}

                {/* Subtitle below circle */}
                <span className="text-[11px] font-sans mt-2 block text-center">
                  {isCompleted ? (
                    <span className="text-gray-400">Done</span>
                  ) : isCurrent ? (
                    <span className="text-gray-600 font-medium">Y{step}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </span>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-1.5 flex items-center gap-1 mt-6 w-full overflow-x-auto scrollbar-hide shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        {(["overview", "participants", "mentors", "settings"] as const).map(
          (tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === "overview"
                ? "Overview"
                : tab === "participants"
                  ? `Participants`
                  : tab === "mentors"
                    ? `Mentors`
                    : "Settings";

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#0F172A] text-white font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-900 font-normal"
                }`}
              >
                {label}
              </button>
            );
          },
        )}
      </div>

      {/* 4. Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Card: Milestones so far */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6">
                <h3 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans">
                  Milestones so far
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#FAF3EA] text-[#9A6D29] font-sans whitespace-nowrap">
                  {assignedProgramTitle}
                </span>
              </div>

              <div className="space-y-4">
                {dynamicMilestones.map((milestone, index) => (
                  <div
                    key={milestone.step}
                    className={`flex items-start justify-between gap-3 ${
                      index < dynamicMilestones.length - 1
                        ? "border-b border-gray-100 pb-4"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 mt-0.5 font-sans ${
                          milestone.isReached
                            ? "bg-[#EBEFE4] text-[#1F2937]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {milestone.step}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[14px] font-medium text-[#111928] font-sans">
                          {milestone.title}
                        </h4>
                        <p className="text-[12.5px] text-gray-500 font-sans mt-0.5 leading-relaxed">
                          {milestone.subtitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans whitespace-nowrap shrink-0 mt-0.5 ${
                        milestone.status === "Completed" ||
                        milestone.status === "Active"
                          ? "bg-[#EBEFE4] text-[#1F2937]"
                          : milestone.status === "In progress"
                            ? "bg-[#FAF3EA] text-[#9A6D29]"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => setIsAssignProgramModalOpen(true)}
              className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-[8px] text-[13px] font-medium transition-colors font-sans mt-6 cursor-pointer text-center"
            >
              Assign Program
            </button>
          </div>

          {/* Right Card: Rhythm */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <h3 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans mb-5 sm:mb-6">
                Rhythm
              </h3>

              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] text-gray-500 font-sans">
                    Session cadence
                  </span>
                  <span className="text-[13.5px] font-medium text-gray-900 font-sans text-right">
                    {editCadence || "Monthly"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] text-gray-500 font-sans">
                    Sessions logged
                  </span>
                  <span className="text-[13.5px] font-medium text-gray-900 font-sans text-right">
                    {cohort.sessions !== undefined ? cohort.sessions : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] text-gray-500 font-sans">
                    Mentor ratio
                  </span>
                  <span className="text-[13.5px] font-medium text-gray-900 font-sans text-right">
                    {cohort.mentors && cohort.participants
                      ? `1 : ${Math.max(1, Math.round(Number(cohort.participants) / Number(cohort.mentors)))}`
                      : "1 : 1"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] text-gray-500 font-sans">
                    Next convergence
                  </span>
                  <span className="text-[13.5px] font-medium text-gray-900 font-sans text-right">
                    {nextConvergenceDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-[8px] text-[13px] font-medium transition-colors font-sans mt-6 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-gray-600" />
              <span>Schedule Gathering</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Participants */}
      {activeTab === "participants" && (
        <div className="bg-white border border-gray-200 rounded-[16px] p-4 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mt-6 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative w-full sm:max-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search participants..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#DB911E] transition-all font-sans"
              />
            </div>
            <span className="text-[13px] text-gray-400 font-sans whitespace-nowrap">
              {filteredParticipants.length} people
            </span>
          </div>

          {/* Mobile Participant Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredParticipants.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-gray-400 font-sans border border-gray-200/80 rounded-[14px]">
                No participants found.
              </div>
            ) : (
              filteredParticipants.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-200/80 rounded-[14px] p-4 bg-white flex flex-col gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14.5px] font-medium text-gray-900 font-sans truncate">
                        {p.name}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-sans truncate mt-0.5">
                        {p.mentor && p.mentor !== "—"
                          ? `Mentor: ${p.mentor}`
                          : p.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-sans whitespace-nowrap shrink-0 ${
                          String(p.status).toLowerCase() === "active"
                            ? "bg-[#EBF2EB] text-[#486B52]"
                            : "bg-[#EFEFEF] text-[#6B7280]"
                        }`}
                      >
                        {p.status}
                      </span>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(
                              openActionId === p.id ? null : p.id,
                            );
                          }}
                          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openActionId === p.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-gray-100 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 px-1.5 w-[200px] text-left animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                setNewMemberType("participant");
                                setIsAddMemberModalOpen(true);
                              }}
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer font-sans"
                            >
                              <Plus
                                className="w-4 h-4 text-gray-800"
                                strokeWidth={2}
                              />
                              <span>Add Participant</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRemoveParticipant(p.id)}
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-gray-800 hover:bg-red-50/50 disabled:opacity-50 transition-colors cursor-pointer font-sans"
                            >
                              {busy ? (
                                <Loader2 className="w-4 h-4 text-[#EF4444] animate-spin" />
                              ) : (
                                <Trash2
                                  className="w-4 h-4 text-[#EF4444]"
                                  strokeWidth={1.8}
                                />
                              )}
                              <span>
                                {busy ? "Removing..." : "Remove Participant"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <span className="text-[12px] text-gray-500 font-sans shrink-0">
                      Progress
                    </span>
                    <div className="flex items-center gap-2.5 flex-1 max-w-[180px] justify-end">
                      <div className="flex-1 h-[5px] bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#DB911E] rounded-full transition-all duration-300"
                          style={{ width: `${p.progressPercent ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-gray-700 font-sans whitespace-nowrap">
                        {p.progressDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Participants Table */}
          <div className="hidden md:block border border-gray-200/80 rounded-[16px] overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F2EB] border-b border-gray-100">
                  <th className="py-3.5 px-6 text-[13px] font-medium text-gray-700 font-sans rounded-tl-[15px]">
                    Name
                  </th>
                  <th className="py-3.5 px-6 text-[13px] font-medium text-gray-700 font-sans">
                    Status
                  </th>
                  <th className="py-3.5 px-6 text-[13px] font-medium text-gray-700 font-sans">
                    Progress
                  </th>
                  <th className="py-3.5 px-6 text-[13px] font-medium text-gray-700 font-sans rounded-tr-[15px] w-12 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-[13px] text-gray-400 font-sans"
                    >
                      No participants found.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-[14px] font-medium text-gray-900 font-sans whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-sans inline-block whitespace-nowrap ${
                            String(p.status).toLowerCase() === "active"
                              ? "bg-[#EBF2EB] text-[#486B52]"
                              : "bg-[#EFEFEF] text-[#6B7280]"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-[56px] h-[5px] bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#DB911E] rounded-full transition-all duration-300"
                              style={{ width: `${p.progressPercent ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[12px] text-gray-500 font-sans">
                            {p.progressDisplay}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(
                                openActionId === p.id ? null : p.id,
                              );
                            }}
                            className="text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openActionId === p.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-gray-100 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-2 px-1.5 w-[210px] text-left animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  setNewMemberType("participant");
                                  setIsAddMemberModalOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[14px] text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer font-sans"
                              >
                                <Plus
                                  className="w-4 h-4 text-gray-800"
                                  strokeWidth={2}
                                />
                                <span>Add Participant</span>
                              </button>

                              <div className="border-t border-gray-100 my-1" />

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleRemoveParticipant(p.id)}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[14px] text-gray-800 hover:bg-red-50/50 disabled:opacity-50 transition-colors cursor-pointer font-sans"
                              >
                                {busy ? (
                                  <Loader2 className="w-4 h-4 text-[#EF4444] animate-spin" />
                                ) : (
                                  <Trash2
                                    className="w-4 h-4 text-[#EF4444]"
                                    strokeWidth={1.8}
                                  />
                                )}
                                <span>
                                  {busy ? "Removing..." : "Remove Participant"}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Mentors */}
      {activeTab === "mentors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Top: Avatar, Name, Role & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatarUrl || "/icons/user-placeholder.svg"}
                      alt={m.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/icons/user-placeholder.svg";
                      }}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-[16px] font-medium text-gray-900 font-sans tracking-tight">
                        {m.name}
                      </h4>
                      <p className="text-[13px] text-gray-500 font-sans mt-0.5">
                        {m.role}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[12px] font-normal bg-[#EEF3ED] text-[#486B52] font-sans shrink-0">
                    {m.status}
                  </span>
                </div>

                {/* Middle: Metrics */}
                <div className="flex items-center gap-6 mt-6 pt-1 text-[13.5px] text-gray-800 font-sans">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-700 stroke-[1.8]" />
                    <span>{m.mentees} mentees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-700 stroke-[1.8]" />
                    <span>{m.sessions} sessions</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Action buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentorForAction(m);
                    setIsMessageMentorModalOpen(true);
                  }}
                  className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-[8px] text-[13.5px] font-medium transition-colors font-sans text-center cursor-pointer"
                >
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentorForAction(m);
                    setAssignMenteesSuccess(false);
                    setActionError(null);
                    setIsAssignMenteesModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-[#DB911E] hover:bg-[#BA7815] text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans text-center cursor-pointer shadow-sm"
                >
                  Assign Mentees
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Tab Content: Settings */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 font-sans items-stretch">
          {/* Left Card: Cohort details */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] sm:text-[17px] font-medium text-[#111928] font-sans mb-5">
                Cohort details
              </h3>

              {saveSettingsSuccess && (
                <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] font-sans flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> Changes saved
                  successfully!
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-1"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Cohort Name
                  </label>
                  <input
                    id="field-tsdashboardadminCohortDetailViewtsx-1"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-2"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Start Year
                  </label>
                  <input
                    id="field-tsdashboardadminCohortDetailViewtsx-2"
                    type="text"
                    value={editStarted}
                    onChange={(e) => setEditStarted(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-3"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Session Cadence
                  </label>
                  <input
                    id="field-tsdashboardadminCohortDetailViewtsx-3"
                    type="text"
                    value={editCadence}
                    onChange={(e) => setEditCadence(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-4"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Capacity
                  </label>
                  <input
                    id="field-tsdashboardadminCohortDetailViewtsx-4"
                    type="number"
                    value={editCapacity}
                    onChange={(e) =>
                      setEditCapacity(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{busy ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Card: Danger zone */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full">
            <h3 className="text-[15px] sm:text-[16px] font-medium text-[#EA580C] font-sans mb-5">
              Danger zone
            </h3>

            <div className="space-y-5">
              {/* Close Enrolment */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[14px] font-medium text-[#111928] font-sans">
                    Close Enrolment
                  </h4>
                  <p className="text-[13px] text-[#6B7280] font-sans mt-0.5">
                    No new members can join this cohort.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleToggleEnrollment()}
                  className={`px-4 py-1.5 border rounded-[8px] text-[13px] font-medium transition-colors font-sans cursor-pointer shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50 ${
                    isEnrolmentClosed
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#374151]"
                  }`}
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEnrolmentClosed ? "Reopen" : "Close"}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F3F4F6]" />

              {/* Archive cohort */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[14px] font-medium text-[#111928] font-sans">
                    Archive cohort
                  </h4>
                  <p className="text-[13px] text-[#6B7280] font-sans mt-0.5">
                    Move into read-only mode for the record.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleToggleArchiveCohort()}
                  className={`px-4 py-1.5 border rounded-[8px] text-[13px] font-medium transition-colors font-sans cursor-pointer shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50 ${
                    isCohortArchived
                      ? "border-gray-300 bg-gray-100 text-gray-700"
                      : "border-[#FDBA74] text-[#EA580C] hover:bg-orange-50/50"
                  }`}
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isCohortArchived ? "Archived" : "Archive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: Edit Cohort Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[16px] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-[17px] font-medium text-gray-900 font-sans">
                Edit Cohort Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-5"
                  className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                >
                  Cohort Name
                </label>
                <input
                  id="field-tsdashboardadminCohortDetailViewtsx-5"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-6"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Start Year
                  </label>
                  <input
                    id="field-tsdashboardadminCohortDetailViewtsx-6"
                    type="number"
                    value={editStarted}
                    onChange={(e) => setEditStarted(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-7"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Current Year
                  </label>
                  <select
                    id="field-tsdashboardadminCohortDetailViewtsx-7"
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
                      <option key={y} value={y}>
                        Year {y} of 10
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-8"
                  className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                >
                  Cadence
                </label>
                <input
                  id="field-tsdashboardadminCohortDetailViewtsx-8"
                  type="text"
                  value={editCadence}
                  onChange={(e) => setEditCadence(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-[8px] text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{busy ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Add Member Modal --- */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[16px] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-[17px] font-medium text-gray-900 font-sans">
                Add Member to {cohort.name}
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              {addMemberSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] font-sans flex items-center gap-2">
                  <Check className="w-4 h-4" /> Member successfully enrolled!
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5">
                  Member Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMemberType("participant")}
                    className={`py-2 px-3 rounded-[8px] text-[13px] font-medium font-sans border transition-colors cursor-pointer ${
                      newMemberType === "participant"
                        ? "border-[#DB911E] bg-orange-50/50 text-[#DB911E]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Participant
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemberType("mentor")}
                    className={`py-2 px-3 rounded-[8px] text-[13px] font-medium font-sans border transition-colors cursor-pointer ${
                      newMemberType === "mentor"
                        ? "border-[#DB911E] bg-orange-50/50 text-[#DB911E]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Mentor
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-9"
                  className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="field-tsdashboardadminCohortDetailViewtsx-9"
                  type="text"
                  required
                  placeholder="e.g. Samuel Adjei"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E]"
                />
              </div>

              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-10"
                  className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="field-tsdashboardadminCohortDetailViewtsx-10"
                  type="email"
                  required
                  placeholder="e.g. samuel@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-[8px] text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{busy ? "Enrolling..." : "Enroll Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Schedule Gathering Modal --- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[20px] w-full max-w-[580px] shadow-2xl border border-gray-100 overflow-hidden p-6 sm:p-7">
            {/* Top row: Calendar icon box & Close X */}
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-[10px] border border-gray-200 flex items-center justify-center text-gray-700 mb-4 bg-white">
                <Calendar className="w-5 h-5 text-gray-800" strokeWidth={1.8} />
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-[18px] md:text-[19px] font-medium text-gray-900 font-sans">
              Schedule Gathering
            </h3>
            <p className="text-[13px] text-gray-500 font-sans mt-0.5 mb-5">
              Pick a time that leaves room for all.
            </p>

            <form onSubmit={handleScheduleGathering} className="space-y-4">
              {scheduleSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] font-sans flex items-center gap-2">
                  <Check className="w-4 h-4" /> Gathering scheduled! Calendar
                  invitations sent.
                </div>
              )}

              {/* Topic */}
              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-11"
                  className="block text-[13px] font-normal text-gray-700 font-sans mb-1.5"
                >
                  Topic
                </label>
                <input
                  id="field-tsdashboardadminCohortDetailViewtsx-11"
                  type="text"
                  required
                  placeholder="What is the gathering about?..."
                  value={gatheringTopic}
                  onChange={(e) => setGatheringTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#DB911E] transition-all font-sans"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-12"
                  className="block text-[13px] font-normal text-gray-700 font-sans mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="field-tsdashboardadminCohortDetailViewtsx-12"
                  rows={3}
                  placeholder="Write here..."
                  value={gatheringDescription}
                  onChange={(e) => setGatheringDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#DB911E] transition-all font-sans resize-none min-h-[85px]"
                />
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-13"
                    className="block text-[13px] font-normal text-gray-700 font-sans mb-1.5"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <input
                      id="field-tsdashboardadminCohortDetailViewtsx-13"
                      ref={dateInputRef}
                      type={gatheringDate ? "date" : "text"}
                      placeholder="dd/mm/yy"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={gatheringDate}
                      onChange={(e) => setGatheringDate(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#DB911E] transition-colors font-sans [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0 relative z-10 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (dateInputRef.current) {
                            dateInputRef.current.type = "date";
                            dateInputRef.current.showPicker();
                          }
                        } catch (err) {}
                      }}
                      className="absolute inset-y-0 right-3.5 flex items-center text-[#DB911E] hover:text-[#BA7815] z-20 cursor-pointer pointer-events-auto"
                      aria-label="Open calendar"
                    >
                      <Calendar className="w-4 h-4" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="field-tsdashboardadminCohortDetailViewtsx-14"
                    className="block text-[13px] font-normal text-gray-700 font-sans mb-1.5"
                  >
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      id="field-tsdashboardadminCohortDetailViewtsx-14"
                      value={gatheringDuration}
                      onChange={(e) => setGatheringDuration(e.target.value)}
                      className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-900 outline-none focus:border-[#DB911E] transition-all font-sans appearance-none cursor-pointer"
                    >
                      <option value="30m">30m</option>
                      <option value="45m">45m</option>
                      <option value="60m">60m</option>
                      <option value="90m">90m</option>
                      <option value="2h">2h</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-[13px] font-normal text-gray-700 font-sans mb-2">
                  Time
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    if (!slot.available) {
                      return (
                        <div
                          key={slot.time}
                          className="flex items-center justify-center h-[40px] rounded-[8px] border border-gray-100 bg-white text-[12px] font-normal text-gray-300 font-sans cursor-not-allowed select-none"
                        >
                          {slot.time}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`relative flex flex-col items-center justify-center h-[40px] rounded-[8px] text-[12px] font-sans transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#DB911E] border-[#DB911E] text-white shadow-sm font-medium"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 font-normal"
                        }`}
                      >
                        <span
                          className={
                            isSelected
                              ? "text-[12px] leading-none -mt-0.5"
                              : "text-[12px] leading-normal"
                          }
                        >
                          {slot.time}
                        </span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-white stroke-[2.5] -mb-0.5 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:flex justify-end gap-2.5 sm:gap-3 pt-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 sm:px-6 py-2.5 border border-gray-200 rounded-[8px] text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-sans cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 sm:px-6 py-2.5 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center justify-center gap-2 text-center"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{busy ? "Scheduling..." : "Schedule Gathering"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Assign Program Modal --- */}
      <AssignProgramModal
        isOpen={isAssignProgramModalOpen}
        onClose={() => setIsAssignProgramModalOpen(false)}
        cohortId={cohort.id}
        cohortName={cohort.name}
        currentProgramId={
          (cohort as unknown as { programId?: number }).programId
        }
        currentCategory={cohort.category}
        onProgramAssigned={(programId, programName) => {
          onUpdateCohort({
            ...cohort,
            programId,
            category:
              programName.replace(/\s+program$/i, "").trim() ||
              cohort.category,
          });
          programs.reload();
        }}
      />

      {/* --- MODAL: Message Mentor Modal --- */}
      {isMessageMentorModalOpen && selectedMentorForAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    selectedMentorForAction.avatarUrl ||
                    "/icons/user-placeholder.svg"
                  }
                  alt={selectedMentorForAction.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/user-placeholder.svg";
                  }}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h3 className="text-[17px] font-medium text-gray-900 font-sans">
                    Message {selectedMentorForAction.name}
                  </h3>
                  <p className="text-[12.5px] text-gray-500 font-sans">
                    {selectedMentorForAction.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMessageMentorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token || !selectedMentorForAction || !mentorMessageText.trim())
                  return;
                if (
                  await transact(() =>
                    messageAdminUser(token, String(selectedMentorForAction.id), {
                      title: `Message from Admin (${cohort.name})`,
                      body: mentorMessageText.trim(),
                    }),
                  )
                ) {
                  setMessageSentSuccess(true);
                  setMentorMessageText("");
                  setTimeout(() => {
                    setIsMessageMentorModalOpen(false);
                    setMessageSentSuccess(false);
                  }, 1000);
                }
              }}
              className="space-y-4"
            >
              {messageSentSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] font-sans flex items-center gap-2">
                  <Check className="w-4 h-4" /> Message delivered to{" "}
                  {selectedMentorForAction.name}!
                </div>
              )}

              <div>
                <label
                  htmlFor="field-tsdashboardadminCohortDetailViewtsx-15"
                  className="block text-[13px] font-normal text-gray-700 font-sans mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="field-tsdashboardadminCohortDetailViewtsx-15"
                  rows={4}
                  required
                  placeholder={`Write a message to ${selectedMentorForAction.name}...`}
                  value={mentorMessageText}
                  onChange={(e) => setMentorMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#DB911E] transition-all font-sans resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setIsMessageMentorModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-[8px] text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-2.5 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{busy ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Assign Mentees Modal --- */}
      {isAssignMenteesModalOpen && selectedMentorForAction && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setIsAssignMenteesModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assign Mentees"
            className="bg-white rounded-[20px] w-full max-w-[480px] shadow-2xl border border-gray-100 overflow-hidden p-6 sm:p-7 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[18px] md:text-[19px] font-medium text-[#111928] font-sans tracking-tight">
                  Assign Mentees
                </h3>
                <p className="text-[13px] text-[#6B7280] font-sans mt-0.5">
                  Assign mentees to {selectedMentorForAction.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignMenteesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 cursor-pointer rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignMenteesSuccess && (
              <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] font-sans flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> All mentees
                assigned successfully!
              </div>
            )}

            {/* List of Mentees */}
            <div className="space-y-3">
              {assignableMentees.map((mentee) => {
                const isAssigned = assignedMenteeIds.includes(mentee.id);
                return (
                  <div
                    key={mentee.id}
                    className="border border-[#E5E7EB] rounded-[14px] p-3 sm:px-4 sm:py-3.5 flex items-center justify-between transition-colors bg-white hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={mentee.avatarUrl || "/icons/user-placeholder.svg"}
                        alt={mentee.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/icons/user-placeholder.svg";
                        }}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                      />
                      <div>
                        <div className="text-[13.5px] font-medium text-[#111928] leading-tight font-sans">
                          {mentee.name}
                        </div>
                        <div className="text-[12px] text-[#6B7280] font-sans mt-0.5">
                          {mentee.role}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAssignMentee(mentee.id)}
                      disabled={
                        busy ||
                        assignments.loading ||
                        !assignments.data ||
                        isAssigned
                      }
                      aria-label={`${isAssigned ? "Assigned" : "Assign"}: ${mentee.name}`}
                      className={`px-4 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors cursor-pointer border inline-flex items-center gap-1.5 disabled:opacity-60 ${
                        isAssigned
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50"
                      }`}
                    >
                      {assigningMenteeId === mentee.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span>
                        {isAssigned
                          ? "Assigned"
                          : assigningMenteeId === mentee.id
                            ? "Assigning..."
                            : "Assign"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => setIsAssignMenteesModalOpen(false)}
                className="px-5 py-2 border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 disabled:opacity-50 transition-colors font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignAll}
                disabled={
                  busy ||
                  assignments.loading ||
                  !assignments.data ||
                  !assignableMentees.length ||
                  assignedMenteeIds.length === assignableMentees.length
                }
                className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13px] font-medium transition-colors font-sans cursor-pointer shadow-sm inline-flex items-center gap-2"
              >
                {assigningAll && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{assigningAll ? "Assigning..." : "Assign All"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
