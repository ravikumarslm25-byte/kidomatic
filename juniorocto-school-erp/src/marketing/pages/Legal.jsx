import { Section, H2, Eyebrow } from "./ui";
import { useSeo } from "../useSeo";

const UPDATED = "12 August 2026";
const ENTITY = "HackGeniX Tech Private Limited";

const DOCS = {
  terms: {
    title: "Terms & Conditions",
    seo: ["Terms & Conditions — KidoMatic", "Terms and conditions for using KidoMatic's school ERP and 3D learning platform, operated by HackGeniX Tech Private Limited."],
    intro: `These Terms & Conditions ("Terms") govern your access to and use of the KidoMatic platform — including the school ERP, the KidoMatic Worlds learning application, mobile apps and websites (collectively, the "Platform") — operated by ${ENTITY} ("KidoMatic", "we", "us"). By creating an account, subscribing to a plan, or using the Platform, you ("you", "the School", "the User") agree to these Terms.`,
    sections: [
      ["1. About us", [`The Platform is owned and operated by ${ENTITY}, a company incorporated in India (CIN U62013TZ2025PTC035022), with its registered office at 67/1, Thiyagi Nadesan Street No. 3, Ammapettai, Salem – 636003, Tamil Nadu, India. GSTIN: 33AAICH0065K1ZO.`]],
      ["2. Eligibility & accounts", ["You must be at least 18 years old and authorised to act for your school or organisation to create an admin account. You are responsible for the accuracy of the information you provide, for all activity under your account, and for keeping your login credentials confidential. Notify us immediately of any unauthorised use."]],
      ["3. The service", ["KidoMatic is a subscription software-as-a-service platform for school management and early-years learning. We provide the Platform on a hosted basis. Features, modules and content may evolve over time; we may add, change or discontinue features with reasonable notice where a change is material."]],
      ["4. Subscriptions, plans & billing", ["Access is licensed on a seat-based basis (per active user, per month) under the plan you select (Reef, Ocean or Fleet). Fees are stated on our Pricing page and are exclusive of applicable taxes (GST at 18%). Subscriptions renew monthly unless cancelled. Payments are processed by our payment partner, Razorpay. A valid GST tax invoice is issued for every payment. Non-payment may result in suspension of access."]],
      ["5. Acceptable use", ["You agree not to misuse the Platform, including: attempting to breach security or access data you are not authorised to; uploading unlawful, harmful or infringing content; reselling or sub-licensing access except under an approved Fleet/partner agreement; or using the Platform to violate any applicable law. We may suspend accounts that breach these Terms."]],
      ["6. Your data & children's data", ["The School is the owner of the student, staff and academic data it enters. We process this data on the School's behalf to provide the service, as described in our Privacy Policy. Because the Platform involves children's information, both parties agree to handle it in line with India's Digital Personal Data Protection Act, 2023 and applicable rules."]],
      ["7. Intellectual property", ["The Platform, its software, design, KidoMatic Worlds content and the KidoMatic brand are the intellectual property of " + ENTITY + " and its licensors. We grant you a limited, non-exclusive, non-transferable licence to use the Platform for your school during your subscription. You retain ownership of your own data and content."]],
      ["8. Third-party services", ["We rely on trusted third parties — including Razorpay for payments and cloud infrastructure providers for hosting. Your use of payment services is also subject to Razorpay's terms. We are not responsible for third-party services outside our control."]],
      ["9. Disclaimers & limitation of liability", ["The Platform is provided on an \u201Cas is\u201D and \u201Cas available\u201D basis. To the maximum extent permitted by law, our total liability arising out of or relating to the Platform is limited to the subscription fees paid by you in the three (3) months preceding the claim. We are not liable for indirect, incidental or consequential losses."]],
      ["10. Termination", ["You may cancel your subscription at any time from your admin console; access continues until the end of the paid period. We may suspend or terminate access for breach of these Terms or non-payment. On termination, you may export your data within a reasonable period, after which it may be deleted per our retention policy."]],
      ["11. Governing law & jurisdiction", ["These Terms are governed by the laws of India. Subject to any applicable law, the courts at Salem, Tamil Nadu shall have exclusive jurisdiction over any dispute."]],
      ["12. Changes & contact", ["We may update these Terms from time to time; material changes will be notified via the Platform or email. Continued use after changes constitutes acceptance. Questions? Email ravi@hackgenix.com."]],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    seo: ["Privacy Policy — KidoMatic", "How KidoMatic collects, uses and protects data, including children's data under India's DPDP Act. Operated by HackGeniX Tech Private Limited."],
    intro: `${ENTITY} ("we", "us") respects your privacy and is committed to protecting the personal data we handle through the KidoMatic Platform. This Policy explains what we collect, why, how we protect it, and your rights. We comply with India's Digital Personal Data Protection Act, 2023 (DPDP).`,
    sections: [
      ["1. Information we collect", ["Account information: name, email, phone, school details and login credentials. School records entered by the School: student and staff details, attendance, fees, academics and communications. Learning data: a child's lesson progress and activity within KidoMatic Worlds. Payment information: processed securely by Razorpay — we do not store full card numbers. Usage & device data: log data, device/browser information and cookies used to run and improve the service."]],
      ["2. How we use information", ["To provide and operate the Platform; to process subscriptions and issue GST invoices; to send service communications and school notifications; to provide support; to keep the Platform secure and prevent misuse; and to improve features. We do not sell your data, and we do not show third-party advertising to children."]],
      ["3. Children's data", ["KidoMatic is used by schools and parents on behalf of children. The School acts as the data fiduciary for student data and is responsible for obtaining any required parental consent. We process children's data only to deliver the learning and school-management services, in line with the DPDP Act. We do not use children's data for advertising or profiling."]],
      ["4. Sharing & disclosure", ["We share data only as needed to run the service: with Razorpay to process payments; with cloud hosting and infrastructure providers under confidentiality obligations; and where required by law. We do not sell or rent personal data to anyone."]],
      ["5. Data security", ["We use industry-standard measures — encryption in transit, access controls, and hosted infrastructure with security safeguards — to protect data. No method is 100% secure, but we work continuously to protect the information entrusted to us."]],
      ["6. Data retention", ["We retain data for as long as your account is active or as needed to provide the service and meet legal obligations. On termination, you may export your data; thereafter it is deleted or anonymised within a reasonable period, unless retention is required by law."]],
      ["7. Your rights", ["Subject to applicable law, you may request access to, correction of, or deletion of your personal data, and may withdraw consent where processing is based on consent. Schools can manage most student/staff data directly in the Platform. To exercise other rights, contact our Grievance Officer below."]],
      ["8. Cookies", ["We use essential cookies to keep you logged in and to run the Platform, and limited analytics cookies to understand usage and improve the product. You can control cookies through your browser settings."]],
      ["9. Grievance Officer & contact", [`For any privacy question, request or complaint, contact our Grievance Officer: Ravikumar S, ${ENTITY}, 67/1, Thiyagi Nadesan Street No. 3, Ammapettai, Salem – 636003, Tamil Nadu, India. Email: ravi@hackgenix.com. We aim to respond within the timelines prescribed under the DPDP Act.`]],
      ["10. Changes", ["We may update this Policy from time to time. Material changes will be notified via the Platform or email, and the \u201Clast updated\u201D date will be revised."]],
    ],
  },
  refund: {
    title: "Cancellation & Refund Policy",
    seo: ["Cancellation & Refund Policy — KidoMatic", "KidoMatic's cancellation and refund policy for its subscription school ERP and learning platform."],
    intro: "This policy explains how cancellations and refunds work for KidoMatic subscriptions. It should be read together with our Terms & Conditions.",
    sections: [
      ["1. Subscriptions", ["KidoMatic plans are billed monthly on a subscription basis. Your subscription renews automatically each month until you cancel."]],
      ["2. How to cancel", ["You can cancel at any time from your admin console, or by emailing ravi@hackgenix.com. On cancellation, your plan remains active until the end of the current paid billing period; it will not renew thereafter. There is no cancellation fee."]],
      ["3. Refunds", ["As KidoMatic is a digital service to which access is granted immediately, subscription fees for a billing period that has already begun are generally non-refundable, except where required by law. If you cancel, you retain access until the end of the paid period."]],
      ["4. Failed, duplicate or incorrect charges", ["If you are charged in error — for example a duplicate charge or a payment for a service you did not receive — we will refund the affected amount in full. Please contact us within 7 days of the charge with your invoice number."]],
      ["5. Refund method & timeline", ["Approved refunds are processed to the original payment method via Razorpay. Refunds typically reflect within 5–7 business days, depending on your bank or card issuer."]],
      ["6. Contact", ["For any billing or refund query, email ravi@hackgenix.com with your registered email and invoice number. " + ENTITY + ", Salem, Tamil Nadu."]],
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    seo: ["Shipping & Delivery Policy — KidoMatic", "KidoMatic is a digital SaaS product — access is delivered electronically. No physical shipment is involved."],
    intro: "KidoMatic is a digital software-as-a-service product. There is no physical product and therefore no physical shipment.",
    sections: [
      ["1. Digital delivery", ["On successful payment and account creation, access to the Platform (web app and mobile apps) is provisioned electronically. For self-serve plans, access is typically activated immediately on payment confirmation. For plans that require manual activation (for example, partner-referred or offline sales), access is activated within 24 business hours."]],
      ["2. How you receive access", ["Your login details and a getting-started email are sent to the email address provided at signup. You can then sign in to the KidoMatic ERP on the web and download the mobile apps."]],
      ["3. No physical goods", ["Because KidoMatic is entirely digital, no items are shipped, and no shipping charges apply."]],
      ["4. Support", ["If you have paid but not received access within the expected time, contact ravi@hackgenix.com with your invoice number and we will resolve it promptly."]],
    ],
  },
};

export default function Legal({ kind }) {
  const doc = DOCS[kind] || DOCS.terms;
  useSeo({ title: doc.seo[0], description: doc.seo[1], path: "/" + kind });
  return (
    <Section className="bg-white">
      <div className="max-w-3xl mx-auto reveal">
        <Eyebrow>Legal</Eyebrow><H2>{doc.title}</H2>
        <p className="text-xs text-ink/45 mt-2">Last updated: {UPDATED} · {ENTITY}</p>
        <p className="mt-6 text-ink/70 leading-relaxed">{doc.intro}</p>
        <div className="mt-8 space-y-7">
          {doc.sections.map(([h, paras]) => (
            <div key={h}><h3 className="font-display text-lg text-ink">{h}</h3>{paras.map((p, i) => <p key={i} className="mt-2 text-ink/70 leading-relaxed text-[15px]">{p}</p>)}</div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-foam p-5 text-sm text-ink/70">
          <p className="font-display text-ink">Contact</p>
          <p className="mt-1">{ENTITY} · 67/1, Thiyagi Nadesan Street No. 3, Ammapettai, Salem – 636003, Tamil Nadu, India</p>
          <p>Email: ravi@hackgenix.com · CIN: U62013TZ2025PTC035022 · GSTIN: 33AAICH0065K1ZO</p>
        </div>
      </div>
    </Section>
  );
}
