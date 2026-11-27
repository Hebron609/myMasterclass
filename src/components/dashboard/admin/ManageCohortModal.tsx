"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  User,
  Check,
  Users,
  Shield,
  Calendar,
  Download,
} from "lucide-react";

export interface CohortData {
  id: string | number;
  category: string;
  name: string;
  rate: string;
  participants: number;
  mentors: number;
  started: number | string;
  year: number;
  sessions?: number | string;
  cadence?: string | null;
  capacity?: number | null;
  isEnrollmentOpen?: boolean;
  status?: string;
  programId?: number | null;
}

interface ManageCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort: CohortData | null;
  onUpdateCohort?: (updated: CohortData) => void;
}

export function ManageCohortModal({
  isOpen,
  onClose,
  cohort,
  onUpdateCohort,
}: ManageCohortModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "participants" | "mentors"
  >("overview");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Convergence");
  const [started, setStarted] = useState<number | string>(2024);
  const [year, setYear] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cohort) {
      setName(cohort.name);
      setCategory(cohort.category);
      setStarted(cohort.started);
      setYear(cohort.year);
      setIsSaved(false);
      setActiveTab("overview");
    }
  }, [cohort]);

  if (!isOpen || !cohort || !mounted) return null;

  // Sample participants for this cohort
  const sampleParticipants = [
    {
      name: "Chika Eze",
      email: "chika.eze@example.com",
      mentor: "Dr. Kwesi Mensah",
      progress: "96%",
      status: "Active",
    },
    {
      name: "Sade Ekow",
      email: "sade.ekow@example.com",
      mentor: "Amina Bello",
      progress: "88%",
      status: "Active",
    },
    {
      name: "Femi Kolawole",
      email: "femi.k@example.com",
      mentor: "Oluwaseun Vance",
      progress: "92%",
      status: "Active",
    },
    {
      name: "Esi Boateng",
      email: "esi.boateng@example.com",
      mentor: "Dr. Kwesi Mensah",
      progress: "94%",
      status: "Active",
    },
    {
      name: "Kofi Annan Jr.",
      email: "kofi.a@example.com",
      mentor: "Nneka Okonjo",
      progress: "90%",
      status: "Active",
    },
  ];

  const sampleMentors = [
    {
      name: "Dr. Kwesi Mensah",
      email: "kwesi.m@example.com",
      mentees: 4,
      role: "Senior Fellow",
      status: "Active",
    },
    {
      name: "Amina Bello",
      email: "amina.b@example.com",
      mentees: 3,
      role: "Leadership Coach",
      status: "Active",
    },
    {
      name: "Oluwaseun Vance",
      email: "olu.vance@example.com",
      mentees: 3,
      role: "Strategy Mentor",
      status: "Active",
    },
    {
      name: "Nneka Okonjo",
      email: "nneka.o@example.com",
      mentees: 2,
      role: "Policy Advisor",
      status: "Active",
    },
  ];

  const filteredParticipants = sampleParticipants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mentor.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredMentors = sampleMentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCohort && cohort) {
      onUpdateCohort({
        ...cohort,
        name,
        category,
        started,
        year,
      });
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium text-[#5E8E6A] font-sans">
                  {category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5EFE6] text-[#477353]">
                  {cohort.rate}
                </span>
              </div>
              <h2 className="text-[18px] md:text-[19px] font-semibold text-gray-900 font-sans">
                {name || cohort.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stat Ribbon */}
        <div className="grid grid-cols-4 border-b border-gray-100 bg-[#FAFBF9] px-6 py-3.5 text-center">
          <div>
            <span className="text-[11px] text-gray-400 font-sans block">
              Participants
            </span>
            <span className="text-[15px] font-normal text-gray-800 font-sans">
              {cohort.participants}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-sans block">
              Mentors
            </span>
            <span className="text-[15px] font-normal text-gray-800 font-sans">
              {cohort.mentors}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-sans block">
              Started
            </span>
            <span className="text-[15px] font-normal text-gray-800 font-sans">
              {started}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-sans block">
              Progress
            </span>
            <span className="text-[15px] font-normal text-gray-800 font-sans">
              Year {year} of 10
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-[13.5px] font-medium font-sans border-b-2 transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-[#DB911E] text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Overview & Settings
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`pb-3 px-3 text-[13.5px] font-medium font-sans border-b-2 transition-colors cursor-pointer ${
              activeTab === "participants"
                ? "border-[#DB911E] text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Participants ({cohort.participants})
          </button>
          <button
            onClick={() => setActiveTab("mentors")}
            className={`pb-3 px-3 text-[13.5px] font-medium font-sans border-b-2 transition-colors cursor-pointer ${
              activeTab === "mentors"
                ? "border-[#DB911E] text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Mentors ({cohort.mentors})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "overview" && (
            <form onSubmit={handleSave} className="space-y-5">
              {isSaved && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-[10px] text-[13px] font-sans flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Cohort updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="field-sdashboardadminManageCohortModaltsx-1"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Cohort Name
                  </label>
                  <input
                    id="field-sdashboardadminManageCohortModaltsx-1"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] focus:ring-1 focus:ring-[#DB911E] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-sdashboardadminManageCohortModaltsx-2"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Program / Category
                  </label>
                  <input
                    id="field-sdashboardadminManageCohortModaltsx-2"
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] focus:ring-1 focus:ring-[#DB911E] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="field-sdashboardadminManageCohortModaltsx-3"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Started Year
                  </label>
                  <input
                    id="field-sdashboardadminManageCohortModaltsx-3"
                    type="number"
                    required
                    value={started}
                    onChange={(e) => setStarted(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] focus:ring-1 focus:ring-[#DB911E] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-sdashboardadminManageCohortModaltsx-4"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Current Progression (Year)
                  </label>
                  <select
                    id="field-sdashboardadminManageCohortModaltsx-4"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[14px] text-gray-900 font-sans outline-none focus:border-[#DB911E] focus:ring-1 focus:ring-[#DB911E] transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
                      <option key={y} value={y}>
                        Year {y} of 10
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1.5 font-sans cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Cohort Roster (CSV)
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-200 rounded-[8px] text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] text-white rounded-[8px] text-[13.5px] font-medium transition-colors font-sans cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "participants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search participants or mentors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[8px] text-[13px] text-gray-900 outline-none focus:border-[#DB911E] transition-all font-sans"
                  />
                </div>
                <button className="px-3.5 py-2 bg-gray-900 text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-black transition-colors shrink-0 cursor-pointer">
                  + Add Participant
                </button>
              </div>

              <div className="border border-gray-100 rounded-[12px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[12px] text-gray-500 font-sans">
                      <th className="py-2.5 px-4 font-medium">Participant</th>
                      <th className="py-2.5 px-4 font-medium">
                        Assigned Mentor
                      </th>
                      <th className="py-2.5 px-4 font-medium">Progress</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((p, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 text-[13px] font-sans"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {p.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{p.mentor}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {p.progress}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-100">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "mentors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search mentors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[8px] text-[13px] text-gray-900 outline-none focus:border-[#DB911E] transition-all font-sans"
                  />
                </div>
                <button className="px-3.5 py-2 bg-gray-900 text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-black transition-colors shrink-0 cursor-pointer">
                  + Assign Mentor
                </button>
              </div>

              <div className="border border-gray-100 rounded-[12px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[12px] text-gray-500 font-sans">
                      <th className="py-2.5 px-4 font-medium">Mentor</th>
                      <th className="py-2.5 px-4 font-medium">Role</th>
                      <th className="py-2.5 px-4 font-medium">Mentees</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentors.map((m, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 text-[13px] font-sans"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {m.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{m.role}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {m.mentees} assigned
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-100">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
