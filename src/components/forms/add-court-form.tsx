"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCoordinates } from "@/lib/hooks/use-coordinates";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  clearCustomCoordinates,
  setIsSelectingLocation,
} from "@/lib/redux/slices/app";
import { setModal } from "@/lib/redux/slices/modal";
import { useAddCourt } from "@/lib/tanstack/hooks/courts";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters long",
    })
    .max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const AddCourtForm = () => {
  const { mutate: addCourt, isPending } = useAddCourt();
  const { latitude, longitude } = useCoordinates();
  const dispatch = useAppDispatch();
  const customCoordinates = useAppSelector(
    (state) => state.app.customCoordinates
  );

  // Use custom coordinates if available, otherwise fall back to user's location
  const finalLatitude = customCoordinates?.latitude ?? latitude;
  const finalLongitude = customCoordinates?.longitude ?? longitude;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      latitude: finalLatitude ?? 0,
      longitude: finalLongitude ?? 0,
    },
  });

  useEffect(() => {
    if (finalLatitude !== undefined && finalLongitude !== undefined) {
      form.reset({
        name: "",
        latitude: finalLatitude ?? undefined,
        longitude: finalLongitude ?? undefined,
      });
    }
  }, [finalLatitude, finalLongitude, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    addCourt(values);
    // Clear custom coordinates after successful submission
    dispatch(clearCustomCoordinates());
    dispatch(setModal({ modal: "add-court", value: false }));
  };

  const handleSelectOnMap = () => {
    dispatch(setIsSelectingLocation(true));
    dispatch(setModal({ modal: "add-court", value: false }));
  };

  const handleClearCustomLocation = () => {
    dispatch(clearCustomCoordinates());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Location Selection */}
        <div className="space-y-2">
          <FormLabel>Location</FormLabel>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectOnMap}
              className="flex-1"
            >
              Select on Map
            </Button>
            {customCoordinates && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearCustomLocation}
              >
                Use My Location
              </Button>
            )}
          </div>
          {customCoordinates && (
            <p className="text-sm text-muted-foreground">
              📍 Custom location selected
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input placeholder="latitude" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input placeholder="longitude" {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isPending ? "Adding..." : "Add Court"}
        </Button>
      </form>
    </Form>
  );
};
