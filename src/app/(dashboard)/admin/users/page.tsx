"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  X,
  UserPlus,
  ArrowDownToLine,
  Upload,
  Check,
  Trash2,
  Pencil,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  importAdminUsers,
} from "@/lib/services/admin";
import { AddUserModal } from "@/components/dashboard/admin/AddUserModal";
import { fetchCohorts } from "@/lib/services/cohorts";
import { fetchPrograms } from "@/lib/services/programs";
import { errorMessage } from "@/lib/api";
import { ApiState } from "@/components/shared/ApiUI";
import { TableSkeleton } from "@/components/shared/Skeletons";

export interface UserRecord {
  id: string | number;
  name: string;
  email: string;
  role: "Participant" | "Mentor";
  cohort: string;
  status: string;
  avatarUrl: string;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const resource = useApiResource("admin-users", fetchAdminUsers);
  const cohorts = useApiResource("admin-user-cohorts", fetchCohorts);
  const programs = useApiResource("admin-user-programs", fetchPrograms);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<
    "All" | "Participants" | "Mentors"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openActionId, setOpenActionId] = useState<string | number | null>(
    null,
  );

  // Mounted state for SSR safe portals
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] =
    useState<UserRecord | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // Edit User form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"Participant" | "Mentor">(
    "Participant",
  );
  const [editCohort, setEditCohort] = useState("'25");
  const [editStatus, setEditStatus] = useState<
    "Active" | "Quiet" | "Unassigned"
  >("Active");
  const [editSuccess, setEditSuccess] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<
    string | number | null
  >(null);

  const [createdUserMessage, setCreatedUserMessage] = useState<string | null>(
    null,
  );

  // Bulk Import state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial user list matching user's mockup precisely
  const users = (resource.data || [])
    .filter((user) => ["mentee", "mentor"].includes(user.role))
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role:
        user.role === "mentor" ? ("Mentor" as const) : ("Participant" as const),
      cohort:
        user.cohorts?.map((cohort) => cohort.name).join(", ") ||
        (user.cohorts?.length === 0
          ? "Unassigned"
          : cohorts.data?.find((cohort) => cohort.id === user.cohortId)?.name ||
            "—"),
      status: user.status
        ? user.status[0].toUpperCase() + user.status.slice(1)
        : "—",
      avatarUrl: user.avatarUrl || "/icons/user-placeholder.svg",
    }));

  // Listen to custom header events for Bulk Import & Add User
  useEffect(() => {
    const handleOpenAddUser = () => {
      setCreatedUserMessage(null);
      setActionError(null);
      setIsAddUserModalOpen(true);
    };
    const handleOpenBulkImport = () => setIsBulkImportModalOpen(true);

    window.addEventListener("open-add-user-modal", handleOpenAddUser);
    window.addEventListener("open-bulk-import-modal", handleOpenBulkImport);

    return () => {
      window.removeEventListener("open-add-user-modal", handleOpenAddUser);
      window.removeEventListener(
        "open-bulk-import-modal",
        handleOpenBulkImport,
      );
    };
  }, []);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenActionId(null);
    };
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    // Tab filter
    if (filterTab === "Participants" && user.role !== "Participant")
      return false;
    if (filterTab === "Mentors" && user.role !== "Mentor") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchRole = user.role.toLowerCase().includes(q);
      const matchCohort = user.cohort.toLowerCase().includes(q);
      const matchStatus = user.status.toLowerCase().includes(q);
      return matchName || matchRole || matchCohort || matchStatus;
    }

    return true;
  });

  // Handle Open Edit User
  const handleOpenEditUser = (user: UserRecord) => {
    setSelectedUserForAction(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditCohort(user.cohort);
    setEditStatus(
      ["Active", "Quiet", "Unassigned"].includes(user.status)
        ? (user.status as "Active" | "Quiet" | "Unassigned")
        : "Unassigned",
    );
    setEditSuccess(false);
    setIsEditUserModalOpen(true);
    setOpenActionId(null);
  };

  // Handle Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUserForAction || isSavingEdit) return;
    setActionError(null);
    setIsSavingEdit(true);
    const names = editName.trim().split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || firstName;
    const selectedCohortObj = (cohorts.data || []).find(
      (c) => c.name === editCohort || String(c.id) === editCohort,
    );
    try {
      await updateAdminUser(token, selectedUserForAction.id, {
        first_name: firstName,
        last_name: lastName,
        email: editEmail.trim(),
        role: editRole === "Mentor" ? "mentor" : "mentee",
        status: editStatus === "Active" ? "active" : "inactive",
        cohort_id: selectedCohortObj ? selectedCohortObj.id : undefined,
      });
      setEditSuccess(true);
      resource.reload();
      setTimeout(() => {
        setIsEditUserModalOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Remove User
  const handleRemoveUser = async (id: string | number, hard = false) => {
    if (!token || removingUserId !== null) return;
    setActionError(null);
    setRemovingUserId(id);
    try {
      await deleteAdminUser(token, id, { hard });
      setCreatedUserMessage(
        hard ? "User permanently removed." : "User deactivated successfully.",
      );
      resource.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setRemovingUserId(null);
      setOpenActionId(null);
    }
  };

  // Handle Bulk Import File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleExecuteImport = async () => {
    if (!fileInputRef.current?.files?.[0] || !token) {
      setActionError("Please choose a CSV file to import.");
      return;
    }
    setIsImporting(true);
    setActionError(null);
    try {
      await importAdminUsers(token, fileInputRef.current.files[0]);
      setImportSuccess(true);
      resource.reload();
      setTimeout(() => {
        setIsBulkImportModalOpen(false);
        setImportSuccess(false);
        setUploadedFileName(null);
      }, 1500);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="font-sans space-y-6 pb-12">
      <ApiState {...resource} onRetry={resource.reload} />
      {actionError && (
        <p
          role="alert"
          className="fixed right-6 top-6 z-[1000000] max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          onClick={() => setActionError(null)}
        >
          {actionError}
        </p>
      )}
      {createdUserMessage && (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {createdUserMessage}
        </p>
      )}
      {/* Main Container Card matching mockup */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Top Control Bar: Search on Left, Filter Pills on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Rounded Search Pill */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-full text-[13.5px] w-full sm:w-72 outline-none focus:border-[#DB911E] transition-colors placeholder:text-gray-400 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {(["All", "Participants", "Mentors"] as const).map((tab) => {
              const isActive = filterTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all font-sans cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#111928] text-white shadow-xs"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111928] hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table / Mobile Cards Section */}
        <div className="mt-6 overflow-visible">
          {resource.loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <div className="animate-in fade-in duration-300">
              {/* Mobile User Cards (Below md) */}
              <div className="md:hidden space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-[14px] border border-gray-100 rounded-[12px]">
                    No users found matching your search.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border border-[#E5E7EB] rounded-[14px] p-4 bg-white space-y-3 relative"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "/icons/user-placeholder.svg";
                            }}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                          />
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[#111928] truncate">
                              {user.name}
                            </p>
                            <p className="text-[12px] text-[#6B7280] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(
                                openActionId === user.id ? null : user.id,
                              );
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                            aria-label="User actions"
                          >
                            <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                          </button>

                          {openActionId === user.id && (
                            <div
                              className="absolute right-0 top-9 z-50 w-48 bg-white border border-gray-200 rounded-[12px] shadow-lg py-1 text-left text-[13px] animate-in fade-in zoom-in-95 duration-150 font-sans"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(user)}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 text-gray-700 font-sans cursor-pointer transition-colors"
                              >
                                <Pencil className="w-4 h-4 text-gray-500 stroke-[1.8]" />
                                <span>Edit user details</span>
                              </button>
                              <button
                                type="button"
                                disabled={removingUserId === user.id}
                                onClick={() => handleRemoveUser(user.id, false)}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-amber-50 disabled:opacity-50 text-amber-700 font-sans cursor-pointer transition-colors"
                              >
                                {removingUserId === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 stroke-[1.8]" />
                                )}
                                <span>
                                  {removingUserId === user.id
                                    ? "Processing..."
                                    : "Deactivate user"}
                                </span>
                              </button>
                              <button
                                type="button"
                                disabled={removingUserId === user.id}
                                onClick={() => handleRemoveUser(user.id, true)}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 disabled:opacity-50 text-[#EF4444] font-sans cursor-pointer transition-colors"
                              >
                                {removingUserId === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 stroke-[1.8]" />
                                )}
                                <span>
                                  {removingUserId === user.id
                                    ? "Removing..."
                                    : "Remove permanently"}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[12px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F6F2EB] text-[#4B5563] font-medium">
                            {user.role}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[#4B5563]">
                            {user.cohort}
                          </span>
                        </div>
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[11.5px] font-medium font-sans ${
                            user.status === "Active"
                              ? "bg-[#EEF3ED] text-[#486B52]"
                              : user.status === "Quiet"
                                ? "bg-[#F3F4F6] text-[#6B7280]"
                                : "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (md and up) */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[#F6F2EB]">
                <th className="py-3 px-6 text-[13px] font-medium text-[#4B5563] first:rounded-l-[10px]">
                  Name
                </th>
                <th className="py-3 px-6 text-[13px] font-medium text-[#4B5563]">
                  Role
                </th>
                <th className="py-3 px-6 text-[13px] font-medium text-[#4B5563]">
                  Cohorts
                </th>
                <th className="py-3 px-6 text-[13px] font-medium text-[#4B5563]">
                  Status
                </th>
                <th className="py-3 px-6 text-[13px] font-medium text-[#4B5563] text-right last:rounded-r-[10px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-400 text-[14px]"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                        />
                        <span className="text-[13.5px] font-medium text-[#111928]">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6 text-[13.5px] text-[#4B5563]">
                      {user.role}
                    </td>

                    {/* Cohorts */}
                    <td className="py-4 px-6 text-[13.5px] text-[#4B5563]">
                      {user.cohort}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[12px] font-medium font-sans ${
                          user.status === "Active"
                            ? "bg-[#EEF3ED] text-[#486B52]"
                            : user.status === "Quiet"
                              ? "bg-[#F3F4F6] text-[#6B7280]"
                              : "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Action with 3 dots & Dropdown */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(
                            openActionId === user.id ? null : user.id,
                          );
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                        aria-label="User actions"
                      >
                        <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      {/* Dropdown Menu - only Edit user details and Remove user */}
                      {openActionId === user.id && (
                        <div
                          className="absolute right-6 top-12 z-50 w-44 bg-white border border-gray-200 rounded-[12px] shadow-lg py-1 text-left text-[13px] animate-in fade-in zoom-in-95 duration-150 font-sans"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(user)}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 text-gray-700 font-sans cursor-pointer transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-gray-500 stroke-[1.8]" />
                            <span>Edit user details</span>
                          </button>
                          <button
                            type="button"
                            disabled={removingUserId === user.id}
                            onClick={() => handleRemoveUser(user.id, false)}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-amber-50 disabled:opacity-50 text-amber-700 font-sans cursor-pointer transition-colors"
                          >
                            {removingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            )}
                            <span>
                              {removingUserId === user.id
                                ? "Processing..."
                                : "Deactivate user"}
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={removingUserId === user.id}
                            onClick={() => handleRemoveUser(user.id, true)}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 disabled:opacity-50 text-red-600 font-sans cursor-pointer transition-colors"
                          >
                            {removingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            )}
                            <span>
                              {removingUserId === user.id
                                ? "Deleting..."
                                : "Delete permanently"}
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          </div>
          )}
        </div>
      </div>

      {isAddUserModalOpen && mounted && (
        <AddUserModal
          cohorts={cohorts.data || []}
          programs={programs.data || []}
          choicesLoading={cohorts.loading || programs.loading}
          choicesError={Boolean(cohorts.error || programs.error)}
          onClose={() => setIsAddUserModalOpen(false)}
          onCreated={(user) => {
            setIsAddUserModalOpen(false);
            const tempPassword = (user as { temporary_password?: string }).temporary_password;
            if (tempPassword) {
              setCreatedUserMessage(
                `${user.name} was added. Temporary password: ${tempPassword}`,
              );
            } else {
              setCreatedUserMessage(
                `${user.name} was added. They can sign in using the email and password entered.`,
              );
            }
            // Send welcome invitation email via local SMTP mailer
            if (user.email && token) {
              fetch("/api/admin/users/invite", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  temporaryPassword: tempPassword,
                }),
              }).catch((e) => console.warn("Failed to dispatch welcome email:", e));
            }
            setActionError(null);
            resource.reload();
          }}
        />
      )}

      {/* --- MODAL 2: Bulk Import Modal --- */}
      {isBulkImportModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] min-h-screen w-screen flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in"
            onClick={() => setIsBulkImportModalOpen(false)}
          >
            <div
              className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl border border-gray-100 p-6 sm:p-7 relative font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[19px] font-medium text-[#111928] tracking-tight">
                    Bulk Import Users
                  </h3>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">
                    Upload a CSV or XLSX file containing participant and mentor
                    records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 cursor-pointer rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {importSuccess && (
                <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> Users imported
                  successfully!
                </div>
              )}

              {/* Dropzone */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#DB911E] rounded-[14px] p-6 text-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-amber-50/20"
              >
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#DB911E] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-[14px] font-medium text-gray-800">
                  {uploadedFileName
                    ? uploadedFileName
                    : "Click to upload, or drag and drop"}
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  CSV or Excel files (MAX. 10MB)
                </p>
              </div>

              <div className="flex items-center justify-between text-[12.5px] text-[#6B7280] mt-4 pt-1">
                <span>Need a sample template?</span>
                <button
                  type="button"
                  onClick={() => {
                    const sampleContent =
                      "email,first_name,last_name,role,cohort_id\nparticipant@example.com,John,Doe,mentee,1\nmentor@example.com,Jane,Smith,mentor,1\n";
                    const blob = new Blob([sampleContent], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "sample-users-import.csv";
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-[#DB911E] hover:underline font-medium cursor-pointer"
                >
                  Download sample.csv
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(false)}
                  className="px-5 py-2 border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!uploadedFileName || isImporting}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-50 text-white rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Upload & Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* --- MODAL 3: Edit User Details Modal --- */}
      {isEditUserModalOpen &&
        selectedUserForAction &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] min-h-screen w-screen flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in"
            onClick={() => setIsEditUserModalOpen(false)}
          >
            <div
              className="bg-white rounded-[20px] w-full max-w-[480px] shadow-2xl border border-gray-100 p-6 sm:p-7 relative font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[19px] font-medium text-[#111928] tracking-tight">
                    Edit user details
                  </h3>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">
                    Update account and cohort details for this user.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 cursor-pointer rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccess && (
                <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> User details
                  updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveEditUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="field-srcappdashboardadminuserspagetsx-7"
                    className="block text-[13px] font-medium text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="field-srcappdashboardadminuserspagetsx-7"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-srcappdashboardadminuserspagetsx-8"
                    className="block text-[13px] font-medium text-gray-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="field-srcappdashboardadminuserspagetsx-8"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-srcappdashboardadminuserspagetsx-9"
                      className="block text-[13px] font-medium text-gray-700 mb-1.5"
                    >
                      Role
                    </label>
                    <select
                      id="field-srcappdashboardadminuserspagetsx-9"
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(e.target.value as "Participant" | "Mentor")
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors cursor-pointer"
                    >
                      <option value="Participant">Participant</option>
                      <option value="Mentor">Mentor</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="field-srcappdashboardadminuserspagetsx-10"
                      className="block text-[13px] font-medium text-gray-700 mb-1.5"
                    >
                      Cohort
                    </label>
                    <select
                      id="field-srcappdashboardadminuserspagetsx-10"
                      value={editCohort}
                      onChange={(e) => setEditCohort(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {(cohorts.data || []).map((cohort) => (
                        <option key={cohort.id} value={cohort.name}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-srcappdashboardadminuserspagetsx-11"
                    className="block text-[13px] font-medium text-gray-700 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="field-srcappdashboardadminuserspagetsx-11"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as "Active" | "Quiet" | "Unassigned",
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Quiet">Quiet</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => setIsEditUserModalOpen(false)}
                    className="px-5 py-2 border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    {isSavingEdit && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>{isSavingEdit ? "Saving..." : "Save changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
