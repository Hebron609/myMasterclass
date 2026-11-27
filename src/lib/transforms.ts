/**
 * MyMasterclass — Data Transforms
 *
 * Converts between API response shapes (snake_case) and
 * frontend types (camelCase).
 */

import type {
  ApiGoal,
  ApiGoalCategory,
  ApiProgram,
  ApiMentorship,
  ApiSession,
  ApiCohort,
  ApiReflection,
  ApiFeedback,
  ApiCertificate,
  ApiUser,
  Goal,
  GoalCategory,
  Program,
  Mentorship,
  Session,
  Cohort,
  Reflection,
  Feedback,
  Certificate,
  User,
} from "@/types";

// ── Goals ──────────────────────────────────────────────────

export function transformGoalFromAPI(api: ApiGoal): Goal {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    userId: api.user_id,
    category:
      api.goal_category?.name ||
      api.goal_category?.description ||
      "Uncategorized",
    categoryId: api.goal_category_id,
    startDate: api.start_date,
    endDate: api.end_date,
    status: api.status,
  };
}

export function transformGoalToAPI(
  goal: Omit<Goal, "id">,
): Record<string, unknown> {
  return {
    title: goal.title,
    description: goal.description,
    user_id: goal.userId,
    goal_category_id: goal.categoryId,
    start_date: goal.startDate,
    end_date: goal.endDate,
    status: goal.status,
  };
}

// ── Goal Categories ────────────────────────────────────────

export function transformGoalCategoryFromAPI(
  api: ApiGoalCategory,
): GoalCategory {
  return {
    id: api.id,
    description: api.name || api.description,
    name: api.name || api.description,
    details: api.description,
    isActive: api.is_active !== false,
  };
}

// ── Programs ───────────────────────────────────────────────

export function transformProgramFromAPI(api: ApiProgram): Program {
  return {
    id: String(api.id),
    name: api.name,
    description: api.description,
    startDate: api.start_date,
    endDate: api.end_date,
    status: api.status,
    isUpcoming: api.is_upcoming,
    applicationUrl: api.application_url,
    flyerUrl: api.flyer_url,
  };
}

// ── Mentorships ────────────────────────────────────────────

export function transformMentorshipFromAPI(api: ApiMentorship): Mentorship {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    mentorId: api.mentor_id,
    menteeId: api.mentee_id,
    status: api.status,
    participants: api.participants,
    isActive: api.is_active,
  };
}

// ── Sessions ───────────────────────────────────────────────

export function transformSessionFromAPI(api: ApiSession): Session {
  return {
    id: api.id,
    title: api.title || api.topic || "",
    mentorshipId: api.mentorship_id,
    sessionDate: api.starts_at || api.session_date,
    status: api.status,
    sessionSummary: api.discussion_summary || api.session_summary || "",
    endsAt: api.ends_at,
    durationMinutes: api.duration_minutes,
    actionPoints: api.action_points,
    followUpNotes: api.follow_up_notes,
    notes: api.notes,
    meetingLink: api.meeting_link,
    mentorId: api.mentor?.id || (api as { mentor_id?: string }).mentor_id,
    mentorName: api.mentor?.name,
    menteeName: api.mentee?.name,
    menteeId: api.mentee?.id,
  };
}

// ── Cohorts ────────────────────────────────────────────────

export function transformCohortFromAPI(api: ApiCohort): Cohort {
  return {
    id: api.id,
    name: api.name,
    startsAt: api.starts_at,
    endsAt: api.ends_at,
    description: api.description,
    programId: api.program_id,
    status: api.status,
    cadence: api.cadence,
    capacity: api.capacity,
    isEnrollmentOpen: api.is_enrollment_open,
    members: api.members?.map(transformUserFromAPI),
    membersCount: api.members_count,
    activeRate: api.active_rate,
    sessionsCount: api.sessions_count,
  };
}

// ── Reflections ────────────────────────────────────────────

export function transformReflectionFromAPI(api: ApiReflection): Reflection {
  const mentorFeedbackRaw =
    (api as { mentor_feedback?: unknown }).mentor_feedback ??
    api.mentor_feedback_text;
  const mentorFeedbackText =
    typeof mentorFeedbackRaw === "string"
      ? mentorFeedbackRaw
      : typeof (mentorFeedbackRaw as { text?: unknown; body?: unknown })?.text ===
          "string"
        ? String((mentorFeedbackRaw as { text: unknown }).text)
        : typeof (mentorFeedbackRaw as { text?: unknown; body?: unknown })?.body ===
            "string"
          ? String((mentorFeedbackRaw as { body: unknown }).body)
          : undefined;

  const rawTags = (api as { tags?: unknown }).tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.map((t) => String(t)).filter(Boolean)
    : typeof rawTags === "string"
      ? rawTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

  return {
    id: api.id,
    title: api.title,
    content: api.body ?? api.content ?? "",
    mood: api.mood || "",
    type: api.type,
    tags,
    moduleId: api.module_id,
    userId: api.user_id,
    mentorFeedbackText: mentorFeedbackText ?? api.mentor_feedback_text,
    mentorRating: api.mentor_rating,
    createdAt: api.reflected_at || api.created_at,
  };
}

// ── Feedback ───────────────────────────────────────────────

export function transformFeedbackFromAPI(api: ApiFeedback): Feedback {
  return {
    id: api.id,
    sessionId: api.session_id,
    menteeId: api.mentee_id,
    mentorId: api.mentor_id,
    rating: api.rating,
    comments: api.comments,
    actionItems: api.action_items,
    createdAt: api.created_at,
  };
}

// ── Certificates ───────────────────────────────────────────

export function transformCertificateFromAPI(api: ApiCertificate): Certificate {
  return {
    id: api.id,
    menteeId: api.mentee_id,
    templateId: api.template_id,
    issueDate: api.issue_date,
    pdfUrl: api.pdf_url,
  };
}

// ── Users ──────────────────────────────────────────────────

export function userModuleRole(
  api: Pick<ApiUser, "role" | "roles" | "profile">,
): string {
  const roles = Array.isArray(api.roles)
    ? api.roles.map((role) => (typeof role === "string" ? role : role?.name))
    : [];
  return (
    [api.profile?.role, api.role, ...roles]
      .find(
        (role) =>
          typeof role === "string" &&
          ["mentee", "mentor", "admin"].includes(role.toLowerCase()),
      )
      ?.toLowerCase() || ""
  );
}

export function resolveAvatarUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const str = raw.trim();
  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("data:image/") ||
    str.startsWith("blob:") ||
    str.startsWith("/icons/")
  ) {
    return str;
  }
  if (str.startsWith("/storage/") || str.startsWith("storage/")) {
    return `https://appsuite.butterflytech.io/${str.replace(/^\/+/, "")}`;
  }
  return undefined;
}

export function transformUserFromAPI(api: ApiUser): User {
  const extra = api as unknown as Record<string, unknown>;
  const profileExtra = (api.profile || {}) as Record<string, unknown>;
  const singularCohort =
    extra.cohort && typeof extra.cohort === "object"
      ? (extra.cohort as ApiCohort)
      : profileExtra.cohort && typeof profileExtra.cohort === "object"
        ? (profileExtra.cohort as ApiCohort)
        : null;
  const cohortNameStr =
    typeof extra.cohort_name === "string"
      ? extra.cohort_name
      : typeof profileExtra.cohort_name === "string"
        ? profileExtra.cohort_name
        : typeof extra.cohort === "string"
          ? extra.cohort
          : typeof profileExtra.cohort === "string"
            ? profileExtra.cohort
            : null;
  const resolvedCohorts =
    Array.isArray(api.cohorts) && api.cohorts.length > 0
      ? api.cohorts
      : singularCohort
        ? [singularCohort]
        : cohortNameStr
          ? [{ id: api.cohort_id || 0, name: cohortNameStr }]
          : api.cohorts;

  return {
    id: api.id,
    name:
      api.name ||
      `${api.first_name || ""} ${api.last_name || ""}`.trim() ||
      api.email,
    email: api.email,
    role: userModuleRole(api),
    cohortId: api.cohort_id ?? resolvedCohorts?.[0]?.id,
    cohorts: resolvedCohorts,
    bio: api.profile?.bio || api.bio,
    expertise: Array.isArray(api.expertise)
      ? api.expertise.filter(Boolean).join(", ")
      : typeof api.expertise === "string"
        ? api.expertise
        : Array.isArray(api.expertise_areas)
          ? api.expertise_areas.filter(Boolean).join(", ")
          : typeof api.expertise_areas === "string"
            ? api.expertise_areas
            : undefined,
    availability: api.availability,
    rating: api.rating,
    status: api.status,
    mentorId: api.mentor_id,
    journeyYear: api.profile?.journey_year ?? api.journey_year,
    progress: api.progress,
    menteesCount:
      typeof extra.mentees_count === "number" ? extra.mentees_count : undefined,
    avatarUrl: resolveAvatarUrl(
      api.profile?.avatar_url ||
        extra.avatar_url ||
        profileExtra.avatar ||
        extra.avatar ||
        profileExtra.profile_photo_url ||
        extra.profile_photo_url ||
        profileExtra.photo_url ||
        extra.photo_url,
    ),
    location:
      [
        api.profile?.city ??
          (typeof extra.city === "string" ? extra.city : undefined),
        api.profile?.country ??
          (typeof extra.country === "string" ? extra.country : undefined),
      ]
        .filter((value) => typeof value === "string" && value)
        .join(", ") || undefined,
    createdAt:
      typeof api.created_at === "string"
        ? api.created_at
        : typeof extra.created_at === "string"
          ? extra.created_at
          : undefined,
    isAssigned:
      typeof api.is_assigned === "boolean"
        ? api.is_assigned
        : typeof extra.is_assigned === "boolean"
          ? extra.is_assigned
          : undefined,
    mentoringSince:
      api.mentoring_since !== undefined && api.mentoring_since !== null
        ? String(api.mentoring_since)
        : api.mentor_since !== undefined && api.mentor_since !== null
          ? String(api.mentor_since)
          : api.profile?.mentoring_since !== undefined &&
              api.profile?.mentoring_since !== null
            ? String(api.profile.mentoring_since)
            : api.profile?.mentor_since !== undefined &&
                api.profile?.mentor_since !== null
              ? String(api.profile.mentor_since)
              : undefined,
    sessionsCount:
      typeof api.sessions_count === "number"
        ? api.sessions_count
        : typeof api.stats?.sessions === "number"
          ? api.stats.sessions
          : typeof extra.sessions_count === "number"
            ? extra.sessions_count
            : undefined,
    avgResponse:
      typeof api.avg_response === "string"
        ? api.avg_response
        : typeof api.avg_response_time === "string"
          ? api.avg_response_time
          : typeof api.stats?.avg_response === "string"
            ? api.stats.avg_response
            : typeof api.stats?.avgResponse === "string"
              ? api.stats.avgResponse
              : typeof api.profile?.avg_response_time === "string"
                ? api.profile.avg_response_time
                : typeof extra.avg_response === "string"
                  ? extra.avg_response
                  : undefined,
    retention:
      api.retention !== undefined && api.retention !== null
        ? typeof api.retention === "number"
          ? `${api.retention}%`
          : String(api.retention)
        : api.mentee_retention !== undefined && api.mentee_retention !== null
          ? typeof api.mentee_retention === "number"
            ? `${api.mentee_retention}%`
            : String(api.mentee_retention)
          : api.stats?.retention !== undefined && api.stats?.retention !== null
            ? typeof api.stats.retention === "number"
              ? `${api.stats.retention}%`
              : String(api.stats.retention)
            : api.profile?.mentee_retention !== undefined &&
                api.profile?.mentee_retention !== null
              ? typeof api.profile.mentee_retention === "number"
                ? `${api.profile.mentee_retention}%`
                : String(api.profile.mentee_retention)
              : undefined,
    reflectionsLogged:
      typeof api.reflections_logged === "number"
        ? api.reflections_logged
        : typeof api.profile?.reflections_logged === "number"
          ? api.profile.reflections_logged
          : undefined,
    expertiseAreas: Array.isArray(api.expertise_areas)
      ? api.expertise_areas.map(String).filter(Boolean)
      : typeof api.expertise_areas === "string"
        ? api.expertise_areas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(api.profile?.expertise_areas)
          ? api.profile.expertise_areas.map(String).filter(Boolean)
          : typeof api.profile?.expertise_areas === "string"
            ? api.profile.expertise_areas
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
    goalsCompletedCount:
      typeof api.goals_completed_count === "number"
        ? api.goals_completed_count
        : undefined,
    goalsTotalCount:
      typeof api.goals_total_count === "number"
        ? api.goals_total_count
        : undefined,
    interests: Array.isArray(api.interests)
      ? api.interests.map(String).filter(Boolean)
      : typeof api.interests === "string"
        ? api.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    statusCategory:
      typeof api.status_category === "string" ? api.status_category : undefined,
    stats: api.stats
      ? {
          sessions: api.stats.sessions,
          avgResponse: api.stats.avg_response || api.stats.avgResponse,
          retention:
            api.stats.retention !== undefined && api.stats.retention !== null
              ? typeof api.stats.retention === "number"
                ? `${api.stats.retention}%`
                : String(api.stats.retention)
              : undefined,
        }
      : undefined,
    goals: Array.isArray(api.goals)
      ? api.goals.map((g) => ({
          title: g.title,
          completion:
            typeof g.completion === "number"
              ? g.completion
              : typeof g.progress === "number"
                ? g.progress
                : g.status === "completed"
                  ? 100
                  : g.status === "in_progress"
                    ? 50
                    : 0,
          text: g.text || g.description || "",
        }))
      : undefined,
    achievements: Array.isArray(api.achievements)
      ? api.achievements.map((a) => ({
          title: a.title,
          year:
            a.year !== undefined && a.year !== null
              ? String(a.year)
              : a.subtitle || "",
        }))
      : undefined,
    certificates: Array.isArray(api.certificates) ? api.certificates : undefined,
  };
}
