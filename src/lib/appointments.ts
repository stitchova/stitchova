import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight persisted store for the designer's published availability slots.
 * Kept in localStorage (prototype backend) so other screens — like the staff
 * dashboard — can read the same appointments the Appointments page publishes.
 */
export interface StoredSlot {
  id: string;
  /** ISO date string (yyyy-mm-dd or full ISO). */
  date: string;
  times: string[];
  services: string[];
  notes: string;
  reminder: boolean;
}

const KEY = "stitchova.appointments.v1";
const listeners = new Set<(s: StoredSlot[]) => void>();

export const readSlots = (): StoredSlot[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeSlots = (slots: StoredSlot[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(slots));
  } catch {
    /* storage unavailable — keep the in-memory copy */
  }
  listeners.forEach((l) => l(slots));
};

export const useAppointmentSlots = () => {
  const [slots, setSlots] = useState<StoredSlot[]>(readSlots);

  useEffect(() => {
    const l = (s: StoredSlot[]) => setSlots(s);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const update = useCallback((next: StoredSlot[] | ((prev: StoredSlot[]) => StoredSlot[])) => {
    const value = typeof next === "function" ? (next as (p: StoredSlot[]) => StoredSlot[])(readSlots()) : next;
    writeSlots(value);
  }, []);

  return [slots, update] as const;
};

/** Slots dated today or later, earliest first, flattened per time. */
export const upcomingAppointments = (slots: StoredSlot[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return slots
    .filter((s) => {
      const d = new Date(s.date);
      return !isNaN(d.getTime()) && d.getTime() >= today.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
