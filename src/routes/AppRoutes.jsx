import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Approvals from "../pages/Approvals";
import Jobs from "../pages/Jobs";
import Cleaners from "../pages/Cleaners";
import Customers from "../pages/Customers";
import CleanerSubscriptions from "../pages/CleanerSubscriptions/CleanerSubscriptions";
import AddPlan from "../pages/CleanerSubscriptions/AddPlan";
import EditPlan from "../pages/CleanerSubscriptions/EditPlan";
import Settings from "../pages/Settings";
import ServiceCategories from "../pages/ServiceCategories/ServiceCategories";
import ServiceSubCategories from "../pages/ServiceCategories/ServiceSubCategories";
import FAQs from "../pages/FAQs";
import ExtraCredits from "../pages/ExtraCredits/ExtraCredits";
import AddCredit from "../pages/ExtraCredits/AddCredit";
import EditCredit from "../pages/ExtraCredits/EditCredit";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/approvals/:cleanerId" element={<Approvals />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<Jobs />} />
      <Route path="/cleaners" element={<Cleaners />} />
      <Route path="/cleaners/:cleanerId" element={<Cleaners />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:customerId" element={<Customers />} />
      <Route path="/cleaner-subscriptions" element={<CleanerSubscriptions />} />
      <Route path="/cleaner-subscriptions/add" element={<AddPlan />} />
      <Route path="/cleaner-subscriptions/edit/:planId" element={<EditPlan />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/service-categories" element={<ServiceCategories />} />
      <Route path="/service-categories/:categoryId" element={<ServiceSubCategories />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/extra-credits" element={<ExtraCredits />} />
      <Route path="/extra-credits/add" element={<AddCredit />} />
      <Route path="/extra-credits/edit/:creditId" element={<EditCredit />} />

    </Routes>
  );
}

