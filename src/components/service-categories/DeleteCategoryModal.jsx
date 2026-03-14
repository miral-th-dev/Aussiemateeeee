import React from "react";
import ActionModal from "../common/ActionModal";
import rejectKyc from "../../assets/image/suspenseKyc.svg";

export default function DeleteCategoryModal({ isOpen, onClose, onConfirm, categoryName }) {
    return (
        <ActionModal
            isOpen={isOpen}
            onClose={onClose}
            illustration={<img src={rejectKyc} alt="Delete illustration" className="w-[180px] h-[180px]" />}
            title="Delete Category"
            description={`Are you sure you want to delete ${categoryName} category?`}
            primaryLabel="Yes, Delete"
            onPrimary={onConfirm}
            primaryVariant="danger"
            secondaryLabel="Cancel"
            onSecondary={onClose}
        />
    );
}
