import MentorDashboardPageContent, {
  MentorDashboardData,
} from "@/components/dashboard/mentor/dashboard/MentorDashboardPageContent";

const mockMentorDashboardData: MentorDashboardData = {
  stats: [
    { label: "Total Mentees", value: "8" },
    { label: "Sessions This Month", value: "12" },
    { label: "Pending Reviews", value: "3" },
    { label: "Goals Mentees Completed", value: "24" },
  ],
  mentees: Array.from({ length: 6 }, (_, index) => ({
    id: `mentee-${index + 1}`,
    name: "Mentee Full Name",
    statusLine: "Year 2 • Active",
    lastSession: "Last Session: 2 days ago",
  })),
  upcomingSessions: [
    {
      id: "up-1",
      title: "Sarah M. - Monthly Check-in",
      dateTime: "Feb 15, 2025 @ 3:00 PM",
      mode: "Virtual",
    },
    {
      id: "up-2",
      title: "John D. - Goal Review",
      dateTime: "Feb 16, 2025 @ 10:00 AM",
      mode: "Virtual",
    },
    {
      id: "up-3",
      title: "Amina K. - Quarterly Review",
      dateTime: "Feb 18, 2025 @ 2:00 PM",
      mode: "In-person",
    },
  ],
  recentSessions: [
    {
      id: "rec-1",
      title: "Grace N. - Introduction Session",
      dateTime: "Feb 10, 2025",
      duration: "45 min",
      status: "Completed",
    },
    {
      id: "rec-2",
      title: "Michael A. - Goal Setting",
      dateTime: "Feb 8, 2025",
      duration: "30 min",
      status: "Completed",
    },
    {
      id: "rec-3",
      title: "Sarah M. - Progress Review",
      dateTime: "Feb 5, 2025",
      duration: "60 min",
      status: "Completed",
    },
  ],
  menteeGoals: [
    {
      id: "goal-1",
      title: "Sarah M.: Public Speaking Goal",
      subtext: "Awaiting your feedback",
      status: "In Progress",
    },
    {
      id: "goal-2",
      title: "John D.: Leadership Reading List",
      subtext: "Needs review",
      status: "In Progress",
    },
    {
      id: "goal-3",
      title: "Amina K.: Networking Plan",
      subtext: "Submitted for approval",
      status: "Not Started",
    },
  ],
  notes: [
    { id: "note-1", date: "Jan 13, 2026" },
    { id: "note-2", date: "Jan 12, 2026" },
    { id: "note-3", date: "Jan 11, 2026" },
  ],
  meetingRequests: [
    {
      id: "req-1",
      name: "Mentee Full Name",
      requestType: "Catch-up Session",
      requestedDate: "Feb 20",
    },
    {
      id: "req-2",
      name: "Mentee Full Name",
      requestType: "Goal Discussion",
      requestedDate: "Feb 22",
    },
  ],
};

export default function MentorDashboardPage() {
  return <MentorDashboardPageContent data={mockMentorDashboardData} />;
}
