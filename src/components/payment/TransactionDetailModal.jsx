import { useEffect } from "react";
import { X, ArrowUp, Upload } from "lucide-react";

export default function TransactionDetailModal({ isOpen, onClose, transaction }) {
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

  if (!isOpen || !transaction) return null;

  const formatCurrency = (value) => `AU$${Number(value || 0).toLocaleString()}`;

  const formatDateTime = (date) => {
    if (!date) return "-";
    try {
      const dateObj = new Date(date);
      if (Number.isNaN(dateObj.getTime())) return date;
      // Format: DD-MM-YYYY HH:MM
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      // Check if time is midnight (likely just a date without time)
      if (hours === "00" && minutes === "00") {
        return `${day}-${month}-${year}`;
      }
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return date;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Released: {
        dot: "bg-[#17C653]",
        text: "text-[#17C653]",
        bg: "bg-[#EAFFF1]",
        border: "border-[#17C65333]",
      },
      Held: {
        dot: "bg-[#F6B100]",
        text: "text-[#F6B100]",
        bg: "bg-[#FFF8DD]",
        border: "border-[#F6B10033]",
      },
      Failed: {
        dot: "bg-[#EF4444]",
        text: "text-[#EF4444]",
        bg: "bg-[#FEE2E2]",
        border: "border-[#EF444433]",
      },
    };

    const config = statusConfig[status] || statusConfig.Released;

    return (
      <span
        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs font-medium ${config.bg} ${config.border} ${config.text}`}
      >
        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${config.dot}`} />
        {status}
      </span>
    );
  };

  // Calculate fees (assuming platform fee is 15% and GST is 10% of platform fee)
  const platformFee = transaction.totalAmount * 0.15;
  const gstFee = platformFee * 0.1;
  const totalPayable = transaction.payableAmount || transaction.totalAmount - platformFee - gstFee;

  const handleExportHistory = () => {
    if (!transaction) return;

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    const jobId = transaction.jobId || "—";
    const transactionId = transaction.transactionId || "—";
    const reportDate = new Date().toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Design colors
    const primaryColor = "#1F6FEB";
    const darkColor = "#111827";
    const lightTextColor = "#6B7280";
    const borderColor = "#F1F1F4";
    const successColor = "#17C653";

    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          padding: 40px; 
          color: ${darkColor};
          line-height: 1.5;
          background: white;
        }
        
        .report-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
          border-bottom: 2px solid ${borderColor};
          padding-bottom: 20px;
        }
        
        .brand-section h1 {
          font-size: 28px;
          font-weight: 800;
          color: ${primaryColor};
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .report-meta {
          text-align: right;
        }
        
        .report-meta h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: ${darkColor};
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .detail-box h3 {
          font-size: 12px;
          text-transform: uppercase;
          color: ${lightTextColor};
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          border-bottom: 1px solid ${borderColor};
          padding-bottom: 6px;
        }
        
        .detail-box p {
          margin: 4px 0;
          font-size: 15px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .status-released { background: #EAFFF1; color: ${successColor}; }
        .status-held { background: #FFF8DD; color: #F6B100; }
        .status-failed { background: #FEE2E2; color: #EF4444; }
        
        .payment-summary {
          background: #F9FAFB;
          border: 1px solid ${borderColor};
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 40px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid ${borderColor};
        }
        
        .summary-row:last-of-type {
          border-bottom: none;
          padding-top: 20px;
          margin-top: 8px;
          font-weight: 700;
          font-size: 18px;
        }
        
        .footer {
          margin-top: 80px;
          text-align: center;
          border-top: 1px solid ${borderColor};
          padding-top: 24px;
          font-size: 12px;
          color: ${lightTextColor};
        }
        
        @media print {
          body { padding: 0; }
        }
      </style>
    `;

    const statusClass = `status-${(transaction.status || "").toLowerCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Report - ${transactionId}</title>
          ${styles}
        </head>
        <body>
          <div class="report-wrapper">
            <div class="header">
              <div class="brand-section">
                <h1>AussieMate</h1>
                <p style="color: ${lightTextColor}; margin: 4px 0;">Transaction Settlement Record</p>
              </div>
              <div class="report-meta">
                <h2>Transaction Report</h2>
                <p style="color: ${lightTextColor}; font-size: 14px; margin: 4px 0;">${reportDate}</p>
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-box">
                <h3>Customer Details</h3>
                <p style="font-weight: 700; font-size: 18px;">${transaction.customer?.name || "—"}</p>
                <p style="color: ${lightTextColor};">${transaction.customer?.email || "—"}</p>
              </div>
              <div class="detail-box">
                <h3>Cleaner Details</h3>
                <p style="font-weight: 700; font-size: 18px;">${transaction.cleaner?.name || "—"}</p>
                <p style="color: ${lightTextColor};">${transaction.cleaner?.email || "—"}</p>
              </div>
            </div>

            <div class="details-grid" style="margin-bottom: 20px;">
              <div class="detail-box">
                <h3>Reference Info</h3>
                <p><span style="color: ${lightTextColor};">Job ID:</span> ${jobId}</p>
                <p><span style="color: ${lightTextColor};">Transaction ID:</span> ${transactionId}</p>
              </div>
              <div class="detail-box" style="text-align: right;">
                <h3>Status</h3>
                <div class="status-badge ${statusClass}">${transaction.status}</div>
              </div>
            </div>

            <div class="payment-summary">
              <div class="summary-row">
                <span>Amount Paid by Customer</span>
                <span>${formatCurrency(transaction.totalAmount)}</span>
              </div>
              <div class="summary-row" style="color: ${lightTextColor}; font-size: 14px;">
                <span>Platform Commission (15%)</span>
                <span>- ${formatCurrency(platformFee)}</span>
              </div>
              <div class="summary-row" style="color: ${lightTextColor}; font-size: 14px;">
                <span>GST on Commission (10%)</span>
                <span>- ${formatCurrency(gstFee)}</span>
              </div>
              <div class="summary-row">
                <span>Total Settlement Payable</span>
                <span style="color: ${primaryColor}">${formatCurrency(totalPayable)}</span>
              </div>
            </div>

            <div style="background: #FFF8DD; border-left: 4px solid #F6B100; padding: 16px; border-radius: 4px; font-size: 13px;">
              <strong>Note:</strong> Settlement is subject to AussieMate payout schedule and escrow release conditions. 
              This document is a digital record for administrative purposes.
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} AussieMate. System Generated Secure Receipt.</p>
              <p>For inquiries, please contact admin-support@aussiemate.com.au</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-3 md:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6 relative z-10 w-full max-w-2xl rounded-xl sm:rounded-2xl bg-white shadow-xl border border-gray flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 bg-white sticky top-0 pb-3 sm:pb-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary truncate">
              {transaction.jobId}
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-primary-light truncate">
              Transaction ID: {transaction.transactionId}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleExportHistory}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-[10px] sm:text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
              <span className="hidden sm:inline">Export history</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Transaction Content */}
        <div className="pb-4 sm:pb-6">
          {/* Payment Section */}
          <div className="mb-4 sm:mb-6 border border-gray-200 rounded-lg sm:rounded-xl mt-3 sm:mt-4">
            <h3 className="font-medium text-sm sm:text-base text-primary px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 border-b border-gray-200">
              Payment
            </h3>

            <div className="">
              {/* Job ID */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 border-b border-gray-200 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Job ID:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary break-all sm:break-normal text-end sm:text-left">
                  {transaction.jobId}
                </span>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 border-b border-gray-200 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Transaction ID:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary break-all sm:break-normal text-end sm:text-left">
                  {transaction.transactionId}
                </span>
              </div>

              {/* Customer */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 border-b border-gray-200 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Customer:
                </span>
                <div className="flex flex-wrap items-center gap-1 min-w-0 text-end sm:text-left sm:justify-start justify-end">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {transaction.customer?.name || "N/A"}
                  </span>
                  {transaction.customer?.email && (
                    <span className="text-xs sm:text-sm text-primary-light break-all sm:break-normal">
                      - {transaction.customer.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Cleaner */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 border-b border-gray-200 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Cleaner:
                </span>
                <div className="flex flex-wrap items-center gap-1 min-w-0 text-end sm:text-left sm:justify-start justify-end">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {transaction.cleaner?.name || "N/A"}
                  </span>
                  {transaction.cleaner?.email && (
                    <span className="text-xs sm:text-sm text-primary-light break-all sm:break-normal">
                      - {transaction.cleaner.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount Paid */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 border-b border-gray-200">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Amount Paid:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary text-end sm:text-left">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 border-b border-gray-200">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Platform Fee:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary text-end sm:text-left">
                  {formatCurrency(platformFee)}
                </span>
              </div>

              {/* GST Fee */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 border-b border-gray-200">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  GST Fee:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary text-end sm:text-left">
                  {formatCurrency(gstFee)}
                </span>
              </div>

              {/* Total Payable */}
              <div className="flex justify-between sm:justify-start gap-1 sm:gap-0 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 border-b border-gray-200">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Total Payable:
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary text-end sm:text-left">
                  {formatCurrency(totalPayable)}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between sm:justify-start gap-2 sm:gap-0 px-3 sm:px-5 md:px-7 py-2.5 sm:py-3">
                <span className="text-xs sm:text-sm text-primary-light font-medium sm:w-32 md:w-36 flex-shrink-0">
                  Status:
                </span>
                <div className="flex flex-wrap items-center gap-2 min-w-0 justify-end sm:justify-start">
                  {getStatusBadge(transaction.status)}
                  {transaction.date && (
                    <span className="text-xs sm:text-sm text-primary-light whitespace-nowrap">
                      on {formatDateTime(transaction.date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

