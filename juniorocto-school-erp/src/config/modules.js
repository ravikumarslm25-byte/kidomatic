// ─────────────────────────────────────────────────────────────────────────
// MODULE REGISTRY (the Model layer's schema source)
// Each entry defines a resource: table columns, form fields, and seed rows.
// The generic ResourceView + mock DB both read from here, so a new screen is
// one config block. Column types: text | badge | money | date | count | chip.
// Field types: text | number | money | date | select | textarea | phone | email
// ─────────────────────────────────────────────────────────────────────────

const S = (...v) => v; // options helper

const students = [
  ["ADM2601", "Aarav Sharma", "Grade 3", "B", "Male", "Rahul Sharma", "98450 11223", "Active"],
  ["ADM2602", "Diya Patel", "Grade 1", "A", "Female", "Nisha Patel", "99862 44551", "Active"],
  ["ADM2603", "Vihaan Reddy", "UKG", "A", "Male", "Kiran Reddy", "90031 77820", "Active"],
  ["ADM2604", "Ananya Iyer", "Grade 5", "C", "Female", "Suresh Iyer", "98847 33019", "Active"],
  ["ADM2605", "Kabir Khan", "Nursery", "A", "Male", "Imran Khan", "97411 66302", "Active"],
  ["ADM2606", "Sara Menon", "Grade 2", "B", "Female", "Lakshmi Menon", "99527 88104", "Active"],
  ["ADM2607", "Advait Rao", "LKG", "B", "Male", "Ganesh Rao", "90807 55210", "Inactive"],
  ["ADM2608", "Myra Nair", "Grade 4", "A", "Female", "Deepa Nair", "98653 22947", "Active"],
].map(([admissionNo, name, klass, section, gender, parent, phone, status]) => ({
  admissionNo, name, klass, section, gender, parent, phone, status,
}));

const enquiries = [
  ["Aditya Bose", "Grade 2", "Sanjay Bose", "98450 90011", "Website", "New"],
  ["Ishita Verma", "LKG", "Pooja Verma", "99820 45521", "Referral", "Contacted"],
  ["Reyansh Gupta", "Grade 6", "Manish Gupta", "90042 11987", "Walk-in", "Visit Scheduled"],
  ["Anvi Joshi", "Nursery", "Rekha Joshi", "97418 33265", "Instagram", "Application"],
  ["Dhruv Malhotra", "Grade 1", "Vikram Malhotra", "98844 22110", "Google Ads", "Admitted"],
  ["Kiara Shah", "UKG", "Neha Shah", "99527 66430", "Website", "Lost"],
].map(([name, klass, parent, phone, source, status]) => ({ name, klass, parent, phone, source, status }));

const parents = [
  ["Rahul Sharma", "Father", "Aarav Sharma", "98450 11223", "rahul.s@email.com", "Business"],
  ["Nisha Patel", "Mother", "Diya Patel", "99862 44551", "nisha.p@email.com", "Doctor"],
  ["Kiran Reddy", "Father", "Vihaan Reddy", "90031 77820", "kiran.r@email.com", "Engineer"],
  ["Suresh Iyer", "Father", "Ananya Iyer", "98847 33019", "s.iyer@email.com", "Professor"],
  ["Lakshmi Menon", "Mother", "Sara Menon", "99527 88104", "l.menon@email.com", "Architect"],
].map(([name, relation, children, phone, email, occupation]) => ({ name, relation, children, phone, email, occupation }));

const staff = [
  ["EMP101", "Meera Krishnan", "Class Teacher", "Primary", "98450 30021", "Active"],
  ["EMP102", "Arjun Nair", "Subject Teacher", "Mathematics", "99862 71140", "Active"],
  ["EMP103", "Fatima Sheikh", "Coordinator", "Pre-Primary", "90031 55208", "Active"],
  ["EMP104", "Ravi Prakash", "Accountant", "Administration", "98847 90312", "Active"],
  ["EMP105", "Sneha Das", "Counsellor", "Admissions", "99527 12084", "On Leave"],
].map(([empId, name, role, department, phone, status]) => ({ empId, name, role, department, phone, status }));

const classes = [
  ["Nursery", "A, B", "Fatima Sheikh", 42, "Early Years"],
  ["LKG", "A, B", "Meera Krishnan", 48, "Early Years"],
  ["UKG", "A", "Priya Menon", 26, "Early Years"],
  ["Grade 1", "A, B", "Anita Rao", 58, "K-12"],
  ["Grade 3", "A, B, C", "Arjun Nair", 74, "K-12"],
  ["Grade 5", "A, B, C", "Deepak Shah", 71, "K-12"],
].map(([name, sections, teacher, strength, model]) => ({ name, sections, teacher, strength, model }));

const subjects = [
  ["English", "ENG", "Grade 3", "Meera Krishnan"],
  ["Mathematics", "MAT", "Grade 3", "Arjun Nair"],
  ["EVS", "EVS", "Grade 3", "Anita Rao"],
  ["Rhymes & Play", "PLY", "LKG", "Fatima Sheikh"],
].map(([name, code, klass, teacher]) => ({ name, code, klass, teacher }));

const exams = [
  ["Term 1 Assessment", "Grade 3", "Written", "2026-09-14", "Scheduled"],
  ["Half-Yearly", "Grade 5", "Written", "2026-10-06", "Draft"],
  ["Observation Cycle 1", "LKG", "Observation", "2026-08-20", "Ongoing"],
].map(([name, klass, type, startDate, status]) => ({ name, klass, type, startDate, status }));
exams.unshift({ id: "exmid", name: "Mid Term Examination 2026", klass: "Grade 3", section: "", examType: "Mid Term", status: "Completed", startDate: "2026-08-05", endDate: "2026-08-09", schedule: [
  { date: "2026-08-05", subject: "Mathematics", maxMarks: 100, startTime: "09:30", endTime: "12:00", hall: "Hall A", invigilator: "Meera Krishnan" },
  { date: "2026-08-07", subject: "English", maxMarks: 100, startTime: "09:30", endTime: "12:00", hall: "Hall A", invigilator: "Arjun Nair" },
  { date: "2026-08-09", subject: "Art", maxMarks: 50, startTime: "09:30", endTime: "11:00", hall: "Hall B", invigilator: "Sneha Das" } ] });

const homework = [
  ["Reading: The Thirsty Crow", "Grade 1", "English", "2026-07-10", "Assigned"],
  ["Worksheet: Numbers 1–50", "Grade 3", "Mathematics", "2026-07-09", "Assigned"],
  ["Draw your family", "LKG", "Art", "2026-07-08", "Reviewed"],
].map(([title, klass, subject, dueDate, status]) => ({ title, klass, subject, dueDate, status }));

const lessons = [
  ["The Solar System", "Grade 5", "EVS", "AR", "Published"],
  ["Shapes Around Us", "UKG", "Maths Readiness", "Video", "Published"],
  ["Phonics: Letter B", "LKG", "English", "AR", "Draft"],
].map(([title, klass, subject, type, status]) => ({ title, klass, subject, type, status }));

const reportCards = [
  ["Aarav Sharma", "Grade 3", "Term 1", "Draft"],
  ["Diya Patel", "Grade 1", "Term 1", "Published"],
  ["Vihaan Reddy", "UKG", "Cycle 1 (Portfolio)", "Draft"],
].map(([student, klass, term, status]) => ({ student, klass, term, status }));

const milestones = [
  ["Vihaan Reddy", "Cognitive", "Counts 1–20", "Emerging", "2026-07-02"],
  ["Kabir Khan", "Language", "Two-word sentences", "Achieved", "2026-07-01"],
  ["Advait Rao", "Fine Motor", "Holds pencil (tripod)", "Needs support", "2026-06-28"],
  ["Anvi Joshi", "Social", "Shares & takes turns", "Emerging", "2026-07-03"],
].map(([child, domain, skill, level, updated]) => ({ child, domain, skill, level, updated }));

const portfolio = [
  ["Vihaan Reddy", "Clay modelling — octopus", "Photo", "2026-07-02"],
  ["Kabir Khan", "First independent painting", "Photo", "2026-06-30"],
  ["Anvi Joshi", "Building blocks tower", "Video", "2026-07-03"],
].map(([child, title, type, date]) => ({ child, title, type, date }));

const feeStructure = [
  ["Tuition Fee — K-12", "Grade 1–5", "Term 1", 24000],
  ["Tuition Fee — Early Years", "Nursery–UKG", "Term 1", 18000],
  ["Transport Fee (Zone A)", "All", "Term 1", 6000],
  ["Activity & Lab Fee", "Grade 1–5", "Annual", 4500],
].map(([name, klass, term, amount]) => ({ name, klass, term, amount }));

const invoices = [
  ["INV-26-0412", "Aarav Sharma", 24000, "2026-07-15", "Paid"],
  ["INV-26-0413", "Diya Patel", 18000, "2026-07-15", "Due"],
  ["INV-26-0414", "Ananya Iyer", 30000, "2026-07-10", "Partial"],
  ["INV-26-0415", "Vihaan Reddy", 18000, "2026-07-05", "Overdue"],
  ["INV-26-0416", "Sara Menon", 24000, "2026-07-15", "Paid"],
].map(([invoiceNo, student, amount, dueDate, status]) => ({ invoiceNo, student, amount, dueDate, status }));

const discounts = [
  ["Sibling Discount", "Percent", "10", "All"],
  ["Staff Ward", "Percent", "50", "All"],
  ["Early Bird", "Flat", "2000", "Grade 1–5"],
].map(([name, type, value, klass]) => ({ name, type, value, klass }));

const incomeExpense = [
  ["2026-07-05", "Tuition collection", "Income", 246000, "UPI"],
  ["2026-07-04", "Staff salary — July", "Expense", 480000, "NEFT"],
  ["2026-07-03", "Transport diesel", "Expense", 32000, "Cash"],
  ["2026-07-02", "Admission fee", "Income", 90000, "Card"],
].map(([date, head, type, amount, mode]) => ({ date, head, type, amount, mode }));

const vehicles = [
  ["TN 30 AB 1234", "Bus (40-seat)", 40, "Murugan S", "Route A", "On Route"],
  ["TN 30 AB 5678", "Bus (30-seat)", 30, "Kader B", "Route B", "Idle"],
  ["TN 30 AC 9012", "Van (12-seat)", 12, "Selvam R", "Route C", "Maintenance"],
].map(([number, type, capacity, driver, route, status]) => ({ number, type, capacity, driver, route, status }));

const drivers = [
  ["Murugan S", "98450 77001", "TN0120210012345", "TN 30 AB 1234"],
  ["Kader B", "99862 77002", "TN0120190067890", "TN 30 AB 5678"],
].map(([name, phone, license, vehicle]) => ({ name, phone, license, vehicle }));

const routes = [
  ["Route A — Fairlands", "12 stops", "TN 30 AB 1234", 34],
  ["Route B — Hasthampatti", "9 stops", "TN 30 AB 5678", 22],
  ["Route C — Alagapuram", "7 stops", "TN 30 AC 9012", 11],
].map(([name, stops, vehicle, students]) => ({ name, stops, vehicle, students }));

const inventoryItems = [
  ["Crayons (24 pack)", "Stationery", 320, "packs", 50],
  ["Notebooks (200pg)", "Stationery", 45, "units", 100],
  ["School Uniform — Set", "Uniform", 88, "sets", 40],
  ["Building Blocks Kit", "Toys", 12, "kits", 15],
].map(([name, category, stock, unit, reorder]) => ({ name, category, stock, unit, reorder }));

const purchaseOrders = [
  ["PO-2026-021", "Kalaimagal Stationers", "Crayons, Notebooks", 42000, "Delivered"],
  ["PO-2026-022", "Chennai Uniforms Co", "Uniform sets ×100", 118000, "Pending"],
].map(([poNo, vendor, items, amount, status]) => ({ poNo, vendor, items, amount, status }));

const announcements = [
  ["Independence Day Celebration", "Whole School", "2026-08-15", "Published"],
  ["PTM — Grade 1 to 5", "Grade 1–5 Parents", "2026-07-20", "Published"],
  ["Fee reminder — Term 1", "All Parents", "2026-07-12", "Scheduled"],
].map(([title, audience, date, status]) => ({ title, audience, date, status }));

const circulars = [
  ["Revised timings from Aug", "All Parents", "2026-07-06", "circular-timings.pdf"],
  ["Annual Day participation", "Grade 3–5", "2026-07-04", "annual-day.pdf"],
].map(([title, audience, date, attachment]) => ({ title, audience, date, attachment }));

const campusVisits = [
  ["Reyansh Gupta", "2026-07-11 11:00", "Sneha Das", "Confirmed"],
  ["Anvi Joshi", "2026-07-12 15:30", "Sneha Das", "Pending"],
].map(([enquiry, slot, counsellor, status]) => ({ enquiry, slot, counsellor, status }));

// Registry ------------------------------------------------------------------
export const MODULES = {

  feeHeads: { title: "Fee Heads", singular: "Fee Head", icon: "ReceiptText",
    columns: [{ key: "name", label: "Name" }, { key: "category", label: "Category", type: "chip" }, { key: "defaultAmount", label: "Default", type: "money" }, { key: "frequency", label: "Frequency", type: "chip" }],
    fields: [{ name: "name", label: "Fee head name", required: true }, { name: "category", label: "Category", type: "select", options: S("Tuition","Transport","Admission","Books","Activity","Exam","Other") }, { name: "defaultAmount", label: "Default amount", type: "money" }, { name: "frequency", label: "Frequency", type: "select", options: S("Monthly","Term","Annual","One-time") }],
    seed: [{ id: "fh1", name: "Tuition Fee", category: "Tuition", defaultAmount: 12000, frequency: "Term" }, { id: "fh2", name: "Transport Fee", category: "Transport", defaultAmount: 1800, frequency: "Monthly" }, { id: "fh3", name: "Admission Fee", category: "Admission", defaultAmount: 25000, frequency: "One-time" }] },
  periods: { title: "Periods & Bells", singular: "Period", icon: "CalendarDays",
    columns: [{ key: "name", label: "Period" }, { key: "startTime", label: "Start", type: "mono" }, { key: "endTime", label: "End", type: "mono" }, { key: "order", label: "Order", type: "count" }],
    fields: [{ name: "name", label: "Period name", required: true }, { name: "startTime", label: "Start time" }, { name: "endTime", label: "End time" }, { name: "order", label: "Order", type: "number" }],
    seed: [{ id: "p1", name: "Period 1", startTime: "9:00", endTime: "9:45", order: 1 }, { id: "p2", name: "Period 2", startTime: "9:50", endTime: "10:35", order: 2 }] },
  grading: { title: "Grading Scale", singular: "Grade", icon: "FileText",
    columns: [{ key: "grade", label: "Grade", type: "chip" }, { key: "minPct", label: "Min %", type: "count" }, { key: "maxPct", label: "Max %", type: "count" }, { key: "remark", label: "Remark" }],
    fields: [{ name: "grade", label: "Grade", required: true }, { name: "minPct", label: "Min %", type: "number" }, { name: "maxPct", label: "Max %", type: "number" }, { name: "remark", label: "Remark" }],
    seed: [{ id: "g1", grade: "A+", minPct: 90, maxPct: 100, remark: "Outstanding" }, { id: "g2", grade: "A", minPct: 80, maxPct: 89, remark: "Excellent" }, { id: "g3", grade: "B", minPct: 70, maxPct: 79, remark: "Good" }] },
  departments: { title: "Departments", singular: "Department", icon: "Briefcase",
    columns: [{ key: "name", label: "Department" }, { key: "head", label: "Head" }],
    fields: [{ name: "name", label: "Department name", required: true }, { name: "head", label: "Head of department", type: "ref", resource: "staff", labelKey: "name" }],
    seed: [
      { id: "d1", name: "Pre-Primary", head: "" }, { id: "d2", name: "Primary", head: "" }, { id: "d3", name: "Secondary", head: "" }, { id: "d4", name: "Senior Secondary", head: "" },
      { id: "d5", name: "Administration", head: "" }, { id: "d6", name: "Accounts", head: "" }, { id: "d7", name: "Front Office", head: "" }, { id: "d8", name: "Library", head: "" },
      { id: "d9", name: "Sports", head: "" }, { id: "d10", name: "IT", head: "" }, { id: "d11", name: "Transport", head: "" }, { id: "d12", name: "Housekeeping & Support", head: "" } ] },
  designations: { title: "Designations", singular: "Designation", icon: "UserCog",
    columns: [{ key: "name", label: "Designation" }, { key: "category", label: "Category", type: "chip" }, { key: "department", label: "Department", type: "chip" }],
    fields: [
      { name: "name", label: "Designation name", required: true },
      { name: "category", label: "Category", type: "select", options: S("Teaching", "Non-Teaching / Admin", "Management", "Support / Class-IV") },
      { name: "department", label: "Department", type: "ref", resource: "departments", labelKey: "name" },
    ],
    seed: [
      { id: "ds1", name: "Pre-Primary Teacher", category: "Teaching", department: "Pre-Primary" },
      { id: "ds2", name: "Primary Teacher", category: "Teaching", department: "Primary" },
      { id: "ds3", name: "TGT", category: "Teaching", department: "Secondary" },
      { id: "ds4", name: "PGT", category: "Teaching", department: "Senior Secondary" },
      { id: "ds5", name: "Class Teacher", category: "Teaching", department: "Primary" },
      { id: "ds6", name: "Sports / PET", category: "Teaching", department: "Sports" },
      { id: "ds7", name: "Librarian", category: "Non-Teaching / Admin", department: "Library" },
      { id: "ds8", name: "Accountant", category: "Non-Teaching / Admin", department: "Accounts" },
      { id: "ds9", name: "Receptionist", category: "Non-Teaching / Admin", department: "Front Office" },
      { id: "ds10", name: "IT Admin", category: "Non-Teaching / Admin", department: "IT" },
      { id: "ds11", name: "Principal", category: "Management", department: "Administration" },
      { id: "ds12", name: "Vice-Principal", category: "Management", department: "Administration" },
      { id: "ds13", name: "Academic Coordinator", category: "Management", department: "Administration" },
      { id: "ds14", name: "Driver", category: "Support / Class-IV", department: "Transport" },
      { id: "ds15", name: "Bus Attendant / Ayah", category: "Support / Class-IV", department: "Transport" },
      { id: "ds16", name: "Security Guard", category: "Support / Class-IV", department: "Housekeeping & Support" },
      { id: "ds17", name: "Attender / Peon", category: "Support / Class-IV", department: "Housekeeping & Support" },
      { id: "ds18", name: "Housekeeping", category: "Support / Class-IV", department: "Housekeeping & Support" },
    ] },

  commTemplates: { title: "Message Templates", singular: "Template", icon: "FileText",
    columns: [{ key: "name", label: "Template" }, { key: "type", label: "Type", type: "chip" }, { key: "category", label: "Category", type: "chip" }],
    fields: [
      { name: "name", label: "Template name", required: true },
      { name: "type", label: "Type", type: "select", options: S("Announcement", "Circular") },
      { name: "category", label: "Category", type: "select", options: S("General", "Academic", "Event", "Holiday", "Fees", "Exam", "PTM", "Emergency") },
      { name: "title", label: "Title" },
      { name: "body", label: "Message body", type: "textarea" },
    ],
    seed: [
      { id: "ct1", name: "Holiday Notice", type: "Announcement", category: "Holiday", title: "Holiday — {{occasion}}", body: "Dear Parents,\n\nThe school will remain closed on {{date}} on account of {{occasion}}. Classes resume the next working day.\n\nRegards,\nPrincipal" },
      { id: "ct2", name: "PTM Invitation", type: "Circular", category: "PTM", title: "Parent-Teacher Meeting", body: "Dear Parents,\n\nA Parent-Teacher Meeting is scheduled on {{date}} from {{time}}. Your presence is requested.\n\nRegards,\nPrincipal" },
      { id: "ct3", name: "Fee Reminder", type: "Announcement", category: "Fees", title: "Fee Payment Reminder", body: "Dear Parents,\n\nThe term fees are due by {{date}}. Kindly clear the dues to avoid a late fee.\n\nRegards,\nAccounts Office" },
    ] },
  accountHeads: { title: "Chart of Accounts", singular: "Account Head", icon: "ListTree",
    columns: [{ key: "name", label: "Head" }, { key: "type", label: "Type", type: "badge" }, { key: "category", label: "Category", type: "chip" }, { key: "department", label: "Department", type: "chip" }],
    fields: [
      { name: "name", label: "Head name", required: true },
      { name: "type", label: "Type", type: "select", options: S("Income", "Expense") },
      { name: "category", label: "Category" },
      { name: "department", label: "Department", type: "ref", resource: "departments", labelKey: "name" },
    ],
    seed: [
      { id: "ah1", name: "Student Fees", type: "Income", category: "Fees" },
      { id: "ah2", name: "Admission Fees", type: "Income", category: "Fees" },
      { id: "ah3", name: "Transport Fees", type: "Income", category: "Fees" },
      { id: "ah4", name: "Partnership / Sponsorship", type: "Income", category: "Other" },
      { id: "ah5", name: "Grants & Donations", type: "Income", category: "Other" },
      { id: "ah6", name: "Other Income", type: "Income", category: "Other" },
      { id: "ah7", name: "Salaries & Wages", type: "Expense", category: "Payroll", department: "Administration" },
      { id: "ah8", name: "Stationery & Printing", type: "Expense", category: "Supplies" },
      { id: "ah9", name: "Books & Library", type: "Expense", category: "Academics", department: "Library" },
      { id: "ah10", name: "Lab & Teaching Aids", type: "Expense", category: "Academics" },
      { id: "ah11", name: "Electricity & Water", type: "Expense", category: "Utilities" },
      { id: "ah12", name: "Fuel / Petrol / Diesel", type: "Expense", category: "Transport", department: "Transport" },
      { id: "ah13", name: "Vehicle Maintenance", type: "Expense", category: "Transport", department: "Transport" },
      { id: "ah14", name: "Repairs & Maintenance", type: "Expense", category: "Facilities" },
      { id: "ah15", name: "Housekeeping & Cleaning", type: "Expense", category: "Facilities" },
      { id: "ah16", name: "Marketing & Events", type: "Expense", category: "Marketing" },
      { id: "ah17", name: "Software & Subscriptions", type: "Expense", category: "IT", department: "IT" },
      { id: "ah18", name: "Professional / Legal Fees", type: "Expense", category: "Admin" },
      { id: "ah19", name: "Rent & Lease", type: "Expense", category: "Facilities" },
      { id: "ah20", name: "Miscellaneous", type: "Expense", category: "Other" },
    ] },
  cashAccounts: { title: "Cash & Bank", singular: "Account", icon: "Landmark",
    columns: [{ key: "name", label: "Account" }, { key: "type", label: "Type", type: "chip" }, { key: "bankName", label: "Bank" }, { key: "openingBalance", label: "Opening", type: "mono" }],
    fields: [
      { name: "name", label: "Account name", required: true },
      { name: "type", label: "Type", type: "select", options: S("Cash", "Bank") },
      { name: "bankName", label: "Bank name" },
      { name: "accountNo", label: "Account number" },
      { name: "openingBalance", label: "Opening balance", type: "number" },
    ],
    seed: [
      { id: "ca1", name: "Main Cash", type: "Cash", openingBalance: 50000 },
      { id: "ca2", name: "School Current A/C", type: "Bank", bankName: "HDFC Bank", openingBalance: 500000 },
      { id: "ca3", name: "Fees Collection A/C", type: "Bank", bankName: "ICICI Bank", openingBalance: 0 },
    ] },
  vendors: { title: "Vendors", singular: "Vendor", icon: "Truck",
    columns: [{ key: "name", label: "Vendor" }, { key: "category", label: "Category", type: "chip" }, { key: "phone", label: "Phone", type: "mono" }, { key: "gstin", label: "GSTIN", type: "mono" }],
    fields: [
      { name: "name", label: "Vendor name", required: true },
      { name: "category", label: "Category", type: "select", options: S("Stationery", "Books", "Uniform", "Food / Canteen", "Transport / Fuel", "Facilities", "IT / Software", "Services", "Other") },
      { name: "phone", label: "Phone", type: "phone" },
      { name: "email", label: "Email" },
      { name: "gstin", label: "GSTIN" },
      { name: "openingBalance", label: "Opening balance (payable)", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    seed: [
      { id: "v1", name: "Sri Saradha Stationers", category: "Stationery", phone: "9840012345" },
      { id: "v2", name: "Bharath Petroleum", category: "Transport / Fuel" },
      { id: "v3", name: "Navneet Publications", category: "Books" },
    ] },
  enquiries: {
    title: "Enquiries", singular: "Enquiry", icon: "UserPlus",
    columns: [
      { key: "name", label: "Student", type: "text" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "parentName", label: "Parent" },
      { key: "phone", label: "Phone", type: "mono" },
      { key: "source", label: "Source", type: "chip" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "name", label: "Student name", required: true },
      { name: "klass", label: "Applying for class", type: "select", options: S("Nursery","LKG","UKG","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6") },
      { name: "parent", label: "Parent name" },
      { name: "phone", label: "Phone", type: "phone" },
      { name: "source", label: "Source", type: "select", options: S("Website","Referral","Walk-in","Instagram","Google Ads") },
      { name: "status", label: "Status", type: "select", options: S("New","Contacted","Visit Scheduled","Application","Admitted","Lost") },
    ],
    seed: enquiries,
  },
  campusVisits: {
    title: "Campus Visits", singular: "Visit", icon: "CalendarClock",
    columns: [
      { key: "enquiry", label: "Enquiry" },
      { key: "slot", label: "Slot", type: "mono" },
      { key: "counsellor", label: "Counsellor" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "enquiry", label: "Enquiry / Student", required: true },
      { name: "slot", label: "Date & time" },
      { name: "counsellor", label: "Counsellor" },
      { name: "status", label: "Status", type: "select", options: S("Pending","Confirmed","Completed","No-show") },
    ],
    seed: campusVisits,
  },
  students: {
    title: "Students", singular: "Student", icon: "GraduationCap",
    searchKeys: ["name", "admissionNo", "parentName"],
    columns: [
      { key: "admissionNo", label: "Adm. No", type: "mono" },
      { key: "name", label: "Name", type: "avatar" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "section", label: "Sec" },
      { key: "parentName", label: "Parent" },
      { key: "phone", label: "Phone", type: "mono" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "admissionNo", label: "Admission No", required: true },
      { name: "name", label: "Student full name", required: true },
      { name: "dob", label: "Date of birth", type: "date" },
      { name: "gender", label: "Gender", type: "select", options: S("Male","Female","Other") },
      { name: "klass", label: "Class", type: "ref", resource: "classes", labelKey: "name", required: true },
      { name: "section", label: "Section (optional — assign later)", type: "select", options: S("","A","B","C","D") },
      { name: "route", label: "Transport route", type: "ref", resource: "routes", labelKey: "name" },
      { name: "parentName", label: "Parent / Guardian name" },
      { name: "relation", label: "Relation", type: "select", options: S("Father","Mother","Guardian") },
      { name: "phone", label: "Parent phone", type: "phone" },
      { name: "parentEmail", label: "Parent email", type: "email" },
      { name: "kycPhoto", label: "Student photo", type: "file", placeholder: "kyc" },
      { name: "kycBirthCert", label: "Birth certificate", type: "file", placeholder: "kyc" },
      { name: "kycAadhaar", label: "Aadhaar", type: "file", placeholder: "kyc" },
      { name: "status", label: "Status", type: "select", options: S("Active","Inactive") },
      { name: "allowParentLogin", label: "Allow parent login (creates a parent account)", type: "toggle" },
    ],
    seed: students,
  },
  parents: {
    title: "Parents", singular: "Parent", icon: "Users",
    columns: [
      { key: "name", label: "Name", type: "avatar" },
      { key: "relation", label: "Relation", type: "chip" },
      { key: "children", label: "Child" },
      { key: "phone", label: "Phone", type: "mono" },
      { key: "email", label: "Email" },
      { key: "occupation", label: "Occupation" },
    ],
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "relation", label: "Relation", type: "select", options: S("Father","Mother","Guardian") },
      { name: "children", label: "Child (student)" },
      { name: "phone", label: "Phone", type: "phone" },
      { name: "email", label: "Email", type: "email" },
      { name: "occupation", label: "Occupation" },
    ],
    seed: parents,
  },
  staff: {
    title: "Staff", singular: "Staff", icon: "Briefcase",
    columns: [
      { key: "empId", label: "Emp ID", type: "mono" },
      { key: "name", label: "Name", type: "avatar" },
      { key: "role", label: "Role", type: "chip" },
      { key: "department", label: "Department" },
      { key: "phone", label: "Phone", type: "mono" },
      { key: "status", label: "Status", type: "badge" },
      { name: "email", label: "Email", type: "email" },
      { name: "department", label: "Department", type: "ref", resource: "departments", labelKey: "name" },
      { name: "designation", label: "Designation", type: "ref", resource: "designations", labelKey: "name" },
      { name: "kycPhoto", label: "Photo", type: "file", placeholder: "kyc" },
      { name: "kycAadhaar", label: "Aadhaar", type: "file", placeholder: "kyc" },
      { name: "kycResume", label: "Resume / certificates", type: "file", placeholder: "kyc" },
      { name: "allowLogin", label: "Allow staff login (creates a staff account)", type: "toggle" },
    ],
    fields: [
      { name: "empId", label: "Employee ID", required: true },
      { name: "name", label: "Full name", required: true },
      { name: "role", label: "Role", type: "select", options: S("Class Teacher","Subject Teacher","Coordinator","Accountant","Counsellor","Admin") },
      { name: "department", label: "Department" },
      { name: "phone", label: "Phone", type: "phone" },
      { name: "status", label: "Status", type: "select", options: S("Active","On Leave","Inactive") },
    ],
    seed: staff,
  },
  classes: {
    title: "Classes & Sections", singular: "Class", icon: "LayoutGrid",
    columns: [
      { key: "name", label: "Class", type: "chip" },
      { key: "sections", label: "Sections" },
      { key: "teacher", label: "Class Teacher" },
      { key: "strength", label: "Strength", type: "count" },
      { key: "model", label: "Model", type: "badge" },
    ],
    fields: [
      { name: "name", label: "Class name", required: true },
      { name: "sections", label: "Sections (comma-sep)" },
      { name: "teacher", label: "Class teacher" },
      { name: "strength", label: "Strength", type: "number" },
      { name: "model", label: "Academic model", type: "select", options: S("Early Years","K-12") },
    ],
    seed: classes,
  },
  subjects: {
    title: "Subjects", singular: "Subject", icon: "BookOpen",
    columns: [
      { key: "name", label: "Subject" },
      { key: "code", label: "Code", type: "mono" },
      { key: "classes", label: "Classes" },
      { key: "teacher", label: "Teacher" },
    ],
    fields: [
      { name: "name", label: "Subject name", required: true },
      { name: "code", label: "Code" },
      { name: "classes", label: "Classes (multi-select)", type: "refMulti", resource: "classes", labelKey: "name" },
      { name: "teacher", label: "Teacher", type: "ref", resource: "staff", labelKey: "name" },
    ],
    seed: subjects,
  },
  exams: {
    title: "Exams & Assessments", singular: "Exam", icon: "ClipboardList",
    columns: [
      { key: "name", label: "Name" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "type", label: "Type", type: "chip" },
      { key: "startDate", label: "Starts", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "klass", label: "Class", type: "ref", resource: "classes", labelKey: "name" },
      { name: "type", label: "Type", type: "select", options: S("Written","Oral","Observation","Project") },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "status", label: "Status", type: "select", options: S("Draft","Scheduled","Ongoing","Completed") },
    ],
    seed: exams,
  },
  homework: {
    title: "Homework", singular: "Homework", icon: "PencilLine",
    columns: [
      { key: "title", label: "Title" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "section", label: "Sec" },
      { key: "subject", label: "Subject", type: "chip" },
      { key: "dueDate", label: "Due", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "klass", label: "Class", type: "ref", resource: "classes", labelKey: "name", required: true },
      { name: "section", label: "Section", type: "select", options: S("All sections","A","B","C","D") },
      { name: "subject", label: "Subject", type: "ref", resource: "subjects", labelKey: "name" },
      { name: "dueDate", label: "Due date", type: "date" },
      { name: "description", label: "Details / instructions", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: S("Assigned","Reviewed","Closed") },
    ],
    seed: homework,
  },
  lessons: {
    title: "Lessons (LMS)", singular: "Lesson", icon: "MonitorPlay",
    columns: [
      { key: "title", label: "Title" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "subject", label: "Subject" },
      { key: "type", label: "Type", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "klass", label: "Class", type: "ref", resource: "classes", labelKey: "name" },
      { name: "subject", label: "Subject", type: "ref", resource: "subjects", labelKey: "name" },
      { name: "type", label: "Type", type: "select", options: S("Video","AR","PDF","Interactive") },
      { name: "status", label: "Status", type: "select", options: S("Draft","Published") },
    ],
    seed: lessons,
  },
  reportCards: {
    title: "Report Cards", singular: "Report Card", icon: "FileText",
    columns: [
      { key: "student", label: "Student", type: "avatar" },
      { key: "klass", label: "Class", type: "chip" },
      { key: "term", label: "Term" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "student", label: "Student", required: true },
      { name: "klass", label: "Class" },
      { name: "term", label: "Term" },
      { name: "status", label: "Status", type: "select", options: S("Draft","Published") },
    ],
    seed: reportCards,
  },
  milestones: {
    title: "Skills & Milestones", singular: "Milestone", icon: "Sparkles",
    columns: [
      { key: "child", label: "Child", type: "avatar" },
      { key: "domain", label: "Domain", type: "chip" },
      { key: "skill", label: "Skill" },
      { key: "level", label: "Level", type: "badge" },
      { key: "updated", label: "Updated", type: "date" },
    ],
    fields: [
      { name: "child", label: "Child", required: true },
      { name: "domain", label: "Domain", type: "select", options: S("Cognitive","Language","Fine Motor","Gross Motor","Social","Emotional","Creativity") },
      { name: "skill", label: "Skill" },
      { name: "level", label: "Level", type: "select", options: S("Not started","Needs support","Emerging","Achieved") },
      { name: "updated", label: "Observed on", type: "date" },
    ],
    seed: milestones,
  },
  portfolio: {
    title: "Portfolio", singular: "Portfolio Item", icon: "Image",
    columns: [
      { key: "child", label: "Child", type: "avatar" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type", type: "chip" },
      { key: "date", label: "Date", type: "date" },
    ],
    fields: [
      { name: "child", label: "Child", required: true },
      { name: "title", label: "Title" },
      { name: "type", label: "Type", type: "select", options: S("Photo","Video","Note") },
      { name: "date", label: "Date", type: "date" },
    ],
    seed: portfolio,
  },
  feeStructure: {
    title: "Fee Structure", singular: "Fee Head", icon: "ReceiptText",
    columns: [
      { key: "name", label: "Fee head" },
      { key: "klass", label: "Applies to", type: "chip" },
      { key: "term", label: "Term", type: "chip" },
      { key: "amount", label: "Amount", type: "money" },
    ],
    fields: [
      { name: "name", label: "Fee head", required: true },
      { name: "klass", label: "Applies to" },
      { name: "term", label: "Term", type: "select", options: S("Term 1","Term 2","Term 3","Annual") },
      { name: "amount", label: "Amount", type: "money" },
    ],
    seed: feeStructure,
  },
  invoices: {
    title: "Invoices", singular: "Invoice", icon: "FileSpreadsheet",
    searchKeys: ["invoiceNo", "student"],
    columns: [
      { key: "invoiceNo", label: "Invoice", type: "mono" },
      { key: "student", label: "Student", type: "avatar" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "dueDate", label: "Due", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "invoiceNo", label: "Invoice No", required: true },
      { name: "student", label: "Student" },
      { name: "amount", label: "Amount", type: "money" },
      { name: "dueDate", label: "Due date", type: "date" },
      { name: "status", label: "Status", type: "select", options: S("Paid","Due","Partial","Overdue") },
    ],
    seed: invoices,
  },
  discounts: {
    title: "Discounts", singular: "Discount", icon: "BadgePercent",
    columns: [
      { key: "name", label: "Name" },
      { key: "type", label: "Type", type: "chip" },
      { key: "value", label: "Value", type: "mono" },
      { key: "klass", label: "Applies to", type: "chip" },
    ],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "type", label: "Type", type: "select", options: S("Percent","Flat") },
      { name: "value", label: "Value" },
      { name: "klass", label: "Applies to" },
    ],
    seed: discounts,
  },
  incomeExpense: {
    title: "Income & Expense", singular: "Entry", icon: "ArrowLeftRight",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "head", label: "Head" },
      { key: "type", label: "Type", type: "badge" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "mode", label: "Mode", type: "chip" },
    ],
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "head", label: "Head", required: true },
      { name: "type", label: "Type", type: "select", options: S("Income","Expense") },
      { name: "amount", label: "Amount", type: "money" },
      { name: "mode", label: "Mode", type: "select", options: S("UPI","Card","NEFT","Cash") },
    ],
    seed: incomeExpense,
  },
  vehicles: {
    title: "Vehicles", singular: "Vehicle", icon: "Bus",
    columns: [
      { key: "number", label: "Number", type: "mono" },
      { key: "type", label: "Type", type: "chip" },
      { key: "capacity", label: "Seats", type: "count" },
      { key: "driver", label: "Driver" },
      { key: "route", label: "Route", type: "chip" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "number", label: "Vehicle number", required: true },
      { name: "type", label: "Type" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "driver", label: "Driver", type: "ref", resource: "staff", labelKey: "name" },
      { name: "route", label: "Route", type: "ref", resource: "routes", labelKey: "name" },
      { name: "status", label: "Status", type: "select", options: S("On Route","Idle","Maintenance") },
    ],
    seed: vehicles,
  },
  drivers: {
    title: "Drivers", singular: "Driver", icon: "IdCard",
    columns: [
      { key: "name", label: "Name", type: "avatar" },
      { key: "phone", label: "Phone", type: "mono" },
      { key: "license", label: "License", type: "mono" },
      { key: "vehicle", label: "Vehicle", type: "chip" },
    ],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "phone", label: "Phone", type: "phone" },
      { name: "license", label: "License no" },
      { name: "vehicle", label: "Assigned vehicle" },
    ],
    seed: drivers,
  },
  routes: {
    title: "Routes", singular: "Route", icon: "Route",
    columns: [
      { key: "name", label: "Route" },
      { key: "stops", label: "Stops", type: "chip" },
      { key: "vehicle", label: "Vehicle", type: "mono" },
      { key: "students", label: "Students", type: "count" },
    ],
    fields: [
      { name: "name", label: "Route name", required: true },
      { name: "stops", label: "Stops" },
      { name: "vehicle", label: "Vehicle" },
      { name: "students", label: "Students", type: "number" },
    ],
    seed: routes,
  },
  inventoryItems: {
    title: "Inventory", singular: "Item", icon: "Package",
    columns: [
      { key: "name", label: "Item" },
      { key: "category", label: "Category", type: "chip" },
      { key: "stock", label: "In stock", type: "count" },
      { key: "unit", label: "Unit" },
      { key: "reorder", label: "Reorder at", type: "count" },
    ],
    fields: [
      { name: "name", label: "Item name", required: true },
      { name: "category", label: "Category", type: "select", options: S("Stationery","Books","Uniform","Toys","Furniture") },
      { name: "stock", label: "In stock", type: "number" },
      { name: "unit", label: "Unit" },
      { name: "reorder", label: "Reorder level", type: "number" },
    ],
    seed: inventoryItems,
  },
  purchaseOrders: {
    title: "Purchase Orders", singular: "PO", icon: "ShoppingCart",
    columns: [
      { key: "poNo", label: "PO No", type: "mono" },
      { key: "vendor", label: "Vendor" },
      { key: "items", label: "Items" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "poNo", label: "PO Number", required: true },
      { name: "vendor", label: "Vendor" },
      { name: "items", label: "Items" },
      { name: "amount", label: "Amount", type: "money" },
      { name: "status", label: "Status", type: "select", options: S("Pending","Delivered","Cancelled") },
    ],
    seed: purchaseOrders,
  },
  announcements: {
    title: "Announcements", singular: "Announcement", icon: "Megaphone",
    columns: [
      { key: "title", label: "Title" },
      { key: "audience", label: "Audience", type: "chip" },
      { key: "date", label: "Date", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "audience", label: "Audience", type: "select", options: S("Whole School","All Parents","Grade 1–5","Grade 1–5 Parents","Staff") },
      { name: "date", label: "Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: S("Draft","Scheduled","Published") },
    ],
    seed: announcements,
  },
  circulars: {
    title: "Circulars", singular: "Circular", icon: "Mail",
    columns: [
      { key: "title", label: "Title" },
      { key: "audience", label: "Audience", type: "chip" },
      { key: "date", label: "Date", type: "date" },
      { key: "attachment", label: "Attachment", type: "mono" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "audience", label: "Audience" },
      { name: "date", label: "Date", type: "date" },
      { name: "attachment", label: "Attachment name" },
    ],
    seed: circulars,
  },
};
