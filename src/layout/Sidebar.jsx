import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight, Crown, HelpCircle, Coins, Briefcase, PlusCircle } from "lucide-react";

import { clearAuth } from "../utils/auth";
import logo from '../assets/icon/logoo.svg';
import dashIcon from '../assets/icon/dash.svg';
import dashLightIcon from '../assets/icon/dashLight.svg';
import approvalIcon from '../assets/icon/approval.svg';
import approvalLightIcon from '../assets/icon/approvalIcon.svg';
import jobsIcon from '../assets/icon/jobs.svg';
import jobsLightIcon from '../assets/icon/jobsLight.svg';
import cleanerIcon from '../assets/icon/cleaner.svg';
import cleanerLightIcon from '../assets/icon/cleanerLight.svg';
import customerIcon from '../assets/icon/customer.svg';
import customerLightIcon from '../assets/icon/customerLight.svg';
import serviceIcon from '../assets/icon/sevice.svg';
import serviceLightIcon from '../assets/icon/serviceLight.svg';

import settingsIcon from '../assets/icon/settings.svg';
import settingsLightIcon from '../assets/icon/settingsLight.svg';
import ActionModal from "../components/common/ActionModal";
import rejectKyc from "../assets/image/rejectKyc.svg";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: dashIcon,
      iconLight: dashLightIcon
    },
    {
      name: "Approvals",
      path: "/approvals",
      icon: approvalIcon,
      iconLight: approvalLightIcon
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: jobsIcon,
      iconLight: jobsLightIcon // Using same icon if no light version available
    },
    {
      name: "Cleaners",
      path: "/cleaners",
      icon: cleanerIcon,
      iconLight: cleanerLightIcon
    },
    {
      name: "Customers",
      path: "/customers",
      icon: customerIcon,
      iconLight: customerLightIcon
    },
    {
      name: "Service Categories",
      path: "/service-categories",
      icon: serviceLightIcon,
      iconLight: serviceIcon
    },
    {
      name: "Commercial Job Types",
      path: "/commercial-job-types",
      iconComponent: Briefcase,
    },
    {
      name: "Extra Service Items",
      path: "/extra-service-items",
      iconComponent: PlusCircle,
    },
    {

      name: "Cleaner Subscriptions",
      path: "/cleaner-subscriptions",
      iconComponent: Crown,
    },
    {
      name: "Extra Credits",
      path: "/extra-credits",
      iconComponent: Coins,
    },
    {
      name: "FAQs",
      path: "/faqs",
      iconComponent: HelpCircle,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: settingsIcon,
      iconLight: settingsLightIcon
    },
  ];

  return (
    <>
      {/* Overlay for mobile and medium screens */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/40 transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 h-screen bg-white z-40 overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen
            ? 'left-0 w-[290px] lg:w-[240px] xl:w-[290px] border-r border-gray-200'
            : '-left-[290px] lg:-left-[240px] xl:-left-[290px] w-0'
          }`}
        style={{ overflow: isOpen ? "visible" : "hidden" }}
      >
        <div className={`h-full flex flex-col justify-between transition-all duration-300 ${isOpen ? 'opacity-100' : 'p-0 opacity-0 pointer-events-none'}`}>
          {/* USER HEADER */}
          <div>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl border border-gray-200">
                <img
                  src={logo}
                  className="w-10 h-10"
                  alt="Logo"
                />
                <div className="flex-1">
                  <p className="font-semibold">AussieMate</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-600 hover:text-gray-800 cursor-pointer block"
                >
                  {isOpen ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* MENU ITEMS */}
            <nav className="flex flex-col gap-3 p-4">
              {menu.map((item) => {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile when item is clicked
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg font-medium border 
                     ${isActive
                        ? "bg-[#F9FAFB] text-blue-600 border-[#EBF2FD]"
                        : "text-gray-600 border-transparent hover:bg-gray-100"}`
                    }

                  >
                    {({ isActive }) => (
                      <>
                        {item.iconComponent ? (
                          <item.iconComponent size={18} className={isActive ? "text-blue-600" : "text-gray-500"} />
                        ) : (
                          <img
                            src={isActive ? item.iconLight : item.icon}
                            alt={item.name}
                            className="w-[18px] h-[18px]"
                          />
                        )}
                        <span className={item.iconComponent && isActive ? "text-blue-600" : ""}>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* LOGOUT */}
          <div className="p-4">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer w-full"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <ActionModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        illustration={<img src={rejectKyc} alt="Logout illustration" className="max-h-40" />}
        title="Logout Account"
        description="Are you sure you want to logout your account?"
        primaryLabel="Logout"
        onPrimary={() => {
          setIsLogoutModalOpen(false);
          clearAuth();
          navigate('/login');
        }}
        hideSecondary
      />
    </>
  );
}