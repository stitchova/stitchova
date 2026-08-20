import { forwardRef } from "react";
import { InvoiceRecord, BrandProfile, computeTotals, money } from "@/contexts/BrandInvoiceContext";

interface Props {
  invoice: InvoiceRecord;
  brand: BrandProfile;
}

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};

const InvoiceDocument = forwardRef<HTMLDivElement, Props>(({ invoice, brand }, ref) => {
  const t = computeTotals(invoice);
  const isReceipt = invoice.type === "receipt";
  const accent = brand.accentColor || "#D4A94A";
  const statusLabel = isReceipt ? "PAID" : invoice.status === "paid" ? "PAID" : invoice.status === "partial" ? "PARTIAL" : "UNPAID";

  return (
    <div
      ref={ref}
      className="mx-auto text-[13px] leading-relaxed"
      style={{
        width: 794,          // A4-ish at 96dpi
        minHeight: 1123,
        background: "#FBF8F1",
        color: "#1a1a1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "48px 56px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Accent header band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: accent }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {brand.logoDataUrl ? (
            <img src={brand.logoDataUrl} alt={brand.businessName}
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12, border: `1px solid ${accent}55` }} />
          ) : (
            <div style={{
              width: 64, height: 64, borderRadius: 12, background: "#111",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: accent, fontWeight: 900, fontSize: 26, letterSpacing: 1,
            }}>
              {brand.businessName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.4, color: "#111" }}>{brand.businessName}</div>
            {brand.tagline && <div style={{ fontSize: 11, color: "#6b6b6b", marginTop: 2, fontStyle: "italic" }}>{brand.tagline}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 999,
            background: accent, color: "#111", fontWeight: 800, fontSize: 11, letterSpacing: 2,
          }}>{isReceipt ? "RECEIPT" : "INVOICE"}</div>
          <div style={{ fontSize: 12, color: "#333", marginTop: 10, fontFamily: "ui-monospace, monospace" }}>#{invoice.number}</div>
          <div style={{ fontSize: 10, color: "#8a8a8a", marginTop: 4 }}>Issued {fmtDate(invoice.issueDate)}</div>
          {!isReceipt && <div style={{ fontSize: 10, color: "#8a8a8a" }}>Due {fmtDate(invoice.dueDate)}</div>}
        </div>
      </div>

      {/* From / To */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#8a8a8a", fontWeight: 700, marginBottom: 6 }}>FROM</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{brand.businessName}</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{brand.address}</div>
          <div style={{ color: "#555", fontSize: 11 }}>{brand.city}</div>
          <div style={{ color: "#555", fontSize: 11 }}>{brand.phone}</div>
          {brand.email && <div style={{ color: "#555", fontSize: 11 }}>{brand.email}</div>}
          {brand.tin && <div style={{ color: "#555", fontSize: 11 }}>TIN: {brand.tin}</div>}
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#8a8a8a", fontWeight: 700, marginBottom: 6 }}>BILL TO</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{invoice.clientName}</div>
          {invoice.clientPhone && <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{invoice.clientPhone}</div>}
          {invoice.clientAddress && <div style={{ color: "#555", fontSize: 11 }}>{invoice.clientAddress}</div>}
          <div style={{ marginTop: 10, display: "inline-block", padding: "4px 10px", borderRadius: 6,
            background: statusLabel === "PAID" ? "#1f8f4d" : statusLabel === "PARTIAL" ? accent : "#c0392b",
            color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{statusLabel}</div>
        </div>
      </div>

      {/* Items table */}
      <div style={{ border: `1px solid ${accent}55`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 130px", background: "#111", color: accent,
          padding: "10px 14px", fontSize: 10, letterSpacing: 1.5, fontWeight: 700 }}>
          <div>DESCRIPTION</div>
          <div style={{ textAlign: "right" }}>QTY</div>
          <div style={{ textAlign: "right" }}>PRICE</div>
          <div style={{ textAlign: "right" }}>AMOUNT</div>
        </div>
        {invoice.items.map((it, i) => (
          <div key={it.id} style={{
            display: "grid", gridTemplateColumns: "1fr 80px 120px 130px", padding: "12px 14px",
            borderTop: i === 0 ? "none" : "1px solid #eee2c9", fontSize: 12,
          }}>
            <div style={{ color: "#222" }}>{it.description}</div>
            <div style={{ textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{it.qty}</div>
            <div style={{ textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{money(it.price, brand.currency)}</div>
            <div style={{ textAlign: "right", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
              {money(it.qty * it.price, brand.currency)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <div style={{ width: 320 }}>
          {[
            ["Subtotal", t.subtotal],
            ...(t.discount ? [["Discount", -t.discount] as const] : []),
            ...(invoice.taxPct ? [[`Tax (${invoice.taxPct}%)`, t.tax] as const] : []),
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#444" }}>
              <span>{label}</span>
              <span style={{ fontFamily: "ui-monospace, monospace" }}>{money(val as number, brand.currency)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", marginTop: 6,
            background: accent, color: "#111", borderRadius: 6, fontWeight: 800, fontSize: 14 }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>{money(t.total, brand.currency)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#444", marginTop: 6 }}>
            <span>Amount Paid</span>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#1f8f4d", fontWeight: 700 }}>
              {money(invoice.amountPaid, brand.currency)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, borderTop: "1px dashed #d8ccae",
            marginTop: 4, fontWeight: 700 }}>
            <span>{isReceipt ? "Amount Received" : "Balance Due"}</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              {money(isReceipt ? invoice.amountPaid : t.balance, brand.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment details */}
      {!isReceipt && (brand.momo || brand.bank) && (
        <div style={{ marginTop: 32, padding: 16, background: "#F3ECDA", borderRadius: 8, border: `1px dashed ${accent}` }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#8a7a4a", fontWeight: 700, marginBottom: 6 }}>PAYMENT DETAILS</div>
          {brand.momo && <div style={{ fontSize: 12, color: "#333" }}><strong>Mobile Money:</strong> {brand.momo}</div>}
          {brand.bank && <div style={{ fontSize: 12, color: "#333", marginTop: 2 }}><strong>Bank:</strong> {brand.bank}</div>}
        </div>
      )}

      {invoice.notes && (
        <div style={{ marginTop: 24, fontSize: 11, color: "#555", fontStyle: "italic" }}>
          <strong style={{ color: "#333", fontStyle: "normal" }}>Notes: </strong>{invoice.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 40, textAlign: "center",
        paddingTop: 16, borderTop: `2px solid ${accent}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{brand.footerNote}</div>
        <div style={{ fontSize: 10, color: "#888", marginTop: 6 }}>
          {[brand.website, brand.instagram, brand.email].filter(Boolean).join("  ·  ")}
        </div>
      </div>

      {isReceipt && (
        <div style={{ position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%) rotate(-18deg)",
          fontSize: 120, fontWeight: 900, letterSpacing: 8,
          color: `${accent}22`, pointerEvents: "none",
          border: `8px solid ${accent}22`, padding: "10px 40px", borderRadius: 20,
        }}>PAID</div>
      )}
    </div>
  );
});

InvoiceDocument.displayName = "InvoiceDocument";
export default InvoiceDocument;