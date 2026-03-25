import React, { useState, useRef, useEffect } from "react";
import { Check, X, ChevronDown } from "lucide-react";

/**
 * Common CategorySelect component for multi-select categories
 * @param {Array} selectedCategories - Array of selected category IDs
 * @param {Function} onToggleCategory - Callback function when a category is toggled
 * @param {Array} categories - Array of category objects { _id, name }
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional class names for the container
 */
export default function CategorySelect({ 
    selectedCategories = [], 
    onToggleCategory, 
    categories = [], 
    placeholder = "Select categories",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleCategoryClick = (categoryId, e) => {
        e.stopPropagation();
        onToggleCategory(categoryId);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div 
                className="relative w-full min-h-[42px] px-4 py-2 border border-gray-200 rounded-lg flex flex-wrap gap-2 items-center cursor-pointer bg-[#FCFCFC] transition-all focus-within:border-[#1F6FEB]"
                onClick={toggleDropdown}
            >
                {selectedCategories.length === 0 ? (
                    <span className="text-gray-400 text-sm">{placeholder}</span>
                ) : (
                    selectedCategories.map(item => {
                        const catId = typeof item === 'object' ? item._id : item;
                        // Try to find the category in the full list, or use the object itself if item is an object
                        const cat = categories.find(c => c._id === catId) || (typeof item === 'object' ? item : null);
                        
                        return (
                            <span key={catId} className="bg-[#F3F4F6] text-[#374151] text-xs px-2 py-1 rounded-md flex items-center gap-1 group transition-colors hover:bg-gray-200">
                                {cat?.name || "Unknown"}
                                <X 
                                    size={12} 
                                    className="cursor-pointer hover:text-red-500 transition-colors" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleCategory(catId);
                                    }}
                                />
                            </span>
                        );
                    })
                )}
                <div className="ml-auto pointer-events-none text-gray-400">
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">No categories available</div>
                    ) : (
                        categories.map(category => {
                            const isSelected = selectedCategories.includes(category._id);
                            return (
                                <div 
                                    key={category._id}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0 ${
                                        isSelected 
                                        ? 'bg-[#EFF6FF] text-[#1F6FEB]' 
                                        : 'hover:bg-gray-50 text-[#374151]'
                                    }`}
                                    onClick={(e) => handleCategoryClick(category._id, e)}
                                >
                                    <span className="text-sm font-medium">{category.name}</span>
                                    {isSelected && <Check size={16} />}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
