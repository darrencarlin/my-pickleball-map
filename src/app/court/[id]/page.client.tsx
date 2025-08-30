"use client";

import { format } from "date-fns";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/buttons/back-button";
import { ImageCarousel } from "@/components/image-carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { CheckIn } from "@/lib/db/schema";
import { useCourt } from "@/lib/tanstack/hooks/courts";
import { useImages } from "@/lib/tanstack/hooks/images";

export const PageClient = ({ id }: { id: string }) => {
  const { data: court } = useCourt(id);
  const { data: courtImages } = useImages({ courtId: id });

  const checkIns = court?.checkIns ?? [];

  // Get the first uploaded court image, fallback to existing image or default
  const getCourtImageSrc = () => {
    if (courtImages && courtImages.length > 0) {
      return courtImages[0].url;
    }
    if (court?.image) {
      return court.image;
    }
    return "https://images.unsplash.com/photo-1580763850522-504d40a05c50?q=80&w=2370&auto=format&fit=crop";
  };

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
              <DropdownMenuLabel>
                <Link href={`/court/${id}/edit`}>Edit Court</Link>
              </DropdownMenuLabel>
              <DropdownMenuItem>Delete Court</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Image
          alt="Court Image"
          width={1920}
          height={1080}
          src={getCourtImageSrc()}
          className="w-full h-64 md:h-80 object-cover"
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
            return <CheckInCard key={checkIn.id} checkIn={checkIn} />;
          })}
        </div>
      </div>
    </div>
  );
};

// Separate component for check-in card to handle individual image loading
const CheckInCard = ({ checkIn }: { checkIn: CheckIn }) => {
  const { data: checkInImages } = useImages({ checkinId: checkIn.id });

  return (
    <div>
      <div className="px-4 py-6">
        <div className="grid grid-cols-[1fr_auto] mb-2 items-center">
          <p className="font-bold text-lg">{checkIn.title ?? "No Title"}</p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <Link prefetch href={`/check-in/${checkIn.id}`}>
                  Edit Check-In
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuItem>Delete Check-In</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mb-4">{checkIn.notes ?? "No Notes"}</p>

        {/* Check-in image carousel */}
        {checkInImages && checkInImages.length > 0 && (
          <div className="mb-4">
            <ImageCarousel images={checkInImages} className="max-w-md" />
          </div>
        )}

        <p className="text-sm">{format(new Date(checkIn.createdAt), "PPPp")}</p>
      </div>
      <Separator className="text-gray-500" />
    </div>
  );
};
