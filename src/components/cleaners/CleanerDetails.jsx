import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Ban,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";
import silverTierIcon from "../../assets/icon/silver.svg";
import goldTierIcon from "../../assets/icon/gold.svg";
import bronzeTierIcon from "../../assets/icon/bronze.svg";
import CustomMenu from "../common/CustomMenu";
import ActionModal from "../common/ActionModal";
import approveKycImg from "../../assets/image/approveKyc.svg";
import rejectKycImg from "../../assets/image/rejectKyc.svg";
import suspenseKycImg from "../../assets/image/suspenseKyc.svg";
import approvalsBg from "../../assets/image/approvalsBg.svg";
import OverviewTab from "./OverviewTab";
import DocumentsTab from "./DocumentsTab";
import JobHistoryTab from "./JobHistoryTab";
import SubscriptionsTab from "./SubscriptionsTab";
import FeedbackTab from "./FeedbackTab";
import JobDetails from "../jobs/JobDetails";
import { fetchCleanerById, fetchCleanersJobsStats, fetchCleanerJobs, fetchCleanerReviews, fetchCleanerKYCById } from "../../api/services/cleanersService";
import { suspendUser } from "../../api/services/userService";

export default function CleanerDetails({ cleaner, onBackToList, onJobViewDetail }) {
  if (!cleaner) return null;

  const originalData = cleaner.originalData || cleaner;
  const cleanerId = originalData._id || cleaner._id || cleaner.id;

  const [activeAction, setActiveAction] = useState(null); // "approve" | "reject" | "suspend" | null
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);

  const [jobsCompleted, setJobsCompleted] = useState(
    originalData.jobs ?? originalData.totalJobs ?? originalData.jobsCompleted ?? cleaner.jobs ?? 0
  );
  const [averageRating, setAverageRating] = useState(
    originalData.averageRating ?? originalData.rating ?? cleaner.rating ?? 0
  );
  const [cleanerTier, setCleanerTier] = useState(
    originalData.tier ?? originalData.badge ?? cleaner.badge ?? "Silver"
  );
  const [fetchedCleaner, setFetchedCleaner] = useState(null);
  const [cleanerJobs, setCleanerJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Avatar helpers (same behavior as CleanersTable fallback)
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
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const mapJobForUi = (job) => {
    const statusRaw = (job?.status || "").toString().toLowerCase();
    const status =
      statusRaw === "completed" || statusRaw === "done"
        ? "Completed"
        : statusRaw === "rejected" || statusRaw === "cancelled" || statusRaw === "canceled"
          ? "Rejected"
          : statusRaw === "accepted"
            ? "Accepted"
            : "In Progress";

    const amount =
      job?.cleanerQuote?.price ??
      job?.acceptedQuoteId?.price ??
      job?.amount ??
      job?.price ??
      0;

    const customer = job?.customerId || job?.customer || {};
    const customerName =
      customer?.name ||
      `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() ||
      "N/A";

    const locationObj = job?.location || {};
    const location =
      locationObj?.fullAddress ||
      locationObj?.address ||
      [locationObj?.city, locationObj?.state].filter(Boolean).join(", ") ||
      "N/A";

    return {
      // keep original job fields for JobDetails view if needed
      ...job,
      id: job?._id || job?.id || job?.jobId,
      _id: job?._id,
      jobId: job?.jobId || job?._id || "N/A",
      customer: {
        ...customer,
        name: customerName,
        email: customer?.email || "N/A",
        avatar: customer?.avatar || customer?.profilePhoto?.url || customer?.profilePhoto || "",
      },
      joined: (job?.scheduledDate || job?.createdAt || job?.updatedAt || "").toString().slice(0, 10),
      amount: Number(amount || 0),
      status,
      // fields used by OverviewTab
      type: job?.serviceTypeDisplay || job?.serviceType || "Job",
      subType: job?.serviceDetail || job?.service || job?.propertyType || "Service",
      location,
      date: job?.scheduledDate || job?.createdAt || job?.updatedAt,
      releasedDate: job?.completedAt ? `Released ${new Date(job.completedAt).toLocaleDateString()}` : "",
    };
  };

  // Fetch completed jobs (stats endpoint is the most reliable)
  useEffect(() => {
    const loadJobsStats = async () => {
      if (!cleanerId) return;
      try {
        const response = await fetchCleanersJobsStats();
        const stats = response?.data || response || [];
        const match = Array.isArray(stats)
          ? stats.find((s) => s.cleanerId === cleanerId || s._id === cleanerId)
          : null;
        if (match?.completedJobs !== undefined && match?.completedJobs !== null) {
          setJobsCompleted(match.completedJobs);
        }
      } catch (e) {
        // non-fatal; keep whatever we already have
        console.warn("Failed to load cleaner jobs stats", e);
      }
    };

    loadJobsStats();
  }, [cleanerId]);

  // Fetch cleaner details for rating/tier (and any other missing fields)
  useEffect(() => {
    const loadCleaner = async () => {
      if (!cleanerId) return;

      // If we already have these fields locally, avoid extra request
      const hasLocalRating = originalData.averageRating !== undefined && originalData.averageRating !== null;
      const hasLocalTier = originalData.tier !== undefined && originalData.tier !== null;
      if (hasLocalRating) setAverageRating(originalData.averageRating);
      if (hasLocalTier) setCleanerTier(originalData.tier);
      if (hasLocalRating && hasLocalTier) return;

      try {
        const resp = await fetchCleanerById(cleanerId);
        const data = resp?.data || resp;
        if (data) {
          setFetchedCleaner(data);
          if (data.averageRating !== undefined && data.averageRating !== null) {
            setAverageRating(data.averageRating);
          }
          if (data.tier) {
            setCleanerTier(data.tier);
          }
        }
      } catch (e) {
        console.warn("Failed to load cleaner details", e);
      }
    };

    loadCleaner();
  }, [cleanerId, originalData]);

  // Fetch jobs for this cleaner
  useEffect(() => {
    const loadJobs = async () => {
      if (!cleanerId) return;
      try {
        setLoadingJobs(true);
        const resp = await fetchCleanerJobs(cleanerId, 10);
        const data = resp?.data || resp;
        const list = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];

        // Map and deduplicate by jobId or _id
        const mapped = list.filter(Boolean).map(mapJobForUi);
        const uniqueMapped = [];
        const seenIds = new Set();

        for (const job of mapped) {
          const id = job.jobId || job._id || job.id;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            uniqueMapped.push(job);
          }
        }

        // Most recent first
        uniqueMapped.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setCleanerJobs(uniqueMapped);
      } catch (e) {
        console.warn("Failed to load cleaner jobs", e);
        setCleanerJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, [cleanerId]);

  // Fetch KYC details for accurate location/address
  useEffect(() => {
    const loadKyc = async () => {
      if (!cleanerId) return;
      try {
        const resp = await fetchCleanerKYCById(cleanerId);
        // Based on screenshot, structure is: { success: true, data: { cleaner: { ... } } }
        const rawData = resp?.data ?? resp;
        let data = rawData?.cleaner || rawData;

        if (Array.isArray(data)) {
          data = data[0];
        }

        if (data) {
          setKycData(data);
        }
      } catch (e) {
        console.warn("Failed to load cleaner KYC for location", e);
      }
    };
    loadKyc();
  }, [cleanerId]);

  // Fetch reviews for this cleaner (Feedback tab + average rating)
  useEffect(() => {
    const loadReviews = async () => {
      if (!cleanerId) return;
      try {
        const resp = await fetchCleanerReviews(cleanerId, { page: 1, limit: 50 });
        const data = resp?.data || resp;
        const list = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];
        setReviews(list);
        setReviewsPagination(data?.pagination || resp?.pagination || null);

        // Prefer backend computed average rating if provided
        const avg = data?.pagination?.averageRating;
        if (avg !== undefined && avg !== null) {
          setAverageRating(avg);
        }
      } catch (e) {
        console.warn("Failed to load cleaner reviews", e);
        setReviews([]);
        setReviewsPagination(null);
      }
    };

    loadReviews();
  }, [cleanerId]);

  const displayCleaner = useMemo(() => {
    // prefer prop-mapped fields for UI (name/avatar/role/joined), but enrich with fetched API payload
    return {
      ...originalData,
      ...(fetchedCleaner || {}),
      kyc: kycData,
      // UI-friendly name/avatar/role from the mapped cleaner object (keeps consistency with table)
      name: cleaner.name ?? fetchedCleaner?.name ?? originalData.name,
      avatar: cleaner.avatar ?? fetchedCleaner?.avatar ?? originalData.avatar,
      role: cleaner.role ?? fetchedCleaner?.role ?? originalData.role,
      joined: cleaner.joined ?? fetchedCleaner?.joined ?? originalData.joined,
      earnings: cleaner.earnings ?? fetchedCleaner?.earnings ?? originalData.earnings,
    };
  }, [cleaner, fetchedCleaner, kycData, originalData]);

  // If we navigate between cleaners, reset avatar failure state.
  useEffect(() => {
    setAvatarFailed(false);
  }, [cleanerId]);

  const totalEarningsFromJobs = useMemo(() => {
    const getJobAmount = (job) =>
      Number(
        job?.cleanerQuote?.price ??
        job?.acceptedQuoteId?.price ??
        job?.amount ??
        job?.price ??
        0
      ) || 0;

    const isCompletedJob = (job) => {
      const status = (job?.status || job?.jobStatus || "").toString().toLowerCase();
      return status === "completed" || status === "done";
    };

    return (cleanerJobs || []).filter(isCompletedJob).reduce((sum, job) => sum + getJobAmount(job), 0);
  }, [cleanerJobs]);

  const tier = (cleanerTier || displayCleaner.tier || displayCleaner.badge || "Silver").toString();
  const tierLabel = `${tier.charAt(0).toUpperCase()}${tier.slice(1).toLowerCase()} Tier`;

  const tierIcon =
    tier.toLowerCase() === "gold"
      ? goldTierIcon
      : tier.toLowerCase() === "bronze"
        ? bronzeTierIcon
        : silverTierIcon;

  const closeModal = () => setActiveAction(null);

  const locationLabel = useMemo(() => {
    const d = displayCleaner || {};
    const kyc = d.kyc || {};

    // 1. Try to get City/Suburb and State from ANY potential nested object
    const city =
      kyc.city || kyc.suburb || kyc.location?.city || kyc.location?.suburb ||
      d.city || d.suburb || d.location?.city || d.address?.city || d.address?.suburb ||
      d.profile?.address?.city || d.profile?.address?.suburb;

    const state =
      kyc.state || kyc.location?.state || kyc.address?.state ||
      d.state || d.location?.state || d.address?.state ||
      d.profile?.address?.state;

    // 2. If we have both, show "City, State" (e.g., "Surat, Gujarat")
    if (city && state) {
      return `${city}, ${state}`;
    }

    // 3. Fallback to extracting from fullAddress if possible, or just the fullAddress
    const full = kyc.location?.fullAddress || kyc.fullAddress || d.location?.fullAddress || d.fullAddress || d.address?.fullAddress;
    if (full) {
      const parts = full.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        // e.g., ["...", "Surat", "Gujarat 394105", "India"]
        const cityPart = parts[parts.length - 3];
        let statePart = parts[parts.length - 2];
        statePart = statePart.replace(/[0-9]/g, '').trim(); // Remove postal codes
        return `${cityPart}, ${statePart}`;
      } else if (parts.length === 2) {
        let statePart = parts[0].replace(/[0-9]/g, '').trim();
        return statePart || full;
      }
      return full;
    }

    // 4. Ultimate fallback
    return city || state || "N/A";
  }, [displayCleaner]);

  const tabs = [
    { id: "overview", label: "Overview (Default)", shortLabel: "Overview" },
    { id: "documents", label: "Documents & KYC", shortLabel: "Documents" },
    { id: "jobHistory", label: "Job History", shortLabel: "Jobs" },
    { id: "subscriptions", label: "Subscriptions", shortLabel: "Subscriptions" },
    { id: "feedback", label: "Feedback & Ratings", shortLabel: "Feedback" },
  ];

  if (selectedJob) {
    return (
      <JobDetails
        job={selectedJob}
        onBackToList={() => {
          setSelectedJob(null);
          if (onJobViewDetail) onJobViewDetail(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto ">

      {/* Profile header */}
      <div
        className="px-4 md:px-6 lg:px-10 pt-8 md:pt-10 pb-6 relative overflow-hidden bg-white rounded-[20px] border border-[#EEF0F5] "
        style={{
          backgroundImage: `url(${approvalsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top-right actions menu */}
        <div className="absolute top-4 right-4">
          <CustomMenu
            align="right"
            items={[
              {
                id: "suspend",
                label: "Suspend",
                icon: <Ban size={18} className="text-[#9CA3AF]" />,
                onClick: () => {
                  setActiveAction("suspend");
                },
              },
            ]}
          />
        </div>

        <div className="relative flex flex-col items-center text-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] border-[#EBF2FD] shadow-sm mb-1 bg-white flex items-center justify-center">
            {displayCleaner.avatar && isValidImageUrl(displayCleaner.avatar) && !avatarFailed ? (
              <img
                src={displayCleaner.avatar}
                alt={displayCleaner.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: getAvatarColor(displayCleaner.name, cleanerId) }}
              >
                <span className="text-white font-semibold text-lg">
                  {getInitials(displayCleaner.firstName, displayCleaner.lastName, displayCleaner.name)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Name + role in a single row */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h2 className="text-base md:text-lg font-semibold text-primary">
                {displayCleaner.name}
              </h2>
              {/* {displayCleaner.role && (
                <span className="text-xs md:text-sm text-[#9CA3AF]">
                  • {displayCleaner.role}
                </span>
              )} */}
            </div>

            {/* Joined date, jobs completed, location */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-1 text-xs md:text-sm text-primary-light font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="md:w-[14px] md:h-[14px]" />
                <span>{locationLabel}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={12} className="md:w-[14px] md:h-[14px]" />
                <span>Jobs Completed: {jobsCompleted}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
                <span>Joined: {displayCleaner.joined || "N/A"}</span>
              </span>
            </div>
          </div>          

          {/* Rating & Tier */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-[#FFF4E0] border border-[#F6B10033] text-[#F6B100]">
              <Star size={12} className="md:w-[12px] md:h-[12px] text-[#F6B100] fill-[#F59E0B]" />
              <span className="text-sm">
                {Number(averageRating || 0).toFixed(1)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]">
              <img src={tierIcon} alt={tierLabel} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-sm">{tierLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - No background, border, or shadow */}
      <div className="border-b border-[#EEF0F5] ">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 md:px-3 lg:px-6 py-2 md:py-2.5 lg:py-3 text-xs md:text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer flex-shrink-0 ${activeTab === tab.id
                ? "border-[#1F6FEB] text-[#1F6FEB] font-medium"
                : "border-transparent text-[#78829D] hover:text-primary"
                }`}
            >
              <span className="md:hidden">{tab.shortLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>



      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            cleaner={displayCleaner}
            jobsCompleted={jobsCompleted}
            averageRating={averageRating}
            jobs={cleanerJobs}
            totalEarnings={totalEarningsFromJobs}
            onViewJobHistory={() => setActiveTab("jobHistory")}
            loading={loadingJobs}
          />
        )}
        {activeTab === "documents" && <DocumentsTab cleaner={cleaner} />}
        {activeTab === "jobHistory" && (
          <JobHistoryTab
            cleaner={cleaner}
            jobs={cleanerJobs}
            onViewJob={(job) => {
              const amount = job.amount || 0;
              const platformFees = Math.round(amount * 0.15 * 100) / 100;
              const gst = Math.round(amount * 0.1 * 100) / 100;
              const escrow = Math.max(amount - (platformFees + gst), 0);

              const mappedJob = {
                ...job,
                jobType: job.jobType || "Cleaning",
                jobStatus: job.status || job.jobStatus || "Completed",
                paymentStatus: job.paymentStatus || job.status || "Held",
                date: job.date || job.joined,
                amountPaid: amount,
                customer: {
                  name: job.customer?.name,
                  email: job.customer?.email,
                  phone: job.customer?.phone,
                  avatar: job.customer?.avatar,
                },
                cleaner: {
                  name: cleaner.name,
                  avatar: cleaner.avatar,
                  role: job.role || cleaner.role || "Professional Cleaner",
                  jobsCompleted: cleaner.jobs,
                  rating: cleaner.rating,
                  tier: cleaner.badge,
                },
                payment: {
                  amountPaid: amount,
                  platformFees,
                  gst,
                  escrow,
                  escrowReleased: job.date || job.joined,
                  escrowStatus: job.paymentStatus || job.status || "Held",
                },
              };
              setSelectedJob(mappedJob);
              if (onJobViewDetail) onJobViewDetail(true);
            }}
          />
        )}
        {activeTab === "subscriptions" && (
          <SubscriptionsTab
            cleanerId={cleanerId}
          />
        )}
        {activeTab === "feedback" && (
          <FeedbackTab
            cleaner={displayCleaner}
            averageRating={averageRating}
            reviews={reviews}
            pagination={reviewsPagination}
          />
        )}
      </div>

      {/* Global action modal for Approve / Reject / Suspend */}
      {activeAction && (
        <ActionModal
          isOpen={!!activeAction}
          onClose={closeModal}
          illustration={
            <img
              src={
                activeAction === "approve"
                  ? approveKycImg
                  : activeAction === "reject"
                    ? rejectKycImg
                    : suspenseKycImg
              }
              alt={
                activeAction === "approve"
                  ? "Approve KYC"
                  : activeAction === "reject"
                    ? "Reject application"
                    : "Suspend cleaner"
              }
              className="max-h-52 w-auto"
            />
          }
          title={
            activeAction === "approve"
              ? `Approve ${cleaner.name} as Professional Cleaner?`
              : activeAction === "reject"
                ? "Reject Application"
                : `Suspend ${cleaner.name}`
          }
          description={
            activeAction === "approve"
              ? "This will enable her to receive jobs in her radius (0–20 km)."
              : activeAction === "reject"
                ? `Are you sure you want to reject application of ${cleaner.name}?`
                : `Are you sure you want to suspend ${cleaner.name}?`
          }
          primaryLabel={
            activeAction === "approve"
              ? "Approve KYC"
              : activeAction === "reject"
                ? "Yes, Reject"
                : "Yes, Suspend"
          }
          primaryVariant={
            activeAction === "approve" ? "primary" : "danger"
          }
          onPrimary={async () => {
            if (activeAction === "suspend") {
              try {
                setSaving(true);
                await suspendUser(cleanerId);
                closeModal();
                if (onBackToList) {
                  onBackToList();
                }
              } catch (e) {
                console.error("Failed to suspend cleaner", e);
                alert(e?.response?.data?.message || e?.message || "Failed to suspend cleaner.");
              } finally {
                setSaving(false);
              }
              return;
            }
            // Other actions (approve/reject) logic should go here if needed.
            // For now, based on instructions, we are only wiring up suspend.
            closeModal();
          }}
          hideSecondary={true}
        />
      )}
    </div>
  );
}

