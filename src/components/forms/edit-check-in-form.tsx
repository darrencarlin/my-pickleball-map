"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ExistingImages } from "@/components/existing-images";
import { MediaUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIn, useEditCheckIn } from "@/lib/tanstack/hooks/check-ins";
import { useImages } from "@/lib/tanstack/hooks/images";

const formSchema = z.object({
  title: z.string().min(2).max(100),
  notes: z.string().max(500),
});

interface Props {
  id: string;
}

export const EditCheckInForm = ({ id }: Props) => {
  const router = useRouter();
  const { data: checkIn } = useCheckIn(id);
  const { data: existingImages } = useImages({ checkinId: id });
  const { mutate: updateCheckIn, isPending, isSuccess } = useEditCheckIn();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: checkIn?.title ?? "",
      notes: checkIn?.notes ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const checkIn = { id, ...values };
    updateCheckIn(checkIn);

    if (isSuccess && !isPending) router.back();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Existing Images */}
        {existingImages && existingImages.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Current Images</FormLabel>
            <ExistingImages images={existingImages} />
          </div>
        )}

        {/* New Image Upload */}
        <div className="space-y-2">
          <FormLabel>Add New Images</FormLabel>
          {(() => {
            const maxTotalImages = 3;
            const existingImageCount = existingImages?.length || 0;
            const maxNewImages = Math.max(
              0,
              maxTotalImages - existingImageCount
            );

            if (maxNewImages === 0) {
              return (
                <p className="text-sm text-muted-foreground">
                  Maximum of {maxTotalImages} images reached. Delete existing
                  images above to add new ones.
                </p>
              );
            }

            return (
              <div className="space-y-2">
                <MediaUpload
                  value={selectedFiles}
                  onChange={setSelectedFiles}
                  checkinId={id}
                  maxFiles={maxNewImages}
                  multiple={maxNewImages > 1}
                  autoUpload={true}
                />
                <p className="text-xs text-muted-foreground">
                  {maxNewImages} of {maxTotalImages} slots available{" "}
                  {existingImageCount > 0
                    ? `(${existingImageCount} existing)`
                    : ""}
                </p>
              </div>
            );
          })()}
        </div>

        <Button type="submit" className="w-full">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};
