import React from "react";
import ActionModal from "../common/ActionModal";
import rejectKyc from "../../assets/image/suspenseKyc.svg";

export default function DeleteCommercialJobTypeModal({ isOpen, onClose, onConfirm, typeName }) {
    return (
        <ActionModal
            isOpen={isOpen}
            onClose={onClose}
            illustration={<img src={rejectKyc} alt="Delete illustration" className="w-[180px] h-[180px]" />}
            title="Delete Job Type"
            description={`Are you sure you want to delete ${typeName} job type?`}
            primaryLabel="Yes, Delete"
            onPrimary={onConfirm}
            primaryVariant="danger"
            secondaryLabel="Cancel"
            onSecondary={onClose}
        />
    );
}
