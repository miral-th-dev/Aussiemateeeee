import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import editIcon from "../../assets/icon/edit.svg";
import trashIcon from "../../assets/icon/trash.svg";
import Checkbox from "../common/Checkbox";
import SearchInput from "../common/SearchInput";
import Toggle from "../common/Toggle";
import PaginationRanges from "../common/PaginationRanges";
import AddServiceTypeModal from "./AddServiceTypeModal";
import DeleteServiceTypeModal from "./DeleteServiceTypeModal";
import { getServiceTypesByCategory, updateServiceTypeStatus, deleteServiceType as deleteServiceTypeApi } from "../../api/services/serviceTypeService";

export default function ServiceSubCategoriesTable({ categoryName }) {
    const { categoryId } = useParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Add/Edit Modal State
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState(null);

    // Delete Modal State
    const [serviceToDelete, setServiceToDelete] = useState(null);

    const fetchServiceTypes = async () => {
        if (!categoryId) return;
        try {
            setLoading(true);
            const response = await getServiceTypesByCategory(categoryId);
            const mappedServices = (response.data || []).map(srv => ({
                id: srv._id,
                name: srv.name,
                createdDate: new Date(srv.createdAt).toLocaleDateString(),
                status: srv.isActive,
                description: srv.description
            }));
            setServices(mappedServices);
        } catch (error) {
            console.error("Error fetching service types:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceTypes();
    }, [categoryId]);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedRows(paginatedServices.map(c => c.id));
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
            await updateServiceTypeStatus(id, newStatus);
            setServices(services.map(srv =>
                srv.id === id ? { ...srv, status: newStatus } : srv
            ));
        } catch (error) {
            console.error("Error updating service type status:", error);
        }
    };

    const handleSaveService = () => {
        setIsAddEditModalOpen(false);
        setServiceToEdit(null);
        fetchServiceTypes();
    };

    const confirmDelete = async () => {
        if (serviceToDelete) {
            try {
                await deleteServiceTypeApi(serviceToDelete.id);
                fetchServiceTypes();
                setServiceToDelete(null);
            } catch (error) {
                console.error("Error deleting service type:", error);
            }
        }
    };

    const openAddModal = () => {
        setServiceToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (service) => {
        setServiceToEdit(service);
        setIsAddEditModalOpen(true);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredServices = services.filter(service =>
        service?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-[16px] border border-[#F1F1F4] shadow-xs relative pb-4 mt-6">
            <div className="p-4 border-b border-[#F1F1F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <SearchInput
                    placeholder="Search by Category Name"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-[300px]"
                />
                <button
                    className="flex items-center justify-center gap-2 bg-[#1F6FEB] text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex-shrink-0 w-full sm:w-auto"
                    onClick={openAddModal}
                >
                    <div className="bg-white rounded-full p-0.5 text-[#1F6FEB]">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                    Add Service Type
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead className="border-b border-[#F1F1F4]">
                        <tr>
                            <th className="w-16 px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center justify-center ">
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </div>
                            </th>
                            <th className="min-w-[200px] px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Service Name</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Category Status</span>
                                    
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left border-r border-[#F1F1F4]">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-medium text-[#78829D] text-xs">Created Date</span>
                                    
                                </div>
                            </th>
                            <th className="w-24 px-4 py-4 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedServices.length > 0 ? (
                            paginatedServices.map((service) => (
                                <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors relative">
                                <td className="w-16 px-4 py-4 border-r border-[#F1F1F4]">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={selectedRows.includes(service.id)}
                                            onChange={(e) => handleSelectRow(service.id, e.target.checked)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm font-medium text-[#111827] border-r border-[#F1F1F4]">
                                    {service.name}
                                </td>
                                <td className="px-4 py-4 border-r border-[#F1F1F4]">
                                    <Toggle
                                        checked={service.status}
                                        onChange={(checked) => handleStatusToggle(service.id, checked)}
                                    />
                                </td>
                                <td className="px-4 py-4 text-sm text-[#374151] border-r border-[#F1F1F4]">
                                    {service.createdDate}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-end gap-2 pr-2">
                                        <button
                                            onClick={() => openEditModal(service)}
                                        >
                                            <img src={editIcon} alt="Edit" className="w-8 h-8 cursor-pointer" />
                                        </button>
                                        <button
                                            onClick={() => setServiceToDelete(service)}
                                        >
                                            <img src={trashIcon} alt="Delete" className="w-8 h-8 cursor-pointer" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-sm text-[#6B7280]">
                                No sub categories found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <PaginationRanges
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
                totalItems={filteredServices.length}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
            />

            {isAddEditModalOpen && (
                <AddServiceTypeModal
                    isOpen={isAddEditModalOpen}
                    onClose={() => setIsAddEditModalOpen(false)}
                    onSave={handleSaveService}
                    editData={serviceToEdit}
                    categoryName={categoryName}
                />
            )}

            <DeleteServiceTypeModal
                isOpen={!!serviceToDelete}
                onClose={() => setServiceToDelete(null)}
                onConfirm={confirmDelete}
                serviceName={serviceToDelete?.name || ""}
            />
        </div>
    );
}
