"use client";

import {
  Award,
  Eye,
  Share2,
  Download,
  CheckCircle2,
  Circle,
  Lock,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { ApiState, FormError, formatDate } from "@/components/shared/ApiUI";
import { StatsCardsSkeleton, CardGridSkeleton } from "@/components/shared/Skeletons";
import { errorMessage } from "@/lib/api";
import {
  fetchMyCertificates,
  fetchCertificate,
  certificateTitle,
  certificateStatus,
  downloadCertificate,
  shareCertificate,
  requestCertificate,
  type CertificateItem,
} from "@/lib/services/certificates";

export default function MenteeCertificatesPage() {
  const { token } = useAuth();
  const resource = useApiResource("certificates", fetchMyCertificates);
  const [selected, setSelected] = useState<CertificateItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const detail = useApiResource(
    `certificate:${selected?.id}`,
    (auth) => fetchCertificate(auth, selected!.id),
    showPreview && Boolean(selected),
  );
  const certificate = detail.data || selected;
  const [busy, setBusy] = useState(false);
  const [activeAction, setActiveAction] = useState<{
    id: string | number;
    type: "download" | "share" | "request";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [notice, setNotice] = useState("");
  const items = resource.data?.items || [];
  const earned = items.filter((item) =>
    ["issued", "earned", "completed"].includes(certificateStatus(item)),
  );
  const progress = items.filter((item) =>
    ["pending", "requested", "in_progress"].includes(certificateStatus(item)),
  );
  const available = items.filter(
    (item) => !earned.includes(item) && !progress.includes(item),
  );
  const act = async (
    item: CertificateItem,
    action: "download" | "share" | "request",
  ) => {
    if (!token || busy) return;
    setBusy(true);
    setActiveAction({ id: item.id, type: action });
    setError(null);
    setNotice("");
    setShareUrl("");
    try {
      if (action === "download") {
        const blob = await downloadCertificate(token, item.id);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `certificate-${String(item.id).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (action === "share")
        setShareUrl(await shareCertificate(token, item.id));
      else {
        await requestCertificate(token, item.id);
        setNotice("Certificate request submitted.");
        resource.reload();
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
      setActiveAction(null);
    }
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-10 pb-10 w-full">
      <ApiState {...resource} onRetry={resource.reload} />
      <FormError message={error} />
      {notice && (
        <p role="status" className="text-sm text-green-700">
          {notice}
        </p>
      )}
      {shareUrl && (
        <p className="text-sm text-gray-600">
          Share link:{" "}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all"
          >
            {shareUrl}
          </a>
        </p>
      )}
      {resource.loading ? (
        <div className="space-y-8">
          <StatsCardsSkeleton count={3} />
          <CardGridSkeleton count={2} />
        </div>
      ) : (
        <>
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <p className="text-[28px] font-medium text-gray-900 font-sans leading-none mb-2">
                {resource.data?.summary?.earned ??
                  (resource.data ? earned.length : "—")}
              </p>
              <p className="text-[13px] text-gray-500 font-sans">
                Certificates earned
              </p>
            </div>
            <div className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <p className="text-[28px] font-medium text-gray-900 font-sans leading-none mb-2">
                {resource.data?.summary?.in_progress ??
                  (resource.data ? progress.length : "—")}
              </p>
              <p className="text-[13px] text-gray-500 font-sans">In progress</p>
            </div>
            <div className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <p className="text-[28px] font-medium text-gray-900 font-sans leading-none mb-2">
                {resource.data?.summary?.available_to_unlock ??
                  (resource.data ? available.length : "—")}
              </p>
              <p className="text-[13px] text-gray-500 font-sans">
                Available to unlock
              </p>
            </div>
          </div>

          {/* Certificates Earned */}
          <section>
            <h2 className="text-[16px] font-medium text-gray-900 mb-5 font-sans">
              Certificates Earned
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {earned.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[16px] border border-gray-200 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col"
                >
                  <div className="bg-[#F8F7F5] rounded-xl p-4 md:p-5 mb-4 flex-1">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="text-[12px] text-gray-500 mb-1">
                          {[item.program?.name, item.cohort?.name]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <h3 className="text-[16px] md:text-[18px] font-medium text-gray-900">
                          {certificateTitle(item)}
                        </h3>
                      </div>
                      <Award className="w-6 h-6 text-[#8DB58D]" />
                    </div>
                    <div className="flex items-center gap-8 md:gap-12">
                      <div>
                        <p className="text-xs text-gray-400">Issued</p>
                        <p className="text-[13px] text-gray-900">
                          {formatDate(item.issued_at || item.issue_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Reference</p>
                        <p className="text-[13px] text-gray-900">
                          {item.reference || item.certificate_number || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3 px-1 mt-auto">
                    <button
                      onClick={() => {
                        setSelected(item);
                        setShowPreview(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs text-gray-600"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => act(item, "share")}
                      className="disabled:opacity-50 flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs text-gray-600"
                    >
                      {activeAction?.id === item.id &&
                      activeAction?.type === "share" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}{" "}
                      Share
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => act(item, "download")}
                      className="disabled:opacity-50 flex items-center gap-1.5 px-4 py-2 bg-[#DB911E] rounded-full text-xs text-white"
                    >
                      {activeAction?.id === item.id &&
                      activeAction?.type === "download" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}{" "}
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!resource.loading && !resource.error && earned.length === 0 && (
              <div className="rounded-[16px] border border-gray-200 bg-white p-6 text-sm text-gray-500">
                No certificates earned yet.
              </div>
            )}
          </section>

          {/* In Progress */}
          <section>
            <h2 className="text-[16px] font-medium text-gray-900 mb-5 font-sans">
              In Progress
            </h2>
            {progress.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[16px] border border-gray-200 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <h3 className="text-[15px] font-medium text-gray-900">
                  {certificateTitle(item)}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {certificateStatus(item).replace(/_/g, " ")}
                </p>
                {item.criteria && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.criteria.map((criterion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {criterion.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-[#8DB58D]" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {criterion.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!resource.loading && !resource.error && progress.length === 0 && (
              <div className="rounded-[16px] border border-gray-200 bg-white p-6 text-sm text-gray-500">
                No certificates in progress.
              </div>
            )}
          </section>

          {/* Available */}
          <section>
            <h2 className="text-[16px] font-medium text-gray-900 mb-5 font-sans">
              Available
            </h2>
            <div className="bg-white rounded-[16px] border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              {available.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 border-b border-gray-100 last:border-0 gap-3"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {certificateTitle(item)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                  {["available", "eligible", "unlocked"].includes(
                    certificateStatus(item),
                  ) ? (
                    <button
                      disabled={busy}
                      onClick={() => act(item, "request")}
                      className="disabled:opacity-50 px-5 py-2 bg-[#DB911E] rounded-full text-xs font-medium text-white inline-flex items-center gap-1.5"
                    >
                      {activeAction?.id === item.id &&
                      activeAction?.type === "request" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Requesting...</span>
                        </>
                      ) : (
                        "Request Certificate"
                      )}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-4 py-2 border border-gray-100 rounded-full text-xs text-gray-400">
                      <Lock className="h-3 w-3" />
                      {certificateStatus(item) === "unknown"
                        ? "Eligibility not provided"
                        : "Not Yet Eligible"}
                    </span>
                  )}
                </div>
              ))}
              {!resource.loading && !resource.error && available.length === 0 && (
                <p className="p-6 text-sm text-gray-500">
                  No available certificates.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Preview Modal */}
      {mounted &&
        showPreview &&
        certificate &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Certificate preview"
              className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl overflow-hidden relative flex flex-col mx-4"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-[17px] font-medium text-gray-900 font-sans mb-1">
                    {certificateTitle(certificate)}
                  </h2>
                  <p className="text-[12.5px] text-gray-500 font-sans">
                    Issued{" "}
                    {formatDate(
                      certificate.issued_at || certificate.issue_date,
                    )}{" "}
                    ·{" "}
                    {certificate.reference ||
                      certificate.certificate_number ||
                      "—"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ApiState {...detail} onRetry={detail.reload} />
              <FormError message={error} />
              {shareUrl && (
                <p className="px-6 py-3 text-sm text-gray-600">
                  Share link:{" "}
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all"
                  >
                    {shareUrl}
                  </a>
                </p>
              )}
              {/* Body */}
              <div className="px-10 py-10 flex flex-col items-center">
                <Award
                  className="w-11 h-11 text-[#8DB58D] mb-6"
                  strokeWidth={1.5}
                />

                <p className="text-[13px] text-gray-500 font-sans mb-2">
                  {certificate.program?.name || ""}
                </p>
                <h1 className="text-[22px] font-medium text-gray-900 font-sans mb-8">
                  {certificateTitle(certificate)}
                </h1>

                <p className="text-[13px] text-gray-500 font-sans mb-1.5">
                  Awarded to
                </p>
                <p className="text-[17px] font-medium text-gray-900 font-sans mb-8">
                  {certificate.mentee?.name || certificate.user?.name || "—"}
                </p>

                <p className="text-[13.5px] text-gray-500 font-sans text-center max-w-[340px] leading-relaxed mb-14">
                  {certificate.dedication || certificate.description || ""}
                </p>

                <div className="w-full flex items-start justify-between px-2 mb-6">
                  <div className="text-center w-32">
                    <div className="w-full h-px bg-gray-200 mb-3"></div>
                    <p className="text-[11px] text-gray-500 font-sans">
                      {certificate.signatory || ""}
                    </p>
                  </div>

                  <div className="text-center w-32">
                    <div className="w-full h-px bg-gray-200 mb-3"></div>
                    <p className="text-[11px] text-gray-500 font-sans">
                      {formatDate(
                        certificate.issued_at || certificate.issue_date,
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-[11.5px] text-gray-400 font-sans">
                  {certificate.reference ||
                    certificate.certificate_number ||
                    "—"}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-center gap-3">
                <button
                  disabled={busy}
                  onClick={() => act(certificate, "share")}
                  className="disabled:opacity-50 flex items-center gap-1.5 px-5 py-2 border border-gray-200 rounded-full text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                >
                  {activeAction?.id === certificate.id &&
                  activeAction?.type === "share" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}{" "}
                  Share
                </button>
                <button
                  disabled={busy}
                  onClick={() => act(certificate, "download")}
                  className="disabled:opacity-50 flex items-center gap-1.5 px-5 py-2 bg-[#DB911E] rounded-full text-[12.5px] font-medium text-white hover:bg-[#BA7815] transition-colors font-sans"
                >
                  {activeAction?.id === certificate.id &&
                  activeAction?.type === "download" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}{" "}
                  Download PDF
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
