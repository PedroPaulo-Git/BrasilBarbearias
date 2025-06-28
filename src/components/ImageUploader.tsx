"use client";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploaderProps {
    onUploadComplete: (res: { url: string; key: string }[]) => void;
    onUploadError: (error: Error) => void;
}

export function ImageUploader({ onUploadComplete, onUploadError }: ImageUploaderProps) {
  return (
    <UploadButton<OurFileRouter, "shopGalleryUploader">
      endpoint="shopGalleryUploader"
      onClientUploadComplete={(res) => {
        if (res) {
          const formattedRes = res.map(file => ({ url: file.url, key: file.key }));
          onUploadComplete(formattedRes);
        }
      }}
      onUploadError={onUploadError}
      appearance={{
        button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md p-2 px-4 text-sm h-10",
      }}
      content={{
        button({ ready, isUploading }) {
            if (isUploading) return "Enviando...";
            if (ready) return "Carregar Imagens";
            return "Preparando...";
        },
        allowedContent: "Máx. 5 imagens de até 4MB cada.",
      }}
    />
  );
} 