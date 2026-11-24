import { LayoutDashboard, UserPlus, Filter, CalendarClock, GraduationCap, CreditCard, ArrowUpDown, CalendarCheck, Users, LayoutGrid, BookOpen, CalendarDays, ClipboardList, PencilLine, MonitorPlay, FileText, Sparkles, Image as ImageIcon, Briefcase, Plane, Wallet, ReceiptText, HandCoins, FileSpreadsheet, BadgePercent, ArrowLeftRight, PieChart, Bus, UserCog, Route as RouteIcon, MapPin, Package, ShoppingCart, Megaphone, Mail, Images, Bot, BarChart3, LifeBuoy, Settings, CalendarRange, Clock, ShieldCheck, ClipboardCheck, UserSearch, Target, ListTree, Landmark, Truck, Boxes, ArrowDownToLine, ArrowUpFromLine, LineChart, Gamepad2 } from "lucide-react";

// Each item: { label, to, icon, resource? }
// If `resource` is present, the route renders the generic ResourceView for that
// module. Otherwise a custom view is wired in routes/index.jsx.
export const NAV = [
  { type: "item", label: "Dashboard", to: "/app", icon: LayoutDashboard },

  { type: "group", label: "Admissions", icon: UserPlus, items: [
    { label: "Enquiries", to: "/admissions/enquiries", icon: UserPlus, resource: "enquiries" },
    { label: "Admission Funnel", to: "/admissions/funnel", icon: Filter },
    { label: "Campus Visits", to: "/admissions/visits", icon: CalendarClock },
  ]},

  { type: "group", label: "Students", icon: GraduationCap, items: [
    { label: "All Students", to: "/students", icon: GraduationCap, resource: "students" },
    { label: "ID Cards", to: "/students/id-cards", icon: CreditCard },
    { label: "Promotion", to: "/students/promotion", icon: ArrowUpDown },
    { label: "Guardian Logins", to: "/students/guardians", icon: Users },
  ]},

  { type: "group", label: "Attendance", icon: CalendarCheck, items: [
    { label: "Student Attendance", to: "/attendance/students", icon: CalendarCheck },
    { label: "Staff Attendance", to: "/attendance/staff", icon: CalendarCheck },
  ]},

  { type: "group", label: "Academics", icon: BookOpen, items: [
    { label: "Classes & Sections", to: "/academics/classes", icon: LayoutGrid },
    { label: "Subjects", to: "/academics/subjects", icon: BookOpen, resource: "subjects" },
    { label: "Timetable", to: "/academics/timetable", icon: CalendarDays },
    { label: "Staff Timetable", to: "/academics/staff-timetable", icon: CalendarRange },
    { label: "Timing Master", to: "/academics/timing", icon: Clock },
    { label: "Exams", to: "/academics/exams", icon: ClipboardList },
    { label: "Homework", to: "/academics/homework", icon: PencilLine, resource: "homework" },
    { label: "Lessons (LMS)", to: "/academics/lessons", icon: MonitorPlay },
    { label: "Report Cards", to: "/academics/report-cards", icon: FileText },
  ]},

  { type: "group", label: "Development", icon: Sparkles, items: [
    { label: "Skills & Milestones", to: "/development/milestones", icon: Sparkles },
    { label: "Portfolio", to: "/development/portfolio", icon: ImageIcon },
    { label: "KidoMatic Worlds", to: "/development/worlds", icon: Gamepad2 },
  ]},


  { type: "group", label: "Staff", icon: Briefcase, items: [
    { label: "Staff Directory", to: "/staff", icon: Briefcase },
    { label: "Compliance & Inspection", to: "/staff/compliance", icon: ShieldCheck },
    { label: "Leave Management", to: "/staff/leave", icon: CalendarCheck },
    { label: "Payroll", to: "/staff/payroll", icon: Wallet },
    { label: "Onboarding & Exit", to: "/staff/lifecycle", icon: ClipboardCheck },
    { label: "Recruitment", to: "/staff/recruitment", icon: UserSearch },
  ]},

  { type: "group", label: "Fees", icon: ReceiptText, items: [
    { label: "Fees Dashboard", to: "/fees/dashboard", icon: LayoutDashboard },
    { label: "Fee Structure", to: "/fees/structure", icon: ReceiptText },
    { label: "Collect Fees", to: "/fees/collect", icon: HandCoins },
    { label: "Invoices & Collection", to: "/fees/invoices", icon: FileSpreadsheet },
    { label: "Concessions", to: "/fees/concessions", icon: BadgePercent },
  ]},

  { type: "group", label: "Accounts", icon: Wallet, items: [
    { label: "Accounts Dashboard", to: "/accounts", icon: LayoutDashboard },
    { label: "Ledger", to: "/accounts/ledger", icon: ArrowLeftRight },
    { label: "Budgeting", to: "/accounts/budget", icon: Target },
    { label: "Vendor Bills", to: "/accounts/bills", icon: ReceiptText },
    { label: "Reports", to: "/accounts/reports", icon: PieChart },
  ]},

  { type: "group", label: "Transport", icon: Bus, items: [
    { label: "Vehicles / Buses", to: "/transport/vehicles", icon: Bus },
    { label: "Drivers", to: "/transport/drivers", icon: UserCog },
    { label: "Routes & Stops", to: "/transport/routes", icon: RouteIcon },
    { label: "Live Tracking", to: "/transport/tracking", icon: MapPin },
  ]},

  { type: "group", label: "Inventory", icon: Package, items: [
    { label: "Categories & Items", to: "/inventory", icon: Boxes },
    { label: "Receive Stock", to: "/inventory/receive", icon: ArrowDownToLine },
    { label: "Issue / Take-out", to: "/inventory/issue", icon: ArrowUpFromLine },
    { label: "Purchase Orders", to: "/inventory/po", icon: ShoppingCart },
    { label: "Consumption Analysis", to: "/inventory/analysis", icon: LineChart },
  ]},

  { type: "group", label: "Communication", icon: Megaphone, items: [
    { label: "Announcements", to: "/communication/announcements", icon: Megaphone },
    { label: "Circulars", to: "/communication/circulars", icon: Mail },
  ]},

  { type: "item", label: "Calendar & Events", to: "/calendar", icon: CalendarDays },
  { type: "item", label: "Media & Timeline", to: "/media", icon: Images },
  { type: "item", label: "AI Center", to: "/ai", icon: Bot, badge: "AI" },
  { type: "item", label: "Analytics", to: "/analytics", icon: BarChart3 },
  { type: "item", label: "Support Inbox", to: "/support", icon: LifeBuoy },
  { type: "group", label: "Setup & Masters", icon: Settings, admin: true, items: [
    { label: "Setup Home", to: "/setup", icon: Settings },
    { label: "Fee Heads", to: "/setup/fee-heads", icon: ReceiptText, resource: "feeHeads" },
    { label: "Chart of Accounts", to: "/setup/account-heads", icon: ListTree, resource: "accountHeads" },
    { label: "Cash & Bank", to: "/setup/cash-accounts", icon: Landmark, resource: "cashAccounts" },
    { label: "Vendors", to: "/setup/vendors", icon: Truck, resource: "vendors" },
    { label: "Message Templates", to: "/setup/message-templates", icon: Mail, resource: "commTemplates" },
    { label: "Grading Scale", to: "/setup/grading", icon: FileText, resource: "grading" },
    { label: "Periods & Bells", to: "/setup/periods", icon: CalendarDays, resource: "periods" },
    { label: "Departments", to: "/setup/departments", icon: Briefcase, resource: "departments" },
    { label: "Designations", to: "/setup/designations", icon: UserCog, resource: "designations" },
  ]},
  { type: "item", label: "Settings", to: "/settings", icon: Settings },
];

// Flatten to resource-route pairs for router generation.
export const resourceRoutes = () => {
  const out = [];
  NAV.forEach((n) => {
    if (n.resource) out.push({ to: n.to, resource: n.resource, icon: n.icon });
    (n.items || []).forEach((it) => it.resource && out.push({ to: it.to, resource: it.resource, icon: it.icon }));
  });
  return out;
};
