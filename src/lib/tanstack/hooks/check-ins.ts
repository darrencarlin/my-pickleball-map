import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CHECKIN_QUERY_KEY } from "@/lib/constants";
import { addCheckin } from "@/lib/db/queries";
import type { NewCheckIn } from "@/lib/db/schema";

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
