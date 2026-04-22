import { Goal } from "@/types";

interface GoalItemProps {
  goal: Goal;
  role?: "MENTEE" | "MENTOR";
}

const statusConfig = {
  IN_PROGRESS: {
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
  NOT_STARTED: {
    label: "Not Started",
    bgColor: "bg-[#F2F4F8]",
    textColor: "text-[#003F3A]",
    borderColor: "border-blue-100",
  },
};

export default function GoalItem({ goal, role = "MENTEE" }: GoalItemProps) {
  const status = statusConfig[goal.status];
  const formattedDate = new Date(goal.targetDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="py-6 border-b border-gray-100 last:border-0 ">
      <div className="flex items-start justify-between gap-4 ">
        {/* Left Section: Title, Description, Meta, Progress */}
        <div className="flex-1 ">
          <div className="flex items-center gap-3 mb-1 ">
            <h3 className="text-base font-semibold text-gray-900 font-dm-sans">
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

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gray-800 h-full rounded-full transition-all duration-300"
                style={
                  {
                    "--progress-width": `${goal.progress}%`,
                    width: "var(--progress-width)",
                  } as React.CSSProperties
                }
              />
            </div>
            <span className="text-xs font-medium text-gray-700 min-w-[40px] text-right font-rubik">
              {goal.progress}%
            </span>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[120px]">
          {role === "MENTOR" ? (
            <>
              <button className="w-full px-4 py-1.5 text-[12px] font-medium border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-rubik">
                View Details
              </button>
              <button className="w-full px-4 py-1.5 text-[12px] font-medium bg-[#333333] text-white rounded-lg hover:bg-[#222222] transition-colors font-rubik">
                Give Feedback
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-end">
                <button className="px-3 py-1 text-[12px] font-medium border border-[#D5DCEB] text-[#003F3A] rounded-lg hover:bg-gray-50 transition-colors font-rubik">
                  Edit Goal
                </button>
              </div>
              <button className="px-4 py-2 text-[12px] font-medium bg-[#F2F4F8] text-[#003F3A] rounded-lg hover:bg-[#E8ECF3] transition-colors font-rubik">
                Update Progress
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
