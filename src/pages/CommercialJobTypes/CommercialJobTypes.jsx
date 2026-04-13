import React from "react";
import CommercialJobTypesTable from "../../components/commercial-job-types/CommercialJobTypesTable";

export default function CommercialJobTypes() {
  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-[16px] font-semibold text-[#1F2937]">Commercial Job Types</h1>
      </div>

      <CommercialJobTypesTable />
    </div>
  );
}
