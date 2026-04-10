"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CustomFont } from "@/lib/schemas/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = ".ttf,.otf,.woff,.woff2";

/** Auto-detect font weight from original filename */
function detectWeightFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("thin")) return "100";
  if (lower.includes("extralight") || lower.includes("extra-light") || lower.includes("extra_light")) return "200";
  if (lower.includes("light")) return "300";
  if (lower.includes("regular") || lower.includes("normal")) return "400";
  if (lower.includes("medium")) return "500";
  if (lower.includes("semibold") || lower.includes("semi-bold") || lower.includes("semi_bold") || lower.includes("demi")) return "600";
  if (lower.includes("extrabold") || lower.includes("extra-bold") || lower.includes("extra_bold")) return "800";
  if (lower.includes("black") || lower.includes("heavy")) return "900";
  if (lower.includes("bold")) return "700";
  return "400";
}

interface FontUploadProps {
  bucket: string;
  path: string;
  onUpload: (fonts: CustomFont[]) => void;
  maxSize?: number;
}

export function FontUpload({
  bucket,
  path,
  onUpload,
  maxSize = MAX_FILE_SIZE,
}: FontUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter((f) => {
        if (f.size > maxSize) {
          toast.error(`"${f.name}" excede o limite de ${Math.round(maxSize / 1024 / 1024)}MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      const uploaded: CustomFont[] = [];
      const total = validFiles.length;

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const originalName = file.name;

        // Detect weight from ORIGINAL filename before mangling
        const weight = detectWeightFromFilename(originalName);

        // Create unique storage name but preserve extension
        const ext = originalName.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `${path}/${uniqueName}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: true });

        if (error) {
          toast.error(`Erro ao enviar "${originalName}": ${error.message}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        uploaded.push({
          url: publicUrl,
          weight,
          name: originalName, // Preserve the original filename!
        });

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setUploading(false);
      setProgress(0);

      if (uploaded.length > 0) {
        onUpload(uploaded);
        toast.success(
          uploaded.length === 1
            ? `Fonte "${uploaded[0].name}" enviada com sucesso`
            : `${uploaded.length} fontes enviadas com sucesso`
        );
      }
    },
    [bucket, path, maxSize, onUpload, supabase.storage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) processFiles(files);
      // Reset input so same files can be selected again
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFiles]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 transition-colors",
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
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Arraste ou clique para enviar fontes
            </span>
            <span className="text-xs text-muted-foreground">
              Selecione um ou mais arquivos de uma vez
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        TTF, OTF, WOFF ou WOFF2. Maximo 5MB por arquivo. O peso e detectado pelo nome (ex: &quot;Montserrat-Bold.woff2&quot; → 700 Bold).
      </p>
    </div>
  );
}
