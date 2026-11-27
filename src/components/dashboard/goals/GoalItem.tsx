"use client";
import { useRouter } from "next/navigation";
import { Goal } from "@/types";

interface GoalItemProps {
  goal: Goal;
  role?: "MENTEE" | "MENTOR";
  onDelete?: (id: number) => void;
}

const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  IN_PROGRESS: {
    label: "In Progress",
    bgColor: "bg-[#FCEFC6]",
    textColor: "text-[#003F3A]",
    borderColor: "border-yellow-200",
  },
  in_progress: {
    label: "In Progress",
    bgColor: "bg-[#FCEFC6]",
    textColor: "text-[#003F3A]",
    borderColor: "border-yellow-200",
  },
  COMPLETED: {
    label: "Completed",
    bgColor: "bg-gray-800",
    textColor: "text-white",
    borderColor: "border-gray-800",
  },
  completed: {
    label: "Completed",
    bgColor: "bg-gray-800",
    textColor: "text-white",
    borderColor: "border-gray-800",
  },
  NOT_STARTED: {
    label: "Not Started",
    bgColor: "bg-[#F2F4F8]",
    textColor: "text-[#003F3A]",
    borderColor: "border-blue-100",
  },
  not_started: {
    label: "Not Started",
    bgColor: "bg-[#F2F4F8]",
    textColor: "text-[#003F3A]",
    borderColor: "border-blue-100",
  },
};

const defaultStatus = {
  label: "Unknown",
  bgColor: "bg-gray-100",
  textColor: "text-gray-600",
  borderColor: "border-gray-200",
};

export default function GoalItem({
  goal,
  role = "MENTEE",
  onDelete,
}: GoalItemProps) {
  const router = useRouter();
  const status = statusConfig[goal.status] || defaultStatus;

  // Format end date for display
  const formattedDate = goal.endDate
    ? new Date(goal.endDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "No date set";

  return (
    <div className="py-6 border-b border-gray-100 last:border-0 ">
      <div className="flex items-start justify-between gap-4 ">
        {/* Left Section: Title, Description, Meta */}
        <div className="flex-1 ">
          <div className="flex items-center gap-3 mb-1 ">
            <h3 className="text-base font-medium text-gray-900 font-dm-sans">
              {goal.title}
            </h3>
            <span
              className={`px-3 py-1 rounded-[4px] text-[11px] font-regular border font-rubik ${status.bgColor} ${status.textColor} ${status.borderColor}`}
            >
              {status.label}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-2 font-rubik">
            {goal.description}
          </p>

          <p className="text-sm text-gray-600 mb-3 font-rubik">
            {goal.category} • Due: {formattedDate}
          </p>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[120px]">
          {role === "MENTOR" ? (
            <>
              <button
                onClick={() =>
                  router.push(
                    `/mentor/mentees/${encodeURIComponent(goal.userId)}`,
                  )
                }
                className="w-full px-4 py-1.5 text-[12px] font-medium border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-rubik cursor-pointer"
              >
                View Details
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/mentor/mentees/${encodeURIComponent(goal.userId)}`,
                  )
                }
                className="w-full px-4 py-1.5 text-[12px] font-medium bg-[#333333] text-white rounded-lg hover:bg-[#222222] transition-colors font-rubik cursor-pointer"
              >
                Give Feedback
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 text-[12px] font-medium border border-[#D5DCEB] text-[#003F3A] rounded-lg hover:bg-gray-50 transition-colors font-rubik">
                  Edit Goal
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="px-3 py-1 text-[12px] font-medium border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-rubik"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
