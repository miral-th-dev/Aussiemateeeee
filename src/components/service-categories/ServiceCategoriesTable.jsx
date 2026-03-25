import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddCategoryModal from "./AddCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { getCategories, updateCategoryStatus, deleteCategory as deleteCategoryApi } from "../../api/services/categoryService";

export default function ServiceCategoriesTable() {
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
    const navigate = useNavigate();

    const menuRef = useRef(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories();
            // Map backend fields to frontend fields if necessary
            const mappedCategories = (response.data || []).map(cat => ({
                id: cat._id,
                name: cat.name,
                subCategories: cat.serviceTypeCount || 0,
                createdDate: new Date(cat.createdAt).toLocaleDateString(),
                status: cat.isActive,
                imageUrl: cat.imageUrl,
                description: cat.description
            }));
            setCategories(mappedCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
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
            setSelectedRows(paginatedCategories.map(c => c.id));
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
            await updateCategoryStatus(id, newStatus);
            setCategories(categories.map(cat =>
                cat.id === id ? { ...cat, status: newStatus } : cat
            ));
        } catch (error) {
            console.error("Error updating category status:", error);
        }
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveCategory = () => {
        setIsAddModalOpen(false);
        setCategoryToEdit(null);
        fetchCategories();
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
                await deleteCategoryApi(categoryToDelete.id);
                fetchCategories();
                setCategoryToDelete(null);
            } catch (error) {
                console.error("Error deleting category:", error);
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
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative pb-4">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search by Category Name"
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
                    <div className="bg-white rounded-full p-0.5 text-[#1F6FEB]">
                        <Plus size={14} strokeWidth={3} />
                    </div>
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
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Category Name</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Sub Categories</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Created Date</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Category Status</span>
                                    
                                </div>
                            </th>
                            <th className="w-16 px-4 py-4 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCategories.length > 0 ? (
                            paginatedCategories.map((category, index) => (
                                <tr key={category.id} className={`border-b border-[#F1F1F4] hover:bg-gray-50 transition-colors relative ${openActionMenuId === category.id ? "z-50" : "z-0"}`}>
                                <td className="w-16 px-4 py-4 border-r border-[#F1F1F4]">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={selectedRows.includes(category.id)}
                                            onChange={(e) => handleSelectRow(category.id, e.target.checked)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm font-medium text-[#111827] border-r border-[#F1F1F4]">
                                    {category.name}
                                </td>
                                <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                    {category.subCategories}
                                </td>
                                <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                    {category.createdDate}
                                </td>
                                <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                    <Toggle
                                        checked={category.status}
                                        onChange={(checked) => handleStatusToggle(category.id, checked)}
                                    />
                                </td>
                                <td className="w-16 px-4 py-4 text-center relative">
                                    <button
                                        onClick={(e) => toggleActionMenu(e, category.id)}
                                        className="p-1 cursor-pointer"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {openActionMenuId === category.id && (
                                        <div
                                            ref={menuRef}
                                            className={`absolute right-12 ${index >= categories.length - 2 && categories.length > 2 ? "bottom-0" : "top-10"} w-48 bg-white border border-[#F1F1F4] shadow-lg rounded-xl z-50 py-2`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/service-categories/${category.id}`, { state: { categoryName: category.name } });
                                                    setOpenActionMenuId(null);
                                                }}
                                            >
                                                <LayoutGrid size={16} className="text-[#4B5675] group-hover:text-[#1F6FEB]" />
                                                View SubCategory
                                            </button>
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
                                                Delete Category
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-sm text-[#6B7280]">
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
                <AddCategoryModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveCategory}
                    editData={categoryToEdit}
                />
            )}

            <DeleteCategoryModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDelete}
                categoryName={categoryToDelete?.name || ""}
            />
        </div>
    );
}
