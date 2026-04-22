import { UserCircle } from "lucide-react";
import { ProgramSwitcherWidget } from "@/components/dashboard/widgets/ProgramSwitcherWidget";

interface MentorDashboardStat {
  label: string;
  value: string;
}

interface MentorDashboardMentee {
  id: string;
  name: string;
  statusLine: string;
  lastSession: string;
}

interface MentorUpcomingSession {
  id: string;
  title: string;
  dateTime: string;
  mode: "Virtual" | "In-person";
}

interface MentorRecentSession {
  id: string;
  title: string;
  dateTime: string;
  duration: string;
  status: "Completed";
}

interface MentorGoalItem {
  id: string;
  title: string;
  subtext: string;
  status: "In Progress" | "Not Started";
}

interface MentorNoteItem {
  id: string;
  date: string;
}

interface MentorMeetingRequest {
  id: string;
  name: string;
  requestType: string;
  requestedDate: string;
}

export interface MentorDashboardData {
  stats: MentorDashboardStat[];
  mentees: MentorDashboardMentee[];
  upcomingSessions: MentorUpcomingSession[];
  recentSessions: MentorRecentSession[];
  menteeGoals: MentorGoalItem[];
  notes: MentorNoteItem[];
  meetingRequests: MentorMeetingRequest[];
}

interface MentorDashboardPageContentProps {
  data: MentorDashboardData;
}

const goalStatusStyles: Record<MentorGoalItem["status"], string> = {
  "In Progress": "bg-[#FCEFC6] text-[#003F3A]",
  "Not Started": "bg-[#F2F4F8] text-[#003F3A]",
};

const sessionModeStyles: Record<MentorUpcomingSession["mode"], string> = {
  Virtual: "bg-[#F2F4F8] text-[#003F3A]",
  "In-person": "bg-[#F2F4F8] text-[#003F3A]",
};

export default function MentorDashboardPageContent({
  data,
}: MentorDashboardPageContentProps) {
  return (
    <div className="space-y-6">
      {/* Program Switcher */}
      <ProgramSwitcherWidget />
    
      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[15px] border border-gray-100 p-8 text-center"
          >
            <p className="text-[24px] font-bold text-[#333333] font-dm-sans">
              {stat.value}
            </p>
            <p className="text-[12px] text-[#003F3A] font-rubik">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* My Mentees */}
      <div className="bg-white rounded-[15px] border border-gray-100 p-8">
        <h2 className="text-[20px] font-semibold text-[#003F3A] font-dm-sans mb-4 pb-4 border-b border-[#E5E7EB]">
          My Mentees
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.mentees.map((mentee) => (
            <div
              key={mentee.id}
              className="rounded-[12px] border border-[#E5E7EB] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F8] text-[#4B5563]">
                  <UserCircle className="h-5 w-5 text-[#4B5563]" />
                </div>
                <div>
                  <p className="text-[15.38px] font-medium text-[#3A4252] font-rubik">
                    {mentee.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">
                    {mentee.statusLine}
                  </p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">
                    {mentee.lastSession}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className="flex-1 rounded-md border border-[#D5DCEB] px-3 py-1.5 text-[12px] text-[#4B5563] font-rubik hover:bg-gray-50">
                  View Profile
                </button>
                <button className="flex-1 rounded-md bg-[#333333] px-3 py-1.5 text-[12px] text-white font-rubik hover:bg-[#222222]">
                  Log Session
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button className="rounded-md border border-[#D5DCEB] px-4 py-1.5 text-[12px] text-[#4B5563] font-rubik hover:bg-gray-50">
            View All Mentees
          </button>
        </div>
      </div>

      {/* Sessions Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-4 pb-4 border-b border-[#E5E7EB]">
            Upcoming Sessions
          </h2>
          <div className="space-y-4">
            {data.upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border-b border-[#E5E7EB] pb-3"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#003F3A] font-dm-sans">
                    {session.title}
                  </p>
                  <p className="text-[12px] text-[#003F3A] font-rubik font-regular">
                    {session.dateTime}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[12px] font-rubik ${
                    sessionModeStyles[session.mode]
                  }`}
                >
                  {session.mode}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md border border-[#D5DCEB] px-3 py-1.5 text-[12px] text-[#4B5563] font-rubik">
              View Calendar
            </button>
            <button className="rounded-md bg-[#333333] px-3 py-1.5 text-[12px] text-white font-rubik">
              Schedule New Session
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-4 pb-4 border-b border-[#E5E7EB]">
            Recent Sessions
          </h2>
          <div className="space-y-4">
            {data.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border-b border-[#E5E7EB] pb-3"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#003F3A] font-dm-sans">
                    {session.title}
                  </p>
                  <p className="text-[12px] text-[#003F3A] font-rubik font-regular">
                    {session.dateTime} • {session.duration}
                  </p>
                </div>
                <span className="rounded-md bg-[#333333] px-2.5 py-1 text-[12px] text-white font-rubik">
                  {session.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="rounded-md border border-[#D5DCEB] px-3 py-1.5 text-[12px] text-[#4B5563] font-rubik">
              View All Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Mentee Goals & Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-4 pb-4 border-b border-[#E5E7EB]">
            Mentee Goals (Requires Feedback)
          </h2>
          <div className="space-y-4">
            {data.menteeGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between border-b border-[#E5E7EB] pb-3"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#003F3A] font-dm-sans">
                    {goal.title}
                  </p>
                  <p className="text-[12px] text-[#003F3A] font-rubik font-regular">
                    {goal.subtext}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[12px] font-rubik ${
                    goalStatusStyles[goal.status]
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="rounded-md bg-[#333333] px-3 py-1.5 text-[12px] text-white font-rubik">
              Review All Goals
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-4 pb-4 border-b border-[#E5E7EB]">
            My Notes
          </h2>
          <div className="space-y-4">
            {data.notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3"
              >
                <div className="space-y-2">
                  <div className="h-2 w-36 rounded-full bg-[#E5E7EB]" />
                  <div className="h-2 w-24 rounded-full bg-[#E5E7EB]" />
                </div>
                <span className="text-[12px] text-[#003F3A] font-rubik">
                  {note.date}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="rounded-md bg-[#333333] px-3 py-1.5 text-[12px] text-white font-rubik">
              + Write a New Note
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Requests */}
      <div className="rounded-[15px] border border-[#FDE68A] bg-[#FCEFC680] p-8">
        <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-4 pb-4 border-b border-[#E5E7EB]">
          Meeting Requests
        </h2>
        <div className="space-y-4">
          {data.meetingRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F8] text-[#4B5563]">
                  <UserCircle className="h-5 w-5 text-[#4B5563]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1f2937] font-dm-sans">
                    {request.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">
                    {request.requestType} • Requested: {request.requestedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-md border border-[#D5DCEB] px-4 py-1.5 text-[12px] text-[#4B5563] font-rubik">
                  Reschedule
                </button>
                <button className="rounded-md bg-[#333333] px-4 py-1.5 text-[12px] text-white font-rubik">
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
