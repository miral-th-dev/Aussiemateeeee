import { Briefcase, CheckCircle, Star, DollarSign, MapPin, Calendar } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Loader from "../common/Loader";

const formatShortDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapCustomerJobForUi = (job) => {
  const statusRaw = (job?.status || job?.jobStatus || "").toString().toLowerCase();
  const status =
    statusRaw === "completed" || statusRaw === "done"
      ? "Completed"
      : statusRaw === "cancelled" || statusRaw === "canceled"
        ? "Cancelled"
        : statusRaw === "rejected"
          ? "Cancelled"
          : "In Progress";

  const locationObj = job?.location || {};
  const location =
    locationObj?.fullAddress ||
    locationObj?.address ||
    [locationObj?.city, locationObj?.state].filter(Boolean).join(", ") ||
    "N/A";

  const service =
    job?.serviceTypeDisplay ||
    job?.serviceType ||
    job?.service ||
    job?.jobType ||
    "Service";

  const detail =
    job?.serviceDetail ||
    job?.propertyType ||
    job?.petType ||
    "";

  const amount =
    job?.acceptedQuoteId?.price ??
    job?.customerQuote?.price ??
    job?.amount ??
    job?.price ??
    0;

  return {
    id: job?._id || job?.id || job?.jobId,
    jobId: job?.jobId || job?._id || "N/A",
    service: detail ? `${service} • ${detail}` : service,
    price: Number(amount || 0),
    status,
    location,
    date: formatShortDateTime(job?.scheduledDate || job?.createdAt || job?.updatedAt),
  };
};

export default function OverviewTab({ customer, jobs = [], onViewJobs, loading = false }) {
  const handleViewJobs = () => {
    if (onViewJobs) {
      onViewJobs();
    }
  };

  // Calculate stats from customer data
  const jobsPosted = customer?.jobsPosted || (Array.isArray(jobs) ? jobs.length : 0);
  const jobsCompleted = customer?.jobsCompleted || (Array.isArray(jobs)
    ? jobs.filter((j) => ["completed", "done"].includes((j?.status || "").toString().toLowerCase())).length
    : 0);
  const avgCleanerRating = customer?.avgCleanerRating || 4.3;
  const totalSpend = (() => {
    const v = customer?.spend;
    if (v === undefined || v === null) return 0;
    if (typeof v === "number") return v;
    // handle strings like "1,240"
    const parsed = Number(v.toString().replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  })();

  const recentJobs = (Array.isArray(jobs) ? jobs : []).map(mapCustomerJobForUi).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Jobs Posted */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#EBF2FD] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <Briefcase size={20} className="text-[#2563EB]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-primary">
              {jobsPosted}
            </p>
            <p className="text-sm font-medium text-primary-light">Jobs posted</p>
          </div>
        </div>

        {/* Jobs Completed */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#EBF2FD] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-[#2563EB]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-primary">
              {jobsCompleted}
            </p>
            <p className="text-sm font-medium text-primary-light">Jobs completed</p>
          </div>
        </div>

        {/* Avg Cleaner Rating */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#EBF2FD] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <Star size={20} className="text-[#2563EB]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-primary">
              {avgCleanerRating}
            </p>
            <p className="text-sm font-medium text-primary-light">Avg Cleaner Rating</p>
          </div>
        </div>

      </div>

      {/* Recent Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary text-base md:text-base">
            Recent jobs
          </h3>
          <button
            onClick={handleViewJobs}
            className="text-sm text-primary font-medium cursor-pointer whitespace-nowrap hover:underline"
          >
            View Jobs
          </button>
        </div>
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10 bg-white border border-gray-200 rounded-xl">
              <Loader size={40} message="Loading recent jobs..." />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-primary-light">
              No jobs found for this customer.
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView="auto"
              autoplay={{ delay: 2800, disableOnInteraction: false }}
              loop={recentJobs.length > 1}
              className="!overflow-hidden !flex"
              style={{ display: "flex", alignItems: "stretch", paddingBottom: "8px" }}
            >
              {recentJobs.map((job) => {
                const isCompleted = job.status === "Completed";
                const isCancelled = job.status === "Cancelled";
                return (
                  <SwiperSlide
                    key={job.id}
                    className="h-full flex !w-[240px] md:!w-[320px]"
                    style={{ height: "100%", display: "flex" }}
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 space-y-1.5 md:space-y-2 w-full h-full shadow-sm flex flex-col cursor-pointer transition-transform">
                      {/* Top row: Job ID and Status */}
                      <div className="flex items-start justify-between mb-0 gap-2 md:gap-3">
                        
                        <span
                          className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 ${isCompleted
                            ? "bg-[#EAFFF1] text-[#17C653] border border-[#17C65333]"
                            : isCancelled
                              ? "bg-[#FEE2E2] text-[#EF4444] border border-[#EF444433]"
                              : "bg-[#FFF8DD] text-[#F6B100] border border-[#F6B10033]"
                            }`}
                        >
                          <span
                            className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${isCompleted ? "bg-[#17C653]" : isCancelled ? "bg-[#EF4444]" : "bg-[#F6B100]"
                              }`}
                          />
                          {job.status}
                        </span>
                      </div>

                      {/* Service Type */}
                      {/* <p className="text-xs md:text-sm font-medium text-primary mb-0 truncate" title={job.service}>
                        {job.service}
                      </p> */}

                      {/* Price */}
                      {/* <p className="text-sm md:text-base font-semibold text-primary mb-1 md:mb-2">
                        AU${job.price.toLocaleString()}
                      </p> */}

                      {/* Location */}
                      <div className="flex items-start gap-1 md:gap-1.5 text-[11px] md:text-sm font-medium text-primary-light min-w-0">
                        <MapPin size={12} className="flex-shrink-0 mt-0.5 md:w-[14px] md:h-[14px]" />
                        <span className="truncate min-w-0" title={job.location}>{job.location}</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-1 md:gap-1.5 text-[11px] md:text-sm font-medium text-primary-light">
                        <Calendar size={12} className="flex-shrink-0 md:w-[14px] md:h-[14px]" />
                        <span>{job.date}</span>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
}

