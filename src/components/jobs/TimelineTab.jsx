import { Clock } from "lucide-react";

export default function TimelineTab({ jobDetails, highlightUserNames }) {
    return (
        <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-xs p-4 sm:p-5 md:p-6 lg:p-4 xl:p-7">
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {jobDetails.timeline.map((item, index) => {
                    const eventParts = highlightUserNames(item.event);
                    return (
                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                            <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-primary break-words">
                                    {eventParts.map((part, partIndex) => (
                                        <span
                                            key={partIndex}
                                            style={part.isName ? { color: "#1F6FEB" } : {}}
                                        >
                                            {part.text}
                                        </span>
                                    ))}
                                </p>
                                <p className="text-xs text-primary-light mt-1">{item.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

