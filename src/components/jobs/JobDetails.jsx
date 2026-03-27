import { useEffect, useState } from "react";
import { Star, MoreVertical } from "lucide-react";
import OverviewTab from "./OverviewTab";
import JobInfoTab from "./JobInfoTab";
import TimelineTab from "./TimelineTab";
import FeedbackTab from "./FeedbackTab";
import AttachmentsTab from "./AttachmentsTab";
import PageHeader from "../../layout/PageHeader";
import { fetchJobById } from "../../api/services/jobService";

export default function JobDetails({ job, onBackToList, onPaymentStatusUpdate }) {
    const [jobData, setJobData] = useState(job || null);

    // Fetch full job details by ID when we have a lightweight job object
    useEffect(() => {
        const loadJobDetails = async () => {
            if (!job) return;

            // We only skip fetching if we already have the full details (status, location, and cleaner role)
            const currentRole =
                job.originalData?.completedBy?.role ||
                job.originalData?.acceptedCleaner?.role ||
                (Array.isArray(job.originalData?.quotes) && (job.originalData.quotes[0]?.cleaner?.role || job.originalData.quotes[0]?.cleanerId?.role)) ||
                job.role ||
                job.cleaner?.role;

            if (job.originalData && job.originalData.status && job.originalData.location && currentRole) {
                setJobData(job.originalData);
                return;
            }

            const id = job._id || job.id || job.jobId;
            if (!id) return;

            try {
                const fullJob = await fetchJobById(id);
                if (fullJob) {
                    setJobData(fullJob);
                }
            } catch (error) {
                console.warn("Failed to load full job details", error);
            }
        };

        loadJobDetails();
    }, [job]);

    // Use originalData if available, otherwise use jobData or job
    const sourceJob = jobData?.originalData || jobData || job?.originalData || job;
    if (!sourceJob) return null;

    // Derive payment figures when only summary data is available from JobsTable
    // Prefer explicit payment data, fall back to accepted quote price
    const acceptedQuote = (() => {
        if (Array.isArray(sourceJob.quotes)) {
            // Find by status or ID match
            const quoteId = sourceJob.acceptedQuoteId?._id || sourceJob.acceptedQuoteId;
            return sourceJob.quotes.find((q) => q.status === "accepted") ||
                sourceJob.quotes.find((q) => q._id === quoteId) ||
                sourceJob.quotes[0];
        }
        return typeof sourceJob.acceptedQuoteId === 'object' ? sourceJob.acceptedQuoteId : null;
    })();

    const amountPaid =
        sourceJob?.payment?.amountPaid ??
        sourceJob?.amountPaid ??
        acceptedQuote?.price ??
        0;
    const platformFees =
        sourceJob?.payment?.platformFees ?? Math.round(amountPaid * 0.15 * 100) / 100;
    const gst = sourceJob?.payment?.gst ?? Math.round(amountPaid * 0.1 * 100) / 100;
    const escrow =
        sourceJob?.payment?.escrow ?? Math.max(amountPaid - (platformFees + gst), 0);
    const escrowReleased = sourceJob?.payment?.escrowReleased || sourceJob?.date || "20-09-2025";

    const jobDetails = {
        _id: sourceJob?._id || sourceJob?.id,
        jobId: sourceJob?.jobId || "AM10432",
        serviceTypeDisplay: sourceJob?.serviceTypeDisplay || sourceJob?.jobType || "Cleaning",
        jobTitle:
            sourceJob?.jobTitle ||
            sourceJob?.serviceTypeDisplay ||
            sourceJob?.serviceType ||
            sourceJob?.jobType ||
            "Cleaning",
        jobType: sourceJob?.jobType || sourceJob?.serviceTypeDisplay || "Cleaning",
        category:
            sourceJob?.category ||
            sourceJob?.serviceTypeDisplay ||
            sourceJob?.serviceType ||
            sourceJob?.jobType ||
            "Cleaning",
        datePosted:
            sourceJob?.datePosted ||
            (sourceJob?.createdAt
                ? new Date(sourceJob.createdAt).toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : sourceJob?.date || "19-09-2025"),
        postedBy: sourceJob?.postedBy || sourceJob?.customer?.fullName || sourceJob?.customerId?.fullName || "—",
        status: (() => {
            const rawStatus = sourceJob?.status || sourceJob?.jobStatus || "Upcoming";
            const statusLower = rawStatus.toLowerCase().trim();

            // Map backend statuses to frontend display statuses
            if (statusLower === "posted" || statusLower === "quoted" || statusLower === "accepted" || statusLower === "accept") {
                return "Upcoming";
            }
            if (statusLower === "in_progress" || statusLower === "in-progress" || statusLower === "started" ||
                statusLower === "pending_customer_confirmation" || statusLower === "pending-customer-confirmation") {
                return "Ongoing";
            }
            if (statusLower === "completed" || statusLower === "complete" || statusLower === "done" || statusLower === "finished") {
                return "Completed";
            }
            if (statusLower === "cancelled" || statusLower === "canceled" || statusLower === "cancel") {
                return "Cancelled";
            }

            // Return capitalized version if it matches one of our statuses
            const capitalized = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
            if (["Completed", "Ongoing", "Upcoming", "Cancelled"].includes(capitalized)) {
                return capitalized;
            }

            return "Upcoming"; // Default
        })(),
        customer: {
            id: sourceJob?.customer?._id || sourceJob?.customerId?._id || sourceJob?.customer?.id || sourceJob?.customerId?.id || job?.customer?.id,
            firstName: sourceJob?.customer?.firstName || sourceJob?.customerId?.firstName || "",
            lastName: sourceJob?.customer?.lastName || sourceJob?.customerId?.lastName || "",
            name:
                sourceJob?.customer?.fullName ||
                sourceJob?.customer?.name ||
                (sourceJob?.customer?.firstName || sourceJob?.customerId?.firstName
                    ? `${sourceJob.customer?.firstName || sourceJob.customerId?.firstName || ""} ${sourceJob.customer?.lastName || sourceJob.customerId?.lastName || ""}`.trim()
                    : null) ||
                sourceJob?.customerName ||
                sourceJob?.postedBy ||
                job?.customer?.name ||
                "Customer",
            email:
                sourceJob?.customer?.email ||
                sourceJob?.customerId?.email ||
                sourceJob?.customerEmail ||
                job?.customer?.email ||
                "—",
            phone:
                sourceJob?.customer?.phone ||
                sourceJob?.customerId?.phone ||
                sourceJob?.customerPhone ||
                job?.customer?.phone ||
                "—",
            avatar:
                sourceJob?.customer?.profilePhoto?.url ||
                sourceJob?.customerId?.profilePhoto?.url ||
                sourceJob?.customer?.avatar ||
                sourceJob?.customerId?.avatar ||
                job?.customer?.avatar,
        },
        cleaner: {
            id: sourceJob?.completedBy?._id || sourceJob?.acceptedCleaner?._id || acceptedQuote?.cleaner?._id || acceptedQuote?.cleanerId?._id || sourceJob?.acceptedQuoteId?.cleanerId?._id || job?.cleaner?.id,
            firstName: sourceJob?.completedBy?.firstName || acceptedQuote?.cleaner?.firstName || sourceJob?.acceptedCleaner?.firstName || sourceJob?.acceptedQuoteId?.cleanerId?.firstName || "",
            lastName: sourceJob?.completedBy?.lastName || acceptedQuote?.cleaner?.lastName || sourceJob?.acceptedCleaner?.lastName || sourceJob?.acceptedQuoteId?.cleanerId?.lastName || "",
            name:
                (() => {
                    const firstName = sourceJob?.completedBy?.firstName || acceptedQuote?.cleaner?.firstName || sourceJob?.acceptedCleaner?.firstName || sourceJob?.acceptedQuoteId?.cleanerId?.firstName;
                    const lastName = sourceJob?.completedBy?.lastName || acceptedQuote?.cleaner?.lastName || sourceJob?.acceptedCleaner?.lastName || sourceJob?.acceptedQuoteId?.cleanerId?.lastName;
                    if (firstName || lastName) return `${firstName || ""} ${lastName || ""}`.trim();
                    return sourceJob?.acceptedCleaner?.fullName || sourceJob?.acceptedCleaner?.name || sourceJob?.cleaner?.name || job?.cleaner?.name || "Cleaner";
                })(),
            role:
                (() => {
                    const role =
                        sourceJob?.completedBy?.role ||
                        acceptedQuote?.cleaner?.role ||
                        acceptedQuote?.cleanerId?.role ||
                        sourceJob?.acceptedQuoteId?.cleanerId?.role ||
                        sourceJob?.acceptedQuoteId?.cleaner?.role ||
                        sourceJob?.acceptedCleaner?.role ||
                        sourceJob?.cleaner?.role ||
                        sourceJob?.role ||
                        job?.cleaner?.role;

                    if (role) return role;
                    return "";
                })(),
            rating:
                sourceJob?.completedBy?.averageRating ??
                sourceJob?.acceptedCleaner?.averageRating ??
                acceptedQuote?.cleaner?.averageRating ??
                acceptedQuote?.cleanerId?.averageRating ??
                sourceJob?.acceptedQuoteId?.cleanerId?.averageRating ??
                sourceJob?.acceptedQuoteId?.cleaner?.averageRating ??
                sourceJob?.cleaner?.rating ??
                job?.cleaner?.rating ??
                0,
            jobsCompleted:
                sourceJob?.completedBy?.completedJobs ??
                sourceJob?.acceptedCleaner?.completedJobs ??
                acceptedQuote?.cleaner?.completedJobs ??
                acceptedQuote?.cleanerId?.completedJobs ??
                sourceJob?.acceptedQuoteId?.cleanerId?.completedJobs ??
                sourceJob?.acceptedQuoteId?.cleaner?.completedJobs ??
                sourceJob?.cleaner?.jobsCompleted ??
                job?.cleaner?.jobsCompleted ??
                0,
            searchRadius:
                sourceJob?.acceptedCleaner?.searchRadius ??
                acceptedQuote?.cleaner?.searchRadius ??
                acceptedQuote?.cleanerId?.searchRadius ??
                sourceJob?.acceptedQuoteId?.cleanerId?.searchRadius ??
                sourceJob?.acceptedQuoteId?.cleaner?.searchRadius,
            distance:
                sourceJob?.cleaner?.distance ||
                job?.cleaner?.distance ||
                (sourceJob?.acceptedCleaner?.searchRadius || acceptedQuote?.cleaner?.searchRadius
                    ? `${sourceJob?.acceptedCleaner?.searchRadius || acceptedQuote?.cleaner?.searchRadius} km distance radius`
                    : "—"),
            tier:
                sourceJob?.completedBy?.tier ||
                sourceJob?.acceptedCleaner?.tier ||
                acceptedQuote?.cleaner?.tier ||
                acceptedQuote?.cleanerId?.tier ||
                sourceJob?.acceptedQuoteId?.cleanerId?.tier ||
                sourceJob?.acceptedQuoteId?.cleaner?.tier ||
                sourceJob?.cleaner?.tier ||
                job?.cleaner?.tier ||
                "Silver",
            avatar:
                sourceJob?.completedBy?.profilePhoto?.url ||
                sourceJob?.acceptedCleaner?.profilePhoto?.url ||
                acceptedQuote?.cleaner?.profilePhoto?.url ||
                acceptedQuote?.cleanerId?.profilePhoto?.url ||
                sourceJob?.acceptedQuoteId?.cleanerId?.profilePhoto?.url ||
                sourceJob?.acceptedQuoteId?.cleaner?.profilePhoto?.url ||
                sourceJob?.acceptedCleaner?.avatar ||
                acceptedQuote?.cleaner?.avatar ||
                acceptedQuote?.cleanerId?.avatar ||
                sourceJob?.acceptedQuoteId?.cleanerId?.avatar ||
                sourceJob?.acceptedQuoteId?.cleaner?.avatar ||
                sourceJob?.cleaner?.avatar ||
                job?.cleaner?.avatar,
        },
        payment: {
            mode: sourceJob?.payment?.mode || job?.payment?.mode || "Online",
            amountPaid,
            platformFees,
            gst,
            escrow,
            escrowReleased,
            escrowStatus:
                sourceJob?.payment?.escrowStatus ||
                sourceJob?.paymentStatus ||
                job?.paymentStatus ||
                "Released",
        },
        jobInfo: {
            category:
                sourceJob?.serviceTypeDisplay ||
                sourceJob?.jobType ||
                sourceJob?.jobInfo?.category ||
                "Cleaning",
            petType: sourceJob?.petType || sourceJob?.jobInfo?.petType || "",
            breed: sourceJob?.petBreed || sourceJob?.jobInfo?.breed || "",
            numberOfPets: sourceJob?.numberOfPets ?? sourceJob?.jobInfo?.numberOfPets ?? 0,
            serviceType:
                sourceJob?.serviceDetail ||
                sourceJob?.jobInfo?.serviceType ||
                sourceJob?.serviceTypeDisplay ||
                sourceJob?.serviceType ||
                sourceJob?.jobType ||
                "Service",
            description:
                sourceJob?.jobInfo?.description ||
                sourceJob?.instructions ||
                sourceJob?.description ||
                "Make sure you come prepared with all you need for this service",
            images:
                sourceJob?.jobInfo?.images ||
                (Array.isArray(sourceJob?.photos) && sourceJob.photos.length > 0
                    ? sourceJob.photos.map((photo) => photo.url || photo)
                    : []),
        },
        timeline:
            (Array.isArray(sourceJob?.timeline) && sourceJob.timeline.length > 0)
                ? sourceJob.timeline.map((item) => ({
                    event: item.label || item.title || "",
                    status: item.status || "",
                    time: (item.date || item.timestamp)
                        ? new Date(item.date || item.timestamp).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        }).replace(/\//g, "-")
                        : "",
                }))
                : (Array.isArray(sourceJob?.activity) && sourceJob.activity.length > 0)
                    ? sourceJob.activity.map((item) => ({
                        event: item.title || item.label || "",
                        status: item.status || "",
                        time: (item.timestamp || item.date)
                            ? new Date(item.timestamp || item.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }).replace(/\//g, "-")
                            : "",
                    }))
                    : [
                        { event: "Job created", time: "" },
                    ],



        feedback: {
            rating: sourceJob?.review?.rating || 0,
            comment: sourceJob?.review?.comment || "",
            reviewer: sourceJob?.review?.reviewerName || sourceJob?.customer?.fullName || sourceJob?.customerId?.fullName || "",
            date: sourceJob?.review?.createdAt
                ? new Date(sourceJob.review.createdAt).toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : "",
            avatar: sourceJob?.customer?.profilePhoto?.url || sourceJob?.customerId?.profilePhoto?.url || "",
        },
        attachments: {
            beforePhotos: Array.isArray(sourceJob?.attachments?.beforePhotos) ? sourceJob.attachments.beforePhotos : [],
            afterPhotos: Array.isArray(sourceJob?.attachments?.afterPhotos) ? sourceJob.attachments.afterPhotos : [],
        },
    };

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 === 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />);
        }
        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative inline-block">
                    <Star size={16} className="text-gray-300" />
                    <div className="absolute top-0 left-0 overflow-hidden" style={{ width: "50%" }}>
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </div>
                </div>
            );
        }
        return stars;
    };

    const getStatusColor = (status) => {
        if (status === "Completed" || status === "Released") {
            return "bg-[#EAFFF1] text-[#17C653] border-[#17C65333]";
        }
        return "bg-[#FFF8DD] text-[#F6B100] border-[#F6B10033]";
    };

    const highlightUserNames = (text) => {
        const cleanerName = jobDetails.cleaner.name;
        const customerName = jobDetails.customer.name;

        // Remove trailing period if present for matching
        const cleanerNameClean = cleanerName.replace(/\.$/, "");
        const customerNameClean = customerName.replace(/\.$/, "");

        // Create regex patterns for both full names and variations
        const names = [cleanerName, cleanerNameClean, customerName, customerNameClean].filter(Boolean);

        // Sort by length (longest first) to match longer names first
        names.sort((a, b) => b.length - a.length);

        let result = text;
        const parts = [];
        let lastIndex = 0;

        // Find all matches with their positions
        const matches = [];
        names.forEach(name => {
            const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    name: match[0]
                });
            }
        });

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start);

        // Merge overlapping matches
        const mergedMatches = [];
        matches.forEach(match => {
            const lastMatch = mergedMatches[mergedMatches.length - 1];
            if (lastMatch && match.start <= lastMatch.end) {
                // Overlapping or adjacent, merge them
                lastMatch.end = Math.max(lastMatch.end, match.end);
                lastMatch.name = text.substring(lastMatch.start, lastMatch.end);
            } else {
                mergedMatches.push({ ...match });
            }
        });

        // Build the parts array
        mergedMatches.forEach(match => {
            // Add text before match
            if (match.start > lastIndex) {
                parts.push({
                    text: text.substring(lastIndex, match.start),
                    isName: false
                });
            }
            // Add highlighted name
            parts.push({
                text: match.name,
                isName: true
            });
            lastIndex = match.end;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({
                text: text.substring(lastIndex),
                isName: false
            });
        }

        // If no matches found, return original text
        if (parts.length === 0) {
            parts.push({ text, isName: false });
        }

        return parts;
    };

    const handleBack = () => {
        if (onBackToList) {
            onBackToList();
        }
    };

    return (
        <>
            <PageHeader
                title={jobDetails.jobId}
                subtitle={jobDetails.serviceTypeDisplay}
                showBackArrow={true}
                onBack={handleBack} />
            <div className="space-y-6 mx-auto w-full max-w-6xl pb-10">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

                    {/* LEFT MAIN SECTION */}
                    <div className="lg:col-span-2 space-y-6 w-full ">

                        {/* Header Card */}
                        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between rounded-[12px] 
                        p-4 sm:p-5 md:p-6 lg:p-[30px] border border-[#F1F1F4] bg-white shadow-xs gap-4 md:gap-0">

                            {/* Left Section */}
                            <div className="w-full">
                                {/* <p className="text-xs font-medium text-primary-light">Posted by</p> */}

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-semibold text-xl sm:text-2xl text-primary">
                                        {jobDetails.jobId}
                                    </span>

                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-[6px] text-[10px] sm:text-xs font-medium border 
                                        ${getStatusColor(jobDetails.status)}`}>
                                        {jobDetails.status}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm font-medium text-primary-light">
                                    {jobDetails.serviceTypeDisplay}
                                </p>
                            </div>

                            {/* Right Section */}
                            <div className="text-xs sm:text-sm font-medium text-primary-light md:text-right whitespace-nowrap">
                                Date Posted: {jobDetails.datePosted}
                            </div>
                        </div>

                        {/* Job Overview */}
                        <OverviewTab
                            jobDetails={jobDetails}
                            getStatusColor={getStatusColor}
                            onPaymentStatusUpdate={onPaymentStatusUpdate}
                        />

                        {/* Job Info */}
                        <JobInfoTab jobDetails={jobDetails} />
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-6 w-full">

                        {/* Timeline */}
                        <TimelineTab jobDetails={jobDetails} highlightUserNames={highlightUserNames} />

                        {/* Feedback */}
                        <FeedbackTab jobDetails={jobDetails} renderStars={renderStars} />

                        {/* Attachments */}
                        {/* <AttachmentsTab jobDetails={jobDetails} /> */}

                    </div>
                </div>
            </div>
        </>
    );
}
