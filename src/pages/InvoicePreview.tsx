import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Printer, MessageCircle, Trash2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useBrandInvoice, computeTotals, money } from "@/contexts/BrandInvoiceContext";
import { useAtelier } from "@/contexts/AtelierContext";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import { DesktopOnly, WorkspaceHeader } from "@/components/designer-desktop/DesktopKit";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const { invoiceId = "" } = useParams();
  const { brand, getInvoice, deleteInvoice, updateInvoice } = useBrandInvoice();
  const { orders, orderById, addPayment } = useAtelier();
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

  const DOC_WIDTH = 794;
  const DOC_HEIGHT = 1123;

  const buildPdf = async () => {
    if (!docRef.current) return null;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"), import("jspdf"),
    ]);
    // Capture at 2x for crisp text/edges, but the PDF page itself must stay
    // at the document's true size (794x1123px ~ A4) — using the raw
    // (2x-scaled) canvas dimensions as the page size was making every
    // exported PDF roughly double the correct physical page size.
    const canvas = await html2canvas(docRef.current, { scale: 2, backgroundColor: "#FBF8F1", useCORS: true });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ unit: "px", format: [DOC_WIDTH, DOC_HEIGHT] });
    pdf.addImage(img, "JPEG", 0, 0, DOC_WIDTH, DOC_HEIGHT);
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
        markSent("share");
        await nav.share({ files: [file], title: filename, text: `${brand.businessName} · ${invoice.type === "receipt" ? "Receipt" : "Invoice"} ${invoice.number}` });
      } else {
        pdf.save(filename);
        toast("Sharing not supported — downloaded instead");
      }
    } catch { toast.error("Share failed"); }
    finally { setBusy(false); }
  };

  const linkedOrder =
    (invoice && (orderById(invoice.orderId) || orders.find((o) => o.clientId === invoice.orderId))) || undefined;

  const markSent = (channel: "whatsapp" | "share") => {
    if (!invoice || invoice.sentAt) return;
    updateInvoice(invoice.id, { sentAt: Date.now(), sentChannel: channel });
  };

  const markPaid = () => {
    if (!invoice) return;
    const t = computeTotals(invoice);
    if (t.balance <= 0 && invoice.status === "paid") return;
    const ref = `pay-${Date.now()}`;
    if (linkedOrder && t.balance > 0) {
      // Mirror the settlement onto the order so balances and analytics update.
      addPayment(linkedOrder.id, {
        amount: t.balance,
        method: "Mobile Money",
        date: new Date().toISOString().slice(0, 10),
      });
    }
    updateInvoice(invoice.id, {
      status: "paid",
      amountPaid: t.total,
      paidAt: Date.now(),
      paymentRef: ref,
    });
    toast.success(`Marked paid · ${money(t.balance, brand.currency)} recorded`);
  };

  const whatsapp = () => {
    const totals = computeTotals(invoice);
    const msg = encodeURIComponent(
      `Hi ${invoice.clientName},\n\nHere is your ${invoice.type === "receipt" ? "receipt" : "invoice"} from ${brand.businessName}:\n#${invoice.number}\nTotal: ${money(totals.total, brand.currency)}${invoice.type === "invoice" ? `\nBalance due: ${money(totals.balance, brand.currency)}` : ""}\n\nThank you!`
    );
    const to = (invoice.clientPhone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${to}?text=${msg}`, "_blank");
    markSent("whatsapp");
  };

  const printDoc = () => window.print();

  return (
    <div className="print:bg-white print:pb-0">
      {/* Tablet/desktop workspace */}
      <DesktopOnly className="print:!hidden">
        <div className="flex items-start justify-between gap-4">
          <WorkspaceHeader
            title={`${invoice.type === "receipt" ? "Receipt" : "Invoice"} #${invoice.number}`}
            subtitle={invoice.clientName}
          />
          <button onClick={() => { if (confirm("Delete this document?")) { deleteInvoice(invoice.id); navigate(-1); } }}
            className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>

        <div className="mt-6 flex items-start justify-center gap-6">
          {/* Purely visual scaled card — buildPdf() captures the hidden copy below. */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 bg-white flex-shrink-0">
            <div style={{ width: DOC_WIDTH * 0.72, height: DOC_HEIGHT * 0.72, overflow: "hidden" }}>
              <div style={{ transform: "scale(0.72)", transformOrigin: "top left", width: DOC_WIDTH, height: DOC_HEIGHT }}>
                <InvoiceDocument invoice={invoice} brand={brand} />
              </div>
            </div>
          </div>

          <div className="w-60 flex-shrink-0 sticky top-24 space-y-4">
            <div className="card-surface p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  invoice.status === "paid" ? "bg-status-completed/15 text-status-completed"
                    : invoice.status === "partial" ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"}`}>
                  {invoice.status}
                </span>
                {invoice.sentAt && (
                  <span className="text-[10px] text-muted-foreground">
                    Sent {new Date(invoice.sentAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Balance <span className="font-mono font-bold text-foreground">{money(computeTotals(invoice).balance, brand.currency)}</span>
              </p>
              <button onClick={whatsapp}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-xs font-bold text-foreground">
                <Send className="w-4 h-4 text-primary" /> {invoice.sentAt ? "Resend" : "Send to client"}
              </button>
              <button onClick={markPaid} disabled={invoice.status === "paid"}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> {invoice.status === "paid" ? "Paid" : "Mark as paid"}
              </button>
              {linkedOrder && (
                <button onClick={() => navigate(`/order/${linkedOrder.id}`)} className="text-[11px] text-primary font-semibold">
                  View linked order →
                </button>
              )}
            </div>

            <div className="space-y-2">
              {[
                { icon: Download, label: "Download PDF", onClick: download },
                { icon: Share2, label: "Share", onClick: share },
                { icon: MessageCircle, label: "Send via WhatsApp", onClick: whatsapp },
                { icon: Printer, label: "Print", onClick: printDoc },
              ].map((a) => (
                <button key={a.label} onClick={a.onClick} disabled={busy}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors disabled:opacity-50 text-left">
                  <a.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DesktopOnly>

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-32 print:bg-white print:pb-0 lg:hidden print:!block">
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
            width: 794 * 0.45,
            height: 1123 * 0.45,
            overflow: "hidden",
          }} className="print:!w-auto print:!h-auto print:!overflow-visible">
            <div style={{
              transform: "scale(0.45)",
              transformOrigin: "top left",
              width: 794,
              height: 1123,
            }} className="print:!scale-100 print:!w-auto print:!h-auto">
              <InvoiceDocument invoice={invoice} brand={brand} />
            </div>
          </div>
        </div>
      </div>

      {/* Status + send / settle */}
      <div className="px-4 mt-4 print:hidden">
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              invoice.status === "paid" ? "bg-status-completed/15 text-status-completed"
                : invoice.status === "partial" ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive"}`}>
              {invoice.status}
            </span>
            {invoice.sentAt && (
              <span className="text-[10px] text-muted-foreground">
                Sent {new Date(invoice.sentAt).toLocaleDateString()} · {invoice.sentChannel}
              </span>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground">
              Balance <span className="font-mono font-bold text-foreground">{money(computeTotals(invoice).balance, brand.currency)}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={whatsapp}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/70 border border-border/50 text-xs font-bold text-foreground">
              <Send className="w-4 h-4 text-primary" /> {invoice.sentAt ? "Resend to client" : "Send to client"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={markPaid}
              disabled={invoice.status === "paid"}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" /> {invoice.status === "paid" ? "Paid" : "Mark as paid"}
            </motion.button>
          </div>
          {linkedOrder && (
            <button onClick={() => navigate(`/order/${linkedOrder.id}`)}
              className="text-[11px] text-primary font-semibold">
              View linked order · {linkedOrder.type} →
            </button>
          )}
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

      </div>

      {/* Hidden, unscaled capture target for html2canvas — html2canvas cannot
          measure elements inside a `transform: scale()` ancestor, which was
          producing doubled/offset text on every exported PDF. */}
      <div style={{ position: "fixed", top: 0, left: -10000, pointerEvents: "none" }} aria-hidden="true" className="print:hidden">
        <InvoiceDocument ref={docRef} invoice={invoice} brand={brand} />
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