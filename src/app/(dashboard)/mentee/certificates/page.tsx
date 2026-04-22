"use client";

import { useState } from "react";
import { Image, X } from "lucide-react";

interface Certificate {
  id: number;
  title: string;
  cohort: string;
  issued: string;
  certId: string;
}

const earnedCertificates: Certificate[] = [
  {
    id: 1,
    title: "Certificate of Year 1 Completion",
    cohort: "2024A",
    issued: "Issued Jan 2025",
    certId: "ID: CERT-2025-0018",
  },
  {
    id: 2,
    title: "Masterclass Completion",
    cohort: "2024A",
    issued: "Issued Mar 2025",
    certId: "ID: CERT-2025-0018",
  },
];

const inProgressCriteria = [
  { label: "Complete Year 2 modules", done: true },
  { label: "Attend ≥80% sessions", done: true },
  { label: "Submit final reflection", done: true },
  { label: "Mentor endorsement", done: false },
];

const availableCertificates = [
  {
    id: 1,
    title: "Year 3 Graduation",
    description: "Complete all 3 years",
    status: "Not Yet Eligible",
  },
  {
    id: 2,
    title: "Leadership Excellence",
    description: "Top 10% engagement + mentor nomination",
    status: "Not Yet Eligible",
  },
  {
    id: 3,
    title: "Community Impact Award",
    description: "Lead 2+ community projects",
    status: "Not Yet Eligible",
  },
];

/** Derives a short display title from the full certificate title */
function getShortTitle(title: string): string {
  // e.g. "Certificate of Year 1 Completion" → "Year 1 Completion"
  return title.replace(/^Certificate of\s+/i, "");
}

// ---------------------------------------------------------------------------
// Certificate Preview Modal
// ---------------------------------------------------------------------------
function CertificatePreviewModal({
  cert,
  onClose,
}: {
  cert: Certificate;
  onClose: () => void;
}) {
  // Derive a clean cert ID for display (strip "ID: " prefix if present)
  const displayCertId = cert.certId.replace(/^ID:\s*/i, "");

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Modal panel — wide to match screenshot */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-6 p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] font-bold text-gray-900 font-heading">
            {getShortTitle(cert.title)}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="border border-gray-200 rounded-2xl px-12 py-10 bg-white text-center">
          {/* Logo placeholder */}
          <div className="mx-auto mb-6 w-[72px] h-[72px] bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
            <Image className="h-7 w-7 text-gray-400 mb-1" />
            <span className="text-[12px] text-gray-400 font-sans">Logo</span>
          </div>

          {/* Platform name */}
          <p className="text-[15px] text-gray-500 font-sans mb-5">
            Masterclass Mentorship Platform
          </p>

          {/* Certificate title */}
          <h3 className="text-[26px] font-bold text-gray-900 font-heading mb-5">
            {cert.title}
          </h3>

          {/* Certify text */}
          <p className="text-[15px] text-gray-500 font-sans mb-5">
            This is to certify that
          </p>

          {/* Recipient name — underline spans just the text */}
          <div className="flex justify-center mb-7">
            <span className="text-[26px] font-bold text-gray-900 font-heading border-b-2 border-gray-900 px-2 pb-1 leading-tight">
              [Your Name]
            </span>
          </div>

          {/* Body text */}
          <p className="text-[15px] text-gray-600 font-sans mb-6">
            has successfully completed all requirements of the mentorship program.
          </p>

          {/* Certificate ID */}
          <p className="text-[13px] text-gray-400 font-sans">
            Certificate ID: {displayCertId}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button className="px-7 py-3 border border-gray-300 text-gray-800 text-[15px] font-medium rounded-xl hover:bg-gray-50 transition-colors font-sans">
            Share
          </button>
          <button className="px-7 py-3 bg-[#1a1a1a] text-white text-[15px] font-medium rounded-xl hover:bg-black transition-colors font-sans">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MenteeCertificatesPage() {
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  return (
    <div className="space-y-6 pb-10">
      {/* Certificate Preview Modal */}
      {previewCert && (
        <CertificatePreviewModal
          cert={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#003F3A] font-heading mb-1">
          My Certificates
        </h1>
        <p className="text-[14px] text-gray-500 font-sans">
          View, download, and share your earned certificates
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center justify-center py-8 border border-gray-200 rounded-xl bg-white">
          <span className="text-[32px] font-bold text-gray-900 font-heading leading-none mb-2">2</span>
          <span className="text-[13px] text-gray-500 font-sans">Certificates Earned</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 border border-gray-200 rounded-xl bg-white">
          <span className="text-[32px] font-bold text-gray-900 font-heading leading-none mb-2">1</span>
          <span className="text-[13px] text-gray-500 font-sans">In Progress</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 border border-gray-200 rounded-xl bg-white">
          <span className="text-[32px] font-bold text-gray-900 font-heading leading-none mb-2">3</span>
          <span className="text-[13px] text-gray-500 font-sans">Available</span>
        </div>
      </div>

      {/* Earned Certificates */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-[18px] font-bold text-[#003F3A] font-heading mb-6">
          Earned Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnedCertificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                  <Image className="h-5 w-5 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-400 font-sans">Cert</span>
                </div>
                {/* Info */}
                <div>
                  <p className="text-[14px] font-bold text-gray-900 font-heading mb-0.5">
                    {cert.title}
                  </p>
                  <p className="text-[12px] text-gray-500 font-sans mb-0.5">
                    {cert.cohort} • {cert.issued}
                  </p>
                  <p className="text-[12px] text-gray-400 font-sans">
                    {cert.certId}
                  </p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewCert(cert)}
                  className="px-4 py-2 bg-[#333333] text-white text-[13px] font-medium rounded-lg hover:bg-[#222222] transition-colors font-sans"
                >
                  Download PDF
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors font-sans">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-[18px] font-bold text-[#003F3A] font-heading mb-6">
          In Progress
        </h2>
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-start gap-4 mb-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
              <Image className="h-5 w-5 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-400 font-sans">Cert</span>
            </div>
            {/* Info */}
            <div className="flex-1">
              <p className="text-[15px] font-bold text-gray-900 font-heading mb-0.5">
                Year 2 Completion
              </p>
              <p className="text-[12px] text-gray-500 font-sans mb-0.5">
                Cohort 2024A • Expected: Dec 2026
              </p>
              <p className="text-[12px] text-gray-500 font-sans">
                Criteria Progress (3/4)
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-800 rounded-full"
                style={{ width: "75%" }}
              />
            </div>
            <span className="text-[13px] font-bold text-gray-700 font-sans w-10 text-right">
              75%
            </span>
          </div>

          {/* Criteria Checklist */}
          <div className="space-y-2">
            {inProgressCriteria.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                {item.done ? (
                  <svg className="h-4 w-4 text-gray-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
                )}
                <span className={`text-[13px] font-sans ${item.done ? "text-gray-700" : "font-bold text-gray-900"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Certificates */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-[18px] font-bold text-[#003F3A] font-heading mb-6">
          Available Certificates
        </h2>
        <div className="space-y-3">
          {availableCertificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4"
            >
              <div>
                <p className="text-[14px] font-bold text-gray-900 font-heading mb-0.5">
                  {cert.title}
                </p>
                <p className="text-[12px] text-gray-500 font-sans">
                  {cert.description}
                </p>
              </div>
              <span className="px-4 py-2 border border-gray-200 text-gray-500 text-[12px] font-medium rounded-lg font-sans whitespace-nowrap ml-4">
                {cert.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
