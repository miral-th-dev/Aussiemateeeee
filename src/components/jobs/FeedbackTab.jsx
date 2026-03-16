import { useState, useEffect } from "react";
import { Flag } from "lucide-react";
import { fetchJobReviewStatus } from "../../api/services/jobService";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";

export default function FeedbackTab({ jobDetails, renderStars }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getReviewStatus = async () => {
            try {
                const jobId = jobDetails._id || jobDetails.id;
                if (!jobId) return;

                const response = await fetchJobReviewStatus(jobId);
                if (response.success && response.data.existingReview) {
                    setReview(response.data.existingReview);
                }
            } catch (error) {
                console.error("Error fetching review status:", error);
            } finally {
                setLoading(false);
            }
        };

        getReviewStatus();
    }, [jobDetails]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-sm p-10 flex justify-center">
                <Loader />
            </div>
        );
    }

    // Prioritize API review data over initial jobDetails.feedback
    const reviewData = review || (jobDetails.feedback?.rating > 0 ? jobDetails.feedback : null);

    return (
        <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F1F1F4] px-4 sm:px-5 md:px-6 lg:px-4 xl:px-7 py-2 sm:py-3">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary">Feedback</h2>
                {/* <button className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 cursor-pointer flex-shrink-0 whitespace-nowrap">
                    <Flag size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Flag Review</span>
                </button> */}
            </div>

            <div className="space-y-3 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-7 py-4 sm:py-5">
                {reviewData ? (
                    <>
                        <div className="flex items-center gap-1">
                            {renderStars(reviewData.rating)}
                            <span className="text-xs sm:text-sm">{reviewData.rating}</span>
                        </div>

                        {(reviewData.feedback || reviewData.comment) && (
                            <p className="text-xs sm:text-sm text-primary">{reviewData.feedback || reviewData.comment}</p>
                        )}

                        {reviewData.likedAspects && reviewData.likedAspects.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {reviewData.likedAspects.map((aspect, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] sm:text-xs border border-blue-100">
                                        {aspect}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-xs sm:text-sm text-primary-light">No feedback available</p>
                )}

                {/* Customer Profile */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#F1F1F4]">
                    <Avatar
                        src={jobDetails.customer.avatar}
                        firstName={jobDetails.customer.firstName}
                        lastName={jobDetails.customer.lastName}
                        fullName={jobDetails.customer.name}
                        id={jobDetails.customer.id}
                        className="w-10 h-10"
                        size={40}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary">{jobDetails.customer.name}</span>
                        {(reviewData?.createdAt || jobDetails.feedback?.date) && (
                            <span className="text-xs text-primary-light">
                                {reviewData?.createdAt ? new Date(reviewData.createdAt).toLocaleDateString() : jobDetails.feedback.date}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

