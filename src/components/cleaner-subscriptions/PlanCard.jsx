import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Users, Trash2 } from "lucide-react";
import Toggle from "../common/Toggle";
import { useNavigate } from "react-router-dom";

export default function PlanCard({ plan, onStatusChange, onDeleteClick }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm p-4 md:p-6 mb-4 relative hover:border-gray-300 transition-colors">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6 w-full">
                {/* Column 1: Info (Name, Price, Leads) */}
                <div className="w-full xl:min-w-[280px] xl:max-w-[300px]">
                    <h3 className="text-lg font-bold text-[#111827] mb-1.5 leading-tight">
                        {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold text-[#111827]">
                            ${plan.pricePerMonth}
                        </span>
                        <span className="text-sm font-medium text-[#6B7280]">
                            / Month
                        </span>
                    </div>
                    <p className="text-xs font-medium text-[#4B5675] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F6FEB]"></span>
                        Approx Leads: <span className="text-[#111827] font-semibold">{plan.approxLeads}</span>
                    </p>
                </div>

                {/* Details Grid (Credits & Contract) */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full xl:flex-1 xl:ml-6">
                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-5 py-3 min-w-[100px] justify-center bg-[#F9FAFB]/50">
                        <span className="text-[15px] font-bold text-[#111827] mb-0.5">{plan.creditsPerMonth}</span>
                        <span className="text-[11px] font-semibold text-[#8E9BBA] uppercase tracking-wider">Credits / Mo</span>
                    </div>

                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-5 py-3 min-w-[120px] justify-center bg-[#F9FAFB]/50">
                        <span className="text-[15px] font-bold text-[#111827] mb-0.5">{plan.creditsPerLead}</span>
                        <span className="text-[11px] font-semibold text-[#8E9BBA] uppercase tracking-wider">Per Lead</span>
                    </div>

                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-5 py-3 min-w-[140px] justify-center bg-[#F9FAFB]/50">
                        <span className="text-[15px] font-bold text-[#111827] mb-0.5">{plan.durationMonths} Months</span>
                        <span className="text-[11px] font-semibold text-[#8E9BBA] uppercase tracking-wider">Contract</span>
                    </div>

                    {plan.bonusLeads > 0 && (
                        <div className="flex flex-col border border-dashed border-[#10B981]/30 rounded-xl px-5 py-3 min-w-[100px] justify-center bg-[#F0FDF4]">
                            <span className="text-[15px] font-bold text-[#059669] mb-0.5">+{plan.bonusLeads}</span>
                            <span className="text-[11px] font-semibold text-[#059669]/70 uppercase tracking-wider">Bonus</span>
                        </div>
                    )}
                </div>

                {/* Column 4: Status and Actions */}
                <div className="flex items-center justify-between xl:justify-end gap-5 w-full xl:w-auto xl:mt-0 xl:pt-0">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#4B5675]">Active</span>
                        <Toggle 
                            checked={plan.isActive} 
                            onChange={(checked) => onStatusChange(plan._id, checked)} 
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            className="p-2 cursor-pointer text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={toggleMenu}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-10 w-52 bg-white border border-gray-100 shadow-xl rounded-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate(`/cleaner-subscriptions/edit/${plan._id}`);
                                    }}
                                >
                                    <Pencil size={18} className="text-[#1F6FEB] stroke-[2]" />
                                    <span className="font-semibold">Edit Plan</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <Users size={18} className="stroke-[2]" />
                                    <span className="font-medium">View Subscribers</span>
                                </button>
                                <div className="mx-2 my-1 border-t border-gray-100"></div>
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDeleteClick(plan);
                                    }}
                                >
                                    <Trash2 size={18} className="stroke-[2]" />
                                    <span className="font-semibold">Delete Plan</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-sm font-semibold text-[#4B5675] mr-2">Total Subscribers:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1F6FEB]">
                        {plan.subscribersCount || 0}
                    </span>
                </div>
                <div className="flex gap-2">
                    {plan.includedCategories?.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                            Category {idx + 1}
                        </span>
                    ))}
                    {plan.includedCategories?.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                            +{plan.includedCategories.length - 3} More
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}


