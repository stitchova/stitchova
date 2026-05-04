import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";

export interface WorkshopMember {
  id: string;            // "designer" or worker id
  name: string;
  role: string;          // e.g. "Designer", "Tailor"
  initials: string;
  isDesigner?: boolean;
}

export interface WorkshopMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: number;          // epoch ms
  isAnnouncement?: boolean;
}

interface WorkshopState {
  members: WorkshopMember[];
  messages: WorkshopMessage[];
  pinnedAnnouncementId: string | null;
  currentUserId: string;
}

interface WorkshopChatContextType extends WorkshopState {
  setCurrentUserId: (id: string) => void;
  addMember: (m: Omit<WorkshopMember, "isDesigner">) => void;
  removeMember: (id: string) => void;
  sendMessage: (chatId: string, text: string, opts?: { isAnnouncement?: boolean }) => void;
  pinAnnouncement: (id: string | null) => void;
  getChatMessages: (chatId: string) => WorkshopMessage[];
  getMember: (id: string) => WorkshopMember | undefined;
  dmChatId: (a: string, b: string) => string;
  unreadCountForChat: (chatId: string) => number;
  markChatRead: (chatId: string) => void;
}

const STORAGE_KEY = "fashionos-workshop-chat-v1";

const defaultDesigner: WorkshopMember = {
  id: "designer",
  name: "Justice Ansah",
  role: "Designer",
  initials: "JA",
  isDesigner: true,
};

const defaultWorkers: WorkshopMember[] = [
  { id: "w-kwame", name: "Kwame Asante", role: "Tailor", initials: "KA" },
  { id: "w-esi",   name: "Esi Darkwa",   role: "Beader", initials: "ED" },
  { id: "w-tunde", name: "Tunde A.",     role: "Tailor", initials: "TA" },
];

const seedMessages = (): WorkshopMessage[] => {
  const now = Date.now();
  return [
    { id: "m1", chatId: "group", senderId: "designer", text: "Welcome to the workshop chat 👋", time: now - 3600_000 * 5 },
    { id: "m2", chatId: "group", senderId: "designer", text: "All outfits must be ready by Friday.", time: now - 3600_000 * 2, isAnnouncement: true },
    { id: "m3", chatId: "group", senderId: "w-kwame", text: "Noted, chief. On it.", time: now - 3600_000 },
    { id: "m4", chatId: "dm:designer:w-kwame", senderId: "designer", text: "Please double-check Mrs. Adebayo's hem.", time: now - 1800_000 },
    { id: "m5", chatId: "dm:w-kwame:w-esi", senderId: "w-kwame", text: "Can you help bead the bridal bodice tomorrow?", time: now - 900_000 },
  ];
};

const loadState = (): WorkshopState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    members: [defaultDesigner, ...defaultWorkers],
    messages: seedMessages(),
    pinnedAnnouncementId: "m2",
    currentUserId: "designer",
  };
};

const WorkshopChatContext = createContext<WorkshopChatContextType | null>(null);

export const WorkshopChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WorkshopState>(loadState);
  const [readMarkers, setReadMarkers] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY + ":read") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + ":read", JSON.stringify(readMarkers));
  }, [readMarkers]);

  const setCurrentUserId = useCallback((id: string) => {
    setState((s) => ({ ...s, currentUserId: id }));
  }, []);

  const addMember = useCallback((m: Omit<WorkshopMember, "isDesigner">) => {
    setState((s) => {
      if (s.members.some((x) => x.id === m.id)) return s;
      return { ...s, members: [...s.members, m] };
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id || m.isDesigner),
    }));
  }, []);

  const dmChatId = useCallback((a: string, b: string) => {
    if (a === "designer" || b === "designer") {
      const other = a === "designer" ? b : a;
      return `dm:designer:${other}`;
    }
    const [x, y] = [a, b].sort();
    return `dm:${x}:${y}`;
  }, []);

  const sendMessage = useCallback((chatId: string, text: string, opts?: { isAnnouncement?: boolean }) => {
    if (!text.trim()) return;
    setState((s) => {
      const msg: WorkshopMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        chatId,
        senderId: s.currentUserId,
        text: text.trim(),
        time: Date.now(),
        isAnnouncement: opts?.isAnnouncement,
      };
      return {
        ...s,
        messages: [...s.messages, msg],
        pinnedAnnouncementId: opts?.isAnnouncement ? msg.id : s.pinnedAnnouncementId,
      };
    });
  }, []);

  const pinAnnouncement = useCallback((id: string | null) => {
    setState((s) => ({ ...s, pinnedAnnouncementId: id }));
  }, []);

  const getChatMessages = useCallback(
    (chatId: string) => state.messages.filter((m) => m.chatId === chatId).sort((a, b) => a.time - b.time),
    [state.messages]
  );

  const getMember = useCallback(
    (id: string) => state.members.find((m) => m.id === id),
    [state.members]
  );

  const unreadCountForChat = useCallback(
    (chatId: string) => {
      const last = readMarkers[`${state.currentUserId}:${chatId}`] || 0;
      return state.messages.filter(
        (m) => m.chatId === chatId && m.senderId !== state.currentUserId && m.time > last
      ).length;
    },
    [readMarkers, state.messages, state.currentUserId]
  );

  const markChatRead = useCallback(
    (chatId: string) => {
      setReadMarkers((r) => ({ ...r, [`${state.currentUserId}:${chatId}`]: Date.now() }));
    },
    [state.currentUserId]
  );

  const value = useMemo<WorkshopChatContextType>(
    () => ({
      ...state,
      setCurrentUserId,
      addMember,
      removeMember,
      sendMessage,
      pinAnnouncement,
      getChatMessages,
      getMember,
      dmChatId,
      unreadCountForChat,
      markChatRead,
    }),
    [state, setCurrentUserId, addMember, removeMember, sendMessage, pinAnnouncement, getChatMessages, getMember, dmChatId, unreadCountForChat, markChatRead]
  );

  return <WorkshopChatContext.Provider value={value}>{children}</WorkshopChatContext.Provider>;
};

export const useWorkshopChat = () => {
  const ctx = useContext(WorkshopChatContext);
  if (!ctx) throw new Error("useWorkshopChat must be used within WorkshopChatProvider");
  return ctx;
};