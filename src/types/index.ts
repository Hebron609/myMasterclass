/**
 * Vision2535 Mentorship Platform - Type Definitions
 */

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

export interface Reflection {
  id: string;
  userId: string;
  content: string;
  date: Date;
  tags?: string[];
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: Date;
  endTime: Date;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  meetingLink?: string;
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string; // e.g., 'Career', 'Personal', 'Health', etc.
  targetDate: string; // ISO date string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number; // 0 to 100
  createdAt?: Date;
  updatedAt?: Date;
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
