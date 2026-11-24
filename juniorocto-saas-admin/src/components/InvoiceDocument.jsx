import { ISSUER, BILLING_MODELS } from "@/config/billing";
import { inr, dateFmt } from "@/lib/format";
import octo from "@/assets/logo-mark.png";

// A print-ready A4 tax invoice. Rendered on screen and via window.print() (Download).
export default function InvoiceDocument({ invoice }) {
  if (!invoice) return null;
  const m = BILLING_MODELS[invoice.model] || {};
  const status = (invoice.status || "draft").toUpperCase();
  const statusColor = { PAID: "#3BB273", SENT: "#1651A3", OVERDUE: "#E0533F", DRAFT: "#94A3B8" }[status] || "#94A3B8";

  return (
    <div className="invoice-a4">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print { html, body { margin: 0 !important; padding: 0 !important; } }
        .invoice-a4 { width: 794px; min-height: 1120px; height: 1120px; margin: 0 auto; background: #fff; color: #14335E;
          font-family: "Manrope", system-ui, sans-serif; box-shadow: 0 20px 60px rgba(11,58,102,.18); position: relative; }
        .invoice-a4 * { box-sizing: border-box; }
        .inv-pad { padding: 48px 52px; }
        .inv-band { height: 8px; background: linear-gradient(90deg,#1651A3,#E85410); }
        .inv-h { font-family: "Fredoka", sans-serif; }
        .inv-muted { color: #64748B; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 22px; }
        table.items th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748B; padding: 10px 12px; border-bottom: 2px solid #14335E; }
        table.items td { padding: 14px 12px; border-bottom: 1px solid #E7EDF5; font-size: 14px; }
        .num { font-variant-numeric: tabular-nums; font-family: "JetBrains Mono", monospace; }
        @media print { .invoice-a4 { box-shadow: none; margin: 0; height: auto; min-height: 0; } }
      `}</style>
      <div className="inv-band" />
      <div className="inv-pad">
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F2F6FC", display: "grid", placeItems: "center" }}><img src={octo} alt="" style={{ width: 42 }} /></div>
            <div>
              <div className="inv-h" style={{ fontSize: 22, fontWeight: 600 }}><span style={{ color: "#1651A3" }}>Junior</span><span style={{ color: "#E85410" }}>Octo</span></div>
              <div className="inv-muted" style={{ fontSize: 12 }}>{ISSUER.name}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="inv-h" style={{ fontSize: 26, letterSpacing: ".02em", color: "#14335E" }}>TAX INVOICE</div>
            <div className="num" style={{ fontSize: 13, marginTop: 4, color: "#1651A3", fontWeight: 700 }}>{invoice.number}</div>
            <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, color: "#fff", background: statusColor, borderRadius: 999, padding: "3px 12px", letterSpacing: ".04em" }}>{status}</span>
          </div>
        </div>

        {/* meta row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 34 }}>
          <div style={{ flex: 1 }}>
            <div className="inv-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Bill To · {invoice.billToType === "reseller" ? "Reseller" : "Customer"}</div>
            <div className="inv-h" style={{ fontSize: 17, marginTop: 6 }}>{invoice.billTo?.name}</div>
            {invoice.billTo?.address && <div className="inv-muted" style={{ fontSize: 12, marginTop: 2 }}>{invoice.billTo.address}</div>}
            {invoice.billTo?.email && <div className="inv-muted" style={{ fontSize: 12 }}>{invoice.billTo.email}</div>}
            {invoice.billTo?.gstin && <div className="num inv-muted" style={{ fontSize: 12, marginTop: 2 }}>GSTIN: {invoice.billTo.gstin}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <Row k="Issue date" v={dateFmt(invoice.issueDate)} />
            <Row k="Due date" v={dateFmt(invoice.dueDate)} />
            <Row k="Billing model" v={m.label} />
            <Row k="Payment" v={invoice.paymentMethod || m.payment} />
          </div>
        </div>

        {/* items */}
        <table className="items">
          <thead><tr><th>Description</th><th style={{ textAlign: "right" }}>Users</th><th style={{ textAlign: "right" }}>Rate / mo</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
          <tbody>
            {(invoice.lineItems || []).map((li, i) => (
              <tr key={i}><td>{li.desc}</td><td className="num" style={{ textAlign: "right" }}>{li.qty}</td><td className="num" style={{ textAlign: "right" }}>{inr(li.rate)}</td><td className="num" style={{ textAlign: "right" }}>{inr(li.amount)}</td></tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <div style={{ width: 260 }}>
            <TotalRow k="Subtotal" v={inr(invoice.subtotal)} />
            <TotalRow k={`GST (${invoice.taxPct}%)`} v={inr(invoice.tax)} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 12, borderTop: "2px solid #14335E" }}>
              <span className="inv-h" style={{ fontSize: 16 }}>Total Due</span>
              <span className="inv-h num" style={{ fontSize: 20, color: "#E85410" }}>{inr(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* payment + notes */}
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          <div style={{ flex: 1, background: "#F2F6FC", borderRadius: 14, padding: 16 }}>
            <div className="inv-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700, marginBottom: 8 }}>Payment details</div>
            {invoice.model === "direct_web" ? (
              <div style={{ fontSize: 13 }}>Paid securely online via payment gateway. Licence activates automatically on confirmation.</div>
            ) : (
              <div className="num" style={{ fontSize: 13, lineHeight: 1.7 }}>{ISSUER.bank.holder}<br />A/C {ISSUER.bank.account} · {ISSUER.bank.bankName}<br />IFSC {ISSUER.bank.ifsc}</div>
            )}
          </div>
          <div style={{ flex: 1, fontSize: 12 }} className="inv-muted">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700, marginBottom: 8 }}>Notes</div>
            {invoice.notes || m.note}
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 52px", borderTop: "1px solid #E7EDF5", display: "flex", justifyContent: "space-between", fontSize: 11 }} className="inv-muted num">
        <span>CIN: {ISSUER.cin}</span><span>GSTIN: {ISSUER.gstin}</span><span>{ISSUER.email}</span>
      </div>
    </div>
  );
}
const Row = ({ k, v }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 3 }}><span className="inv-muted">{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>;
const TotalRow = ({ k, v }) => <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span className="inv-muted">{k}</span><span className="num">{v}</span></div>;
