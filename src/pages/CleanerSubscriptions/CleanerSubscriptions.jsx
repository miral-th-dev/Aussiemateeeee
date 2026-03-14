import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PlanCard from "../../components/cleaner-subscriptions/PlanCard";
import DeletePlanModal from "../../components/cleaner-subscriptions/DeletePlanModal";

const initialPlans = [
  {
    id: "1",
    name: "Domestic / General Cleaning",
    price: 300,
    billingCycle: "month",
    credits: 400,
    creditsPerLead: 20,
    contractDuration: "3 Month",
    estimatedLeads: 20,
    subscribers: 124,
    active: true,
  },
  {
    id: "2",
    name: "Commercial Cleaning Leads",
    price: 600,
    billingCycle: "month",
    credits: 700,
    creditsPerLead: 50,
    contractDuration: "3 Month",
    estimatedLeads: 14,
    subscribers: 300,
    active: true,
  },
  {
    id: "3",
    name: "Other Service Leads",
    price: 300,
    billingCycle: "month",
    credits: 400,
    creditsPerLead: 20,
    contractDuration: "3 Month",
    estimatedLeads: 20,
    subscribers: 300,
    active: true,
  },
  {
    id: "4",
    name: "Bond / End-of-Lease Cleaning",
    price: 300,
    billingCycle: "month",
    credits: 350,
    creditsPerLead: 30,
    contractDuration: "3 Month",
    estimatedLeads: 12,
    subscribers: 300,
    active: true,
  },
];

export default function CleanerSubscriptions() {
  const [plans, setPlans] = useState(initialPlans);
  const [planToDelete, setPlanToDelete] = useState(null);
  const navigate = useNavigate();

  const handleStatusChange = (id, newStatus) => {
    setPlans(
      plans.map((plan) =>
        plan.id === id ? { ...plan, active: newStatus } : plan,
      ),
    );
  };

  const confirmDelete = () => {
    if (planToDelete) {
      setPlans(plans.filter((p) => p.id !== planToDelete.id));
      setPlanToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[#1F2937]">
          Cleaner Subscriptions
        </h1>
        <button
          onClick={() => navigate("/cleaner-subscriptions/add")}
          className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-[#1B63D6] w-full sm:w-auto"
        >
          <div className="bg-white rounded-full p-0.5 text-[#1F6FEB]">
            <Plus size={14} strokeWidth={3} />
          </div>
          Add New Plan
        </button>
      </div>
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col gap-0">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onStatusChange={handleStatusChange}
              onDeleteClick={setPlanToDelete}
            />
          ))}
        </div>

        <DeletePlanModal
          isOpen={!!planToDelete}
          onClose={() => setPlanToDelete(null)}
          onConfirm={confirmDelete}
          planName={planToDelete?.name || ""}
        />
      </div>
    </div>
  );
}
