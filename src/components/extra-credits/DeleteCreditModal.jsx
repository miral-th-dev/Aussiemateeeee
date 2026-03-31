import React from "react";
import ActionModal from "../common/ActionModal";
import rejectKyc from "../../assets/image/suspenseKyc.svg";

export default function DeleteCreditModal({ isOpen, onClose, onConfirm, packageName }) {
    return (
        <ActionModal
            isOpen={isOpen}
            onClose={onClose}
            illustration={<img src={rejectKyc} alt="Delete Package" className="max-h-40 mx-auto" />}
            title="Delete Credit Package"
            description={
                <>
                    Are you sure you want to delete {packageName} package?
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
