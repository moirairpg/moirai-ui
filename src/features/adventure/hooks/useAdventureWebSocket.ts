import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';

type MessageResult = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type UseAdventureWebSocketResult = {
  sendMessage: (content: string) => void;
  lastMessage: MessageResult | null;
};

export function useAdventureWebSocket(adventureId: string): UseAdventureWebSocketResult {
  const { subscribe, publish, isConnected } = useWebSocket();
  const [lastMessage, setLastMessage] = useState<MessageResult | null>(null);

  useEffect(() => {
    if (!isConnected) return;
    const subscription = subscribe(`/topic/adventure/${adventureId}`, (data: unknown) => {
      setLastMessage(data as MessageResult);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [adventureId, isConnected, subscribe]);

  const sendMessage = (content: string) => {
    publish(`/app/adventure/${adventureId}`, JSON.stringify({ content }));
  };

  return { sendMessage, lastMessage };
}
