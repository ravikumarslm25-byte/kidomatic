// Every gate-able area of the ERP. Roles grant view / manage per feature.
export const FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "admissions", label: "Admissions" },
  { key: "students", label: "Students" },
  { key: "attendance", label: "Attendance" },
  { key: "academics", label: "Academics" },
  { key: "development", label: "Development" },
  { key: "staff", label: "Staff & HR" },
  { key: "fees", label: "Fees" },
  { key: "accounts", label: "Accounts" },
  { key: "transport", label: "Transport" },
  { key: "inventory", label: "Inventory" },
  { key: "communication", label: "Communication" },
  { key: "calendar", label: "Calendar & Events" },
  { key: "media", label: "Media & Timeline" },
  { key: "ai", label: "AI Center" },
  { key: "analytics", label: "Analytics" },
  { key: "setup", label: "Setup & Masters" },
];
// nav group / item label -> feature key (for sidebar gating without editing nav)
export const LABEL_FEATURE = {
  "Dashboard": "dashboard", "Admissions": "admissions", "Students": "students", "Attendance": "attendance",
  "Academics": "academics", "Development": "development", "Staff": "staff", "Fees": "fees", "Accounts": "accounts",
  "Transport": "transport", "Inventory": "inventory", "Communication": "communication",
  "Calendar & Events": "calendar", "Media & Timeline": "media", "AI Center": "ai", "Analytics": "analytics",
  "Setup & Masters": "setup", "Settings": "setup",
};
