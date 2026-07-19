// Shared worker roster. IDs align with WorkshopChatContext so DMs / flag-issue
// resolve to real workshop members without duplication.
export interface WorkerRef {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export const AVAILABLE_WORKERS: WorkerRef[] = [
  { id: "w-tunde", name: "Tunde A.", role: "Tailor", avatar: "TA" },
  { id: "w-kwame", name: "Kwame Asante", role: "Tailor", avatar: "KA" },
  { id: "w-esi", name: "Esi Darkwa", role: "Beader", avatar: "ED" },
  { id: "w-amina", name: "Amina K.", role: "Cutter", avatar: "AK" },
  { id: "w-kwesi", name: "Kwesi B.", role: "Finisher", avatar: "KB" },
];

// The worker currently logged in when the role is switched to "worker".
// Kept simple for the prototype so every worker page renders as this user.
export const CURRENT_WORKER: WorkerRef = AVAILABLE_WORKERS[0];

export const findWorker = (id: string) => AVAILABLE_WORKERS.find((w) => w.id === id);