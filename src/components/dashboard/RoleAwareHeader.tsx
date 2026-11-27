"use client";

import { useState, useEffect } from "react";
import Link from "@/components/shared/AppLink";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  Menu,
  Users,
  Undo2,
  ArrowDownToLine,
  UserPlus,
  ArrowUpToLine,
  Award,
  Calendar,
} from "lucide-react";
import { UserRole } from "@/lib/auth";
import { ProgramsModal } from "@/components/dashboard/ProgramsModal";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { useAuthStore } from "@/store/useAuthStore";

interface RoleAwareHeaderProps {
  userRole: UserRole;
  title?: string;
  subtitle?: string;
  userInfo?: {
    firstName: string;
    lastName: string;
    subtitle: string;
  };
  onMenuClick?: () => void;
}

export function RoleAwareHeader({
  userRole,
  title,
  subtitle,
  onMenuClick,
}: RoleAwareHeaderProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isCohortDetail, setIsCohortDetail] = useState(false);
  const [isCertificateDetail, setIsCertificateDetail] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(false);
  const { user, activeProgram } = useAuthStore();

  useEffect(() => {
    const handleCohortView = (e: any) => {
      setIsCohortDetail(Boolean(e.detail?.selectedCohort));
    };
    const handleCohortBack = () => {
      setIsCohortDetail(false);
    };
    const handleCertView = (e: any) => {
      setIsCertificateDetail(
        Boolean(
          e.detail?.selectedCertUser ||
          e.detail?.isDetail ||
          e.detail?.isIssuePage,
        ),
      );
    };
    const handleCertBack = () => {
      setIsCertificateDetail(false);
    };
    const handleCalendarView = (e: any) => {
      setIsCalendarView(Boolean(e.detail?.isCalendarView));
    };
    const handleCalendarBack = () => {
      setIsCalendarView(false);
    };
    const handleOpenProgramsModal = () => {
      setIsProgramsOpen(true);
    };

    window.addEventListener("admin-cohort-view-change", handleCohortView);
    window.addEventListener("admin-cohort-back", handleCohortBack);
    window.addEventListener("admin-certificate-view-change", handleCertView);
    window.addEventListener("admin-certificate-back", handleCertBack);
    window.addEventListener("session-calendar-view-change", handleCalendarView);
    window.addEventListener("session-calendar-back", handleCalendarBack);
    window.addEventListener("open-programs-modal", handleOpenProgramsModal);

    return () => {
      window.removeEventListener("admin-cohort-view-change", handleCohortView);
      window.removeEventListener("admin-cohort-back", handleCohortBack);
      window.removeEventListener(
        "admin-certificate-view-change",
        handleCertView,
      );
      window.removeEventListener("admin-certificate-back", handleCertBack);
      window.removeEventListener(
        "session-calendar-view-change",
        handleCalendarView,
      );
      window.removeEventListener("session-calendar-back", handleCalendarBack);
      window.removeEventListener("open-programs-modal", handleOpenProgramsModal);
    };
  }, []);

  let displayTitle = title || "";
  let displaySubtitle = subtitle || "";
  let showNewGoalButton = false;
  let showBookSessionButton = false;

  if (pathname.endsWith("/dashboard")) {
    const activeProgShort = (activeProgram?.name || "Vision2535")
      .replace(/\s+program$/i, "")
      .trim();
    displayTitle =
      displayTitle ||
      (userRole === "ADMIN"
        ? `${activeProgShort} · ${new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
        : userRole === "MENTOR"
          ? "Mentor Space"
          : "Dashboard");
    displaySubtitle =
      displaySubtitle ||
      (userRole === "ADMIN"
        ? "Program overview"
        : userRole === "MENTEE"
          ? user?.journeyYear
            ? `Year ${user.journeyYear} of your ten-year journey.`
            : "Your mentorship journey."
          : "");
  } else if (pathname.endsWith("/goals")) {
    displayTitle = displayTitle || "Goals";
    displaySubtitle =
      displaySubtitle ||
      "Long-form ambitions and the quiet steps between them.";
    showNewGoalButton = userRole === "MENTEE";
  } else if (pathname.endsWith("/sessions")) {
    if (isCalendarView) {
      displayTitle = "Session Calendar";
      displaySubtitle = "";
    } else {
      displayTitle = displayTitle || "Sessions";
      displaySubtitle = displaySubtitle || "Conversations that shape the years";
    }
    showBookSessionButton = true;
  } else if (pathname.endsWith("/reflections")) {
    displayTitle = displayTitle || "Reflections";
    displaySubtitle =
      displaySubtitle ||
      (userRole === "MENTOR"
        ? "Read your mentees’ reflections."
        : "Reflect on your journey.");
  } else if (pathname.endsWith("/mentors")) {
    displayTitle = displayTitle || "Mentors";
    displaySubtitle = displaySubtitle || "The people walking with you";
  } else if (pathname.includes("/mentees/")) {
    displayTitle = displayTitle || "Mentee Profile";
    displaySubtitle = displaySubtitle || "";
  } else if (pathname.endsWith("/mentees")) {
    displayTitle = displayTitle || "All Mentees";
    displaySubtitle =
      displaySubtitle ||
      "View and track their progress, goals, and achievements.";
  } else if (pathname.endsWith("/leaderboard")) {
    displayTitle = displayTitle || "Who's topping the board";
    displaySubtitle = displaySubtitle || "Standing is earned slowly";
  } else if (pathname.endsWith("/certificates")) {
    if (userRole === "ADMIN") {
      if (isCertificateDetail) {
        displayTitle = "Certificates";
        displaySubtitle = "";
      } else {
        displayTitle = displayTitle || "Program certificates";
        displaySubtitle =
          displaySubtitle || "Monitor certificate progress across the program";
      }
    } else {
      displayTitle = displayTitle || "Certificates";
      displaySubtitle =
        displaySubtitle || "Every certificate is a quiet acknowledgement";
    }
  } else if (pathname.includes("/profile")) {
    displayTitle = displayTitle || "Your Profile details";
    displaySubtitle = displaySubtitle || "Small edits, kept private.";
  } else if (pathname.endsWith("/cohorts")) {
    if (isCohortDetail) {
      displayTitle = "All Cohorts";
      displaySubtitle = "";
    } else {
      displayTitle = displayTitle || "Cohorts";
      displaySubtitle = displaySubtitle || "Every cohort is a decade";
    }
  } else if (pathname.endsWith("/users")) {
    displayTitle = displayTitle || "Users";
    displaySubtitle = displaySubtitle || "Everyone in the program";
  } else if (pathname.endsWith("/reports")) {
    displayTitle = displayTitle || "Reports";
    displaySubtitle = displaySubtitle || "The shape of the program";
  } else if (pathname.endsWith("/settings")) {
    displayTitle = displayTitle || "Settings";
    displaySubtitle =
      displaySubtitle ||
      (userRole === "ADMIN"
        ? "Rules and rhythms for how the program runs."
        : "Manage your account settings.");
  } else if (pathname.includes("/notifications")) {
    displayTitle = displayTitle || "Notifications";
    displaySubtitle =
      displaySubtitle || "Stay up-to-date on the latest deals and activities";
  }

  return (
    <>
      <header className="flex min-h-[72px] sm:h-[88px] py-3 sm:py-0 items-center justify-between border border-gray-200 rounded-[16px] bg-white px-4 md:px-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] shrink-0 w-full gap-2">
        {/* Left Section - Title & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            {displayTitle && (
              <div className="flex items-center gap-2 sm:gap-2.5 mb-0.5 min-w-0">
                {pathname.includes("/mentees/") && (
                  <Link
                    href="/mentor/mentees"
                    className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Link>
                )}
                {pathname.endsWith("/cohorts") && isCohortDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCohortDetail(false);
                      window.dispatchEvent(
                        new CustomEvent("admin-cohort-back"),
                      );
                    }}
                    className="text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center pr-1 shrink-0"
                    aria-label="Back to all cohorts"
                  >
                    <Undo2 className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                )}
                {pathname.endsWith("/certificates") && isCertificateDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCertificateDetail(false);
                      window.dispatchEvent(
                        new CustomEvent("admin-certificate-back"),
                      );
                    }}
                    className="text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center pr-1 shrink-0"
                    aria-label="Back to certificates"
                  >
                    <Undo2 className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                )}
                {pathname.endsWith("/sessions") && isCalendarView && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendarView(false);
                      window.dispatchEvent(
                        new CustomEvent("session-calendar-back"),
                      );
                    }}
                    className="text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center pr-1 shrink-0"
                    aria-label="Back to sessions list"
                  >
                    <Undo2 className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                )}
                <h1 className="text-[16px] sm:text-[17px] md:text-[19px] font-medium text-gray-900 font-sans truncate">
                  {displayTitle}
                </h1>
              </div>
            )}
            {displaySubtitle && (
              <p className="text-[12px] md:text-[14.5px] text-gray-500 font-sans truncate hidden sm:block">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Programs (Desktop), Search, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-7 shrink-0">
          {/* Active Programs Tab - Desktop Only */}
          <button
            type="button"
            onClick={() => setIsProgramsOpen(true)}
            className="hidden lg:flex items-center gap-2 border-b-2 border-[#DB911E] pb-1.5 transition-colors group cursor-pointer shrink-0"
            title="Switch active program"
          >
            <span className="text-[14px] font-medium text-gray-800 font-sans group-hover:text-black truncate max-w-[200px]">
              {activeProgram?.name || "Vision2535 Program"}
            </span>
            <ChevronDown
              className="h-[14px] w-[14px] text-gray-600 group-hover:text-black shrink-0"
              strokeWidth={2.5}
            />
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-5 md:pl-2">
            <button
              className="text-gray-600 hover:text-black transition-colors"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-[20px] w-[20px]" strokeWidth={2} />
            </button>

            <Link
              href={`/${userRole.toLowerCase()}/notifications`}
              className={`transition-colors flex items-center justify-center ${
                pathname.includes("/notifications")
                  ? "text-[#DB911E]"
                  : "text-gray-600 hover:text-black"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-[20px] w-[20px]" strokeWidth={2} />
            </Link>

            {showNewGoalButton && (
              <button
                aria-label="New Goal"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-new-goal-modal"))
                }
                className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-[8px] text-[13px] md:text-[14px] font-medium flex items-center gap-2 transition-colors ml-1 md:ml-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />{" "}
                <span className="hidden md:inline">New Goal</span>
              </button>
            )}

            {showBookSessionButton && (
              <button
                aria-label="Book Session"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-book-session-modal"),
                  )
                }
                className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-[8px] text-[13px] md:text-[14px] font-medium flex items-center gap-2 transition-colors ml-1 md:ml-2 shadow-sm cursor-pointer"
              >
                <img
                  src="/icons/book-session.svg"
                  alt=""
                  className="h-[14px] w-[15px] shrink-0"
                />{" "}
                <span className="hidden md:inline">Book Session</span>
              </button>
            )}

            {userRole === "ADMIN" && pathname.endsWith("/dashboard") && (
              <button
                aria-label="In-house Session"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-in-house-session-modal"),
                  )
                }
                className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-[8px] text-[13px] md:text-[14px] font-medium flex items-center gap-2 transition-colors ml-1 md:ml-2 shadow-sm"
              >
                <Users className="h-4 w-4" />{" "}
                <span className="hidden md:inline">In-house Session</span>
              </button>
            )}

            {userRole === "ADMIN" && pathname.endsWith("/users") && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 ml-1 md:ml-2">
                <button
                  type="button"
                  aria-label="Bulk Import"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("open-bulk-import-modal"),
                    )
                  }
                  className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-800 px-2.5 sm:px-3.5 py-2 md:py-2.5 rounded-[8px] text-[12.5px] md:text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm"
                >
                  <ArrowDownToLine className="w-4 h-4 text-gray-600 shrink-0" />
                  <span className="hidden md:inline">Bulk Import</span>
                </button>
                <button
                  type="button"
                  aria-label="Add User"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-add-user-modal"))
                  }
                  className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-2.5 sm:px-3.5 py-2 md:py-2.5 rounded-[8px] text-[12.5px] md:text-[13.5px] font-medium flex items-center gap-1.5 sm:gap-2 transition-colors font-sans shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Add User</span>
                </button>
              </div>
            )}

            {userRole === "ADMIN" &&
              pathname.endsWith("/certificates") &&
              !isCertificateDetail && (
                <div className="flex items-center gap-2 ml-1 md:ml-2">
                  <button
                    type="button"
                    aria-label="Issue Certificate"
                    onClick={() => {
                      setIsCertificateDetail(true);
                      window.dispatchEvent(
                        new CustomEvent("open-issue-certificate-modal"),
                      );
                    }}
                    className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-2.5 sm:px-3.5 py-2 md:py-2.5 rounded-[8px] text-[12.5px] md:text-[13.5px] font-medium flex items-center gap-1.5 sm:gap-2 transition-colors font-sans shadow-sm cursor-pointer"
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Issue Certificate</span>
                  </button>
                </div>
              )}

            {userRole === "ADMIN" &&
              (pathname.endsWith("/reports") ||
                pathname.endsWith("/settings")) && (
                <div className="flex items-center gap-2 ml-1 md:ml-2">
                  <button
                    type="button"
                    aria-label="Export CSV"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(
                          pathname.endsWith("/settings")
                            ? "export-settings-csv"
                            : "export-reports-csv",
                        ),
                      )
                    }
                    className="flex items-center gap-1.5 sm:gap-2 border border-[#E5E7EB] hover:bg-gray-50 text-[#111928] px-2.5 sm:px-3.5 py-2 md:py-2.5 rounded-[8px] text-[12.5px] md:text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm bg-white"
                  >
                    <ArrowUpToLine className="w-4 h-4 text-gray-700 shrink-0" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              )}
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <GlobalSearch role={userRole} onClose={() => setIsSearchOpen(false)} />
      )}
      {/* Programs Modal */}
      <ProgramsModal
        isOpen={isProgramsOpen}
        onClose={() => setIsProgramsOpen(false)}
      />
    </>
  );
}
