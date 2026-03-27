import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createFaqCategory, updateFaqCategory } from "../../api/services/faqService";
import Input from "../common/Input";
import Toggle from "../common/Toggle";
import Button from "../common/Button";

export default function AddFaqCategoryModal({ isOpen, onClose, onSave, editData }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setName(editData.name || "");
            setDescription(editData.description || "");
            setOrder(editData.order || 1);
            setIsActive(editData.isActive ?? true);
        } else {
            setName("");
            setDescription("");
            setOrder(1);
            setIsActive(true);
        }
    }, [editData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { name, description, order: Number(order), isActive };
            if (editData) {
                await updateFaqCategory(editData._id || editData.id, payload);
            } else {
                await createFaqCategory(payload);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving FAQ category:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editData ? "Edit FAQ Category" : "Add New FAQ Category"}
                    </h2>
                    <button onClick={onClose} className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Category Name"
                        required
                        placeholder="Enter category name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">Description</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm min-h-[100px]"
                            placeholder="Enter category description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Order"
                            type="number"
                            required
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                        />
                        <div className="space-y-1.5 flex flex-col justify-center">
                            <label className="text-sm font-semibold text-gray-900 mb-2">Status</label>
                            <div className="flex items-center gap-3">
                                <Toggle
                                    checked={isActive}
                                    onChange={setIsActive}
                                />
                                <span className="text-sm font-medium text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 !rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            className="flex-1 !rounded-xl shadow-md shadow-blue-200"
                        >
                            {editData ? "Update Category" : "Save Category"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
