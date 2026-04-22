"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Goal } from "@/types";
import StatsCard from "@/components/dashboard/goals/StatsCard";
import GoalItem from "@/components/dashboard/goals/GoalItem";
import GoalForm from "@/components/dashboard/goals/GoalForm";

// Mock data - Backend developer can replace this with API fetch
const mockGoals: Goal[] = [
  {
    id: "1",
    userId: "user-1",
    title: "Improve public speaking skills",
    description: "Practice and deliver presentations to build confidence",
    category: "Career",
    targetDate: "2025-03-15",
    status: "IN_PROGRESS",
    progress: 63,
  },
  {
    id: "2",
    userId: "user-1",
    title: "Improve public speaking skills",
    description: "Join Toastmasters and practice weekly",
    category: "Career",
    targetDate: "2025-03-20",
    status: "IN_PROGRESS",
    progress: 25,
  },
  {
    id: "3",
    userId: "user-1",
    title: "Improve public speaking skills",
    description: "Complete advanced public speaking course",
    category: "Career",
    targetDate: "2025-03-10",
    status: "COMPLETED",
    progress: 100,
  },
  {
    id: "4",
    userId: "user-1",
    title: "Improve public speaking skills",
    description: "Attend networking events and practice introductions",
    category: "Career",
    targetDate: "2025-03-25",
    status: "NOT_STARTED",
    progress: 0,
  },
  {
    id: "5",
    userId: "user-1",
    title: "Improve public speaking skills",
    description: "Record and review practice sessions",
    category: "Career",
    targetDate: "2025-03-30",
    status: "NOT_STARTED",
    progress: 0,
  },
];

export default function MenteeGoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    targetDate: "",
    description: "",
  });

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

  const handleSaveGoal = () => {
    console.log("Goal saved:", formData);
    setIsModalOpen(false);
  };

  // Calculate stats
  const totalGoals = mockGoals.length;
  const inProgressCount = mockGoals.filter(
    (g) => g.status === "IN_PROGRESS",
  ).length;
  const completedCount = mockGoals.filter(
    (g) => g.status === "COMPLETED",
  ).length;
  const notStartedCount = mockGoals.filter(
    (g) => g.status === "NOT_STARTED",
  ).length;

  return (
    <div className="min-h-screen  ">
      <div className=" space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-[#003F3A] mb-2 font-dm-sans">
              My Goals
            </h1>
            <p className="text-[#003F3A] font-rubik text-[16px] font-regular">
              Track your personal and professional development goals
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#333333] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#222222] transition-colors shadow-sm font-rubik text-[14px] font-regular"
          >
            + Create New Goal
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard label="Total Goals" value={totalGoals} />
          <StatsCard label="In Progress" value={inProgressCount} />
          <StatsCard label="Completed" value={completedCount} />
          <StatsCard label="Not Started" value={notStartedCount} />
        </div>

        {/* Goals List Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm ">
          {/* List Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#003F3A] font-dm-sans">
              Goals
            </h2>
            <button className="px-6 py-1 text-[16px] font-regular text-[#003F3A] hover:bg-gray-50 rounded-lg border border-[#D5DCEB] transition-colors font-rubik ">
              Filter
            </button>
          </div>

          {/* Goals List */}
          <div className="px-8">
            {mockGoals.map((goal) => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        <GoalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          onChange={handleInputChange}
          onSave={handleSaveGoal}
        />
      </div>
    </div>
  );
}
