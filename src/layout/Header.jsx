import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, User2 } from "lucide-react";
import SearchInput from "../components/common/SearchInput";
import Button from "../components/common/Button";
import NotificationsPanel from "./NotificationsPanel";
import profile from "../assets/icon/profile.svg";
import { useAuth, useAuthInit } from "../api/hooks/useAuth";
import ActionModal from "../components/common/ActionModal";
import rejectKyc from "../assets/image/rejectKyc.svg";
import { useBreadcrumb } from "../context/BreadcrumbContext";

const ROUTE_TITLES = {
  "/": "Dashboard",
  "/approvals": "Approvals",
  "/jobs": "Jobs",
  "/cleaners": "Cleaners",
  "/customers": "Customers",
  "/cleaner-subscriptions": "Cleaner Subscriptions",
  "/settings": "Settings",
  "/service-categories": "Categories",
};

function humanizeSegment(segment) {
  if (!segment) return "";
  return segment
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isIdSegment(segment) {
  if (!segment) return false;
  // Check if segment is purely numeric
  const isNumeric = /^\d+$/.test(segment);
  // Check if segment looks like an ID (long alphanumeric string, typically 20+ characters)
  // MongoDB ObjectIds are 24 characters, but we'll check for 15+ to catch various ID formats
  const isLongAlphanumeric = /^[a-zA-Z0-9]{15,}$/.test(segment);
  // Also check if it's a UUID-like pattern (with or without hyphens)
  const isUuidLike = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i.test(segment);
  return isNumeric || isLongAlphanumeric || isUuidLike;
}

export default function Header({
  extraCrumbs = [],
  title,
  onSearchChange,
  searchPlaceholder = "Search",
  sidebarOpen = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notifRef = useRef(null);
  const notifButtonRef = useRef(null);
  const { user, refreshProfile, logout } = useAuth();
  const { extraCrumbs: contextCrumbs, parentBreadcrumbOnClick } = useBreadcrumb();
  useAuthInit(refreshProfile);

  // Merge prop extraCrumbs with context extraCrumbs (context takes precedence)
  const allExtraCrumbs = contextCrumbs.length > 0 ? contextCrumbs : extraCrumbs;

  const breadcrumbs = useMemo(() => {
    const { pathname } = location;
    if (pathname === "/") {
      return [{ label: ROUTE_TITLES["/"], path: "/" }, ...allExtraCrumbs];
    }

    const segments = pathname.split("/").filter(Boolean);
    // Filter out ID segments from breadcrumbs display
    const filteredSegments = segments.filter(segment => !isIdSegment(segment));

    const crumbs = filteredSegments.map((segment, index) => {
      // Build path using only filtered segments (without IDs)
      const path = "/" + filteredSegments.slice(0, index + 1).join("/");
      const label = ROUTE_TITLES[path] || humanizeSegment(segment);
      const isLastUrlCrumb = index === filteredSegments.length - 1;
      // If we have extraCrumbs and onClick handler, make the last URL breadcrumb clickable
      const onClick = isLastUrlCrumb && allExtraCrumbs.length > 0 && parentBreadcrumbOnClick
        ? parentBreadcrumbOnClick
        : null;
      return { label, path, onClick };
    });

    return [...crumbs, ...allExtraCrumbs];
  }, [location, allExtraCrumbs, parentBreadcrumbOnClick]);

  const currentTitle =
    title || (breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].label : "");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideDropdown =
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target);

      const clickedOutsideNotif =
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(event.target);

      if (clickedOutsideDropdown) {
        setIsDropdownOpen(false);
      }

      if (clickedOutsideNotif) {
        setIsNotifOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isNotifOpen) setIsNotifOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200 transition-all duration-300 ease-in-out
        ${sidebarOpen
          ? 'lg:left-[240px] xl:left-[290px] left-0'
          : 'left-0'
        }`}
    >
      <div className={`${!sidebarOpen ? "pl-10" : ""}`}>
        <nav className="flex items-center gap-1 mb-1 text-[14px]">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const hasOnClick = typeof crumb.onClick === 'function';

            return (
              <span
                key={crumb.path || `${crumb.label}-${index}`}
                className={!isLast ? "hidden md:inline" : ""}
              >
                {!isLast ? (
                  hasOnClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="text-[#7E7E87] font-normal hover:text-[#1C1C1C] transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <Link
                      to={crumb.path || "#"}
                      className="text-[#7E7E87] font-normal hover:text-[#1C1C1C] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )
                ) : (
                  <span className="font-semibold text-[#1C1C1C]">
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <span className="mx-1 text-[#7E7E87]">/</span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <SearchInput
            placeholder={searchPlaceholder}
            onChange={onSearchChange}
          />
        </div>

        <div className="relative">
          <button
            ref={notifButtonRef}
            type="button"
            onClick={toggleNotifications}
            className="relative inline-flex items-center justify-center w-9 h-9 text-gray-600 cursor-pointer"
          >
            <Bell size={20} />
            <span className="absolute -top-[-5px] -right-[-8px] inline-flex h-[10px] w-[10px] rounded-full bg-blue-500 border-2 border-white" />
          </button>

          <NotificationsPanel
            isOpen={isNotifOpen}
            panelRef={notifRef}
          />
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F9F9F9] border-2 border-[#F2F2F2] text-gray-700 cursor-pointer overflow-hidden"
          >
            {user?.profilePhoto?.url ? (
              <img
                src={user.profilePhoto.url}
                alt="Profile"
                className="h-9 w-9 object-cover"
              />
            ) : (
              <img src={profile} alt="Profile" className="h-5 w-5" />
            )}
          </button>

          {/* Backdrop Overlay */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 "
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 bg-white rounded-[16px] shadow-lg border border-gray-200 z-60 overflow-hidden"
            >
              {/* User Info Section */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {user?.profilePhoto?.url ? (
                    <img src={user.profilePhoto.url} alt="Profile" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User2 className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1C1C1C]">
                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User'}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500">{user.email}</p>
                  )}
                </div>
                {user?.role && (
                  <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                    {user.role}
                  </span>
                )}
              </div>

              {/* My Profile Link */}
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white  flex items-center justify-center">
                  <CircleUserRound size={20} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-[#1C1C1C]">My Profile</span>
              </Link>

              {/* Logout Button */}
              <div className="p-3 border-t border-gray-200">
                <Button
                  fullWidth
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                >
                  Log out
                </Button>
              </div>
            </div>
          )}
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
          logout();
          navigate('/login');
        }}
        hideSecondary
      />

    </header>
  );
}

