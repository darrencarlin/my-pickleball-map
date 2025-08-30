import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IMAGES_QUERY_KEY } from "@/lib/constants";
import { deleteImage, getImages, uploadImage } from "@/lib/db/queries";

export const useImages = (params: { courtId?: string; checkinId?: string }) => {
  return useQuery({
    queryKey: [IMAGES_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await getImages(params);
      return data || [];
    },
    enabled: !!(params.courtId || params.checkinId),
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data, success, message } = await uploadImage(formData);
      if (!success) throw new Error(message);
      return data;
    },
    onSuccess: (_data, formData) => {
      toast.success("Image uploaded successfully!");

      // Invalidate relevant image queries
      const courtId = formData.get("courtId") as string | null;
      const checkinId = formData.get("checkinId") as string | null;

      if (courtId) {
        queryClient.invalidateQueries({
          queryKey: [IMAGES_QUERY_KEY, { courtId }],
        });
      }

      if (checkinId) {
        queryClient.invalidateQueries({
          queryKey: [IMAGES_QUERY_KEY, { checkinId }],
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const { success, message } = await deleteImage(imageId);
      if (!success) throw new Error(message);
      return imageId;
    },
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      // Invalidate all image queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: [IMAGES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete image");
    },
  });
};
