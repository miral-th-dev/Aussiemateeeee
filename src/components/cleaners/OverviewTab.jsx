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

                                        <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 space-y-1.5 md:space-y-2 w-full h-full shadow-xs flex flex-col">

                                            {/* Type & Status */}
                                            <div>
                                                <span
                                                    className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 ${isAccepted
                                                        ? "bg-[#E1F0FF] text-[#1B84FF] border border-[#1B84FF33]"
                                                        : isInProgress
                                                            ? "bg-[#FFF8DD] text-[#F6B100] border border-[#F6B10033]"
                                                            : "bg-[#EAFFF1] text-[#17C653] border border-[#17C65333]"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isAccepted ? "bg-[#1B84FF]" : isInProgress ? "bg-[#F6B100]" : "bg-[#17C653]"
                                                            }`}
                                                    />
                                                    {statusLabel}
                                                </span>
                                                <p className="text-primary font-medium mb-1 truncate text-xs md:text-sm">
                                                    {(job.type || "Job")} • {(job.subType || "Service")}
                                                </p>

                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-medium text-primary-light">
                                                <MapPin size={10} className="md:w-3 md:h-3 flex-shrink-0" />
                                                <span className="truncate min-w-0">{job.location || "N/A"}</span>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-medium text-primary-light">
                                                <Calendar size={10} className="md:w-3 md:h-3 flex-shrink-0" />
                                                <span>{formatShortDate(job.date)}</span>
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
