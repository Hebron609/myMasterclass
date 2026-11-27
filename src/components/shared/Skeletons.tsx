"use client";

import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-gray-100/90 ${className}`}
      {...props}
    />
  );
}

/** 4-Column Stats Row Skeleton for Admin, Mentor, Mentee Dashboards */
export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={`grid grid-cols-1 ${
        count === 3
          ? "md:grid-cols-3"
          : count === 2
            ? "md:grid-cols-2"
            : "md:grid-cols-4"
      } gap-6 w-full`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/80 rounded-[12px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-center"
        >
          <Skeleton className="h-3.5 w-24 mb-3 bg-gray-100" />
          <Skeleton className="h-7 w-16 bg-gray-200/80" />
        </div>
      ))}
    </div>
  );
}

/** Table Skeleton matching Cohorts, Users, Mentees directories */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-gray-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <Skeleton className="h-3.5 w-20 bg-gray-200/70" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30"
              >
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="py-4 px-4">
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0 bg-gray-200/60" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-28 bg-gray-200/80" />
                          <Skeleton className="h-2.5 w-20 bg-gray-100" />
                        </div>
                      </div>
                    ) : colIdx === cols - 1 ? (
                      <Skeleton className="h-6 w-16 rounded-full bg-gray-100" />
                    ) : (
                      <Skeleton
                        className={`h-3.5 ${
                          colIdx % 2 === 0 ? "w-24" : "w-16"
                        } bg-gray-100`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Mentee Journey Year 1-10 Timeline Skeleton */
export function JourneyTimelineSkeleton() {
  return (
    <section className="bg-white rounded-[16px] border border-gray-200/80 p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-3.5 w-24 mb-2 bg-gray-100" />
          <Skeleton className="h-6 w-32 bg-gray-200/80" />
        </div>
        <Skeleton className="h-4 w-28 bg-gray-100" />
      </div>

      <div className="flex items-center justify-between relative px-2 md:px-4 mt-6">
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-100 z-0" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
          <div
            key={step}
            className="flex flex-col items-center relative z-10 gap-2"
          >
            <Skeleton className="w-8 h-8 rounded-full bg-gray-200/80 border-2 border-white shadow-sm" />
            <Skeleton className="h-2.5 w-6 bg-gray-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Goal Cards Skeleton for Mentee Dashboard & Goals Page */
export function GoalCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/80 rounded-[12px] p-5 shadow-sm flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-20 rounded-full bg-gray-100" />
            <Skeleton className="h-5 w-5 rounded-full bg-gray-200/70" />
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full bg-gray-200/80" />
            <Skeleton className="h-3.5 w-3/4 bg-gray-100" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <Skeleton className="h-3 w-16 bg-gray-100" />
            <Skeleton className="h-3 w-20 bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Assigned Mentor Card Skeleton */
export function AssignedMentorSkeleton() {
  return (
    <div className="bg-white border border-gray-200/80 rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-4 w-28 bg-gray-100" />
          <Skeleton className="h-5 w-16 rounded-full bg-gray-100" />
        </div>
        <div className="flex items-center gap-4 mb-5">
          <Skeleton className="w-14 h-14 rounded-full bg-gray-200/80 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 bg-gray-200/80" />
            <Skeleton className="h-3 w-24 bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <Skeleton className="h-8 w-28 rounded-[8px] bg-gray-100" />
        <Skeleton className="h-8 w-28 rounded-[8px] bg-gray-200/80" />
      </div>
    </div>
  );
}

/** Quiet Participants / Needs Attention Skeleton */
export function QuietParticipantsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-100 rounded-[12px] p-4 flex items-center justify-between bg-white"
        >
          <div className="space-y-1.5 flex-1 pr-4">
            <Skeleton className="h-4 w-32 bg-gray-200/80" />
            <Skeleton className="h-3 w-48 bg-gray-100" />
          </div>
          <Skeleton className="h-8 w-20 rounded-[8px] bg-gray-100 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Leaderboard Podium + List Skeleton */
export function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((pos) => (
          <div
            key={pos}
            className="bg-white rounded-[16px] border border-gray-200/80 p-5 shadow-sm flex flex-col items-center text-center space-y-3"
          >
            <Skeleton className="w-16 h-16 rounded-full bg-gray-200/80" />
            <Skeleton className="h-4 w-28 bg-gray-200" />
            <Skeleton className="h-3 w-20 bg-gray-100" />
            <Skeleton className="h-7 w-24 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
      {/* Table Skeleton */}
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}

/** Reflections List Skeleton */
export function ReflectionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/80 rounded-[16px] p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 bg-gray-200/80" />
              <Skeleton className="h-3 w-16 bg-gray-100" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full bg-gray-100" />
            <Skeleton className="h-3.5 w-5/6 bg-gray-100" />
            <Skeleton className="h-3.5 w-2/3 bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Card Grid Skeleton (for Programs, Cohorts, Certificates) */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-[16px] border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[180px]"
        >
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-[10px] bg-gray-100" />
            <Skeleton className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 bg-gray-200/80" />
            <Skeleton className="h-3 w-full bg-gray-100" />
            <Skeleton className="h-3 w-4/5 bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
