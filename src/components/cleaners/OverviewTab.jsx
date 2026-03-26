import { Briefcase, Star, MapPin, Calendar } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Loader from "../common/Loader";

const formatShortDate = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

export default function OverviewTab({ cleaner, jobsCompleted, averageRating, totalEarnings, jobs = [], onViewJobHistory, loading = false }) {
    const handleViewJobs = () => {
        if (onViewJobHistory) {
            onViewJobHistory();
        }
    };

    const recentJobs = Array.isArray(jobs) ? jobs.slice(0, 8) : [];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                        <Briefcase size={20} className="text-[#2563EB]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold text-primary">
                            {jobsCompleted ?? cleaner?.jobs ?? 0}
                        </p>
                        <p className="text-sm font-medium text-primary-light">Jobs completed</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                        <Star size={20} className="text-[#2563EB]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold text-primary">
                            {Number(averageRating ?? cleaner?.rating ?? 0).toFixed(1)}
                        </p>
                        <p className="text-sm font-medium text-primary-light">Avg Rating</p>
                    </div>
                </div>
                {/* <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#2563EB] font-bold text-lg">$</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold">
                            <span className="text-primary">
                                AU${Number((totalEarnings ?? cleaner?.earnings ?? 0) || 0).toLocaleString()}
                            </span>
                        </p>
                        <p className="text-sm font-medium text-primary-light">Total Earnings</p>
                    </div>
                </div> */}
            </div>

            {/* Recent Jobs Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary text-base md:text-lg">
                        Recent jobs
                    </h3>
                    <button
                        onClick={handleViewJobs}
                        className="text-sm text-primary font-medium cursor-pointer whitespace-nowrap"
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
                            No jobs found for this cleaner.
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
                                const statusLabel = job.status || "In Progress";
                                const isInProgress = statusLabel === "In Progress";
                                const isAccepted = statusLabel === "Accepted";
                                const paymentValue = Number(job.amount ?? 0);
                                return (
                                    <SwiperSlide
                                        key={job._id || job.id || job.jobId}
                                        className="h-full flex !w-[200px] md:!w-[320px]"
                                        style={{ height: "100%", display: "flex" }}
                                    >

                                        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-2.5 w-full h-full shadow-sm flex flex-col hover:border-primary/20 transition-all group">
                                            {/* Status Badge */}
                                            <div>
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 ${
                                                        job.status?.toLowerCase() === "completed"
                                                            ? "bg-[#EAFFF1] text-[#17C653] border border-[#17C65333]"
                                                            : job.status?.toLowerCase() === "cancelled"
                                                                ? "bg-[#FFEEF3] text-[#F8285A] border border-[#F8285A33]"
                                                                : job.status?.toLowerCase() === "on_the_way" || job.status?.toLowerCase() === "in_progress"
                                                                    ? "bg-[#FFF8DD] text-[#F6B100] border border-[#F6B10033]"
                                                                    : "bg-[#E1F0FF] text-[#1B84FF] border border-[#1B84FF33]"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            job.status?.toLowerCase() === "completed" ? "bg-[#17C653]" : job.status?.toLowerCase() === "cancelled" ? "bg-[#F8285A]" : job.status?.toLowerCase() === "on_the_way" || job.status?.toLowerCase() === "in_progress" ? "bg-[#F6B100]" : "bg-[#1B84FF]"
                                                        }`}
                                                    />
                                                    <span className="capitalize">{job.status?.toLowerCase().replace(/_/g, " ") || "Pending"}</span>
                                                </span>
                                            </div>

                                            {/* Category & Service Type */}
                                            <div className="space-y-0.5">
                                                <p className="text-[#80849C] font-medium text-[11px] md:text-xs tracking-wide">
                                                    {job.categoryId?.name || job.category?.name || "Cleaning"}
                                                </p>
                                                <h4 className="text-[#071437] font-medium text-sm md:text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {job.serviceTypeId?.name || job.serviceType?.name || job.jobType || "Job Detail"}
                                                </h4>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="space-y-1.5 mt-1.5">
                                                <div className="flex items-center gap-2 text-[#7E8299]">
                                                    <MapPin size={14} className="text-[#A1A5B7] flex-shrink-0" />
                                                    <span className="text-[11px] md:text-xs font-medium truncate">
                                                        {job.location?.address || job.location || "Location N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#7E8299]">
                                                    <Calendar size={14} className="text-[#A1A5B7] flex-shrink-0" />
                                                    <span className="text-[11px] md:text-xs font-medium">
                                                        {formatShortDate(job.scheduledDate || job.date || job.createdAt)}
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
