"use client";

import type { ChangeEvent, RefObject } from "react";
import { ImageUp } from "lucide-react";

type Props = {
  files: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onOpenPicker: () => void;
  isPending: boolean;
};

export default function NewListingStepImages({
  files,
  fileInputRef,
  onFilesChange,
  onRemoveFile,
  onOpenPicker,
  isPending,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Зураг</p>
        <p className="text-xs text-muted-foreground">3 хүртэл зураг оруулж болно.</p>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Нийт 3 хүртэл зураг</span>
        <span className="font-medium text-foreground">{files.length}/3</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((idx) => {
          const file = files[idx];
          if (file) {
            return (
              <div
                key={`${file.name}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-xl border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-[10px] text-white"
                  disabled={isPending}
                >
                  Устгах
                </button>
              </div>
            );
          }
          return (
            <button
              key={`empty-${idx}`}
              type="button"
              onClick={onOpenPicker}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
              disabled={isPending}
            >
              <ImageUp className="h-5 w-5" aria-hidden="true" />
              <span>Зураг нэмэх</span>
            </button>
          );
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFilesChange}
        disabled={isPending}
      />
    </div>
  );
}
