import timelineSvg from "../../assets/icon/timeline.svg";

export default function TimelineTab({ jobDetails, highlightUserNames }) {
    return (
        <div className="bg-white rounded-xl border border-[#EEF0F5] shadow-xs p-4 sm:p-5 md:p-6 lg:p-4 xl:p-7">
            <div className="space-y-0">
                {jobDetails.timeline.map((item, index) => {
                    const eventParts = highlightUserNames(item.event);

                    return (
                        <div key={index} className="relative flex items-start gap-4 pb-7.5 last:pb-2">
                            {/* Vertical Line */}
                            {index !== jobDetails.timeline.length - 1 && (
                                <div className="absolute left-[18px] top-[36px] w-[1.5px] h-[calc(100%-36px)] bg-[#E9E9EB]"></div>
                            )}


                            {/* Indicator SVG */}
                            <div className="flex-shrink-0 z-10">
                                <img src={timelineSvg} alt="timeline" className="w-[36px] h-[36px]" />
                            </div>

                            <div className="flex-1 min-w-0 pt-1.5">
                                <p className=" text-primary font-medium text-sm leading-tight break-words">
                                    {eventParts.map((part, partIndex) => (
                                        <span
                                            key={partIndex}
                                            style={part.isName ? { color: "#1F6FEB" } : {}}
                                        >
                                            {part.text}
                                        </span>
                                    ))}
                                </p>
                                <p className="text-[12px] text-[#868A9A] font-medium">
                                    {item.time}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


