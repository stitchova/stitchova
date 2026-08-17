import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, ExternalLink, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import { useAtelier, money } from "@/contexts/AtelierContext";
import {
  DesktopOnly, WorkspaceHeader, ListDetail, ListPanel, ListRow, DetailPanel, DetailHeader,
  InfoGrid, SummaryBar, SectionCard, StatusPill, Avatar,
} from "./DesktopKit";

const tabs = ["All", "Active", "New"] as const;

/** Designer clients workspace (list + detail) for tablet/desktop. */
const ClientsWorkspace = ({ onAddClient }: { onAddClient: () => void }) => {
  const navigate = useNavigate();
  const { clients, ordersByClient, measurementsByClient } = useAtelier();

  const [tab, setTab] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => clients.filter((c) => {
    const orders = ordersByClient(c.id);
    const byTab =
      tab === "All" ? true :
      tab === "Active" ? orders.some((o) => o.status === "active") :
      orders.length === 0;
    return byTab && `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase());
  }), [clients, ordersByClient, tab, query]);

  useEffect(() => {
    if (!filtered.find((c) => c.id === selectedId)) setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  const selected = filtered.find((c) => c.id === selectedId) || null;
  const orders = selected ? ordersByClient(selected.id) : [];
  const measurements = selected ? measurementsByClient(selected.id) : [];
  const spend = orders.reduce((s, o) => s + o.price, 0);
  const paid = orders.reduce((s, o) => s + o.payments.reduce((a, p) => a + p.amount, 0), 0);

  const withOrders = clients.filter((c) => ordersByClient(c.id).some((o) => o.status === "active")).length;

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Clients"
        subtitle={`${clients.length} clients · ${withOrders} with work in progress`}
        tabs={tabs} activeTab={tab} onTab={setTab} pillId="clientsDesktopPill"
        query={query} onQuery={setQuery} searchPlaceholder="Search clients…"
        action={{ label: "Add client", icon: Plus, onClick: onAddClient }}
      />

      <ListDetail
        list={
          <ListPanel title={`${tab} clients`} count={filtered.length}>
            {filtered.map((c) => {
              const co = ordersByClient(c.id);
              return (
                <ListRow key={c.id} active={c.id === selectedId} onClick={() => setSelectedId(c.id)}
                  leading={<Avatar initials={c.initials} />}
                  title={c.name}
                  meta={`${c.phone || "No phone"} · ${co.length} order${co.length === 1 ? "" : "s"}`}
                  pill={co.some((o) => o.status === "active")
                    ? { label: "Active", tone: "primary" }
                    : { label: "Idle", tone: "neutral" }}
                />
              );
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Users} title="No clients" description="No clients match this filter yet." />
            )}
          </ListPanel>
        }
        detail={selected ? (
          <DetailPanel id={selected.id}>
            <DetailHeader
              eyebrow="Client details"
              title={selected.name}
              pill={{ label: orders.some((o) => o.status === "active") ? "Active" : "Idle", tone: orders.some((o) => o.status === "active") ? "primary" : "neutral" }}
              subtitle={`${selected.gender || "—"} · joined ${selected.joined}`}
              right={{ label: "Contact", value: selected.phone || "—", hint: selected.preferredChannel || "sms" }}
              actions={
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate(`/client/${selected.id}`)}
                  className="rounded-full frost-card px-4 py-2 text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  Open <ExternalLink className="w-3 h-3" />
                </motion.button>
              }
            />

            <InfoGrid blocks={[
              { label: "Orders", value: String(orders.length) },
              { label: "Measurements", value: String(measurements.length) },
              { label: "Address", value: selected.address || "—" },
              { label: "Referral", value: selected.referralSource || "—" },
            ]} />

            <div className="grid grid-cols-2 gap-4">
              <SectionCard title="Saved measurements">
                <div className="space-y-2">
                  {measurements.slice(0, 4).map((m) => (
                    <div key={m.id} className="rounded-2xl bg-card/60 border border-border/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{m.garment}</p>
                        <StatusPill label={`${Object.keys(m.fields).length} fields`} tone="neutral" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {m.createdAt} · {m.unit === "cm" ? "centimeters" : "inches"}
                      </p>
                    </div>
                  ))}
                  {measurements.length === 0 && (
                    <button onClick={() => navigate("/measurements")}
                      className="w-full rounded-2xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Ruler className="w-3.5 h-3.5" /> Take first measurement
                    </button>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Order history">
                <div className="space-y-2">
                  {orders.slice(0, 4).map((o) => (
                    <button key={o.id} onClick={() => navigate(`/order/${o.id}`)}
                      className="w-full text-left rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{o.type}</p>
                        <p className="text-[11px] text-muted-foreground truncate">Due {o.dueDate}</p>
                      </div>
                      <StatusPill
                        label={o.status === "completed" ? "Completed" : o.awaitingMaterials ? "Awaiting Materials" : o.stages[o.currentStage] || "Active"}
                        tone={o.status === "completed" ? "success" : o.awaitingMaterials ? "neutral" : "primary"} />
                    </button>
                  ))}
                  {orders.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No orders yet.</p>}
                </div>
              </SectionCard>
            </div>

            {selected.notes && (
              <SectionCard title="Notes">
                <p className="text-xs text-muted-foreground leading-relaxed">{selected.notes}</p>
              </SectionCard>
            )}

            <SummaryBar items={[
              { label: "Lifetime value", value: money(spend, "GHS") },
              { label: "Paid", value: money(paid, "GHS") },
              { label: "Balance", value: money(Math.max(0, spend - paid), "GHS"), accent: true },
            ]}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/client/${selected.id}`)}
                className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5">
                Manage client
              </motion.button>
            </SummaryBar>
          </DetailPanel>
        ) : (
          <div className="rounded-3xl bg-card/70 border border-border/40">
            <EmptyState icon={Users} title="Select a client" description="Pick a client to see measurements and order history." />
          </div>
        )}
      />
    </DesktopOnly>
  );
};

export default ClientsWorkspace;
