// ── Parent-App BFF ─────────────────────────────────────────────────────────
// Returns app-shaped DTOs for the KidoMatic parent mobile app, aggregating
// the ERP's tenant-scoped resources server-side so the app stays thin.
// Every response is { data: <dto> } to match the rest of the API.
import { modelFor } from "../resource.model.js";
import { assertOwnsStudent } from "../portal-access.js";
import { applyPayment, receiptNo } from "../fees/fees.logic.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { createOrder } from "../payments/payments.controller.js";
import { verifyCheckoutSignature, toPaise } from "../payments/razorpay.logic.js";
import { PAYMENTS, paymentsMode } from "../../config/payments.js";

const BRAND = ["#1B54A6", "#D35811", "#134081"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Resolve + authorize the active child, and load its class/section.
async function getChild(req) {
  const studentId = req.query.studentId || req.body.studentId;
  if (!studentId) throw new AppError("studentId is required", 400);
  const link = await assertOwnsStudent(req, studentId);
  if (!link) throw new AppError("Not your child", 403);
  const st = await modelFor("students").findById(studentId).lean().catch(() => null);
  return {
    id: String(studentId),
    name: (st && st.name) || link.studentName || "",
    klass: (st && st.klass) || link.klass || "",
    section: (st && st.section) || link.section || "",
    admissionNo: (st && st.admissionNo) || "",
    roll: (st && (st.roll || st.rollNo)) || "",
  };
}

const norm = (v) => String(v ?? "").trim().toLowerCase();
// ERP attendance codes: P Present · A Absent · L Leave · H Half-day · Lt Late ·
// ML Medical · DC Discontinue. For the parent summary: P/H/Lt count present,
// A absent, L/ML leave, DC + unmarked are skipped.
function dayStatus(rec) {
  const t = norm(rec.morning) || norm(rec.afternoon);
  if (["p", "h", "lt", "present"].includes(t)) return "present";
  if (["a", "absent"].includes(t)) return "absent";
  if (["l", "ml", "leave"].includes(t)) return "leave";
  return "skip"; // dc / holiday / unmarked
}

// Weekly timing (mirrors juniorocto-school-erp PortalTimetable DEFAULT_SLOTS).
const DEFAULT_SLOTS = [
  { label: "Period 1", type: "period", start: "09:00", end: "09:45" },
  { label: "Period 2", type: "period", start: "09:45", end: "10:30" },
  { label: "Break", type: "break", start: "10:30", end: "10:45" },
  { label: "Period 3", type: "period", start: "10:45", end: "11:30" },
  { label: "Period 4", type: "period", start: "11:30", end: "12:15" },
  { label: "Lunch", type: "lunch", start: "12:15", end: "13:00" },
  { label: "Period 5", type: "period", start: "13:00", end: "13:45" },
  { label: "Period 6", type: "period", start: "13:45", end: "14:30" },
];
function to12h(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (isNaN(h)) return { time: hhmm || "", ampm: "" };
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return { time: `${h12}:${String(m || 0).padStart(2, "0")}`, ampm };
}
function relTime(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}

// GET /children -> [{ id,name,grade,roll,admissionNo }]
export const children = asyncHandler(async (req, res) => {
  const S = modelFor("students");
  const GL = modelFor("guardianLinks");
  let links = [];
  if (req.user.audience === "student") {
    const me = req.user.studentId ? await S.findById(req.user.studentId).lean().catch(() => null) : null;
    if (me) links = [{ studentId: String(me._id), studentName: me.name, klass: me.klass, section: me.section }];
  } else {
    links = await GL.find({ parentUserId: req.user.id }).lean();
  }
  const out = [];
  for (const l of links) {
    const st = await S.findById(l.studentId).lean().catch(() => null);
    const klass = (st && st.klass) || l.klass || "";
    const section = (st && st.section) || l.section || "";
    out.push({
      id: String(l.studentId),
      name: (st && st.name) || l.studentName || "",
      grade: section ? `${klass}-${section}` : klass,
      roll: (st && (st.roll || st.rollNo)) || "",
      admissionNo: (st && st.admissionNo) || "",
    });
  }
  res.json({ data: out });
});

// GET /attendance -> { present,absent,leave,totalDays,month }  (current month)
export const attendance = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const now = new Date();
  const rows = await modelFor("attendance").find({ studentId: child.id }).lean();
  let present = 0, absent = 0, leave = 0, totalDays = 0;
  for (const r of rows) {
    const dt = new Date(r.date);
    if (isNaN(dt) || dt.getMonth() !== now.getMonth() || dt.getFullYear() !== now.getFullYear()) continue;
    const s = dayStatus(r);
    if (s === "skip") continue;
    totalDays++;
    if (s === "present") present++;
    else if (s === "absent") absent++;
    else if (s === "leave") leave++;
  }
  res.json({ data: { present, absent, leave, totalDays, month: MONTHS[now.getMonth()] } });
});

// GET /timetable -> [{ time,ampm,subject,detail,isTest,isBreak }]  (today)
// Mirrors the ERP: grid is keyed "{dayIdx}-{slotIdx}" -> { subject, teacher }
// over Mon-Fri; period times come from a timingProfile (or DEFAULT_SLOTS).
export const timetable = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const di = new Date().getDay() - 1; // Mon=0 .. Fri=4
  if (di < 0 || di > 4) return res.json({ data: [] }); // weekend
  const TT = modelFor("timetable");
  const doc = (await TT.findOne({ klass: child.klass, section: child.section }).lean())
    || (await TT.findOne({ klass: child.klass }).lean());
  if (!doc || !doc.grid) return res.json({ data: [] });
  // period times from a matching timing profile, else the default day
  let slots = DEFAULT_SLOTS;
  try {
    const profs = await modelFor("timingProfiles").find({}).lean();
    const p = (profs || []).find((x) => Array.isArray(x.classes) && x.classes.includes(child.klass));
    if (p && Array.isArray(p.slots) && p.slots.length) slots = p.slots;
  } catch { /* default slots */ }
  const grid = doc.grid || {};
  const out = [];
  slots.forEach((slot, si) => {
    const t = to12h(slot.start);
    if (slot.type === "period") {
      const c = grid[`${di}-${si}`];
      if (c && c.subject) out.push({ time: t.time, ampm: t.ampm, subject: c.subject, detail: c.teacher || "", isTest: false, isBreak: false });
    } else {
      out.push({ time: t.time, ampm: t.ampm, subject: slot.label, detail: `${slot.start}–${slot.end}`, isTest: false, isBreak: true });
    }
  });
  res.json({ data: out });
});

// GET /materials -> [{ title,detail,duration,isPdf }]  (child's class)
export const materials = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const rows = await modelFor("lmsLessons")
    .find({ klass: child.klass }).sort({ order: 1 }).lean();
  const out = rows
    .filter((r) => !r.status || /publish|active|live/i.test(r.status))
    .map((r) => {
      const isPdf = /pdf|note|doc/i.test(r.type || "") || (!r.videoUrl && !!r.attachment);
      const dur = isPdf ? "PDF" : (r.duration ? `${r.duration} min` : "");
      return { title: r.title || "", detail: r.subject || r.content || "", duration: dur, isPdf };
    });
  res.json({ data: out });
});

// GET /fees -> { outstanding,paid,total,term,dueDate }  (summed invoices)
export const fees = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const inv = await modelFor("invoices").find({ studentId: child.id }).lean();
  let outstanding = 0, paid = 0, total = 0;
  let dueDate = null, term = "";
  for (const i of inv) {
    total += Number(i.total) || 0;
    paid += Number(i.paid) || 0;
    outstanding += Number(i.balance) || 0;
    if ((Number(i.balance) || 0) > 0 && i.dueDate) {
      if (!dueDate || new Date(i.dueDate) < new Date(dueDate)) dueDate = i.dueDate;
    }
    if (i.term || i.academicYear) term = i.term || i.academicYear;
  }
  res.json({ data: { outstanding, paid, total, term: term || "Current term", dueDate } });
});

// GET /receipts -> [{ id,method,date,amount }]
export const receipts = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const rows = await modelFor("payments").find({ studentId: child.id }).sort({ date: -1 }).lean();
  res.json({ data: rows.map((r) => ({ id: r.receiptNo, method: r.mode, date: r.date, amount: r.amount })) });
});

// GET /report -> ReportCard DTO (best-effort; marks composition is a real
// feature — see note). Pulls school identity from appSettings + the term from
// reportCards. Subjects come from examMarks when parseable, else empty.
export const report = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const settings = (await modelFor("appSettings").findOne({}).lean()) || {};
  const rc = (await modelFor("reportCards").findOne({ studentId: child.id }).lean())
    || (await modelFor("reportCards").findOne({ student: child.name }).lean())
    || {};
  const grade = child.section ? `${child.klass}-${child.section}` : child.klass;
  res.json({
    data: {
      school: settings.schoolName || "",
      location: [settings.city, settings.state].filter(Boolean).join(", "),
      board: settings.board || "",
      term: rc.term || "",
      subjects: [], // TODO: compose from examMarks + grading (separate feature)
      total: "", percentage: "", grade: "", rank: "",
      remark: rc.remark || "",
      _grade: grade,
    },
  });
});

// GET /timeline -> [feed posts]
export const timeline = asyncHandler(async (req, res) => {
  await getChild(req); // authorize (posts are school-open, but keep it parent-scoped)
  const posts = await modelFor("posts").find({}).sort({ createdAt: -1 }).lean();
  const Likes = modelFor("postLikes");
  const Comments = modelFor("postComments");
  const Votes = modelFor("pollVotes");
  const out = [];
  for (const p of posts) {
    if (p.status && !/publish|active|live/i.test(p.status)) continue;
    const [likes, comments] = await Promise.all([
      Likes.countDocuments({ postId: String(p._id) }),
      Comments.countDocuments({ postId: String(p._id) }),
    ]);
    const media = Array.isArray(p.media) ? p.media : [];
    let poll = null;
    if (Array.isArray(p.pollOptions) && p.pollOptions.length) {
      const votes = await Votes.find({ postId: String(p._id) }).lean();
      const totalV = votes.length || 0;
      let max = -1;
      // options are plain text (made in the ERP; votes use the position) or { id, label }
      const opts = p.pollOptions.map((o, idx) => {
        const isObj = o && typeof o === "object";
        const id = isObj && o.id != null ? o.id : String(idx);
        const c = votes.filter((v) => String(v.optionId) === String(id)).length;
        const pct = totalV ? Math.round((c / totalV) * 100) : 0;
        if (pct > max) max = pct;
        return { label: isObj ? o.label || o.text || "" : String(o ?? ""), pct, _c: c };
      });
      opts.forEach((o) => { o.leading = o.pct === max && max > 0; delete o._c; });
      poll = { question: p.text || "", options: opts };
    }
    out.push({
      author: p.authorName || "",
      role: [p.authorRole, relTime(p.createdAt)].filter(Boolean).join(" · "),
      time: relTime(p.createdAt),
      body: poll ? "" : (p.text || ""),
      pinned: !!p.pinned,
      likes, comments,
      hasMedia: media.length > 0,
      mediaColors: media.length ? BRAND.slice(0, Math.min(3, media.length)) : [],
      extraMedia: Math.max(0, media.length - 3),
      poll,
    });
  }
  res.json({ data: out });
});

// POST /pay { studentId, amount } -> applies to the oldest unpaid invoice.
export const pay = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const amount = Number(req.body.amount || 0);
  if (amount <= 0) throw new AppError("Enter a valid amount", 400);
  const Invoice = modelFor("invoices");
  const inv = await Invoice.findOne({ studentId: child.id, balance: { $gt: 0 } }).sort({ dueDate: 1 });
  if (!inv) throw new AppError("No pending dues", 400);
  const next = applyPayment({ total: inv.total, paid: inv.paid || 0 }, amount);
  inv.paid = next.paid; inv.balance = next.balance; inv.status = next.status;
  await inv.save();
  const Payment = modelFor("payments");
  const seq = (await Payment.countDocuments()) + 1;
  const receipt = await Payment.create({
    receiptNo: receiptNo(seq), invoiceNo: inv.invoiceNo, invoiceId: String(inv._id),
    studentId: inv.studentId, studentName: inv.studentName,
    amount, mode: req.body.mode || "Online", reference: "APP", note: "Paid via parent app",
    date: new Date().toISOString(), receivedBy: req.user.name || "Parent",
  });
  res.status(201).json({ data: { ok: true, receipt: { id: receipt.receiptNo, method: receipt.mode, date: receipt.date, amount: receipt.amount } } });
});

// POST /pay/order { studentId, amount? } -> creates a Razorpay order for the
// oldest unpaid invoice. Mock mode (no keys) returns a simulated order.
export const payOrder = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const Invoice = modelFor("invoices");
  const inv = await Invoice.findOne({ studentId: child.id, balance: { $gt: 0 } }).sort({ dueDate: 1 });
  if (!inv) throw new AppError("No pending dues", 400);
  const want = Number(req.body.amount || inv.balance);
  const amount = Math.max(1, Math.min(want, Number(inv.balance) || want));
  const order = await createOrder({
    amountPaise: toPaise(amount), receipt: inv.invoiceNo,
    notes: { invoiceId: String(inv._id), studentId: child.id },
  });
  res.status(201).json({ data: {
    orderId: order.id, amountPaise: order.amount, currency: order.currency || PAYMENTS.currency,
    keyId: PAYMENTS.keyId || "mock", mode: paymentsMode(), invoiceId: String(inv._id),
    amount, name: child.name, description: `Fees · ${inv.invoiceNo}`,
    prefillEmail: req.user.email || "", prefillContact: "",
  } });
});

// POST /pay/verify { invoiceId, orderId, paymentId, signature, amount }
// Verifies the checkout signature (or accepts "mock_ok" in mock mode), then
// applies the payment to the invoice and writes a receipt.
export const payVerify = asyncHandler(async (req, res) => {
  const child = await getChild(req);
  const { invoiceId, orderId, paymentId, signature } = req.body || {};
  const Invoice = modelFor("invoices");
  const inv = await Invoice.findOne({ _id: invoiceId, studentId: child.id });
  if (!inv) throw new AppError("Invoice not found", 404);

  const ok = paymentsMode() === "mock"
    ? signature === "mock_ok"
    : verifyCheckoutSignature({ orderId, paymentId, signature }, PAYMENTS.keySecret);
  if (!ok) throw new AppError("Payment verification failed", 400);

  const amount = Math.max(1, Math.min(Number(req.body.amount || inv.balance), Number(inv.balance)));
  const next = applyPayment({ total: inv.total, paid: inv.paid || 0 }, amount);
  inv.paid = next.paid; inv.balance = next.balance; inv.status = next.status;
  await inv.save();

  const Payment = modelFor("payments");
  const seq = (await Payment.countDocuments()) + 1;
  const receipt = await Payment.create({
    receiptNo: receiptNo(seq), invoiceNo: inv.invoiceNo, invoiceId: String(inv._id),
    studentId: inv.studentId, studentName: inv.studentName || child.name,
    amount, mode: "Razorpay", reference: paymentId || "APP", note: "Paid via parent app",
    date: new Date().toISOString(), receivedBy: "Parent",
  });
  res.status(201).json({ data: { ok: true, receipt: { id: receipt.receiptNo, method: receipt.mode, date: receipt.date, amount: receipt.amount } } });
});
