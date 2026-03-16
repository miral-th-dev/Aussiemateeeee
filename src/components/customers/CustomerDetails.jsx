import { useEffect, useState } from "react";
import {
  Ban,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import CustomMenu from "../common/CustomMenu";
import ActionModal from "../common/ActionModal";
import suspenseKycImg from "../../assets/image/suspenseKyc.svg";
import approvalsBg from "../../assets/image/approvalsBg.svg";
import OverviewTab from "./OverviewTab";
import JobsHistoryTab from "./JobsHistoryTab";
import PaymentsTab from "./PaymentsTab";
import FeedbackTab from "./FeedbackTab";
import JobDetails from "../jobs/JobDetails";
import { fetchCustomerJobs, fetchCustomerReviews } from "../../api/services/customersService";

export default function CustomerDetails({ customer, onBackToList, onJobViewDetail }) {
  if (!customer) return null;

  const [activeAction, setActiveAction] = useState(null); // "suspend" | null
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [customerJobs, setCustomerJobs] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Notify parent if we are viewing job details
  useEffect(() => {
    if (onJobViewDetail) {
      onJobViewDetail(!!selectedJob);
    }
  }, [selectedJob, onJobViewDetail]);

  // Avatar helpers (same as CustomersTable fallback)
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:");
  };

  const getInitials = (firstName, lastName, fullName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    }
    if (fullName) {
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}`;
      }
      return nameParts[0].charAt(0).toUpperCase();
    }
    return "?";
  };

  const getAvatarColor = (name, id) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52BE80",
      "#EC7063",
      "#5DADE2",
      "#F1948A",
      "#82E0AA",
      "#F4D03F",
      "#A569BD",
    ];
    const str = name || id || "default";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    // reset when switching customers
    setAvatarFailed(false);
  }, [customer?.id, customer?._id]);

  useEffect(() => {
    const loadCustomerJobs = async () => {
      const customerId = customer?._id || customer?.id;
      if (!customerId) return;
      try {
        setLoadingJobs(true);
        const resp = await fetchCustomerJobs(customerId, { limit: 10 });
        const data = resp?.data || resp;
        const list = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
        setCustomerJobs(list);
      } catch (e) {
        console.warn("Failed to load customer jobs", e);
        setCustomerJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadCustomerJobs();
  }, [customer?._id, customer?.id]);

  useEffect(() => {
    const loadCustomerReviews = async () => {
      const customerId = customer?._id || customer?.id;
      if (!customerId) return;
      try {
        const resp = await fetchCustomerReviews(customerId, { page: 1, limit: 50 });
        const data = resp?.data || resp;
        const list = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];
        setCustomerReviews(list);
        setReviewsPagination(data?.pagination || resp?.pagination || null);
      } catch (e) {
        console.warn("Failed to load customer reviews", e);
        setCustomerReviews([]);
        setReviewsPagination(null);
      }
    };

    loadCustomerReviews();
  }, [customer?._id, customer?.id]);

  const closeModal = () => setActiveAction(null);

  const tabs = [
    { id: "overview", label: "Overview (Default)", shortLabel: "Overview" },
    { id: "jobsHistory", label: "Jobs History", shortLabel: "Jobs" },
    // { id: "payments", label: "Payments & Escrow", shortLabel: "Payments" },
    { id: "feedback", label: "Feedback", shortLabel: "Feedback" },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "10 Jul 2025";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format phone number (remove +61 and format)
  const formatPhone = (phone) => {
    if (!phone) return "234 435 546";
    return phone.replace(/\+61\s?/, "").replace(/\s/g, " ");
  };

  if (selectedJob) {
    return (
      <JobDetails
        job={selectedJob}
        onBackToList={() => setSelectedJob(null)}
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Profile header */}
      <div
        className="px-4 md:px-6 lg:px-10 pt-8 md:pt-10 pb-6 relative overflow-hidden bg-white rounded-[20px] border border-[#EEF0F5] shadow-sm"
        style={{
          backgroundImage: `url(${approvalsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top-right actions menu */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EAFFF1] border border-[#17C65333] text-[#17C653]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17C653]"></span>
            {customer.status || "Active"}
          </span>

          {/* Menu */}
          <CustomMenu
            align="right"
            items={[
              {
                id: "suspend",
                label: "Suspend",
                icon: <Ban size={18} className="text-[#9CA3AF]" />,
                onClick: () => {
                  setActiveAction("suspend");
                },
              },
            ]}
          />
        </div>

        <div className="relative flex flex-col items-center text-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] border-[#EBF2FD] shadow-md mb-1 bg-white flex items-center justify-center">
            {customer.avatar && isValidImageUrl(customer.avatar) && !avatarFailed ? (
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: getAvatarColor(customer.name, customer.id || customer._id) }}
              >
                <span className="text-white font-semibold text-lg">
                  {getInitials(customer.firstName, customer.lastName, customer.name)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Name */}
            <h2 className="text-base md:text-lg font-semibold text-primary">
              {customer.name}
            </h2>

            {/* Contact info */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-1 text-xs md:text-sm text-primary-light font-medium">
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="md:w-[14px] md:h-[14px]" />
                <span>{customer.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="md:w-[14px] md:h-[14px]" />
                <span>{formatPhone(customer.phone)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
                <span>Joined: {formatDate(customer.joined)}</span>
              </span>
            </div>
          </div>

          {/* Total Spend Box */}
          <div className="mt-4 px-3 md:px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md">
            <span className="text-xs md:text-sm font-medium">
              <span className="text-primary font-medium">Total Spend</span>{" "}
              <span className="text-primary-light font-semibold">
                AU${(typeof customer.spend === "number" ? customer.spend : Number(customer.spend || 0)).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#EEF0F5]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 md:px-3 lg:px-6 py-2 md:py-2.5 lg:py-3 text-xs md:text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer flex-shrink-0 ${activeTab === tab.id
                ? "border-[#1F6FEB] text-[#1F6FEB] font-medium"
                : "border-transparent text-[#78829D] hover:text-primary"
                }`}
            >
              <span className="md:hidden">{tab.shortLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Heading */}
      <div className="mt-4">
        <h2 className="font-semibold text-primary">
          {tabs.find((tab) => tab.id === activeTab)?.label || "Overview (Default)"}
        </h2>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            customer={customer}
            jobs={customerJobs}
            onViewJobs={() => setActiveTab("jobsHistory")}
            loading={loadingJobs}
          />
        )}
        {activeTab === "jobsHistory" && (
          <JobsHistoryTab
            customer={customer}
            jobs={customerJobs}
            onViewJob={(job) => {
              const amount = job.amount || 0;
              const platformFees = Math.round(amount * 0.15 * 100) / 100;
              const gst = Math.round(amount * 0.1 * 100) / 100;
              const escrow = Math.max(amount - (platformFees + gst), 0);

              const mappedJob = {
                ...job,
                jobType: job.jobType || "Cleaning",
                jobStatus: job.status || job.jobStatus || "Completed",
                paymentStatus: job.paymentStatus || job.status || "Held",
                date: job.date,
                amountPaid: amount,
                customer: {
                  name: customer.name,
                  email: customer.email,
                  avatar: customer.avatar,
                },
                cleaner: {
                  name: job.cleaner?.name,
                  avatar: job.cleaner?.avatar,
                },
                payment: {
                  amountPaid: amount,
                  platformFees,
                  gst,
                  escrow,
                  escrowReleased: job.date,
                  escrowStatus: job.paymentStatus || job.status || "Held",
                },
              };
              setSelectedJob(mappedJob);
            }}
          />
        )}
        {activeTab === "payments" && <PaymentsTab customer={customer} />}
        {activeTab === "feedback" && (
          <FeedbackTab
            customer={customer}
            reviews={customerReviews}
            pagination={reviewsPagination}
          />
        )}
      </div>

      {/* Global action modal for Suspend */}
      {activeAction && (
        <ActionModal
          isOpen={!!activeAction}
          onClose={closeModal}
          illustration={
            <img
              src={suspenseKycImg}
              alt="Suspend customer"
              className="max-h-52 w-auto"
            />
          }
          title={`Suspend ${customer.name}`}
          description={`Are you sure you want to suspend ${customer.name}?`}
          primaryLabel="Yes, Suspend"
          primaryVariant="danger"
          onPrimary={() => {
            // TODO: wire up API / status updates here
            closeModal();
          }}
          hideSecondary={true}
        />
      )}
    </div>
  );
}

