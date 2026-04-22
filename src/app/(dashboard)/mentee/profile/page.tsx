import MenteeProfilePageContent, {
  MentorInfo,
  UserProfile,
} from "@/components/dashboard/profile/MenteeProfilePageContent";

interface MenteeProfilePageData {
  profile: UserProfile;
  activitySummary: Array<{ label: string; value: string }>;
  mentor: MentorInfo;
}

const mockMenteeData: MenteeProfilePageData = {
  profile: {
    fullName: "user_full_name",
    email: "user_email_address",
    phone: "user_email_address",
    location: "user_location",
    bio: "A passionate learner committed to personal growth and leadership development. Currently focused on building communication skills and expanding professional network.",
    currentYear: "Year 2",
    cohort: "2024A",
    joined: "Jan 2024",
  },
  activitySummary: [
    { label: "Goals Completed", value: "12" },
    { label: "Sessions Attended", value: "24" },
    { label: "Reflections Written", value: "18" },
    { label: "Modules Completed", value: "2 / 10" },
  ],
  mentor: {
    name: "[Mentor Name]",
    email: "mentor@example.com",
    nextSession: "Feb 15, 2025 @ 3:00 PM",
  },
};

export default function MenteeProfilePage() {
  return (
    <MenteeProfilePageContent
      profile={mockMenteeData.profile}
      activitySummary={mockMenteeData.activitySummary}
      mentor={mockMenteeData.mentor}
    />
  );
}
