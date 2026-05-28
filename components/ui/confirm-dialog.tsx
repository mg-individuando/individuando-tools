"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when user dismisses (Cancel, backdrop click, Escape). */
  onCancel: () => void;
  /** Called when user confirms. */
  onConfirm: () => void;
  /** Dialog title. */
  title: string;
  /** Dialog body — short explanation of what's about to happen. */
  description?: string;
  /** Confirm button label (default: "Confirmar"). */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancelar"). */
  cancelLabel?: string;
  /** Variant — "default" (blue) or "destructive" (red). Default: "default". */
  variant?: "default" | "destructive";
}

/**
 * ConfirmDialog — modal de confirmação leve, sem deps externas.
 * Acessível (role=alertdialog, focus trap básico, Escape fecha, backdrop fecha).
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus confirm button on open
  useEffect(() => {
    if (open) {
      // Slight delay for the portal to mount
      const t = setTimeout(() => confirmButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape key closes dialog
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  const confirmColor =
    variant === "destructive"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-[#0080ff] hover:bg-[#0066cc] focus-visible:ring-[#0080ff]";

  const iconColor = variant === "destructive" ? "text-red-600" : "text-[#0080ff]";
  const iconBg =
    variant === "destructive" ? "bg-red-100" : "bg-[rgba(0,128,255,0.1)]";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar diálogo"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        tabIndex={-1}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-[#0f172a]"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="confirm-dialog-description"
                  className="mt-1.5 text-sm text-[#475569] leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#475569] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-300 focus-visible:outline-none transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
