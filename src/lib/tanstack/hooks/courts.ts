import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COURTS_QUERY_KEY } from "@/lib/constants";
import { addCourt, editCourt, getCourt, getCourts } from "@/lib/db/queries";
import type { Court, NewCourt, PartialCourt } from "@/lib/db/schema";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setCourt } from "@/lib/redux/slices/app";
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

export const useEditCourt = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentCourt = useAppSelector((state) => state.app.court);

  return useMutation({
    mutationFn: async (court: PartialCourt) => {
      const { data, success, message } = await editCourt(court);
      return { data, success, message };
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
