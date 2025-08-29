"use client";

import type { Court } from "@/lib/db/schema";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setCourt } from "@/lib/redux/slices/app";
import { useEditCourt } from "@/lib/tanstack/hooks/courts";
import { Button } from "../ui/button";

export const CourtCard = () => {
  const dispatch = useAppDispatch();
  const { mutate: editCourt, isPending } = useEditCourt();
  const court = useAppSelector((state) => state.app.court);

  const handleCloseCourtCard = () => {
    dispatch(setCourt(null));
  };

  const handleCheckIn = () => {
    const id = court?.id;
    const count = court?.playCount ?? 0;

    const body: Partial<Court> = {
      id,
      playCount: count + 1,
    };

    editCourt(body);
  };

  if (!court) return null;

  return (
    <div className="absolute top-4 md:right-4 left-4 bg-white/95 p-4 rounded-lg shadow-lg w-[90vw]  md:w-96">
      {court ? (
        <>
          <p className="font-bold mb-2">{court.name}</p>
          <p className="text-gray-500 mb-4 text-sm">
            You have played at {court.name}{" "}
            <span className="font-bold">{court.playCount}</span> times.
          </p>
          <div className="flex justify-between">
            <Button type="button" onClick={handleCheckIn} disabled={isPending}>
              {isPending ? "Checking In..." : "Check In"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={handleCloseCourtCard}
            >
              Close
            </Button>
          </div>
        </>
      ) : (
        <div>
          <p className="mb-1 font-bold">Select a court to see more details.</p>
          <p className="text-gray-500">No address available.</p>
        </div>
      )}
    </div>
  );
};
