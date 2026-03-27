import { Star, Flag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const formatShortDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

export default function FeedbackTab({ cleaner, averageRating = 0, reviews = [], pagination }) {
    const renderStars = (rating, starSize = 16) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        size={starSize}
                        className="text-[#F6B100] fill-[#F6B100]"
                    />
                ))}
                {hasHalfStar && (
                    <Star
                        size={starSize}
                        className="text-[#F6B100] fill-[#F6B100]"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                    />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        size={starSize}
                        className="text-[#D1D5DB] fill-none"
                    />
                ))}
            </div>
        );
    };

    const handleFlagReview = (feedbackId) => {
        // TODO: Implement flag review functionality
        console.log("Flag review for feedback:", feedbackId);
    };

    const mappedReviews = (Array.isArray(reviews) ? reviews : []).map((r) => {
        const customerName = r?.customer?.name || "Customer";
        const title = r?.job?.serviceType || "Job";
        const dateLabel = formatShortDate(r?.job?.scheduledDate || r?.createdAt);
        const tags = Array.isArray(r?.likedAspects) ? r.likedAspects : [];
        const feedbackText = (r?.feedback || "").toString().trim();
        return {
            id: r?.id || r?._id,
            title: dateLabel ? `${title} • ${dateLabel}` : title,
            rating: Number(r?.rating || 0),
            tags,
            feedback: feedbackText || "",
            customer: {
                name: customerName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`,
            },
        };
    });

    return (
        <div className="space-y-6">
            {/* Average Rating Card + Feedback Cards */}
            <div className="flex flex-col md:flex-row gap-4 -mx-1 px-1 items-stretch">

                {/* ⭐ Average Rating Summary Card (same height as others) */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 lg:p-6
        w-full md:w-[260px] lg:w-[320px] h-[180px] sm:h-[180px] md:h-[200px] lg:h-[220px] flex-shrink-0 flex flex-col justify-center 
        items-center">

                    <p className="text-sm md:text-sm font-medium text-primary-light mb-2 md:mb-3">
                        Avg rating
                    </p>

                    <div className="space-y-2 md:space-y-3 flex flex-col items-center">
                        <div>{renderStars(averageRating, 32)}</div>
                        <p className="text-2xl font-semibold text-primary">{Number(averageRating || 0).toFixed(1)}</p>
                        {pagination?.totalReviews !== undefined && (
                            <p className="text-xs text-primary-light font-medium">
                                {pagination.totalReviews} reviews
                            </p>
                        )}
                    </div>
                </div>

                {/* ⭐ Feedback Cards Swiper */}
                <div className="flex-1 min-w-0 flex items-stretch overflow-visible">
                    {mappedReviews.length === 0 ? (
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-sm text-primary-light w-full h-[150px] md:h-[180px] lg:h-[212px] flex items-center justify-center">
                            No reviews found for this cleaner.
                        </div>
                    ) : (
                        <Swiper
                            modules={[Autoplay]}
                            spaceBetween={12}
                            slidesPerView="auto"
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            loop={mappedReviews.length > 1}
                            className="!overflow-hidden !flex h-[180px] sm:h-[180px] md:h-[200px] lg:h-[220px] w-full"
                            style={{ display: "flex", alignItems: "stretch" }}
                        >
                            {mappedReviews.map((feedback) => (
                                <SwiperSlide
                                    key={feedback.id}
                                    className="h-full flex !w-[260px] md:!w-[280px] lg:!w-[320px]"
                                    style={{ height: "100%", display: "flex" }}
                                >
                                    {/* ⭐ Feedback Card (same height as Avg Rating card) */}
                                    <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-3 md:p-4
                                        w-full h-full flex flex-col cursor-pointer overflow-hidden">

                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-1 md:mb-2 gap-1 md:gap-2">
                                            <h3 className="text-sm lg:text-[15px] font-semibold text-primary-light flex-1 truncate">
                                                {feedback.title}
                                            </h3>
                                        </div>

                                        {/* Feedback Text */}
                                        <p className="text-[11px] md:text-xs lg:text-sm text-primary mb-1 md:mb-2 flex-grow line-clamp-2 md:line-clamp-3 overflow-hidden leading-snug">
                                            {feedback.feedback}
                                        </p>

                                        {/* Stars and Rating */}
                                        <div className="flex items-center gap-2 mb-1 md:mb-2 flex-shrink-0">
                                            <div className="scale-75 md:scale-90 lg:scale-100 origin-left">
                                                {renderStars(feedback.rating)}
                                            </div>
                                            <span className="text-[11px] md:text-xs lg:text-sm font-medium text-primary">
                                                {Number(feedback.rating || 0).toFixed(1)}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 md:gap-1.5 lg:gap-2 mb-2 flex-shrink-0">
                                            {feedback.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-1.5 md:px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[9px] md:text-[10px] lg:text-xs 
                                                        font-medium bg-[#EBF2FD] text-[#2563EB] border border-[#2563EB33] whitespace-nowrap 
                                                        ${index === 2 ? "hidden lg:inline-flex" : "inline-flex"}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Customer Info */}
                                        <div className="flex items-center justify-end gap-2 pt-1.5 md:pt-2 border-t border-[#E5E7EB] flex-shrink-0">
                                            <img
                                                src={feedback.customer.avatar}
                                                alt={feedback.customer.name}
                                                className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full object-cover"
                                            />
                                            <span className="text-[11px] md:text-xs lg:text-sm font-medium text-primary">
                                                {feedback.customer.name}
                                            </span>
                                        </div>

                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>
        </div>

    );
}

