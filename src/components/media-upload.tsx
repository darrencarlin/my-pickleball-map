"use client";

import { Camera, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import type { Images } from "@/lib/db/schema";
import { useUploadImage } from "@/lib/tanstack/hooks/images";

type MediaUploadProps = {
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  accept?: string;
  value: File[];
  onChange: (files: File[]) => void;
  existingImages?: Images;
  autoUpload?: boolean;
  courtId?: string;
  checkinId?: string;
};

export const MediaUpload = ({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  value,
  onChange,
  autoUpload = true,
  courtId,
  checkinId,
}: MediaUploadProps) => {
  const uploadImageMutation = useUploadImage();
  const [uploadingFiles, setUploadingFiles] = React.useState<Set<string>>(
    new Set()
  );
  const previousLengthRef = React.useRef(value.length);

  // Create a consistent key format for tracking files locally
  const createFileKey = React.useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  const uploadSingleImage = React.useCallback(
    async (file: File) => {
      if (!autoUpload || (!courtId && !checkinId)) {
        return;
      }

      const fileKey = createFileKey(file);

      // Prevent duplicate uploads
      if (uploadingFiles.has(fileKey)) {
        console.log(`Skipping duplicate upload for ${fileKey}`);
        return;
      }

      console.log(`Starting upload for ${fileKey}`);
      setUploadingFiles((prev) => new Set(prev).add(fileKey));

      try {
        const formData = new FormData();
        formData.append("image", file);

        if (courtId) formData.append("courtId", courtId);
        if (checkinId) formData.append("checkinId", checkinId);

        await uploadImageMutation.mutateAsync(formData);
        console.log(`Upload completed for ${fileKey}`);

        // Remove the file from local state after successful upload
        onChange(value.filter((f) => createFileKey(f) !== fileKey));
      } catch (error) {
        console.error("Image upload error:", error);
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }
    },
    [
      autoUpload,
      courtId,
      checkinId,
      uploadingFiles,
      createFileKey,
      uploadImageMutation,
      onChange,
      value,
    ]
  );

  const handleFileChange = React.useCallback(
    (files: File[]) => {
      const previousLength = previousLengthRef.current;
      previousLengthRef.current = files.length;
      console.log(`File change: ${previousLength} -> ${files.length}`);
      onChange(files);

      // Auto-upload newly added files
      if (autoUpload && files.length > previousLength) {
        const newFiles = files.slice(previousLength);
        console.log(`Auto-uploading ${newFiles.length} new files`);
        // Use setTimeout to ensure this runs after the state update
        setTimeout(() => {
          newFiles.forEach(uploadSingleImage);
        }, 0);
      }
    },
    [onChange, autoUpload, uploadSingleImage]
  );

  const handleFileRemove = React.useCallback(
    (fileIndex: number) => {
      const updatedFiles = [...value];
      updatedFiles.splice(fileIndex, 1);
      onChange(updatedFiles);
    },
    [value, onChange]
  );

  const onFileReject = React.useCallback((_file: File, message: string) => {
    // Make file rejection messages more user-friendly
    let userFriendlyMessage = message;

    if (message.includes("File type not accepted")) {
      userFriendlyMessage =
        "Please select a valid image file (JPEG, PNG, or WebP)";
    } else if (message.includes("File too large")) {
      userFriendlyMessage =
        "This image is too large. Please choose a smaller image";
    }

    console.warn(userFriendlyMessage);
  }, []);

  return (
    <FileUpload
      maxFiles={maxFiles}
      maxSize={maxSize}
      className="w-full"
      value={value}
      onValueChange={handleFileChange}
      onFileReject={onFileReject}
      multiple={multiple}
      accept={accept}
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center text-center gap-1">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Camera className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Upload your images here</p>
          <p className="text-xs text-muted-foreground">
            (max {maxFiles} files, up to {Math.floor(maxSize / 1024 / 1024)}MB
            each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse images
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>

      {value?.length > 0 && (
        <FileUploadList>
          {value.map((file) => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
            const isUploading = uploadingFiles.has(fileKey);

            return (
              <FileUploadItem key={fileKey} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={isUploading}
                    onClick={() => {
                      const fileIndex = value.findIndex(
                        (f) =>
                          `${f.name}-${f.size}-${f.lastModified}` === fileKey
                      );
                      if (fileIndex >= 0) handleFileRemove(fileIndex);
                    }}
                  >
                    <X />
                  </Button>
                </FileUploadItemDelete>
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}
              </FileUploadItem>
            );
          })}
        </FileUploadList>
      )}
    </FileUpload>
  );
};
