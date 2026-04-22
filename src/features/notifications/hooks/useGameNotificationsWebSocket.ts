import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type GameNotification = {
  publicId: string;
  message: string;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  creationDate: string;
};

type UseGameNotificationsWebSocketResult = {
  latestGameNotification: GameNotification | null;
};

export function useGameNotificationsWebSocket(adventureId: string): UseGameNotificationsWebSocketResult {
  const { subscribe, isConnected } = useWebSocket();
  const [latestGameNotification, setLatestGameNotification] = useState<GameNotification | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const sub = subscribe(`/topic/notifications/game/${adventureId}`, (data: unknown) => {
      setLatestGameNotification(data as GameNotification);
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [isConnected, adventureId, subscribe]);

  return { latestGameNotification };
}
