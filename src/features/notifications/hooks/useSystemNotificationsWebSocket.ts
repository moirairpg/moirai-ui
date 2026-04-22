import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type SystemNotification = {
  publicId: string;
  message: string;
  level: string;
  status: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  creationDate: string;
};

type UseSystemNotificationsWebSocketResult = {
  systemNotifications: SystemNotification[];
};

const merge = (prev: SystemNotification[], incoming: SystemNotification[]) => {
  const existingIds = new Set(prev.map((n) => n.publicId));
  return [...prev, ...incoming.filter((n) => !existingIds.has(n.publicId))];
};

export function useSystemNotificationsWebSocket(): UseSystemNotificationsWebSocketResult {
  const { subscribe, isConnected } = useWebSocket();
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const subs = [
      subscribe('/app/notifications/system', (data: unknown) => {
        setSystemNotifications((prev) => merge(prev, data as SystemNotification[]));
      }),
      subscribe('/user/queue/notifications/system', (data: unknown) => {
        setSystemNotifications((prev) => merge(prev, [data as SystemNotification]));
      }),
    ];

    return () => {
      subs.forEach((sub) => sub?.unsubscribe());
    };
  }, [isConnected, subscribe]);

  useEffect(() => {
    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent<{ publicId: string }>).detail;
      if (!detail?.publicId) return;
      setSystemNotifications((prev) => prev.filter((n) => n.publicId !== detail.publicId));
    };
    window.addEventListener('notification-deleted', onDeleted);
    return () => window.removeEventListener('notification-deleted', onDeleted);
  }, []);

  return { systemNotifications };
}
