import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppRoutes from "../routes/AppRoutes";
import Header from "./Header";
import { Menu } from "lucide-react";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const searchIndex = [
    { path: "/dashboard", keywords: ["dashboard", "home"] },
    { path: "/approvals", keywords: ["approvals", "approval"] },
    { path: "/jobs", keywords: ["jobs", "job"] },
    { path: "/cleaners", keywords: ["cleaners", "cleaner"] },
    { path: "/customers", keywords: ["customers", "customer"] },
    { path: "/payments", keywords: ["payments", "escrow", "payment"] },
    { path: "/service-categories", keywords: ["service", "categories", "category", "services"] },
    { path: "/settings", keywords: ["settings", "profile", "account"] },
  ];

  // Close sidebar on mobile by default, open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGlobalSearch = (value) => {
    const term = value.trim().toLowerCase();
    if (!term) return;

    const match = searchIndex.find(({ keywords }) =>
      keywords.some((keyword) => keyword.includes(term) || term.includes(keyword))
    );

    if (match) {
      navigate(match.path);
    }
  };

  return (
    <BreadcrumbProvider>
      <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
        {/* Fixed Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Floating toggle button (shows when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-2 bg-white cursor-pointer"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}

        {/* Fixed Header */}
        <Header
          sidebarOpen={isSidebarOpen}
          onSearchChange={handleGlobalSearch}
          searchPlaceholder="Search pages (e.g. Jobs, Payments)"
        />

        {/* Main content area */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'xl:ml-[290px] lg:ml-[240px] ml-0' 
              : 'ml-0'
            }`}
          style={{ 
            marginTop: '64px'
          }}
        >
          {/* Scrollable Content area with padding */}
          <div className="flex-1 p-3 md:p-6 overflow-y-auto">
            <AppRoutes />
          </div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}

