import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddCategoryModal from "./AddCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

// Dummy data based on screenshot
const initialCategories = [
    { id: "1", name: "Domestic / General Cleaning", subCategories: 18, createdDate: "2025-07-12", status: true },
    { id: "2", name: "Commercial Cleaning", subCategories: 6, createdDate: "2025-08-02", status: true },
    { id: "3", name: "Other Categories", subCategories: 16, createdDate: "2025-09-01", status: true },
    { id: "4", name: "Bond / End-of-Lease Cleaning", subCategories: 45, createdDate: "2025-09-01", status: true },
];

export default function ServiceCategoriesTable() {
    const [categories, setCategories] = useState(initialCategories);
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
            setSelectedRows(categories.map(c => c.id));
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

    const handleStatusToggle = (id, newStatus) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, status: newStatus } : cat
        ));
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveCategory = (newCategoryData) => {
        if (newCategoryData.id) {
            setCategories(categories.map(cat => 
                cat.id === newCategoryData.id ? { ...cat, name: newCategoryData.name, status: newCategoryData.active } : cat
            ));
        } else {
            const newCat = {
                id: Math.random().toString(36).substr(2, 9),
                name: newCategoryData.name,
                subCategories: 0,
                createdDate: new Date().toISOString().split('T')[0],
                status: newCategoryData.active
            };
            setCategories([...categories, newCat]);
        }
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

    const confirmDelete = () => {
        if (categoryToDelete) {
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm relative pb-4">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
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

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="w-16 px-4 py-4 text-left">
                                <div className="flex items-center justify-center">
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </div>
                            </th>
                            <th className="min-w-[200px] px-4 py-4 text-left">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Category Name</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Sub Categories</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Created Date</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Category Status</span>
                                    
                                </div>
                            </th>
                            <th className="w-16 px-4 py-4 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors relative">
                                <td className="w-16 px-4 py-4">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={selectedRows.includes(category.id)}
                                            onChange={(e) => handleSelectRow(category.id, e.target.checked)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm font-medium text-[#111827]">
                                    {category.name}
                                </td>
                                <td className="px-4 py-4 text-sm text-[#374151]">
                                    {category.subCategories}
                                </td>
                                <td className="px-4 py-4 text-sm text-[#374151]">
                                    {category.createdDate}
                                </td>
                                <td className="px-4 py-4">
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
                                            className="absolute right-12 top-10 w-48 bg-white border border-gray-100 shadow-lg rounded-xl z-50 py-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/service-categories/${category.id}`);
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
                        ))}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={categories.length}
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
