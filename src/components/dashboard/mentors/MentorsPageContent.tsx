"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, MapPin, Trophy } from "lucide-react";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMyMentor, fetchMentors } from "@/lib/services/users";
import { fetchCohorts } from "@/lib/services/cohorts";
import { fetchSessions } from "@/lib/services/sessions";
import { fetchGoals } from "@/lib/services/goals";
import { ApiState, formatDate, safeWebUrl } from "@/components/shared/ApiUI";

interface Mentor {
  id: string;
  name: string;
  email: string;
  subtitle: string;
  menteesCount?: number;
  location?: string;
  mentoringSince?: string;
  description?: string;
  isAssigned?: boolean;
  stats: {
    sessions: number;
    avgResponse: string;
    retention: string;
  };
  goals: {
    title: string;
    completion: number;
    text: string;
    status?: string;
  }[];
  achievements: { title: string; year: string }[];
  avatarUrl: string;
}

export default function MentorsPageContent() {
  const resource = useApiResource("assigned-mentor", fetchMyMentor);
  const directory = useApiResource("program-mentors", fetchMentors);
  const cohortsResource = useApiResource("mentors-cohorts", fetchCohorts);
  const sessionsResource = useApiResource("mentors-sessions", (token) =>
    fetchSessions(token),
  );
  const goalsResource = useApiResource("mentors-goals", (token) =>
    fetchGoals(token),
  );

  const assignedMentorApi = resource.data?.mentor || null;

  const PROGRAM_MENTORS: Mentor[] = useMemo(() => {
    const rawMentors = directory.data || [];
    const cohorts = cohortsResource.data || [];
    const allSessions = sessionsResource.data || [];
    const userGoals = goalsResource.data || [];

    return rawMentors.map((mentor) => {
      const mentorCohorts = cohorts.filter(
        (c) =>
          c.id === mentor.cohortId ||
          mentor.cohorts?.some((mc) => mc.id === c.id) ||
          c.members?.some((m) => String(m.id) === String(mentor.id)),
      );

      const cohortNames = Array.from(
        new Set([
          ...(mentor.cohorts?.map((c) => c.name).filter(Boolean) || []),
          ...mentorCohorts.map((c) => c.name).filter(Boolean),
        ]),
      );

      const isAssignedToMe =
        Boolean(mentor.isAssigned) ||
        (assignedMentorApi && String(assignedMentorApi.id) === String(mentor.id));

      const subtitleParts = [
        mentor.expertise,
        cohortNames.length > 0 ? cohortNames.join(" · ") : undefined,
        !mentor.expertise && cohortNames.length === 0 ? mentor.email : undefined,
      ].filter(Boolean);

      const mentorSessions = allSessions.filter(
        (s) =>
          (s.mentorId && String(s.mentorId) === String(mentor.id)) ||
          (s.mentorName &&
            s.mentorName.toLowerCase() === mentor.name.toLowerCase()) ||
          (isAssignedToMe && !s.mentorId),
      );

      const cohortSessionsCount = mentorCohorts.reduce(
        (sum, c) => sum + (typeof c.sessionsCount === "number" ? c.sessionsCount : 0),
        0,
      );

      const totalSessions =
        typeof mentor.sessionsCount === "number"
          ? mentor.sessionsCount
          : Math.max(mentorSessions.length, cohortSessionsCount);

      const avgActiveRate =
        mentorCohorts.length > 0
          ? Math.round(
              mentorCohorts.reduce(
                (sum, c) =>
                  sum + (typeof c.activeRate === "number" ? c.activeRate : 100),
                0,
              ) / mentorCohorts.length,
            )
          : cohorts.length > 0
            ? Math.round(
                cohorts.reduce(
                  (sum, c) =>
                    sum + (typeof c.activeRate === "number" ? c.activeRate : 100),
                  0,
                ) / cohorts.length,
              )
            : null;

      const retention =
        mentor.retention ||
        (avgActiveRate !== null ? `${avgActiveRate}%` : "—");

      const avgResponse =
        mentor.avgResponse ||
        (mentor.availability
          ? mentor.availability
          : isAssignedToMe && resource.data?.open_slots?.length
            ? "< 24 hrs"
            : totalSessions > 0
              ? "< 24 hrs"
              : "—");

      const earliestCohortYear = mentorCohorts
        .map((c) => (c.startsAt ? new Date(c.startsAt).getFullYear() : NaN))
        .filter((y) => !Number.isNaN(y))
        .sort((a, b) => a - b)[0];

      const createdYear = mentor.createdAt
        ? new Date(mentor.createdAt).getFullYear()
        : NaN;

      const rawSince =
        mentor.mentoringSince ||
        (!Number.isNaN(earliestCohortYear) && earliestCohortYear
          ? String(earliestCohortYear)
          : !Number.isNaN(createdYear) && createdYear
            ? String(createdYear)
            : undefined);

      const mentoringSince = rawSince
        ? /^\d{4}-\d{2}-\d{2}/.test(rawSince)
          ? String(new Date(rawSince).getFullYear())
          : rawSince
        : undefined;

      // Goals in motion: prefer API mentor.goals, then active mentee goals
      const derivedGoals =
        mentor.goals && mentor.goals.length > 0
          ? mentor.goals
          : userGoals.slice(0, 3).map((g) => {
              const statusNorm = (g.status || "").toLowerCase();
              const completion =
                statusNorm === "completed"
                  ? 100
                  : statusNorm === "in_progress" || statusNorm === "in progress"
                    ? 50
                    : 0;
              return {
                title: g.title,
                completion,
                text:
                  g.description ||
                  `${g.category}${g.endDate ? ` · Target ${formatDate(g.endDate)}` : ""}`,
                status: g.status,
              };
            });

      // Achievements: prefer API mentor.achievements, then derive from live cohort/mentorship/session data
      const derivedAchievements: { title: string; year: string }[] =
        mentor.achievements && mentor.achievements.length > 0
          ? mentor.achievements
          : [
              ...(cohortNames.length > 0
                ? cohortNames.map((name) => {
                    const matchedCohort = mentorCohorts.find((c) => c.name === name);
                    const yr = matchedCohort?.startsAt
                      ? String(new Date(matchedCohort.startsAt).getFullYear())
                      : mentoringSince || "";
                    return {
                      title: `${name} Cohort Mentor`,
                      year: yr
                        ? `${yr}${matchedCohort?.membersCount ? ` · ${matchedCohort.membersCount} members` : ""}`
                        : "Active Cohort",
                    };
                  })
                : []),
              ...(typeof mentor.menteesCount === "number" &&
              mentor.menteesCount > 0
                ? [
                    {
                      title: `Mentoring ${mentor.menteesCount} ${mentor.menteesCount === 1 ? "Fellow" : "Fellows"}`,
                      year: mentoringSince
                        ? `Since ${mentoringSince}`
                        : "Active Mentorship",
                    },
                  ]
                : []),
              ...(totalSessions > 0
                ? [
                    {
                      title: `${totalSessions} Mentorship ${totalSessions === 1 ? "Session" : "Sessions"} Led`,
                      year: retention !== "—" ? `${retention} retention` : "Completed",
                    },
                  ]
                : []),
            ];

      const assignedBio =
        isAssignedToMe
          ? assignedMentorApi?.profile?.bio || assignedMentorApi?.bio
          : undefined;

      const cohortDescription = mentorCohorts.find((c) => c.description)?.description;

      return {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        subtitle: subtitleParts.join(" · "),
        menteesCount: mentor.menteesCount,
        description: mentor.bio || assignedBio || cohortDescription || undefined,
        location: mentor.location,
        mentoringSince,
        isAssigned: Boolean(isAssignedToMe),
        stats: {
          sessions: totalSessions,
          avgResponse,
          retention,
        },
        goals: derivedGoals,
        achievements: derivedAchievements,
        avatarUrl:
          safeWebUrl(mentor.avatarUrl) ||
          (isAssignedToMe
            ? safeWebUrl(
                assignedMentorApi?.profile?.avatar_url ||
                  (assignedMentorApi as unknown as { avatar_url?: string })
                    ?.avatar_url,
              )
            : null) ||
          "/icons/user-placeholder.svg",
      };
    });
  }, [
    directory.data,
    cohortsResource.data,
    sessionsResource.data,
    goalsResource.data,
    assignedMentorApi,
    resource.data?.open_slots,
  ]);

  const [expandedId, setExpandedId] = useState<string>("");
  const [hasInitializedExpand, setHasInitializedExpand] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentorForBooking, setSelectedMentorForBooking] =
    useState<string>("");

  useEffect(() => {
    if (!hasInitializedExpand && PROGRAM_MENTORS.length > 0) {
      const assignedMatch = PROGRAM_MENTORS.find((m) => m.isAssigned);
      setExpandedId((assignedMatch || PROGRAM_MENTORS[0]).id);
      setHasInitializedExpand(true);
    }
  }, [PROGRAM_MENTORS, hasInitializedExpand]);

  useEffect(() => {
    const handleOpenModal = () => {
      setSelectedMentorForBooking(
        assignedMentorApi?.id ? String(assignedMentorApi.id) : "",
      );
      setIsModalOpen(true);
    };
    window.addEventListener("open-book-session-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-book-session-modal", handleOpenModal);
  }, [assignedMentorApi?.id]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? "" : id);
  };

  // Match assigned mentor in directory if available for enriched metadata
  const assignedDirectoryMatch = useMemo(
    () =>
      assignedMentorApi
        ? PROGRAM_MENTORS.find(
            (m) => String(m.id) === String(assignedMentorApi.id),
          )
        : PROGRAM_MENTORS.find((m) => m.isAssigned),
    [PROGRAM_MENTORS, assignedMentorApi],
  );

  const yourMentorName =
    assignedMentorApi?.name || assignedDirectoryMatch?.name || "Not yet assigned";
  const yourMentorSubtitle =
    assignedMentorApi?.expertise ||
    assignedDirectoryMatch?.subtitle ||
    assignedMentorApi?.email ||
    "Your assigned mentor will appear here.";
  const yourMentorBio =
    assignedMentorApi?.profile?.bio ||
    assignedMentorApi?.bio ||
    assignedDirectoryMatch?.description ||
    "";
  const yourMentorAvatar =
    safeWebUrl(
      assignedMentorApi?.profile?.avatar_url ||
        (assignedMentorApi as unknown as { avatar_url?: string })?.avatar_url,
    ) ||
    assignedDirectoryMatch?.avatarUrl ||
    "/icons/user-placeholder.svg";

  return (
    <div className="w-full pb-10 space-y-8">
      {!assignedMentorApi && !assignedDirectoryMatch && (
        <ApiState {...resource} onRetry={resource.reload} />
      )}
      {/* Your Mentor Section */}
      <section>
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13.5px] font-medium text-[#DB911E] font-sans">
              Your Mentor
            </h2>
            {(assignedMentorApi?.id || assignedDirectoryMatch?.id) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMentorForBooking(
                    String(assignedMentorApi?.id || assignedDirectoryMatch?.id),
                  );
                  setIsModalOpen(true);
                }}
                className="px-4 py-1.5 bg-[#DB911E] text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-[#BA7815] transition-colors flex items-center gap-2"
              >
                <img
                  src="/icons/book-session.svg"
                  alt=""
                  className="w-4 h-4 brightness-0 invert"
                />
                Book Session
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={yourMentorAvatar}
              alt={yourMentorName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/icons/user-placeholder.svg";
              }}
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
            <div>
              <h3 className="text-[15px] font-medium text-gray-900 font-sans">
                {yourMentorName}
              </h3>
              <p className="text-[13.5px] text-gray-500 font-sans mt-0.5">
                {yourMentorSubtitle}
              </p>
            </div>
          </div>

          {yourMentorBio && (
            <p className="text-[14.5px] text-gray-700 font-sans leading-relaxed max-w-[850px]">
              {yourMentorBio}
            </p>
          )}
        </div>
      </section>

      {/* Program Mentors Section */}
      <section>
        <h2 className="text-[16px] font-medium text-gray-900 mb-5 font-sans">
          Program Mentors
        </h2>

        <div className="space-y-3">
          <ApiState {...directory} onRetry={directory.reload} />
          {!directory.loading &&
            !directory.error &&
            PROGRAM_MENTORS.length === 0 && (
              <p className="rounded-[16px] border border-gray-200 bg-white p-6 text-sm text-gray-500">
                No program mentors found.
              </p>
            )}
          {PROGRAM_MENTORS.map((mentor) => {
            const isExpanded = expandedId === mentor.id;

            return (
              <div
                key={mentor.id}
                className={`bg-white border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 ${
                  isExpanded ? "rounded-[16px]" : "rounded-[12px]"
                }`}
              >
                {/* Header Row */}
                <div
                  className={`flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors gap-3 ${
                    isExpanded
                      ? "border-b border-gray-100 rounded-t-[16px]"
                      : "rounded-[12px]"
                  }`}
                  onClick={() => toggleExpand(mentor.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/icons/user-placeholder.svg";
                      }}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-[14.5px] sm:text-[15px] font-medium text-gray-900 font-sans truncate">
                          {mentor.name}
                        </h3>
                        {mentor.isAssigned && (
                          <span className="px-2 py-0.5 bg-[#FCF9F0] text-[#DB911E] rounded-full text-[10.5px] sm:text-[11px] font-medium font-sans whitespace-nowrap shrink-0">
                            Your Mentor
                          </span>
                        )}
                      </div>
                      {mentor.subtitle && (
                        <p className="text-[12.5px] sm:text-[13.5px] text-gray-500 font-sans mt-0.5 truncate">
                          {mentor.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="px-2.5 sm:px-3 py-1 bg-[#F3F4F6] text-gray-600 rounded-full text-[11.5px] sm:text-[12px] font-medium font-sans whitespace-nowrap">
                      {mentor.menteesCount === undefined
                        ? "—"
                        : mentor.menteesCount}{" "}
                      {mentor.menteesCount === 1 ? "mentee" : "mentees"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6">
                    {/* Location & Badge */}
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      {mentor.location && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="text-[13px] font-sans">
                            {mentor.location}
                          </span>
                        </div>
                      )}
                      {mentor.mentoringSince && (
                        <div className="text-[13px] text-gray-500 font-sans">
                          Mentoring since {mentor.mentoringSince}
                        </div>
                      )}
                      <span className="px-3 py-1 bg-[#E8EDEB] text-[#003F3A] rounded-full text-[12px] font-medium font-sans">
                        {mentor.menteesCount === undefined
                          ? "—"
                          : mentor.menteesCount}{" "}
                        {mentor.menteesCount === 1 ? "mentee" : "mentees"}
                      </span>
                    </div>

                    {/* Overview */}
                    {mentor.description && (
                      <div className="mb-6">
                        <h4 className="text-[13.5px] font-medium text-[#DB911E] mb-2 font-sans">
                          Overview
                        </h4>
                        <p className="text-[14.5px] text-gray-700 font-sans leading-relaxed">
                          {mentor.description}
                        </p>
                      </div>
                    )}

                    {/* Stats Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-[#FCF9F0] rounded-[12px] p-4">
                        <p className="text-[18px] font-medium text-[#DB911E] mb-1 font-sans">
                          {mentor.stats.sessions}
                        </p>
                        <p className="text-[13px] text-gray-500 font-sans">
                          Sessions
                        </p>
                      </div>
                      <div className="bg-[#FCF9F0] rounded-[12px] p-4">
                        <p className="text-[18px] font-medium text-[#DB911E] mb-1 font-sans">
                          {mentor.stats.avgResponse}
                        </p>
                        <p className="text-[13px] text-gray-500 font-sans">
                          Avg. response
                        </p>
                      </div>
                      <div className="bg-[#FCF9F0] rounded-[12px] p-4">
                        <p className="text-[18px] font-medium text-[#DB911E] mb-1 font-sans">
                          {mentor.stats.retention}
                        </p>
                        <p className="text-[13px] text-gray-500 font-sans">
                          Retention
                        </p>
                      </div>
                    </div>

                    {/* Goals and Achievements Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                      {/* Left: Goals in motion */}
                      <div>
                        <h4 className="text-[13.5px] font-medium text-[#DB911E] mb-5 font-sans">
                          Goals in motion
                        </h4>
                        {mentor.goals.length === 0 ? (
                          <p className="text-[13px] text-gray-400 font-sans">
                            No active goals recorded yet.
                          </p>
                        ) : (
                          <div className="space-y-5">
                            {mentor.goals.map((goal, idx) => (
                              <div
                                key={`${goal.title}-${idx}`}
                                className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[13.5px] font-medium text-gray-800 font-sans">
                                    {goal.title}
                                  </span>
                                  <span className="text-[12px] text-gray-400 font-sans">
                                    {goal.completion}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      goal.completion >= 100
                                        ? "bg-[#8DB58D]"
                                        : "bg-[#DB911E]"
                                    }`}
                                    style={{ width: `${goal.completion}%` }}
                                  />
                                </div>
                                {goal.text && (
                                  <p className="text-[12px] text-gray-500 font-sans">
                                    {goal.text}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Achievements */}
                      <div>
                        <h4 className="text-[13.5px] font-medium text-[#DB911E] mb-5 font-sans">
                          Achievements
                        </h4>
                        {mentor.achievements.length === 0 ? (
                          <p className="text-[13px] text-gray-400 font-sans">
                            No milestones recorded yet.
                          </p>
                        ) : (
                          <div className="space-y-6">
                            {mentor.achievements.map((achievement, idx) => (
                              <div
                                key={`${achievement.title}-${idx}`}
                                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#FCF9F0] flex items-center justify-center shrink-0">
                                  <Trophy className="w-4 h-4 text-[#DB911E]" />
                                </div>
                                <div>
                                  <p className="text-[13.5px] font-medium text-gray-800 font-sans mb-1">
                                    {achievement.title}
                                  </p>
                                  {achievement.year && (
                                    <p className="text-[12px] text-gray-500 font-sans">
                                      {achievement.year}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book Session Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMentorForBooking(mentor.id);
                          setIsModalOpen(true);
                        }}
                        className="px-5 py-2 bg-[#DB911E] text-white rounded-[8px] text-[13.5px] font-medium font-sans hover:bg-[#BA7815] transition-colors flex items-center gap-2"
                      >
                        <img
                          src="/icons/book-session.svg"
                          alt=""
                          className="w-4 h-4 brightness-0 invert"
                        />
                        Book Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Mentor"
        preselectedMentor={selectedMentorForBooking}
        onSuccess={() => {
          resource.reload();
          sessionsResource.reload();
        }}
      />
    </div>
  );
}
