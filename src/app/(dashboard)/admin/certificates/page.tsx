"use client";

import { useState, useEffect, useRef } from "react";
import {
  Award,
  X,
  Check,
  Download,
  Calendar,
  Mail,
  MapPin,
  Clock,
  Trophy,
  Sparkles,
  FileCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchAdminCertificates,
  certificateTitle,
  certificateStatus,
  issueCertificate,
} from "@/lib/services/certificates";
import { fetchAdminUsers } from "@/lib/services/admin";
import { ApiState, FormError, formatDate } from "@/components/shared/ApiUI";
import { fetchMentee } from "@/lib/services/users";
import { fetchReflections } from "@/lib/services/reflections";
import { errorMessage } from "@/lib/api";

export interface CertificateRecord {
  id: string | number;
  name: string;
  certificate: string;
  status: "Pending" | "Issued" | "Not Eligible" | "Unknown";
  userId?: string;
  date: string;
  cohort?: string;
  certificateId?: string;
  notes?: string;
  email?: string;
  location?: string;
  lastSession?: string;
  avatarUrl?: string;
}

export interface RecipientOption {
  id: string | number;
  name: string;
  email?: string;
  cohort: string;
  activity: string;
  eligibility: "Eligible" | "Not Eligible" | "Review Needed";
  selected: boolean;
}

export interface RecentlyIssuedRecord {
  id: string | number;
  recipient: string;
  certificate: string;
  issued: string;
  status: "Pending" | "Delivered";
}

export default function AdminCertificatesPage() {
  const [mounted, setMounted] = useState(false);
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false);

  // View mode: "list" (main status table), "profile" (mentee detailed profile), "issue" (full issue certificate page)
  const [viewMode, setViewMode] = useState<"list" | "profile" | "issue">(
    "list",
  );

  // Mentee profile detailed view state
  const [selectedMentee, setSelectedMentee] =
    useState<CertificateRecord | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "Overview" | "Goals" | "Sessions" | "Reflections" | "Certificates"
  >("Overview");

  // Main table certificate records
  const { token } = useAuth();
  const resource = useApiResource("admin-certificates", fetchAdminCertificates);
  const accounts = useApiResource("certificate-recipients", (auth) =>
    fetchAdminUsers(auth, { role: "mentee" }),
  );
  const participant = useApiResource(
    `certificate-participant:${selectedMentee?.userId}`,
    (auth) => fetchMentee(auth, selectedMentee!.userId!),
    viewMode === "profile" && Boolean(selectedMentee?.userId),
  );
  const reflections = useApiResource(
    `certificate-reflections:${selectedMentee?.userId}`,
    (auth) => fetchReflections(auth, selectedMentee!.userId!),
    viewMode === "profile" && Boolean(selectedMentee?.userId),
  );
  const [issuing, setIssuing] = useState(false);
  const issueLock = useRef(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedRecipients, setIssuedRecipients] = useState<string[]>([]);
  const records: CertificateRecord[] = (resource.data?.items || []).map(
    (item) => {
      const state = certificateStatus(item);
      return {
        id: item.id,
        userId:
          item.mentee?.id || item.user?.id || item.user_id || item.mentee_id,
        name: item.mentee?.name || item.user?.name || "—",
        certificate: certificateTitle(item),
        status: ["issued", "earned", "completed"].includes(state)
          ? "Issued"
          : [
                "pending",
                "requested",
                "in_progress",
                "pending_endorsement",
              ].includes(state)
            ? "Pending"
            : state === "not_eligible"
              ? "Not Eligible"
              : "Unknown",
        date: formatDate(item.issued_at || item.issue_date),
        cohort: item.cohort?.name,
        email: item.mentee?.email || item.user?.email,
        certificateId: item.reference || item.certificate_number,
        notes: item.description || item.dedication,
      };
    },
  );

  // =========================================================================
  // ISSUE CERTIFICATE PAGE FORM STATE
  // =========================================================================
  const [selectedTemplate, setSelectedTemplate] = useState("Year Milestone");
  const templates = [
    {
      id: "Year Milestone",
      title: "Year Milestone",
      desc: "Marks the completion of a year on the path.",
    },
    {
      id: "Leadership Excellence",
      title: "Leadership Excellence",
      desc: "For those who carried others while walking.",
    },
    {
      id: "Community Impact",
      title: "Community Impact",
      desc: "For work that reached beyond the program.",
    },
    {
      id: "Decade Completion",
      title: "Decade Completion",
      desc: "The final certificate of the ten-year journey.",
    },
  ];

  const [recipients, setRecipients] = useState<RecipientOption[]>([]);

  useEffect(() => {
    if (accounts.data)
      setRecipients((previous) =>
        accounts.data!.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cohort: user.cohorts?.map((c) => c.name).join(", ") || "—",
          activity: "—",
          eligibility: "Review Needed",
          selected: previous.some(
            (item) => item.id === user.id && item.selected,
          ),
        })),
      );
  }, [accounts.data]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("All");

  const [certTitle, setCertTitle] = useState("Year 3 Completion");

  // Interactive calendar date state
  const [issueDate, setIssueDate] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(8); // September (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(20);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [dedication, setDedication] = useState("");
  const [signatory, setSignatory] = useState(
    "Pamela Achebe · Program Director",
  );
  const [notifyByEmail, setNotifyByEmail] = useState(false);

  const [recentlyIssued, setRecentlyIssued] = useState<RecentlyIssuedRecord[]>(
    [],
  );

  const displayedRecentlyIssued: RecentlyIssuedRecord[] = [
    ...recentlyIssued,
    ...records
      .filter(
        (r) =>
          (r.status === "Issued" || r.status === "Pending") &&
          !recentlyIssued.some((ri) => String(ri.id) === String(r.id)),
      )
      .map((r) => ({
        id: r.id,
        recipient: r.name,
        certificate: r.certificate,
        issued: r.date,
        status: (r.status === "Issued" ? "Delivered" : "Pending") as
          | "Pending"
          | "Delivered",
      })),
  ];

  const [issueToast, setIssueToast] = useState<string | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync viewMode changes with header and persistent session
  useEffect(() => {
    const isDetail = viewMode !== "list";
    if (typeof window !== "undefined") {
      if (viewMode === "issue") {
        sessionStorage.setItem("admin_cert_view", "issue");
      } else if (viewMode === "profile") {
        sessionStorage.setItem("admin_cert_view", "profile");
      } else {
        sessionStorage.removeItem("admin_cert_view");
      }
    }
    window.dispatchEvent(
      new CustomEvent("admin-certificate-view-change", {
        detail: {
          isDetail,
          isIssuePage: viewMode === "issue",
          selectedCertUser: selectedMentee,
        },
      }),
    );
  }, [viewMode, selectedMentee]);

  // Click outside to dismiss calendar popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Listen to header action button event and back button event
  useEffect(() => {
    const handleOpenIssue = () => {
      setIssuedRecipients([]);
      setIssueError(null);
      setIssueToast(null);
      setSelectedMentee(null);
      setViewMode("issue");
    };

    const handleBackToCertificates = () => {
      setSelectedMentee(null);
      setViewMode("list");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("admin_cert_view");
      }
    };

    window.addEventListener("open-issue-certificate-modal", handleOpenIssue);
    window.addEventListener("admin-certificate-back", handleBackToCertificates);

    return () => {
      window.removeEventListener(
        "open-issue-certificate-modal",
        handleOpenIssue,
      );
      window.removeEventListener(
        "admin-certificate-back",
        handleBackToCertificates,
      );
    };
  }, []);

  // Open Detailed Mentee Profile
  const handleOpenMenteeProfile = (cert: CertificateRecord) => {
    setSelectedMentee(cert);
    setViewMode("profile");
    setActiveProfileTab("Overview");
  };

  // Toggle recipient selection
  const handleToggleRecipient = (id: string | number) => {
    if (issuing || issuedRecipients.length) return;
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  const handleSelectAllRecipients = () => {
    if (issuing || issuedRecipients.length) return;
    const allSelected = recipients.every((r) => r.selected);
    setRecipients((prev) =>
      prev.map((r) => ({ ...r, selected: !allSelected })),
    );
  };

  const selectedRecipientCount = recipients.filter((r) => r.selected).length;
  const primarySelectedRecipient =
    recipients.find((r) => r.selected) || recipients[0];

  // Calendar handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setIssueDate(`${day}/${calendarMonth + 1}/${calendarYear}`);
    setIsCalendarOpen(false);
  };

  const daysInCurrentMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0,
  ).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  // Action: Issue Certificate from Step 4 Preview
  const handleExecuteIssueCertificate = async () => {
    if (!token || issueLock.current) return;
    const selected = recipients.filter((recipient) => recipient.selected);
    if (!selected.length || !certTitle.trim()) {
      setIssueError(
        "Select at least one recipient and enter a certificate title.",
      );
      return;
    }
    issueLock.current = true;
    setIssuing(true);
    setIssueError(null);
    setIssueToast(null);
    const completed = [...issuedRecipients];
    let count = 0;
    try {
      for (const recipient of selected) {
        const id = String(recipient.id);
        if (completed.includes(id)) continue;
        const saved = await issueCertificate(token, {
          user_id: id,
          title: certTitle.trim(),
          issue_date: issueDate.trim() || undefined,
          dedication: dedication.trim() || undefined,
          signatory: signatory.trim() || undefined,
          notify_by_email: notifyByEmail,
        });
        completed.push(id);
        setIssuedRecipients([...completed]);
        count++;

        // Dispatch certificate notification email if requested and recipient has an email address
        if (notifyByEmail && recipient.email && token) {
          fetch("/api/certificates/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: recipient.email,
              menteeName: recipient.name,
              certificateTitle: certTitle.trim(),
              certificateId: saved.id,
            }),
          }).catch((err) => console.warn("Failed to dispatch certificate email:", err));
        }

        setRecentlyIssued((previous) => [
          ...previous,
          {
            id: saved.id,
            recipient: recipient.name,
            certificate: certificateTitle(saved),
            issued: formatDate(saved.issued_at || saved.issue_date),
            status: "Pending",
          },
        ]);
      }
      setIssueToast(`${count} certificate${count === 1 ? "" : "s"} issued.`);
    } catch (error) {
      setIssueError(
        `${completed.length ? `${completed.length} recipient(s) already completed. ` : ""}${errorMessage(error)}`,
      );
    } finally {
      issueLock.current = false;
      setIssuing(false);
      resource.reload();
    }
  };

  // Dynamic stats for main table view
  const issuedCount = records.filter((r) => r.status === "Issued").length;
  const pendingCount = records.filter((r) => r.status === "Pending").length;
  const notEligibleCount = records.filter(
    (r) => r.status === "Not Eligible",
  ).length;

  // =========================================================================
  // VIEW: ISSUE CERTIFICATE PAGE (FULL AVAILABLE WIDTH, NO BOLD HEADINGS, INTERACTIVE CALENDAR)
  // =========================================================================
  if (viewMode === "issue") {
    return (
      <div className="w-full max-w-full pb-14 space-y-7 font-sans animate-in fade-in duration-200">
        <ApiState {...resource} onRetry={resource.reload} />
        <ApiState {...accounts} onRetry={accounts.reload} />
        <FormError message={issueError} />
        {/* Toast confirmation */}
        {issueToast && (
          <div className="fixed top-6 right-6 z-[999999] bg-[#111928] text-white px-5 py-3 rounded-[10px] text-[13.5px] font-medium shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-3">
            <Check className="w-4 h-4 text-[#609974]" />
            <span>{issueToast}</span>
          </div>
        )}

        {/* Page Heading & Subtitle - softened font weights */}
        <div>
          <h1 className="text-[20px] md:text-[22px] font-medium text-[#111928] font-sans tracking-tight">
            Mark a moment on the path
          </h1>
          <p className="text-[13px] md:text-[13.5px] font-normal text-[#6B7280] font-sans mt-1">
            Certificates are issued sparingly. They anchor a decade in something
            you can hold.
          </p>
        </div>

        {/* STEP 1: Choose a template */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EBF2EB] text-[#486B52] text-[11px] font-medium flex items-center justify-center shrink-0">
              1
            </span>
            <h2 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
              Choose a template
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    if (issuing || issuedRecipients.length) return;
                    setSelectedTemplate(tpl.id);
                    setCertTitle(
                      tpl.id === "Year Milestone"
                        ? "Year 3 Completion"
                        : tpl.title,
                    );
                  }}
                  className={`rounded-[14px] p-5 relative cursor-pointer transition-all ${
                    isSelected
                      ? "border-2 border-[#DB911E] bg-white shadow-sm"
                      : "border border-[#E5E7EB] hover:border-gray-300 bg-white"
                  }`}
                >
                  {/* Selected check circle */}
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#DB911E] text-white flex items-center justify-center text-[10px] absolute top-4 right-4">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Icon */}
                  <Award
                    className={`w-5 h-5 ${isSelected ? "text-[#DB911E]" : "text-gray-400"}`}
                    strokeWidth={1.8}
                  />

                  {/* Title & Desc */}
                  <h3 className="text-[13.5px] font-medium text-[#111928] font-sans mt-3.5">
                    {tpl.title}
                  </h3>
                  <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-1 leading-relaxed">
                    {tpl.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEPS 2 & 3: Two-Column Row (Select recipients & Certificate details) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
          {/* STEP 2: Select recipients */}
          <div className="flex flex-col h-full space-y-3 w-full">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBF2EB] text-[#486B52] text-[11px] font-medium flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
                Select recipients
              </h2>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between w-full">
              <div>
                {/* Search & Filter Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="Search participants..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-[12.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#DB911E]"
                    />
                  </div>

                  <button
                    type="button"
                    className="border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[12px] text-gray-700 bg-white flex items-center gap-1 hover:bg-gray-50 transition-colors"
                  >
                    <span>All</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllRecipients}
                    className="border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[12px] text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Select All
                  </button>
                </div>

                {/* Recipient Rows */}
                <div className="divide-y divide-[#F3F4F6]">
                  {recipients
                    .filter((r) =>
                      r.name
                        .toLowerCase()
                        .includes(recipientSearch.toLowerCase()),
                    )
                    .map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleToggleRecipient(r.id)}
                        className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 px-1 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Circular Checkbox */}
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              r.selected
                                ? "bg-[#5E9472] text-white"
                                : "border border-gray-300 bg-white"
                            }`}
                          >
                            {r.selected && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </div>

                          <div>
                            <p className="text-[13.5px] font-medium text-[#111928] font-sans">
                              {r.name}
                            </p>
                            <p className="text-[12px] font-normal text-[#6B7280] font-sans">
                              Cohort {r.cohort} · {r.activity}
                            </p>
                          </div>
                        </div>

                        {/* Eligibility Badge */}
                        <div>
                          {r.eligibility === "Eligible" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF3ED] text-[#486B52]">
                              Eligible
                            </span>
                          )}
                          {r.eligibility === "Not Eligible" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#6B7280]">
                              Not Eligible
                            </span>
                          )}
                          {r.eligibility === "Review Needed" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF3EA] text-[#9A6D29]">
                              Review Needed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottom selection counter */}
              <div className="pt-3 border-t border-[#F3F4F6] mt-4 flex items-center gap-1.5 text-[12.5px] font-normal text-[#6B7280]">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span>{selectedRecipientCount} selected</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Certificate details */}
          <div className="flex flex-col h-full space-y-3 w-full">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBF2EB] text-[#486B52] text-[11px] font-medium flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
                Certificate details
              </h2>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between space-y-4 w-full">
              <div className="space-y-3.5">
                {/* Certificate Title */}
                <div>
                  <label
                    htmlFor="field-ppdashboardadmincertificatespagetsx-1"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Certificate Title
                  </label>
                  <input
                    id="field-ppdashboardadmincertificatespagetsx-1"
                    type="text"
                    disabled={issuing || issuedRecipients.length > 0}
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 text-[13.5px] text-[#111928] font-sans focus:outline-none focus:border-[#DB911E]"
                  />
                </div>

                {/* Issue Date with Interactive Clickable Calendar */}
                <div className="relative" ref={calendarRef}>
                  <label
                    htmlFor="field-ppdashboardadmincertificatespagetsx-2"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Issue Date
                  </label>
                  <div
                    onClick={() => setIsCalendarOpen((prev) => !prev)}
                    className="relative cursor-pointer"
                  >
                    <input
                      id="field-ppdashboardadmincertificatespagetsx-2"
                      type="text"
                      readOnly
                      placeholder="Select issue date"
                      value={issueDate}
                      className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 pr-9 text-[13.5px] text-[#111928] font-sans cursor-pointer focus:outline-none focus:border-[#DB911E]"
                    />
                    <button
                      type="button"
                      aria-label="Toggle calendar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCalendarOpen((prev) => !prev);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Interactive Calendar Dropdown Popover */}
                  {isCalendarOpen && (
                    <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-[#E5E7EB] rounded-[14px] p-4 shadow-xl w-[280px] font-sans animate-in fade-in zoom-in-95 duration-150">
                      {/* Month & Year Navigation Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[13px] font-medium text-[#111928]">
                          {monthNames[calendarMonth]} {calendarYear}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Day of Week Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-medium text-[#9CA3AF] mb-1">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                          <div key={`empty-${i}`} className="w-7 h-7" />
                        ))}
                        {Array.from({ length: daysInCurrentMonth }).map(
                          (_, i) => {
                            const dayNum = i + 1;
                            const isDaySelected = dayNum === selectedDay;
                            return (
                              <button
                                key={dayNum}
                                type="button"
                                onClick={() => handleDaySelect(dayNum)}
                                className={`w-7 h-7 text-[12px] rounded-full flex items-center justify-center font-sans transition-colors cursor-pointer ${
                                  isDaySelected
                                    ? "bg-[#DB911E] text-white font-medium shadow-sm"
                                    : "text-[#374151] hover:bg-[#FAF3EA] hover:text-[#9A6D29]"
                                }`}
                              >
                                {dayNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      {/* Calendar Footer Actions */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-[11.5px]">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setCalendarMonth(now.getMonth());
                            setCalendarYear(now.getFullYear());
                            handleDaySelect(now.getDate());
                          }}
                          className="text-[#DB911E] hover:text-[#BA7815] font-medium transition-colors"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(false)}
                          className="text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dedication */}
                <div>
                  <label
                    htmlFor="field-ppdashboardadmincertificatespagetsx-3"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Dedication
                  </label>
                  <textarea
                    id="field-ppdashboardadmincertificatespagetsx-3"
                    rows={2}
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="Enter dedication message..."
                    className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] p-2.5 text-[13px] text-[#111928] font-sans focus:outline-none focus:border-[#DB911E] resize-none"
                  />
                </div>

                {/* Signatory */}
                <div>
                  <label
                    htmlFor="field-ppdashboardadmincertificatespagetsx-4"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Signatory
                  </label>
                  <div className="relative">
                    <select
                      id="field-ppdashboardadmincertificatespagetsx-4"
                      value={signatory}
                      onChange={(e) => setSignatory(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 pr-9 text-[13px] text-[#111928] font-sans appearance-none focus:outline-none focus:border-[#DB911E]"
                    >
                      <option value="Pamela Achebe · Program Director">
                        Pamela Achebe · Program Director
                      </option>
                      <option value="Israel Ayiku · Executive Lead">
                        Israel Ayiku · Executive Lead
                      </option>
                      <option value="Board of Directors">
                        Board of Directors
                      </option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Criteria checked box */}
                <div className="bg-[#FAF9F6]/80 border border-[#E5E7EB] rounded-[12px] p-4 space-y-2">
                  <h4 className="text-[12px] font-medium text-[#111928] font-sans">
                    Criteria checked
                  </h4>
                  <div className="flex items-center gap-2 text-[12px] font-normal text-[#4B5563]">
                    <Check className="w-3.5 h-3.5 text-[#486B52] stroke-[2.5]" />
                    <span>12+ sessions attended</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-normal text-[#4B5563]">
                    <Check className="w-3.5 h-3.5 text-[#486B52] stroke-[2.5]" />
                    <span>8+ reflections submitted</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-normal text-[#4B5563]">
                    <Check className="w-3.5 h-3.5 text-[#486B52] stroke-[2.5]" />
                    <span>Year goals reviewed with mentor</span>
                  </div>
                </div>
              </div>

              {/* Notify recipients by email switch toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                <div>
                  <p className="text-[13px] font-normal text-[#111928] font-sans">
                    Notify recipients by email
                  </p>
                  <p className="text-[11.5px] font-normal text-[#6B7280] font-sans">
                    Sends a link to download the PDF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyByEmail(!notifyByEmail)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    notifyByEmail ? "bg-[#DB911E]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifyByEmail ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: Preview */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EBF2EB] text-[#486B52] text-[11px] font-medium flex items-center justify-center shrink-0">
              4
            </span>
            <h2 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
              Preview
            </h2>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 w-full">
            {/* The Certificate Preview Canvas */}
            <div className="bg-[#FAF9F6] border border-[#EBE7DF] rounded-[14px] p-8 sm:p-14 text-center relative max-w-3xl mx-auto shadow-inner">
              {/* Ribbon Icon */}
              <div className="flex justify-center mb-3">
                <Award className="w-9 h-9 text-[#609974]" strokeWidth={1.7} />
              </div>

              {/* Program header */}
              <p className="text-[13px] font-normal text-[#6B7280] font-sans tracking-wide">
                Vision2535
              </p>

              {/* Certificate of Year 3 Completion */}
              <h3 className="text-[20px] sm:text-[23px] font-medium text-[#111928] font-sans mt-2">
                Certificate of {certTitle}
              </h3>

              {/* Awarded to */}
              <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-5">
                Awarded to
              </p>

              {/* Recipient Name */}
              <h4 className="text-[17px] sm:text-[19px] font-medium text-[#111928] font-sans mt-1">
                {primarySelectedRecipient
                  ? primarySelectedRecipient.name
                  : "Select a recipient"}
              </h4>

              {/* Dedication Quote */}
              <p className="text-[13px] sm:text-[13.5px] font-normal text-[#4B5563] italic mt-3 max-w-lg mx-auto font-serif leading-relaxed">
                "{dedication}"
              </p>

              {/* Signatory & Date Footer */}
              <div className="mt-10 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] font-normal text-[#4B5563] px-2 font-sans">
                <span>{signatory}</span>
                <span>
                  {selectedDay} {monthNames[calendarMonth]} {calendarYear}
                </span>
              </div>
            </div>

            {/* Action Buttons on the bottom right */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "admin_certificate_draft",
                      JSON.stringify({
                        selectedTemplate,
                        certTitle,
                        issueDate,
                        dedication,
                        signatory,
                        notifyByEmail,
                      }),
                    );
                  } catch {}
                  setIssueToast("Certificate draft saved.");
                }}
                className="border border-[#E5E7EB] hover:bg-gray-50 text-[#374151] px-4 py-2 rounded-[8px] text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors font-sans"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteIssueCertificate}
                disabled={
                  issuing || (issuedRecipients.length > 0 && !issueError)
                }
                className="bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white px-5 py-2 rounded-[8px] text-[13px] font-medium flex items-center gap-2 shadow-sm cursor-pointer transition-colors font-sans"
              >
                {issuing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{issuing ? "Issuing..." : "Issue Certificate"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 5: Recently issued */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EBF2EB] text-[#486B52] text-[11px] font-medium flex items-center justify-center shrink-0">
              5
            </span>
            <h2 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
              Recently issued
            </h2>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#F6F2EB] text-[12.5px] font-normal text-[#4B5563]">
                  <th className="py-3.5 px-6 font-normal font-sans">
                    Recipient
                  </th>
                  <th className="py-3.5 px-6 font-normal font-sans">
                    Certificate
                  </th>
                  <th className="py-3.5 px-6 font-normal font-sans">Issued</th>
                  <th className="py-3.5 px-6 font-normal font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[13.5px]">
                {displayedRecentlyIssued.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF9F6]/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-[#111928] font-normal font-sans">
                      {item.recipient}
                    </td>
                    <td className="py-4 px-6 text-[#374151] font-normal font-sans">
                      {item.certificate}
                    </td>
                    <td className="py-4 px-6 text-[#374151] font-normal font-sans">
                      {item.issued}
                    </td>
                    <td className="py-4 px-6">
                      {item.status === "Pending" ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF3EA] text-[#9A6D29]">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF3ED] text-[#486B52]">
                          Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DETAILED MENTEE PROFILE VIEW (WHEN ADMIN CLICKS "PROFILE")
  // =========================================================================
  if (viewMode === "profile" && selectedMentee) {
    return (
      <div className="w-full max-w-full pb-10 space-y-6 font-sans animate-in fade-in duration-200">
        <ApiState {...resource} onRetry={resource.reload} />
        <ApiState {...accounts} onRetry={accounts.reload} />
        <FormError message={issueError} />
        {/* Profile Header Hero Card */}
        <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Top Sage / Cream Gradient Banner */}
          <div className="h-[140px] md:h-[155px] bg-gradient-to-r from-[#EDE8D0] via-[#CDE0C9] to-[#6B9E78] w-full" />

          {/* Profile Info Area */}
          <div className="relative pt-[56px] px-6 sm:px-8 pb-7">
            {/* Avatar overlapping banner */}
            <div className="absolute -top-12 left-6 sm:left-8">
              <img
                src={selectedMentee.avatarUrl || "/icons/user-placeholder.svg"}
                alt={selectedMentee.name}
                className="w-[84px] h-[84px] rounded-full border-4 border-white object-cover bg-white shadow-sm"
              />
            </div>

            {/* Top row: Name, Cohort & Book Session button */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] md:text-[22px] font-medium text-[#111928] font-sans">
                  {selectedMentee.name}
                </h2>
                <p className="text-[13px] font-normal text-[#6B7280] font-sans mt-0.5">
                  {selectedMentee.cohort ||
                    participant.data?.user.cohorts
                      ?.map((c) => c.name)
                      .join(", ") ||
                    "—"}
                </p>
                <p className="text-[13.5px] md:text-[14px] font-normal text-[#374151] font-sans mt-3.5 max-w-2xl leading-relaxed">
                  {participant.data?.user.bio || selectedMentee.notes || ""}
                </p>
              </div>

              <button
                type="button"
                disabled={!selectedMentee.userId}
                onClick={() => setIsBookSessionOpen(true)}
                className="px-4 py-2 bg-[#DB911E] hover:bg-[#BA7815] text-white rounded-[8px] text-[13px] font-medium font-sans transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer self-start"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Session</span>
              </button>
            </div>

            {/* Meta details & Tag pills row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2 border-t border-[#F3F4F6]">
              <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-[12.5px] md:text-[13px] text-[#4B5563]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedMentee.email || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedMentee.location || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Last session {selectedMentee.lastSession || "—"}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {participant.data?.goals.map((goal) => (
                  <span
                    key={goal.id}
                    className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] rounded-full text-[11px] font-medium font-sans"
                  >
                    {goal.category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[24px] md:text-[26px] font-normal text-[#111928] leading-none mb-1.5 font-sans">
              {participant.data?.sessions.length ?? "—"}
            </div>
            <div className="text-[13px] font-normal text-[#6B7280] font-sans">
              Sessions
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[24px] md:text-[26px] font-normal text-[#111928] leading-none mb-1.5 font-sans">
              {reflections.data?.length ?? "—"}
            </div>
            <div className="text-[13px] font-normal text-[#6B7280] font-sans">
              Reflections
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[24px] md:text-[26px] font-normal text-[#111928] leading-none mb-1.5 font-sans">
              {participant.data
                ? `${participant.data.goals.filter((g) => ["completed", "done"].includes(g.status)).length}/${participant.data.goals.length}`
                : "—"}
            </div>
            <div className="text-[13px] font-normal text-[#6B7280] font-sans">
              Goals done
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[24px] md:text-[26px] font-normal text-[#111928] leading-none mb-1.5 font-sans">
              {
                records.filter(
                  (r) => r.userId && r.userId === selectedMentee.userId,
                ).length
              }
            </div>
            <div className="text-[13px] font-normal text-[#6B7280] font-sans">
              Certificates
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar (pill container) */}
        <div className="bg-white border border-[#E5E7EB] rounded-full p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-1.5 overflow-x-auto w-full">
          <button
            type="button"
            onClick={() => setActiveProfileTab("Overview")}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium font-sans transition-colors cursor-pointer shrink-0 ${
              activeProfileTab === "Overview"
                ? "bg-[#111928] text-white"
                : "text-[#6B7280] hover:text-[#111928]"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab("Goals")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium font-sans transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeProfileTab === "Goals"
                ? "bg-[#111928] text-white"
                : "text-[#6B7280] hover:text-[#111928]"
            }`}
          >
            <span>Goals</span>
            <span
              className={
                activeProfileTab === "Goals"
                  ? "text-white/70 text-[11px]"
                  : "text-[#9CA3AF] text-[11px]"
              }
            >
              {participant.data?.goals.length ?? "—"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab("Sessions")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium font-sans transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeProfileTab === "Sessions"
                ? "bg-[#111928] text-white"
                : "text-[#6B7280] hover:text-[#111928]"
            }`}
          >
            <span>Sessions</span>
            <span
              className={
                activeProfileTab === "Sessions"
                  ? "text-white/70 text-[11px]"
                  : "text-[#9CA3AF] text-[11px]"
              }
            >
              {participant.data?.sessions.length ?? "—"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab("Reflections")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium font-sans transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeProfileTab === "Reflections"
                ? "bg-[#111928] text-white"
                : "text-[#6B7280] hover:text-[#111928]"
            }`}
          >
            <span>Reflections</span>
            <span
              className={
                activeProfileTab === "Reflections"
                  ? "text-white/70 text-[11px]"
                  : "text-[#9CA3AF] text-[11px]"
              }
            >
              {reflections.data?.length ?? "—"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab("Certificates")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium font-sans transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeProfileTab === "Certificates"
                ? "bg-[#111928] text-white"
                : "text-[#6B7280] hover:text-[#111928]"
            }`}
          >
            <span>Certificates</span>
            <span
              className={
                activeProfileTab === "Certificates"
                  ? "text-white/70 text-[11px]"
                  : "text-[#9CA3AF] text-[11px]"
              }
            >
              {
                records.filter(
                  (r) => r.userId && r.userId === selectedMentee.userId,
                ).length
              }
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <ApiState {...participant} onRetry={participant.reload} />
        {activeProfileTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[16px] font-medium text-[#111928] mb-4">
                Goals
              </h3>
              <div className="space-y-4">
                {participant.data?.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="border border-[#E5E7EB] rounded-[12px] p-4"
                  >
                    <h4 className="text-sm font-medium">{goal.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {goal.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{goal.status}</p>
                  </div>
                ))}
                {participant.data && !participant.data.goals.length && (
                  <p className="text-sm text-gray-500">No goals found.</p>
                )}
              </div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[16px] font-medium text-[#111928] mb-4">
                Achievements
              </h3>
              {records
                .filter(
                  (r) =>
                    r.userId &&
                    r.userId === selectedMentee.userId &&
                    r.status === "Issued",
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="border border-[#E5E7EB] rounded-[12px] p-4 flex gap-3.5 mb-3"
                  >
                    <Trophy className="w-4 h-4 text-[#DB911E]" />
                    <div>
                      <h4 className="text-sm font-medium">{r.certificate}</h4>
                      <p className="text-xs text-gray-500 mt-1">{r.date}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {activeProfileTab === "Goals" && (
          <div className="space-y-3">
            {participant.data?.goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-medium">{goal.title}</h3>
                <p className="text-sm text-gray-500">{goal.description}</p>
              </div>
            ))}
          </div>
        )}
        {activeProfileTab === "Sessions" && (
          <div className="space-y-3">
            {participant.data?.sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-medium">{session.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(session.sessionDate)} · {session.status}
                </p>
              </div>
            ))}
          </div>
        )}
        {activeProfileTab === "Reflections" && (
          <>
            <ApiState {...reflections} onRetry={reflections.reload} />
            {reflections.data?.map((reflection) => (
              <div
                key={reflection.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <p className="text-sm text-gray-600">{reflection.content}</p>
              </div>
            ))}
          </>
        )}
        {activeProfileTab === "Certificates" && (
          <div className="space-y-3">
            {records
              .filter((r) => r.userId && r.userId === selectedMentee.userId)
              .map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <h3 className="font-medium">{r.certificate}</h3>
                  <p className="text-sm text-gray-500">
                    {r.status} · {r.date}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Book Session Modal */}
        <BookSessionModal
          isOpen={isBookSessionOpen}
          onClose={() => setIsBookSessionOpen(false)}
          title={`Book Session with ${selectedMentee.name}`}
          preselectedMentee={selectedMentee.userId}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN CERTIFICATES LIST VIEW (DEFAULT VIEW)
  // =========================================================================
  return (
    <div className="space-y-6 w-full max-w-full font-sans animate-in fade-in duration-200">
      <ApiState {...resource} onRetry={resource.reload} />
      {/* 3 Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 w-full">
        {/* Card 1: Issued */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
          <p className="text-[28px] md:text-[32px] font-normal text-[#111928] leading-none mb-2 font-sans">
            {issuedCount}
          </p>
          <p className="text-[13px] font-normal text-[#6B7280] font-sans">
            Issued
          </p>
        </div>

        {/* Card 2: Pending endorsement */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
          <p className="text-[28px] md:text-[32px] font-normal text-[#111928] leading-none mb-2 font-sans">
            {pendingCount}
          </p>
          <p className="text-[13px] font-normal text-[#6B7280] font-sans">
            Pending endorsement
          </p>
        </div>

        {/* Card 3: Not eligible */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
          <p className="text-[28px] md:text-[32px] font-normal text-[#111928] leading-none mb-2 font-sans">
            {notEligibleCount}
          </p>
          <p className="text-[13px] font-normal text-[#6B7280] font-sans">
            Not eligible
          </p>
        </div>
      </div>

      {/* Main Certificate Status Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        <h2 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans mb-5">
          Certificate Status
        </h2>

        {/* Mobile Certificate Cards (Below md) */}
        <div className="md:hidden space-y-3">
          {!resource.loading && !resource.error && records.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500 font-sans border border-gray-100 rounded-[12px]">
              No certificate records in the database yet.
            </div>
          )}
          {records.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleOpenMenteeProfile(cert)}
              className="border border-[#E5E7EB] rounded-[14px] p-4 bg-white space-y-2.5 active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#111928] font-sans truncate">
                    {cert.name}
                  </p>
                  <p className="text-[12.5px] text-[#374151] font-sans mt-0.5">
                    {cert.certificate}
                  </p>
                </div>
                <div className="shrink-0">
                  {cert.status === "Pending" && (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF3EA] text-[#9A6D29]">
                      Pending
                    </span>
                  )}
                  {cert.status === "Issued" && (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF3ED] text-[#486B52]">
                      Issued
                    </span>
                  )}
                  {cert.status === "Unknown" && (
                    <span className="text-xs text-gray-500">Unknown</span>
                  )}
                  {cert.status === "Not Eligible" && (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#6B7280]">
                      Not Eligible
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px] font-sans">
                <span className="text-gray-500">{cert.date}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMenteeProfile(cert);
                  }}
                  className="text-[#DB911E] hover:text-[#BA7815] font-medium cursor-pointer"
                >
                  Profile →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Container (md and up) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-[#F6F2EB] text-[12.5px] font-normal text-[#4B5563]">
                <th className="py-3 px-6 rounded-l-[8px] font-normal font-sans">
                  Name
                </th>
                <th className="py-3 px-6 font-normal font-sans">Certificate</th>
                <th className="py-3 px-6 font-normal font-sans">Status</th>
                <th className="py-3 px-6 font-normal font-sans">Date</th>
                <th className="py-3 px-6 rounded-r-[8px] font-normal font-sans">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[13.5px]">
              {!resource.loading && !resource.error && records.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500 font-sans"
                  >
                    No certificate records in the database yet.
                  </td>
                </tr>
              )}
              {records.map((cert) => (
                <tr
                  key={cert.id}
                  className="hover:bg-[#FAF9F6]/60 transition-colors"
                >
                  {/* Name */}
                  <td className="py-4 px-6 text-[#111928] font-medium font-sans">
                    {cert.name}
                  </td>

                  {/* Certificate */}
                  <td className="py-4 px-6 text-[#374151] font-normal font-sans">
                    {cert.certificate}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-6">
                    {cert.status === "Pending" && (
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11.5px] font-medium bg-[#FAF3EA] text-[#9A6D29]">
                        Pending
                      </span>
                    )}
                    {cert.status === "Issued" && (
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11.5px] font-medium bg-[#EEF3ED] text-[#486B52]">
                        Issued
                      </span>
                    )}
                    {cert.status === "Unknown" && (
                      <span className="text-xs text-gray-500">
                        Status not provided
                      </span>
                    )}
                    {cert.status === "Not Eligible" && (
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11.5px] font-medium bg-[#F3F4F6] text-[#6B7280]">
                        Not Eligible
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-[#374151] font-normal font-sans">
                    {cert.date}
                  </td>

                  {/* Action Link -> Opens detailed Profile view */}
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => handleOpenMenteeProfile(cert)}
                      className="text-[#DB911E] hover:text-[#BA7815] font-medium text-[13.5px] font-sans transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
