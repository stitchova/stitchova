# Branded Invoice & Receipt Generation

Give Designers the ability to generate, preview, share, and download a beautifully branded invoice or receipt for any client order — with their brand name, logo, contact info, and order details neatly laid out.

## What the Designer will get

1. **Brand Profile setup** (Settings → "Brand & Billing")
   - Business name, tagline, logo upload (local, persisted in localStorage per mockup scope)
   - Contact: phone, email, address, city
   - Optional: Momo/Bank details, TIN, website, IG handle
   - Currency (default GHS) and accent color (defaults to the gold theme token)
   - Invoice number prefix + auto-increment counter
   - Footer/Thank-you note

2. **Generate from an Order** (`/order/:clientId`)
   - New "Invoice" section with two actions: **Create Invoice** and **Issue Receipt**
   - Invoice = uses order price/balance, marks as "Unpaid / Partially Paid / Paid"
   - Receipt = only shows what has been paid so far, marked "PAID"
   - Line items auto-filled from the order (Garment, Fabric add-ons, Deposit paid) with editable quantity/price + ability to add custom line items, discount, tax
   - Auto-computed subtotal, discount, tax, total, amount paid, balance due

3. **Preview page** (`/invoice/:orderId?type=invoice|receipt`)
   - Full A4/receipt-style branded preview inside the mobile shell (scrollable)
   - Header: logo + brand name + gold accent bar + document type badge ("INVOICE" / "RECEIPT")
   - Meta block: Invoice #, Issue date, Due date, Status pill
   - Bill To: client name + phone + delivery address
   - Itemized table with rows, subtotal, tax, discount, total, amount paid, balance
   - Payment instructions (Momo/Bank) + Thank-you footer + brand tagline
   - Watermark "PAID" stamp on receipts

4. **Actions on the preview**
   - **Download PDF** — client-side via `html2canvas` + `jspdf` (added deps)
   - **Share** — Web Share API with the generated PDF (fallback: copy shareable link)
   - **Send via WhatsApp** — deep link with pre-filled message + note that PDF is downloaded
   - **Print** — window.print with print-optimized CSS

5. **History**
   - "Invoices" tab inside Order Detail listing every invoice/receipt generated for that order (localStorage-backed)
   - Optional: new `/invoices` route in the More menu listing all invoices across orders with filter (Paid / Unpaid / Overdue)

## Design language

- Match the existing dark premium theme + gold accent (never blue)
- Use the Stitchova `Logo` component if the designer has not uploaded a brand logo
- Glassmorphic card wrapper on the app screen; the invoice document itself uses a **light ivory paper background** so the exported PDF looks like a real printable document, with the designer's accent color as the header band
- Typography: existing display font for brand name, monospace for invoice numbers and amounts

## Technical details

- New dependencies: `jspdf`, `html2canvas` (both client-side, no backend needed)
- New files:
  - `src/contexts/BrandContext.tsx` — brand profile + invoice counter, persisted to localStorage
  - `src/contexts/InvoiceContext.tsx` — CRUD for invoice records keyed by order
  - `src/pages/BrandSettings.tsx` — designer brand & billing setup form
  - `src/pages/InvoiceEditor.tsx` — line items + totals + type toggle
  - `src/pages/InvoicePreview.tsx` — final branded document + download/share/print
  - `src/pages/Invoices.tsx` — list view (optional, wired from More)
  - `src/components/invoice/InvoiceDocument.tsx` — the printable/exportable layout, reused by preview and PDF export
- Routing added in `src/App.tsx`:
  - `/settings/brand` , `/order/:clientId/invoice/new`, `/invoice/:invoiceId`, `/invoices`
- OrderDetail: add "Billing" card with Create Invoice / Issue Receipt buttons + list of past documents for that order
- Settings and More pages: entry points to Brand settings and Invoices list
- Stays within the mockup-backend rule: all data local-only, no Cloud calls

## Out of scope (unless you say otherwise)

- Real email delivery, payment collection, or Stripe/Momo integration
- Multi-currency conversion
- Client-side invoice viewing (this iteration is Designer-only; a shared link view can come next)
