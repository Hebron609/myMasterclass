"use client";

import { useState } from "react";
import { UserCircle, Loader2, CheckCircle2 } from "lucide-react";
import MenteeCertDetailsModal from "./MenteeCertDetailsModal";

interface PendingEndorsement {
  id: string;
  name: string;
  initials: string;
  details: string;
  subtext: string;
}

interface CertificateStatus {
  id: string;
  name: string;
  initials: string;
  certificate: string;
  status: "Issued" | "Pending" | "Not Eligible" | "Unknown";
  date: string;
}

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchMyCertificates,
  certificateTitle,
  certificateStatus,
  endorseCertificate,
} from "@/lib/services/certificates";
import { ApiState, formatDate } from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";
import { StatsCardsSkeleton, TableSkeleton } from "@/components/shared/Skeletons";
const statusStyles = {
  Unknown: "bg-[#F9FAFB] text-[#9CA3AF]",
  Issued: "bg-[#333333] text-white",
  Pending: "bg-[#F2F4F8] text-[#4B5563] border border-[#E5E7EB]",
  "Not Eligible": "bg-[#F9FAFB] text-[#9CA3AF] border border-[#F2F4F8]",
};

export default function CertificatesPageContent() {
  const { token } = useAuth();
  const resource = useApiResource("mentor-certificates", fetchMyCertificates);
  const certificateStatuses: CertificateStatus[] = (
    resource.data?.items || []
  ).map((item) => ({
    id: String(item.id),
    name: item.mentee?.name || item.user?.name || "—",
    initials: "",
    certificate: certificateTitle(item),
    date: formatDate(item.issued_at || item.issue_date),
    status: ["issued", "earned", "completed"].includes(certificateStatus(item))
      ? "Issued"
      : certificateStatus(item) === "not_eligible"
        ? "Not Eligible"
        : [
              "pending",
              "requested",
              "in_progress",
              "pending_endorsement",
            ].includes(certificateStatus(item))
          ? "Pending"
          : "Unknown",
  }));
  const pendingEndorsements: PendingEndorsement[] = (resource.data?.items || [])
    .filter((item) => certificateStatus(item) === "pending_endorsement")
    .map((item) => ({
      id: String(item.id),
      name: item.mentee?.name || item.user?.name || "—",
      initials: "",
      details: certificateTitle(item),
      subtext: item.description || "",
    }));
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<{
    id: string;
    name: string;
    certificate: string;
  } | null>(null);
  const [endorsedIds, setEndorsedIds] = useState<string[]>([]);
  const [endorsingId, setEndorsingId] = useState<string | null>(null);
  const [endorseNotice, setEndorseNotice] = useState<string | null>(null);
  const [endorseError, setEndorseError] = useState<string | null>(null);

  const handleEndorse = async (id: string, name: string) => {
    if (endorsingId) return;
    setEndorsingId(id);
    setEndorseNotice(null);
    setEndorseError(null);
    try {
      if (token) {
        await endorseCertificate(token, id, {
          notes: `Endorsed by mentor for ${name}.`,
        });
      }
      setEndorsedIds((prev) => [...prev, id]);
      setEndorseNotice(`Certificate endorsed for ${name}.`);
      resource.reload();
    } catch (err) {
      setEndorseError(errorMessage(err));
    } finally {
      setEndorsingId(null);
    }
  };

  const handleOpenDetails = (id: string, name: string, certificate: string) => {
    setSelectedMentee({ id, name, certificate });
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <ApiState {...resource} onRetry={resource.reload} />
      {endorseError && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
        >
          {endorseError}
        </div>
      )}
      {endorseNotice && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{endorseNotice}</span>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-medium text-[#003F3A] font-dm-sans mb-1">
          Mentee Certificates
        </h1>
        <p className="text-[16px] text-[#003F3A]/80 font-rubik">
          Track and endorse certificates for your mentees
        </p>
      </div>

      {/* Stats Cards & Tables */}
      {resource.loading ? (
        <div className="space-y-8">
          <StatsCardsSkeleton count={3} />
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                value: resource.data
                  ? new Set(
                      resource.data.items
                        .filter((i) =>
                          ["issued", "earned", "completed"].includes(
                            certificateStatus(i),
                          ),
                        )
                        .map(
                          (i) =>
                            i.mentee?.id || i.user?.id || i.user_id || i.mentee_id,
                        )
                        .filter(Boolean),
                    ).size
                  : "—",
                label: "Mentees Certified",
              },
              {
                value: resource.data ? pendingEndorsements.length : "—",
                label: "Pending Endorsement",
              },
              {
                value: resource.data ? resource.data.items.length : "—",
                label: "Total Certificates",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-[15px] p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-50"
              >
                <span className="text-[32px] font-medium text-[#1a1a1a] font-dm-sans mb-2">
                  {stat.value}
                </span>
                <span className="text-[13px] text-[#003F3A] font-rubik font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Pending Endorsements Section */}
          <div className="bg-[#FEF9E1] rounded-[20px] p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-[#333333] font-dm-sans mb-6">
              Pending Endorsements
            </h2>
            {pendingEndorsements.filter((p) => !endorsedIds.includes(p.id))
              .length === 0 ? (
              <div className="bg-white/80 rounded-[15px] p-8 text-center text-gray-500 border border-white/50">
                <p className="text-[15px] font-sans font-medium">
                  No pending endorsements.
                </p>
                <p className="text-[13px] font-sans mt-1">
                  When mentees complete certificate criteria requiring endorsement,
                  they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEndorsements
                  .filter((p) => !endorsedIds.includes(p.id))
                  .map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[15px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border border-white/50"
                    >
                      <div className="flex items-center gap-5 w-full">
                        <div className="w-12 h-12 bg-[#F2F4F8] rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-medium text-[#333333] font-dm-sans">
                            {item.name}
                          </h3>
                          <p className="text-[13px] text-[#4B5563] font-rubik mt-0.5">
                            {item.details}
                          </p>
                          <p className="text-[11px] text-[#9CA3AF] font-rubik">
                            {item.subtext}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                          onClick={() =>
                            handleOpenDetails(item.id, item.name, item.details)
                          }
                          className="px-8 py-2.5 border border-[#D5DCEB] text-[#333333] text-[14px] font-medium rounded-lg hover:bg-gray-50 transition-colors font-sans cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          disabled={endorsingId === item.id}
                          onClick={() => handleEndorse(item.id, item.name)}
                          className="disabled:opacity-50 px-8 py-2.5 bg-[#333333] text-white text-[14px] font-medium rounded-lg hover:bg-[#222222] transition-colors font-sans shadow-sm inline-flex items-center gap-2 cursor-pointer"
                        >
                          {endorsingId === item.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Endorsing...</span>
                            </>
                          ) : (
                            "Endorse"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Certificate Status Table */}
          <div className="bg-white rounded-[15px] shadow-sm overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-[20px] font-medium text-[#1a3d3d] font-dm-sans">
                Mentee Certificate Status
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[14px] text-[#4A4A4A] font-dm-sans font-medium border-b border-gray-100 uppercase tracking-tight">
                    <th className="px-8 py-5 font-medium">Name</th>
                    <th className="px-8 py-5 font-medium">Certificate</th>
                    <th className="px-8 py-5 font-medium">Status</th>
                    <th className="px-8 py-5 font-medium">Date</th>
                    <th className="px-8 py-5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-rubik text-[#333333]">
                  {certificateStatuses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-12 text-center text-gray-400"
                      >
                        <p className="text-[15px] font-sans font-medium">
                          No certificate records found.
                        </p>
                        <p className="text-[13px] font-sans mt-1">
                          Certificate statuses will appear here as mentees progress
                          through the program.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    certificateStatuses.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-[#F9FAF9] transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#F2F4F8] rounded-full flex items-center justify-center flex-shrink-0">
                              <UserCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="font-bold">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[#4B5563] font-medium">
                          {item.certificate}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-4 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${statusStyles[item.status]}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-[#4B5563]">{item.date}</td>
                        <td className="px-8 py-5">
                          <button
                            onClick={() =>
                              handleOpenDetails(
                                item.id,
                                item.name,
                                item.certificate,
                              )
                            }
                            className="px-6 py-1.5 border border-[#D5DCEB] text-[#333333] text-[13px] font-bold rounded-lg hover:bg-gray-50 transition-colors font-sans"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <MenteeCertDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        mentee={selectedMentee}
      />
    </div>
  );
}
