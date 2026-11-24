import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Download, Check } from "lucide-react";
import { platformService } from "@/services/platform.service";
import InvoiceDocument from "@/components/InvoiceDocument";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/store/toast";

export default function InvoiceView() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [inv, setInv] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => platformService.invoice(id).then(setInv);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const send = async () => { setBusy(true); try { await platformService.sendInvoice(id); await load(); toast.success("Invoice sent to " + inv.billTo?.name); } catch (e) { toast.error(e.message); } finally { setBusy(false); } };
  const pay = async () => { setBusy(true); try { await platformService.payInvoice(id); await load(); toast.success("Marked paid — licence activation applied per model"); } catch (e) { toast.error(e.message); } finally { setBusy(false); } };
  const download = () => window.print();

  if (!inv) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4 no-print">
        <button onClick={() => nav("/invoices")} className="flex items-center gap-1.5 text-sm text-royal font-semibold hover:underline mr-auto"><ArrowLeft size={15} /> All invoices</button>
        <Button variant="outline" onClick={send} disabled={busy}><Send size={15} /> Send</Button>
        <Button variant="outline" onClick={download}><Download size={15} /> Download</Button>
        {inv.status !== "paid" && <Button onClick={pay} disabled={busy}><Check size={15} /> Mark paid</Button>}
      </div>
      <div className="pb-10 print-area"><InvoiceDocument invoice={inv} /></div>
      <style>{`@media print { .no-print, aside, header { display: none !important; } .print-area { padding: 0 !important; } body { background: #fff; } }`}</style>
    </div>
  );
}
