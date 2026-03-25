import { useState, useEffect } from "react";
import dashKYC from "../../assets/icon/dashKYC.svg";
import dashJobs from "../../assets/icon/dashJobs.svg";
import subscription from "../../assets/icon/subscription.svg";
import dashRevenue from "../../assets/icon/dashRevenue.svg";
import cardsBg from "../../assets/image/cardsBg.svg";
import { fetchCleanersKYCStats } from "../../api/services/cleanersService";
import { fetchJobsStats } from "../../api/services/jobService";
import { fetchRevenueMTD } from "../../api/services/dashboardService";
import { getCleanerSubscriptionsReport } from "../../api/services/subscriptionService";

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
  const [pendingKYC, setPendingKYC] = useState(null); // null means data not fetched yet
  const [totalJobs, setTotalJobs] = useState(null); // null means data not fetched yet
  const [activeSubscriptions, setActiveSubscriptions] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch KYC stats
        const kycResponse = await fetchCleanersKYCStats();

        // Handle different response structures
        const statsData = kycResponse?.data || kycResponse;

        if (statsData?.statusBreakdown) {
          // Calculate pending KYC: sum of no_documents, partial, and pending_review
          // This matches the logic in ApprovalsTable.jsx
          const pendingCount =
            (statsData.statusBreakdown.no_documents || 0) +
            (statsData.statusBreakdown.partial || 0) +
            (statsData.statusBreakdown.pending_review || 0);

          setPendingKYC(pendingCount);
        } else if (statsData?.pendingReview !== undefined) {
          // If API provides a direct pendingReview count, use it
          // But we should still sum the breakdown if available for accuracy
          const breakdown = statsData.statusBreakdown || {};
          const pendingCount =
            (breakdown.no_documents || 0) +
            (breakdown.partial || 0) +
            (breakdown.pending_review || 0) ||
            statsData.pendingReview;

          setPendingKYC(pendingCount);
        } else {
          // No valid data found
          setPendingKYC(0);
        }

        // Fetch Jobs stats
        try {
          const jobsResponse = await fetchJobsStats();

          // Debug: log the response
          console.log('StatsCards jobsResponse:', jobsResponse);

          // fetchJobsStats returns { totalJobs: number }
          if (jobsResponse?.totalJobs !== undefined && jobsResponse.totalJobs !== null) {
            setTotalJobs(jobsResponse.totalJobs);
          } else {
            console.warn('StatsCards: totalJobs is undefined or null in response:', jobsResponse);
            setTotalJobs(0);
          }
        } catch (jobsError) {
          console.error('Error fetching jobs stats:', jobsError);
          setTotalJobs(0);
        }

        // Fetch Active Subscriptions
        try {
          const subscriptionReport = await getCleanerSubscriptionsReport();
          if (subscriptionReport?.stats?.activeCleaners !== undefined) {
             setActiveSubscriptions(subscriptionReport.stats.activeCleaners);
          } else {
             setActiveSubscriptions(0);
          }
        } catch (subError) {
          console.error('Error fetching subscription stats:', subError);
          setActiveSubscriptions(0);
        }

        // Fetch Revenue MTD
        try {
          const revenueResponse = await fetchRevenueMTD();
          const revenueData = revenueResponse?.data || revenueResponse;
          if (revenueData?.summary?.totalRevenue !== undefined) {
            setTotalRevenue(revenueData.summary.totalRevenue);
          } else {
            setTotalRevenue(0);
          }
        } catch (revenueError) {
          console.error('Error fetching revenue stats:', revenueError);
          setTotalRevenue(0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Merge dynamic data with static cards
  const cards = items.map((card) => {
    if (card.isDynamic && card.label === "Pending KYC") {
      let displayValue;
      if (loading) {
        displayValue = "..."; // Loading state
      } else if (error || pendingKYC === null) {
        displayValue = "-"; // Show dash when data not available or error
      } else {
        displayValue = pendingKYC; // Show actual count
      }

      return {
        ...card,
        value: displayValue,
      };
    }

    if (card.isDynamic && card.label === "Total Jobs") {
      let displayValue;
      if (loading) {
        displayValue = "..."; // Loading state
      } else if (error || totalJobs === null) {
        displayValue = "-"; // Show dash when data not available or error
      } else {
        displayValue = totalJobs; // Show actual count
      }

      return {
        ...card,
        value: displayValue,
      };
    }

    if (card.isDynamic && card.label === "Active Subscription Cleaner") {
      let displayValue;
      if (loading) {
        displayValue = "...";
      } else if (error || activeSubscriptions === null) {
        displayValue = "-";
      } else {
        displayValue = activeSubscriptions;
      }

      return {
        ...card,
        value: displayValue,
      };
    }

    if (card.isDynamic && card.label === "Revenue (MTD)") {
      let displayValue;
      if (loading) {
        displayValue = "...";
      } else if (error || totalRevenue === null) {
        displayValue = "-";
      } else {
        displayValue = `AU$${Number(totalRevenue || 0).toLocaleString()}`;
      }

      return {
        ...card,
        value: displayValue,
      };
    }

    return card;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center gap-4 bg-white rounded-[20px] md:px-6 md:py-4 py-2 px-2 shadow-sm border border-[#EEF0F5] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cardsBg})` }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl">
            <img
              src={card.icon}
              alt={card.label}
              className="w-14 h-14"
            />
          </div>

          <div className="flex flex-col">
            <span className="md:text-[28px] text-lg font-semibold text-[#1C1C1C] leading-tight">
              {card.value}
            </span>
            <span className="text-sm font-medium text-[#7E7E87] mt-1">
              {card.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


