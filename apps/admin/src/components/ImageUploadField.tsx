"use client";

import { useRef, useState } from "react";
import { adminUploadFile, ApiError } from "@/lib/api";
import { Button } from "./ui/Button";
import { useToast } from "@/providers/ToastProvider";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  urlLabel?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  urlLabel = "URL зображення",
}: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminUploadFile(file);
      onChange(url);
      toast.success("Зображення завантажено");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Не вдалося завантажити");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const inputId = "image-upload-url";

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-admin-border px-3 py-2 text-sm shadow-sm transition focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handleFileChange(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Завантаження…" : "Завантажити з компʼютера"}
        </Button>
        {value && (
          <Button type="button" variant="secondary" onClick={() => onChange("")}>
            Очистити
          </Button>
        )}
      </div>
      {hint && <p className="text-xs text-admin-muted">{hint}</p>}
      {value && (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-admin-border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-20 w-20 rounded object-cover"
          />
          <p className="min-w-0 flex-1 break-all text-xs text-admin-muted">
            {urlLabel}: {value}
          </p>
        </div>
      )}
    </div>
  );
}
