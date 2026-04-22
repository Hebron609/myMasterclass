"use client";

import { useState } from "react";
import { UserCircle } from "lucide-react";
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
  status: "Issued" | "Pending" | "Not Eligible";
  date: string;
}

const mockPending: PendingEndorsement[] = [
  {
    id: "p1",
    name: "John D.",
    initials: "JD",
    details: "Year 1 Completion • 3/4 criteria met",
    subtext: "Mentor endorsement required",
  },
  {
    id: "p2",
    name: "John D.",
    initials: "JD",
    details: "Year 1 Completion • 3/4 criteria met",
    subtext: "Mentor endorsement required",
  },
];

const mockStatuses: CertificateStatus[] = [
  {
    id: "s1",
    name: "Sarah M.",
    initials: "SM",
    certificate: "Year 2 Completion",
    status: "Issued",
    date: "Mar 2026",
  },
  {
    id: "s2",
    name: "Amina K.",
    initials: "AK",
    certificate: "Leadership Excellence",
    status: "Issued",
    date: "Feb 2026",
  },
  {
    id: "s3",
    name: "Michael A.",
    initials: "MA",
    certificate: "Year 1 Completion",
    status: "Issued",
    date: "Jan 2025",
  },
  {
    id: "s4",
    name: "John D.",
    initials: "JD",
    certificate: "Year 1 Completion",
    status: "Pending",
    date: "—",
  },
  {
    id: "s5",
    name: "David O.",
    initials: "DO",
    certificate: "Year 1 Completion",
    status: "Not Eligible",
    date: "—",
  },
];

const statusStyles = {
  Issued: "bg-[#333333] text-white",
  Pending: "bg-[#F2F4F8] text-[#4B5563] border border-[#E5E7EB]",
  "Not Eligible": "bg-[#F9FAFB] text-[#9CA3AF] border border-[#F2F4F8]",
};

export default function CertificatesPageContent() {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<{ name: string; certificate: string } | null>(null);

  const handleOpenDetails = (name: string, certificate: string) => {
    setSelectedMentee({ name, certificate });
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#003F3A] font-dm-sans mb-1">
          Mentee Certificates
        </h1>
        <p className="text-[16px] text-[#003F3A]/80 font-rubik">
          Track and endorse certificates for your mentees
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { value: "4", label: "Mentees Certified out of 8" },
          { value: "2", label: "Pending Endorsement" },
          { value: "6", label: "Total Certificates" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[15px] p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-50">
            <span className="text-[32px] font-bold text-[#1a1a1a] font-dm-sans mb-2">{stat.value}</span>
            <span className="text-[13px] text-[#003F3A] font-rubik font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Pending Endorsements Section */}
      <div className="bg-[#FEF9E1] rounded-[20px] p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-6">
          Pending Endorsements
        </h2>
        <div className="space-y-4">
          {mockPending.map((item, i) => (
            <div key={i} className="bg-white rounded-[15px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border border-white/50">
              <div className="flex items-center gap-5 w-full">
                <div className="w-12 h-12 bg-[#F2F4F8] rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#333333] font-dm-sans">
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
                  onClick={() => handleOpenDetails(item.name, "Year 1 Completion")}
                  className="px-8 py-2.5 border border-[#D5DCEB] text-[#333333] text-[14px] font-bold rounded-lg hover:bg-gray-50 transition-colors font-sans"
                >
                  Details
                </button>
                <button className="px-8 py-2.5 bg-[#333333] text-white text-[14px] font-bold rounded-lg hover:bg-[#222222] transition-colors font-sans shadow-sm">
                  Endorse
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Status Table */}
      <div className="bg-white rounded-[15px] shadow-sm overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-[20px] font-bold text-[#1a3d3d] font-dm-sans">
            Mentee Certificate Status
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[14px] text-[#4A4A4A] font-dm-sans font-bold border-b border-gray-100 uppercase tracking-tight">
                <th className="px-8 py-5 font-bold">Name</th>
                <th className="px-8 py-5 font-bold">Certificate</th>
                <th className="px-8 py-5 font-bold">Status</th>
                <th className="px-8 py-5 font-bold">Date</th>
                <th className="px-8 py-5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[15px] font-rubik text-[#333333]">
              {mockStatuses.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F9FAF9] transition-colors">
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
                    <span className={`px-4 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[#4B5563]">
                    {item.date}
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => handleOpenDetails(item.name, item.certificate)}
                      className="px-6 py-1.5 border border-[#D5DCEB] text-[#333333] text-[13px] font-bold rounded-lg hover:bg-gray-50 transition-colors font-sans"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MenteeCertDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        mentee={selectedMentee}
      />
    </div>
  );
}
