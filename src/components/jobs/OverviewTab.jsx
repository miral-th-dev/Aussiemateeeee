import { useState } from "react";
import {
  Mail,
  Phone,
  Star,
  MoreVertical,
  FileText,
  RefreshCcw,
} from "lucide-react";
import silverTierIcon from "../../assets/icon/silver.svg";
import goldTierIcon from "../../assets/icon/gold.svg";
import bronzeTierIcon from "../../assets/icon/bronze.svg";
import camelIllustration from "../../assets/image/camel.svg";
import CustomMenu from "../common/CustomMenu";
import ReleaseFundsModal from "../common/ReleaseFundsModal";
import ActionModal from "../common/ActionModal";
import { updatePaymentStatus } from "../../api/services/jobService";
import Avatar from "../common/Avatar";

export default function OverviewTab({
  jobDetails,
  getStatusColor,
  onPaymentStatusUpdate,
}) {
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState(
    jobDetails?.payment?.escrowStatus || "Pending",
  );

  // Use local state if available, otherwise fallback to prop
  const currentEscrowStatus =
    escrowStatus || jobDetails?.payment?.escrowStatus || "Pending";
  const isEscrowReleased = currentEscrowStatus?.toLowerCase() === "released";

  // Get tier icon based on cleaner tier
  const tier = (
    jobDetails?.cleaner?.tier ||
    jobDetails?.cleaner?.badge ||
    "none"
  )
    .toString()
    .toLowerCase();
  const tierIcon =
    tier === "gold"
      ? goldTierIcon
      : tier === "bronze"
        ? bronzeTierIcon
        : tier === "none"
          ? null
          : silverTierIcon;
  const tierLabel =
    tier === "none"
      ? "None Tier"
      : `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Tier`;

  const handleInvoiceDownload = () => {
    if (!jobDetails) return;

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    const jobId = jobDetails?.jobId || "—";
    const customerName = jobDetails.customer?.name || "Customer";
    const cleanerName = jobDetails.cleaner?.name || "Cleaner";
    const reportDate = new Date().toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
                
                .invoice-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 60px;
                }
                
                .brand-section h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: ${primaryColor};
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                
                .brand-section p {
                    font-size: 14px;
                    color: ${lightTextColor};
                    margin: 4px 0 0 0;
                }
                
                .invoice-meta {
                    text-align: right;
                }
                
                .invoice-meta h2 {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0;
                    text-transform: uppercase;
                    color: ${darkColor};
                }
                
                .invoice-meta p {
                    margin: 4px 0;
                    font-weight: 500;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-bottom: 50px;
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
                
                .detail-box .primary-text {
                    font-weight: 600;
                    font-size: 18px;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 8px;
                    background: #F3F4F6;
                }
                
                .status-released {
                    background: #EAFFF1;
                    color: ${successColor};
                }
                
                .status-pending {
                    background: #FFF8DD;
                    color: #F6B100;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 40px 0;
                }
                
                th {
                    text-align: left;
                    background: #F9FAFB;
                    padding: 12px 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: ${lightTextColor};
                    text-transform: uppercase;
                    border-bottom: 1px solid ${borderColor};
                }
                
                td {
                    padding: 20px;
                    border-bottom: 1px solid ${borderColor};
                    font-size: 15px;
                }
                
                .summary-section {
                    display: flex;
                    justify-content: flex-end;
                }
                
                .summary-table {
                    width: 320px;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 14px;
                }
                
                .summary-row.total {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 2px solid ${darkColor};
                    font-weight: 700;
                    font-size: 18px;
                }
                
                .footer {
                    margin-top: 100px;
                    text-align: center;
                    border-top: 1px solid ${borderColor};
                    padding-top: 24px;
                }
                
                .footer p {
                    font-size: 12px;
                    color: ${lightTextColor};
                    margin: 4px 0;
                }
                
                @media print {
                    body { padding: 0; }
                    .invoice-wrapper { width: 100%; }
                }
            </style>
        `;

    const currentStatus = jobDetails?.payment?.escrowStatus || "Pending";
    const statusClass = `status-${currentStatus.toLowerCase()}`;

    const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice - ${jobId}</title>
                    ${styles}
                </head>
                <body>
                    <div class="invoice-wrapper">
                        <div class="header">
                            <div class="brand-section">
                                <h1>AussieMate</h1>
                                <p>Professional Home Services</p>
                            </div>
                            <div class="invoice-meta">
                                <h2>Invoice</h2>
                                <p style="font-weight: 600;"># ${jobId}</p>
                                <p style="color: ${lightTextColor}; font-size: 14px;">Issued on ${reportDate}</p>
                            </div>
                        </div>

                        <div class="details-grid">
                            <div class="detail-box">
                                <h3>Bill To</h3>
                                <p class="primary-text">${customerName}</p>
                                <p>${jobDetails.customer?.email || "—"}</p>
                                <p>${jobDetails.customer?.phone || "—"}</p>
                            </div>
                            <div class="detail-box" style="text-align: right;">
                                <h3>Cleaner Details</h3>
                                <p class="primary-text" style="font-size: 16px;">${cleanerName}</p>
                                <div class="status-badge ${statusClass}">
                                    ${currentStatus}
                                </div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 70%;">Service Description</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <p style="font-weight: 600; margin: 0;">Cleaning Service</p>
                                        <p style="font-size: 13px; color: ${lightTextColor}; margin: 4px 0 0 0;">
                                            Job ID: ${jobId} • Location: ${jobDetails.location || "N/A"}
                                        </p>
                                    </td>
                                    <td style="text-align: right; font-weight: 600;">
                                        AU$${Number(jobDetails.payment.amountPaid || 0).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="summary-section">
                            <div class="summary-table">
                                <div class="summary-row">
                                    <span style="color: ${lightTextColor}">Platform Fee (15%)</span>
                                    <span>AU$${Number(jobDetails.payment.platformFees || 0).toLocaleString()}</span>
                                </div>
                                <div class="summary-row">
                                    <span style="color: ${lightTextColor}">GST (10%)</span>
                                    <span>AU$${Number(jobDetails.payment.gst || 0).toLocaleString()}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total Amount</span>
                                    <span style="color: ${primaryColor}">AU$${Number(jobDetails.payment.amountPaid || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Thank you for your business!</p>
                            <p>© ${new Date().getFullYear()} AussieMate. This is a system-generated document.</p>
                            <p>For support, contact support@aussiemate.com.au</p>
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

  const paymentMenuItems = isEscrowReleased
    ? [
        {
          id: "invoice",
          label: "Generate Invoice (PDF)",
          icon: <FileText size={22} className="text-[#8CA4C3]" />,
          onClick: handleInvoiceDownload,
        },
      ]
    : [
        {
          id: "release-funds",
          label: "Release Funds",
          icon: <RefreshCcw size={22} className="text-[#1F6FEB]" />,
          onClick: () => setIsReleaseModalOpen(true),
        },
        {
          id: "invoice",
          label: "Generate Invoice (PDF)",
          icon: <FileText size={22} className="text-[#8CA4C3]" />,
          onClick: handleInvoiceDownload,
        },
      ];

  return (
    <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-xs w-full">
      <div className="flex items-center justify-between min-h-[56px] px-4 sm:px-5 md:px-6 lg:px-7.5 py-4 sm:py-5 border-b border-[#F1F1F4]">
        <h2 className="font-semibold text-sm sm:text-base text-primary">
          Job Overview
        </h2>
        <CustomMenu
          align="right"
          trigger={
            <button className="p-1 flex-shrink-0 cursor-pointer">
              <MoreVertical size={20} className="text-primary" />
            </button>
          }
          items={paymentMenuItems}
          className="min-w-[260px]"
        />
      </div>

      <div className="p-4 sm:p-5 xl:p-6 lg:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Customer */}
          <div className="border border-[#F1F1F4] rounded-[12px] p-2 xl:p-3 sm:p-3 lg:px-2 lg:py-4 bg-white w-full">
            <h3 className="text-xs sm:text-sm font-semibold text-primary mb-3 ">
              Customer
            </h3>

            <div className="flex items-start gap-3">
              <Avatar
                src={jobDetails.customer?.avatar}
                firstName={jobDetails.customer?.firstName}
                lastName={jobDetails.customer?.lastName}
                fullName={jobDetails.customer?.name}
                id={jobDetails.customer?.id}
                className="w-12 h-12"
                size={48}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-primary break-words">
                  {jobDetails.customer?.name || "—"}
                </p>

                <div className=" mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-light">
                    <Mail size={16} className="flex-shrink-0" />
                    <span className="break-all">
                      {jobDetails.customer?.email || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-light">
                    <Phone size={16} className="flex-shrink-0" />
                    <span className="break-all">
                      {jobDetails.customer?.phone || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Cleaner */}
          <div className="border border-[#F1F1F4] rounded-[12px] p-2 xl:p-3 sm:p-3 lg:px-2 lg:py-4 bg-white w-full">
            <h3 className="text-xs sm:text-sm font-semibold text-primary mb-1">
              Cleaner
            </h3>

            <div className="flex items-start gap-3">
              <Avatar
                src={jobDetails.cleaner?.avatar}
                firstName={jobDetails.cleaner?.firstName}
                lastName={jobDetails.cleaner?.lastName}
                fullName={jobDetails.cleaner?.name}
                id={jobDetails.cleaner?.id}
                className="w-12 h-12"
                size={48}
              />

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center flex-wrap gap-1">
                  <p className="font-semibold text-sm text-primary break-words">
                    {jobDetails.cleaner?.name || "—"}
                  </p>
                  {jobDetails.cleaner?.role && (
                    <p className="text-xs sm:text-sm text-primary-light whitespace-nowrap">
                      • {jobDetails.cleaner.role}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    {(jobDetails.cleaner?.rating ||
                      jobDetails.cleaner?.rating === 0) && (
                      <div
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF4E0]"
                        style={{ border: "0.6px solid #FFEDBA" }}
                      >
                        <Star
                          size={14}
                          className="text-[#FFB020] fill-[#FFB020]"
                        />
                        <span className="text-[10px] sm:text-xs text-primary font-medium">
                          {Number(jobDetails.cleaner.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    )}
                    {jobDetails.cleaner?.jobsCompleted !== undefined && (
                      <span className="text-[10px] sm:text-xs text-primary-light">
                        ({jobDetails.cleaner.jobsCompleted} jobs)
                      </span>
                    )}
                  </div>

                  {(tierIcon || tier === "none") && (
                    <div className="flex items-center gap-2 px-2 py-1 border-[0.5px] border-[#E9E9E9] rounded-full text-[10px] sm:text-xs font-medium bg-[linear-gradient(90deg,#FDFDFD_0%,#E9E9E9_100%)]">
                      {tierIcon && (
                        <img
                          src={tierIcon}
                          alt={tierLabel}
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                      )}
                      <span className="text-primary-light">{tierLabel}</span>
                    </div>
                  )}
                </div>

                {jobDetails.cleaner?.searchRadius && (
                  <p className="text-sm text-primary-light mt-1">
                    {jobDetails.cleaner.searchRadius} km distance radius
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Payment Card */}
        {/* <div className="bg-white rounded-[20px] mt-5">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-primary mb-4">
                        Payment
                    </h3>

                    <div className="space-y-3">

                        <div className="flex sm:grid sm:grid-cols-[160px_auto] justify-between sm:justify-start items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-primary-light">Mode:</span>
                            <span className="text-xs sm:text-sm font-medium text-primary">
                                {jobDetails.payment.mode}
                            </span>
                        </div>

                        <div className="flex sm:grid sm:grid-cols-[160px_auto] justify-between sm:justify-start items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-primary-light">Amount Paid:</span>
                            <span className="text-xs sm:text-sm font-medium text-primary">
                                AU${jobDetails.payment.amountPaid}
                            </span>
                        </div>

                        <div className="flex sm:grid sm:grid-cols-[160px_auto] justify-between sm:justify-start items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-primary-light">Platform Fees 15%:</span>
                            <span className="text-xs sm:text-sm font-medium text-primary">
                                AU${jobDetails.payment.platformFees}
                            </span>
                        </div>

                        <div className="flex sm:grid sm:grid-cols-[160px_auto] justify-between sm:justify-start items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-primary-light">GST 10%:</span>
                            <span className="text-xs sm:text-sm font-medium text-primary">
                                AU${jobDetails.payment.gst}
                            </span>
                        </div>

                        <div className="flex sm:grid sm:grid-cols-[160px_1fr] justify-between sm:justify-start items-center gap-2">
                            <span className="text-xs sm:text-sm text-primary-light">Escrow:</span>
                            <div className="flex sm:flex-row items-center justify-end sm:justify-between w-full gap-2 sm:gap-3 flex-wrap">
                                <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
                                    <span className="text-xs sm:text-sm font-medium text-primary">
                                        AU${jobDetails.payment.escrow}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-primary-light">
                                        • released {jobDetails.payment.escrowReleased}
                                    </span>
                                </div>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-[6px] text-[10px] sm:text-xs font-medium border whitespace-nowrap ${getStatusColor(
                                        currentEscrowStatus
                                    )}`}>
                                    {currentEscrowStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div> */}
      </div>
      <ReleaseFundsModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        jobDetails={jobDetails}
        onConfirm={async () => {
          try {
            // Use _id (MongoDB ID) instead of jobId (display ID like AM85307)
            const jobId =
              jobDetails?._id || jobDetails?.id || jobDetails?.jobId;
            if (jobId) {
              // Call API to update payment status
              await updatePaymentStatus(jobId, "Released");

              // Update local state
              setEscrowStatus("Released");

              // Notify parent component to update JobsTable
              if (onPaymentStatusUpdate) {
                onPaymentStatusUpdate(jobId, "Released");
              }
            }
            setIsReleaseModalOpen(false);
            setIsSuccessModalOpen(true);
          } catch (error) {
            console.error("Failed to update payment status", error);
            setIsReleaseModalOpen(false);
            // Show error message or keep modal open
            alert("Failed to update payment status. Please try again.");
          }
        }}
      />

      {/* Success Modal */}
      <ActionModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        illustration={
          <div className="flex flex-col items-center">
            <img
              src={camelIllustration}
              alt="Release success"
              className="w-40 sm:w-48 h-auto object-contain"
            />
          </div>
        }
        title={
          <div className="space-y-2">
            <p className="text-lg sm:text-xl font-semibold text-[#111827]">
              {jobDetails?.jobId || "AM10432"}
            </p>
            <p className="text-base sm:text-lg font-semibold text-[#111827]">
              Funds successfully released to Cleaner
            </p>
            <p className="text-base sm:text-lg font-semibold text-[#111827]">
              {jobDetails?.cleaner?.name || "Jason Tatum"}.
            </p>
            <p className="text-sm sm:text-base text-[#6B7280] font-normal mt-2">
              AU${jobDetails?.payment?.escrow || 267.2} will reach within 24
              hours.
            </p>
          </div>
        }
        description={null}
        primaryLabel=""
        primaryVariant="success"
        onPrimary={() => {
          setEscrowStatus("Released");
          setIsSuccessModalOpen(false);
        }}
        hideSecondary={true}
        hideFooter={true}
      />
    </div>
  );
}
