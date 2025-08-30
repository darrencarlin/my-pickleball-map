"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ImagesWithUrl } from "@/lib/db/schema";

interface ImageCarouselProps {
  images: ImagesWithUrl;
  className?: string;
}

export const ImageCarousel = ({ images, className }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Single image - no navigation needed
  if (images.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <Image
            src={images[0].url}
            alt="Check-in image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main image */}
      <div className="aspect-video relative overflow-hidden rounded-lg">
        <Image
          src={images[currentIndex].url}
          alt={`Check-in image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Navigation arrows */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={prevImage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={nextImage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 justify-center">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goToImage(index)}
              className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-blue-500 opacity-100"
                  : "border-gray-300 opacity-60 hover:opacity-80"
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
