import React, { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  ChevronDown, 
  CreditCard,
  CheckCircle2,
  MoreVertical,
  ArrowUpDown,
  Upload,
  Loader2
} from "lucide-react";
import { getCleanerSubscriptionsReport } from "../../api/services/subscriptionService";
import { fetchCleanerPayments } from "../../api/services/cleanersService";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const SubscriptionsTab = ({ cleanerId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We use the payments API as the primary source since it returns detailed info for the specific cleaner
        const paymentsResponse = await fetchCleanerPayments(cleanerId);
        const data = paymentsResponse?.data;

        if (data) {
          const sub = data.subscription;
          const credits = data.credits;
          const leads = data.leads;
          const plan = sub?.planId || {};
          
          if (sub || credits) {
            setSubscriptionData({
              planName: plan.name || sub?.planName || "N/A",
              price: plan.pricePerMonth || sub?.price || 0,
              interval: plan.interval || "month",
              estimatedLeads: plan.approxLeads || sub?.estimatedLeads || 0,
              credits: plan.creditsPerMonth || sub?.credits || 0,
              creditsPerLead: plan.creditsPerLead || sub?.creditsPerLead || 0,
              duration: `${plan.durationMonths || 0} Month Contract`,
              status: sub?.status || "inactive",
              creditsAllocated: credits?.allocated || 0,
              creditsUsed: credits?.used || 0,
              creditsRemaining: credits?.remaining || 0,
              estimatedLeadsRemaining: leads?.estimatedRemaining || 0,
              startDate: formatDate(sub?.currentPeriodStart),
              nextBilling: formatDate(sub?.currentPeriodEnd),
              usagePercent: (credits?.allocated > 0) ? (credits?.used / credits?.allocated) * 100 : 0,
            });
          }

          setPaymentHistory(Array.isArray(data.paymentHistory) ? data.paymentHistory : []);
        } else {
          // Fallback to report if primary fails or returns no data
          const reportResponse = await getCleanerSubscriptionsReport();
          const cleaners = reportResponse?.data || [];
          const currentCleaner = cleaners.find(c => c._id === cleanerId || c.id === cleanerId);
          if (currentCleaner && currentCleaner.activeSubscription) {
            const sub = currentCleaner.activeSubscription;
            setSubscriptionData({
              planName: sub.planName || "N/A",
              price: sub.price || 0,
              status: sub.status || "inactive",
              creditsRemaining: currentCleaner.availableCredits || 0,
              // ... other fields as best effort
            });
          }
        }
      } catch (error) {
        console.error("Error fetching subscription/payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cleanerId) {
      fetchData();
    }
  }, [cleanerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#6B7280]">
        <Loader2 className="animate-spin text-[#1F6FEB]" size={40} />
        <p className="text-[15px] font-medium">Loading subscription details...</p>
      </div>
    );
  }

  if (!subscriptionData && paymentHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#6B7280]">
        <CreditCard size={40} className="text-[#9CA3AF] opacity-50" />
        <p className="text-[15px] font-medium">No subscription or payment history found.</p>
      </div>
    );
  }

  const filteredPaymentHistory = paymentHistory.filter(item => 
    item.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-inter">
      {/* Subscriptions Section */}
      {subscriptionData && (
        <div className="space-y-4">
          <h3 className="text-[16px] font-semibold text-[#111827]">Subscriptions</h3>
          
          <div className="bg-white border border-[#F1F1F4] rounded-[20px] p-6 shadow-xs relative overflow-hidden">
            {/* ── Row 1: Plan info  |  Dashed cards  |  Active badge ── */}
            <div className="flex flex-wrap items-start gap-6 pr-28">
              {/* Plan Info */}
              <div className="min-w-[200px] xl:min-w-[300px]">
                <p className="text-[15px] font-medium text-[#071437]">{subscriptionData.planName}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-semibold text-[#111827]">${subscriptionData.price}</span>
                  <span className="text-[14px] font-medium text-[#6B7280]">/ {subscriptionData.interval}</span>
                </div>
                <p className="text-[13px] font-medium text-[#4B5675]">Estimated Leads: <span className="text-[#111827] font-semibold">{subscriptionData.estimatedLeads}</span></p>
              </div>

              {/* Dashed detail cards (Credits / Per Lead / Duration) */}
              <div className="flex flex-wrap items-center gap-3 flex-1 mt-3">
                <div className="flex flex-col border border-dashed border-[#E5E7EB] rounded-xl px-2 py-2 bg-[#F9FAFB]/50 min-w-[50px]">
                  <span className="text-[15px] font-semibold text-[#111827] mb-0.5">{subscriptionData.credits}</span>
                  <span className="text-[11px] font-medium text-[#6B7280]">Credits</span>
                </div>
                <div className="flex flex-col border border-dashed border-[#E5E7EB] rounded-xl px-2 py-2 bg-[#F9FAFB]/50 min-w-[80px]">
                  <span className="text-[15px] font-semibold text-[#111827] mb-0.5">{subscriptionData.creditsPerLead}</span>
                  <span className="text-[11px] font-medium text-[#6B7280] text-nowrap">Credits Per Lead</span>
                </div>
                <div className="flex flex-col border border-dashed border-[#E5E7EB] rounded-xl px-2 py-2 bg-[#F9FAFB]/50 min-w-[80px]">
                  <span className="text-[15px] font-semibold text-[#111827] mb-0.5">{subscriptionData.duration}</span>
                  <span className="text-[11px] font-medium text-[#6B7280]">Duration Badge</span>
                </div>
              </div>
            </div>

            {/* Active badge — absolute top-right */}
            <div className="absolute top-13 right-6">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${subscriptionData.status?.toLowerCase() === 'active' ? 'border-[#17C65333] bg-[#ECFDF5] text-[#10B981]' : 'border-[#F1416C33] bg-[#FFF5F8] text-[#F1416C]'} text-[12px] font-semibold`}>
                <span className={`w-1.5 h-1.5 rounded-full ${subscriptionData.status?.toLowerCase() === 'active' ? 'bg-[#10B981]' : 'bg-[#F1416C]'}`}></span>
                {subscriptionData.status?.charAt(0).toUpperCase() + subscriptionData.status?.slice(1)}
              </span>
            </div>

            {/* ── Row 2: Allocated/Used/Remaining  |  Credits Usage ── */}
            <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-4 mt-4 pt-5 border-t border-[#EEF0F5]">
              {/* 3 solid cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[14px] px-3 py-3 text-left min-w-[90px]">
                  <p className="text-[18px] font-semibold text-[#111827] mb-0.5">{subscriptionData.creditsAllocated}</p>
                  <p className="text-[11px] font-medium text-[#6B7280]">Credits Allocated</p>
                </div>
                <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[14px] px-3 py-3 text-left min-w-[90px]">
                  <p className="text-[18px] font-semibold text-[#111827] mb-0.5">{subscriptionData.creditsUsed}</p>
                  <p className="text-[11px] font-medium text-[#6B7280]">Credits Used</p>
                </div>
                <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[14px] px-3 py-3 text-left min-w-[90px]">
                  <p className="text-[18px] font-semibold text-[#111827] mb-0.5">{subscriptionData.creditsRemaining}</p>
                  <p className="text-[11px] font-medium text-[#6B7280]">Credits Remaining</p>
                </div>
              </div>

              {/* Credits Usage progress */}
              <div className="flex-1 flex flex-col min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] font-semibold text-[#111827]">Credits Usage</span>
                  <span className="text-[13px] font-medium text-[#4B5675]">
                    Estimated Leads Remaining: <span className="text-[#111827] font-semibold">{subscriptionData.estimatedLeadsRemaining} leads</span>
                  </span>
                </div>
                <div className="relative h-3 w-full bg-[#F1F1F4] rounded-full overflow-visible">
                  <div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{
                      width: `${subscriptionData.usagePercent}%`,
                      backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                      backgroundSize: '1rem 1rem'
                    }}
                  ></div>
                  {/* Tooltip */}
                  <div
                    className="absolute top-4 px-2 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-sm text-[10px] whitespace-nowrap"
                    style={{ left: `calc(${subscriptionData.usagePercent / 2}% - 30px)` }}
                  >
                    <span className="font-bold text-[#111827]">{subscriptionData.creditsUsed}</span>
                    <span className="text-[#6B7280]"> of </span>
                    <span className="font-bold text-[#111827]">{subscriptionData.creditsAllocated}</span>
                    <span className="text-[#6B7280]"> Credits Used</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#EEF0F5] flex gap-8">
              <p className="text-[14px] font-medium text-[#6B7280]">Start Date: <span className="text-[#111827] font-medium">{subscriptionData.startDate}</span></p>
              <p className="text-[14px] font-medium text-[#6B7280]">Next Billing: <span className="text-[#111827] font-medium">{subscriptionData.nextBilling}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <div className="space-y-4 ">
        <h3 className="text-[16px] font-semibold text-[#111827]">Payment History</h3>
        
        {/* Table Controls */}
        <div className="bg-white border border-[#EEF0F5] rounded-[20px] overflow-hidden shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input 
              type="text" 
              placeholder="Search by Plan Name" 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EEF0F5] rounded-xl text-xs focus:outline-none focus:border-[#1F6FEB]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-[#DBDFE9] rounded-xl text-[13px] font-medium text-[#4B5675] hover:bg-[#F9FAFB] transition-colors">
            <Upload size={16} className="text-[#99A1B7]" />
            Export history
          </button>
        </div>

        <div className="w-full overflow-x-auto">
  <table className="min-w-[500px] w-full text-left border-collapse">
            <thead className="border-b border-[#EEF0F5]">
              <tr className="bg-[#FCFCFC] border-t border-[#EEF0F5]">
                <th className="px-6 py-4 w-12 text-center border-r border-[#EEF0F5]">
                  <input type="checkbox" className="rounded border-[#D1D5DB] text-[#1F6FEB] focus:ring-[#1F6FEB]" />
                </th>
                <th className="px-6 py-4 border-r border-[#EEF0F5]">
                  <div className="flex items-center gap-1 text-[12px] font-medium text-[#78829D]">
                    Date
                  </div>
                </th>
                <th className="px-6 py-4 border-r border-[#EEF0F5]">
                  <div className="flex items-center gap-1 text-[12px] font-medium text-[#78829D]">
                    Plan
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1 text-[12px] font-medium text-[#78829D]">
                    Amount
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPaymentHistory.length > 0 ? (
                filteredPaymentHistory.map((row, index) => (
                  <tr key={row._id || index} className="border-b border-[#EEF0F5] hover:bg-[#F9FAFB] transition-colors last:border-0">
                    <td className="px-6 py-4 text-center border-r border-[#EEF0F5]">
                      <input type="checkbox" className="rounded border-[#D1D5DB] text-[#1F6FEB] focus:ring-[#1F6FEB]" />
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-[#111827] border-r border-[#EEF0F5]">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-[#111827] border-r border-[#EEF0F5]">
                      {row.planName || row.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-[#111827]">
                      ${row.amount ?? row.amount ?? 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-[#6B7280] text-[14px]">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsTab;
