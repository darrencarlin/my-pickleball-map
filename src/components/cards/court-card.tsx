"use client";

import { useRef } from "react";
import type { Court } from "@/lib/db/schema";
import { useOutsideClick } from "@/lib/hooks/use-outside-click";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setCourt } from "@/lib/redux/slices/app";
import { useEditCourt } from "@/lib/tanstack/hooks/courts";
import { Button } from "../ui/button";

const CourtCardContent = ({
  court,
  handleCheckIn,
  isPending,
  handleCloseCourtCard,
}: {
  court: Court;
  handleCheckIn: (court: Court) => void;
  isPending: boolean;
  handleCloseCourtCard: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(cardRef, handleCloseCourtCard);

  return (
    <div
      ref={cardRef}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 p-4 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-96"
    >
      <p className="font-bold mb-2 text-lg">{court.name}</p>
      <p className="text-gray-500 mb-4">
        You have played at {court.name}{" "}
        <span className="font-bold">{court.playCount}</span> times.
      </p>
      <div className="flex justify-between">
        <Button
          type="button"
          onClick={() => handleCheckIn(court)}
          disabled={isPending}
        >
          {isPending ? "Checking In..." : "Check In"}
        </Button>
        <Button variant="outline" type="button">
          View Details
        </Button>
      </div>
    </div>
  );
};

export const CourtCard = () => {
  const dispatch = useAppDispatch();
  const { mutate: editCourt, isPending } = useEditCourt();
  const visibleCourts = useAppSelector((state) => state.app.visibleCourts);
  const court = useAppSelector((state) => state.app.court);

  const handleCloseCourtCard = () => {
    dispatch(setCourt(null));
  };

  const handleCheckIn = (court: Court) => {
    const id = court.id;
    const count = court.playCount ?? 0;

    const body: Partial<Court> = {
      id,
      playCount: count + 1,
    };

    editCourt(body);
  };

  const handleSelectCourt = (selectedCourt: Court) => {
    dispatch(setCourt(selectedCourt));
  };

  // Priority 1: Show visible courts if there's exactly one and no manually selected court
  if (visibleCourts.length === 1 && !court) {
    return (
      <CourtCardContent
        court={visibleCourts[0]}
        handleCheckIn={handleCheckIn}
        isPending={isPending}
        handleCloseCourtCard={handleCloseCourtCard}
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
        handleCloseCourtCard={handleCloseCourtCard}
      />
    );
  }

  // Priority 3: Show refine card if multiple visible courts and no selected court
  if (visibleCourts.length > 1 && !court) {
    const displayedCourts = visibleCourts.slice(0, 2);
    const remainingCount = visibleCourts.length - 2;

    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 p-4 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-96">
        <p className="mb-1 font-bold">Refine your viewport</p>
        <p className="text-gray-500">{visibleCourts.length} courts found</p>
        <div className="mt-2 space-y-2">
          {displayedCourts.map((visibleCourt) => (
            <Button
              key={visibleCourt.id}
              variant="outline"
              type="button"
              onClick={() => handleSelectCourt(visibleCourt)}
              className="w-full text-left justify-start"
            >
              {visibleCourt.name}
            </Button>
          ))}
          {remainingCount > 0 && (
            <p className="text-sm text-gray-500">
              + {remainingCount} more location{remainingCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  // No courts to show
  return null;
};
