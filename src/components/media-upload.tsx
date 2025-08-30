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
import { uploadImage } from "@/lib/queries";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";
import { addReviewImageId, setUploading } from "@/lib/state/slices/review";
import { handleClientNotification } from "@/lib/utils";

type MediaUploadProps = {
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  accept?: string;
  value: File[];
  onChange: (files: File[]) => void;
  existingImages?: Images;
  autoUpload?: boolean; // New prop to enable auto-upload
};

export const MediaUpload = ({
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  value,
  onChange,
  autoUpload = false,
}: MediaUploadProps) => {
  const dispatch = useAppDispatch();
  const reviewId = useAppSelector((state) => state.review.id);
  const [uploadingFiles, setUploadingFiles] = React.useState<Set<string>>(
    new Set()
  );
  const uploadingFilesRef = React.useRef<Set<string>>(new Set());

  // Create a consistent key format for tracking files locally
  const createFileKey = React.useCallback((file: File) => {
    // Use file properties for local tracking before upload
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  const uploadSingleImage = React.useCallback(
    async (file: File) => {
      if (!autoUpload || !reviewId) {
        return;
      }

      dispatch(setUploading(true));

      const fileKey = createFileKey(file);

      // Prevent duplicate uploads using ref to avoid dependency issues
      if (uploadingFilesRef.current.has(fileKey)) {
        return;
      }

      uploadingFilesRef.current.add(fileKey);
      setUploadingFiles((prev) => new Set(prev).add(fileKey));

      try {
        const formData = new FormData();
        formData.append("image", file);

        const result = await uploadImage(formData);

        if (result?.success && result?.data?.id) {
          const imageId = result.data.id;

          dispatch(addReviewImageId(imageId));
        } else {
          throw new Error(result?.message || "Upload failed");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        handleClientNotification({
          message: "Failed to upload image. Please try again.",
        });

        // Note: We don't remove the file from local state here to avoid dependency issues
        // The user can manually remove failed uploads if needed
      } finally {
        uploadingFilesRef.current.delete(fileKey);
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
        dispatch(setUploading(false));
      }
    },
    [autoUpload, reviewId, dispatch, createFileKey]
  );

  const handleFileChange = React.useCallback(
    (files: File[]) => {
      const previousLength = value.length;
      onChange(files);

      // Auto-upload newly added files
      if (autoUpload && files.length > previousLength) {
        // Get the newly added files (should be the last ones in the array)
        const newFiles = files.slice(previousLength);
        newFiles.forEach(uploadSingleImage);
      }
    },
    [onChange, autoUpload, value.length, uploadSingleImage]
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

    handleClientNotification({
      message: userFriendlyMessage,
    });
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
          {value.map((file, index) => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
            const isUploading = uploadingFiles.has(fileKey);

            return (
              <FileUploadItem key={index} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={isUploading}
                    onClick={() => handleFileRemove(index)}
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
