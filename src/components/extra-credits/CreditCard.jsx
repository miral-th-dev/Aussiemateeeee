import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreditCard({ creditPackage, onDeleteClick }) {
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
        <div className={`bg-white rounded-[16px] border ${creditPackage.isPopular ? 'border-blue-200' : 'border-[#F1F1F4]'} shadow-sm p-4 md:p-6 mb-4 relative`}>
            {creditPackage.isPopular && (
                <div className="absolute -top-3 left-6 bg-[#1F6FEB] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} fill="currentColor" />
                    MOST POPULAR
                </div>
            )}
            
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6 w-full">
                {/* Column 1: Info (Credits, Price) */}
                <div className="w-full xl:min-w-[200px] xl:max-w-[300px]">
                    <h3 className="text-md font-medium text-gray-800 mb-1.5 leading-tight">
                        {creditPackage.credits} Credits Package
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-semibold text-[#111827]">
                            ${creditPackage.price}
                        </span>
                        <span className="text-sm font-medium text-[#6B7280]">
                            One-time
                        </span>
                    </div>
                </div>

                {/* Details Grid (Approx Leads) */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full xl:flex-1">
                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-4 py-2 min-w-[120px] justify-center bg-[#F9FAFB]/50">
                        <span className="text-[15px] font-semibold text-[#111827] mb-0.5">{creditPackage.approxLeads}</span>
                        <span className="text-[11px] font-medium text-[#6B7280] tracking-wider uppercase">Estimation</span>
                    </div>

                    <div className="flex flex-col border border-dashed border-gray-200 rounded-xl px-4 py-2 min-w-[120px] justify-center bg-[#F9FAFB]/50">
                        <span className="text-[15px] font-semibold text-[#111827] mb-0.5">{creditPackage.credits}</span>
                        <span className="text-[11px] font-medium text-[#6B7280] tracking-wider uppercase">Total Credits</span>
                    </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between xl:justify-end gap-2 w-full xl:w-auto">
                    <div className="relative">
                        <button 
                            className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                            onClick={toggleMenu}
                        >
                            <MoreVertical size={20} className="text-gray-500" />
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
                                        navigate(`/extra-credits/edit/${creditPackage._id}`);
                                    }}
                                >
                                    <Pencil size={16} className="stroke-[2]" />
                                    <span className="font-medium">Edit Package</span>
                                </button>
                                <div className="mx-2 border-t border-gray-50 my-1"></div>
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDeleteClick(creditPackage);
                                    }}
                                >
                                    <Trash2 size={18} className="stroke-[2]" />
                                    <span className="font-semibold">Delete Package</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
