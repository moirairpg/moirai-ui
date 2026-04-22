import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type NotificationPanelContextValue = {
  isPanelOpen: boolean;
  togglePanel: () => void;
};

const NotificationPanelContext = createContext<NotificationPanelContextValue | null>(null);

export function useNotificationPanel(): NotificationPanelContextValue {
  const ctx = useContext(NotificationPanelContext);
  if (!ctx) throw new Error('useNotificationPanel must be used within NotificationPanelProvider');
  return ctx;
}

type NotificationPanelProviderProps = {
  children: ReactNode;
};

export function NotificationPanelProvider({ children }: NotificationPanelProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = useCallback(() => setIsPanelOpen((prev) => !prev), []);

  const value = useMemo<NotificationPanelContextValue>(
    () => ({ isPanelOpen, togglePanel }),
    [isPanelOpen, togglePanel],
  );

  return <NotificationPanelContext.Provider value={value}>{children}</NotificationPanelContext.Provider>;
}
