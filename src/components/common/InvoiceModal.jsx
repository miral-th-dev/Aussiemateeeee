import { useEffect } from "react";
import { X } from "lucide-react";

export default function InvoiceModal({ isOpen, onClose, invoice }) {
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

    if (!isOpen || !invoice) return null;

    const formatCurrency = (value) => `AU$${Number(value || 0).toLocaleString()}`;

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toISOString().split("T")[0];
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Escrowed: {
                bg: "bg-[#EBF2FD]",
                text: "text-[#2563EB]",
                border: "border-[#2563EB33]",
                dot: "bg-[#2563EB]",
            },
            Released: {
                bg: "bg-[#EAFFF1]",
                text: "text-[#17C653]",
                border: "border-[#17C65333]",
                dot: "bg-[#17C653]",
            },
            Held: {
                bg: "bg-[#FFF8DD]",
                text: "text-[#F6B100]",
                border: "border-[#F6B10033]",
                dot: "bg-[#F6B100]",
            },
            Pending: {
                bg: "bg-[#EBF2FD]",
                text: "text-[#2563EB]",
                border: "border-[#2563EB33]",
                dot: "bg-[#2563EB]",
            },
            Refunded: {
                bg: "bg-[#FEE2E2]",
                text: "text-[#EF4444]",
                border: "border-[#EF444433]",
                dot: "bg-[#EF4444]",
            },
        };

        const config = statusConfig[status] || statusConfig.Pending;

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.text} border ${config.border}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${config.dot}`} />
                {status}
            </span>
        );
    };

    const handleDownload = () => {
        if (!invoice) return;

        const printWindow = window.open("", "", "width=1200,height=800");
        if (!printWindow) return;

        const jobId = invoice.jobId || "—";
        const customerName = invoice.customerName || "Customer";
        const serviceName = invoice.service || "Home Services";
        const amount = Number(invoice.amount || 0);
        const gst = Number(invoice.gst || (amount * 0.1));
        const total = amount + gst;

        const reportDate = new Date().toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
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
                
                .invoice-meta {
                    text-align: right;
                }
                
                .invoice-meta h2 {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0;
                    text-transform: uppercase;
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
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 600;
                    background: #EAFFF1;
                    color: ${successColor};
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
                    font-size: 12px;
                    color: ${lightTextColor};
                }
                
                @media print {
                    body { padding: 0; }
                }
            </style>
        `;

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
                                <p style="color: ${lightTextColor}; margin: 4px 0;">Professional Home Services</p>
                            </div>
                            <div class="invoice-meta">
                                <h2>Invoice</h2>
                                <p style="font-weight: 600; margin: 4px 0;"># ${jobId}</p>
                                <p style="color: ${lightTextColor}; font-size: 14px; margin: 0;">${reportDate}</p>
                            </div>
                        </div>

                        <div class="details-grid">
                            <div class="detail-box">
                                <h3>Bill To</h3>
                                <p style="font-weight: 600; font-size: 18px; margin: 0;">${customerName}</p>
                            </div>
                            <div class="detail-box" style="text-align: right;">
                                <h3>Status</h3>
                                <div class="status-badge">${invoice.status || 'Paid'}</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 70%;">Description</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <p style="font-weight: 600; margin: 0;">${serviceName}</p>
                                        <p style="font-size: 13px; color: ${lightTextColor}; margin: 4px 0 0 0;">Job ID: ${jobId}</p>
                                    </td>
                                    <td style="text-align: right; font-weight: 600;">AU$${amount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="summary-section">
                            <div class="summary-table">
                                <div class="summary-row">
                                    <span style="color: ${lightTextColor}">Subtotal</span>
                                    <span>AU$${amount.toLocaleString()}</span>
                                </div>
                                <div class="summary-row">
                                    <span style="color: ${lightTextColor}">GST (10%)</span>
                                    <span>AU$${gst.toLocaleString()}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total Amount</span>
                                    <span style="color: ${primaryColor}">AU$${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Thank you for choosing AussieMate!</p>
                            <p>© ${new Date().getFullYear()} AussieMate. System Generated Invoice.</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-[#E5E7EB] flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white sticky top-0">
                    <h2 className="text-xl font-semibold text-primary">Invoice Details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Invoice Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-1">
                                Invoice #{invoice.jobId}
                            </h3>
                            <p className="text-sm text-primary-light">{invoice.service}</p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(invoice.status)}
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold text-primary-light mb-3">
                                Payment Information
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-primary-light">Date:</span>
                                    <span className="text-sm font-medium text-primary">
                                        {formatDate(invoice.date)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-primary-light">Payment Mode:</span>
                                    <span className="text-sm font-medium text-primary">
                                        {invoice.paymentMode}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-primary-light">Payment Method:</span>
                                    <span className="text-sm font-medium text-primary">
                                        {invoice.paymentMethod}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-primary-light mb-3">
                                Amount Details
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-primary-light">Subtotal:</span>
                                    <span className="text-sm font-medium text-primary">
                                        {formatCurrency(invoice.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-primary-light">Tax (GST):</span>
                                    <span className="text-sm font-medium text-primary">
                                        {formatCurrency((invoice.amount * 0.1).toFixed(2))}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                                    <span className="text-base font-semibold text-primary">Total:</span>
                                    <span className="text-base font-semibold text-primary">
                                        {formatCurrency((invoice.amount * 1.1).toFixed(2))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary-light mb-3">
                            Service Details
                        </h4>
                        <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                            <p className="text-sm text-primary">{invoice.service}</p>
                            <p className="text-xs text-primary-light mt-2">
                                Job ID: {invoice.jobId}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg bg-[#1F6FEB] hover:bg-[#1B63D6] text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]/30"
                    >
                        Download Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}

