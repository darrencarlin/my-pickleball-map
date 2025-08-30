import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CHECKIN_QUERY_KEY, COURT_QUERY_KEY } from "@/lib/constants";
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
      return { data, success, message };
    },
    onSuccess: () => {},
    onError: (error) => {
      toast.error(error.message ?? "Failed to add court");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CHECKIN_QUERY_KEY] });
    },
  });
};

export const useEditCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkIn: Partial<CheckIn>) => {
      const { data, success, message } = await editCheckIn(checkIn);
      return { data, success, message };
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update check-in");
    },
    onSettled: (result) => {
      const id = result?.data?.id;
      queryClient.invalidateQueries({
        queryKey: [CHECKIN_QUERY_KEY, id],
      });
    },
  });
};
