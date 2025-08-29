import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COURT_QUERY_KEY, COURTS_QUERY_KEY } from "@/lib/constants";
import { addCourt, editCourt, getCourts } from "@/lib/db/queries";
import type { NewCourt, PartialCourt } from "@/lib/db/schema";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setCourt } from "@/lib/redux/slices/app";
import { setModal } from "@/lib/redux/slices/modal";

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

export const useEditCourt = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentCourt = useAppSelector((state) => state.app.court);

  return useMutation({
    mutationFn: async (court: PartialCourt) => {
      const { data, success, message } = await editCourt(court);
      return { data, success, message };
    },
    // Optimistically update to the new value
    onMutate: async (newCourt) => {
      await queryClient.cancelQueries({
        queryKey: [COURT_QUERY_KEY, newCourt.id],
      });

      const previousCourt = queryClient.getQueryData([
        COURT_QUERY_KEY,
        newCourt.id,
      ]);

      queryClient.setQueryData([COURT_QUERY_KEY, newCourt.id], newCourt);

      return { previousCourt, newCourt };
    },

    onSuccess: ({ data }) => {
      // Only update the selected court state if this court is currently selected
      // This prevents the court card from staying open after check-in when user tries to close it
      if (currentCourt?.id === data.id) {
        dispatch(setCourt(data));
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update court");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [COURTS_QUERY_KEY] });
    },
  });
};
