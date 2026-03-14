import { useEffect, useState } from "react";
import Toggle from "../common/Toggle";
import uploadCircle from "../../assets/icon/uploadCircle.svg";
import memberCircle from "../../assets/icon/memberCircle.svg";
import dollerCircle from "../../assets/icon/dollerCircle.svg";
import contactCircle from "../../assets/icon/contactCircle.svg";
import verticalLine from "../../assets/image/verticalLine.svg";
import { fetchRecentActivity } from "../../api/services/dashboardService";

// const defaultActivities = [
//   {
//     id: 1,
//     title: "Reema P uploaded Police Check",
//     meta: "2025-09-19 09:12",
//     icon: uploadCircle,
//   },
//   {
//     id: 2,
//     title: "Job AM-20250919-001 created in Parramatta",
//     meta: "2025-09-19 08:40",
//     icon: memberCircle,
//   },
//   {
//     id: 3,
//     title: "Escrow AU$320 received from Selina K",
//     meta: "5 days ago, 4:07 PM",
//     icon: dollerCircle,
//   },
//   {
//     id: 4,
//     title: "Dispute D-20250915-004 opened by Meera S",
//     meta: "2025-09-15 12:10",
//     icon: contactCircle,
//   },
// ];

// Map backend activity payload to an icon
const getActivityIcon = (item) => {
  const type = (item?.type || "").toLowerCase();
  const title = (item?.title || "").toLowerCase();
  const desc = (item?.description || "").toLowerCase();

  // Combine all text for matching
  const combinedText = `${type} ${title} ${desc}`.toLowerCase();

  // Payment / escrow related (check first as it's more specific)
  if (
    combinedText.includes("escrow") ||
    combinedText.includes("payment") ||
    combinedText.includes("payout") ||
    combinedText.includes("received") ||
    combinedText.includes("paid")
  ) {
    return dollerCircle;
  }

  // Job related
  if (
    combinedText.includes("job") ||
    combinedText.includes("created") && (combinedText.includes("am") || combinedText.includes("job"))
  ) {
    return memberCircle;
  }

  // Document / verification / upload related
  if (
    combinedText.includes("document") ||
    combinedText.includes("upload") ||
    combinedText.includes("uploaded") ||
    combinedText.includes("police check") ||
    combinedText.includes("verification") ||
    combinedText.includes("certificate") ||
    combinedText.includes("license")
  ) {
    return uploadCircle;
  }

  // Dispute / contact related
  if (
    combinedText.includes("dispute") ||
    combinedText.includes("contact") ||
    combinedText.includes("complaint")
  ) {
    return contactCircle;
  }

  // Fallback to small dot (no custom icon)
  return null;
};

export default function RecentActivity({
  title = "Recent Activity",
  autoRefresh = true,
  onAutoRefreshChange,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await fetchRecentActivity();
      const list = response?.data || response || [];

      // Map only required fields: title + formatted timestamp (or description)
      const mapped = Array.isArray(list)
        ? list.slice(0, 10).map((item, index) => {
          const ts = item.timestamp ? new Date(item.timestamp) : null;
          const meta =
            ts && !isNaN(ts.getTime())
              ? ts.toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
              : item.description || "";

          return {
            id: item._id || item.id || index,
            title: item.title || "",
            meta,
            icon: getActivityIcon(item),
          };
        })
        : [];

      setActivities(mapped);
    } catch (error) {
      console.warn("Failed to load recent activity:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(true);
  }, []);

  // Optional auto-refresh every 60s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadActivities();
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);
  return (
    <div className="bg-white rounded-[16px] border border-[#EEF0F5] shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-7 py-4 border-b border-[#EEF0F5] pb-3">
        <h2 className="font-semibold text-primary">
          {title}
        </h2>
        <div className="flex items-center gap-2 text-sm font-medium text-[#4B5675]">
          <span>Auto refresh: {autoRefresh ? "on" : "off"}</span>
          <div className="pl-2">
            <Toggle
              checked={autoRefresh}
              onChange={onAutoRefreshChange}
            />
          </div>
        </div>
      </div>

      <div className=" px-7 py-4 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 text-sm">Loading activity...</p>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="rounded-full flex items-center justify-center">
                  {activity.icon ? (
                    <img
                      src={activity.icon}
                      alt=""
                      className="w-8 h-8"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#6563C1]" />
                  )}
                </div>
                {index !== activities.length - 1 && (
                  <img
                    src={verticalLine}
                    alt=""
                    className="flex-shrink-0"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1C1C1C]">
                  {activity.title}
                </p>
                <p className="text-[12px] text-[#7E7E87] mt-1">
                  {activity.meta}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 text-sm">No activity found</p>
          </div>
        )}
      </div>
    </div>
  );
}

