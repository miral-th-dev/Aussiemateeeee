import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreditCard from "../../components/extra-credits/CreditCard";
import DeleteCreditModal from "../../components/extra-credits/DeleteCreditModal";
import { getExtraCreditPackages, deleteExtraCreditPackage } from "../../api/services/subscriptionService";

export default function ExtraCredits() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await getExtraCreditPackages();
            setPackages(response.data || []);
        } catch (error) {
            console.error("Error fetching credit packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDeleteClick = (pkg) => {
        setPackageToDelete(pkg);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!packageToDelete) return;
        try {
            await deleteExtraCreditPackage(packageToDelete._id);
            setPackages(prev => prev.filter(p => p._id !== packageToDelete._id));
            setIsDeleteModalOpen(false);
            setPackageToDelete(null);
        } catch (error) {
            console.error("Error deleting credit package:", error);
        }
    };

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 font-inter">
                <div>
                    <h1 className="text-[16px] font-semibold text-[#111827]">Extra Credit Packages</h1>
                </div>
                <button
                    onClick={() => navigate("/extra-credits/add")}
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-[#1B63D6] transition-colors"
                >
                    <Plus size={9} className="text-[#1F6FEB] bg-white rounded-full w-4 h-4" />
                    Add New Package
                </button>
            </div>
            
            <div className="max-w-[1200px] mx-auto w-full pb-10 font-inter">
                {/* Packages List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="animate-spin w-8 h-8 border-4 border-[#1F6FEB] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading credit packages...</p>
                        </div>
                    ) : packages.length > 0 ? (
                        packages.map(pkg => (
                            <CreditCard
                                key={pkg._id}
                                creditPackage={pkg}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No extra credit packages found</p>
                            <button 
                                onClick={() => navigate("/extra-credits/add")}
                                className="mt-4 text-[#1F6FEB] font-semibold text-sm hover:underline"
                            >
                                Create your first package
                            </button>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <DeleteCreditModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    packageName={`${packageToDelete?.credits} Credits`}
                />
            </div>
        </>
    );
}
