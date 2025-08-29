"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setIsSelectingLocation } from "@/lib/redux/slices/app";
import { setModal } from "@/lib/redux/slices/modal";

import { AddCourtForm } from "../forms/add-court-form";
import { Button } from "../ui/button";

export const AddLocationButton = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.modal["add-court"]);
  const customCoordinates = useAppSelector(
    (state) => state.app.customCoordinates
  );
  const isSelectingLocation = useAppSelector(
    (state) => state.app.isSelectingLocation
  );

  useEffect(() => {
    if (customCoordinates && !isSelectingLocation && !modal) {
      dispatch(setModal({ modal: "add-court", value: true }));
    }
  }, [customCoordinates, isSelectingLocation, modal, dispatch]);

  const handleCancelSelection = () => {
    dispatch(setIsSelectingLocation(false));
    dispatch(setModal({ modal: "add-court", value: true }));
  };

  return (
    <>
      <Dialog
        open={modal}
        onOpenChange={() =>
          dispatch(setModal({ modal: "add-court", value: !modal }))
        }
      >
        <DialogTrigger asChild>
          <Button type="button" className="absolute top-4 right-4">
            Add Location
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the details of the new location you want to add.
            </DialogDescription>
          </DialogHeader>
          <AddCourtForm />
        </DialogContent>
      </Dialog>

      {/* Show instruction overlay when selecting location */}
      {isSelectingLocation && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCancelSelection}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 shadow-lg flex items-center gap-3"
        >
          Click on the map to select location <X className="h-3 w-3" />
        </Button>
      )}
    </>
  );
};
