import { FileText, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Checkbox from "../common/Checkbox";
import {
    fetchCleanerKYCById,
} from "../../api/services/cleanersService";

export default function DocumentsTab({ cleaner }) {
    const originalData = cleaner?.originalData || cleaner;
    const cleanerId = originalData?._id || cleaner?._id || cleaner?.id;

    const mapDocumentsFromAPI = useCallback((kycData) => {
        const docs = [];
        let docId = 1;
        const data = kycData || originalData || {};

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
                const isImage =
                    policeCheck.fileType?.startsWith("image/") ||
                    policeCheck.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                docs.push({
                    id: docId++,
                    label: "Police Check",
                    value: policeCheck.fileName || policeCheck.url || "",
                    type: isImage ? "image" : "file",
                    status:
                        policeCheck.status === "pending_review"
                            ? "Pending"
                            : policeCheck.status === "approved"
                                ? "Approved"
                                : policeCheck.status === "rejected"
                                    ? "Rejected"
                                    : "Pending",
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
                const isImage =
                    photoId.fileType?.startsWith("image/") ||
                    photoId.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                docs.push({
                    id: docId++,
                    label: "Photo ID",
                    value: photoId.fileName || photoId.url || "",
                    type: isImage ? "image" : "file",
                    status:
                        photoId.status === "pending_review"
                            ? "Pending"
                            : photoId.status === "approved"
                                ? "Approved"
                                : photoId.status === "rejected"
                                    ? "Rejected"
                                    : "Pending",
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
                const isImage =
                    trainingCert.fileType?.startsWith("image/") ||
                    trainingCert.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                docs.push({
                    id: docId++,
                    label: "Training Certificates",
                    value: trainingCert.fileName || trainingCert.url || "",
                    type: isImage ? "image" : "file",
                    status:
                        trainingCert.status === "pending_review"
                            ? "Pending"
                            : trainingCert.status === "approved"
                                ? "Approved"
                                : trainingCert.status === "rejected"
                                    ? "Rejected"
                                    : "Pending",
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
                const isImage =
                    visaRights.fileType?.startsWith("image/") ||
                    visaRights.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                docs.push({
                    id: docId++,
                    label: "Visa/Work Rights",
                    value: visaRights.fileName || visaRights.url || "",
                    type: isImage ? "image" : "file",
                    status:
                        visaRights.status === "pending_review"
                            ? "Pending"
                            : visaRights.status === "approved"
                                ? "Approved"
                                : visaRights.status === "rejected"
                                    ? "Rejected"
                                    : "Pending",
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

    const statusPill = useMemo(() => {
        return (status) => {
            switch (status) {
                case "Verified":
                case "Approved":
                    return "bg-[#EAFFF1] text-[#17C653] border border-[#17C65333]";
                case "Rejected":
                    return "bg-[#FFE5E9] text-[#F1416C] border border-[#F1416C33]";
                case "Not Uploaded":
                    return "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]";
                default:
                    return "bg-[#FFF8DD] text-[#F6B100] border border-[#F6B10033]";
            }
        };
    }, []);

    // Fetch cleaner KYC documents (same as ApprovalsDetails)
    useEffect(() => {
        const loadKYCDocuments = async () => {
            try {
                setLoadingDocuments(true);

                // If we already have full documents in originalData, prefer that and skip API
                const hasLocalDocs = !!originalData?.documents;
                if (hasLocalDocs) {
                    setDocuments(mapDocumentsFromAPI(originalData));
                    return;
                }

                if (!cleanerId) {
                    setDocuments(mapDocumentsFromAPI(originalData));
                    return;
                }

                const response = await fetchCleanerKYCById(cleanerId);
                let kycData = response?.data || response;

                // Handle case where API returns an array of KYC records
                if (Array.isArray(kycData)) {
                    kycData =
                        kycData.find(
                            (item) =>
                                item.cleaner?._id === cleanerId || item._id === cleanerId
                        ) || kycData[0];
                }

                if (kycData) {
                    setDocuments(mapDocumentsFromAPI(kycData));
                } else {
                    setDocuments(mapDocumentsFromAPI(originalData));
                }
            } catch (error) {
                console.warn("Failed to load cleaner KYC documents", error);
                setDocuments(mapDocumentsFromAPI(originalData));
            } finally {
                setLoadingDocuments(false);
            }
        };

        if (cleaner) {
            loadKYCDocuments();
        }
    }, [cleaner, cleanerId, originalData, mapDocumentsFromAPI]);

    return (
        <div className="space-y-4">
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
                            <div className="w-full md:w-1/5 flex items-center gap-2 text-sm text-primary">
                                <span className="text-primary">{doc.id}.</span>
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
                                            <div className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-md px-3 py-2 text-sm ">
                                                {doc.value}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Checkbox
                                                checked={doc.status === "Verified" || doc.abnVerified === true}
                                                onChange={() => { }}
                                                disabled={true}
                                                checkboxSize="w-4 h-4"
                                                className="items-center"
                                            />
                                            Verified
                                        </div>
                                    </div>
                                )}

                                {/* File rows with red PDF icon */}
                                {doc.type === "file" && doc.status !== "Not Uploaded" && (
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer w-full md:w-auto hover:underline"
                                    >
                                        <FileText
                                            size={18}
                                            className="text-[#EF4444] flex-shrink-0"
                                        />
                                        <span className="text-sm text-primary">
                                            {doc.value || doc.fileName}
                                        </span>
                                    </a>
                                )}

                                {/* Image preview */}
                                {doc.type === "image" && doc.status !== "Not Uploaded" && (
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
                                )}

                                {/* No document uploaded message */}
                                {doc.status === "Not Uploaded" && (
                                    <div className="text-sm text-[#9CA3AF] italic">
                                        No document uploaded
                                    </div>
                                )}

                                {/* Status / actions (skip for ABN row) */}
                                {doc.type !== "abn" && doc.status !== "Not Uploaded" && (
                                    <div className="flex items-center gap-3 text-[11px] md:ml-auto justify-start md:justify-end">
                                        {doc.status === "Verified" && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusPill(doc.status)}`}>
                                                <CheckCircle2 size={14} />
                                                Verified
                                            </span>
                                        )}

                                        {doc.status === "Approved" && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusPill(doc.status)}`}>
                                                <CheckCircle2 size={14} />
                                                Approved
                                            </span>
                                        )}

                                        {doc.status === "Rejected" && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusPill(doc.status)}`}>
                                                <XCircle size={14} />
                                                Rejected
                                            </span>
                                        )}

                                        {doc.status === "Pending" && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusPill(doc.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#F6B100]" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

