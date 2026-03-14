import React from "react";
import ActionModal from "../../components/common/ActionModal";
import rejectKyc from "../../assets/image/suspenseKyc.svg";

export default function DeletePlanModal({ isOpen, onClose, onConfirm, planName }) {
    return (
        <ActionModal
            isOpen={isOpen}
            onClose={onClose}
            illustration={<img src={rejectKyc} alt="Delete Plan" className="max-h-40 mx-auto" />}
            title="Delete Subscription Plan"
            description={
                <>
                    Are you sure you want to delete {planName} plan?
                </>
            }
            primaryLabel="Yes, Delete"
            primaryVariant="danger"
            onPrimary={onConfirm}
            secondaryLabel="Cancel"
            onSecondary={onClose}
        />
    );
}
