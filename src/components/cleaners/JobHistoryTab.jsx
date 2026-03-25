import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Upload, Eye } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import CustomSelect from "../common/CustomSelect";
import PaginationRanges from "../common/PaginationRanges";
import StatusBadge from "../common/StatusBadge";
import { fetchCleanerJobs } from "../../api/services/cleanersService";

const mapCleanerJobForUi = (job) => {
    const statusRaw = (job?.status || job?.jobStatus || "").toString().toLowerCase();

    // Determine Amount
    const amount = job?.acceptedQuoteId?.price ?? job?.price ?? job?.amount ?? 0;

    // Map Customer Info
    const customerObj = job?.customerId || job?.customer || {};
    const customerName = customerObj.name || `${customerObj.firstName || ""} ${customerObj.lastName || ""}`.trim() || "N/A";

    return {
        ...job,
        id: job?._id || job?.id,
        customer: {
            ...customerObj,
            name: customerName,
        },
        joined: job?.createdAt ? new Date(job.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }) : "N/A",
        amount: Number(amount),
        status: statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)
    };
};

export default function JobHistoryTab({ cleaner, onViewJob }) {
    const [internalJobs, setInternalJobs] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const tableRef = useRef(null);

    const statusOptions = ["Accepted", "In Progress", "Completed", "Rejected"];

    const loadJobs = async () => {
        const cleanerId = cleaner?._id || cleaner?.id;
        if (!cleanerId) return;

        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: sortColumn,
                sortOrder: sortDirection,
            };

            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const resp = await fetchCleanerJobs(cleanerId, params);
            const data = resp?.data || resp;
            const list = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
            const pagination = data?.pagination || resp?.pagination;

            setInternalJobs(list.map(mapCleanerJobForUi));
            setTotalItems(pagination?.total || list.length);
        } catch (e) {
            console.warn("Failed to load cleaner jobs", e);
            setInternalJobs([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [cleaner, currentPage, itemsPerPage, searchQuery, statusFilter, sortColumn, sortDirection]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            const pageIds = internalJobs.map((job) => job.id);
            setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
        } else {
            const pageIds = internalJobs.map((job) => job.id);
            setSelectedRows(selectedRows.filter((id) => !pageIds.includes(id)));
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedRows([...selectedRows, id]);
        } else {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        }
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return null;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} className="text-gray-400" />
        ) : (
            <ChevronDown size={14} className="text-gray-400" />
        );
    };




    const handleExportHistory = () => {
        if (!internalJobs.length) return;

        const printWindow = window.open("", "", "width=1200,height=800");
        if (!printWindow) return;

        const cleanerName = cleaner?.displayCleaner?.name || cleaner?.name || "Cleaner";
        const reportDate = new Date().toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const rows = internalJobs.map(job => `
            <tr>
                <td>${job.jobId}</td>
                <td>${job.customer?.name || "N/A"}</td>
                <td>${job.joined}</td>
                <td style="font-weight: 600;">AU$${job.amount.toLocaleString()}</td>
                <td>
                    <span class="status-badge status-${(job.status || "").toLowerCase().replace(/\s+/g, "-")}">
                        ${job.status}
                    </span>
                </td>
            </tr>
        `).join("");

        const styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1C1C1C;
                    line-height: 1.5;
                }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start;
                    margin-bottom: 40px;
                    border-bottom: 2px solid #F1F1F4;
                    padding-bottom: 20px;
                }
                .logo { font-size: 24px; font-weight: 700; color: #1F6FEB; }
                .report-info { text-align: right; }
                .report-title { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
                .details-section { margin-bottom: 30px; }
                .details-label { color: #78829D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .details-name { font-size: 18px; font-weight: 600; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { 
                    text-align: left; 
                    background: #F9FAFB; 
                    padding: 12px 16px; 
                    font-size: 12px; 
                    font-weight: 600; 
                    color: #78829D; 
                    text-transform: uppercase;
                    border-bottom: 1px solid #EEF0F5;
                }
                td { 
                    padding: 16px; 
                    border-bottom: 1px solid #EEF0F5; 
                    font-size: 14px;
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 99px;
                    font-size: 11px;
                    font-weight: 600;
                    display: inline-block;
                    text-transform: capitalize;
                }
                .status-completed { background: #EAFFF1; color: #17C653; }
                .status-ongoing, .status-in-progress { background: #FFF8DD; color: #F6B100; }
                .status-accepted { background: #EBF2FD; color: #2563EB; }
                .status-rejected, .status-cancelled { background: #FEE2E2; color: #EF4444; }
                .footer { margin-top: 50px; font-size: 12px; color: #9CA3AF; text-align: center; }
                @media print {
                    body { padding: 0; }
                }
            </style>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Job History Report - ${cleanerName}</title>
                    ${styles}
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="logo">AussieMate</div>
                            <div style="color: #78829D; font-size: 14px; margin-top: 4px;">Admin Portal</div>
                        </div>
                        <div class="report-info">
                            <div style="font-size: 12px; color: #78829D;">Generated on</div>
                            <div style="font-weight: 500;">${reportDate}</div>
                        </div>
                    </div>

                    <div class="details-section">
                        <div class="report-title">Job History Report</div>
                        <div class="details-label">Cleaner Details</div>
                        <div class="details-name">${cleanerName}</div>
                        <div style="color: #78829D; font-size: 14px;">Total Jobs: ${internalJobs.length}</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Customer</th>
                                <th>Joined</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <div class="footer">
                        © ${new Date().getFullYear()} AussieMate. This is a system-generated report.
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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <h2 className="text-lg md:text-xl font-semibold text-primary mb-4">
                Job History
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                {/* Filters Section */}
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 md:max-w-[300px]">
                            <SearchInput
                                placeholder="Search by Name, ABN, Email, Role"
                                onChange={setSearchQuery}
                                className="w-full"
                            />
                        </div>

                        {/* Filters + Export */}
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-center">
                            <div className="w-full sm:w-auto sm:w-32">
                                <CustomSelect
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    placeholder="Status"
                                    options={statusOptions}
                                    className="w-full"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleExportHistory}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                                <Upload size={16} className="text-gray-600" />
                                Export history
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto" ref={tableRef}>
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-12 md:w-16 px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={selectAll}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </div>
                                </th>

                                {/* Job ID */}
                                <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("jobId")}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-xs md:text-sm">Job ID</span>
                                        {getSortIcon("jobId")}
                                    </div>
                                </th>

                                {/* Customer */}
                                <th className="min-w-[180px] md:min-w-[220px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("customer")}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-xs md:text-sm">Customer</span>
                                        {getSortIcon("customer")}
                                    </div>
                                </th>

                                {/* Joined */}
                                <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("joined")}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-xs md:text-sm">Joined</span>
                                        {getSortIcon("joined")}
                                    </div>
                                </th>

                                <th className="min-w-[120px] md:min-w-[140px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Status
                                    </span>
                                </th>
                                <th className="w-14 md:w-16 px-2 md:px-4 py-2 md:py-3 text-center"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-[#1F6FEB] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm text-primary-light">Loading job history...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : internalJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-primary-light text-sm">
                                        No job history found
                                    </td>
                                </tr>
                            ) : (
                                internalJobs.map((job) => {
                                    return (
                                        <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">

                                            <td className="w-12 md:w-16 px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={selectedRows.includes(job.id)}
                                                        onChange={(e) =>
                                                            handleSelectRow(job.id, e.target.checked)
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-2 md:px-4 py-2 md:py-4 border-r border-gray-200 font-medium text-primary text-xs md:text-sm">
                                                {job.jobId}
                                            </td>

                                            <td className="px-2 md:px-4 py-2 md:py-4 border-r border-gray-200 font-medium text-primary text-xs md:text-sm">
                                                {job.customer?.name || "N/A"}
                                            </td>

                                            <td className="px-2 md:px-4 py-2 md:py-4 border-r border-gray-200 font-medium text-primary text-xs md:text-sm">
                                                {job.joined}
                                            </td>

                                            
                                            <td className="min-w-[120px] md:min-w-[140px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                                <StatusBadge
                                                    status={job.status}
                                                    statusType="jobStatus"
                                                    size="sm"
                                                />
                                            </td>
                                            <td className="w-14 md:w-16 px-2 md:px-4 py-2 md:py-4 text-center">
                                                <button
                                                    type="button"
                                                    className="p-2 inline-flex items-center justify-center cursor-pointer"
                                                    onClick={() => onViewJob && onViewJob(job)}
                                                >
                                                    <Eye size={18} className="text-[#78829D]" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                {totalItems > 0 && (
                    <div className="border-t border-gray-200">
                        <PaginationRanges
                            currentPage={currentPage}
                            rowsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onPageChange={setCurrentPage}
                            onRowsPerPageChange={setItemsPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
