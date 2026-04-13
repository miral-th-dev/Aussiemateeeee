import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddExtraServiceItemModal from "./AddExtraServiceItemModal";
import DeleteExtraServiceItemModal from "./DeleteExtraServiceItemModal";
import { 
    getExtraServiceItems, 
    updateExtraServiceItemStatus, 
    deleteExtraServiceItem 
} from "../../api/services/extraServiceItemService";

export default function ExtraServiceItemsTable() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openActionMenuId, setOpenActionMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const menuRef = useRef(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await getExtraServiceItems();
            const mappedItems = (response.data || []).map(item => ({
                id: item._id,
                name: item.name,
                createdDate: new Date(item.createdAt).toLocaleDateString(),
                status: item.isActive
            }));
            setItems(mappedItems);
        } catch (error) {
            console.error("Error fetching extra service items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
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
            setSelectedRows(paginatedItems.map(t => t.id));
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
            await updateExtraServiceItemStatus(id, newStatus);
            setItems(items.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error("Error updating service item status:", error);
        }
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveItem = () => {
        setIsAddModalOpen(false);
        setItemToEdit(null);
        fetchItems();
    };

    const handleEditClick = (item) => {
        setItemToEdit(item);
        setIsAddModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setOpenActionMenuId(null);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteExtraServiceItem(itemToDelete.id);
                fetchItems();
                setItemToDelete(null);
            } catch (error) {
                console.error("Error deleting service item:", error);
            }
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredItems = items.filter(item =>
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative pb-4">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search by Item Name"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-[300px]"
                />
                <button
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer"
                    onClick={() => {
                        setItemToEdit(null);
                        setIsAddModalOpen(true);
                    }}
                >
                    <div className="bg-white rounded-full p-0.5 text-[#1F6FEB]">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                    Add Item
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
                                <span className="font-medium text-[#78829D] text-xs">Item Name</span>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Created Date</span>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Status</span>
                            </th>
                            <th className="w-16 px-4 py-4 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item, index) => (
                                <tr key={item.id} className={`border-b border-[#F1F1F4] hover:bg-gray-50 transition-colors relative ${openActionMenuId === item.id ? "z-50" : "z-0"}`}>
                                    <td className="w-16 px-4 py-4 border-r border-[#F1F1F4]">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedRows.includes(item.id)}
                                                onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-[#111827] border-r border-[#F1F1F4]">
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                        {item.createdDate}
                                    </td>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <Toggle
                                            checked={item.status}
                                            onChange={(checked) => handleStatusToggle(item.id, checked)}
                                        />
                                    </td>
                                    <td className="w-16 px-4 py-4 text-center relative">
                                        <button
                                            onClick={(e) => toggleActionMenu(e, item.id)}
                                            className="p-1 cursor-pointer"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openActionMenuId === item.id && (
                                            <div
                                                ref={menuRef}
                                                className={`absolute right-12 ${index >= paginatedItems.length - 2 && paginatedItems.length > 2 ? "bottom-0" : "top-10"} w-48 bg-white border border-[#F1F1F4] shadow-lg rounded-xl z-50 py-2`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleEditClick(item)}
                                                >
                                                    <Pencil size={16} className="text-[#4B5675] group-hover:text-[#1F6FEB]" />
                                                    Edit
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleDeleteClick(item)}
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
                                    {loading ? "Loading..." : "No items found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={filteredItems.length}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />

            {isAddModalOpen && (
                <AddExtraServiceItemModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveItem}
                    editData={itemToEdit}
                />
            )}

            <DeleteExtraServiceItemModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.name || ""}
            />
        </div>
    );
}
