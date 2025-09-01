import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COURTS_QUERY_KEY } from "@/lib/constants";
import { addCourt, editCourt, getCourt, getCourts } from "@/lib/db/queries";
import type { Court, NewCourt } from "@/lib/db/schema";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setModal } from "@/lib/redux/slices/modal";

export const useCourt = (courtId: Court["id"]) => {
  return useQuery({
    queryKey: [COURTS_QUERY_KEY, courtId],
    queryFn: async () => {
      const { data } = await getCourt(courtId);
      return data;
    },
  });
};

export const useCourts = () => {
  return useQuery({
    queryKey: [COURTS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getCourts();
      return data;
    },
  });
};

export const useAddCourt = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async (court: {
      name: string;
      latitude: number;
      longitude: number;
    }) => {
      const { data, success, message } = await addCourt(court as NewCourt);
      return { data, success, message };
    },

    onSuccess: () => {
      dispatch(setModal({ modal: "add-court", value: false }));
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to add court");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY] });
    },
  });
};

export const useEditCourt = ({ goBack }: { goBack?: boolean }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (court: Partial<Court>) => {
      const { data, success, message } = await editCourt(court);
      return { data, success, message };
    },
    onSuccess: async (result) => {
      const courtId = result?.data?.id;
      if (courtId) {
        // Invalidate specific court query
        await queryClient.invalidateQueries({
          queryKey: [COURTS_QUERY_KEY, courtId],
        });
      }
      // Invalidate all courts queries to update lists
      await queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY] });
      // Go back to the previous page
      if (goBack) {
        router.back();
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update court");
    },
  });
};
