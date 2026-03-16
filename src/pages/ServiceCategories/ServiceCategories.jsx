import { useState } from "react";
import ServiceCategoriesTable from "../../components/service-categories/ServiceCategoriesTable";

export default function ServiceCategories() {
  return (
    <div className="">
      <div className="mb-6">
        {/* <div className="text-sm text-gray-400 mb-2">Service Categories /  <span className="text-gray-800 font-medium">Categories</span></div> */}
        <h1 className="text-[16px] font-semibold text-[#1F2937]">Cleaning Categories</h1>
      </div>

      <ServiceCategoriesTable />
    </div>
  );
}
