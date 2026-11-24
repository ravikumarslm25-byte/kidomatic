export const LETTER_TYPES = ["Offer", "Appointment", "Confirmation", "Increment", "Experience", "Relieving", "Full & Final"];
export const ONBOARD_CHECKLIST = ["Collect & verify documents (KYC)", "Issue Employee ID", "Create official email", "Enable ERP login", "Allocate assets (ID card / keys)", "Induction & orientation", "POCSO / child-safety training", "Assign mentor", "Confirm salary structure", "Set probation period"];
export const CLEARANCE_DEPTS = ["Reporting HOD / Principal", "Library", "IT / Assets", "Accounts (advances & loans)", "Transport", "Administration"];

const fdate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "____________");
const today = () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

export function letterBody(type, st = {}, school = {}, extra = {}) {
  const name = st.name || "____________";
  const desig = st.designation || st.role || "____________";
  const sName = school.name || "The School";
  const addr = school.address || "";
  const doj = fdate(st.doj);
  const gross = extra.gross ? `₹${(+extra.gross).toLocaleString("en-IN")}` : "as per the agreed structure";
  const salute = `Dear ${name},`;
  let title = type + " Letter"; let paras = [];
  switch (type) {
    case "Offer":
      paras = [`We are pleased to offer you the position of ${desig} at ${sName}.`,
        `Your consolidated remuneration will be ${gross} per month, subject to statutory deductions. Your tentative date of joining is ${doj}.`,
        `This offer is contingent on satisfactory verification of your documents, references and police verification. Kindly confirm your acceptance by returning a signed copy of this letter.`]; break;
    case "Appointment":
      title = "Appointment / Joining Letter";
      paras = [`With reference to your acceptance, we are delighted to confirm your appointment as ${desig} at ${sName}, effective ${doj}.`,
        `You will be on probation for ${extra.probationMonths || 6} months from the date of joining. Your appointment is governed by the terms of service, code of conduct and child-protection (POCSO) policy of the school.`,
        `We look forward to your valuable contribution.`]; break;
    case "Confirmation":
      title = "Confirmation Letter";
      paras = [`We are pleased to inform you that, on successful completion of your probation, your services as ${desig} at ${sName} are hereby confirmed with effect from ${fdate(extra.confirmDate) || today()}.`,
        `All other terms and conditions of your appointment remain unchanged. We wish you a long and rewarding association with the school.`]; break;
    case "Increment":
      title = "Increment / Revised Salary Letter";
      paras = [`In recognition of your performance, we are pleased to revise your remuneration to ${gross} per month with effect from ${fdate(extra.effectiveDate) || today()}.`,
        `All other terms of your appointment remain unchanged. We appreciate your continued dedication.`]; break;
    case "Experience":
      title = "Experience Certificate";
      paras = [`This is to certify that ${name} was employed with ${sName} as ${desig} from ${doj} to ${fdate(extra.lastWorkingDay)}.`,
        `During the tenure, ${name.split(" ")[0]} was found to be sincere, hardworking and professional in conduct. We wish ${name.split(" ")[0]} all success in future endeavours.`]; break;
    case "Relieving":
      title = "Relieving Letter";
      paras = [`This is to confirm that ${name}, ${desig}, has been relieved from the services of ${sName} with effect from the close of working hours on ${fdate(extra.lastWorkingDay)}.`,
        `All dues and company property have been settled/returned as applicable. We thank ${name.split(" ")[0]} for the services rendered and wish continued success.`]; break;
    case "Full & Final":
      title = "Full & Final Settlement";
      paras = [`This statement summarises the full & final settlement for ${name} (${desig}), relieved on ${fdate(extra.lastWorkingDay)}.`,
        `Pending salary: ₹${(+extra.fnfPending || 0).toLocaleString("en-IN")}  |  Leave encashment: ₹${(+extra.fnfEncash || 0).toLocaleString("en-IN")}  |  Recoveries: ₹${(+extra.fnfRecovery || 0).toLocaleString("en-IN")}.`,
        `Net settlement payable: ₹${(+extra.fnfNet || 0).toLocaleString("en-IN")}.`]; break;
    default: paras = [""];
  }
  return { title, salute, paras, refLine: `Ref: ${sName.replace(/[^A-Z]/g, "").slice(0, 4) || "HR"}/${type.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}`, date: today(), school: sName, addr, closing: `For ${sName}`, sign: "Principal / HR" };
}
