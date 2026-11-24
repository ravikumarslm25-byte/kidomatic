import { LayoutDashboard, Clock, CalendarCheck, PencilLine, MonitorPlay, BookOpen, ReceiptText, Megaphone, CalendarDays, Sparkles, Bus, User, LifeBuoy } from "lucide-react";

export const PORTAL_NAV = [
  { label: "Dashboard", to: "/portal", icon: LayoutDashboard, end: true },
  { label: "Timetable", to: "/portal/timetable", icon: Clock },
  { label: "Attendance", to: "/portal/attendance", icon: CalendarCheck },
  { label: "Homework", to: "/portal/homework", icon: PencilLine },
  { label: "Syllabus & LMS", to: "/portal/materials", icon: MonitorPlay },
  { label: "Report Cards", to: "/portal/results", icon: BookOpen },
  { label: "Fees", to: "/portal/fees", icon: ReceiptText },
  { label: "Circulars", to: "/portal/circulars", icon: Megaphone },
  { label: "Calendar", to: "/portal/calendar", icon: CalendarDays },
  { label: "Timeline", to: "/portal/timeline", icon: Sparkles },
  { label: "Transport", to: "/portal/transport", icon: Bus },
  { label: "Student Info", to: "/portal/info", icon: User },
  { label: "Support", to: "/portal/support", icon: LifeBuoy },
];
