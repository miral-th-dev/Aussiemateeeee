import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PlanCard from "../../components/cleaner-subscriptions/PlanCard";
import DeletePlanModal from "../../components/cleaner-subscriptions/DeletePlanModal";
import { getSubscriptionPlans, updatePlanStatus, deleteSubscriptionPlan } from "../../api/services/subscriptionService";

export default function CleanerSubscriptions() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await getSubscriptionPlans();
            setPlans(response.data || []);
        } catch (error) {
            console.error("Error fetching subscription plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleStatusChange = async (planId, isActive) => {
        try {
            await updatePlanStatus(planId, isActive);
            setPlans(prev => prev.map(p => p._id === planId ? { ...p, isActive } : p));
        } catch (error) {
            console.error("Error updating plan status:", error);
        }
    };

    const handleDeleteClick = (plan) => {
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;
        try {
            await deleteSubscriptionPlan(planToDelete._id);
            setPlans(prev => prev.filter(p => p._id !== planToDelete._id));
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
        } catch (error) {
            console.error("Error deleting subscription plan:", error);
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[16px] font-semibold text-[#111827]">Cleaner Subscriptions</h1>
                </div>
                <button
                    onClick={() => navigate("/cleaner-subscriptions/add")}
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB]  text-white px-5 py-2.5 rounded-xl text-sm font-semibold  cursor-pointer"
                >
                    <Plus size={9} className="text-[#1F6FEB] bg-white rounded-full w-4 h-4" />
                    Add New Plan
                </button>
            </div>
            <div className="max-w-[1200px] mx-auto w-full pb-10 px-4 md:px-0 font-inter">

                {/* Plans List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="animate-spin w-8 h-8 border-4 border-[#1F6FEB] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading subscription plans...</p>
                        </div>
                    ) : filteredPlans.length > 0 ? (
                        filteredPlans.map(plan => (
                            <PlanCard
                                key={plan._id}
                                plan={plan}
                                onStatusChange={handleStatusChange}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No subscription plans found</p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <DeletePlanModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    planName={planToDelete?.name}
                />
            </div>
        </>
    );
}

