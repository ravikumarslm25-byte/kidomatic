import { useState, useEffect, useMemo } from "react";
import { BarChart3, Users, GraduationCap, IndianRupee, Download, Printer, Filter, FileSpreadsheet, LayoutDashboard, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import Spinner from "@/components/ui/Spinner";
import { CollectionArea, AdmissionsBar, AttendanceDonut } from "@/components/charts/Charts";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { inr } from "@/lib/format";

const rev = [{ m: "Feb", v: 720000 }, { m: "Mar", v: 810000 }, { m: "Apr", v: 640000 }, { m: "May", v: 905000 }, { m: "Jun", v: 1120000 }, { m: "Jul", v: 986000 }];
const adm = [{ m: "Feb", v: 18 }, { m: "Mar", v: 24 }, { m: "Apr", v: 31 }, { m: "May", v: 27 }, { m: "Jun", v: 42 }, { m: "Jul", v: 12 }];

const money = (v) => inr(+v || 0);
const dt = (v) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

// Report catalogue — each pulls a live resource, with its own columns & filters.
const REPORTS = [
  { key: "students", title: "Student Register", group: "Students", resource: "students", dateField: "admissionDate",
    columns: [["name", "Name"], ["klass", "Class"], ["section", "Section"], ["gender", "Gender"], ["rollNo", "Roll"], ["status", "Status"]],
    filters: [["klass", "Class"], ["status", "Status"]] },
  { key: "enquiries", title: "Admission Enquiries", group: "Admissions", resource: "enquiries", dateField: "createdAt",
    columns: [["name", "Name"], ["klass", "Class"], ["source", "Source"], ["phone", "Phone"], ["status", "Status"]],
    filters: [["source", "Source"], ["status", "Status"]] },
  { key: "collection", title: "Fee Collection", group: "Fees", resource: "invoices", dateField: "dueDate", money: "amount",
    columns: [["student", "Student"], ["invoiceNo", "Invoice"], ["klass", "Class"], ["amount", "Amount", money], ["status", "Status"], ["dueDate", "Due", dt]],
    filters: [["status", "Status"], ["klass", "Class"]] },
  { key: "outstanding", title: "Outstanding Fees", group: "Fees", resource: "invoices", dateField: "dueDate", money: "amount", preFilter: (r) => r.status !== "Paid",
    columns: [["student", "Student"], ["invoiceNo", "Invoice"], ["amount", "Amount", money], ["dueDate", "Due", dt], ["status", "Status"]],
    filters: [["klass", "Class"]] },
  { key: "payments", title: "Payments Received", group: "Fees", resource: "payments", dateField: "date", money: "amount",
    columns: [["student", "Student"], ["amount", "Amount", money], ["mode", "Mode"], ["ref", "Reference"], ["date", "Date", dt]],
    filters: [["mode", "Mode"]] },
  { key: "ledger", title: "Accounts Ledger", group: "Accounts", resource: "transactions", dateField: "date", money: "amount",
    columns: [["date", "Date", dt], ["type", "Type"], ["head", "Head"], ["amount", "Amount", money], ["mode", "Mode"], ["note", "Note"]],
    filters: [["type", "Type"], ["head", "Head"]] },
  { key: "vendorBills", title: "Vendor Bills", group: "Accounts", resource: "vendorBills", dateField: "billDate", money: "amount",
    columns: [["vendorName", "Vendor"], ["billNo", "Bill No"], ["amount", "Amount", money], ["billDate", "Date", dt], ["status", "Status"]],
    filters: [["status", "Status"]] },
  { key: "inventory", title: "Inventory Items", group: "Inventory", resource: "invItems",
    columns: [["name", "Item"], ["categoryName", "Category"], ["availableCount", "Stock"], ["unit", "Unit"], ["reorderLevel", "Reorder"]],
    filters: [["categoryName", "Category"]] },
  { key: "staff", title: "Staff Directory", group: "Staff", resource: "appUsers",
    columns: [["name", "Name"], ["email", "Email"], ["roleName", "Role"], ["phone", "Phone"], ["status", "Status"]],
    filters: [["roleName", "Role"], ["status", "Status"]] },
  { key: "transport", title: "Vehicles & Compliance", group: "Transport", resource: "vehicles",
    columns: [["regNumber", "Reg. No"], ["make", "Make"], ["capacity", "Capacity"], ["driverName", "Driver"], ["routeName", "Route"]],
    filters: [] },
  { key: "comms", title: "Communications Log", group: "Communication", resource: "communications", dateField: "publishAt",
    columns: [["title", "Title"], ["type", "Type"], ["category", "Category"], ["audienceType", "Audience"], ["status", "Status"]],
    filters: [["type", "Type"], ["status", "Status"]] },
];

export default function Analytics() {
  const [tab, setTab] = useState("overview");
  return (
    <div>
      <PageHeader title="Reports & Analytics" icon={BarChart3} subtitle="Live insights and exportable reports across every module" />
      <div className="flex gap-1 mb-5">
        {[["overview", "Overview", LayoutDashboard], ["reports", "Reports", FileSpreadsheet]].map(([k, l, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {l}</button>)}
      </div>
      {tab === "overview" ? <Overview /> : <ReportsPane />}
    </div>
  );
}

function Overview() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Enrolment" value={1240} icon={GraduationCap} tone="royal" trend={3} />
        <StatCard label="Retention" value="94%" format="raw" icon={Users} tone="sea" trend={1} />
        <StatCard label="Avg. Attendance" value="88%" format="raw" icon={Users} tone="coral" trend={-2} />
        <StatCard label="Revenue MTD" value="₹9.86L" format="raw" icon={IndianRupee} tone="navy" trend={8} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><h3 className="font-display text-navy text-lg mb-2">Revenue</h3><CollectionArea data={rev} /></Card>
        <Card><h3 className="font-display text-navy text-lg mb-2">Attendance</h3><AttendanceDonut present={88} /></Card>
        <Card className="lg:col-span-3"><h3 className="font-display text-navy text-lg mb-2">Admissions per month</h3><AdmissionsBar data={adm} /></Card>
      </div>
    </>
  );
}

function ReportsPane() {
  const [active, setActive] = useState(REPORTS[0]);
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); const [sel, setSel] = useState({}); const [from, setFrom] = useState(""); const [to, setTo] = useState("");

  useEffect(() => {
    setLoading(true); setSel({}); setQ(""); setFrom(""); setTo("");
    resourceService(active.resource).list({}).then((r) => { let d = normList(r); if (active.preFilter) d = d.filter(active.preFilter); setRows(d); }).catch(() => setRows([])).finally(() => setLoading(false));
  }, [active]);

  const optionsFor = (k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))].sort();
  const cell = (r, col) => { const [k, , fmt] = col; return fmt ? fmt(r[k]) : (r[k] ?? "—"); };

  const filtered = useMemo(() => rows.filter((r) => {
    if (q && !active.columns.some((c) => String(r[c[0]] ?? "").toLowerCase().includes(q.toLowerCase()))) return false;
    for (const [k] of active.filters) if (sel[k] && r[k] !== sel[k]) return false;
    if (active.dateField && (from || to)) { const d = r[active.dateField] ? new Date(r[active.dateField]) : null; if (!d) return false; if (from && d < new Date(from)) return false; if (to && d > new Date(to + "T23:59:59")) return false; }
    return true;
  }), [rows, q, sel, from, to, active]);

  const total = active.money ? filtered.reduce((a, r) => a + (+r[active.money] || 0), 0) : null;

  const exportCSV = () => {
    const head = active.columns.map((c) => c[1]).join(",");
    const body = filtered.map((r) => active.columns.map((c) => `"${String(cell(r, c)).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${active.key}-report.csv`; a.click();
  };
  const printReport = () => {
    const w = window.open("", "_blank");
    const style = "body{font-family:system-ui;padding:24px;color:#14335E}h2{margin:0 0 4px}p{color:#64748b;margin:0 0 16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0}th{background:#f1f5f9;text-transform:uppercase;font-size:11px;color:#64748b}";
    const rowsHtml = filtered.map((r) => `<tr>${active.columns.map((c) => `<td>${cell(r, c)}</td>`).join("")}</tr>`).join("");
    w.document.write(`<style>${style}</style><h2>${active.title}</h2><p>${filtered.length} records${total != null ? ` · Total ${money(total)}` : ""} · generated ${dt(new Date())}</p><table><thead><tr>${active.columns.map((c) => `<th>${c[1]}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1">
        <Card pad={false}>
          <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase text-navy/45">Reports</p>
          <div className="pb-2">
            {REPORTS.map((r) => (
              <button key={r.key} onClick={() => setActive(r)} className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${active.key === r.key ? "bg-royal-100 text-royal font-semibold" : "text-navy/70 hover:bg-white/60"}`}>
                <span>{r.title}</span><span className="text-[10px] text-navy/35">{r.group}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-3">
        <Card>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]"><span className="lbl">Search</span><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="in pl-9" /></div></div>
            {active.filters.map(([k, label]) => (
              <div key={k} className="min-w-[130px]"><span className="lbl">{label}</span><select value={sel[k] || ""} onChange={(e) => setSel((s) => ({ ...s, [k]: e.target.value }))} className="in"><option value="">All</option>{optionsFor(k).map((o) => <option key={o}>{o}</option>)}</select></div>
            ))}
            {active.dateField && <>
              <div><span className="lbl">From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="in" /></div>
              <div><span className="lbl">To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="in" /></div>
            </>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}><Download size={15} /> CSV</Button>
              <Button variant="outline" onClick={printReport}><Printer size={15} /> Print</Button>
            </div>
          </div>
        </Card>

        <Card pad={false}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-navy/6">
            <h3 className="font-display text-navy">{active.title}</h3>
            <div className="flex items-center gap-2 text-sm text-navy/50"><Badge color="gray">{filtered.length} records</Badge>{total != null && <span className="font-mono font-semibold text-navy">{money(total)}</span>}</div>
          </div>
          {loading ? <div className="grid place-items-center py-20"><Spinner size={24} /></div> : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white"><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45">{active.columns.map((c) => <th key={c[0]} className="px-4 py-2.5 whitespace-nowrap">{c[1]}</th>)}</tr></thead>
                <tbody>
                  {filtered.map((r, i) => <tr key={r.id || i} className="border-b border-navy/5 hover:bg-white/40">{active.columns.map((c) => <td key={c[0]} className="px-4 py-2.5 text-navy/80 whitespace-nowrap">{cell(r, c)}</td>)}</tr>)}
                  {filtered.length === 0 && <tr><td colSpan={active.columns.length} className="px-4 py-12 text-center text-navy/40">No records match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <style>{`.lbl{display:block;font-size:11px;font-weight:600;color:rgba(20,51,94,.55);margin-bottom:4px}.in{height:38px;width:100%;border-radius:10px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
