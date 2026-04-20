import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type SystemNotification = {
  notificationId: string;
  message: string;
  level: string;
  status: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type UseSystemNotificationsWebSocketResult = {
  systemNotifications: SystemNotification[];
};

const merge = (prev: SystemNotification[], incoming: SystemNotification[]) => {
  const existingIds = new Set(prev.map((n) => n.notificationId));
  return [...prev, ...incoming.filter((n) => !existingIds.has(n.notificationId))];
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

  return { systemNotifications };
}
