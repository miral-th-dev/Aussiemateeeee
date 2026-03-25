import React, { useEffect } from "react";
import { X, User } from "lucide-react";
import Button from "./Button";

/**
 * Generic escrow/payout release modal.
 * Expects a jobDetails-like object:
 * {
 *   jobId,
 *   cleaner: { name, avatar },
 *   customer?: { name, avatar },
 *   payment: { amountPaid, platformFees, gst, escrow, releaseDate }
 * }
 */
export default function ReleaseFundsModal({
  isOpen,
  onClose,
  onConfirm,
  jobDetails,
}) {
  // Close on ESC key and Lock Scroll
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

  const payment = jobDetails?.payment || {};
  const cleaner = jobDetails?.cleaner || {};
  const customer = jobDetails?.customer || {};
  const hasCustomer = Boolean(customer?.name);
  const jobId = jobDetails?.jobId || jobDetails?.id || "—";
  const releaseDate = payment.releaseDate || payment.escrowReleased;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3 sm:py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm sm:text-base font-semibold text-primary">
            Release Escrow Funds
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#6B7280] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 sm:px-7 py-4 space-y-4 sm:space-y-5">
          {/* Job ID */}
          <div className="space-y-1">
            <span className="text-xs sm:text-sm text-primary font-medium">Job ID</span>
            <p className="text-sm sm:text-base font-medium text-primary-light">
              {jobId}
            </p>
          </div>

          {/* Cleaner and Customer Cards */}
          <div
            className={`grid grid-cols-1 ${hasCustomer ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-3 sm:gap-4`}
          >
            <InfoCard
              title="Cleaner"
              avatar={cleaner.avatar}
              name={cleaner.name}
              fallbackIcon={<User size={18} />}
            />
            {hasCustomer && (
              <InfoCard
                title="Customer"
                avatar={customer.avatar}
                name={customer.name}
                fallbackIcon={<User size={18} />}
              />
            )}
          </div>

          {/* Payment breakdown */}
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
            <BreakdownRow label="Amount Paid" value={`AU$${payment.amountPaid ?? 0}`} />
            <BreakdownRow label="Platform Fees 15%" value={`AU$${payment.platformFees ?? 0}`} />
            <BreakdownRow label="GST 10%" value={`AU$${payment.gst ?? 0}`} />
            <BreakdownRow
              label="Escrow"
              value={`AU$${payment.escrow ?? 0}`}
              subValue={releaseDate ? `• release ${releaseDate}` : ""}
              highlight
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <Button
            fullWidth
            onClick={onConfirm}
            variant="primary"
            className="sm:w-auto"
          >
            Confirm Release
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={onClose}
            className="sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, avatar, name, fallbackIcon }) {
  if (!name && !avatar) return null;
  return (
    <div className="w-full border border-[#E5E7EB] rounded-2xl p-3 sm:p-4 bg-white">
      <p className="text-xs sm:text-sm text-primary-light font-medium mb-2">{title}</p>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#F3F4F6] flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            fallbackIcon
          )}
        </div>
        <p className="text-sm sm:text-base font-medium text-primary truncate">
          {name || "—"}
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, subValue, highlight = false }) {
  return (
    <div className="grid grid-cols-[140px_auto] sm:grid-cols-[180px_auto] items-center gap-2 sm:gap-3">
      <span className="text-primary-light font-medium text-xs sm:text-sm text-primary-light">
        {label}
      </span>
      <div className="flex items-center gap-2 font-medium text-primary text-sm sm:text-base justify-start flex-wrap">
        <span className={highlight ? "text-primary" : ""}>{value}</span>
        {subValue && (
          <span className="text-primary-light text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

