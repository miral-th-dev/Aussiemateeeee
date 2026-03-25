import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import Toggle from "../../components/common/Toggle";
import CustomSelect from "../../components/common/CustomSelect";
import { getCategories } from "../../api/services/categoryService";
import { getSubscriptionPlans, updateSubscriptionPlan } from "../../api/services/subscriptionService";
import CategorySelect from "../../components/common/CategorySelect";

export default function EditPlan() {
    const navigate = useNavigate();
    const { planId } = useParams();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pricePerMonth: "",
        billingCycle: "Monthly",
        durationMonths: "3",
        creditsPerMonth: "",
        creditsPerLead: "",
        approxLeads: "",
        includedCategories: [],
        bonusLeads: "0",
        isActive: true
    });

    const durationOptions = [
        { value: "1", label: "1 Month" },
        { value: "3", label: "3 Months" },
        { value: "6", label: "6 Months" },
        { value: "12", label: "12 Months" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [categoriesRes, plansRes] = await Promise.all([
                    getCategories(),
                    getSubscriptionPlans()
                ]);

                setCategories(categoriesRes.data || []);

                const plan = (plansRes.data || []).find(p => p._id === planId);
                if (plan) {
                    setFormData({
                        name: plan.name || "",
                        description: plan.description || "",
                        pricePerMonth: plan.pricePerMonth || "",
                        billingCycle: plan.billingCycle || "Monthly",
                        durationMonths: plan.durationMonths?.toString() || "3",
                        creditsPerMonth: plan.creditsPerMonth || "",
                        creditsPerLead: plan.creditsPerLead || "",
                        approxLeads: plan.approxLeads || "",
                        includedCategories: plan.includedCategories || [],
                        bonusLeads: plan.bonusLeads?.toString() || "0",
                        isActive: plan.isActive ?? true
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [planId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (checked) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const toggleCategory = (categoryIdOrObject) => {
        const categoryId = typeof categoryIdOrObject === 'object' ? categoryIdOrObject._id : categoryIdOrObject;
        setFormData(prev => {
            const current = prev.includedCategories;
            // Handle both structure: current could contain IDs or objects
            const isSelected = current.some(item => (typeof item === 'object' ? item._id : item) === categoryId);

            const updated = isSelected
                ? current.filter(item => (typeof item === 'object' ? item._id : item) !== categoryId)
                : [...current, categoryId];
            return { ...prev, includedCategories: updated };
        });
    };

    // Auto-calculate Estimated Leads
    useEffect(() => {
        const credits = Number(formData.creditsPerMonth);
        const perLead = Number(formData.creditsPerLead);
        
        if (credits && perLead && perLead > 0) {
            const calculatedLeads = Math.floor(credits / perLead);
            setFormData(prev => ({ ...prev, approxLeads: calculatedLeads.toString() }));
        }
    }, [formData.creditsPerMonth, formData.creditsPerLead]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSubscriptionPlan(planId, {
                ...formData,
                pricePerMonth: Number(formData.pricePerMonth),
                durationMonths: Number(formData.durationMonths),
                creditsPerMonth: Number(formData.creditsPerMonth),
                creditsPerLead: Number(formData.creditsPerLead),
                approxLeads: Number(formData.approxLeads),
                bonusLeads: Number(formData.bonusLeads)
            });
            navigate("/cleaner-subscriptions");
        } catch (error) {
            console.error("Error updating subscription plan:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading plan details...</div>;
    }

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate("/cleaner-subscriptions")}
                        className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors font-bold"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[16px] font-semibold text-[#1F2937]">{formData.name || "Edit Plan"}</h1>
                </div>

            <div className="max-w-[1200px] mx-auto w-full pb-10 font-inter">
                
                <main className="bg-white rounded-[16px] ">
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Basic Plan Information */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[#071437] mb-4">Basic Plan Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Plan Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Domestic / General Cleaning"
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC]"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Plan Category</label>
                                    <CategorySelect
                                        categories={categories}
                                        selectedCategories={formData.includedCategories}
                                        onToggleCategory={toggleCategory}
                                        placeholder="Enter Password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Plan Description */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[#071437] mb-4">Plan Description</h3>
                            <div className="mb-4">
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter descriptions"
                                    className="w-full min-h-[120px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none bg-[#FCFCFC]"
                                />
                            </div>
                        </div>

                        {/* Pricing Details */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[#071437] mb-4">Pricing Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Monthly Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="pricePerMonth"
                                        value={formData.pricePerMonth}
                                        onChange={handleChange}
                                        placeholder="$ 00"
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Billing Cycle</label>
                                    <CustomSelect
                                        value={formData.billingCycle || "Monthly"}
                                        onChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value }))}
                                        options={[
                                            { value: "Monthly", label: "Monthly" },
                                            { value: "Quarterly", label: "Quarterly" },
                                            { value: "Yearly", label: "Yearly" }
                                        ]}
                                        placeholder="Select billing type"
                                        className="w-full"
                                        buttonClassName="h-[42px] !bg-[#FCFCFC] !border-gray-200 rounded-lg focus:outline-none focus:!border-gray-400 text-sm [&>span]:!text-[#1F2937] [&>span]:!font-normal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Minimum Contract Duration</label>
                                    <CustomSelect
                                        value={formData.durationMonths}
                                        onChange={(value) => setFormData(prev => ({ ...prev, durationMonths: value }))}
                                        options={durationOptions}
                                        placeholder="Select contract duration"
                                        className="w-full"
                                        buttonClassName="h-[42px] !bg-[#FCFCFC] !border-gray-200 rounded-lg focus:outline-none focus:!border-gray-400 text-sm [&>span]:!text-[#1F2937] [&>span]:!font-normal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credits Configuration */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[#071437] mb-4">Credits Configuration</h3>
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
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Credits Deducted Per Lead</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="creditsPerLead"
                                        value={formData.creditsPerLead}
                                        onChange={handleChange}
                                        placeholder="00"
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Estimated Leads</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="approxLeads"
                                        value={formData.approxLeads}
                                        readOnly
                                        placeholder="00"
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC] cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bonus Leads */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-[#071437] mb-4">Bonus Leads</h3>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Bonus Leads</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="bonusLeads"
                                        value={formData.bonusLeads}
                                        onChange={handleChange}
                                        placeholder="00"
                                        className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-[#FCFCFC]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <label className="text-sm font-medium text-[#111827]">Active Status</label>
                                <Toggle checked={formData.isActive} onChange={handleToggle} />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col min-[321px]:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/cleaner-subscriptions")}
                                disabled={saving}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-[#374151] px-8 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#1F6FEB] hover:bg-[#1B63D6] text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}

