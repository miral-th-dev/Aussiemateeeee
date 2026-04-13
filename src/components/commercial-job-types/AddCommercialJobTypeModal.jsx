import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Toggle from "../common/Toggle";
import { createCommercialJobType, updateCommercialJobType } from "../../api/services/commercialJobTypeService";

export default function AddCommercialJobTypeModal({ isOpen, onClose, onSave, editData }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const isEdit = !!editData;

    useEffect(() => {
        if (editData) {
            setName(editData.name || "");
            setDescription(editData.description || "");
            setActive(editData.status ?? true);
        } else {
            setName("");
            setDescription("");
            setActive(true);
        }
    }, [editData, isOpen]);

    // Close on ESC key and Lock Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        const handleKeyDown = (e) => {
            if (isOpen && e.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const typeData = {
                name,
                description,
                isActive: active
            };

            if (isEdit) {
                await updateCommercialJobType(editData.id, typeData);
            } else {
                await createCommercialJobType(typeData);
            }
            onSave();
        } catch (error) {
            console.error("Error saving job type:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-center relative z-10">
                    <h2 className="text-[22px] font-bold text-[#111827]">
                        {isEdit ? "Edit Job Type" : "Add Job Type"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 cursor-pointer absolute top-4 right-4"
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Body */}
                    <div className="px-6 pb-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#374151] mb-2">
                                Job Type Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. New Construction"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#374151] mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter job type description"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-[#111827]">
                                Active
                            </label>
                            <Toggle checked={active} onChange={setActive} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex py-2.5 px-6 bg-[#F9FAFB] hover:bg-gray-100 text-[#374151] text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex py-2.5 px-4 bg-[#1F6FEB] text-white text-sm font-medium rounded-lg cursor-pointer transition-colors hover:bg-[#1B63D6] disabled:opacity-50"
                        >
                            {loading ? "Saving..." : (isEdit ? "Save Changes" : "Add Job Type")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
