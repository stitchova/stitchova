import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scissors, Sparkles, Info, PackageOpen } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useAtelier } from "@/contexts/AtelierContext";
import { CURRENT_WORKER } from "@/lib/workers";
import WorkerMaterialsWorkspace from "@/components/worker-desktop/WorkerMaterialsWorkspace";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const WorkerMaterials = () => {
  const navigate = useNavigate();
  const { tasksByWorker, orderById } = useAtelier();

  // Group the worker's active assignments by order and surface the fabrics
  // + materials the designer already reserved from inventory for that order.
  const grouped = useMemo(() => {
    const seen = new Map<string, { orderId: string; title: string; fabricUse: any[]; materialUse: any[] }>();
    for (const task of tasksByWorker(CURRENT_WORKER.id)) {
      if (task.status === "completed") continue;
      const order = orderById(task.orderId);
      if (!order) continue;
      if (seen.has(order.id)) continue;
      seen.set(order.id, {
        orderId: order.id,
        title: `${order.type} – ${order.client}`,
        fabricUse: order.fabricUse || [],
        materialUse: order.materialUse || [],
      });
    }
    return Array.from(seen.values());
  }, [tasksByWorker, orderById]);

  return (
    <>
      {/* Tablet/desktop worker workspace */}
      <WorkerMaterialsWorkspace />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-24 lg:hidden">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Materials</h1>
          </div>
        </div>
      </div>

      {/* Read-only info bar */}
      <div className="px-5 pt-4 mb-4">
        <motion.div {...fadeUp} className="card-glass p-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground">Materials are assigned by the designer. View only.</p>
        </motion.div>
      </div>

      <div className="px-5 space-y-4">
        {grouped.map((order, oi) => (
          <motion.div key={order.orderId} {...fadeUp} transition={{ delay: oi * 0.05 }}
            className="card-glass overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20">
              <p className="text-sm font-bold text-foreground">{order.title}</p>
            </div>
            <div className="divide-y divide-border/10">
              {order.fabricUse.length + order.materialUse.length === 0 && (
                <p className="px-4 py-3 text-[11px] text-muted-foreground">No materials reserved for this order yet.</p>
              )}
              {order.fabricUse.map((item, ii) => (
                <motion.div key={`f-${item.id}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + ii * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Fabric</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{item.amount} {item.unit}</span>
                </motion.div>
              ))}
              {order.materialUse.map((item, ii) => (
                <motion.div key={`m-${item.id}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + ii * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-400/10 text-green-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Material</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-400/10 text-green-400">{item.amount} {item.unit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        {grouped.length === 0 && (
          <EmptyState
            icon={PackageOpen}
            title="No materials assigned"
            description="When the designer assigns you an order with fabric or accessories, they'll appear here."
          />
        )}
      </div>
    </div>
    </>
  );
};

export default WorkerMaterials;
