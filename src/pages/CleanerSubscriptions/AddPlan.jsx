import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import Toggle from "../../components/common/Toggle";
import { getCategories } from "../../api/services/categoryService";
import { createSubscriptionPlan } from "../../api/services/subscriptionService";

export default function AddPlan() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        pricePerMonth: "",
        durationMonths: "3",
        creditsPerMonth: "",
        creditsPerLead: "",
        approxLeads: "",
        includedCategories: [],
        bonusLeads: "0",
        isActive: true
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (checked) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const toggleCategory = (categoryId) => {
        setFormData(prev => {
            const current = prev.includedCategories;
            const updated = current.includes(categoryId)
                ? current.filter(id => id !== categoryId)
                : [...current, categoryId];
            return { ...prev, includedCategories: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createSubscriptionPlan({
                ...formData,
                pricePerMonth: Number(formData.pricePerMonth),
                durationMonths: Number(formData.durationMonths),
                creditsPerMonth: Number(formData.creditsPerMonth),
                creditsPerLead: Number(formData.creditsPerLead),
                bonusLeads: Number(formData.bonusLeads)
            });
            navigate("/cleaner-subscriptions");
        } catch (error) {
            console.error("Error creating subscription plan:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full pb-10 font-inter">
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => navigate("/cleaner-subscriptions")}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-[#1F2937]">Add New Plan</h1>
            </div>

            <main className="bg-white rounded-[16px] shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-[#111827]">Fill Below Details To Add New Plan</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Plan Information */}
                    <div className="mb-[32px]">
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-6">Basic Plan Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Commercial Cleaning Leads"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-[#374151] mb-2">Included Categories</label>
                                <div 
                                    className="relative w-full min-h-[42px] px-4 py-2 border border-gray-200 rounded-lg flex flex-wrap gap-2 items-center cursor-pointer"
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                >
                                    {formData.includedCategories.length === 0 ? (
                                        <span className="text-gray-400 text-sm">Select categories</span>
                                    ) : (
                                        formData.includedCategories.map(catId => {
                                            const cat = categories.find(c => c._id === catId);
                                            return (
                                                <span key={catId} className="bg-[#F3F4F6] text-[#374151] text-xs px-2 py-1 rounded-md flex items-center gap-1 group">
                                                    {cat?.name}
                                                    <X 
                                                        size={12} 
                                                        className="cursor-pointer hover:text-red-500" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCategory(catId);
                                                        }}
                                                    />
                                                </span>
                                            );
                                        })
                                    )}
                                </div>
                                {isCategoryDropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
                                        {categories.map(category => (
                                            <div 
                                                key={category._id}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                                    formData.includedCategories.includes(category._id) 
                                                    ? 'bg-[#EFF6FF] text-[#1F6FEB]' 
                                                    : 'hover:bg-gray-50 text-[#374151]'
                                                }`}
                                                onClick={() => toggleCategory(category._id)}
                                            >
                                                <span className="text-sm font-medium">{category.name}</span>
                                                {formData.includedCategories.includes(category._id) && <Check size={16} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="mb-[32px]">
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-6">Pricing & Duration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Monthly Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="pricePerMonth"
                                    value={formData.pricePerMonth}
                                    onChange={handleChange}
                                    placeholder="$ 00"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Duration (Months)</label>
                                <select
                                    name="durationMonths"
                                    value={formData.durationMonths}
                                    onChange={handleChange}
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm appearance-none bg-white font-inter"
                                >
                                    {[1, 3, 6, 12].map(m => (
                                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Credits Configuration */}
                    <div className="mb-[32px]">
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-6">Credits Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Credits Per Month</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="creditsPerMonth"
                                    value={formData.creditsPerMonth}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Credits Per Lead</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="creditsPerLead"
                                    value={formData.creditsPerLead}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Approx Leads Description</label>
                                <input
                                    type="text"
                                    name="approxLeads"
                                    value={formData.approxLeads}
                                    onChange={handleChange}
                                    placeholder="e.g. 14 leads or 18-20 leads"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bonus Leads */}
                    <div className="mb-[32px]">
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-6">Extra Rewards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Bonus Leads</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="bonusLeads"
                                    value={formData.bonusLeads}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F6FEB] text-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="flex items-center gap-3 h-[42px]">
                                    <label className="text-sm font-medium text-[#111827]">Active Status</label>
                                    <Toggle checked={formData.isActive} onChange={handleToggle} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate("/cleaner-subscriptions")}
                            disabled={loading}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-[#374151] px-8 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#1F6FEB] hover:bg-[#1B63D6] text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                            {loading ? "Adding..." : "Add New Plan"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

