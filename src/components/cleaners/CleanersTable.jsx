import { useState, useEffect, useMemo } from "react";
import { Eye, Star } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import CustomSelect from "../common/CustomSelect";
import DatePicker from "../common/DatePicker";
import PaginationRanges from "../common/PaginationRanges";
import silverTierIcon from "../../assets/icon/silver.svg";
import goldTierIcon from "../../assets/icon/gold.svg";
import bronzeTierIcon from "../../assets/icon/bronze.svg";
import planStarIcon from "../../assets/icon/planStar.svg";
import { fetchCleaners, fetchCleanersJobsStats } from "../../api/services/cleanersService";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";

export default function CleanersTable({ onViewCleaner }) {
    const [cleaners, setCleaners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInputValue, setSearchInputValue] = useState(""); // Local state for search input
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("");
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
    // Cache computed earnings from completed jobs (keyed by cleanerId)
    const [computedEarningsByCleanerId, setComputedEarningsByCleanerId] = useState({});
    // Cache computed total jobs count (keyed by cleanerId)
    const [computedJobsCountByCleanerId, setComputedJobsCountByCleanerId] = useState({});
    // Pagination info from API
    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCleaners: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    const roleOptions = [
        "Professional Cleaner",
        "Student Cleaner",
        "Support Service Provider",
        "Pet Sitter",
        "Handyman",
        "Housekeeper",
    ];

    const statusOptions = ["Active", "Pending Docs"];
    const badgeOptions = ["Silver", "Gold", "Bronze"];

    // Helper function to format date from API (ISO string or timestamp) to YYYY-MM-DD
    const formatDateFromAPI = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "N/A";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        } catch {
            return "N/A";
        }
    };

    // Helper function to parse date string (YYYY-MM-DD) to Date object
    const parseDateString = (dateStr) => {
        if (!dateStr || dateStr === "N/A") return null;
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day);
    };



    // Map API response to UI structure
    const mapCleanerFromAPI = (cleaner) => {
        const firstName = cleaner.firstName || "";
        const lastName = cleaner.lastName || "";
        const name = `${firstName} ${lastName}`.trim() || cleaner.name || "Unknown Cleaner";
        const email = cleaner.email || "";

        // Get avatar URL candidate (must be a string)
        const avatar = (typeof cleaner.profilePhoto?.url === 'string' ? cleaner.profilePhoto.url : null) ||
            (typeof cleaner.avatar === 'string' ? cleaner.avatar : null) ||
            (typeof cleaner.profilePhoto === 'string' ? cleaner.profilePhoto : null);

        const role = cleaner.role || cleaner.serviceType || "Professional Cleaner";
        const badge = cleaner.badge || cleaner.tier || "Silver";
        const jobs = cleaner.jobs || cleaner.totalJobs || cleaner.jobsCompleted || 0;
        const rating = cleaner.rating || cleaner.averageRating || 0;
        const earnings = cleaner.earnings || cleaner.totalEarnings || 0;
        // Status mapping:
        // If backend provides a `status`, prefer it.
        // Otherwise derive from verification fields used by /admin/cleaners:
        // - isVerified: true => Active
        // - verificationStatus: "verified" => Active
        // - kycStatus: "approved" => Active
        // else => Pending Docs
        const verificationStatus = (cleaner.verificationStatus || "").toString().toLowerCase();
        const kycStatus = (cleaner.kycStatus || "").toString().toLowerCase();
        const isVerified =
            cleaner.isVerified === true ||
            verificationStatus === "verified" ||
            verificationStatus === "approve" ||
            verificationStatus === "approved" ||
            kycStatus === "approved";
        const status = cleaner.status || (isVerified ? "Active" : "Pending Docs");
        const joined = formatDateFromAPI(cleaner.createdAt || cleaner.joined || cleaner.dateJoined);

        const planName = cleaner.subscription?.planId?.name || "No Plan";
        const availableCredits = cleaner.availableCredits || 0;
        const totalCredits = cleaner.totalCredits || 0;

        return {
            id: cleaner._id || cleaner.id,
            name: name,
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
            avatar: avatar,
            badge: badge,
            jobs: jobs,
            rating: rating,
            earnings: earnings,
            status: status,
            joined: joined,
            planName: planName,
            credits: {
                available: availableCredits,
                total: totalCredits
            },
            // Keep original data for details view
            originalData: cleaner,
        };
    };

    // Fetch cleaners data from API
    useEffect(() => {
        const loadCleaners = async () => {
            setLoading(true);
            setError(null);
            try {
                const isDateFilterActive = !!(dateJoined?.start && dateJoined?.end);

                // For date filtering, grouped role filtering, or client-side status/badge filtering, we need client-side filtering
                const isGroupedRoleFilter = roleFilter === "Support Service Provider";
                const needsClientSideFilter = isDateFilterActive || isGroupedRoleFilter || statusFilter || badgeFilter;

                let response;
                if (needsClientSideFilter) {
                    // Fetch all pages when doing client-side filtering
                    let allData = [];
                    let currentPageNum = 1;
                    let hasMore = true;
                    const pageLimit = 100;

                    while (hasMore) {
                        const pageResponse = await fetchCleaners({
                            page: currentPageNum,
                            limit: pageLimit,
                            search: searchQuery,
                            role: roleFilter,
                            status: statusFilter,
                            badge: badgeFilter,
                        });

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
                    response = await fetchCleaners({
                        page: currentPage,
                        limit: itemsPerPage,
                        search: searchQuery,
                        role: roleFilter,
                        status: statusFilter,
                        badge: badgeFilter,
                    });
                }

                // Extract cleaners array
                let data = [];
                if (response?.data?.cleaners && Array.isArray(response.data.cleaners)) {
                    data = response.data.cleaners;
                    if (response.data.pagination) {
                        setPaginationInfo({
                            currentPage: response.data.pagination.currentPage || currentPage,
                            totalPages: response.data.pagination.totalPages || 1,
                            totalCleaners: response.data.pagination.totalCleaners || response.data.pagination.total || 0,
                            limit: response.data.pagination.limit || itemsPerPage,
                            hasNextPage: response.data.pagination.hasNextPage !== undefined ? response.data.pagination.hasNextPage : false,
                            hasPrevPage: response.data.pagination.hasPrevPage !== undefined ? response.data.pagination.hasPrevPage : false
                        });
                    }
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (Array.isArray(response.cleaners)) {
                    data = response.cleaners;
                    if (response.pagination) {
                        setPaginationInfo({
                            currentPage: response.pagination.currentPage || currentPage,
                            totalPages: response.pagination.totalPages || 1,
                            totalCleaners: response.pagination.totalCleaners || response.pagination.total || 0,
                            limit: response.pagination.limit || itemsPerPage,
                            hasNextPage: response.pagination.hasNextPage !== undefined ? response.pagination.hasNextPage : false,
                            hasPrevPage: response.pagination.hasPrevPage !== undefined ? response.pagination.hasPrevPage : false
                        });
                    }
                }

                if (!Array.isArray(data)) {
                    console.error('API response is not an array. Response:', response);
                    setError('Invalid data format received from server. Expected array of cleaners.');
                    setCleaners([]);
                    return;
                }

                // Map API response to UI structure
                let mappedCleaners = data.map(mapCleanerFromAPI);

                // Fetch jobs stats in bulk and merge
                try {
                    const statsResponse = await fetchCleanersJobsStats();
                    const stats = statsResponse?.data || statsResponse || [];

                    if (Array.isArray(stats)) {
                        mappedCleaners = mappedCleaners.map(cleaner => {
                            const cleanerStat = stats.find(s => s.cleanerId === cleaner.id || s._id === cleaner.id);
                            if (cleanerStat) {
                                return {
                                    ...cleaner,
                                    jobs: cleanerStat.completedJobs ?? cleaner.jobs,
                                    earnings: cleanerStat.totalEarnings ?? cleaner.earnings
                                };
                            }
                            return cleaner;
                        });
                    }
                } catch (statsErr) {
                    console.warn("Failed to fetch cleaners jobs stats", statsErr);
                }

                setCleaners(mappedCleaners);

                // Client-side status filter (ensure dropdown matches table even if API doesn't filter)
                if (statusFilter) {
                    const targetStatus = statusFilter.toLowerCase();
                    mappedCleaners = mappedCleaners.filter((cleaner) => (cleaner.status || "").toLowerCase() === targetStatus);
                }

                // Client-side badge filter
                if (badgeFilter) {
                    const targetBadge = badgeFilter.toLowerCase();
                    mappedCleaners = mappedCleaners.filter((cleaner) => (cleaner.badge || "").toLowerCase() === targetBadge);
                }

                // Role filter (supports grouped roles for Support Service Provider)
                if (roleFilter) {
                    const target = roleFilter.toLowerCase();
                    // When "Support Service Provider" is selected, include related roles
                    const supportRoles = ["support service provider", "support service", "ndis assistant"];
                    mappedCleaners = mappedCleaners.filter((cleaner) => {
                        const cleanerRole = (cleaner.role || "").toLowerCase();
                        if (target === "support service provider") {
                            return supportRoles.includes(cleanerRole);
                        }
                        return cleanerRole === target;
                    });
                }

                // Apply client-side date filtering if needed
                if (isDateFilterActive) {
                    const startTime = new Date(dateJoined.start).setHours(0, 0, 0, 0);
                    const endTime = new Date(dateJoined.end).setHours(23, 59, 59, 999);
                    mappedCleaners = mappedCleaners.filter((cleaner) => {
                        const cleanerDate = parseDateString(cleaner.joined);
                        if (!cleanerDate) return false;
                        const time = cleanerDate.setHours(0, 0, 0, 0);
                        return time >= startTime && time <= endTime;
                    });
                }

                // If doing client-side filtering (date range, grouped role, status, badge), paginate client-side
                if (needsClientSideFilter) {
                    const total = mappedCleaners.length;
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

                    setCleaners(mappedCleaners);
                } else {
                    // API pagination is working correctly - use cleaners as-is
                    setCleaners(mappedCleaners);

                    if (response?.data?.pagination) {
                        const apiPagination = response.data.pagination;
                        setPaginationInfo({
                            currentPage: apiPagination.currentPage || currentPage,
                            totalPages: apiPagination.totalPages || Math.max(1, Math.ceil(mappedCleaners.length / itemsPerPage)),
                            totalCleaners: apiPagination.totalCleaners || apiPagination.total || mappedCleaners.length,
                            limit: apiPagination.limit || itemsPerPage,
                            hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : currentPage < (apiPagination.totalPages || 1),
                            hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : currentPage > 1
                        });
                    } else if (response?.pagination) {
                        const apiPagination = response.pagination;
                        setPaginationInfo({
                            currentPage: apiPagination.currentPage || currentPage,
                            totalPages: apiPagination.totalPages || Math.max(1, Math.ceil(mappedCleaners.length / itemsPerPage)),
                            totalCleaners: apiPagination.totalCleaners || apiPagination.total || mappedCleaners.length,
                            limit: apiPagination.limit || itemsPerPage,
                            hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : currentPage < (apiPagination.totalPages || 1),
                            hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : currentPage > 1
                        });
                    } else {
                        // Fallback pagination
                        const total = mappedCleaners.length;
                        const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                        setPaginationInfo({
                            currentPage,
                            totalPages,
                            totalCleaners: total,
                            limit: itemsPerPage,
                            hasNextPage: currentPage < totalPages,
                            hasPrevPage: currentPage > 1
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching cleaners:', err);
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load cleaners data';
                setError(errorMessage);
                setCleaners([]);
            } finally {
                setLoading(false);
            }
        };

        loadCleaners();
    }, [currentPage, itemsPerPage, searchQuery, roleFilter, statusFilter, badgeFilter, dateJoined]);

    // Determine if we need client-side pagination
    const isDateFilterActive = !!(dateJoined?.start && dateJoined?.end);
    const isGroupedRoleFilter = roleFilter === "Support Service Provider"; // grouped roles need client-side slicing
    const needsClientSidePagination = isDateFilterActive || isGroupedRoleFilter || statusFilter || badgeFilter || cleaners.length > itemsPerPage;

    const paginatedCleaners = useMemo(() => {
        if (needsClientSidePagination) {
            // Client-side pagination - slice the cleaners array
            const startIndex = (currentPage - 1) * itemsPerPage;
            return cleaners.slice(startIndex, startIndex + itemsPerPage);
        }
        // Server-side pagination - cleaners are already paginated from API
        return cleaners;
    }, [cleaners, currentPage, itemsPerPage, needsClientSidePagination]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            const pageIds = paginatedCleaners.map((cleaner) => cleaner.id);
            setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
        } else {
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

    const getBadgeIcon = (badge) => {
        switch (badge?.toLowerCase()) {
            case "gold":
                return goldTierIcon;
            case "bronze":
                return bronzeTierIcon;
            default:
                return silverTierIcon;
        }
    };

    // Styles for tier pill to match the provided design
    const getBadgeStyles = (badge) => {
        switch (badge?.toLowerCase()) {
            case "gold":
                // Gold: subtle orange border + warm gradient background
                return {
                    container:
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FEC54A] bg-gradient-to-r from-[#FFFFFF] to-[#FFDBAE]",
                    text: "text-[#B45309] text-xs md:text-sm font-medium",
                };
            case "bronze":
                // Bronze: similar structure with bronze tones
                return {
                    container:
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F4B08A] bg-gradient-to-r from-[#FFFFFF] to-[#FFE0C2]",
                    text: "text-[#92400E] text-xs md:text-sm font-medium",
                };
            default:
                // Silver: light grey border (0.6px) and soft silver gradient
                return {
                    container:
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full border-[0.6px] border-[#E9E9E9] bg-gradient-to-r from-[#FFFFFF] to-[#E9E9E9]",
                    text: "text-primary text-xs md:text-sm font-medium",
                };
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return {
                    dot: "bg-[#17C653]",
                    text: "text-[#17C653]",
                    bg: "bg-[#EAFFF1]",
                    border: "border-[#17C65333]",
                };
            case "Pending Docs":
                return {
                    dot: "bg-[#F6B100]",
                    text: "text-[#F6B100]",
                    bg: "bg-[#FFF8DD]",
                    border: "border-[#F6B10033]",
                };
            default:
                return {
                    dot: "bg-gray-400",
                    text: "text-gray-400",
                    bg: "bg-gray-100",
                    border: "border-gray-300",
                };
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, statusFilter, badgeFilter, dateJoined, itemsPerPage]);

    // Calculate total items for pagination
    const totalItemsForPagination = useMemo(() => {
        // If doing client-side pagination (date filter), use cleaners.length
        if (needsClientSidePagination) {
            return cleaners.length;
        }
        // For server-side pagination, use paginationInfo.totalCleaners from API
        if (paginationInfo.totalCleaners !== undefined && paginationInfo.totalCleaners !== null) {
            return paginationInfo.totalCleaners;
        }
        // Fallback to cleaners.length
        return cleaners.length;
    }, [cleaners.length, paginationInfo.totalCleaners, needsClientSidePagination]);

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
                <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-stretch xl:items-center justify-between">
                    {/* Search */}
                    <SearchInput
                        placeholder="Search by Name, ABN, Email, Role"
                        value={searchInputValue}
                        onChange={setSearchInputValue}
                        className="md:w-[300px]"
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

                        <div className="w-full sm:w-auto sm:flex-1 xl:flex-none xl:w-32">
                            <CustomSelect
                                value={badgeFilter}
                                onChange={setBadgeFilter}
                                placeholder="Badge"
                                options={badgeOptions}
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
            <div className="overflow-x-auto ">
                <table className="w-full border-collapse min-w-[1000px]">
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
                            <th className="min-w-[150px] md:min-w-[200px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Plan</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Credits</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Badge</span>
                            </th>
                            <th className="min-w-[80px] md:min-w-[100px] px-2 md:px-4 font-medium py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Jobs</span>
                            </th>
                            <th className="min-w-[80px] md:min-w-[100px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Rating</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Status</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-gray-700 text-xs md:text-sm">Joined</span>
                            </th>
                            <th className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-3 text-center">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCleaners.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    No cleaners found
                                </td>
                            </tr>
                        ) : (
                            paginatedCleaners.map((cleaner) => {
                                const statusColors = getStatusColor(cleaner.status);
                                return (
                                    <tr
                                        key={cleaner.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
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
                                                    className="w-8 h-8 md:w-10 md:h-10"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-primary text-xs md:text-sm truncate">
                                                        {cleaner.name}
                                                    </p>
                                                    {/* <p className="text-[12px] md:text-sm text-primary-light truncate">{cleaner.role}</p> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="min-w-[150px] md:min-w-[200px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <div className="inline-flex items-center gap-2 border-[0.6px] border-[#E9E9E9] bg-white rounded-full px-2.5 py-1">
                                                <img src={planStarIcon} alt="Plan" className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="text-[11px] md:text-[13px] font-medium text-[#111827]">
                                                    {cleaner.planName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <span className="text-[11px] md:text-[13px] font-medium text-primary-light">
                                                {cleaner.credits.available} / {cleaner.credits.total}
                                            </span>
                                        </td>
                                        <td className="min-w-[130px] md:min-w-[150px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            {(() => {
                                                const badgeStyles = getBadgeStyles(cleaner.badge);
                                                return (
                                                    <div className={badgeStyles.container}>
                                                        <img
                                                            src={getBadgeIcon(cleaner.badge)}
                                                            alt={`${cleaner.badge} Tier`}
                                                            className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                                                        />
                                                        <span className={badgeStyles.text}>
                                                            {cleaner.badge} Tier
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="min-w-[80px] md:min-w-[100px] px-2 md:px-4 py-2 md:py-4 text-primary border-r border-gray-200 text-xs md:text-sm font-medium">
                                            {cleaner.jobs}
                                        </td>
                                        <td className="min-w-[80px] md:min-w-[100px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                            <div
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF4E0]"
                                                style={{ border: "0.6px solid #FFEDBA" }}
                                            >
                                                <Star size={14} className="text-[#FFB020] fill-[#FFB020]" />
                                                <span className="text-xs md:text-sm text-primary font-medium">
                                                    {Number(cleaner.rating || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                       
                                        <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200 ">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColors.bg} ${statusColors.border} ${statusColors.text} text-xs md:text-sm font-medium`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                                                {cleaner.status}
                                            </span>
                                        </td>
                                        <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-primary font-medium border-r border-gray-200 text-xs md:text-sm">
                                            {cleaner.joined}
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
                                );
                            })
                        )}
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
