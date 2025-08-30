"use client";

import { BackButton } from "@/components/buttons/back-button";
import { EditCourtForm } from "@/components/forms/edit-court-form";

export const PageClient = ({ id }: { id: string }) => {
  return (
    <div className="p-4">
      <BackButton />
      <EditCourtForm id={id} />
    </div>
  );
};
