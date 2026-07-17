import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Palette, Ruler } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useBrandInvoice, BrandProfile } from "@/contexts/BrandInvoiceContext";
import { ChangeEvent } from "react";

const fields: Array<{ key: keyof BrandProfile; label: string; placeholder?: string; type?: string }> = [
  { key: "businessName", label: "Business Name" },
  { key: "tagline", label: "Tagline" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City / Country" },
  { key: "momo", label: "Mobile Money" },
  { key: "bank", label: "Bank Details" },
  { key: "tin", label: "TIN (optional)" },
  { key: "website", label: "Website" },
  { key: "instagram", label: "Instagram" },
  { key: "currency", label: "Currency" },
  { key: "invoicePrefix", label: "Invoice Prefix" },
  { key: "footerNote", label: "Thank-you Note" },
];

const BrandSettings = () => {
  const navigate = useNavigate();
  const { brand, updateBrand } = useBrandInvoice();

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { updateBrand({ logoDataUrl: String(reader.result) }); toast.success("Logo updated"); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Brand & Billing</h1>
          <p className="text-xs text-muted-foreground">Personalize your invoices and receipts</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Logo */}
        <div className="card-surface p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border">
            {brand.logoDataUrl
              ? <img src={brand.logoDataUrl} alt="Logo" className="w-full h-full object-cover" />
              : <span className="text-2xl font-black text-primary">{brand.businessName.slice(0,1)}</span>}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Brand Logo</p>
            <p className="text-[10px] text-muted-foreground">Shown on every invoice & receipt</p>
          </div>
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
          </label>
        </div>

        {/* Accent color */}
        <div className="card-surface p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Palette className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Accent Color</p>
            <p className="text-[10px] text-muted-foreground">Used on header band and totals</p>
          </div>
          <input
            type="color"
            value={brand.accentColor}
            onChange={(e) => updateBrand({ accentColor: e.target.value })}
            className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-border"
          />
        </div>

        {/* Measurement unit */}
        <div className="card-surface p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Ruler className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Measurement Unit</p>
            <p className="text-[10px] text-muted-foreground">Default unit for new measurements</p>
          </div>
          <div className="flex gap-2">
            {(["in", "cm"] as const).map((u) => (
              <button key={u}
                onClick={() => updateBrand({ measurementUnit: u })}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase ${brand.measurementUnit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {u === "in" ? "Inches" : "Centimeters"}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="card-surface p-4 space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{f.label}</label>
              <input
                type={f.type || "text"}
                value={String(brand[f.key] ?? "")}
                onChange={(e) => updateBrand({ [f.key]: e.target.value } as Partial<BrandProfile>)}
                placeholder={f.placeholder}
                className="mt-1 w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Next Invoice #</label>
            <input
              type="number"
              value={brand.nextInvoiceNumber}
              onChange={(e) => updateBrand({ nextInvoiceNumber: Number(e.target.value) || 1 })}
              className="mt-1 w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none"
            />
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { toast.success("Brand saved"); navigate(-1); }}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25">
          Save Brand Settings
        </motion.button>
      </div>
    </div>
  );
};

export default BrandSettings;