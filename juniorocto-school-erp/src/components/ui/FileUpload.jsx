import { useState } from "react";
import { Upload, FileCheck, X, Loader2, Eye } from "lucide-react";
import { uploadFile, signGet } from "@/services/upload";

// value: { key, name, publicUrl } | "" ; onChange(name, value) via Field wrapper
export default function FileUpload({ value, onChange, folder = "kyc" }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const has = value && (value.key || value.name);

  const onFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setErr(""); setPct(0);
    try { onChange(await uploadFile(f, folder, setPct)); }
    catch (ex) { setErr(ex?.response?.data?.message || ex.message || "Upload failed"); }
    finally { setBusy(false); }
  };
  const view = async () => {
    try { const url = value.publicUrl || (await signGet(value.key)); window.open(url, "_blank"); }
    catch (ex) { setErr(ex.message); }
  };

  if (has) return (
    <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/70 border border-navy/12 text-sm">
      <FileCheck size={15} className="text-emerald-600 shrink-0" />
      <span className="truncate flex-1 text-navy/80">{value.name || "Uploaded file"}</span>
      <button type="button" onClick={view} className="text-royal hover:text-royal/80" title="View"><Eye size={15} /></button>
      <button type="button" onClick={() => onChange("")} className="text-coral-500 hover:text-coral-600" title="Remove"><X size={14} /></button>
    </div>
  );
  return (
    <div>
      <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/70 border border-dashed border-navy/20 text-sm text-navy/50 cursor-pointer hover:border-royal/40">
        {busy ? <><Loader2 size={15} className="animate-spin" /> Uploading… {pct}%</> : <><Upload size={15} /> Choose file</>}
        <input type="file" className="hidden" onChange={onFile} disabled={busy} />
      </label>
      {err && <p className="text-coral-500 text-xs mt-1">{err}</p>}
    </div>
  );
}
