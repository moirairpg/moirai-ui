import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type GameNotification = {
  notificationId: string;
  message: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type UseGameNotificationsWebSocketResult = {
  gameNotifications: GameNotification[];
};

export function useGameNotificationsWebSocket(adventureId: string): UseGameNotificationsWebSocketResult {
  const { subscribe, isConnected } = useWebSocket();
  const [gameNotifications, setGameNotifications] = useState<GameNotification[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const sub = subscribe(`/topic/notifications/game/${adventureId}`, (data: unknown) => {
      setGameNotifications((prev) => [...prev, data as GameNotification]);
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [isConnected, adventureId, subscribe]);

  return { gameNotifications };
}
