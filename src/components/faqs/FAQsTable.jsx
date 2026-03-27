import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddFaqModal from "./AddFaqModal";
import ActionModal from "../common/ActionModal";
import suspenseKyc from "../../assets/image/suspenseKyc.svg";
import { fetchFaqs, deleteFaq, updateFaq, fetchFaqCategories } from "../../api/services/faqService";

export default function FAQsTable() {
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openActionMenuId, setOpenActionMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [faqToEdit, setFaqToEdit] = useState(null);
    const [faqToDelete, setFaqToDelete] = useState(null);

    const menuRef = useRef(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [faqsRes, categoriesRes] = await Promise.all([
                fetchFaqs(),
                fetchFaqCategories()
            ]);
            setFaqs(faqsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Error fetching FAQ data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedRows(paginatedFaqs.map(f => f._id || f.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedRows([...selectedRows, id]);
        } else {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        }
    };

    const handleStatusToggle = async (id, newStatus) => {
        try {
            await updateFaq(id, { isActive: newStatus });
            setFaqs(faqs.map(faq =>
                (faq._id === id || faq.id === id) ? { ...faq, isActive: newStatus } : faq
            ));
        } catch (error) {
            console.error("Error updating FAQ status:", error);
        }
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveFaq = () => {
        setIsAddModalOpen(false);
        setFaqToEdit(null);
        loadData();
    };

    const handleEditClick = (faq) => {
        setFaqToEdit(faq);
        setIsAddModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleDeleteClick = (faq) => {
        setFaqToDelete(faq);
        setOpenActionMenuId(null);
    };

    const confirmDelete = async () => {
        if (faqToDelete) {
            try {
                await deleteFaq(faqToDelete._id || faqToDelete.id);
                loadData();
                setFaqToDelete(null);
            } catch (error) {
                console.error("Error deleting FAQ:", error);
            }
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredFaqs = faqs.filter(faq =>
        faq?.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq?.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedFaqs = filteredFaqs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative ">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search Question or Category"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-[300px]"
                />
                <button
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer"
                    onClick={() => {
                        setFaqToEdit(null);
                        setIsAddModalOpen(true);
                    }}
                >
                    <Plus size={16} />
                    Add FAQ
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead className="border-b border-[#F1F1F4]">
                        <tr>
                            <th className="w-16 px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center justify-center">
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </div>
                            </th>
                            <th className="min-w-[250px] px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-primary text-sm">Question</span>
                            </th>
                            <th className="min-w-[200px] px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-primary text-sm">Category</span>
                            </th>
                            <th className="w-24 px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-primary text-sm">Order</span>
                            </th>
                            <th className="w-24 px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-primary text-sm">Status</span>
                            </th>
                            <th className="w-16 px-4 py-4 text-center text-primary text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-sm text-[#6B7280]">Loading FAQs...</td>
                          </tr>
                        ) : paginatedFaqs.length > 0 ? (
                            paginatedFaqs.map((faq, index) => (
                                <tr key={faq._id || faq.id} className={`border-b border-[#F1F1F4] hover:bg-gray-50 transition-colors relative ${openActionMenuId === (faq._id || faq.id) ? "z-50" : "z-0"}`}>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedRows.includes(faq._id || faq.id)}
                                                onChange={(e) => handleSelectRow(faq._id || faq.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#111827] border-r border-[#F1F1F4] max-w-[400px]">
                                        <div className="line-clamp-2">{faq.question}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-[11px] font-semibold text-gray-600">
                                            {faq.categoryId?.name || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                        {faq.order}
                                    </td>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <Toggle
                                            checked={faq.isActive}
                                            onChange={(checked) => handleStatusToggle(faq._id || faq.id, checked)}
                                        />
                                    </td>
                                    <td className="w-16 px-4 py-4 text-center relative">
                                        <button
                                            onClick={(e) => toggleActionMenu(e, faq._id || faq.id)}
                                            className="p-1 cursor-pointer"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openActionMenuId === (faq._id || faq.id) && (
                                            <div
                                                ref={menuRef}
                                                className={`absolute right-12 ${index >= paginatedFaqs.length - 2 ? "bottom-0" : "top-10"} w-40 bg-white border border-[#F1F1F4] shadow-lg rounded-xl z-50 py-2`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleEditClick(faq)}
                                                >
                                                    <Pencil size={16} className="text-[#4B5675] group-hover:text-[#1F6FEB]" />
                                                    Edit
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleDeleteClick(faq)}
                                                >
                                                    <Trash2 size={16} className="text-[#EF4444] group-hover:text-[#DC2626]" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-sm text-[#6B7280]">
                                    No FAQs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={filteredFaqs.length}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />

            {isAddModalOpen && (
                <AddFaqModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveFaq}
                    editData={faqToEdit}
                    categories={categories}
                />
            )}

            <ActionModal
                isOpen={!!faqToDelete}
                onClose={() => setFaqToDelete(null)}
                onPrimary={confirmDelete}
                illustration={<img src={suspenseKyc} alt="Delete illustration" className="max-h-40" />}
                title="Delete FAQ"
                description={`Are you sure you want to delete this FAQ?`}
                primaryLabel="Yes, Delete"
                primaryVariant="danger"
                secondaryLabel="Cancel"
                onSecondary={() => setFaqToDelete(null)}
            />
        </div>
    );
}
