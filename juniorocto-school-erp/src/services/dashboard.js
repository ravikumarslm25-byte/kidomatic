import { USE_MOCK } from "@/config/app";
import { api } from "./api";

const demo = { totalStudents: 1240, activeStudents: 1180, feesCollectedMTD: 986000, outstanding: 342000, newEnquiries: 12, admitted: 1, enquiryFunnel: {} };

export async function getSummary() {
  if (USE_MOCK) return demo;
  try { const { data } = await api.get("/dashboard/summary"); return data?.data ?? data; }
  catch { return demo; }
}
