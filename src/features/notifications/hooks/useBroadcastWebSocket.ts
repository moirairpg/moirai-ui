import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type BroadcastNotification = {
  publicId: string;
  message: string;
  level: string;
  status: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  creationDate: string;
};

type UseBroadcastWebSocketResult = {
  broadcasts: BroadcastNotification[];
};

const merge = (prev: BroadcastNotification[], incoming: BroadcastNotification[]) => {
  const existingIds = new Set(prev.map((n) => n.publicId));
  return [...prev, ...incoming.filter((n) => !existingIds.has(n.publicId))];
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

  useEffect(() => {
    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent<{ publicId: string }>).detail;
      if (!detail?.publicId) return;
      setBroadcasts((prev) => prev.filter((b) => b.publicId !== detail.publicId));
    };
    window.addEventListener('notification-deleted', onDeleted);
    return () => window.removeEventListener('notification-deleted', onDeleted);
  }, []);

  return { broadcasts };
}
