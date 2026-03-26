import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Eye, Upload } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import CustomSelect from "../common/CustomSelect";
import PaginationRanges from "../common/PaginationRanges";
import { fetchCustomerJobs } from "../../api/services/customersService";

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:");
};

const getInitials = (firstName, lastName, fullName) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1].charAt(0).toUpperCase()}`;
    }
    return parts[0].charAt(0).toUpperCase();
  }
  return "?";
};

const getAvatarColor = (name, id) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52BE80",
    "#EC7063",
    "#5DADE2",
    "#F1948A",
    "#82E0AA",
    "#F4D03F",
    "#A569BD",
  ];
  const str = name || id || "default";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const mapCustomerJobForUi = (job) => {
  const statusRaw = (job?.status || job?.jobStatus || "").toString().toLowerCase();
  const status =
    statusRaw === "completed" || statusRaw === "done"
      ? "Completed"
      : statusRaw === "cancelled" || statusRaw === "canceled" || statusRaw === "rejected"
        ? "Cancelled"
        : "In Progress";

  const amount =
    job?.acceptedQuoteId?.price ??
    job?.customerQuote?.price ??
    job?.amount ??
    job?.price ??
    0;

  const assignedCleaner = job?.assignedCleanerId || job?.acceptedQuoteId?.cleanerId || job?.cleanerId || job?.cleaner || null;
  const cleanerId = assignedCleaner?._id || assignedCleaner?.id || null;
  const cleanerFirstName = assignedCleaner?.firstName || "";
  const cleanerLastName = assignedCleaner?.lastName || "";
  const cleanerNameRaw = assignedCleaner?.name || `${cleanerFirstName} ${cleanerLastName}`.trim();
  const isUnassigned = !assignedCleaner || !cleanerId || !cleanerNameRaw;
  const cleanerName = isUnassigned ? "Unassigned" : cleanerNameRaw;

  return {
    ...job,
    id: job?._id || job?.id || job?.jobId,
    jobId: job?.jobId || job?._id || "N/A",
    jobType: job?.serviceTypeDisplay || job?.serviceType || job?.service || job?.jobType || "Service",
    cleaner: {
      ...(assignedCleaner || {}),
      _id: cleanerId,
      firstName: cleanerFirstName,
      lastName: cleanerLastName,
      name: cleanerName,
      avatar: assignedCleaner?.avatar || assignedCleaner?.profilePhoto?.url || assignedCleaner?.profilePhoto || "",
      isUnassigned,
    },
    amount: Number(amount || 0),
    status,
  };
};

export default function JobsHistoryTab({ customer, onViewJob }) {
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
  const [failedImages, setFailedImages] = useState(new Set());

  const statusOptions = ["In Progress", "Completed", "Cancelled"];

  const loadJobs = async () => {
    const customerId = customer?._id || customer?.id;
    if (!customerId) return;

    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortColumn,
        sortOrder: sortDirection,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter.toLowerCase();

      const resp = await fetchCustomerJobs(customerId, params);
      const data = resp?.data || resp;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
      const pagination = data?.pagination || resp?.pagination;

      setInternalJobs(list.map(mapCustomerJobForUi));
      setTotalItems(pagination?.total || list.length);
    } catch (e) {
      console.warn("Failed to load customer jobs", e);
      setInternalJobs([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [customer, currentPage, itemsPerPage, searchQuery, statusFilter, sortColumn, sortDirection]);

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

  const handleExportHistory = () => {
    if (!tableRef.current) return;
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 16px; color: #111827; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
        th { background: #f9fafb; font-weight: 600; }
        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-weight: 600; font-size: 12px; border: 1px solid #e5e7eb; }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      </style>
    `;

    const tableHtml = tableRef.current.innerHTML;
    printWindow.document.write(`<html><head><title>Job History</title>${styles}</head><body>${tableHtml}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      Completed: {
        bg: "bg-[#EAFFF1]",
        text: "text-[#17C653]",
        border: "border-[#17C65333]",
        dot: "bg-[#17C653]",
      },
      "In Progress": {
        bg: "bg-[#FFF8DD]",
        text: "text-[#F6B100]",
        border: "border-[#F6B10033]",
        dot: "bg-[#F6B100]",
      },
      Upcoming: {
        bg: "bg-[#EBF2FD]",
        text: "text-[#2563EB]",
        border: "border-[#2563EB33]",
        dot: "bg-[#2563EB]",
      },
      Cancelled: {
        bg: "bg-[#FEE2E2]",
        text: "text-[#EF4444]",
        border: "border-[#EF444433]",
        dot: "bg-[#EF4444]",
      },
    };

    const config = statusConfig[status] || statusConfig.Completed;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.text} border ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${config.dot}`} />
        {status}
      </span>
    );
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">

      {/* Filters Section */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-between">
          {/* Search */}
          <SearchInput
            placeholder="Search by Name, ABN, Email, Role"
            onChange={setSearchQuery}
            className="md:w-[300px]"
          />

          {/* Filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-center">
            <div className="w-full sm:w-40">
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
              <th className="min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                <span className="font-medium text-gray-700 text-xs md:text-sm">
                  Job ID
                </span>
              </th>
              <th className="min-w-[200px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                <span className="font-medium text-gray-700 text-xs md:text-sm">
                  Job Type
                </span>
              </th>
              <th className="min-w-[180px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                <span className="font-medium text-gray-700 text-xs md:text-sm">
                  Cleaner
                </span>
              </th>
           
              <th className="min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
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
              internalJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="w-12 md:w-16 px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.includes(job.id)}
                        onChange={(e) => handleSelectRow(job.id, e.target.checked)}
                      />
                    </div>
                  </td>
                  <td className="min-w-[120px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                    <p className="text-sm font-medium text-primary">{job.jobId}</p>
                  </td>
                  <td className="min-w-[200px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                    <p className="text-sm text-primary font-medium">{job.jobType}</p>
                  </td>
                  <td className="min-w-[180px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      {job.cleaner?.isUnassigned ? (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1E2A78]">
                          <span className="text-white text-xs font-semibold">UN</span>
                        </div>
                      ) : job.cleaner?.avatar && isValidImageUrl(job.cleaner.avatar) && !failedImages.has(job.id) ? (
                        <img
                          src={job.cleaner.avatar}
                          alt={job.cleaner?.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(job.id));
                          }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: getAvatarColor(job.cleaner?.name, job.cleaner?._id || job.id) }}
                        >
                          <span className="text-white text-xs font-semibold">
                            {getInitials(job.cleaner?.firstName, job.cleaner?.lastName, job.cleaner?.name)}
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-primary">
                        {job.cleaner?.name || "Unassigned"}
                      </p>
                    </div>
                  </td>
                 
                  <td className="min-w-[120px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                    {getStatusBadge(job.status)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <PaginationRanges
        currentPage={currentPage}
        rowsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}

