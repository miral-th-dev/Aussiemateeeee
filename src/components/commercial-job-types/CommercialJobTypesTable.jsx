import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddCommercialJobTypeModal from "./AddCommercialJobTypeModal";
import DeleteCommercialJobTypeModal from "./DeleteCommercialJobTypeModal";
import { 
    getCommercialJobTypes, 
    updateCommercialJobTypeStatus, 
    deleteCommercialJobType 
} from "../../api/services/commercialJobTypeService";

export default function CommercialJobTypesTable() {
    const [jobTypes, setJobTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openActionMenuId, setOpenActionMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [typeToEdit, setTypeToEdit] = useState(null);
    const [typeToDelete, setTypeToDelete] = useState(null);

    const menuRef = useRef(null);

    const fetchJobTypes = async () => {
        try {
            setLoading(true);
            const response = await getCommercialJobTypes();
            const mappedTypes = (response.data || []).map(type => ({
                id: type._id,
                name: type.name,
                description: type.description,
                createdDate: new Date(type.createdAt).toLocaleDateString(),
                status: type.isActive
            }));
            setJobTypes(mappedTypes);
        } catch (error) {
            console.error("Error fetching commercial job types:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobTypes();
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
            setSelectedRows(paginatedTypes.map(t => t.id));
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
            await updateCommercialJobTypeStatus(id, newStatus);
            setJobTypes(jobTypes.map(type =>
                type.id === id ? { ...type, status: newStatus } : type
            ));
        } catch (error) {
            console.error("Error updating job type status:", error);
        }
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const handleSaveType = () => {
        setIsAddModalOpen(false);
        setTypeToEdit(null);
        fetchJobTypes();
    };

    const handleEditClick = (type) => {
        setTypeToEdit(type);
        setIsAddModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleDeleteClick = (type) => {
        setTypeToDelete(type);
        setOpenActionMenuId(null);
    };

    const confirmDelete = async () => {
        if (typeToDelete) {
            try {
                await deleteCommercialJobType(typeToDelete.id);
                fetchJobTypes();
                setTypeToDelete(null);
            } catch (error) {
                console.error("Error deleting job type:", error);
            }
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredTypes = jobTypes.filter(type =>
        type?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedTypes = filteredTypes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative pb-4">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search by Job Type Name"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-[300px]"
                />
                <button
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer"
                    onClick={() => {
                        setTypeToEdit(null);
                        setIsAddModalOpen(true);
                    }}
                >
                    <div className="bg-white rounded-full p-0.5 text-[#1F6FEB]">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                    Add Job Type
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
                                <span className="font-medium text-[#78829D] text-xs">Job Type Name</span>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <span className="font-medium text-[#78829D] text-xs">Description</span>
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
                        {paginatedTypes.length > 0 ? (
                            paginatedTypes.map((type, index) => (
                                <tr key={type.id} className={`border-b border-[#F1F1F4] hover:bg-gray-50 transition-colors relative ${openActionMenuId === type.id ? "z-50" : "z-0"}`}>
                                    <td className="w-16 px-4 py-4 border-r border-[#F1F1F4]">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedRows.includes(type.id)}
                                                onChange={(e) => handleSelectRow(type.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-[#111827] border-r border-[#F1F1F4]">
                                        {type.name}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4] max-w-[300px] truncate">
                                        {type.description}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                        {type.createdDate}
                                    </td>
                                    <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                        <Toggle
                                            checked={type.status}
                                            onChange={(checked) => handleStatusToggle(type.id, checked)}
                                        />
                                    </td>
                                    <td className="w-16 px-4 py-4 text-center relative">
                                        <button
                                            onClick={(e) => toggleActionMenu(e, type.id)}
                                            className="p-1 cursor-pointer"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openActionMenuId === type.id && (
                                            <div
                                                ref={menuRef}
                                                className={`absolute right-12 ${index >= jobTypes.length - 2 && jobTypes.length > 2 ? "bottom-0" : "top-10"} w-48 bg-white border border-[#F1F1F4] shadow-lg rounded-xl z-50 py-2`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5675] hover:text-[#1F6FEB] hover:bg-[#F5F8FF] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleEditClick(type)}
                                                >
                                                    <Pencil size={16} className="text-[#4B5675] group-hover:text-[#1F6FEB]" />
                                                    Edit
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none flex items-center gap-3 transition-colors group cursor-pointer"
                                                    onClick={() => handleDeleteClick(type)}
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
                                    {loading ? "Loading..." : "No job types found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={filteredTypes.length}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />

            {isAddModalOpen && (
                <AddCommercialJobTypeModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveType}
                    editData={typeToEdit}
                />
            )}

            <DeleteCommercialJobTypeModal
                isOpen={!!typeToDelete}
                onClose={() => setTypeToDelete(null)}
                onConfirm={confirmDelete}
                typeName={typeToDelete?.name || ""}
            />
        </div>
    );
}
