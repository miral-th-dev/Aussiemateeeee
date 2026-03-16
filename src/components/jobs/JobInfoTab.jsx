import { Footprints } from "lucide-react";

export default function JobInfoTab({ jobDetails }) {
    return (
        <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-xs">
            <h2 className="font-semibold text-sm sm:text-base text-primary px-4 sm:px-5 md:px-6 lg:px-7 py-3 sm:py-4 border-b border-[#F1F1F4]">Job Info</h2>

            <div className="space-y-3 px-4 sm:px-5 md:px-6 lg:px-7 py-3 sm:py-4">
                <div>
                    <p className="text-sm sm:text-base text-[#78829D] font-medium capitalize">
                        {[
                            jobDetails.jobInfo.category,
                            jobDetails.jobInfo.petType,
                            jobDetails.jobInfo.breed
                        ].filter(Boolean).join(" • ")}
                    </p>
                    {jobDetails.jobInfo.numberOfPets > 0 && (
                        <p className="text-xs sm:text-sm text-[#78829D] font-medium">
                            Number of pets: {jobDetails.jobInfo.numberOfPets}
                        </p>
                    )}
                </div>

                {jobDetails.jobInfo.serviceType && (
                    <div className="flex items-center gap-2 font-medium">
                        <Footprints size={18} className="text-primary" />
                        <span className="text-sm sm:text-base text-primary font-medium">
                            {jobDetails.jobInfo.serviceType}
                        </span>
                    </div>
                )}

                <p className="text-xs sm:text-sm text-primary-light font-medium leading-relaxed">
                    {jobDetails.jobInfo.description}
                </p>

                {jobDetails.jobInfo.images && jobDetails.jobInfo.images.length > 0 && (
                    <div className="w-full mt-4">
                        <div className="w-fit p-1.5 bg-[#EEF0F5] rounded-xl">
                            <div className="flex flex-wrap gap-2">
                                {jobDetails.jobInfo.images.map((img, index) => (
                                    <a
                                        key={index}
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="aspect-square w-20 md:w-27 rounded-lg overflow-hidden border border-white/50 cursor-pointer transition-transform hover:scale-105"
                                        title="Click to view full image"
                                    >
                                        <img
                                            src={img}
                                            alt={`Job photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}