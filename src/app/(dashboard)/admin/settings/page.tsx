"use client";

import { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/services/programs";
import { updateAdminPreferences } from "@/lib/services/admin";
import { ApiState, safeWebUrl } from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";
import { GoalCategoryManager } from "@/components/dashboard/admin/GoalCategoryManager";

interface ProgramItem {
  id: string | number;
  name: string;
  link: string;
  status: string;
}

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const resource = useApiResource("settings-programs", fetchPrograms);
  const [busy, setBusy] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<
    string | number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const unavailable = () =>
    setError("This setting is not available yet. No changes were saved.");
  // Programs State from live API
  const programs = (resource.data || []).map((program) => ({
    id: program.id,
    name: program.name,
    link: program.applicationUrl || "—",
    status: program.status || "—",
  }));

  // Form State for Add a program
  const [newProgramName, setNewProgramName] = useState("");
  const [newApplicationLink, setNewApplicationLink] = useState("");
  const [newStatus, setNewStatus] = useState("Coming Soon");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preferences Toggles matching mockup precisely (Email digest: ON, Public profiles: OFF, Auto-match: ON)
  const [emailDigest, setEmailDigest] = useState(true);
  const [publicProfiles, setPublicProfiles] = useState(false);
  const [autoMatch, setAutoMatch] = useState(true);

  useEffect(() => {
    try {
      const ed = localStorage.getItem("admin_pref_email_digest");
      if (ed !== null) setEmailDigest(ed === "true");
      const pp = localStorage.getItem("admin_pref_public_profiles");
      if (pp !== null) setPublicProfiles(pp === "true");
      const am = localStorage.getItem("admin_pref_auto_match");
      if (am !== null) setAutoMatch(am === "true");
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleEmailDigest = async () => {
    if (!token) return;
    const prev = emailDigest;
    const next = !emailDigest;
    setEmailDigest(next);
    setError(null);
    try {
      await updateAdminPreferences(token, {
        email_digest: next,
        public_participant_profiles: publicProfiles,
        auto_match: autoMatch,
      });
      try {
        localStorage.setItem("admin_pref_email_digest", String(next));
      } catch {}
      setToastMessage(`Email digest ${next ? "enabled" : "disabled"}.`);
    } catch (err) {
      setEmailDigest(prev);
      setError(errorMessage(err));
    }
  };

  const togglePublicProfiles = async () => {
    if (!token) return;
    const prev = publicProfiles;
    const next = !publicProfiles;
    setPublicProfiles(next);
    setError(null);
    try {
      await updateAdminPreferences(token, {
        email_digest: emailDigest,
        public_participant_profiles: next,
        auto_match: autoMatch,
      });
      try {
        localStorage.setItem("admin_pref_public_profiles", String(next));
      } catch {}
      setToastMessage(
        `Public participant profiles ${next ? "enabled" : "disabled"}.`,
      );
    } catch (err) {
      setPublicProfiles(prev);
      setError(errorMessage(err));
    }
  };

  const toggleAutoMatch = async () => {
    if (!token) return;
    const prev = autoMatch;
    const next = !autoMatch;
    setAutoMatch(next);
    setError(null);
    try {
      await updateAdminPreferences(token, {
        email_digest: emailDigest,
        public_participant_profiles: publicProfiles,
        auto_match: next,
      });
      try {
        localStorage.setItem("admin_pref_auto_match", String(next));
      } catch {}
      setToastMessage(`Auto-matching ${next ? "enabled" : "disabled"}.`);
    } catch (err) {
      setAutoMatch(prev);
      setError(errorMessage(err));
    }
  };

  // Archive modal state
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Export CSV handler from header
  useEffect(() => {
    const handleExportCSV = () => {
      const rows = [
        ["Category", "Key / Name", "Value / Status", "Details / Link"],
        ...programs.map((p) => [
          "Program",
          p.name,
          p.status,
          p.link === "—" ? "" : p.link,
        ]),
        ["Preference", "Email digest", emailDigest ? "Enabled" : "Disabled", ""],
        [
          "Preference",
          "Public participant profiles",
          publicProfiles ? "Enabled" : "Disabled",
          "",
        ],
        [
          "Preference",
          "Auto-match new participants",
          autoMatch ? "Enabled" : "Disabled",
          "",
        ],
      ];
      const csvContent = rows
        .map((r) =>
          r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Vision2535_Program_Settings.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setToastMessage("Settings CSV exported.");
    };

    window.addEventListener("export-settings-csv", handleExportCSV);
    return () =>
      window.removeEventListener("export-settings-csv", handleExportCSV);
  }, [emailDigest, publicProfiles, autoMatch, programs]);

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || busy || !newProgramName.trim()) return;
    if (newApplicationLink && !safeWebUrl(newApplicationLink)) {
      setError("Enter a complete http or https application link.");
      return;
    }
    setBusy(true);
    setSavingProgram(true);
    setError(null);
    try {
      await createProgram(token, {
        name: newProgramName.trim(),
        application_url: newApplicationLink.trim() || null,
        status: newStatus === "Active" ? "active" : newStatus,
      });
      resource.reload();
      setNewProgramName("");
      setNewApplicationLink("");
      setToastMessage("Program saved.");
      window.dispatchEvent(new Event("programs_updated"));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
      setSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (id: string | number) => {
    if (!token || busy || !window.confirm("Delete this program?")) return;
    setBusy(true);
    setDeletingProgramId(id);
    setError(null);
    try {
      await deleteProgram(token, Number(id));
      resource.reload();
      window.dispatchEvent(new Event("programs_updated"));
      setToastMessage("Program deleted.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
      setDeletingProgramId(null);
    }
  };

  const [archivingProgram, setArchivingProgram] = useState(false);

  const handleArchiveProgram = async () => {
    if (!token || archivingProgram) return;
    const targetProgram = resource.data?.[0];
    if (!targetProgram) {
      setIsArchiveConfirmOpen(false);
      setIsArchived(true);
      setToastMessage("Program archived.");
      return;
    }
    setArchivingProgram(true);
    setError(null);
    try {
      await updateProgram(token, Number(targetProgram.id), {
        name: targetProgram.name,
        status: "archived",
      });
      setIsArchived(true);
      setIsArchiveConfirmOpen(false);
      setToastMessage("Program moved to archived status.");
      resource.reload();
      window.dispatchEvent(new Event("programs_updated"));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setArchivingProgram(false);
    }
  };

  return (
    <div className="w-full max-w-full pb-14 space-y-6 font-sans animate-in fade-in duration-200">
      <ApiState {...resource} onRetry={resource.reload} />
      {error && (
        <p
          role="alert"
          className="relative z-[1000000] rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </p>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] bg-[#111928] text-white px-5 py-3 rounded-[10px] text-[13px] font-medium shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-[#609974]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Row 1: Programs & Add a program (Equal height cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
        {/* Left Column: Programs */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans mb-5">
              Programs
            </h2>

            <div className="space-y-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="text-[13.5px] md:text-[14px] font-medium text-[#111928] font-sans">
                      {program.name}
                    </h3>
                    <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-0.5">
                      {program.status} · {program.link}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteProgram(program.id)}
                    className="border border-[#FCA5A5] text-[#EF4444] hover:bg-red-50 disabled:opacity-50 px-3.5 py-1 rounded-[8px] text-[12px] font-normal transition-colors cursor-pointer shrink-0 font-sans inline-flex items-center gap-1.5"
                  >
                    {deletingProgramId === program.id && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>
                      {deletingProgramId === program.id
                        ? "Deleting..."
                        : "Delete"}
                    </span>
                  </button>
                </div>
              ))}

              {programs.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-[13px]">
                  No active programs listed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Add a program */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <form
            onSubmit={handleAddProgram}
            className="flex flex-col h-full justify-between space-y-4"
          >
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans mb-4">
                Add a program
              </h2>

              <div className="space-y-3.5">
                {/* Program Name */}
                <div>
                  <label
                    htmlFor="field-srcappdashboardadminsettingspagetsx-1"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Program Name
                  </label>
                  <input
                    id="field-srcappdashboardadminsettingspagetsx-1"
                    type="text"
                    value={newProgramName}
                    onChange={(e) => setNewProgramName(e.target.value)}
                    placeholder="Enter the program name here..."
                    className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 text-[13px] text-[#111928] placeholder:text-gray-400 font-sans focus:outline-none focus:border-[#DB911E]"
                  />
                </div>

                {/* Application form link */}
                <div>
                  <label
                    htmlFor="field-srcappdashboardadminsettingspagetsx-2"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Application form link
                  </label>
                  <input
                    id="field-srcappdashboardadminsettingspagetsx-2"
                    type="text"
                    value={newApplicationLink}
                    onChange={(e) => setNewApplicationLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 text-[13px] text-[#111928] placeholder:text-gray-400 font-sans focus:outline-none focus:border-[#DB911E]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="field-srcappdashboardadminsettingspagetsx-3"
                    className="block text-[12.5px] font-normal text-[#4B5563] mb-1 font-sans"
                  >
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="field-srcappdashboardadminsettingspagetsx-3"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 pr-9 text-[13px] text-[#111928] font-sans appearance-none focus:outline-none focus:border-[#DB911E] cursor-pointer"
                    >
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Applications open">
                        Applications open
                      </option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Program Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={busy || !newProgramName.trim()}
                className="bg-[#DB911E] hover:bg-[#BA7815] text-white px-5 py-2 rounded-[8px] text-[13px] font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans inline-flex items-center gap-2"
              >
                {savingProgram && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{savingProgram ? "Saving..." : "Save Program"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 2: Preferences */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        <h2 className="text-[15px] sm:text-[16px] font-medium text-[#111928] font-sans mb-5">
          Preferences
        </h2>

        <div className="space-y-5">
          {/* Email digest */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[13.5px] font-medium text-[#111928] font-sans">
                Email digest
              </h3>
              <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-0.5">
                Weekly summary of program activity.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleEmailDigest}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                emailDigest ? "bg-[#DB911E]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  emailDigest ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <hr className="border-[#F3F4F6]" />

          {/* Public participant profiles */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[13.5px] font-medium text-[#111928] font-sans">
                Public participant profiles
              </h3>
              <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-0.5">
                Allow participants to appear in the public directory.
              </p>
            </div>

            <button
              type="button"
              onClick={togglePublicProfiles}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                publicProfiles ? "bg-[#DB911E]" : "bg-[#9CA3AF]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  publicProfiles ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <hr className="border-[#F3F4F6]" />

          {/* Auto-match new participants */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[13.5px] font-medium text-[#111928] font-sans">
                Auto-match new participants
              </h3>
              <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-0.5">
                Suggest mentors based on focus areas and cohort.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleAutoMatch}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                autoMatch ? "bg-[#DB911E]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoMatch ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Danger zone */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        <h2 className="text-[15px] sm:text-[16px] font-medium text-[#DC2626] font-sans mb-4">
          Danger zone
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[13.5px] font-medium text-[#111928] font-sans">
              Archive program
            </h3>
            <p className="text-[12px] font-normal text-[#6B7280] font-sans mt-0.5">
              Move Vision2535 into read-only mode. This cannot be undone by an
              admin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsArchiveConfirmOpen(true)}
            disabled={isArchived}
            className={`border border-[#FCA5A5] text-[#EF4444] px-5 py-2 rounded-[8px] text-[13px] font-normal transition-colors cursor-pointer shrink-0 font-sans self-start sm:self-auto ${
              isArchived
                ? "opacity-50 cursor-not-allowed bg-red-50 text-red-400"
                : "hover:bg-red-50"
            }`}
          >
            {isArchived ? "Archived" : "Archive"}
          </button>
        </div>
      </div>

      <GoalCategoryManager />

      {/* Archive Confirmation Modal */}
      {isArchiveConfirmOpen && (
        <div
          className="fixed inset-0 z-[999999] min-h-screen w-screen bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsArchiveConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-[16px] w-full max-w-[440px] shadow-2xl border border-gray-100 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-[16px] font-medium text-[#111928]">
                Archive Program?
              </h3>
            </div>

            <p className="text-[13px] text-[#6B7280] leading-relaxed">
              Are you sure you want to archive Vision2535? The program will
              transition into read-only mode, and participants will no longer be
              able to submit goals or book sessions.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 rounded-[8px] text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={archivingProgram}
                onClick={() => void handleArchiveProgram()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-[8px] text-[13px] font-medium transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                {archivingProgram && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{archivingProgram ? "Archiving..." : "Yes, Archive"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
