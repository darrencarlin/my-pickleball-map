"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CHECKIN_QUERY_KEY,
  CHECKINS_QUERY_KEY,
  COURT_QUERY_KEY,
  COURTS_QUERY_KEY,
} from "@/lib/constants";
import { addCheckin, editCheckIn, getCheckIn } from "@/lib/db/queries";
import type { CheckIn, CourtWithCheckIns, NewCheckIn } from "@/lib/db/schema";

export const useCheckIn = (checkInId: CheckIn["id"]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CHECKIN_QUERY_KEY, checkInId],
    queryFn: async () => {
      const { data } = await getCheckIn(checkInId);
      return data;
    },
    initialData: () => {
      // Try to find the check-in data from any cached court data
      const courtQueries = queryClient.getQueriesData({
        queryKey: [COURT_QUERY_KEY],
      });

      for (const [, courtData] of courtQueries) {
        const court = courtData as CourtWithCheckIns;
        if (court?.checkIns) {
          const checkIn = court.checkIns.find(
            (c: CheckIn) => c.id === checkInId
          );
          if (checkIn) {
            return checkIn;
          }
        }
      }

      return undefined;
    },
  });
};

export const useAddCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courtId: NewCheckIn["courtId"]) => {
      const { data, success, message } = await addCheckin(courtId);
      if (!success) {
        throw new Error(message || "Failed to add check-in");
      }
      return { data, success, message };
    },
    onSuccess: (_result, courtId) => {
      // Show success message
      toast.success("Check-in added successfully!");

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY, courtId] });
      queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHECKIN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHECKINS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Add check-in error:", error);
      toast.error(error.message ?? "Failed to add check-in");
    },
  });
};

export const useEditCheckIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (checkIn: Partial<CheckIn>) => {
      const { data, success, message } = await editCheckIn(checkIn);
      return { data, success, message };
    },
    onSuccess: async (result) => {
      const checkInId = result?.data?.id;
      if (checkInId) {
        // Invalidate specific check-in query
        await queryClient.invalidateQueries({
          queryKey: [CHECKIN_QUERY_KEY, checkInId],
        });
      }

      // Invalidate all court queries to update the check-ins list
      await queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY] });
      // Go back to the previous page
      router.back();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update check-in");
    },
  });
};
