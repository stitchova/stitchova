import { useMemo, useState } from "react";
import { Info, PackageOpen, Scissors, Sparkles } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import OrderMaterials from "@/components/OrderMaterials";
import { useAtelier } from "@/contexts/AtelierContext";
import { CURRENT_WORKER } from "@/lib/workers";
import {
  DesktopOnly, WorkspaceHeader, ListDetail, ListPanel, ListRow,
  DetailPanel, DetailHeader, InfoGrid, SectionCard, SummaryBar,
} from "@/components/designer-desktop/DesktopKit";

/** Worker materials view for tablet/desktop: order list + reserved items + checklist. */
const WorkerMaterialsWorkspace = () => {
  const { tasks, tasksByWorker, orderById } = useAtelier();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useMemo(() => {
    const seen = new Map<string, ReturnType<typeof orderById>>();
    for (const task of tasksByWorker(CURRENT_WORKER.id)) {
      if (task.status === "completed") continue;
      const order = orderById(task.orderId);
      if (order && !seen.has(order.id)) seen.set(order.id, order);
    }
    return Array.from(seen.values()).filter(Boolean);
  }, [tasks, tasksByWorker, orderById]);

  const order = orders.find((o) => o!.id === selectedId) || orders[0];

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Materials"
        subtitle="Reserved by the designer — confirm what arrives at the workshop."
      />

      {orders.length === 0 ? (
        <div className="mt-6 rounded-3xl card-elevated p-10">
          <EmptyState icon={PackageOpen} title="No materials assigned"
            description="When the designer assigns you an order with fabric or accessories, they'll appear here." />
        </div>
      ) : (
        <ListDetail
          list={
            <ListPanel title="Orders with materials" count={orders.length}>
              {orders.map((o) => (
                <ListRow
                  key={o!.id}
                  active={order?.id === o!.id}
                  onClick={() => setSelectedId(o!.id)}
                  title={o!.type}
                  meta={`${o!.client} · Due ${o!.dueDate}`}
                  pill={o!.awaitingMaterials ? { label: "Awaiting Materials", tone: "warning" } : { label: "Ready", tone: "success" }}
                />
              ))}
            </ListPanel>
          }
          detail={
            order ? (
              <DetailPanel id={order.id}>
                <DetailHeader
                  eyebrow="Order materials"
                  title={order.type}
                  pill={order.awaitingMaterials ? { label: "Awaiting Materials", tone: "warning" } : { label: "In production", tone: "primary" }}
                  subtitle={order.client}
                  right={{ label: "Due", value: order.dueDate }}
                />

                <InfoGrid
                  cols={3}
                  blocks={[
                    { label: "Garment", value: order.garment || order.type },
                    { label: "Fabrics reserved", value: String((order.fabricUse || []).length) },
                    { label: "Accessories reserved", value: String((order.materialUse || []).length) },
                  ]}
                />

                <SectionCard title="Reserved from inventory">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="w-3.5 h-3.5 text-primary mt-0.5" />
                    <p className="text-[11px] text-muted-foreground">Assigned by the designer — view only.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(order.fabricUse || []).map((item) => (
                      <div key={`f-${item.id}`} className="rounded-xl bg-card/60 border border-border/30 p-3 flex items-center gap-3">
                        <Scissors className="w-4 h-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Fabric</p>
                        </div>
                        <span className="text-[11px] font-semibold text-foreground">{item.amount} {item.unit}</span>
                      </div>
                    ))}
                    {(order.materialUse || []).map((item) => (
                      <div key={`m-${item.id}`} className="rounded-xl bg-card/60 border border-border/30 p-3 flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-status-completed" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Accessory</p>
                        </div>
                        <span className="text-[11px] font-semibold text-foreground">{item.amount} {item.unit}</span>
                      </div>
                    ))}
                    {(order.fabricUse || []).length + (order.materialUse || []).length === 0 && (
                      <p className="text-[11px] text-muted-foreground">Nothing reserved for this order yet.</p>
                    )}
                  </div>
                </SectionCard>

                <OrderMaterials orderId={order.id} actorName={CURRENT_WORKER.name} actorRole="worker" />

                <SummaryBar
                  items={[
                    { label: "Checklist items", value: String((order.materialsList || []).length), accent: true },
                    { label: "Received", value: String((order.materialsList || []).filter((m) => m.status === "received").length) },
                    { label: "Stage", value: order.stages[order.currentStage] || "—" },
                  ]}
                />
              </DetailPanel>
            ) : null
          }
        />
      )}
    </DesktopOnly>
  );
};

export default WorkerMaterialsWorkspace;
