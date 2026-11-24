import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import { resourceRoutes } from "@/config/nav";
import ResourceView from "@/views/common/ResourceView";
import RequireAdmin from "@/components/common/RequireAdmin";
import SetupHub from "@/views/setup/SetupHub";
import Profile from "@/views/profile/Profile";
import PortalProtectedRoute from "./PortalProtectedRoute";
import PortalLayout from "@/layouts/PortalLayout";
import PortalLogin from "@/views/portal/PortalLogin";
import PortalHome from "@/views/portal/PortalHome";
import PortalPlaceholder from "@/views/portal/PortalPlaceholder";
import PortalStudentInfo from "@/views/portal/PortalStudentInfo";
import PortalAttendance from "@/views/portal/PortalAttendance";
import PortalHomework from "@/views/portal/PortalHomework";
import PortalCirculars from "@/views/portal/PortalCirculars";
import PortalFees from "@/views/portal/PortalFees";
import PortalCalendar from "@/views/portal/PortalCalendar";
import PortalTimeline from "@/views/portal/PortalTimeline";
import PortalTimetable from "@/views/portal/PortalTimetable";
import PortalMaterials from "@/views/portal/PortalMaterials";
import PortalResults from "@/views/portal/PortalResults";
import PortalTransport from "@/views/portal/PortalTransport";
import PortalSupport from "@/views/portal/PortalSupport";
import SupportInbox from "@/views/support/SupportInbox";
import { PORTAL_NAV } from "@/config/portalNav";
import GuardianLogins from "@/views/portal/GuardianLogins";

// Auth
import Login from "@/views/auth/Login";
import ForgotPassword from "@/views/auth/ForgotPassword";

// Custom ERP views
import Dashboard from "@/views/dashboard/Dashboard";
import Funnel from "@/views/admissions/Funnel";
import CampusVisits from "@/views/admissions/CampusVisits";
import IdCards from "@/views/students/IdCards";
import Promotion from "@/views/students/Promotion";
import StudentAttendance from "@/views/attendance/StudentAttendance";
import StaffAttendance from "@/views/attendance/StaffAttendance";
import Timetable from "@/views/academics/Timetable";
import Classes from "@/views/academics/Classes";
import StaffDirectory from "@/views/staff/StaffDirectory";
import StaffView from "@/views/staff/StaffView";
import LeaveManagement from "@/views/staff/LeaveManagement";
import Compliance from "@/views/staff/Compliance";
import Milestones from "@/views/development/Milestones";
import Portfolio from "@/views/development/Portfolio";
import WorldsLaunch from "@/views/development/WorldsLaunch";
import Exams from "@/views/academics/Exams";
import Lms from "@/views/academics/Lms";
import Learn from "@/views/learn/Learn";
import ReportCards from "@/views/academics/ReportCards";
import StaffTimetable from "@/views/academics/StaffTimetable";
import TimingProfiles from "@/views/academics/TimingProfiles";
import StaffLeave from "@/views/staff/StaffLeave";
import Payroll from "@/views/staff/Payroll";
import OnboardingExit from "@/views/staff/OnboardingExit";
import Recruitment from "@/views/staff/Recruitment";
import CollectFees from "@/views/fees/CollectFees";
import FeeStructure from "@/views/fees/FeeStructure";
import FeesDashboard from "@/views/fees/FeesDashboard";
import Invoices from "@/views/fees/Invoices";
import Concessions from "@/views/fees/Concessions";
import Reports from "@/views/accounting/Reports";
import AccountsDashboard from "@/views/accounting/AccountsDashboard";
import Ledger from "@/views/accounting/Ledger";
import Budgeting from "@/views/accounting/Budgeting";
import VendorBills from "@/views/accounting/VendorBills";
import LiveTracking from "@/views/transport/LiveTracking";
import Vehicles from "@/views/transport/Vehicles";
import Drivers from "@/views/transport/Drivers";
import TransportRoutes from "@/views/transport/Routes";
import InvCategories from "@/views/inventory/InvCategories";
import InvCategoryItems from "@/views/inventory/InvCategoryItems";
import InvReceive from "@/views/inventory/InvReceive";
import InvIssue from "@/views/inventory/InvIssue";
import InvPurchaseOrders from "@/views/inventory/InvPurchaseOrders";
import InvAnalysis from "@/views/inventory/InvAnalysis";
import Communications from "@/views/communication/Communications";
import CalendarView from "@/views/calendar/Calendar";
import Gallery from "@/views/media/Gallery";
import AICenter from "@/views/ai/AICenter";
import Analytics from "@/views/analytics/Analytics";
import Settings from "@/views/settings/Settings";
import NotFound from "@/views/common/NotFound";

// Marketing (public front-of-site)
import MarketingLayout from "@/marketing/MarketingLayout";
import Home from "@/marketing/pages/Home";
import Worlds from "@/marketing/pages/Worlds";
import Erp from "@/marketing/pages/Erp";
import Partners from "@/marketing/pages/Partners";
import Pricing from "@/marketing/pages/Pricing";
import About from "@/marketing/pages/About";
import Contact from "@/marketing/pages/Contact";
import Blog, { BlogPost } from "@/marketing/pages/Blog";
import Legal from "@/marketing/pages/Legal";
import GetStarted from "@/marketing/pages/GetStarted";

const CUSTOM = [
  ["/academics/classes", Classes],
  ["/staff", StaffDirectory], ["/staff/view/:id", StaffView],
  ["/staff/leave", LeaveManagement],
  ["/staff/compliance", Compliance],
  ["/development/milestones", Milestones],
  ["/development/portfolio", Portfolio],
  ["/development/worlds", WorldsLaunch],
  ["/academics/exams", Exams],
  ["/academics/lessons", Lms],
  ["/learn", Learn],
  ["/academics/report-cards", ReportCards],
  ["/academics/staff-timetable", StaffTimetable],
  ["/academics/timing", TimingProfiles],
  ["/admissions/visits", CampusVisits],
  ["/admissions/funnel", Funnel], ["/students/id-cards", IdCards], ["/students/promotion", Promotion],
  ["/attendance/students", StudentAttendance], ["/attendance/staff", StaffAttendance], ["/academics/timetable", Timetable],
  ["/staff/attendance", StaffLeave], ["/staff/payroll", Payroll], ["/staff/lifecycle", OnboardingExit], ["/staff/recruitment", Recruitment], ["/fees/collect", CollectFees], ["/fees/structure", FeeStructure], ["/fees/dashboard", FeesDashboard], ["/fees/invoices", Invoices], ["/fees/concessions", Concessions],
  ["/accounts/reports", Reports], ["/accounts", AccountsDashboard], ["/accounts/ledger", Ledger], ["/accounts/budget", Budgeting], ["/accounts/bills", VendorBills], ["/transport/tracking", LiveTracking], ["/transport/vehicles", Vehicles], ["/transport/drivers", Drivers], ["/transport/routes", TransportRoutes], ["/inventory", InvCategories], ["/inventory/cat/:catId", InvCategoryItems], ["/inventory/receive", InvReceive], ["/inventory/issue", InvIssue], ["/inventory/po", InvPurchaseOrders], ["/inventory/analysis", InvAnalysis], ["/communication/announcements", Communications], ["/communication/circulars", Communications], ["/calendar", CalendarView],
  ["/media", Gallery], ["/profile", Profile], ["/ai", AICenter], ["/analytics", Analytics], ["/settings", Settings],
];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/worlds" element={<Worlds />} />
        <Route path="/erp" element={<Erp />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/terms" element={<Legal kind="terms" />} />
        <Route path="/privacy" element={<Legal kind="privacy" />} />
        <Route path="/refund" element={<Legal kind="refund" />} />
        <Route path="/shipping" element={<Legal kind="shipping" />} />
        <Route path="/get-started" element={<GetStarted />} />
      </Route>

      {/* ERP auth */}
      <Route element={<AuthLayout />}>
        <Route path="/app/login" element={<Login />} />
        <Route path="/app/forgot" element={<ForgotPassword />} />
      </Route>

      {/* ERP app (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/setup" element={<RequireAdmin><SetupHub /></RequireAdmin>} />
          <Route path="/students/guardians" element={<RequireAdmin><GuardianLogins /></RequireAdmin>} />
          <Route path="/support" element={<SupportInbox />} />
          {resourceRoutes().map(({ to, resource }) => (
            <Route key={to} path={to} element={to.startsWith("/setup/") ? <RequireAdmin><ResourceView resource={resource} /></RequireAdmin> : <ResourceView resource={resource} />} />
          ))}
          {CUSTOM.map(([path, El]) => <Route key={path} path={path} element={<El />} />)}
        </Route>
      </Route>

      <Route path="/portal/login" element={<PortalLogin />} />
      <Route element={<PortalProtectedRoute />}>
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHome />} />
          <Route path="info" element={<PortalStudentInfo />} />
          <Route path="attendance" element={<PortalAttendance />} />
          <Route path="homework" element={<PortalHomework />} />
          <Route path="circulars" element={<PortalCirculars />} />
          <Route path="fees" element={<PortalFees />} />
          <Route path="calendar" element={<PortalCalendar />} />
          <Route path="timeline" element={<PortalTimeline />} />
          <Route path="timetable" element={<PortalTimetable />} />
          <Route path="materials" element={<PortalMaterials />} />
          <Route path="results" element={<PortalResults />} />
          <Route path="transport" element={<PortalTransport />} />
          <Route path="support" element={<PortalSupport />} />
          {PORTAL_NAV.filter((n) => !n.end && !["/portal/info", "/portal/attendance", "/portal/homework", "/portal/circulars", "/portal/fees", "/portal/calendar", "/portal/timeline", "/portal/timetable", "/portal/materials", "/portal/results", "/portal/transport", "/portal/support"].includes(n.to)).map((n) => (
            <Route key={n.to} path={n.to.replace("/portal/", "")} element={<PortalPlaceholder />} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
