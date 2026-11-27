"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { usePageLoading } from "@/context/PageLoadingContext";
import { useAuth } from "@/context/AuthContext";
import {
  fetchGoals,
  fetchGoalCategories,
  createGoal,
} from "@/lib/services/goals";
import type { Goal, GoalCategory, CreateGoalPayload } from "@/types";
import { fetchMentees } from "@/lib/services/users";
import StatsCard from "@/components/dashboard/goals/StatsCard";
import GoalItem from "@/components/dashboard/goals/GoalItem";
import GoalForm from "@/components/dashboard/goals/GoalForm";

export default function MentorGoalsPage() {
  const { token, userId } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  usePageLoading(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const loadGoals = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError("Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const mentees = await fetchMentees(token);
      const goalsData = (
        await Promise.all(mentees.map((mentee) => fetchGoals(token, mentee.id)))
      ).flat();
      setGoals(goalsData);

      try {
        const categoriesData = await fetchGoalCategories(token);
        setCategories(categoriesData);
      } catch {
        console.warn("Goal categories endpoint not available — using defaults");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load goals";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    const fieldName = id.replace("goal-", "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSaveGoal = async () => {
    setError(
      "Creating a goal on behalf of a mentee is not available yet. No goal was created.",
    );
  };

  // Calculate stats
  const totalGoals = goals.length;
  const inProgressCount = goals.filter(
    (g) => g.status === "IN_PROGRESS" || g.status === "in_progress",
  ).length;
  const completedCount = goals.filter(
    (g) => g.status === "COMPLETED" || g.status === "completed",
  ).length;
  const notStartedCount = goals.filter(
    (g) => g.status === "NOT_STARTED" || g.status === "not_started",
  ).length;

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-[#003F3A] mb-2 font-dm-sans">
              Mentee Goals
            </h1>
            <p className="text-[#003F3A] font-rubik text-[16px] font-regular">
              Review and provide feedback on mentee goals
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#333333] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#222222] transition-colors shadow-sm font-rubik text-[14px] font-regular"
          >
            + Add New Goal
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Goals"
            value={isLoading || error ? "—" : totalGoals}
          />
          <StatsCard
            label="In Progress"
            value={isLoading || error ? "—" : inProgressCount}
          />
          <StatsCard
            label="Completed"
            value={isLoading || error ? "—" : completedCount}
          />
          <StatsCard
            label="Not Started"
            value={isLoading || error ? "—" : notStartedCount}
          />
        </div>

        {/* Goals List Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#003F3A] font-dm-sans">
              Goals
            </h2>
            <button className="px-6 py-1 text-[16px] font-regular text-[#003F3A] hover:bg-gray-50 rounded-lg border border-[#D5DCEB] transition-colors font-rubik">
              Filter
            </button>
          </div>

          <div className="px-8">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center gap-3 text-gray-500">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-[15px] font-rubik">
                    Loading goals...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-red-500 text-[15px] font-rubik mb-4">
                  {error}
                </p>
                <button
                  onClick={loadGoals}
                  className="px-5 py-2 text-[14px] font-rubik border border-[#D5DCEB] text-[#333333] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : goals.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500 text-[15px] font-rubik mb-2">
                  No mentee goals yet
                </p>
                <p className="text-gray-400 text-[13px] font-rubik">
                  Goals will appear here once mentees create them.
                </p>
              </div>
            ) : (
              goals.map((goal) => (
                <GoalItem key={goal.id} goal={goal} role="MENTOR" />
              ))
            )}
          </div>
        </div>

        <GoalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          onChange={handleInputChange}
          onSave={handleSaveGoal}
          errors={error ? { general: [error] } : {}}
          categories={categories}
        />
      </div>
    </div>
  );
}
