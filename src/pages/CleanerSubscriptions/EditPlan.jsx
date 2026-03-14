import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Toggle from "../../components/common/Toggle";
import CustomSelect from "../../components/common/CustomSelect";

// Mock existing plans for demo
const initialPlans = {
    "1": {
        id: "1",
        name: "Domestic / General Cleaning",
        category: "domestic",
        description: "Nesciunt perspiciatis natus. Enim accusantium animi rerum omnis repellendus repudiandae ut. Eius officia occaecati. Ea perspiciatis praesentium.",
        price: "500",
        billingCycle: "monthly",
        contractDuration: "1",
        credits: "400",
        creditsPerLead: "20",
        estimatedLeads: "12",
        bonusLeads: "2",
        active: true
    }
};

export default function EditPlan() {
    const navigate = useNavigate();
    const { planId } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        billingCycle: "",
        contractDuration: "",
        credits: "",
        creditsPerLead: "",
        estimatedLeads: "",
        bonusLeads: "",
        active: true
    });

    useEffect(() => {
        // Fetch or simulate finding the plan
        if (planId && initialPlans[planId]) {
            setFormData(initialPlans[planId]);
        }
    }, [planId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (checked) => {
        setFormData(prev => ({ ...prev, active: checked }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        navigate("/cleaner-subscriptions");
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full pb-10">
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => navigate("/cleaner-subscriptions")}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-[#1F2937]">{formData.name || "Edit Plan"}</h1>
            </div>

            <main className="bg-white rounded-[16px]">
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Plan Information */}
                    <div className="mb-[20px]">
                        <h3 className="text-sm font-semibold text-[#111827] mb-4">Basic Plan Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Domestic / General Cleaning"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Plan Category</label>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(value) => handleChange({ target: { name: 'category', value } })}
                                    options={[
                                        { value: 'domestic', label: 'Domestic Cleaning' },
                                        { value: 'commercial', label: 'Commercial Cleaning' }
                                    ]}
                                    placeholder="Select plan category"
                                    buttonClassName="w-full h-[42px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-2">Plan Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter descriptions"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-y"
                            />
                        </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="mb-[20px]">
                        <h3 className="text-sm font-semibold text-[#111827] mb-4">Pricing Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Monthly Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="$ 00"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Billing Cycle</label>
                                <CustomSelect
                                    value={formData.billingCycle}
                                    onChange={(value) => handleChange({ target: { name: 'billingCycle', value } })}
                                    options={[
                                        { value: 'monthly', label: 'Monthly Billing' },
                                        { value: 'one-time', label: 'One Time Payment' }
                                    ]}
                                    placeholder="Select billing type"
                                    buttonClassName="w-full h-[42px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Minimum Contract Duration</label>
                                <CustomSelect
                                    value={formData.contractDuration}
                                    onChange={(value) => handleChange({ target: { name: 'contractDuration', value } })}
                                    options={[
                                        { value: '1', label: '1 Month' },
                                        { value: '3', label: '3 Months' },
                                        { value: '6', label: '6 Months' },
                                        { value: '12', label: '12 Months' }
                                    ]}
                                    placeholder="Select contract duration"
                                    buttonClassName="w-full h-[42px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Credits Configuration */}
                    <div className="mb-[20px]">
                        <h3 className="text-sm font-semibold text-[#111827] mb-4">Credits Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Credits Per Month</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="credits"
                                    value={formData.credits}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
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
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Estimated Leads</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="estimatedLeads"
                                    value={formData.estimatedLeads}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bonus Leads */}
                    <div className="mb-[20px]">
                        <h3 className="text-sm font-semibold text-[#111827] mb-4">Bonus Leads</h3>
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-2">Bonus Leads</label>
                            <input
                                type="number"
                                min="0"
                                name="bonusLeads"
                                value={formData.bonusLeads}
                                onChange={handleChange}
                                placeholder="00"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <label className="text-sm font-medium text-[#111827]">Active</label>
                        <Toggle checked={formData.active} onChange={handleToggle} />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/cleaner-subscriptions")}
                            className="bg-[#F9FAFB] hover:bg-gray-100 text-[#374151] px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#1F6FEB] hover:bg-[#1B63D6] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                            Save Plan
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
