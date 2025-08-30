"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Court } from "@/lib/db/schema";
import { useAppSelector } from "@/lib/redux/hooks";
import { useAddCheckin } from "@/lib/tanstack/hooks/check-ins";
import { useEditCourt } from "@/lib/tanstack/hooks/courts";
import { Button } from "../ui/button";

const CourtCardContent = ({
  court,
  handleCheckIn,
  isPending,
}: {
  court: Court;
  handleCheckIn: (court: Court) => void;
  isPending: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={cardRef}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 p-4 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-96"
    >
      <h3 className="mb-2 text-lg font-bold">{court.name}</h3>
      <p className="mb-4 text-gray-500">
        You have played at {court.name}{" "}
        <span className="font-bold">{court.playCount}</span> times.
      </p>
      <div className="flex gap-4">
        <Button
          className="flex-1"
          type="button"
          onClick={() => handleCheckIn(court)}
          disabled={isPending}
        >
          {isPending ? "Checking In..." : "Check In"}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href={`/court/${court.id}`}>Details</Link>
        </Button>
      </div>
    </div>
  );
};

export const CourtCard = () => {
  const { mutate: editCourt, isPending } = useEditCourt();
  const { mutate: addCheckin } = useAddCheckin();
  const visibleCourts = useAppSelector((state) => state.app.visibleCourts);
  const court = useAppSelector((state) => state.app.court);

  const handleCheckIn = (court: Court) => {
    const body: Partial<Court> = {
      id: court.id,
      playCount: (court.playCount ?? 0) + 1,
    };

    // Increase play count
    editCourt(body);
    // Add check-in
    addCheckin(court.id);
  };

  // Priority 1: Show visible courts if there's exactly one and no manually selected court
  if (visibleCourts.length === 1 && !court) {
    return (
      <CourtCardContent
        court={visibleCourts[0]}
        handleCheckIn={handleCheckIn}
        isPending={isPending}
      />
    );
  }

  // Priority 2: Show manually selected court
  if (court) {
    return (
      <CourtCardContent
        court={court}
        handleCheckIn={handleCheckIn}
        isPending={isPending}
      />
    );
  }

  // Priority 3: Show refine card if multiple visible courts and no selected court
  if (visibleCourts.length > 1 && !court) {
    //const displayedCourts = visibleCourts.slice(0, 2);
    // const remainingCount = visibleCourts.length - 2;

    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 p-4 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-96">
        <p className="mb-1 font-bold">Refine your viewport</p>
        <p className="text-gray-500">{visibleCourts.length} courts found</p>
        {/* <div className="mt-2 space-y-2">
          {displayedCourts.map((visibleCourt) => (
            <Button
              key={visibleCourt.id}
              variant="outline"
              type="button"
              onClick={() => handleSelectCourt(visibleCourt)}
              className="justify-start w-full text-left"
            >
              {visibleCourt.name}
            </Button>
          ))}
          {remainingCount > 0 && (
            <p className="text-sm text-gray-500">
              + {remainingCount} more location{remainingCount > 1 ? "s" : ""}
            </p>
          )}
        </div> */}
      </div>
    );
  }

  // No courts to show
  return null;
};
