"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MenteeTable, {
  MenteeRecord,
} from "@/components/dashboard/mentees/MenteeTable";
import { BookSessionModal } from "@/components/dashboard/sessions/BookSessionModal";

export default function AllMenteesPage() {
  const [selectedMentee, setSelectedMentee] = useState<MenteeRecord | null>(
    null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const router = useRouter();

  const handleViewProfile = (mentee: MenteeRecord) => {
    router.push(`/mentor/mentees/${mentee.id}`);
  };

  const handleBookSession = (mentee: MenteeRecord) => {
    setSelectedMentee(mentee);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Content */}
        <div className="bg-white rounded-[16px] border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] pt-2 pb-6">
          <MenteeTable onViewProfile={handleViewProfile} />
        </div>

        <BookSessionModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          preselectedMentee={selectedMentee?.id}
          title={
            selectedMentee?.name
              ? `Book Session with ${selectedMentee.name}`
              : "Book Session"
          }
        />
      </div>
    </div>
  );
}
