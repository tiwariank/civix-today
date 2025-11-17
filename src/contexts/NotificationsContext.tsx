// import React, { createContext, useContext, useMemo, useState } from 'react';

// type Counts = { messages: number; mentions: number; notifications: number };

// type NotificationsContextType = {
//   counts: Counts;
//   setCounts: (c: Partial<Counts>) => void;
//   increment: (key: keyof Counts, by?: number) => void;
//   reset: (key: keyof Counts) => void;
// };

// const defaultCounts: Counts = { messages: 0, mentions: 0, notifications: 0 };
// export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// export const NotificationsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
//   const [counts, setCountsRaw] = useState<Counts>(defaultCounts);

//   const setCounts = (c: Partial<Counts>) => setCountsRaw((prev) => ({ ...prev, ...c }));
//   const increment = (key: keyof Counts, by = 1) => setCountsRaw((prev) => ({ ...prev, [key]: prev[key] + by }));
//   const reset = (key: keyof Counts) => setCountsRaw((prev) => ({ ...prev, [key]: 0 }));

//   const value = useMemo(() => ({ counts, setCounts, increment, reset }), [counts]);

//   return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
// };

// export const useNotifications = () => {
//   const ctx = useContext(NotificationsContext);
//   if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
//   return ctx;
// };

import React, { createContext, useContext, useMemo, useState } from 'react';

type Counts = { messages: number; mentions: number; notifications: number };

type NotificationsContextType = {
  counts: Counts;
  setCounts: (c: Partial<Counts>) => void;
  increment: (key: keyof Counts, by?: number) => void;
  reset: (key: keyof Counts) => void;
};

const defaultCounts: Counts = { messages: 0, mentions: 0, notifications: 0 };
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [counts, setCountsRaw] = useState<Counts>(defaultCounts);

  const setCounts = (c: Partial<Counts>) => setCountsRaw((prev) => ({ ...prev, ...c }));
  const increment = (key: keyof Counts, by = 1) => setCountsRaw((prev) => ({ ...prev, [key]: prev[key] + by }));
  const reset = (key: keyof Counts) => setCountsRaw((prev) => ({ ...prev, [key]: 0 }));

  const value = useMemo(() => ({ counts, setCounts, increment, reset }), [counts]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};