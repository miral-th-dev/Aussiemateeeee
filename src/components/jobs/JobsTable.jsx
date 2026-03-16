import { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { Eye, User2 } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import CustomSelect from "../common/CustomSelect";
import DatePicker from "../common/DatePicker";
import PaginationRanges from "../common/PaginationRanges";
import PageHeader from "../../layout/PageHeader";
import { fetchJobs } from "../../api/services/jobService";
import Loader from "../common/Loader";
import StatusBadge from "../common/StatusBadge";
import Avatar from "../common/Avatar";

const JobsTable = forwardRef(({ onViewJob }, ref) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInputValue, setSearchInputValue] = useState(""); // Local state for search input
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [jobStatusFilter, setJobStatusFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchInputValue.trim());
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchInputValue]);
    // Pagination info from API
    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    const jobTypeOptions = [
        "Cleaning",
        "Handyman",
        "Support Service Provider",
        "Commercial Cleaning",
        "Housekeeping",
        "pet sitting",
    ];

    const jobStatusOptions = ["Completed", "Ongoing", "Upcoming", "Cancelled"];
    const paymentStatusOptions = ["Released", "Held", "Cancelled"];

    // Get job type variations for filtering
    // Returns an array of job type values that should match the selected filter
    const getJobTypeVariations = (selectedJobType) => {
        if (!selectedJobType) return [];

        // When "Support Service Provider" is selected, also match "Support Services" and "NDIS"
        if (selectedJobType === "Support Service Provider") {
            return ["Support Service Provider", "Support Services", "NDIS", "ndis"];
        }

        // For other job types, return the exact match
        return [selectedJobType];
    };

    // Map UI job status to API status
    // Maps frontend display statuses to backend API statuses
    const mapJobStatusToAPI = (uiStatus) => {
        if (!uiStatus) return '';
        // Map UI labels to backend jobStatus values
        const statusMap = {
            Completed: 'completed',
            Ongoing: 'in_progress', // Primary backend status for ongoing
            Upcoming: 'posted', // Primary backend status for upcoming
            Cancelled: 'cancelled',
        };
        return statusMap[uiStatus] || '';
    };

    // Helper function to parse date string (DD-MM-YYYY) to Date object
    const parseDateString = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-");
        return new Date(year, month - 1, day);
    };

    // Helper function to format date to DD-MM-YYYY
    const formatDate = (date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Helper function to format date from API (ISO string or timestamp) to DD-MM-YYYY
    const formatDateFromAPI = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "N/A";
            return formatDate(date);
        } catch {
            return "N/A";
        }
    };

    // Derive payment status from job status
    // Payment status is dependent on job status:
    // - Upcoming → Held
    // - Completed → Released
    // - Cancelled → Cancelled
    // - Ongoing → Held (default for ongoing jobs)
    const derivePaymentStatus = (jobStatus) => {
        if (!jobStatus) return "Held";

        const status = jobStatus.trim();

        if (status === "Upcoming") {
            return "Held";
        } else if (status === "Completed") {
            return "Released";
        } else if (status === "Cancelled") {
            return "Cancelled";
        } else if (status === "Ongoing") {
            return "Held";
        }

        // Default to Held for any other status
        return "Held";
    };

    // Normalize job status to match expected format
    // Maps backend statuses to frontend display statuses
    const normalizeJobStatus = (status) => {
        if (!status) return "Upcoming";
        const statusLower = status.toLowerCase().trim();

        // Backend: posted, quoted, accepted → Frontend: Upcoming
        if (statusLower === "posted" || statusLower === "quoted" || statusLower === "accepted" || statusLower === "accept") {
            return "Upcoming";
        }

        // Backend: in_progress, started, pending_customer_confirmation → Frontend: Ongoing
        if (statusLower === "in_progress" || statusLower === "in-progress" ||
            statusLower === "started" ||
            statusLower === "pending_customer_confirmation" || statusLower === "pending-customer-confirmation") {
            return "Ongoing";
        }

        // Backend: completed → Frontend: Completed
        if (statusLower === "completed" || statusLower === "complete" || statusLower === "done" || statusLower === "finished") {
            return "Completed";
        }

        // Backend: cancelled → Frontend: Cancelled
        if (statusLower === "cancelled" || statusLower === "canceled" || statusLower === "cancel") {
            return "Cancelled";
        }

        // Legacy/alternative mappings
        if (statusLower === "ongoing" || statusLower === "active" || statusLower === "progress") {
            return "Ongoing";
        }
        if (statusLower === "upcoming" || statusLower === "scheduled" || statusLower === "pending" || statusLower === "booked") {
            return "Upcoming";
        }

        // Return capitalized version if it matches one of our statuses
        const capitalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        if (["Completed", "Ongoing", "Upcoming", "Cancelled"].includes(capitalized)) {
            return capitalized;
        }

        return "Upcoming"; // Default
    };

    // Map API response to UI structure
    const mapJobFromAPI = (job) => {
        // Extract customer data from customerId object
        const customerId = job.customerId || job.customer || {};
        const customerFirstName = customerId.firstName || "";
        const customerLastName = customerId.lastName || "";
        const customerName = `${customerFirstName} ${customerLastName}`.trim() ||
            customerId.name ||
            job.customerName ||
            "Unknown Customer";
        const customerEmail = customerId.email || job.customerEmail || "";
        const customerAvatar = customerId.profilePhoto?.url ||
            customerId.avatar ||
            job.customer?.profilePhoto?.url ||
            job.customer?.avatar;

        // Extract cleaner data from acceptedQuoteId.cleanerId object
        const cleanerId = job.acceptedQuoteId?.cleanerId ||
            job.cleanerId ||
            job.cleaner || {};
        const cleanerFirstName = cleanerId.firstName || "";
        const cleanerLastName = cleanerId.lastName || "";
        const cleanerName = `${cleanerFirstName} ${cleanerLastName}`.trim() ||
            cleanerId.name ||
            job.cleanerName ||
            "Unassigned";
        const cleanerAvatar = cleanerId.profilePhoto?.url ||
            cleanerId.avatar ||
            job.cleaner?.profilePhoto?.url ||
            job.cleaner?.avatar;

        // Extract job type from serviceTypeDisplay or other fields
        const jobType = job.serviceTypeDisplay ||
            job.jobType ||
            job.serviceType ||
            "Cleaning";

        // Extract amount from acceptedQuoteId.price
        const amountPaid = job.amountPaid ||
            job.acceptedQuoteId?.price ||
            job.payment?.amount ||
            job.totalAmount ||
            null;

        return {
            id: job._id || job.id,
            jobId: job.jobId || job.jobNumber || `AM${job._id?.slice(-6) || job.id}`,
            jobType: jobType,
            customer: {
                name: customerName,
                firstName: customerFirstName,
                lastName: customerLastName,
                email: customerEmail,
                avatar: customerAvatar,
                id: customerId._id || customerId.id || customerId,
            },
            cleaner: {
                name: cleanerName,
                firstName: cleanerFirstName,
                lastName: cleanerLastName,
                avatar: cleanerAvatar,
                id: cleanerId._id || cleanerId.id,
            },
            jobStatus: normalizeJobStatus(job.jobStatus || job.status || "Upcoming"),
            paymentStatus: job.paymentStatus ||
                job.payment?.escrowStatus ||
                job.payment?.paymentStatus ||
                derivePaymentStatus(normalizeJobStatus(job.jobStatus || job.status || "Upcoming")),
            date: formatDateFromAPI(job.date || job.createdAt || job.scheduledDate),
            amountPaid: amountPaid,
            // Keep original data for details view
            originalData: job,
        };
    };

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
        updateJobPaymentStatus: (jobId, paymentStatus) => {
            setJobs(prevJobs =>
                prevJobs.map(job => {
                    const jobIdMatch = job.jobId === jobId || job._id === jobId || job.id === jobId;
                    if (jobIdMatch) {
                        return {
                            ...job,
                            paymentStatus: paymentStatus,
                            originalData: {
                                ...job.originalData,
                                paymentStatus: paymentStatus,
                                payment: {
                                    ...job.originalData?.payment,
                                    escrowStatus: paymentStatus
                                }
                            }
                        };
                    }
                    return job;
                })
            );
        },
        refreshJobs: () => {
            // Trigger a re-fetch by updating a dependency
            setCurrentPage(prev => prev);
        }
    }));

    // Fetch jobs data from API
    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const isDateFilterActive = !!(dateFilter?.start && dateFilter?.end);

                // Map frontend job status to API status
                const apiJobStatus = mapJobStatusToAPI(jobStatusFilter);

                // For statuses that map to multiple backend values (Ongoing, Upcoming), 
                // we need client-side filtering to catch all matching records
                // For all status filters, we'll do client-side filtering to ensure accuracy
                // Don't send status filter to API - fetch all and filter client-side
                const needsClientSideStatusFilter = !!jobStatusFilter; // Always filter client-side when status is selected

                // For job type, we'll also do client-side filtering to ensure accuracy
                const needsClientSideJobTypeFilter = !!jobTypeFilter; // Always filter client-side when job type is selected

                // For payment status, we need client-side filtering since it's derived from job status
                const needsClientSidePaymentStatusFilter = !!paymentStatusFilter; // Always filter client-side when payment status is selected

                // For date filtering, client-side status filtering, job type filtering, or payment status filtering, we need to fetch all and filter client-side
                const needsClientSideFilter = isDateFilterActive || needsClientSideStatusFilter || needsClientSideJobTypeFilter || needsClientSidePaymentStatusFilter;

                // Use empty string for status when doing client-side status filtering
                const statusForAPI = needsClientSideStatusFilter ? '' : apiJobStatus;

                // Use empty string for job type when doing client-side job type filtering
                const jobTypeForAPI = needsClientSideJobTypeFilter ? '' : jobTypeFilter;

                // Use empty string for payment status when doing client-side payment status filtering
                const paymentStatusForAPI = needsClientSidePaymentStatusFilter ? '' : paymentStatusFilter;

                let response;
                if (needsClientSideFilter) {
                    // Fetch all pages when doing client-side filtering
                    let allData = [];
                    let currentPageNum = 1;
                    let hasMore = true;
                    const pageLimit = 100;

                    while (hasMore) {
                        const pageResponse = await fetchJobs({
                            page: currentPageNum,
                            limit: pageLimit,
                            search: searchQuery,
                            jobType: jobTypeForAPI,
                            jobStatus: statusForAPI,
                            paymentStatus: paymentStatusForAPI,
                        });

                        let pageData = [];
                        if (pageResponse?.data?.jobs && Array.isArray(pageResponse.data.jobs)) {
                            pageData = pageResponse.data.jobs;
                        } else if (Array.isArray(pageResponse)) {
                            pageData = pageResponse;
                        } else if (Array.isArray(pageResponse.data)) {
                            pageData = pageResponse.data;
                        } else if (Array.isArray(pageResponse.jobs)) {
                            pageData = pageResponse.jobs;
                        }

                        allData = [...allData, ...pageData];

                        if (pageResponse?.data?.pagination) {
                            hasMore = pageResponse.data.pagination.hasNextPage === true;
                            currentPageNum++;
                        } else {
                            hasMore = pageData.length === pageLimit && pageData.length > 0;
                            currentPageNum++;
                        }

                        if (pageData.length === 0 || currentPageNum > 100) {
                            hasMore = false;
                        }
                    }

                    response = {
                        data: {
                            jobs: allData,
                            pagination: {
                                currentPage: 1,
                                totalPages: 1,
                                totalJobs: allData.length,
                                limit: pageLimit,
                                hasNextPage: false,
                                hasPrevPage: false
                            }
                        }
                    };
                } else {
                    // Normal paginated fetch
                    response = await fetchJobs({
                        page: currentPage,
                        limit: itemsPerPage,
                        search: searchQuery,
                        jobType: jobTypeForAPI,
                        jobStatus: statusForAPI,
                        paymentStatus: paymentStatusForAPI,
                    });
                }

                // Extract jobs array
                let data = [];
                if (response?.data?.jobs && Array.isArray(response.data.jobs)) {
                    data = response.data.jobs;
                    if (response.data.pagination) {
                        setPaginationInfo(response.data.pagination);
                    }
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (Array.isArray(response.jobs)) {
                    data = response.jobs;
                }

                if (!Array.isArray(data)) {
                    console.error('API response is not an array. Response:', response);
                    setError('Invalid data format received from server. Expected array of jobs.');
                    setJobs([]);
                    return;
                }

                // Map API response to UI structure
                let mappedJobs = data.map(mapJobFromAPI);

                // Apply client-side status filtering for all status filters to ensure accuracy
                if (jobStatusFilter) {
                    mappedJobs = mappedJobs.filter((job) => {
                        // Filter by the normalized frontend status
                        return job.jobStatus === jobStatusFilter;
                    });
                }

                // Apply client-side job type filtering to ensure accuracy
                if (jobTypeFilter) {
                    const jobTypeVariations = getJobTypeVariations(jobTypeFilter);
                    mappedJobs = mappedJobs.filter((job) => {
                        // Filter by job type - check if it matches any of the variations (case-insensitive)
                        const jobTypeLower = job.jobType?.toLowerCase();
                        return jobTypeVariations.some(variation =>
                            variation.toLowerCase() === jobTypeLower
                        );
                    });
                }

                // Apply client-side search filtering if searchQuery is present
                // This acts as an extra layer of accuracy if the API search is not exhaustive
                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    mappedJobs = mappedJobs.filter((job) => {
                        return (
                            job.jobId?.toLowerCase().includes(lowerQuery) ||
                            job.customer?.name?.toLowerCase().includes(lowerQuery) ||
                            job.cleaner?.name?.toLowerCase().includes(lowerQuery) ||
                            job.jobType?.toLowerCase().includes(lowerQuery)
                        );
                    });
                }

                // Apply client-side payment status filtering to ensure accuracy
                // Since payment status is derived from job status, we must filter client-side
                if (paymentStatusFilter) {
                    mappedJobs = mappedJobs.filter((job) => {
                        // Filter by the derived payment status
                        return job.paymentStatus === paymentStatusFilter;
                    });
                }

                // Check if API returned more jobs than the limit (indicating API didn't paginate correctly)
                // If API returns all jobs on every page, we need to paginate client-side
                const apiReturnedMoreThanLimit = mappedJobs.length > itemsPerPage;
                const needsClientSidePagination = needsClientSideFilter || apiReturnedMoreThanLimit;

                // Apply client-side date filtering if needed
                if (isDateFilterActive) {
                    const startTime = new Date(dateFilter.start).setHours(0, 0, 0, 0);
                    const endTime = new Date(dateFilter.end).setHours(23, 59, 59, 999);
                    mappedJobs = mappedJobs.filter((job) => {
                        const jobDate = parseDateString(job.date);
                        if (!jobDate) return false;
                        const time = jobDate.setHours(0, 0, 0, 0);
                        return time >= startTime && time <= endTime;
                    });
                }

                // If API returned all jobs instead of paginated results, store all and paginate client-side
                if (apiReturnedMoreThanLimit && !needsClientSideFilter) {
                    // Store all jobs - we'll paginate client-side
                    setJobs(mappedJobs);

                    // Calculate pagination from total jobs
                    const total = mappedJobs.length;
                    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                    const validCurrentPage = Math.min(currentPage, totalPages);

                    setPaginationInfo({
                        currentPage: validCurrentPage,
                        totalPages,
                        totalJobs: total,
                        limit: itemsPerPage,
                        hasNextPage: validCurrentPage < totalPages,
                        hasPrevPage: validCurrentPage > 1
                    });

                    if (currentPage > totalPages) {
                        setCurrentPage(1);
                    }
                } else if (needsClientSideFilter) {
                    // Client-side filtering (date or status)
                    const total = mappedJobs.length;
                    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                    const validCurrentPage = Math.min(currentPage, totalPages);

                    setPaginationInfo({
                        currentPage: validCurrentPage,
                        totalPages,
                        totalJobs: total,
                        limit: itemsPerPage,
                        hasNextPage: validCurrentPage < totalPages,
                        hasPrevPage: validCurrentPage > 1
                    });

                    if (currentPage > totalPages) {
                        setCurrentPage(1);
                    }

                    setJobs(mappedJobs);
                } else {
                    // API pagination is working correctly - use jobs as-is
                    setJobs(mappedJobs);

                    if (response?.data?.pagination) {
                        const apiPagination = response.data.pagination;
                        setPaginationInfo({
                            currentPage: apiPagination.currentPage || currentPage,
                            totalPages: apiPagination.totalPages || Math.max(1, Math.ceil(mappedJobs.length / itemsPerPage)),
                            totalJobs: apiPagination.totalJobs || apiPagination.total || mappedJobs.length,
                            limit: apiPagination.limit || itemsPerPage,
                            hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : currentPage < (apiPagination.totalPages || 1),
                            hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : currentPage > 1
                        });
                    } else {
                        // Fallback pagination - assume API returned only current page's data
                        const total = mappedJobs.length; // This might be wrong if API returns all
                        const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                        setPaginationInfo({
                            currentPage,
                            totalPages,
                            totalJobs: total,
                            limit: itemsPerPage,
                            hasNextPage: currentPage < totalPages,
                            hasPrevPage: currentPage > 1
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching jobs:', err);
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load jobs data';
                setError(errorMessage);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [currentPage, itemsPerPage, searchQuery, jobTypeFilter, jobStatusFilter, paymentStatusFilter, dateFilter]);

    // Determine if we need client-side pagination
    // This happens when:
    // 1. Date filter is active (client-side filtering)
    // 2. Status filter is active (client-side filtering for all statuses)
    // 3. Job type filter is active (client-side filtering)
    // 4. Payment status filter is active (client-side filtering - derived from job status)
    // 5. API returned more jobs than the limit (API didn't paginate correctly)
    const isDateFilterActive = !!(dateFilter?.start && dateFilter?.end);
    const needsClientSideStatusFilter = !!jobStatusFilter; // All status filters use client-side filtering
    const needsClientSideJobTypeFilter = !!jobTypeFilter; // All job type filters use client-side filtering
    const needsClientSidePaymentStatusFilter = !!paymentStatusFilter; // Payment status is derived, so always filter client-side
    const needsClientSidePagination = isDateFilterActive || needsClientSideStatusFilter || needsClientSideJobTypeFilter || needsClientSidePaymentStatusFilter || jobs.length > itemsPerPage;

    const paginatedJobs = useMemo(() => {
        if (needsClientSidePagination) {
            // Client-side pagination - slice the jobs array
            const startIndex = (currentPage - 1) * itemsPerPage;
            return jobs.slice(startIndex, startIndex + itemsPerPage);
        }
        // Server-side pagination - jobs are already paginated from API
        return jobs;
    }, [jobs, currentPage, itemsPerPage, needsClientSidePagination]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            const pageIds = paginatedJobs.map((job) => job.id);
            setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
        } else {
            const pageIds = paginatedJobs.map((job) => job.id);
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


    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        jobTypeFilter,
        jobStatusFilter,
        paymentStatusFilter,
        dateFilter,
        itemsPerPage,
    ]);

    // Calculate total items for pagination
    const totalItemsForPagination = useMemo(() => {
        // If doing client-side pagination (date filter, status filter, or API returned all jobs), use jobs.length
        if (needsClientSidePagination) {
            return jobs.length;
        }
        // For server-side pagination, use paginationInfo.totalJobs from API
        if (paginationInfo.totalJobs !== undefined && paginationInfo.totalJobs !== null) {
            return paginationInfo.totalJobs;
        }
        // Fallback to jobs.length
        return jobs.length;
    }, [jobs.length, paginationInfo.totalJobs, needsClientSidePagination]);

    if (loading) {
        return (
            <>
                <PageHeader
                    title="Jobs"
                    showBackArrow={false}
                />
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
                    <Loader />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <PageHeader
                    title="Jobs"
                    showBackArrow={false}
                />
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                    <div className="text-center text-red-600">
                        <p className="font-medium">Error loading data</p>
                        <p className="text-sm mt-2">{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>

            <PageHeader
                title="Jobs"
                showBackArrow={false}
            />
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">

                {/* Filters Section */}
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-stretch xl:items-center justify-between">
                        {/* Search */}
                        <SearchInput
                            placeholder="Search by Job ID, Customer Name, Cleaner Name"
                            value={searchInputValue}
                            onChange={setSearchInputValue}
                            className="w-full xl:max-w-[300px]"
                        />

                        {/* Filters */}
                        <div className="w-full xl:w-auto flex flex-col sm:flex-row xl:flex-row xl:flex-nowrap gap-2 md:gap-3">
                            <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-36">
                                <CustomSelect
                                    value={jobStatusFilter}
                                    onChange={setJobStatusFilter}
                                    placeholder="Job Status"
                                    options={jobStatusOptions}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-40">
                                <CustomSelect
                                    value={jobTypeFilter}
                                    onChange={setJobTypeFilter}
                                    placeholder="Job Type"
                                    options={jobTypeOptions}
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-40">
                                <CustomSelect
                                    value={paymentStatusFilter}
                                    onChange={setPaymentStatusFilter}
                                    placeholder="Payment Status"
                                    options={paymentStatusOptions}
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-40">
                                <DatePicker
                                    label="Date Range"
                                    value={dateFilter}
                                    onChange={setDateFilter}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1200px]">
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
                                <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Job ID
                                    </span>
                                </th>
                                <th className="min-w-[120px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Job Type
                                    </span>
                                </th>
                                <th className="min-w-[180px] md:min-w-[220px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Customer
                                    </span>
                                </th>
                                <th className="min-w-[150px] md:min-w-[180px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Cleaner
                                    </span>
                                </th>
                                <th className="min-w-[120px] md:min-w-[140px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Job Status
                                    </span>
                                </th>
                                {/* <th className="min-w-[130px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Payment Status
                                    </span>
                                </th> */}
                                <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Date
                                    </span>
                                </th>
                                {/* <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                    <span className="font-medium text-gray-700 text-xs md:text-sm">
                                        Amount Paid
                                    </span>
                                </th> */}
                                <th className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-3 text-center">
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedJobs.map((job) => {
                                return (
                                    <tr
                                        key={job.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
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
                                        <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <span className="font-medium text-primary text-xs md:text-sm">
                                                {job.jobId}
                                            </span>
                                        </td>
                                        <td className="min-w-[120px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <span className="text-primary font-medium text-xs md:text-sm">
                                                {job.jobType}
                                            </span>
                                        </td>
                                        <td className="min-w-[180px] md:min-w-[220px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Avatar
                                                    src={job.customer.avatar}
                                                    firstName={job.customer.firstName}
                                                    lastName={job.customer.lastName}
                                                    fullName={job.customer.name}
                                                    id={job.customer.id}
                                                    className="w-8 h-8 md:w-10 md:h-10"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-primary text-xs md:text-sm truncate">
                                                        {job.customer.name}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-primary-light truncate">
                                                        {job.customer.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="min-w-[150px] md:min-w-[180px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Avatar
                                                    src={job.cleaner.avatar}
                                                    firstName={job.cleaner.firstName}
                                                    lastName={job.cleaner.lastName}
                                                    fullName={job.cleaner.name}
                                                    id={job.cleaner.id}
                                                    className="w-8 h-8 md:w-10 md:h-10"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-primary text-xs md:text-sm truncate">
                                                        {job.cleaner.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="min-w-[120px] md:min-w-[140px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <StatusBadge
                                                status={job.jobStatus}
                                                statusType="jobStatus"
                                                size="sm"
                                            />
                                        </td>
                                        {/* <td className="min-w-[130px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <StatusBadge
                                                status={job.paymentStatus}
                                                statusType="paymentStatus"
                                                size="sm"
                                            />
                                        </td> */}
                                        <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-primary font-medium border-r border-gray-200 text-xs md:text-sm">
                                            {job.date}
                                        </td>
                                        {/* <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-primary font-medium border-r border-gray-200 text-xs md:text-sm">
                                            {job.amountPaid !== null ? (
                                                <span>AU${job.amountPaid.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td> */}
                                        <td className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onViewJob && onViewJob(job)}
                                                className="rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                                            >
                                                <Eye
                                                    size={20}
                                                    className="text-[#78829D] cursor-pointer"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                <PaginationRanges
                    currentPage={currentPage}
                    rowsPerPage={itemsPerPage}
                    totalItems={totalItemsForPagination}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setItemsPerPage}
                />
            </div>
        </>
    );
});

JobsTable.displayName = 'JobsTable';

export default JobsTable;

