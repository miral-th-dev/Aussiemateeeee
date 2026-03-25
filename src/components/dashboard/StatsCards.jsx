import { useState, useEffect } from "react";
import dashKYC from "../../assets/icon/dashKYC.svg";
import dashJobs from "../../assets/icon/dashJobs.svg";
import subscription from "../../assets/icon/subscription.svg";
import dashRevenue from "../../assets/icon/dashRevenue.svg";
import cardsBg from "../../assets/image/cardsBg.svg";
import { fetchRevenueMTD } from "../../api/services/dashboardService";

const defaultCards = [
  { 
    id: 1,
    label: "Pending KYC",
    value: 0,
    icon: dashKYC,
    isDynamic: true, // Mark this card as dynamic
  },
  {
    id: 2,
    label: "Total Jobs",
    value: 0,
    icon: dashJobs,
    isDynamic: true, // Mark this card as dynamic
  },
  {
    id: 3,
    label: "Active Subscription Cleaner",
    value: 0,
    icon: subscription,
    isDynamic: true,
  },
  {
    id: 4,
    label: "Revenue (MTD)",
    value: "$0",
    icon: dashRevenue,
    isDynamic: true,
  },
];

export default function StatsCards({ items = defaultCards }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetchRevenueMTD();
        if (response?.success && response?.data) {
          setStats(response.data);
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Merge dynamic data with static cards
  const cards = items.map((card) => {
    if (!card.isDynamic) return card;

    let displayValue;
    if (loading) {
      displayValue = "...";
    } else if (error || !stats) {
      displayValue = "-";
    } else {
      switch (card.label) {
        case "Pending KYC":
          displayValue = stats.pendingKYC || 0;
          break;
        case "Total Jobs":
          displayValue = stats.totalJobs || 0;
          break;
        case "Active Subscription Cleaner":
          displayValue = stats.activeSubscriptionCleaners || 0;
          break;
        case "Revenue (MTD)":
          displayValue = stats.totalRevenueFormatted || `$${(stats.totalRevenue || 0).toLocaleString()}`;
          break;
        default:
          displayValue = card.value;
      }
    }

    return {
      ...card,
      value: displayValue,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center gap-3 sm:gap-4 bg-white rounded-[16px] xl:rounded-[20px] p-4 sm:p-5 xl:px-6 xl:py-4 shadow-sm border border-[#EEF0F5] bg-cover bg-center bg-no-repeat min-h-[90px] xl:min-h-[100px]"
          style={{ backgroundImage: `url(${cardsBg})` }}
        >
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 rounded-xl xl:rounded-2xl">
            <img
              src={card.icon}
              alt={card.label}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-xl sm:text-[22px] xl:text-[28px] font-semibold text-[#1C1C1C] leading-tight truncate">
              {card.value}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#7E7E87] mt-0.5 xl:mt-1 truncate">
              {card.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


