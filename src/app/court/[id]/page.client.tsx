"use client";

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
              {new Date(checkIn.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
