"use client";

import { BackButton } from "@/components/buttons/back-button";
import { EditCheckInForm } from "@/components/forms/edit-check-in-form";

export const PageClient = ({ id }: { id: string }) => {
  return (
    <div className="p-4">
      <BackButton classname="mb-4" />
      <EditCheckInForm id={id} />
    </div>
  );
};
