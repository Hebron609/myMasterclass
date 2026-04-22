"use client";

import { useState } from "react";
import MenteeTable, { MenteeRecord } from "@/components/dashboard/mentees/MenteeTable";
import MenteeProfileModal from "@/components/dashboard/mentees/MenteeProfileModal";
import BookSessionModal from "@/components/dashboard/mentees/BookSessionModal";

export default function AllMenteesPage() {
  const [selectedMentee, setSelectedMentee] = useState<MenteeRecord | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleViewProfile = (mentee: MenteeRecord) => {
    setSelectedMentee(mentee);
    setIsProfileModalOpen(true);
  };

  const handleBookSession = (mentee: MenteeRecord) => {
    setSelectedMentee(mentee);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-[#003F3A] font-dm-sans">
            All Mentees
          </h1>
          <p className="text-[16px] text-[#003F3A]/80 font-rubik">
            View your mentees' profiles, track their progress, goals, and achievements
          </p>
        </div>

        {/* Content */}
        <MenteeTable onViewProfile={handleViewProfile} />

        {/* Modals */}
        <MenteeProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          mentee={selectedMentee}
          onBookSession={(mentee) => {
            setIsProfileModalOpen(false);
            handleBookSession(mentee);
          }}
        />

        <BookSessionModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          mentee={selectedMentee}
        />
      </div>
    </div>
  );
}
