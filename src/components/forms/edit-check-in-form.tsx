"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
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
  const { mutate: updateCheckIn, isPending, isSuccess } = useEditCheckIn();

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

    if (isSuccess) {
      console.log("Check-in updated successfully");
      router.back();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
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
        {/* Description */}
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

        <Button type="submit" className="w-full">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};
