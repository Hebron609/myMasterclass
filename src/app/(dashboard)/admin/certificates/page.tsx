"use client";

import { useState } from "react";
import { Search, User, Image as ImageIcon, X, Filter, Download, ChevronDown } from "lucide-react";

export default function AdminCertificatesPage() {
  const [activeModal, setActiveModal] = useState<"none" | "create_template" | "generate_step1" | "generate_step2" | "generate_step3" | "generate_step4" | "preview_certificate" | "bulk_issue">("none");

  const templates = [
    { title: "Year 1 Completion", issued: 82 },
    { title: "Year 2 Completion", issued: 34 },
    { title: "Year 3 Graduation", issued: 56 },
    { title: "Leadership Excellence", issued: 28 },
    { title: "Masterclass Completion", issued: 18 },
  ];

  const dueGraduates = [
    { name: "Sarah M.", goals: "8/8", attendance: "100%", date: "Mar 12, 2026" },
    { name: "Amina K.", goals: "8/8", attendance: "94%", date: "Mar 14, 2026" },
    { name: "Michael A.", goals: "8/8", attendance: "96%", date: "Mar 15, 2026" },
    { name: "John D.", goals: "8/8", attendance: "90%", date: "Mar 18, 2026" },
  ];

  const issuedCertificates = [
    { name: "Sarah M.", cert: "Year 2 Completion", date: "Mar 12, 2026", status: "Downloaded", statusBg: "bg-[#333333] text-white" },
    { name: "Amina K.", cert: "Year 2 Completion", date: "Mar 14, 2026", status: "Pending", statusBg: "bg-gray-100 text-gray-500" },
    { name: "Michael A.", cert: "Year 2 Completion", date: "Mar 15, 2026", status: "Downloaded", statusBg: "bg-[#333333] text-white" },
    { name: "John D.", cert: "Year 2 Completion", date: "Mar 18, 2026", status: "Issued", statusBg: "bg-gray-100 text-gray-700 border border-gray-200" },
    { name: "John D.", cert: "Year 2 Completion", date: "Mar 18, 2026", status: "Revoked", statusBg: "bg-gray-100 text-gray-500" },
  ];

  const bgTemplates = [
    { id: "gold", name: "Classic Gold", desc: "Ornate gold border, formal" },
    { id: "minimal", name: "Modern Minimal", desc: "Clean lines, sans-serif" },
    { id: "navy", name: "Academic Navy", desc: "Navy & cream, university style" },
    { id: "botanical", name: "Botanical", desc: "Leaf accents, soft tones" },
    { id: "geometric", name: "Bold Geometric", desc: "Color blocks, modern" },
    { id: "custom", name: "Custom Upload", desc: "Upload your own background" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
            Certificate Management
          </h1>
          <p className="text-[14px] text-[#6B7280] font-rubik">
            Create templates, issue & track digital certificates per cohort
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveModal("bulk_issue")}
            className="px-5 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors"
          >
            Bulk Issue
          </button>
          <button 
            onClick={() => setActiveModal("create_template")}
            className="px-5 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors"
          >
            Create Certificate
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: "5", label: "Templates" },
          { value: "214", label: "Certificates Issued" },
          { value: "14", label: "Pending Issuance" },
          { value: "196", label: "Certificates Downloaded" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[12px] p-6 text-center shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[28px] font-bold text-[#1F2937] font-dm-sans mb-2 leading-none">
              {stat.value}
            </p>
            <p className="text-[12px] font-medium text-[#4B5563] font-dm-sans leading-tight">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Certificate Templates */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Certificate Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-5">
              <div className="w-full h-[140px] bg-[#E5E7EB] rounded-[8px] flex flex-col items-center justify-center text-[#9CA3AF] mb-5">
                <ImageIcon size={24} className="mb-2" />
                <span className="text-[12px] font-medium">Certificate Preview</span>
              </div>
              <h3 className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">{tpl.title}</h3>
              <p className="text-[12px] text-[#6B7280] font-rubik mb-1">Cohorts: All</p>
              <p className="text-[12px] text-[#6B7280] font-rubik mb-5">{tpl.issued} Issued</p>
              
              <div className="flex gap-3">
                <button onClick={() => setActiveModal("preview_certificate")} className="flex-1 py-2 border border-gray-200 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                  Preview
                </button>
                <button className="flex-1 py-2 bg-[#333333] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#1f1f1f] transition-colors">
                  Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Due for Graduation */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-[#1F2937] font-dm-sans">
            Due for Graduation – <span className="text-gray-400 font-normal">System Recommended</span>
          </h2>
        </div>
        
        <div className="bg-[#FAFAFA] rounded-[8px] p-4 mb-4 border border-gray-100">
          <p className="text-[13px] font-bold text-[#4B5563] font-dm-sans mb-1">System Suggestion</p>
          <p className="text-[13px] text-[#6B7280] font-rubik">
            4 mentees in <strong>Cohort 2024A</strong> have completed all their goals and are ready for graduation certificates. Review the list and select recipients.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Mentee</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Cohort</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Goals</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Attendance</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Completed</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Action</th>
              </tr>
            </thead>
            <tbody>
              {dueGraduates.map((g, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                        <User size={14} />
                      </div>
                      <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">
                        {g.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#1F2937] font-medium">
                    2024A
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#4B5563]">
                    {g.goals}
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#4B5563]">
                    {g.attendance}
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#4B5563]">
                    {g.date}
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => setActiveModal("generate_step1")}
                      className="px-4 py-1.5 bg-[#333333] text-white rounded-[4px] text-[12px] font-medium hover:bg-[#1f1f1f] transition-colors"
                    >
                      Issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issued Certificates */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] font-dm-sans mb-6">
          Issued Certificates
        </h2>
        
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, cohort, or certificate..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 w-[300px]"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              Filters
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Mentee</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Cohort</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Certificate</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Issue Date</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Status</th>
                <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedCertificates.map((c, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                        <User size={14} />
                      </div>
                      <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[13px] font-bold text-[#1F2937]">
                    2024A
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#4B5563]">
                    {c.cert}
                  </td>
                  <td className="py-4 px-4 text-[13px] text-[#1F2937] font-medium">
                    {c.date}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-[11px] font-medium rounded-[4px] ${c.statusBg}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-200 rounded-[4px] text-[11px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1 border border-gray-200 rounded-[4px] text-[11px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Template */}
      {activeModal === "create_template" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200 my-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans">
                Create Certificate Template
              </h2>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Form fields */}
              <div className="space-y-6">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Applicable Cohorts</p>
                  <div className="flex gap-2">
                    {["All Cohorts", "2024A", "2024B", "2023A", "2023B"].map((c, i) => (
                      <span key={i} className={`px-3 py-1.5 border rounded-[6px] text-[12px] font-medium cursor-pointer ${i === 0 ? 'border-gray-300 bg-white text-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Certificate Title</label>
                  <input type="text" placeholder="e.g., Certificate of Completion" className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400" />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Description</label>
                  <textarea placeholder="This certifies that [Participant Name] has successfully completed..." className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 min-h-[80px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Signatory Name</label>
                    <input type="text" placeholder="Program Director name" className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Signatory Title</label>
                    <input type="text" placeholder="e.g., Director of Mentorship" className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400" />
                  </div>
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Choose Background/Template</p>
                  <div className="grid grid-cols-3 gap-4">
                    {bgTemplates.map((bg, i) => (
                      <div key={bg.id} className="border border-gray-200 rounded-[8px] p-3 cursor-pointer hover:border-gray-300 transition-colors">
                        <div className="h-20 bg-[#E5E7EB] rounded-[4px] mb-3 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={16} className="mb-1" />
                          <span className="text-[10px]">{bg.name}</span>
                        </div>
                        <p className="text-[12px] font-bold text-[#1F2937] font-dm-sans leading-tight mb-1">{bg.name}</p>
                        <p className="text-[10px] text-[#6B7280] font-rubik leading-tight">{bg.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Upload Logo/Signature</p>
                  <div className="border border-dashed border-gray-300 rounded-[8px] p-8 flex flex-col items-center justify-center text-center bg-gray-50/50">
                    <p className="text-[13px] text-[#4B5563] font-medium mb-3">Drop image here or click to upload</p>
                    <button className="px-4 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium bg-white shadow-sm">Upload</button>
                  </div>
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Issue Criteria</p>
                  <div className="space-y-3">
                    {["Complete all modules", "Attend ≥80% sessions", "Submit final reflection"].map((crit, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-[8px] cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#333333] focus:ring-[#333333]" />
                        <span className="text-[14px] text-[#1F2937] font-medium">{crit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-[16px]">
              <button onClick={() => setActiveModal("none")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Preview
              </button>
              <button className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Create Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Step 1 */}
      {activeModal === "generate_step1" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans mb-1">
                  Generate Graduation Certificates
                </h2>
                <p className="text-[14px] text-[#6B7280] font-rubik">
                  Step 1 of 4 — Choose template & background
                </p>
              </div>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((step, index) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0
                      ${step <= 1 ? 'bg-[#333333] text-white' : 'bg-white border border-gray-200 text-[#4B5563]'}`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-[3px] mx-4 rounded-full ${step < 1 ? 'bg-[#4B5563]' : 'bg-[#F2F4F8]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">Select Cohort</p>
                  <div className="relative">
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 appearance-none bg-transparent text-gray-500">
                      <option>Choose Cohort</option>
                      <option>Cohort 2024A</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>

                <div>
                  <p className="text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">Choose Background/Template</p>
                  <div className="grid grid-cols-3 gap-4">
                    {bgTemplates.map((bg) => (
                      <div key={bg.id} className="border border-gray-200 rounded-[8px] p-3 cursor-pointer hover:border-gray-300 transition-colors">
                        <div className="h-20 bg-[#E5E7EB] rounded-[4px] mb-3 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={16} className="mb-1" />
                          <span className="text-[10px]">{bg.name}</span>
                        </div>
                        <p className="text-[12px] font-bold text-[#1F2937] font-dm-sans leading-tight mb-1">{bg.name}</p>
                        <p className="text-[10px] text-[#6B7280] font-rubik leading-tight">{bg.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FAFAFA] border border-gray-100 rounded-[8px] p-4 text-[14px] text-[#6B7280]">
                  Auto-fill fields: Mentee name • Cohort • Date of completion • Certificate ID • Program signatory
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-white rounded-b-[16px]">
              <button onClick={() => setActiveModal("none")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setActiveModal("generate_step2")} className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Next: Review Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Step 2 */}
      {activeModal === "generate_step2" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans mb-1">
                  Generate Graduation Certificates
                </h2>
                <p className="text-[14px] text-[#6B7280] font-rubik">
                  Step 2 of 4 — Review system suggestions
                </p>
              </div>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((step, index) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0
                      ${step <= 2 ? 'bg-[#333333] text-white' : 'bg-white border border-gray-200 text-[#4B5563]'}`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-[3px] mx-4 rounded-full ${step < 2 ? 'bg-[#4B5563]' : 'bg-[#F2F4F8]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-[#FAFAFA] rounded-[8px] p-4 mb-6 border border-gray-100">
                <p className="text-[13px] text-[#1F2937] font-medium">
                  <strong>System found 7 mentees</strong> who completed all goals in Cohort 2024A. Select who deserves graduation certificates.
                </p>
              </div>

              <div className="border border-gray-200 rounded-[12px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                      <th className="py-3 px-4 w-[40px]">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#333333] focus:ring-[#333333]" />
                      </th>
                      <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Recipient</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Goals</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Attend</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueGraduates.map((g, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#333333] focus:ring-[#333333]" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                              <User size={14} />
                            </div>
                            <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">
                              {g.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[13px] font-medium text-[#4B5563]">
                          {g.goals}
                        </td>
                        <td className="py-4 px-4 text-[13px] font-medium text-[#4B5563]">
                          {g.attendance}
                        </td>
                        <td className="py-4 px-4 text-[13px] font-medium text-[#4B5563]">
                          {g.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-white rounded-b-[16px]">
              <button onClick={() => setActiveModal("generate_step1")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setActiveModal("generate_step3")} className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Next: Confirm Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Step 3 */}
      {activeModal === "generate_step3" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans mb-1">
                  Generate Graduation Certificates
                </h2>
                <p className="text-[14px] text-[#6B7280] font-rubik">
                  Step 3 of 4 — Review system suggestions
                </p>
              </div>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((step, index) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0
                      ${step <= 3 ? 'bg-[#333333] text-white' : 'bg-white border border-gray-200 text-[#4B5563]'}`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-[3px] mx-4 rounded-full ${step < 3 ? 'bg-[#4B5563]' : 'bg-[#F2F4F8]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#FAFAFA] rounded-[8px] p-4">
                  <p className="text-[12px] text-[#6B7280] font-rubik mb-1">Template</p>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">Year 2 Graduation</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-[8px] p-4">
                  <p className="text-[12px] text-[#6B7280] font-rubik mb-1">Background</p>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">Classic Gold</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-[8px] p-4">
                  <p className="text-[12px] text-[#6B7280] font-rubik mb-1">Recipients</p>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">2 mentees</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-[8px] p-4">
                  <p className="text-[12px] text-[#6B7280] font-rubik mb-1">Date Of Issue</p>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">Mar 12, 2026</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-[12px] p-6 mb-6">
                <h3 className="text-[15px] font-bold text-[#4B5563] font-dm-sans mb-4 border-b border-gray-100 pb-4">
                  Recipients Preview (auto-pulled from profile)
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Mwangi", details: "Cohort 2024A • Completed Mar 12, 2026 • CERT-2026-1000" },
                    { name: "Michael Albert", details: "Cohort 2024A • Completed Mar 14, 2026 • CERT-2026-1001" }
                  ].map((r, i) => (
                    <div key={i} className="border border-gray-100 rounded-[8px] p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1F2937] font-dm-sans">{r.name}</p>
                        <p className="text-[12px] text-[#6B7280] font-rubik">{r.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-gray-100 rounded-[8px] p-4 text-[13px] text-[#6B7280]">
                A unique certificate PDF will be generated for each mentee using their name, cohort, and completion date. Recipients will be notified via email.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-white rounded-b-[16px]">
              <button onClick={() => setActiveModal("generate_step2")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setActiveModal("generate_step4")} className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Generate 2 Certificates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Step 4 (Success) */}
      {activeModal === "generate_step4" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans mb-1">
                  Generate Graduation Certificates
                </h2>
                <p className="text-[14px] text-[#6B7280] font-rubik">
                  Step 4 of 4 — Complete
                </p>
              </div>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((step, index) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0
                      ${step <= 4 ? 'bg-[#333333] text-white' : 'bg-white border border-gray-200 text-[#4B5563]'}`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-[3px] mx-4 rounded-full ${step < 4 ? 'bg-[#4B5563]' : 'bg-[#F2F4F8]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center py-8">
                <div className="text-[48px] mb-4">🎉</div>
                <h3 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-3">
                  Certificates Generated!
                </h3>
                <p className="text-[15px] text-[#4B5563] font-rubik max-w-[400px] mx-auto mb-8">
                  2 unique certificates were created using the Classic Gold design and sent to each mentee.
                </p>

                <div className="flex justify-center gap-4">
                  <div className="bg-[#FAFAFA] rounded-[12px] p-6 w-[120px]">
                    <p className="text-[24px] font-bold text-[#1F2937] font-dm-sans leading-none mb-2">2</p>
                    <p className="text-[11px] font-medium text-[#6B7280]">Generated</p>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-[12px] p-6 w-[120px]">
                    <p className="text-[24px] font-bold text-[#1F2937] font-dm-sans leading-none mb-2">2</p>
                    <p className="text-[11px] font-medium text-[#6B7280]">Emailed</p>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-[12px] p-6 w-[120px]">
                    <p className="text-[24px] font-bold text-[#1F2937] font-dm-sans leading-none mb-2">0</p>
                    <p className="text-[11px] font-medium text-[#6B7280]">Failed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-[16px]">
              <button onClick={() => setActiveModal("none")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Close
              </button>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                  View Sample
                </button>
                <button className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Certificate Preview */}
      {activeModal === "preview_certificate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans">
                Certificate Preview
              </h2>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 bg-[#F9FAFB] flex justify-center">
              {/* Actual Certificate Document Design */}
              <div className="bg-white border border-gray-200 shadow-sm w-[600px] p-12 text-center relative overflow-hidden">
                <div className="absolute inset-2 border-[2px] border-[#E5E7EB]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#F3F4F6] flex flex-col items-center justify-center text-gray-400 mb-6">
                    <ImageIcon size={20} className="mb-1" />
                    <span className="text-[10px]">Org Logo</span>
                  </div>
                  
                  <p className="text-[14px] text-[#6B7280] font-medium uppercase tracking-wider mb-8">
                    Masterclass Mentorship Platform
                  </p>
                  
                  <h1 className="text-[32px] font-bold text-[#1F2937] font-dm-sans mb-6">
                    Certificate of Completion
                  </h1>
                  
                  <p className="text-[15px] text-[#6B7280] font-medium mb-6">
                    This is to certify that
                  </p>
                  
                  <p className="text-[28px] font-bold text-[#1F2937] border-b-2 border-[#1F2937] px-8 pb-2 mb-10 inline-block font-dm-sans">
                    [Participant Name]
                  </p>
                  
                  <p className="text-[14px] text-[#4B5563] max-w-[400px] leading-relaxed mb-16 mx-auto">
                    has successfully completed all requirements of the mentorship program for the designated cohort year.
                  </p>
                  
                  <div className="flex justify-between w-full px-8 mb-12">
                    <div className="text-center w-[160px]">
                      <div className="border-b border-gray-300 pb-2 mb-2">
                        <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">[Program Director]</span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">Director of Mentorship</span>
                    </div>
                    <div className="text-center w-[160px]">
                      <div className="border-b border-gray-300 pb-2 mb-2">
                        <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">[Date Issued]</span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">Issue Date</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-[#9CA3AF]">
                    Certificate ID: CERT-2026-XXXX • Verify at platform.com/verify
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-[16px]">
              <button className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Edit Template
              </button>
              <button className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Issue Certificates */}
      {activeModal === "bulk_issue" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[600px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans mb-1">
                  Bulk Issue Certificates
                </h2>
                <p className="text-[14px] text-[#6B7280] font-rubik">
                  Issue certificates to an entire cohort at once.
                </p>
              </div>
              <button onClick={() => setActiveModal("none")} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">Select Template</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 appearance-none bg-transparent text-gray-500">
                    <option>Choose Template</option>
                    {templates.map((t, i) => <option key={i}>{t.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">Select Cohort</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 appearance-none bg-transparent text-gray-500">
                    <option>Choose Cohort</option>
                    <option>Cohort 2024A</option>
                    <option>Cohort 2024B</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">Summary</label>
                <div className="bg-[#FAFAFA] border border-gray-100 rounded-[8px] p-4 text-[14px] text-[#4B5563]">
                  25 participants eligible • 3 criteria checks • Auto-verify enabled
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-3 bg-white rounded-b-[16px] mt-2">
              <button onClick={() => setActiveModal("none")} className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                Issue Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
