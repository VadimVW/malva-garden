"use client";

import { useRef, useState } from "react";
import { adminUploadFile, ApiError } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
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
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <Input
            label={label}
            hint={hint}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleFileChange(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Завантаження…" : "Завантажити з компʼютера"}
          </Button>
          {value && (
            <Button type="button" variant="secondary" onClick={() => onChange("")}>
              Очистити
            </Button>
          )}
        </div>
      </div>
      {value && (
        <div className="flex items-start gap-3 rounded-lg border border-admin-border p-3">
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
