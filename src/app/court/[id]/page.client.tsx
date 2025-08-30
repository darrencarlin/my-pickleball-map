"use client";

import { format } from "date-fns";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { BackButton } from "@/components/buttons/back-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useCourt } from "@/lib/tanstack/hooks/courts";

export const PageClient = ({ id }: { id: string }) => {
  const { data: court } = useCourt(id);

  const checkIns = court?.checkIns ?? [];

  return (
    <div>
      <div className="relative mb-4">
        <div className="flex justify-between absolute top-4 left-4 right-4 z-10">
          <BackButton />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Edit Court</DropdownMenuLabel>
              <DropdownMenuItem>Delete Court</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Image
          alt="Court Image"
          width={1920}
          height={1080}
          src="https://images.unsplash.com/photo-1580763850522-504d40a05c50?q=80&w=2370&auto=format&fit=crop"
        />
        <h3 className="text-5xl font-bold absolute bottom-4 left-4 text-white drop-shadow-lg">
          {court?.name}
        </h3>
      </div>
      <div>
        <div className="px-4 mb-4">
          <p className="mb-2">{court?.description}</p>
        </div>

        <Separator className="text-gray-500" />
        <div className="flex flex-col gap-4">
          {checkIns.map((checkIn, _index) => {
            return (
              <div key={checkIn.id}>
                <div className="px-4 py-6">
                  <div className="grid grid-cols-[1fr_auto] mb-2 items-center">
                    <p className="font-bold text-lg">
                      {checkIn.title ?? "No Title"}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Edit Check-In</DropdownMenuLabel>
                        <DropdownMenuItem>Delete Check-In</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mb-4">{checkIn.notes ?? "No Notes"}</p>
                  <p className="text-sm">
                    {format(new Date(checkIn.createdAt), "PPPp")}
                  </p>
                </div>
                <Separator className="text-gray-500" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
