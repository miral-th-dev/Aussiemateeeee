import { useState, useEffect, useCallback } from "react";
import {
  Star,
  FileText,
  CheckCircle2,
  CheckCircle2 as ApproveIcon,
  XCircle,
  Ban,
  User,
  Calendar,
  Briefcase,
  Eye,
} from "lucide-react";
import approvalsBg from "../../assets/image/approvalsBg.svg";
import approveKycImg from "../../assets/image/approveKyc.svg";
import rejectKycImg from "../../assets/image/rejectKyc.svg";
import suspenseKycImg from "../../assets/image/suspenseKyc.svg";
import silverTierIcon from "../../assets/icon/silver.svg";
import goldTierIcon from "../../assets/icon/gold.svg";
import bronzeTierIcon from "../../assets/icon/bronze.svg";
import CustomMenu from "../common/CustomMenu";
import Checkbox from "../common/Checkbox";
import ActionModal from "../common/ActionModal";
import Input from "../common/Input";
import {
  fetchCleanersJobsStats,
  fetchCleanerById,
  fetchCleanerKYCById,
  updateCleanerKycDocumentStatus,
  updateCleanerKycVerification,
  approveCleanerKyc,
  verifyCleanerAbn,
} from "../../api/services/cleanersService";
import { suspendUser } from "../../api/services/userService";
import Avatar from "../common/Avatar";
const INITIAL_DOCUMENTS = [
  {
    id: 1,
    label: "ABN Number",
    value: "24352 65467",
    type: "abn",
    status: "Verified",
  },
  {
    id: 2,
    label: "Police Check",
    value: "Police Verification.pdf",
    type: "file",
    status: "Approved",
  },
  {
    id: 3,
    label: "Photo ID",
    value: "John doe.pdf",
    type: "file",
    status: "Pending",
  },
  {
    id: 4,
    label: "Training Certificates",
    value: "Certificate.png",
    type: "image",
    status: "Pending",
  },
];

export default function ApprovalsDetails({ cleaner, onBackToList }) {
  if (!cleaner) return null;

  // Get original API data if available
  const originalData = cleaner.originalData || cleaner;

  // Map API data to documents structure
  const mapDocumentsFromAPI = useCallback((kycData) => {
    const docs = [];
    let docId = 1;
    const data = kycData || originalData;

    // ABN Number - always show (null if missing), reading from nested cleaner if needed
    const abnSource = data.cleaner || data;
    const abnValue = abnSource?.abnNumber ?? data.abnNumber ?? null;
    // Backend uses abnVerified (boolean) + abnVerifiedAt
    const abnVerified = abnSource?.abnVerified ?? data.abnVerified ?? false;

    docs.push({
      id: docId++,
      label: "ABN Number",
      value: abnValue !== null && abnValue !== undefined ? abnValue : "null",
      type: "abn",
      status: abnVerified ? "Verified" : "Pending",
      abnVerified: !!abnVerified,
      abnVerifiedAt: abnSource?.abnVerifiedAt ?? data.abnVerifiedAt ?? null,
    });

    // Map documents from backend structure
    if (data.documents) {
      const docsObj = data.documents;

      // Police Check
      if (docsObj.policeCheck) {
        const policeCheck = docsObj.policeCheck;
        const isImage = policeCheck.fileType?.startsWith('image/') ||
          policeCheck.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        docs.push({
          id: docId++,
          label: "Police Check",
          value: policeCheck.fileName || policeCheck.url || "",
          type: isImage ? "image" : "file",
          status: policeCheck.status === "pending_review" ? "Pending" :
            policeCheck.status === "approved" ? "Approved" :
              policeCheck.status === "rejected" ? "Rejected" : "Pending",
          url: policeCheck.url,
          fileName: policeCheck.fileName,
          fileType: policeCheck.fileType,
          originalStatus: policeCheck.status,
        });
      } else {
        docs.push({
          id: docId++,
          label: "Police Check",
          value: null,
          type: "file",
          status: "Not Uploaded",
        });
      }

      // Photo ID
      if (docsObj.photoId) {
        const photoId = docsObj.photoId;
        const isImage = photoId.fileType?.startsWith('image/') ||
          photoId.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        docs.push({
          id: docId++,
          label: "Photo ID",
          value: photoId.fileName || photoId.url || "",
          type: isImage ? "image" : "file",
          status: photoId.status === "pending_review" ? "Pending" :
            photoId.status === "approved" ? "Approved" :
              photoId.status === "rejected" ? "Rejected" : "Pending",
          url: photoId.url,
          fileName: photoId.fileName,
          fileType: photoId.fileType,
          originalStatus: photoId.status,
        });
      } else {
        docs.push({
          id: docId++,
          label: "Photo ID",
          value: null,
          type: "file",
          status: "Not Uploaded",
        });
      }

      // Training Certificates
      if (docsObj.trainingCertificates) {
        const trainingCert = docsObj.trainingCertificates;
        const isImage = trainingCert.fileType?.startsWith('image/') ||
          trainingCert.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        docs.push({
          id: docId++,
          label: "Training Certificates",
          value: trainingCert.fileName || trainingCert.url || "",
          type: isImage ? "image" : "file",
          status: trainingCert.status === "pending_review" ? "Pending" :
            trainingCert.status === "approved" ? "Approved" :
              trainingCert.status === "rejected" ? "Rejected" : "Pending",
          url: trainingCert.url,
          fileName: trainingCert.fileName,
          fileType: trainingCert.fileType,
          originalStatus: trainingCert.status,
        });
      } else {
        docs.push({
          id: docId++,
          label: "Training Certificates",
          value: null,
          type: "image",
          status: "Not Uploaded",
        });
      }

      // Visa/Work Rights
      if (docsObj.visaWorkRights) {
        const visaRights = docsObj.visaWorkRights;
        const isImage = visaRights.fileType?.startsWith('image/') ||
          visaRights.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        docs.push({
          id: docId++,
          label: "Visa/Work Rights",
          value: visaRights.fileName || visaRights.url || "",
          type: isImage ? "image" : "file",
          status: visaRights.status === "pending_review" ? "Pending" :
            visaRights.status === "approved" ? "Approved" :
              visaRights.status === "rejected" ? "Rejected" : "Pending",
          url: visaRights.url,
          fileName: visaRights.fileName,
          fileType: visaRights.fileType,
          originalStatus: visaRights.status,
        });
      } else {
        docs.push({
          id: docId++,
          label: "Visa/Work Rights",
          value: null,
          type: "file",
          status: "Not Uploaded",
        });
      }
    }

    return docs;
  }, [originalData]);

  const [documents, setDocuments] = useState(() => mapDocumentsFromAPI(originalData));
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // "approve" | "reject" | "suspend" | null
  const [completedJobs, setCompletedJobs] = useState(() => {
    const cleanerSrc = originalData.cleaner || originalData;
    return cleanerSrc?.completedJobs ?? 0;
  });
  const [averageRating, setAverageRating] = useState(() => {
    const cleanerSrc = originalData.cleaner || originalData;
    return cleanerSrc?.averageRating ?? 0;
  });
  const [cleanerTier, setCleanerTier] = useState(() => {
    const cleanerSrc = originalData.cleaner || originalData;
    return cleanerSrc?.tier ?? "none";
  });

  const isKycComplete = documents.length > 0 && documents.every(doc =>
    doc.status !== "Not Uploaded" &&
    !(doc.type === "abn" && (!doc.value || doc.value === "null" || doc.value === ""))
  );
  const [savingKyc, setSavingKyc] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, docId: null, docKey: null, docLabel: "" });
  const [rejectReason, setRejectReason] = useState("");

  const cleanerId = originalData._id || cleaner._id || cleaner.id;

  const getOverallKycUiStatus = useCallback((docs) => {
    // ABN verified is required for overall "Verified"
    const abn = docs.find((d) => d.type === "abn");
    const abnVerified = abn?.status === "Verified";

    const docStatuses = docs
      .filter((d) => d.type !== "abn")
      .filter((d) => d.status !== "Not Uploaded")
      .map((d) => d.status);

    if (docStatuses.includes("Rejected")) return "Rejected";
    if (docStatuses.length === 0) return "Pending";
    const allApproved = docStatuses.every((s) => s === "Approved");

    if (allApproved && abnVerified) return "Verified";
    if (allApproved) return "Approved";
    return "Pending";
  }, []);



  // Fetch cleaner KYC documents
  useEffect(() => {
    const loadKYCDocuments = async () => {
      try {
        setLoadingDocuments(true);

        // If we already have full documents in originalData, prefer that and skip API
        const hasLocalDocs = !!originalData?.documents;

        if (hasLocalDocs) {
          const mappedDocs = mapDocumentsFromAPI(originalData);
          setDocuments(mappedDocs);
          setLoadingDocuments(false);
          return;
        }
        // Get cleaner ID from originalData or cleaner
        const cleanerId = originalData._id || cleaner._id || cleaner.id;

        if (!cleanerId) {
          // Fallback to original data mapping
          const mappedDocs = mapDocumentsFromAPI();
          setDocuments(mappedDocs);
          setLoadingDocuments(false);
          return;
        }

        const response = await fetchCleanerKYCById(cleanerId);
        let kycData = response?.data || response;

        // Handle case where API returns an array of KYC records
        if (Array.isArray(kycData)) {
          kycData =
            kycData.find(
              (item) =>
                item.cleaner?._id === cleanerId ||
                item._id === cleanerId
            ) || kycData[0];
        }

        if (kycData) {
          const mappedDocs = mapDocumentsFromAPI(kycData);
          setDocuments(mappedDocs);

          // Extract stats and names from kycData.cleaner if available
          const cleanerInfo = kycData.cleaner || kycData;
          if (cleanerInfo.firstName !== undefined) cleaner.firstName = cleanerInfo.firstName;
          if (cleanerInfo.lastName !== undefined) cleaner.lastName = cleanerInfo.lastName;
          if (cleanerInfo.completedJobs !== undefined) setCompletedJobs(cleanerInfo.completedJobs);
          if (cleanerInfo.averageRating !== undefined) setAverageRating(cleanerInfo.averageRating);
          if (cleanerInfo.tier !== undefined) setCleanerTier(cleanerInfo.tier);
        } else {
          // Fallback to original data mapping
          const mappedDocs = mapDocumentsFromAPI();
          setDocuments(mappedDocs);
        }
      } catch (error) {
        console.warn("Failed to load cleaner KYC documents", error);
        // Fallback to original data mapping
        const mappedDocs = mapDocumentsFromAPI();
        setDocuments(mappedDocs);
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (cleaner) {
      loadKYCDocuments();
    }
  }, [cleaner, originalData, mapDocumentsFromAPI]);

  const tier = cleanerTier || cleaner.tier || originalData.tier || "none";
  const tierLabel = tier.toLowerCase() === "none"
    ? "None Tier"
    : `${tier.charAt(0).toUpperCase()}${tier.slice(1).toLowerCase()} Tier`;

  const tierIcon =
    tier.toLowerCase() === "gold"
      ? goldTierIcon
      : tier.toLowerCase() === "bronze"
        ? bronzeTierIcon
        : tier.toLowerCase() === "none"
          ? null
          : silverTierIcon;

  const persistOverallStatusIfPossible = useCallback(
    async (nextDocs) => {
      if (!cleanerId) return;
      const overallUi = getOverallKycUiStatus(nextDocs);

      // If fully verified, call backend "approve all" route (this is the source of truth)
      if (overallUi === "Verified") {
        try {
          // Backend route provided: PUT /admin/cleaners/kyc/:cleanerId/approve
          await approveCleanerKyc(cleanerId, { action: "approve", documentType: "all" });
        } catch (e) {
          console.warn("Failed to approve cleaner KYC", e);
        }
      }
    },
    [cleanerId, getOverallKycUiStatus]
  );

  const updateDocumentStatusLocal = useCallback((id, status) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status } : doc)));
  }, []);

  const handleAbnVerifiedToggle = async (checked) => {
    // Once verified, ABN cannot be changed from UI
    const abnDoc = documents.find((d) => d.type === "abn");
    if (abnDoc?.abnVerified) return;

    updateDocumentStatusLocal(1, checked ? "Verified" : "Pending");
    if (!cleanerId) return;
    try {
      setSavingKyc(true);
      if (checked) {
        // Backend route provided: PUT /admin/cleaners/:cleanerId/abn/verify
        await verifyCleanerAbn(cleanerId, true);
        // Mark ABN as verified locally (so checkbox stays checked)
        setDocuments((prev) =>
          prev.map((d) =>
            d.type === "abn"
              ? { ...d, status: "Verified", abnVerified: true, abnVerifiedAt: new Date().toISOString() }
              : d
          )
        );
      } else {
        // No explicit un-verify route provided; fallback to generic update if supported
        await updateCleanerKycVerification(cleanerId, false);
      }
      // Also re-evaluate overall status
      setDocuments((prev) => {
        const next = prev.map((doc) =>
          doc.type === "abn" ? { ...doc, status: checked ? "Verified" : "Pending" } : doc
        );
        persistOverallStatusIfPossible(next);
        return next;
      });
    } catch (e) {
      console.error("Failed to update ABN verification", e);
    } finally {
      setSavingKyc(false);
    }
  };

  const refreshKycDocuments = useCallback(async () => {
    try {
      if (!cleanerId) return;
      const resp = await fetchCleanerKYCById(cleanerId);
      let kycData = resp?.data || resp;
      if (Array.isArray(kycData)) {
        kycData =
          kycData.find(
            (item) => item.cleaner?._id === cleanerId || item._id === cleanerId
          ) || kycData[0];
      }
      if (kycData) setDocuments(mapDocumentsFromAPI(kycData));
    } catch (e) {
      console.warn("Failed to refresh KYC documents", e);
    }
  }, [cleanerId, mapDocumentsFromAPI]);

  const submitDocReview = async ({ docId, action, documentKey, rejectionReason }) => {
    const isBulkAll = documentKey === "all";
    const doc = isBulkAll ? null : documents.find((d) => d.id === docId);
    if ((!isBulkAll && !doc) || !cleanerId) return;

    const nextStatus = action === "approve" ? "Approved" : "Rejected";

    try {
      setSavingKyc(true);
      // Preferred backend route:
      // PUT /admin/cleaners/kyc/:cleanerId/approve  { action: "approve"|"reject", documentType }
      const resp = await approveCleanerKyc(cleanerId, {
        action,
        documentType: documentKey,
        ...(action === "reject" ? { rejectionReason: rejectionReason || "" } : {}),
      });

      const apiData = resp?.data || resp;
      const updatedDocs = apiData?.documents;

      // Sync UI from backend response if present
      if (updatedDocs && typeof updatedDocs === "object") {
        setDocuments((prev) =>
          prev.map((d) => {
            if (d.type === "abn") return d;
            const key =
              d.label === "Police Check"
                ? "policeCheck"
                : d.label === "Photo ID"
                  ? "photoId"
                  : d.label === "Training Certificates"
                    ? "trainingCertificates"
                    : d.label === "Visa/Work Rights"
                      ? "visaWorkRights"
                      : null;
            if (!key) return d;
            const s = updatedDocs?.[key]?.status;
            if (!s) return d;
            const mapped =
              s === "approved" ? "Approved" : s === "rejected" ? "Rejected" : "Pending";
            return { ...d, status: mapped };
          })
        );
      } else {
        // Fallback: update locally
        if (isBulkAll) {
          setDocuments((prev) =>
            prev.map((d) => (d.type === "abn" ? d : { ...d, status: nextStatus }))
          );
        } else {
          updateDocumentStatusLocal(docId, nextStatus);
        }
      }

      // Still attempt to persist overall status for table if backend supports it
      const nextDocs = isBulkAll
        ? documents.map((d) => (d.type === "abn" ? d : { ...d, status: nextStatus }))
        : documents.map((d) => (d.id === docId ? { ...d, status: nextStatus } : d));
      await persistOverallStatusIfPossible(nextDocs);
    } catch (e) {
      console.error("Failed to update document status", e);
      // Roll back on failure
      if (isBulkAll) {
        await refreshKycDocuments();
      } else {
        updateDocumentStatusLocal(docId, "Pending");
      }
    } finally {
      setSavingKyc(false);
    }
  };

  const handleReviewDoc = async (docId, action) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc || !cleanerId) return;

    const docKeyMap = {
      "Police Check": "policeCheck",
      "Photo ID": "photoId",
      "Training Certificates": "trainingCertificates",
      "Visa/Work Rights": "visaWorkRights",
    };
    const documentKey = docKeyMap[doc.label];
    if (!documentKey) return;

    if (action === "reject") {
      setRejectReason("");
      setRejectModal({ open: true, docId, docKey: documentKey, docLabel: doc.label });
      return;
    }

    await submitDocReview({ docId, action, documentKey });
  };

  const closeModal = () => setActiveAction(null);

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto ">
      {/* Profile header */}
      <div className="relative">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundImage: `url(${approvalsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative flex flex-col items-center text-center gap-2 pt-4 pb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#EBF2FD] shadow-md mb-1 bg-white flex items-center justify-center">
              <Avatar
                src={cleaner.avatar}
                firstName={cleaner.firstName}
                lastName={cleaner.lastName}
                fullName={cleaner.name}
                id={cleanerId}
                className="w-full h-full"
                size={96}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-primary">
                {cleaner.name}
              </h2>

              {/* Role, joined date, jobs completed */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-1 text-sm text-[#78829D]">
                <span className="flex items-center gap-1.5">
                  <User size={16} className="text-[#78829D]" />
                  <span>{cleaner.role || "Professional Cleaner"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-[#78829D]" />
                  <span>Joined: {cleaner.joined}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={16} className="text-[#78829D]" />
                  <span>Jobs Completed: {completedJobs}</span>
                </span>
              </div>
            </div>

            {/* Rating & Tier */}
            <div className="flex items-center justify-center gap-3 mt-4 ">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-[#FFF8DD] border border-[#F6B10033] text-[#F6B100]">
                <Star size={14} className="text-[#F6B100] fill-[#F6B100]" />
                <span>{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]">
                {tierIcon && <img src={tierIcon} alt={tierLabel} className="w-4 h-4" />}
                <span>{tierLabel}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top-right actions menu - positioned outside overflow-hidden container */}
        <div className="absolute top-4 right-4 z-10">
          <CustomMenu
            align="right"
            items={[
              {
                id: "approve",
                label: "Approve (Verify KYC)",
                icon: <ApproveIcon size={18} className="text-[#2563EB]" />,
                onClick: () => {
                  setActiveAction("approve");
                },
              },
              {
                id: "reject",
                label: "Reject Application",
                icon: <XCircle size={18} className="text-[#9CA3AF]" />,
                onClick: () => {
                  setActiveAction("reject");
                },
              },
              {
                id: "suspend",
                label: "Suspend",
                icon: <Ban size={18} className="text-[#9CA3AF]" />,
                divider: true,
                onClick: () => {
                  setActiveAction("suspend");
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Documents gallery */}
      <div className="bg-white rounded-[12px] border border-[#EEF0F5] shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-3 border-b border-[#EEF0F5]">
          <h3 className="font-semibold text-primary">
            Documents Gallery
          </h3>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {loadingDocuments ? (
            <div className="px-4 md:px-6 py-8 text-center text-[#9CA3AF]">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="px-4 md:px-6 py-8 text-center text-[#9CA3AF]">
              No documents available
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 font-medium min-w-0"
              >
                {/* Label */}
                <div className="w-full md:w-1/5 flex items-center gap-2 text-sm text-primary ">
                  <span className="text-primary font-medium">{doc.id}.</span>
                  <span className="font-medium text-primary">
                    {doc.label}
                  </span>
                </div>

                {/* Value + status/actions */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  {/* ABN row with checkbox + value */}
                  {doc.type === "abn" && (
                    <div className="flex w-full items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-[#111827]">
                          {doc.value}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={doc.status === "Verified" || doc.abnVerified === true}
                          onChange={(e) => handleAbnVerifiedToggle(e.target.checked)}
                          disabled={savingKyc || doc.abnVerified === true}
                          checkboxSize="w-4 h-4"
                          className="items-center"
                        />
                        Verified
                      </div>
                    </div>
                  )}

                  {/* Text value rows (non‑ABN) */}
                  {doc.type === "text" && doc.label !== "ABN Number" && (
                    <div className="w-full md:w-2/3">
                      <div className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs text-[#111827]">
                        {doc.value}
                      </div>
                    </div>
                  )}

                  {/* File rows with red PDF icon */}
                  {doc.type === "file" && doc.status !== "Not Uploaded" && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer hover:underline"
                      >
                        <FileText
                          size={18}
                          className="text-[#EF4444]"
                        />
                        <span className="text-sm text-primary">{doc.value || doc.fileName}</span>
                      </a>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                        title="View document"
                      >
                        <Eye size={14} />
                        View
                      </a>
                    </div>
                  )}

                  {/* Image preview */}
                  {doc.type === "image" && doc.status !== "Not Uploaded" && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="w-full md:w-32 h-20 border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F9FAFB]">
                        {doc.url ? (
                          <img
                            src={doc.url}
                            alt={doc.fileName || doc.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#9CA3AF]">
                            Preview
                          </div>
                        )}
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                          title="View image"
                        >
                          <Eye size={14} />
                          View
                        </a>
                      )}
                    </div>
                  )}

                  {/* No document uploaded message */}
                  {doc.status === "Not Uploaded" && (
                    <div className="text-sm text-[#9CA3AF] italic">
                      No document uploaded
                    </div>
                  )}

                  {/* Status / actions (skip for ABN row and Not Uploaded) */}
                  {doc.type !== "abn" && doc.status !== "Not Uploaded" && (
                    <div className="flex items-center gap-3 text-sm md:ml-auto justify-start md:justify-end">
                      {doc.status === "Verified" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAFFF1] text-[#17C653] border border-[#17C65333] ">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      )}

                      {doc.status === "Approved" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAFFF1] text-[#17C653] border border-[#17C65333] !cursor-pointer">
                          <CheckCircle2 size={14} />
                          Approved
                        </span>
                      )}

                      {doc.status === "Rejected" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFE5E9] text-[#F1416C] border border-[#F1416C33] !cursor-pointer">
                          <XCircle size={14} />
                          Rejected
                        </span>
                      )}

                      {doc.status === "Pending" && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={savingKyc}
                            onClick={() => handleReviewDoc(doc.id, "approve")}
                            className="text-[#17C653] font-medium hover:underline cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={savingKyc}
                            onClick={() => handleReviewDoc(doc.id, "reject")}
                            className="text-[#F1416C] font-medium hover:underline cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global action modal for Approve / Reject / Suspend */}
      {activeAction && (
        <ActionModal
          isOpen={!!activeAction}
          onClose={closeModal}
          illustration={
            <img
              src={
                activeAction === "approve"
                  ? approveKycImg
                  : activeAction === "reject"
                    ? rejectKycImg
                    : suspenseKycImg
              }
              alt={
                activeAction === "approve"
                  ? "Approve KYC"
                  : activeAction === "reject"
                    ? "Reject application"
                    : "Suspend cleaner"
              }
              className="max-h-52 w-auto"
            />
          }
          title={
            activeAction === "approve"
              ? `Approve ${cleaner.name} as ${cleaner.role || "Professional Cleaner"}?`
              : activeAction === "reject"
                ? "Reject Application"
                : `Suspend ${cleaner.name}`
          }
          description={
            activeAction === "approve"
              ? (
                <span className="flex flex-col gap-2">
                  <span>{`This will enable ${cleaner.name} to receive jobs in their radius (${cleaner.radius || originalData.radius || "0–20 km"}).`}</span>
                  {!isKycComplete && (
                    <span className="text-[#F1416C] font-semibold text-xs mt-2 bg-[#FFE5E9] p-3 rounded-lg border border-[#F1416C33] text-left">
                      ⚠️ Cannot approve KYC. Please ensure all documents (Police Check, Photo ID, Training Certificates) are uploaded and the ABN number is provided.
                    </span>
                  )}
                </span>
              )
              : activeAction === "reject"
                ? `Are you sure you want to reject application of ${cleaner.name}?`
                : `Are you sure you want to suspend ${cleaner.name}?`
          }
          primaryLabel={
            activeAction === "approve"
              ? isKycComplete
                ? "Approve KYC"
                : "Missing Documents"
              : activeAction === "reject"
                ? "Yes, Reject"
                : savingKyc
                  ? "Suspending..."
                  : "Yes, Suspend"
          }
          primaryVariant={
            activeAction === "approve" ? "primary" : "danger"
          }
          onPrimary={async () => {
            if (!cleanerId) {
              closeModal();
              return;
            }

            // Approve KYC = verify ABN + approve all documents
            if (activeAction === "approve") {
              if (!isKycComplete) {
                return;
              }
              try {
                setSavingKyc(true);
                const abnDoc = documents.find((d) => d.type === "abn");
                if (abnDoc && !(abnDoc.abnVerified === true || abnDoc.status === "Verified")) {
                  await verifyCleanerAbn(cleanerId, true);
                }
                await approveCleanerKyc(cleanerId, { action: "approve", documentType: "all" });
                await refreshKycDocuments();
              } catch (e) {
                console.error("Failed to approve all KYC", e);
              } finally {
                setSavingKyc(false);
                closeModal();
              }
              return;
            }

            // Reject Application = reject all documents (ABN will remain Pending/Verified per backend capability)
            if (activeAction === "reject") {
              closeModal();
              setRejectReason("");
              setRejectModal({ open: true, docId: -1, docKey: "all", docLabel: "Application" });
              return;
            }

            // Suspend = delete user via DELETE /api/admin/users/:userId
            if (activeAction === "suspend") {
              try {
                setSavingKyc(true);
                await suspendUser(cleanerId);
                // Navigate back to approvals list after successful suspend
                closeModal();
                if (onBackToList) {
                  onBackToList();
                }
              } catch (e) {
                console.error("Failed to suspend user", e);
                // Show error and keep modal open so user can retry
                alert(e?.response?.data?.message || e?.message || "Failed to suspend user. Please try again.");
              } finally {
                setSavingKyc(false);
              }
              return;
            }

            closeModal();
          }}
          hideSecondary={true}
        />
      )}

      {/* Reject reason modal */}
      <ActionModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, docId: null, docKey: null, docLabel: "" })}
        illustration={null}
        title={`Reject ${rejectModal.docLabel}`}
        description={
          <div className="mt-4 text-left">
            <Input
              label="Rejection reason"
              placeholder="Write reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        }
        primaryLabel={savingKyc ? "Rejecting..." : "Reject"}
        primaryVariant="danger"
        onPrimary={async () => {
          const reason = rejectReason.trim();
          if (!reason) return;
          await submitDocReview({
            docId: rejectModal.docId,
            action: "reject",
            documentKey: rejectModal.docKey,
            rejectionReason: reason,
          });
          setRejectModal({ open: false, docId: null, docKey: null, docLabel: "" });
          setRejectReason("");
        }}
        secondaryLabel="Cancel"
        onSecondary={() => {
          setRejectModal({ open: false, docId: null, docKey: null, docLabel: "" });
          setRejectReason("");
        }}
      />
    </div>
  );
}
