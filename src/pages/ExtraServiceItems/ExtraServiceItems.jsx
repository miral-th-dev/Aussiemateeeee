import React from "react";
import ExtraServiceItemsTable from "../../components/extra-service-items/ExtraServiceItemsTable";

export default function ExtraServiceItems() {
  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-[16px] font-semibold text-[#1F2937]">Extra Service Items</h1>
      </div>

      <ExtraServiceItemsTable />
    </div>
  );
}
