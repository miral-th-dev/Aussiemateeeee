import React, { useState } from "react";
import FAQCategoriesTable from "../components/faqs/FAQCategoriesTable";
import FAQsTable from "../components/faqs/FAQsTable";

export default function FAQs() {
    const [activeTab, setActiveTab] = useState("faqs");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage categories and frequently asked questions for your users.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("faqs")}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "faqs"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    FAQs
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "categories"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Categories
                </button>
            </div>

            {/* Content */}
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "faqs" ? (
                    <FAQsTable />
                ) : (
                    <FAQCategoriesTable />
                )}
            </div>
        </div>
    );
}
