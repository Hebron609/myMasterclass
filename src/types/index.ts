/**
 * MyMasterclass — Type Definitions
 *
 * Types are organized in two layers:
 * 1. API types (snake_case) — based on the supplied Phase 1 document
 * 2. Frontend types (camelCase) — used by UI components
 *
 * The transforms.ts module converts between the two. Several response schemas
 * are not supplied by the backend document; validate these against staging.
 * Legacy optional fields are retained for preserved design components.
 */

// ============================================================
// API Response Types (snake_case — matching Laravel backend)
// ============================================================

/** Wrapper shape for all list endpoints: { data: T[] } */
export interface ApiListResponse<T> {
  data: T[];
}

/** Wrapper shape for single resource endpoints: { data: T } */
export interface ApiSingleResponse<T> {
  data: T;
}

/** API Goal shape — as returned by GET /myMasterclass/goals */
export interface ApiGoal {
  id: number;
  title: string;
  description: string;
  user_id: string; // UUID string
  goal_category_id: number; // FK to goal categories
  start_date: string; // "2026-01-01"
  end_date: string; // "2026-06-01"
  status: string;
  goal_category?: ApiGoalCategory;
}

/** API Goal Category — as returned by GET /myMasterclass/goal-categories */
export interface ApiGoalCategory {
  id: number;
  name?: string;
  description: string;
  is_active?: boolean;
}

/** API Profile — as returned by GET /api/profile */
export interface ApiProfile {
  user: {
    id: string; // UUID
    name: string;
    email: string;
    tenant_id: string;
  };
  profile: {
    id: string;
    avatar_file_id: string | null;
    preferences: unknown[];
    metadata: unknown | null;
  };
}

/** API Program — as returned by GET /myMasterclass/programs */
export interface ApiProgram {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status?: string;
  is_upcoming?: boolean;
  application_url?: string | null;
  flyer_url?: string | null;
}

/** API Mentorship — as returned by GET /myMasterclass/mentorships */
export interface ApiMentorship {
  id: number;
  title: string;
  description: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  participants?: {
    mentor: Record<string, unknown>;
    mentee: Record<string, unknown>;
  };
  is_active: boolean;
}

/** API Mentorship Session — as returned by GET /myMasterclass/sessions */
export interface ApiSession {
  id: string | number;
  title: string;
  topic?: string;
  mentorship_id: number;
  session_date: string; // "2026-03-15T10:00:00"
  status: string;
  session_summary: string;
  starts_at?: string;
  ends_at?: string;
  duration_minutes?: number;
  discussion_summary?: string;
  action_points?: string;
  follow_up_notes?: string;
  notes?: string;
  meeting_link?: string | null;
  mentor?: ApiUser;
  mentee?: ApiUser;
}

/** API Cohort — as returned by GET /myMasterclass/cohorts */
export interface ApiCohort {
  id: number;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  description?: string;
  program_id?: number | null;
  status?: string;
  cadence?: string | null;
  capacity?: number | null;
  is_enrollment_open?: boolean;
  members?: ApiUser[];
  members_count?: number;
  active_rate?: number;
  sessions_count?: number;
}

export interface ApiReflection {
  id: number;
  title: string;
  content?: string;
  body?: string;
  reflected_at?: string;
  mood?: string;
  type?: string;
  tags?: string[];
  module_id?: number;
  user_id: string;
  mentor_feedback_text?: string;
  mentor_rating?: number;
  created_at: string;
}

export interface ApiFeedback {
  id: number;
  session_id: number;
  mentee_id: string;
  mentor_id: string;
  rating: number;
  comments: string;
  action_items?: string;
  created_at: string;
}

export interface ApiCertificate {
  id: number;
  mentee_id: string;
  template_id: number;
  issue_date: string;
  pdf_url: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  roles?: Array<string | { name: string }>;
  cohorts?: Array<{ id: number; name: string }>;
  cohort_id?: number;
  bio?: string;
  expertise?: string | string[];
  availability?: string;
  rating?: number;
  first_name?: string;
  last_name?: string;
  status?: string;
  mentor_id?: string | null;
  journey_year?: number;
  progress?: number;
  created_at?: string;
  is_assigned?: boolean;
  mentoring_since?: string | number;
  mentor_since?: string | number;
  sessions_count?: number;
  avg_response?: string;
  avg_response_time?: string;
  retention?: string | number;
  mentee_retention?: string | number;
  reflections_logged?: number;
  expertise_areas?: string[] | string;
  goals_completed_count?: number;
  goals_total_count?: number;
  interests?: string[] | string;
  status_category?: string;
  stats?: {
    sessions?: number;
    avg_response?: string;
    avgResponse?: string;
    retention?: string | number;
  };
  goals?: Array<{
    title: string;
    completion?: number;
    progress?: number;
    status?: string;
    text?: string;
    description?: string;
  }>;
  achievements?: Array<{
    title: string;
    year?: string | number;
    subtitle?: string;
    description?: string;
  }>;
  certificates?: Array<{
    id?: string | number;
    title?: string;
    name?: string;
    status?: string;
    issue_date?: string;
    issued_at?: string;
    description?: string;
  }>;
  profile?: {
    role?: string;
    bio?: string;
    avatar_url?: string;
    city?: string;
    country?: string;
    journey_year?: number;
    module_name?: string;
    modules_completed?: number;
    must_change_password?: boolean;
    mentoring_since?: string | number;
    mentor_since?: string | number;
    expertise_areas?: string[] | string;
    avg_response_time?: string;
    mentee_retention?: string | number;
    reflections_logged?: number;
  };
}

// ============================================================
// Frontend Types (camelCase — used by UI components)
// ============================================================

export interface Goal {
  id: number;
  title: string;
  description: string;
  userId: string; // UUID string
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  categoryId?: number;
}

export interface GoalCategory {
  id: number;
  description: string;
  name?: string;
  details?: string;
  isActive?: boolean;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  isUpcoming?: boolean;
  applicationUrl?: string | null;
  flyerUrl?: string | null;
}

export interface Mentorship {
  id: number;
  title: string;
  description: string;
  mentorId: string;
  menteeId: string;
  status: string;
  participants?: {
    mentor: Record<string, unknown>;
    mentee: Record<string, unknown>;
  };
  isActive: boolean;
}

export interface Session {
  id: string | number;
  title: string;
  mentorshipId: number;
  sessionDate: string;
  status: string;
  sessionSummary: string;
  endsAt?: string;
  durationMinutes?: number;
  actionPoints?: string;
  followUpNotes?: string;
  notes?: string;
  meetingLink?: string | null;
  mentorId?: string;
  mentorName?: string;
  menteeName?: string;
  menteeId?: string;
}

export interface Cohort {
  id: number;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  description?: string;
  programId?: number | null;
  status?: string;
  cadence?: string | null;
  capacity?: number | null;
  isEnrollmentOpen?: boolean;
  members?: User[];
  membersCount?: number;
  activeRate?: number;
  sessionsCount?: number;
}

export interface Reflection {
  id: number;
  title: string;
  content: string;
  mood: string;
  type?: string;
  tags?: string[];
  moduleId?: number;
  userId: string;
  mentorFeedbackText?: string;
  mentorRating?: number;
  createdAt: string;
}

export interface Feedback {
  id: number;
  sessionId: number;
  menteeId: string;
  mentorId: string;
  rating: number;
  comments: string;
  actionItems?: string;
  createdAt: string;
}

export interface Certificate {
  id: number;
  menteeId: string;
  templateId: number;
  issueDate: string;
  pdfUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  cohortId?: number;
  bio?: string;
  expertise?: string;
  availability?: string;
  rating?: number;
  status?: string;
  mentorId?: string | null;
  journeyYear?: number;
  progress?: number;
  menteesCount?: number;
  cohorts?: Array<{ id: number; name: string }>;
  avatarUrl?: string;
  location?: string;
  createdAt?: string;
  isAssigned?: boolean;
  mentoringSince?: string;
  sessionsCount?: number;
  avgResponse?: string;
  retention?: string;
  reflectionsLogged?: number;
  expertiseAreas?: string[];
  goalsCompletedCount?: number;
  goalsTotalCount?: number;
  interests?: string[];
  statusCategory?: string;
  stats?: {
    sessions?: number;
    avgResponse?: string;
    retention?: string;
  };
  goals?: Array<{
    title: string;
    completion: number;
    text: string;
  }>;
  achievements?: Array<{
    title: string;
    year: string;
  }>;
  certificates?: Array<{
    id?: string | number;
    title?: string;
    name?: string;
    status?: string;
    issue_date?: string;
    issued_at?: string;
    description?: string;
  }>;
}

// ============================================================
// Auth Types
// ============================================================

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "MENTOR" | "MENTEE" | "ADMIN";
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Profile;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface OTPVerificationRequest {
  email: string;
  code: string;
}

// ============================================================
// Form / Create Payload Types (for POST/PUT requests)
// ============================================================

export interface CreateGoalPayload {
  title: string;
  description: string;
  user_id?: string; // Backend infers the authenticated owner for creation.
  goal_category_id: number; // Must be a valid ID from /myMasterclass/goal-categories
  start_date?: string;
  end_date?: string;
  status: string;
}

export interface CreateSessionPayload {
  title: string;
  mentorship_id: number;
  session_date: string;
  session_summary: string;
}

export interface CreateCohortPayload {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  program_id?: number | null;
  status?: string;
  cadence?: string | null;
  capacity?: number | null;
  is_enrollment_open?: boolean;
}

export interface CreateProgramPayload {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  is_upcoming?: boolean;
  application_url?: string | null;
  flyer_url?: string | null;
}

export interface CreateReflectionPayload {
  title: string;
  body: string;
  reflected_at: string;
  mood?: string;
  type?: string;
  tags?: string[];
}

export interface RespondReflectionPayload {
  feedback_text: string;
  rating: number;
}

export interface SubmitFeedbackPayload {
  session_id: number;
  mentee_id: string;
  rating: number;
  comments: string;
  action_items?: string;
}

export interface UpdateProfilePayload {
  bio?: string;
  avatar_url?: string;
  preferred_name?: string;
  city?: string;
  country?: string;
  expertise_areas?: string[] | string;
  mentor_since?: string | number;
}

export interface CreateCertificateTemplatePayload {
  title: string;
  description: string;
  applicable_cohort: number | string;
  design_style: string;
  criteria: string;
}

export interface IssueCertificatePayload {
  mentee_id: string;
  template_id: number;
  issue_date: string;
}
