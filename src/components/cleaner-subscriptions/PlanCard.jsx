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
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-4 md:p-6 mb-4 relative">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6 w-full">
                {/* Column 1: Info (Name, Price, Leads) */}
                <div className="w-full xl:min-w-[260px] xl:max-w-[240px]">
                    <h3 className="text-[16px] font-medium text-[#111827] mb-1.5">
                        {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-semibold text-[#111827]">
                            ${plan.price}
                        </span>
                        <span className="text-sm font-medium text-[#6B7280]">
                            / {plan.billingCycle}
                        </span>
                    </div>
                    <p className="text-xs font-medium text-[#4B5675]">
                        Estimated Leads: <span className="text-[#111827] font-medium">{plan.estimatedLeads}</span>
                    </p>
                </div>

                {/* Details Grid (Credits & Contract) */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full xl:flex-1 xl:ml-6">
                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-4 py-2.5 min-w-[80px] justify-center bg-white">
                        <span className="text-sm font-semibold text-[#111827] mb-0.5">{plan.credits}</span>
                        <span className="text-xs font-medium text-[#8E9BBA]">Credits</span>
                    </div>

                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-4 py-2.5 min-w-[120px] justify-center bg-white">
                        <span className="text-sm font-semibold text-[#111827] mb-0.5">{plan.creditsPerLead}</span>
                        <span className="text-xs font-medium text-[#8E9BBA]">Credits Per Lead</span>
                    </div>

                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-4 py-2.5 min-w-[140px] justify-center bg-white">
                        <span className="text-sm font-semibold text-[#111827] mb-0.5">{plan.contractDuration} Contract</span>
                        <span className="text-xs font-medium text-[#8E9BBA]">Duration Badge</span>
                    </div>
                </div>

                {/* Column 4: Status and Actions */}
                <div className="flex items-center justify-between xl:justify-end gap-4 w-full xl:w-auto xl:mt-0 xl:pt-0 ">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#4B5675]">Active</span>
                        <Toggle 
                            checked={plan.active} 
                            onChange={(checked) => onStatusChange(plan.id, checked)} 
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            className="p-1 cursor-pointer text-[#6B7280] hover:text-[#111827]"
                            onClick={toggleMenu}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-lg rounded-xl z-50 py-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate(`/cleaner-subscriptions/edit/${plan.id}`);
                                    }}
                                >
                                    <Pencil size={18} className="text-[#1F6FEB] group-hover:text-[#1F6FEB] stroke-[1.5]" />
                                    <span className="text-[#1F6FEB] font-medium">Edit Plan</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <Users size={18} className="text-[#4B5675] group-hover:text-[#1F6FEB] stroke-[1.5]" />
                                    View Subscribers
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer mt-1 pt-2 border-t border-gray-100"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDeleteClick(plan);
                                    }}
                                >
                                    <Trash2 size={18} className="text-[#EF4444] group-hover:text-[#DC2626] stroke-[1.5]" />
                                    Delete Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center">
                <span className="text-sm font-medium text-[#4B5675] mr-2">Subscribers:</span>
                <span className="text-sm font-medium text-[#111827]">{plan.subscribers}</span>
            </div>
        </div>
    );
}

