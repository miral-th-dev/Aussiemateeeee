import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddFaqCategoryModal from "./AddFaqCategoryModal";
import ActionModal from "../common/ActionModal";
import suspenseKyc from "../../assets/image/suspenseKyc.svg";
import { fetchFaqCategories, deleteFaqCategory, updateFaqCategory } from "../../api/services/faqService";

export default function FAQCategoriesTable() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openActionMenuId, setOpenActionMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const menuRef = useRef(null);

    const getFaqCategories = async () => {
        try {
            setLoading(true);
            const response = await fetchFaqCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching FAQ categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFaqCategories();
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
            setSelectedRows(paginatedCategories.map(c => c._id || c.id));
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
            await updateFaqCategory(id, { isActive: newStatus });
            setCategories(categories.map(cat =>
                (cat._id === id || cat.id === id) ? { ...cat, isActive: newStatus } : cat
            ));
        } catch (error) {
            console.error("Error updating FAQ category status:", error);
        }
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveCategory = () => {
        setIsAddModalOpen(false);
        setCategoryToEdit(null);
        getFaqCategories();
    };

    const handleEditClick = (category) => {
        setCategoryToEdit(category);
        setIsAddModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setOpenActionMenuId(null);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            try {
                await deleteFaqCategory(categoryToDelete._id || categoryToDelete.id);
                getFaqCategories();
                setCategoryToDelete(null);
            } catch (error) {
                console.error("Error deleting FAQ category:", error);
            }
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredCategories = categories.filter(category =>
        category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search Category"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-[300px]"
                />
                <button
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer"
                    onClick={() => {
                        setCategoryToEdit(null);
                        setIsAddModalOpen(true);
                    }}
                >
                    <Plus size={16} />
                    Add Category
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
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
                            <th className="min-w-[200px] px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Category Name</span>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Order</span>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Status</span>
                            </th>
                            <th className="w-16 px-4 py-4 text-center text-[#78829D] text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-sm text-[#6B7280]">Loading categories...</td>
                          </tr>
                        ) : paginatedCategories.length > 0 ? (
                            paginatedCategories.map((category, index) => (
                                <tr key={category._id || category.id} className={`border-b border-[#F1F1F4] hover:bg-gray-50 transition-colors relative ${openActionMenuId === (category._id || category.id) ? "z-50" : "z-0"}`}>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedRows.includes(category._id || category.id)}
                                                onChange={(e) => handleSelectRow(category._id || category.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-[#111827] border-r border-[#F1F1F4]">
                                        {category.name}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                        {category.order}
                                    </td>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <Toggle
                                            checked={category.isActive}
                                            onChange={(checked) => handleStatusToggle(category._id || category.id, checked)}
                                        />
                                    </td>
                                    <td className="w-16 px-4 py-4 text-center relative">
                                        <button
                                            onClick={(e) => toggleActionMenu(e, category._id || category.id)}
                                            className="p-1 cursor-pointer"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openActionMenuId === (category._id || category.id) && (
                                            <div
                                                ref={menuRef}
                                                className={`absolute right-12 ${index >= paginatedCategories.length - 2 ? "bottom-0" : "top-10"} w-40 bg-white border border-[#F1F1F4] shadow-lg rounded-xl z-50 py-2`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleEditClick(category)}
                                                >
                                                    <Pencil size={16} className="text-[#4B5675] group-hover:text-[#1F6FEB]" />
                                                    Edit
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleDeleteClick(category)}
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
                                <td colSpan="5" className="px-4 py-8 text-center text-sm text-[#6B7280]">
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={filteredCategories.length}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />

            {isAddModalOpen && (
                <AddFaqCategoryModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveCategory}
                    editData={categoryToEdit}
                />
            )}

            <ActionModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onPrimary={confirmDelete}
                illustration={<img src={suspenseKyc} alt="Delete illustration" className="max-h-40" />}
                title="Delete Category"
                description={`Are you sure you want to delete "${categoryToDelete?.name}" category?`}
                primaryLabel="Yes, Delete"
                primaryVariant="danger"
                secondaryLabel="Cancel"
                onSecondary={() => setCategoryToDelete(null)}
            />
        </div>
    );
}
