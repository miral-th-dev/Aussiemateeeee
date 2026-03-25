import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import CustomSelect from "../common/CustomSelect";
import DatePicker from "../common/DatePicker";
import PaginationRanges from "../common/PaginationRanges";
import { fetchCleanersKYC } from "../../api/services/cleanersService";
import { getCategories } from "../../api/services/categoryService";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";

export default function ApprovalsTable({ onViewCleaner }) {
    const [cleaners, setCleaners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInputValue, setSearchInputValue] = useState(""); // Local state for search input
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateJoined, setDateJoined] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Debounce search input into searchQuery
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInputValue.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInputValue]);
    // Track if we've loaded all data (when no pagination info available)
    const [hasAllDataLoaded, setHasAllDataLoaded] = useState(false);
    // Pagination info from API
    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCleaners: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    const [roleOptions, setRoleOptions] = useState([]);

    // Fetch categories dynamically for Role filter
    useEffect(() => {
        getCategories()
            .then((res) => {
                const names = (res?.data || [])
                    .filter((cat) => cat.isActive)
                    .map((cat) => cat.name);
                setRoleOptions(names);
            })
            .catch(() => setRoleOptions([]));
    }, []);

    // Status filter options (for dropdown)
    // Note: current data only uses "Pending" and "Verified".
    // "Approved", "Rejected", and "Expired" are included for future use.
    const statusOptions = ["Pending", "Rejected", "Verified"];

    const getUiStatus = (row) => {
        // backend fields observed: approvalStatus, verificationStatus
        const approval = row?.approvalStatus;
        const verification = row?.verificationStatus;
        if (verification === "verified") return "Verified";
        if (approval === "approved") return "Approved";
        if (approval === "rejected") return "Rejected";
        if (approval === "expired") return "Expired";
        return "Pending";
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "Verified":
                return {
                    pill: "bg-[#EAFFF1] border-[#17C65333] text-[#17C653]",
                    dot: "bg-[#17C653]",
                };
            case "Approved":
                return {
                    pill: "bg-[#EAFFF1] border-[#17C65333] text-[#17C653]",
                    dot: "bg-[#17C653]",
                };
            case "Rejected":
                return {
                    pill: "bg-[#FFE5E9] border-[#F1416C33] text-[#F1416C]",
                    dot: "bg-[#F1416C]",
                };
            case "Expired":
                return {
                    pill: "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]",
                    dot: "bg-[#6B7280]",
                };
            default:
                return {
                    pill: "bg-[#FFF8DD] border-[#F6B10033] text-[#F6B100]",
                    dot: "bg-[#F6B100]",
                };
        }
    };

    // Map UI status to API status
    const mapStatusToAPI = (uiStatus) => {
        if (!uiStatus) return '';
        // Map UI labels to backend approvalStatus values
        // Backend uses "no_documents" for pending states (partial also exists but we'll filter client-side)
        const statusMap = {
            Pending: 'pending',
            Verified: 'verified',
            Approved: 'verified',
            Rejected: 'rejected',
        };
        return statusMap[uiStatus] || '';
    };

    // Parse date string in dd/mm/yyyy format
    const parseDateString = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map(Number);
        const parsed = new Date(year, month - 1, day);
        return isNaN(parsed) ? null : parsed;
    };

    const isDateFilterActive = !!(dateJoined?.start && dateJoined?.end);

    // Fetch cleaners data from API with pagination and filters
    useEffect(() => {
        const loadCleaners = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiStatus = mapStatusToAPI(statusFilter);

                // For client-side filtering (any status filter or date), fetch all records
                // This ensures pagination is consistent (page 1 fills first, then page 2, etc.)
                const needsClientSideFilter = isDateFilterActive || !!statusFilter;

                let response;
                if (needsClientSideFilter) {
                    // Fetch all pages when doing client-side filtering
                    let allData = [];
                    let currentPageNum = 1;
                    let hasMore = true;
                    const pageLimit = 1000; // Fetch 1000 per page

                    while (hasMore) {
                        const pageResponse = await fetchCleanersKYC({
                            page: currentPageNum,
                            limit: pageLimit,
                            search: searchQuery,
                            role: roleFilter,
                            status: apiStatus
                        });

                        // Extract cleaners from response
                        let pageData = [];
                        if (pageResponse?.data?.cleaners && Array.isArray(pageResponse.data.cleaners)) {
                            pageData = pageResponse.data.cleaners;
                        } else if (Array.isArray(pageResponse)) {
                            pageData = pageResponse;
                        } else if (Array.isArray(pageResponse.data)) {
                            pageData = pageResponse.data;
                        } else if (Array.isArray(pageResponse.cleaners)) {
                            pageData = pageResponse.cleaners;
                        }

                        allData = [...allData, ...pageData];

                        // Check if there are more pages
                        if (pageResponse?.data?.pagination) {
                            hasMore = pageResponse.data.pagination.hasNextPage === true;
                            currentPageNum++;
                        } else {
                            // If no pagination info, check if we got less than the limit (last page)
                            // If we got fewer records than requested, we're on the last page
                            hasMore = pageData.length === pageLimit && pageData.length > 0;
                            currentPageNum++;
                        }

                        // Stop if we got no data (empty page)
                        if (pageData.length === 0) {
                            hasMore = false;
                        }

                        // Safety limit to prevent infinite loops
                        if (currentPageNum > 100) {
                            hasMore = false;
                            break;
                        }
                    }

                    // Create a mock response structure with all data
                    response = {
                        data: {
                            cleaners: allData,
                            pagination: {
                                currentPage: 1,
                                totalPages: 1,
                                totalCleaners: allData.length,
                                limit: pageLimit,
                                hasNextPage: false,
                                hasPrevPage: false
                            }
                        }
                    };
                } else {
                    // Normal paginated fetch
                    // If we already have all data loaded and no filters/search changed, skip fetching
                    // Data is already in cleaners state, pagination will be handled client-side
                    if (hasAllDataLoaded && !searchQuery && !roleFilter && !apiStatus) {
                        // Skip API call, but we still need to process existing data for pagination
                        // The data is already in cleaners, so we'll just update pagination info
                        const total = cleaners.length;
                        const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                        const validCurrentPage = Math.min(currentPage, totalPages);

                        setPaginationInfo({
                            currentPage: validCurrentPage,
                            totalPages,
                            totalCleaners: total,
                            limit: itemsPerPage,
                            hasNextPage: validCurrentPage < totalPages,
                            hasPrevPage: validCurrentPage > 1
                        });

                        if (currentPage > totalPages) {
                            setCurrentPage(1);
                        }

                        setLoading(false);
                        return; // Exit early, data is already processed
                    }

                    // First, try to get pagination info by fetching page 1
                    const firstPageResponse = await fetchCleanersKYC({
                        page: 1,
                        limit: itemsPerPage,
                        search: searchQuery,
                        role: roleFilter,
                        status: apiStatus
                    });

                    // Check if response has pagination info
                    let hasPaginationInfo = false;
                    if (firstPageResponse?.data?.pagination || firstPageResponse?.pagination) {
                        hasPaginationInfo = true;
                    }

                    // If no pagination info and no filters, fetch all pages to get complete dataset
                    // Then we'll paginate client-side
                    if (!hasPaginationInfo && !searchQuery && !roleFilter && !apiStatus) {
                        setHasAllDataLoaded(true); // Mark that we're loading all data
                        // Fetch all pages similar to client-side filtering
                        let allData = [];
                        let currentPageNum = 1;
                        let hasMore = true;
                        const pageLimit = 100; // Fetch 100 per page

                        while (hasMore) {
                            const pageResponse = await fetchCleanersKYC({
                                page: currentPageNum,
                                limit: pageLimit,
                                search: searchQuery,
                                role: roleFilter,
                                status: apiStatus
                            });

                            // Extract cleaners from response
                            let pageData = [];
                            if (pageResponse?.data?.cleaners && Array.isArray(pageResponse.data.cleaners)) {
                                pageData = pageResponse.data.cleaners;
                            } else if (Array.isArray(pageResponse)) {
                                pageData = pageResponse;
                            } else if (Array.isArray(pageResponse.data)) {
                                pageData = pageResponse.data;
                            } else if (Array.isArray(pageResponse.cleaners)) {
                                pageData = pageResponse.cleaners;
                            }

                            allData = [...allData, ...pageData];

                            // Check if there are more pages
                            if (pageResponse?.data?.pagination) {
                                hasMore = pageResponse.data.pagination.hasNextPage === true;
                                currentPageNum++;
                            } else if (pageResponse?.pagination) {
                                hasMore = pageResponse.pagination.hasNextPage === true;
                                currentPageNum++;
                            } else {
                                // If we got fewer records than requested, we're on the last page
                                hasMore = pageData.length === pageLimit && pageData.length > 0;
                                currentPageNum++;
                            }

                            // Stop if we got no data (empty page)
                            if (pageData.length === 0) {
                                hasMore = false;
                            }

                            // Safety limit to prevent infinite loops
                            if (currentPageNum > 100) {
                                hasMore = false;
                                break;
                            }
                        }

                        // Create response structure with all data
                        // Mark this as needing client-side pagination
                        response = {
                            data: {
                                cleaners: allData,
                                pagination: {
                                    currentPage: currentPage,
                                    totalPages: Math.max(1, Math.ceil(allData.length / itemsPerPage)),
                                    totalCleaners: allData.length,
                                    limit: itemsPerPage,
                                    hasNextPage: currentPage < Math.ceil(allData.length / itemsPerPage),
                                    hasPrevPage: currentPage > 1
                                }
                            },
                            _needsClientSidePagination: true // Flag to indicate client-side pagination needed
                        };
                    } else {
                        setHasAllDataLoaded(false); // Reset flag when using server-side pagination
                        // Use the fetched response for current page
                        if (currentPage === 1) {
                            response = firstPageResponse;
                        } else {
                            response = await fetchCleanersKYC({
                                page: currentPage,
                                limit: itemsPerPage,
                                search: searchQuery,
                                role: roleFilter,
                                status: apiStatus
                            });
                        }
                    }
                }

                // Handle API response structure
                // API can return: array directly, {success: true, data: [...], pagination: {...}}, or {data: {cleaners: [...], pagination: {...}}}
                let data = [];
                let paginationFromAPI = null;

                if (!response) {
                    console.warn('API returned null or undefined');
                    setCleaners([]);
                    return;
                }

                // Extract cleaners array and pagination info
                if (response.data && response.data.cleaners && Array.isArray(response.data.cleaners)) {
                    // Structure: {data: {cleaners: [...], pagination: {...}}}
                    data = response.data.cleaners;
                    paginationFromAPI = response.data.pagination;
                } else if (response.data && Array.isArray(response.data) && response.pagination) {
                    // Structure: {data: [...], pagination: {...}}
                    data = response.data;
                    paginationFromAPI = response.pagination;
                } else if (Array.isArray(response)) {
                    // Structure: array directly [...]
                    data = response;
                } else if (Array.isArray(response.data)) {
                    // Structure: {data: [...]}
                    data = response.data;
                    paginationFromAPI = response.pagination;
                } else if (Array.isArray(response.cleaners)) {
                    // Structure: {cleaners: [...], pagination: {...}}
                    data = response.cleaners;
                    paginationFromAPI = response.pagination;
                }

                // Ensure data is an array before mapping
                if (!Array.isArray(data)) {
                    console.error('API response is not an array. Response:', response);
                    setError('Invalid data format received from server. Expected array of cleaners.');
                    setCleaners([]);
                    return;
                }

                // If no pagination info from API and we're on page 1 with no filters,
                // we might need to fetch all pages to get total count
                // For now, we'll use the data length and assume there might be more pages
                // if we got exactly the limit number of items
                const hasMoreData = !paginationFromAPI && data.length === itemsPerPage && currentPage === 1;

                // Map API response to UI structure
                let mappedCleaners = data.map((cleaner) => {
                    const status = getUiStatus(cleaner);

                    // Format date: use joined if available, otherwise format joinedTimestamp
                    let formattedDate = cleaner.joined;
                    if (!formattedDate && cleaner.joinedTimestamp) {
                        const date = new Date(cleaner.joinedTimestamp);
                        formattedDate = date.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                    }

                    return {
                        id: cleaner._id,
                        name: cleaner.cleanerName || `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() || 'Unknown',
                        firstName: cleaner.firstName || '',
                        lastName: cleaner.lastName || '',
                        role: cleaner.role || "Professional Cleaner",
                        avatar: cleaner.profilePhoto?.url || cleaner.avatar || cleaner.profilePhoto,
                        radius: cleaner.radius || "0-20 km",
                        joined: formattedDate || "N/A",
                        status: status,
                        // Keep original data for details view
                        originalData: cleaner,
                    };
                });

                // Apply client-side filtering for Pending status (includes no_documents, partial, and pending_review)
                if (statusFilter === 'Pending') {
                    mappedCleaners = mappedCleaners.filter((cleaner) => {
                        const approvalStatus = cleaner.originalData?.approvalStatus;
                        // Include all pending statuses: no_documents, partial, and pending_review
                        return approvalStatus === 'no_documents' ||
                            approvalStatus === 'partial' ||
                            approvalStatus === 'pending_review' ||
                            !approvalStatus;
                    });
                }

                // Apply client-side date range filtering (backend doesn't filter by date)
                if (isDateFilterActive) {
                    const startTime = new Date(dateJoined.start).setHours(0, 0, 0, 0);
                    const endTime = new Date(dateJoined.end).setHours(23, 59, 59, 999);
                    mappedCleaners = mappedCleaners.filter((cleaner) => {
                        const ts = cleaner.originalData?.joinedTimestamp
                            ? new Date(cleaner.originalData.joinedTimestamp)
                            : parseDateString(cleaner.joined);
                        if (!ts) return false;
                        const time = ts.setHours(0, 0, 0, 0);
                        return time >= startTime && time <= endTime;
                    });
                }

                // Check if we fetched all data for client-side pagination
                const fetchedAllData = response?._needsClientSidePagination === true;

                // Apply client-side search filtering as extra accuracy layer (mirrors JobsTable pattern)
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    mappedCleaners = mappedCleaners.filter((cleaner) => {
                        const name = (cleaner.name || "").toLowerCase();
                        const email = (cleaner.originalData?.email || cleaner.originalData?.cleanerEmail || "").toLowerCase();
                        const abn = (cleaner.originalData?.abn || cleaner.originalData?.abnNumber || "").toLowerCase();
                        return name.includes(q) || email.includes(q) || abn.includes(q);
                    });
                }

                setCleaners(mappedCleaners);

                // Update pagination info
                // If we did client-side filtering (any status filter or date filter) or fetched all data, recalculate pagination
                if (isDateFilterActive || !!statusFilter || fetchedAllData) {
                    const total = mappedCleaners.length;
                    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                    // Ensure currentPage doesn't exceed totalPages
                    const validCurrentPage = Math.min(currentPage, totalPages);

                    // Update pagination info with filtered data
                    setPaginationInfo({
                        currentPage: validCurrentPage,
                        totalPages,
                        totalCleaners: total,
                        limit: itemsPerPage,
                        hasNextPage: validCurrentPage < totalPages,
                        hasPrevPage: validCurrentPage > 1
                    });

                    // Reset to page 1 if current page exceeds total pages
                    if (currentPage > totalPages) {
                        setCurrentPage(1);
                    }
                } else if (paginationFromAPI) {
                    // Use pagination info from API response for server-side filtering
                    const apiPagination = paginationFromAPI;
                    const totalCleaners = apiPagination.totalCleaners || apiPagination.total || mappedCleaners.length;
                    const totalPages = apiPagination.totalPages || Math.max(1, Math.ceil(totalCleaners / itemsPerPage));
                    const validCurrentPage = apiPagination.currentPage || currentPage;

                    // Reset to page 1 if current page exceeds total pages or if no data
                    if (validCurrentPage > totalPages || totalCleaners === 0) {
                        setCurrentPage(1);
                    }

                    setPaginationInfo({
                        currentPage: validCurrentPage,
                        totalPages,
                        totalCleaners: totalCleaners,
                        limit: apiPagination.limit || itemsPerPage,
                        hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : validCurrentPage < totalPages,
                        hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : validCurrentPage > 1
                    });
                } else {
                    // Fallback: If no pagination info and we got exactly the limit, 
                    // assume there might be more pages. Otherwise, use current data length.
                    // This is a best-guess scenario when API doesn't return pagination metadata
                    const estimatedTotal = hasMoreData ? mappedCleaners.length + 1 : mappedCleaners.length;
                    const totalPages = Math.max(1, Math.ceil(estimatedTotal / itemsPerPage));

                    setPaginationInfo({
                        currentPage,
                        totalPages: hasMoreData ? Math.max(totalPages, 2) : totalPages, // At least 2 pages if we got full page
                        totalCleaners: estimatedTotal,
                        limit: itemsPerPage,
                        hasNextPage: hasMoreData || currentPage < totalPages,
                        hasPrevPage: currentPage > 1
                    });
                }
            } catch (err) {
                console.error('Error fetching cleaners KYC:', err);

                // Handle different error structures
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load cleaners data';

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadCleaners();
    }, [currentPage, itemsPerPage, searchQuery, roleFilter, statusFilter, dateJoined]);

    // Use cleaners directly since filtering/sorting/pagination is done on server
    // For client-side filtering (date or Pending status) or when all data is fetched, paginate client-side
    const paginatedCleaners = useMemo(() => {
        const needsClientSidePagination = isDateFilterActive || !!statusFilter || hasAllDataLoaded;

        if (!needsClientSidePagination) return cleaners;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return cleaners.slice(startIndex, startIndex + itemsPerPage);
    }, [cleaners, currentPage, itemsPerPage, isDateFilterActive, statusFilter, hasAllDataLoaded]);

    // Calculate total items for pagination - reactive to cleaners and paginationInfo changes
    const totalItemsForPagination = useMemo(() => {
        // For client-side filtering (Pending status or date) or when all data is loaded, use cleaners.length directly
        if (!!statusFilter || isDateFilterActive || hasAllDataLoaded) {
            return cleaners.length;
        }
        // For server-side filtering (other statuses, role, search), use paginationInfo.totalCleaners
        // This ensures pagination reflects the actual filtered count from the API
        if (paginationInfo.totalCleaners !== undefined && paginationInfo.totalCleaners !== null) {
            return paginationInfo.totalCleaners;
        }
        // Fallback to cleaners.length if paginationInfo is not available
        return cleaners.length;
    }, [cleaners.length, paginationInfo.totalCleaners, statusFilter, isDateFilterActive, hasAllDataLoaded]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            // Select all items on current page
            const pageIds = paginatedCleaners.map((cleaner) => cleaner.id);
            setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
        } else {
            // Deselect all items on current page
            const pageIds = paginatedCleaners.map((cleaner) => cleaner.id);
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

    // Reset to page 1 when filters change and reset all-data flag
    useEffect(() => {
        setCurrentPage(1);
        setHasAllDataLoaded(false); // Reset when filters/search change so API is re-queried
    }, [searchQuery, roleFilter, statusFilter, itemsPerPage, dateJoined]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                <div className="text-center text-red-600">
                    <p className="font-medium">Error loading data</p>
                    <p className="text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Filters Section */}
            <div className="p-3 md:p-4 border-b border-gray-200">
                {/* Stack on mobile & tablet, side‑by‑side only on very large screens */}
                <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-stretch xl:items-center justify-between">
                    {/* Search */}

                    <SearchInput
                        placeholder="ABN / Name / Email"
                        value={searchInputValue}
                        onChange={setSearchInputValue}
                        className="w-full md:w-[200px]"
                    />


                    {/* Filters */}
                    <div className="w-full xl:w-auto flex flex-col sm:flex-row xl:flex-row xl:flex-nowrap gap-2 md:gap-3">
                        <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-32">
                            <CustomSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="Status"
                                options={statusOptions}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-40">
                            <DatePicker
                                label="Date Joined"
                                value={dateJoined}
                                onChange={setDateJoined}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
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
                            <th className="min-w-[200px] md:min-w-[250px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">
                                    Cleaner Name & Role
                                </span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Radius</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Joined</span>
                            </th>
                            <th className="min-w-[130px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">
                                    Approval Status
                                </span>
                            </th>
                            <th className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-3 text-center">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCleaners.map((cleaner) => (
                            <tr
                                key={cleaner.id}
                                className="border-b border-gray-200"
                            >
                                <td className="w-12 md:w-16 px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={selectedRows.includes(cleaner.id)}
                                            onChange={(e) =>
                                                handleSelectRow(cleaner.id, e.target.checked)
                                            }
                                        />
                                    </div>
                                </td>
                                <td className="min-w-[200px] md:min-w-[250px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <Avatar
                                            src={cleaner.avatar}
                                            firstName={cleaner.firstName}
                                            lastName={cleaner.lastName}
                                            fullName={cleaner.name}
                                            id={cleaner.id}
                                            className="w-8 h-8 md:w-9 md:h-9"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                                                {cleaner.name}
                                            </p>
                                            <p className="text-[10px] md:text-sm text-gray-500 truncate">{cleaner.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-gray-700 border-r border-gray-200 text-xs md:text-sm font-medium">
                                    {cleaner.radius}
                                </td>
                                <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-gray-700 border-r border-gray-200 text-xs md:text-sm font-medium">
                                    {cleaner.joined}
                                </td>
                                <td className="min-w-[130px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                    {(() => {
                                        const { pill, dot } = getStatusClasses(cleaner.status);
                                        return (
                                            <span
                                                className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border ${pill}`}
                                            >
                                                <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${dot}`} />
                                                {cleaner.status}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => onViewCleaner && onViewCleaner(cleaner)}
                                        className="rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                                    >
                                        <Eye size={20} className="text-[#78829D] cursor-pointer" />
                                    </button>
                                </td>
                            </tr>
                        ))}
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
    );
}

