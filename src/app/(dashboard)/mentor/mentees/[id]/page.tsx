"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Calendar,
  Clock,
  Trophy,
  Award,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMentee } from "@/lib/services/users";
import { fetchGoals } from "@/lib/services/goals";
import {
  fetchReflections,
  submitReflectionFeedback,
} from "@/lib/services/reflections";
import { endorseCertificate } from "@/lib/services/certificates";
import { errorMessage } from "@/lib/api";
import {
  ApiState,
  formatDate,
  formatDateTime,
  safeWebUrl,
} from "@/components/shared/ApiUI";

export default function MenteeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const resource = useApiResource(`mentee:${id}`, (auth) =>
    fetchMentee(auth, id),
  );
  const goals = useApiResource(
    `mentee-goals:${id}`,
    (auth) => fetchGoals(auth, id),
    Boolean(resource.data),
  );
  const reflections = useApiResource(
    `mentee-reflections:${id}`,
    (auth) => fetchReflections(auth, id),
    Boolean(resource.data),
  );
  const profile = resource.data?.profile;
  const sessions = resource.data?.sessions || [];
  const completed = goals.data?.filter(
    (goal) => goal.status === "completed",
  ).length;
  const [activeTab, setActiveTab] = useState("Overview");
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | number | null>(
    null,
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [endorsingCertId, setEndorsingCertId] = useState<
    string | number | null
  >(null);
  const [endorsedIds, setEndorsedIds] = useState<(string | number)[]>([]);
  const [certNotice, setCertNotice] = useState<string | null>(null);

  const handleEndorseCertificate = async (certId: string | number) => {
    if (!token || endorsingCertId !== null) return;
    setEndorsingCertId(certId);
    setCertNotice(null);
    try {
      await endorseCertificate(token, certId, {
        notes: "Endorsed by assigned mentor.",
      });
      setEndorsedIds((prev) => [...prev, certId]);
      setCertNotice("Certificate endorsed successfully.");
      resource.reload();
    } catch (err) {
      setCertNotice(errorMessage(err));
    } finally {
      setEndorsingCertId(null);
    }
  };

  const handleSendFeedback = async (reflectionId: string | number) => {
    if (!token || !feedbackText.trim() || feedbackBusy) return;
    setFeedbackBusy(true);
    setFeedbackNotice(null);
    try {
      await submitReflectionFeedback(token, reflectionId, feedbackText.trim());
      setFeedbackText("");
      setReplyingToId(null);
      setFeedbackNotice("Mentor feedback saved.");
      reflections.reload();
    } catch (err) {
      setFeedbackNotice(errorMessage(err));
    } finally {
      setFeedbackBusy(false);
    }
  };

  const apiAchievements = (resource.data?.achievements || []).map((a) => ({
    title: a.title,
    subtitle:
      a.subtitle ||
      a.description ||
      (a.year !== undefined && a.year !== null ? String(a.year) : "Milestone"),
  }));

  const derivedAchievements =
    apiAchievements.length > 0
      ? apiAchievements
      : [
          ...(goals.data || [])
            .filter((g) => g.status === "completed")
            .map((g) => ({
              title: `Goal Completed: ${g.title}`,
              subtitle: g.category || "Milestone",
            })),
          ...(sessions.filter((s) => s.status === "completed").length > 0
            ? [
                {
                  title: `${sessions.filter((s) => s.status === "completed").length} Mentorship Session${sessions.filter((s) => s.status === "completed").length === 1 ? "" : "s"} Completed`,
                  subtitle: "Active mentorship cadence",
                },
              ]
            : []),
          ...((reflections.data?.length || 0) > 0
            ? [
                {
                  title: `${reflections.data?.length} Reflection${reflections.data?.length === 1 ? "" : "s"} Logged`,
                  subtitle: "Consistent self-reflection",
                },
              ]
            : []),
        ];

  const apiCertificates = resource.data?.certificates || [];

  return (
    <div className="w-full pb-10 space-y-6">
      <ApiState {...resource} onRetry={resource.reload} />
      {/* Profile Header Card */}
      <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Banner */}
        <div className="h-[120px] bg-gradient-to-r from-[#FDF1DD] to-[#80B68C] w-full" />

        {/* Info Area */}
        <div className="relative pt-[60px] px-8 pb-8">
          {/* Avatar */}
          <div className="absolute -top-12 left-8">
            <img
              src={
                safeWebUrl(
                  String(
                    profile?.avatar_url ||
                      resource.data?.user.avatarUrl ||
                      "",
                  ),
                ) || "/icons/user-placeholder.svg"
              }
              alt="Mentee"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/icons/user-placeholder.svg";
              }}
              className="w-[88px] h-[88px] rounded-full border-4 border-white object-cover bg-white"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-medium text-gray-900 font-sans">
                {resource.data?.user.name || "—"}
              </h2>
              <p className="text-[14px] text-gray-500 font-sans mt-0.5">
                {[
                  resource.data?.user.journeyYear
                    ? `Year ${resource.data.user.journeyYear} Participant`
                    : "Participant",
                  resource.data?.user.cohorts?.map((c) => c.name).join(", "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-[14.5px] text-gray-700 font-sans mt-4 max-w-2xl leading-relaxed">
                {typeof profile?.bio === "string" ? profile.bio : ""}
              </p>
            </div>
            <button
              onClick={() => setIsBookSessionOpen(true)}
              className="px-5 py-2.5 bg-[#DB911E] text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-[#BA7815] transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
            >
              <img
                src="/icons/book-session.svg"
                alt=""
                className="w-[15px] h-[14px] shrink-0"
              />
              Book Session
            </button>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-[13.5px] text-gray-500 font-sans">
                <Mail className="w-4 h-4" />
                {resource.data?.user.email || "—"}
              </div>
              <div className="flex items-center gap-2 text-[13.5px] text-gray-500 font-sans">
                <MapPin className="w-4 h-4" />
                {[profile?.city, profile?.country]
                  .filter((value) => typeof value === "string" && value)
                  .join(", ") || "—"}
              </div>
              <div className="flex items-center gap-2 text-[13.5px] text-gray-500 font-sans">
                <Clock className="w-4 h-4" />
                {sessions.length
                  ? `Last session ${formatDateTime([...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())[0].sessionDate)}`
                  : "Last session unavailable"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#F3F4F6] text-gray-500 rounded-full text-[11px] font-medium font-sans">
                Career
              </span>
              <span className="px-3 py-1 bg-[#F3F4F6] text-gray-500 rounded-full text-[11px] font-medium font-sans">
                Finance
              </span>
              <span className="px-3 py-1 bg-[#F3F4F6] text-gray-500 rounded-full text-[11px] font-medium font-sans">
                Wellbeing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Sessions",
            value: resource.data ? String(sessions.length) : "—",
          },
          {
            label: "Reflections",
            value: reflections.data ? String(reflections.data.length) : "—",
          },
          {
            label: "Goals done",
            value: goals.data ? `${completed}/${goals.data.length}` : "—",
          },
          {
            label: "Certificates",
            value: resource.data
              ? String(
                  Array.isArray((resource.data as Record<string, unknown>).certificates)
                    ? ((resource.data as Record<string, unknown>).certificates as unknown[]).length
                    : completed && completed > 0
                      ? 1
                      : 0,
                )
              : "—",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="text-[24px] font-medium text-gray-900 font-sans mb-1">
              {stat.value}
            </div>
            <div className="text-[13.5px] text-gray-500 font-sans">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="bg-white rounded-full p-1 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] inline-flex min-w-max">
          {[
            { id: "Overview", count: null },
            { id: "Goals", count: goals.data?.length ?? null },
            { id: "Sessions", count: resource.data?.sessions?.length ?? null },
            { id: "Reflections", count: reflections.data?.length ?? null },
            { id: "Certificates", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 text-[12.5px] sm:text-[13px] font-medium rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0F172A] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.id}
              {tab.count !== null && (
                <span
                  className={`text-[11px] font-medium ${activeTab === tab.id ? "text-white/60" : "text-gray-400"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Goals in motion */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col">
            <h3 className="text-[16px] font-medium text-gray-900 font-sans mb-6">
              Goals in motion
            </h3>

            <div className="flex flex-col gap-6">
              <ApiState {...goals} onRetry={goals.reload} />
              {goals.data?.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white border border-gray-200 rounded-[12px] p-5"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[14.5px] font-medium text-[#0F172A] font-sans">
                      {goal.title}
                    </div>
                    <div className="text-[13px] text-gray-500 font-sans">
                      {goal.status === "completed"
                        ? "100%"
                        : goal.status === "not_started"
                          ? "0%"
                          : "50%"}
                    </div>
                  </div>
                  <div className="text-[13.5px] text-gray-500 font-sans mb-4">
                    {goal.description}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-[5px] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        goal.status === "completed"
                          ? "bg-[#8DB58D]"
                          : "bg-[#DB911E]"
                      }`}
                      style={{
                        width:
                          goal.status === "completed"
                            ? "100%"
                            : goal.status === "in_progress"
                              ? "50%"
                              : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
              {goals.data?.length === 0 && (
                <p className="text-sm text-gray-500">No goals yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Achievements */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col">
            <h3 className="text-[16px] font-medium text-gray-900 font-sans mb-6">
              Achievements
            </h3>

            <div className="flex flex-col gap-4">
              {derivedAchievements.length > 0 ? (
                derivedAchievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 border border-gray-100 rounded-[12px] bg-[#FAF9F6]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#FCF9F0] flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-[#DB911E]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-gray-900 font-sans">
                        {item.title}
                      </p>
                      <p className="text-[12.5px] text-gray-500 font-sans mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No achievements recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Goals" && (
        <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="mb-6">
            <h3 className="text-[18px] font-medium text-[#0F172A] font-sans mb-1">
              All goals
            </h3>
            <p className="text-[14px] text-gray-500 font-sans">
              {completed ?? "—"} of {goals.data?.length ?? "—"} goals completed
              on the journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApiState {...goals} onRetry={goals.reload} />
            {goals.data?.map((goal) => (
              <div
                key={goal.id}
                className="bg-white border border-gray-200 rounded-[12px] p-5"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[14.5px] font-medium text-[#0F172A] font-sans">
                    {goal.title}
                  </div>
                  <div className="text-[13px] text-gray-500 font-sans">
                    {goal.status === "completed"
                      ? "100%"
                      : goal.status === "not_started"
                        ? "0%"
                        : "50%"}
                  </div>
                </div>
                <div className="text-[13.5px] text-gray-500 font-sans mb-4">
                  {goal.description}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-[5px] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      goal.status === "completed"
                        ? "bg-[#8DB58D]"
                        : "bg-[#DB911E]"
                    }`}
                    style={{
                      width:
                        goal.status === "completed"
                          ? "100%"
                          : goal.status === "in_progress"
                            ? "50%"
                            : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
            {goals.data?.length === 0 && (
              <p className="text-sm text-gray-500">No goals yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "Sessions" && (
        <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="text-[18px] font-medium text-[#0F172A] font-sans mb-6">
            Session history
          </h3>

          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-gray-200 rounded-[12px] p-5 flex items-center justify-between"
              >
                <div>
                  <div className="text-[14.5px] font-medium text-[#0F172A] font-sans mb-1">
                    {session.title}
                  </div>
                  <div className="text-[13.5px] text-gray-500 font-sans">
                    {formatDateTime(session.sessionDate)} · {session.status}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {session.sessionSummary}
                  </p>
                </div>
              </div>
            ))}
            {resource.data && !sessions.length && (
              <p className="text-sm text-gray-500">No sessions yet.</p>
            )}
            {/* More session cards can go here in the future */}
          </div>
        </div>
      )}

      {activeTab === "Reflections" && (
        <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="text-[18px] font-medium text-[#0F172A] font-sans mb-6">
            Reflection exchange
          </h3>

          {feedbackNotice && (
            <p className="mb-4 text-sm text-emerald-700">{feedbackNotice}</p>
          )}

          <div className="flex flex-col gap-4">
            <ApiState {...reflections} onRetry={reflections.reload} />
            {reflections.data?.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-[12px] p-5"
              >
                <div className="text-[14.5px] font-medium text-[#0F172A] font-sans mb-1">
                  {item.title}
                </div>
                <p className="text-[13.5px] text-gray-500 font-sans">
                  {formatDateTime(item.createdAt)}
                </p>
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {item.content}
                </p>
                {item.mentorFeedbackText ? (
                  <div className="mt-4 bg-[#F8F7F5] rounded-[10px] p-4">
                    <div className="flex items-center gap-2 mb-1.5 text-[#DB911E]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[12.5px] font-medium font-sans">
                        Mentor’s Response
                      </span>
                    </div>
                    <p className="text-[13.5px] text-gray-700 font-sans">
                      {item.mentorFeedbackText}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    {replyingToId === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Write mentor feedback for this reflection..."
                          className="w-full h-24 p-3 bg-[#F9FAFB] border border-gray-200 rounded-[10px] text-[13.5px] font-sans focus:outline-none focus:border-[#DB911E]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setFeedbackText("");
                            }}
                            className="px-4 py-1.5 border border-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={feedbackBusy || !feedbackText.trim()}
                            onClick={() => void handleSendFeedback(item.id)}
                            className="px-4 py-1.5 bg-[#DB911E] text-white text-xs font-medium rounded-lg hover:bg-[#BA7815] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {feedbackBusy ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              "Send Feedback"
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(item.id);
                          setFeedbackText("");
                        }}
                        className="text-[13px] font-medium text-[#DB911E] hover:text-[#BA7815] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Leave mentor feedback</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {reflections.data?.length === 0 && (
              <p className="text-sm text-gray-500">No reflections yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "Certificates" && (
        <div className="bg-white border border-gray-200 rounded-[16px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="text-[18px] font-medium text-[#0F172A] font-sans mb-6">
            Certificates
          </h3>

          {certNotice && (
            <p className="mb-4 text-sm text-emerald-700">{certNotice}</p>
          )}

          <div className="flex flex-col gap-4">
            {apiCertificates.length > 0 ? (
              apiCertificates.map((cert, idx) => {
                const certId = cert.id ?? idx;
                const statusLower = (cert.status || "").toLowerCase();
                const isEndorsedOrIssued =
                  ["issued", "earned", "completed", "endorsed"].includes(
                    statusLower,
                  ) || endorsedIds.includes(certId);
                return (
                  <div
                    key={String(certId)}
                    className="border border-gray-200 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F7F5]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#EBEFE4] flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-[#8DB58D]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-medium text-gray-900 font-sans">
                          {cert.title || cert.name || "Certificate"}
                        </h4>
                        <p className="text-[13px] text-gray-500 font-sans">
                          {cert.description ||
                            (cert.issued_at || cert.issue_date
                              ? `Issued ${formatDate(cert.issued_at || cert.issue_date)}`
                              : "Mentorship milestone certificate")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[#EBEFE4] text-[#1F2937] rounded-full text-[12px] font-medium capitalize">
                        {endorsedIds.includes(certId)
                          ? "Endorsed"
                          : (cert.status || "Issued").replace(/_/g, " ")}
                      </span>
                      {cert.id !== undefined && !isEndorsedOrIssued && (
                        <button
                          type="button"
                          disabled={endorsingCertId === cert.id}
                          onClick={() => void handleEndorseCertificate(cert.id!)}
                          className="px-4 py-1.5 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-50 text-white rounded-[8px] text-[12.5px] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {endorsingCertId === cert.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Endorsing...</span>
                            </>
                          ) : (
                            "Endorse"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : completed && completed > 0 ? (
              <div className="border border-gray-200 rounded-[12px] p-5 flex items-center justify-between bg-[#F8F7F5]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EBEFE4] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#8DB58D]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-medium text-gray-900 font-sans">
                      Foundation Milestone Certificate
                    </h4>
                    <p className="text-[13px] text-gray-500 font-sans">
                      Earned through goal and session completion
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#EBEFE4] text-[#1F2937] rounded-full text-[12px] font-medium">
                  Earned
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No certificates issued for this mentee yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={isBookSessionOpen}
        preselectedMentee={id}
        onSuccess={resource.reload}
        onClose={() => setIsBookSessionOpen(false)}
        title={
          resource.data?.user.name
            ? `Book Session with ${resource.data.user.name}`
            : "Book Session"
        }
      />
    </div>
  );
}
