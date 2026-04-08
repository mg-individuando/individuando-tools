"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, FileImage, FileType } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploadProps {
  bucket: string;
  path: string;
  accept: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  label: string;
  hint?: string;
  maxSize?: number;
}

export function FileUpload({
  bucket,
  path,
  accept,
  onUpload,
  currentUrl,
  label,
  hint,
  maxSize = MAX_FILE_SIZE,
}: FileUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);

  const isImage = accept.startsWith("image");

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSize) {
        toast.error(
          `Arquivo excede o limite de ${Math.round(maxSize / 1024 / 1024)}MB.`
        );
        return;
      }

      setUploading(true);
      setProgress(0);

      const ext = file.name.split(".").pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${path}/${uniqueName}`;

      // Simulate progress since Supabase JS client doesn't expose upload progress natively
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      clearInterval(progressInterval);

      if (error) {
        setUploading(false);
        setProgress(0);
        toast.error("Erro ao enviar arquivo: " + error.message);
        return;
      }

      setProgress(100);

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      setFileName(file.name);
      setUploading(false);
      onUpload(publicUrl);
    },
    [bucket, path, maxSize, onUpload, supabase.storage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileName(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    onUpload("");
  }, [onUpload]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {previewUrl ? (
        <div className="relative flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          {isImage ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-16 w-16 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted">
              <FileType className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 truncate text-sm text-foreground">
            {fileName ?? previewUrl.split("/").pop()}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {uploading ? (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Enviando... {progress}%
              </span>
            </div>
          ) : (
            <>
              {isImage ? (
                <FileImage className="size-8 text-muted-foreground" />
              ) : (
                <Upload className="size-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                Arraste ou clique para enviar
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
