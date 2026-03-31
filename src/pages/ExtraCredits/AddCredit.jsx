import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Toggle from "../../components/common/Toggle";
import { createExtraCreditPackage } from "../../api/services/subscriptionService";

export default function AddCredit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        credits: "",
        price: "",
        approxLeads: "",
        isPopular: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (checked) => {
        setFormData(prev => ({ ...prev, isPopular: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createExtraCreditPackage({
                ...formData,
                credits: Number(formData.credits),
                price: Number(formData.price)
            });
            navigate("/extra-credits");
        } catch (error) {
            console.error("Error creating credit package:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full pb-10 font-inter text-[#071437]">
            <div className="flex items-center gap-3 mb-4">
                <button 
                    onClick={() => navigate("/extra-credits")}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-[16px] font-semibold">Add New Credit Package</h1>
            </div>

            <main className="bg-white rounded-[16px] overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-[18px] font-semibold">Fill Below Details To Add Extra Credit Package</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-2">Credits Amount</label>
                            <input
                                type="number"
                                name="credits"
                                value={formData.credits}
                                onChange={handleChange}
                                placeholder="e.g. 200"
                                className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-2">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 140"
                                className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
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
                                placeholder="e.g. Approx. 5 leads"
                                className="w-full h-[42px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-[#111827]">Mark as Popular</label>
                                <Toggle checked={formData.isPopular} onChange={handleToggle} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col min-[321px]:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/extra-credits")}
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
                            {loading ? "Adding..." : "Add Package"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
