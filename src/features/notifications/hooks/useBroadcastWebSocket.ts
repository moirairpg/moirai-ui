import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type BroadcastNotification = {
  notificationId: string;
  message: string;
  level: string;
  status: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type UseBroadcastWebSocketResult = {
  broadcasts: BroadcastNotification[];
};

const merge = (prev: BroadcastNotification[], incoming: BroadcastNotification[]) => {
  const existingIds = new Set(prev.map((n) => n.notificationId));
  return [...prev, ...incoming.filter((n) => !existingIds.has(n.notificationId))];
};

export function useBroadcastWebSocket(): UseBroadcastWebSocketResult {
  const { subscribe, isConnected } = useWebSocket();
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const subs = [
      subscribe('/app/notifications/broadcast', (data: unknown) => {
        setBroadcasts((prev) => merge(prev, data as BroadcastNotification[]));
      }),
      subscribe('/topic/notifications/broadcast', (data: unknown) => {
        setBroadcasts((prev) => merge(prev, [data as BroadcastNotification]));
      }),
    ];

    return () => {
      subs.forEach((sub) => sub?.unsubscribe());
    };
  }, [isConnected, subscribe]);

  return { broadcasts };
}
