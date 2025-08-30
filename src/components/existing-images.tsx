"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CLOUDFLARE_URL } from "@/lib/constants";
import type { Images, ImagesWithUrl } from "@/lib/db/schema";
import { useDeleteImage } from "@/lib/tanstack/hooks/images";

interface ExistingImagesProps {
  images: Images | ImagesWithUrl;
  className?: string;
}

export const ExistingImages = ({ images, className }: ExistingImagesProps) => {
  const deleteImageMutation = useDeleteImage();

  const handleDelete = async (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteImageMutation.mutateAsync(imageId);
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {images.map((image) => {
        // Generate URL if not provided
        const imageUrl =
          "url" in image
            ? image.url
            : `${CLOUDFLARE_URL}/${image.userId}/${image.imageId}.webp`;

        return (
          <div key={image.id} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg border">
              <Image
                src={imageUrl}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(image.imageId)}
              disabled={deleteImageMutation.isPending}
            >
              <X className="h-3 w-3" />
            </Button>
            {deleteImageMutation.isPending && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-xs">Deleting...</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
