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
  let status = "In Progress";
  
  if (statusRaw === "completed" || statusRaw === "done") status = "Completed";
  else if (statusRaw === "cancelled" || statusRaw === "canceled" || statusRaw === "rejected") status = "Cancelled";
  else if (statusRaw === "on_the_way" || statusRaw === "in_progress") status = "In Progress";

  const locationObj = job?.location || {};
  const location =
    locationObj?.fullAddress ||
    locationObj?.address ||
    [locationObj?.city, locationObj?.state].filter(Boolean).join(", ") ||
    "N/A";

  const amount =
    job?.acceptedQuoteId?.price ??
    job?.customerQuote?.price ??
    job?.amount ??
    job?.price ??
    0;

  return {
    id: job?._id || job?.id || job?.jobId,
    jobId: job?.jobId || job?._id || "N/A",
    categoryName: job?.categoryId?.name || "Cleaning",
    serviceTypeName: job?.serviceTypeId?.name || job?.serviceTypeDisplay || "Job Detail",
    price: Number(amount || 0),
    status,
    rawStatus: statusRaw,
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
                    className="h-full flex !w-[220px] md:!w-[300px]"
                    style={{ height: "100%", display: "flex" }}
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-2.5 w-full h-full shadow-sm flex flex-col hover:border-primary/20 transition-all group">
                      {/* Status Badge */}
                      <div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 ${
                            job.status === "Completed"
                              ? "bg-[#EAFFF1] text-[#17C653] border border-[#17C65333]"
                              : job.status === "Cancelled"
                                ? "bg-[#FFEEF3] text-[#F8285A] border border-[#F8285A33]"
                                : "bg-[#FFF8DD] text-[#F6B100] border border-[#F6B10033]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              job.status === "Completed" ? "bg-[#17C653]" : job.status === "Cancelled" ? "bg-[#F8285A]" : "bg-[#F6B100]"
                            }`}
                          />
                          {job.status}
                        </span>
                      </div>

                      {/* Category & Service Type */}
                      <div className="space-y-0.5">
                        <p className="text-[#80849C] font-medium text-[11px] md:text-xs tracking-wide">
                          {job.categoryName}
                        </p>
                        <h4 className="text-[#071437] font-medium text-sm md:text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {job.serviceTypeName}
                        </h4>
                      </div>

                      {/* Footer Info */}
                      <div className="space-y-1.5 mt-1.5">
                        <div className="flex items-center gap-2 text-[#7E8299]">
                          <MapPin size={14} className="text-[#A1A5B7] flex-shrink-0" />
                          <span className="text-[11px] md:text-xs font-medium truncate">
                            {job.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#7E8299]">
                          <Calendar size={14} className="text-[#A1A5B7] flex-shrink-0" />
                          <span className="text-[11px] md:text-xs font-medium">
                            {job.date}
                          </span>
                        </div>
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

