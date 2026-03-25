import { X } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

/**
 * Reusable centered action modal.
 *
 * Props:
 * - isOpen: boolean – controls visibility
 * - onClose: () => void – called when backdrop or X is clicked
 * - illustration: ReactNode – top illustration (img / svg / JSX)
 * - title: string | ReactNode
 * - description: string | ReactNode
 * - primaryLabel: string
 * - onPrimary: () => void
 * - primaryVariant: "primary" | "danger" | "success" (button color)
 * - secondaryLabel?: string
 * - onSecondary?: () => void
 * - hideSecondary?: boolean
 * - footerContent?: ReactNode – custom footer instead of default buttons
 * - className?: string – extra classes for the card
 */

const VARIANT_CLASSES = {
  primary:
    "bg-[#1F6FEB] hover:bg-[#1B63D6] text-white text-[13px] focus:ring-[#1F6FEB]/30",
  danger:
    "bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] focus:ring-[#EF4444]/30",
  success:
    "bg-[#16A34A] hover:bg-[#15803D] text-white focus:ring-[#16A34A]/30",
};

export default function ActionModal({
  isOpen,
  onClose,
  illustration,
  title,
  description,
  primaryLabel,
  onPrimary,
  primaryVariant = "primary",
  secondaryLabel = "Cancel",
  onSecondary,
  hideSecondary = false,
  footerContent,
  hideFooter = false,
  className = "",
}) {
  // Close on ESC and Lock Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mappedVariant =
    primaryVariant === "danger"
      ? "danger"
      : primaryVariant === "success"
      ? "success"
      : "primary";

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
      {/* Backdrop click closes */}
      <div
        className="absolute inset-0"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className={`relative z-10 w-full max-w-[500px] rounded-2xl bg-white shadow-xl border border-[#E5E7EB] flex flex-col overflow-hidden ${className}`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5 cursor-pointer" />
        </button>

        <div className="px-6 sm:px-10 pt-10 pb-8 sm:pb-10 text-center">
          {/* Illustration */}
          {illustration && (
            <div className="mb-6 sm:mb-8 flex justify-center">
              {illustration}
            </div>
          )}

          {/* Title */}
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] mb-3">
              {title}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-xl mx-auto">
              {description}
            </p>
          )}

          {/* Footer */}
          {!hideFooter && (
            <div className="mt-8 sm:mt-10">
              {footerContent ? (
                footerContent
              ) : (
                <div className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4">
                  {!hideSecondary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSecondary?.();
                        if (!onSecondary) onClose?.();
                      }}
                    >
                      {secondaryLabel}
                    </Button>
                  )}
                  <Button
                    variant={mappedVariant}
                    size="md"
                    onClick={onPrimary}
                    className="px-5 sm:px-6 py-2"
                  >
                    {primaryLabel}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}


