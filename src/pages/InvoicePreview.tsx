import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Printer, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBrandInvoice, computeTotals, money } from "@/contexts/BrandInvoiceContext";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const { invoiceId = "" } = useParams();
  const { brand, getInvoice, deleteInvoice } = useBrandInvoice();
  const invoice = getInvoice(invoiceId);
  const docRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Invoice not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary font-medium">Go back</button>
        </div>
      </div>
    );
  }

  const filename = `${invoice.type === "receipt" ? "Receipt" : "Invoice"}-${invoice.number}.pdf`;

  const buildPdf = async () => {
    if (!docRef.current) return null;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"), import("jspdf"),
    ]);
    const canvas = await html2canvas(docRef.current, { scale: 2, backgroundColor: "#FBF8F1", useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    return pdf;
  };

  const download = async () => {
    try {
      setBusy(true);
      const pdf = await buildPdf();
      if (!pdf) return;
      pdf.save(filename);
      toast.success("Downloaded");
    } catch (e) { toast.error("Download failed"); }
    finally { setBusy(false); }
  };

  const share = async () => {
    try {
      setBusy(true);
      const pdf = await buildPdf();
      if (!pdf) return;
      const blob = pdf.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: filename, text: `${brand.businessName} · ${invoice.type === "receipt" ? "Receipt" : "Invoice"} ${invoice.number}` });
      } else {
        pdf.save(filename);
        toast("Sharing not supported — downloaded instead");
      }
    } catch { toast.error("Share failed"); }
    finally { setBusy(false); }
  };

  const whatsapp = () => {
    const totals = computeTotals(invoice);
    const msg = encodeURIComponent(
      `Hi ${invoice.clientName},\n\nHere is your ${invoice.type === "receipt" ? "receipt" : "invoice"} from ${brand.businessName}:\n#${invoice.number}\nTotal: ${money(totals.total, brand.currency)}${invoice.type === "invoice" ? `\nBalance due: ${money(totals.balance, brand.currency)}` : ""}\n\nThank you!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const printDoc = () => window.print();

  return (
    <div className="min-h-screen bg-background pb-32 print:bg-white print:pb-0">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{invoice.type === "receipt" ? "Receipt" : "Invoice"} #{invoice.number}</h1>
            <p className="text-[11px] text-muted-foreground">{invoice.clientName}</p>
          </div>
        </div>
        <button onClick={() => { if (confirm("Delete this document?")) { deleteInvoice(invoice.id); navigate(-1); } }}
          className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>

      {/* Scaled preview */}
      <div className="px-4 print:p-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 bg-white print:shadow-none print:rounded-none">
          <div style={{
            transform: "scale(0.45)",
            transformOrigin: "top left",
            width: 794 * 0.45,
            height: 1123 * 0.45,
            overflow: "hidden",
          }} className="print:!scale-100 print:!w-auto print:!h-auto">
            <InvoiceDocument ref={docRef} invoice={invoice} brand={brand} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-24 left-0 right-0 px-4 max-w-md mx-auto print:hidden">
        <div className="card-surface p-3 grid grid-cols-4 gap-2">
          {[
            { icon: Download, label: "PDF", onClick: download },
            { icon: Share2, label: "Share", onClick: share },
            { icon: MessageCircle, label: "WhatsApp", onClick: whatsapp },
            { icon: Printer, label: "Print", onClick: printDoc },
          ].map((a) => (
            <motion.button key={a.label} whileTap={{ scale: 0.95 }} onClick={a.onClick} disabled={busy}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-secondary/60 disabled:opacity-50">
              <a.icon className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;