"use client";

import { useState } from "react";
import { DirectoryTable, DirectoryItem } from "@/components/dashboard/directories/DirectoryTable";
import { MentorProfileModal } from "@/components/dashboard/directories/MentorProfileModal";

const mockMentors: DirectoryItem[] = [
  {
    id: "m1",
    name: "Dr. Amina Osei",
    title: "Social Enterprise Leader",
    cohorts: "2024A",
    expertise: "Leadership, Research",
    rating: 4.8,
    menteesCount: 7,
    sessionsCount: 54,
    status: "Limited",
  },
  {
    id: "m2",
    name: "James Kariuki",
    title: "University Lecturer",
    cohorts: "2024C",
    expertise: "Leadership, Research",
    rating: 4.7,
    menteesCount: 6,
    sessionsCount: 35,
    status: "Available",
  },
  {
    id: "m3",
    name: "Prof. Grace Ndungu",
    title: "Program Director",
    cohorts: "2024B",
    expertise: "Leadership, Research",
    rating: 4.8,
    menteesCount: 5,
    sessionsCount: 40,
    status: "Limited",
  },
  {
    id: "m4",
    name: "David Mwangi",
    title: "Social Enterprise Leader",
    cohorts: "2024A",
    expertise: "Leadership, Research",
    rating: 4.5,
    menteesCount: 7,
    sessionsCount: 54,
    status: "Limited",
    bio: "Founded two social enterprises. Believes in mentorship as a catalyst for community transformation.",
    tags: ["Entrepreneurship", "Social Impact", "Fundraising"],
    milestones: ["Founded 2 enterprises", "Raised $2M in grants", "Created 100+ jobs"]
  },
  {
    id: "m5",
    name: "Prince Martin",
    title: "University Lecturer",
    cohorts: "2024B",
    expertise: "Leadership, Research",
    rating: 4.5,
    menteesCount: 5,
    sessionsCount: 20,
    status: "Available",
  },
  {
    id: "m6",
    name: "Lucy Grace",
    title: "Program Director",
    cohorts: "2024C",
    expertise: "Leadership, Research",
    rating: 4.6,
    menteesCount: 5,
    sessionsCount: 25,
    status: "Available",
  },
];

export default function AllMentorsPage() {
  const [selectedMentor, setSelectedMentor] = useState<DirectoryItem | null>(null);

  return (
    <>
      <DirectoryTable
        pageTitle="All Mentors"
        pageSubtitle="View mentors' profiles, expertise, availability, and book your next session"
        dropdownLabel="All Mentors"
        searchPlaceholder="Search mentors..."
        items={mockMentors}
        onProfileClick={(mentor) => setSelectedMentor(mentor)}
      />

      <MentorProfileModal 
        isOpen={!!selectedMentor} 
        mentor={selectedMentor} 
        onClose={() => setSelectedMentor(null)} 
      />
    </>
  );
}
