import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createFaq, updateFaq } from "../../api/services/faqService";
import Input from "../common/Input";
import CustomSelect from "../common/CustomSelect";
import Toggle from "../common/Toggle";
import Button from "../common/Button";

export default function AddFaqModal({ isOpen, onClose, onSave, editData, categories = [] }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [order, setOrder] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setQuestion(editData.question || "");
            setAnswer(editData.answer || "");
            setCategoryId(editData.categoryId?._id || editData.categoryId || "");
            setOrder(editData.order || 1);
            setIsActive(editData.isActive ?? true);
        } else {
            setQuestion("");
            setAnswer("");
            setCategoryId(categories.length > 0 ? categories[0]._id || categories[0].id : "");
            setOrder(1);
            setIsActive(true);
        }
    }, [editData, isOpen, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { question, answer, categoryId, order: Number(order), isActive };
            if (editData) {
                await updateFaq(editData._id || editData.id, payload);
            } else {
                await createFaq(payload);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving FAQ:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const categoryOptions = categories.map(cat => ({
        value: cat._id || cat.id,
        label: cat.name
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editData ? "Edit FAQ" : "Add New FAQ"}
                    </h2>
                    <button onClick={onClose} className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900 pb-1">FAQ Category</label>
                        <CustomSelect
                            options={categoryOptions}
                            value={categoryId}
                            onChange={setCategoryId}
                            placeholder="Select Category"
                        />
                    </div>

                    <Input
                        label="Question"
                        required
                        placeholder="Enter FAQ question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">Answer</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm min-h-[120px]"
                            placeholder="Enter FAQ answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
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
                            {editData ? "Update FAQ" : "Save FAQ"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
