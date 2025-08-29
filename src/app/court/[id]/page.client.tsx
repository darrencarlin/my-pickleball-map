"use client";

import { format } from "date-fns";
import { useCourt } from "@/lib/tanstack/hooks/courts";

export const PageClient = ({ id }: { id: string }) => {
  const { data } = useCourt(id);
  return (
    <div>
      <p>My Court ID: {id}</p>

      <ul>
        {data?.checkIns.map((checkIn) => (
          <li key={checkIn.id}>
            <p>{checkIn.title}</p>
            <p>{checkIn.notes}</p>
            <p>
              <strong>Checked in at:</strong>{" "}
              {format(new Date(checkIn.createdAt), "EEEE, do MMMM")} at{" "}
              {format(new Date(checkIn.createdAt), "h:mm")}
              {format(new Date(checkIn.createdAt), "aaa").toLowerCase()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
