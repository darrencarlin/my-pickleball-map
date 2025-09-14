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
import { useCourt, useEditCourt } from "@/lib/tanstack/hooks/courts";
import { useImages } from "@/lib/tanstack/hooks/images";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters long",
    })
    .max(100),
  description: z.string().max(500),
  image: z.string().max(500),
});

interface Props {
  id: string;
}

export const EditCourtForm = ({ id }: Props) => {
  const { data: court } = useCourt(id);
  const { data: existingImages } = useImages({ courtId: id });
  const { mutate: updateCourt, isPending } = useEditCourt({ goBack: true });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: court?.name ?? "",
      description: court?.description ?? "",
      image: court?.image ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const court = { id, ...values };
    updateCourt(court);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
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
          <MediaUpload
            value={selectedFiles}
            onChange={setSelectedFiles}
            courtId={id}
            maxFiles={1}
            multiple={true}
            autoUpload={true}
          />
        </div>

        <Button type="submit" className="w-full">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};
