import { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, Eye } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
// import CustomSelect from "../common/CustomSelect";
// import DatePicker from "../common/DatePicker";
import PaginationRanges from "../common/PaginationRanges";
import { fetchCustomers, fetchCustomersJobsStats } from "../../api/services/customersService";
import Loader from "../common/Loader";
import Toggle from "../common/Toggle";

export default function CustomersTable({ onViewCustomer }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInputValue, setSearchInputValue] = useState(""); // Local state for search input
    // Legacy filters removed from UI; keep defaults empty
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("");
    const [dateJoined, setDateJoined] = useState(null);
    const [ndisOnly, setNdisOnly] = useState(false); // filter for NDIS participants
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads
    // Pagination info from API
    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    const roleOptions = ["Customer", "Business"];
    const statusOptions = ["Active", "Inactive", "Suspended"];
    const locationOptions = ["Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA"];
    const badgeOptions = ["Bronze", "Silver", "Gold", "Platinum"];

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

    // Helper function to get initials from name
    const getInitials = (firstName, lastName, fullName) => {
        if (firstName && lastName) {
            return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        }
        if (fullName) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length >= 2) {
                return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}`;
            }
            return nameParts[0].charAt(0).toUpperCase();
        }
        return "?";
    };

    // Helper function to generate a color based on name/ID (consistent for same name)
    const getAvatarColor = (name, id) => {
        // Color palette - different shades for avatars
        const colors = [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#FFA07A', // Light Salmon
            '#98D8C8', // Mint
            '#F7DC6F', // Yellow
            '#BB8FCE', // Purple
            '#85C1E2', // Sky Blue
            '#F8B739', // Orange
            '#52BE80', // Green
            '#EC7063', // Coral
            '#5DADE2', // Light Blue
            '#F1948A', // Pink
            '#82E0AA', // Light Green
            '#F4D03F', // Gold
            '#A569BD', // Medium Purple
        ];

        // Use name or ID to generate a consistent hash
        const str = name || id || 'default';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Get color index from hash
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Helper function to check if a value is a valid image URL
    const isValidImageUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        // Check if it's a valid URL (starts with http:// or https://) or is a data URL
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
    };

    // Map API response to UI structure
    const mapCustomerFromAPI = (customer) => {
        const firstName = customer.firstName || "";
        const lastName = customer.lastName || "";
        const name = `${firstName} ${lastName}`.trim() || customer.name || "Unknown Customer";
        const email = customer.email || "";
        const phone = customer.phone || customer.phoneNumber || "";

        // Get avatar URL - only use if it's a valid string URL
        let avatar = null;
        if (customer.profilePhoto?.url && isValidImageUrl(customer.profilePhoto.url)) {
            avatar = customer.profilePhoto.url;
        } else if (customer.avatar && isValidImageUrl(customer.avatar)) {
            avatar = customer.avatar;
        } else if (typeof customer.profilePhoto === 'string' && isValidImageUrl(customer.profilePhoto)) {
            avatar = customer.profilePhoto;
        }

        const role = customer.role || customer.userType || "Customer";
        const status = customer.status || "Active";
        const location = customer.location || customer.address?.city || "";
        const badge = customer.badge || customer.tier || "Silver";
        const jobsPosted = customer.jobsPosted || customer.totalJobs || customer.jobsCount || 0;
        const spend = customer.spend || customer.totalSpend || customer.totalAmount || 0;
        const joined = formatDateFromAPI(customer.createdAt || customer.joined || customer.dateJoined);
        const isNdisParticipant = customer.isNdisParticipant || customer.ndisParticipant || customer.originalData?.isNdisParticipant || customer.originalData?.ndisParticipant || false;

        return {
            id: customer._id || customer.id,
            name: name,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            avatar: avatar,
            role: role,
            status: status,
            location: location,
            badge: badge,
            jobsPosted: jobsPosted,
            spend: spend,
            joined: joined,
            isNdisParticipant,
            // Keep original data for details view
            originalData: customer,
        };
    };

    // Fetch customers data from API
    useEffect(() => {
        const loadCustomers = async () => {
            setLoading(true);
            setError(null);
            try {
                const isDateFilterActive = !!(dateJoined?.start && dateJoined?.end);

                // For date filtering or NDIS toggle, we need client-side filtering
                const needsClientSideFilter = isDateFilterActive || ndisOnly;

                let response;
                if (needsClientSideFilter) {
                    // Fetch all pages when doing client-side filtering
                    let allData = [];
                    let currentPageNum = 1;
                    let hasMore = true;
                    const pageLimit = 100;

                    while (hasMore) {
                        const pageResponse = await fetchCustomers({
                            page: currentPageNum,
                            limit: pageLimit,
                            search: searchQuery,
                            role: roleFilter,
                            status: statusFilter,
                            location: locationFilter,
                            badge: badgeFilter,
                        });

                        let pageData = [];
                        if (pageResponse?.data?.customers && Array.isArray(pageResponse.data.customers)) {
                            pageData = pageResponse.data.customers;
                        } else if (Array.isArray(pageResponse)) {
                            pageData = pageResponse;
                        } else if (Array.isArray(pageResponse.data)) {
                            pageData = pageResponse.data;
                        } else if (Array.isArray(pageResponse.customers)) {
                            pageData = pageResponse.customers;
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
                            customers: allData,
                            pagination: {
                                currentPage: 1,
                                totalPages: 1,
                                totalCustomers: allData.length,
                                limit: pageLimit,
                                hasNextPage: false,
                                hasPrevPage: false
                            }
                        }
                    };
                } else {
                    // Normal paginated fetch
                    response = await fetchCustomers({
                        page: currentPage,
                        limit: itemsPerPage,
                        search: searchQuery,
                        role: roleFilter,
                        status: statusFilter,
                        location: locationFilter,
                        badge: badgeFilter,
                    });
                }

                // Extract customers array
                let data = [];
                if (response?.data?.customers && Array.isArray(response.data.customers)) {
                    data = response.data.customers;
                    if (response.data.pagination) {
                        setPaginationInfo({
                            currentPage: response.data.pagination.currentPage || currentPage,
                            totalPages: response.data.pagination.totalPages || 1,
                            totalCustomers: response.data.pagination.totalCustomers || response.data.pagination.total || 0,
                            limit: response.data.pagination.limit || itemsPerPage,
                            hasNextPage: response.data.pagination.hasNextPage !== undefined ? response.data.pagination.hasNextPage : false,
                            hasPrevPage: response.data.pagination.hasPrevPage !== undefined ? response.data.pagination.hasPrevPage : false
                        });
                    }
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (Array.isArray(response.customers)) {
                    data = response.customers;
                    if (response.pagination) {
                        setPaginationInfo({
                            currentPage: response.pagination.currentPage || currentPage,
                            totalPages: response.pagination.totalPages || 1,
                            totalCustomers: response.pagination.totalCustomers || response.pagination.total || 0,
                            limit: response.pagination.limit || itemsPerPage,
                            hasNextPage: response.pagination.hasNextPage !== undefined ? response.pagination.hasNextPage : false,
                            hasPrevPage: response.pagination.hasPrevPage !== undefined ? response.pagination.hasPrevPage : false
                        });
                    }
                }

                if (!Array.isArray(data)) {
                    console.error('API response is not an array. Response:', response);
                    setError('Invalid data format received from server. Expected array of customers.');
                    setCustomers([]);
                    return;
                }

                // Map API response to UI structure
                let mappedCustomers = data.map(mapCustomerFromAPI);

                // Fetch job stats and merge totals into mapped customers (jobs + spend)
                try {
                    const statsResponse = await fetchCustomersJobsStats();
                    const statsData = statsResponse?.data || statsResponse || [];
                    const statsMap = Array.isArray(statsData)
                        ? statsData.reduce((acc, item) => {
                            const id = item.customerId || item._id;
                            if (id) {
                                const totalJobs = item.totalJobs ?? item.postedJobs ?? 0;
                                const jobsCompleted = item.completedJobs ?? 0;
                                // Prefer totalSpend from API; otherwise derive from cents if provided
                                const totalSpend =
                                    item.totalSpend ??
                                    (item.totalSpendCents !== undefined && item.totalSpendCents !== null
                                        ? Number(item.totalSpendCents) / 100
                                        : undefined);
                                acc[id] = { totalJobs, jobsCompleted, totalSpend };
                            }
                            return acc;
                        }, {})
                        : {};

                    mappedCustomers = mappedCustomers.map((customer) => {
                        const stats = statsMap[customer.id];
                        return {
                            ...customer,
                            jobsPosted: stats?.totalJobs !== undefined ? stats.totalJobs : customer.jobsPosted,
                            jobsCompleted: stats?.jobsCompleted !== undefined ? stats.jobsCompleted : (customer.jobsCompleted || 0),
                            spend: stats?.totalSpend !== undefined ? stats.totalSpend : customer.spend,
                        };
                    });
                } catch (statsErr) {
                    console.warn('Failed to fetch customer job stats', statsErr);
                }

                // Client-side NDIS filter
                if (ndisOnly) {
                    mappedCustomers = mappedCustomers.filter((customer) => customer.isNdisParticipant);
                }

                // Apply client-side date filtering if needed
                if (isDateFilterActive) {
                    const startTime = new Date(dateJoined.start).setHours(0, 0, 0, 0);
                    const endTime = new Date(dateJoined.end).setHours(23, 59, 59, 999);
                    mappedCustomers = mappedCustomers.filter((customer) => {
                        const customerDate = parseDateString(customer.joined);
                        if (!customerDate) return false;
                        const time = customerDate.setHours(0, 0, 0, 0);
                        return time >= startTime && time <= endTime;
                    });
                }

                // If doing client-side filtering, paginate client-side
                if (needsClientSideFilter) {
                    const total = mappedCustomers.length;
                    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                    const validCurrentPage = Math.min(currentPage, totalPages);

                    setPaginationInfo({
                        currentPage: validCurrentPage,
                        totalPages,
                        totalCustomers: total,
                        limit: itemsPerPage,
                        hasNextPage: validCurrentPage < totalPages,
                        hasPrevPage: validCurrentPage > 1
                    });

                    if (currentPage > totalPages) {
                        setCurrentPage(1);
                    }

                    setCustomers(mappedCustomers);
                } else {
                    // API pagination is working correctly - use customers as-is
                    setCustomers(mappedCustomers);

                    if (response?.data?.pagination) {
                        const apiPagination = response.data.pagination;
                        setPaginationInfo({
                            currentPage: apiPagination.currentPage || currentPage,
                            totalPages: apiPagination.totalPages || Math.max(1, Math.ceil(mappedCustomers.length / itemsPerPage)),
                            totalCustomers: apiPagination.totalCustomers || apiPagination.total || mappedCustomers.length,
                            limit: apiPagination.limit || itemsPerPage,
                            hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : currentPage < (apiPagination.totalPages || 1),
                            hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : currentPage > 1
                        });
                    } else if (response?.pagination) {
                        const apiPagination = response.pagination;
                        setPaginationInfo({
                            currentPage: apiPagination.currentPage || currentPage,
                            totalPages: apiPagination.totalPages || Math.max(1, Math.ceil(mappedCustomers.length / itemsPerPage)),
                            totalCustomers: apiPagination.totalCustomers || apiPagination.total || mappedCustomers.length,
                            limit: apiPagination.limit || itemsPerPage,
                            hasNextPage: apiPagination.hasNextPage !== undefined ? apiPagination.hasNextPage : currentPage < (apiPagination.totalPages || 1),
                            hasPrevPage: apiPagination.hasPrevPage !== undefined ? apiPagination.hasPrevPage : currentPage > 1
                        });
                    } else {
                        // Fallback pagination
                        const total = mappedCustomers.length;
                        const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                        setPaginationInfo({
                            currentPage,
                            totalPages,
                            totalCustomers: total,
                            limit: itemsPerPage,
                            hasNextPage: currentPage < totalPages,
                            hasPrevPage: currentPage > 1
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching customers:', err);
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load customers data';
                setError(errorMessage);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, [currentPage, itemsPerPage, searchQuery, roleFilter, statusFilter, locationFilter, badgeFilter, dateJoined, ndisOnly]);

    // Determine if we need client-side pagination
    const isDateFilterActive = !!(dateJoined?.start && dateJoined?.end);
    const needsClientSidePagination = isDateFilterActive || ndisOnly || customers.length > itemsPerPage;

    const paginatedCustomers = useMemo(() => {
        if (needsClientSidePagination) {
            // Client-side pagination - slice the customers array
            const startIndex = (currentPage - 1) * itemsPerPage;
            return customers.slice(startIndex, startIndex + itemsPerPage);
        }
        // Server-side pagination - customers are already paginated from API
        return customers;
    }, [customers, currentPage, itemsPerPage, needsClientSidePagination]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            const pageIds = paginatedCustomers.map((customer) => customer.id);
            setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
        } else {
            const pageIds = paginatedCustomers.map((customer) => customer.id);
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

    // Debounce search input into searchQuery
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInputValue.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInputValue]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, statusFilter, locationFilter, badgeFilter, dateJoined, itemsPerPage, ndisOnly]);


    // Calculate total items for pagination
    const totalItemsForPagination = useMemo(() => {
        // If doing client-side pagination (date filter), use customers.length
        if (needsClientSidePagination) {
            return customers.length;
        }
        // For server-side pagination, use paginationInfo.totalCustomers from API
        if (paginationInfo.totalCustomers !== undefined && paginationInfo.totalCustomers !== null) {
            return paginationInfo.totalCustomers;
        }
        // Fallback to customers.length
        return customers.length;
    }, [customers.length, paginationInfo.totalCustomers, needsClientSidePagination]);

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
            {/* Filters Section (Search + NDIS toggle) */}
            <div className="p-3 md:p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center md:justify-between">
                    {/* Search */}
                    <SearchInput
                        placeholder="Search by Name, ABN, Email, Role"
                        value={searchInputValue}
                        onChange={setSearchInputValue}
                        className="md:w-[300px]"
                    />


                    {/* NDIS Participant Toggle */}
                    <div className="w-full xl:w-auto flex items-center justify-start xl:justify-end gap-3">
                        <span className="text-primary font-medium text-sm">NDIS Participant</span>
                        <Toggle checked={ndisOnly} onChange={setNdisOnly} />
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
                                <span className="font-medium text-primary text-xs md:text-sm">
                                    Customer
                                </span>
                            </th>
                            <th className="min-w-[140px] md:min-w-[160px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-primary text-xs md:text-sm">Phone Number</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-primary text-xs md:text-sm">Jobs Posted</span>
                            </th>
                            <th className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-3 text-left border-r border-gray-200">
                                <span className="font-medium text-primary text-xs md:text-sm">Joined</span>
                            </th>
                            <th className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-3 text-center">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="w-12 md:w-16 px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedRows.includes(customer.id)}
                                                onChange={(e) =>
                                                    handleSelectRow(customer.id, e.target.checked)
                                                }
                                            />
                                        </div>
                                    </td>
                                    <td className="min-w-[200px] md:min-w-[250px] px-2 md:px-4 py-2 md:py-4 border-r border-gray-200">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {customer.avatar && isValidImageUrl(customer.avatar) && !failedImages.has(customer.id) ? (
                                                <img
                                                    src={customer.avatar}
                                                    alt={customer.name}
                                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                                                    onError={() => {
                                                        // If image fails to load, add to failed images set
                                                        setFailedImages(prev => new Set(prev).add(customer.id));
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: getAvatarColor(customer.name, customer.id) }}
                                                >
                                                    <span className="text-xs md:text-sm font-medium text-white">
                                                        {getInitials(customer.firstName, customer.lastName, customer.name)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-primary truncate">
                                                    {customer.name}
                                                </p>
                                                <p className="text-sm text-primary-light truncate">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="min-w-[140px] md:min-w-[160px] px-2 md:px-4 py-2 md:py-4 text-primary-light border-r border-gray-200 text-xs md:text-sm">
                                        {customer.phone}
                                    </td>
                                    <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-sm font-medium text-primary border-r border-gray-200">
                                        {customer.jobsPosted}
                                    </td>
                                    <td className="min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-2 md:py-4 text-sm font-medium text-primary border-r border-gray-200">
                                        {customer.joined}
                                    </td>
                                    <td className="w-16 md:w-20 px-2 md:px-4 py-2 md:py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onViewCustomer &&
                                                    onViewCustomer(customer);
                                            }}
                                            className="rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                                        >
                                            <Eye size={20} className="text-[#78829D] cursor-pointer" />
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
                totalItems={totalItemsForPagination}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />
        </div>
    );
}
