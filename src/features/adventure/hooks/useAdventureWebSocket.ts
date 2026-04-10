import { useEffect, useRef, useCallback, useState } from 'react';

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
  const wsRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<MessageResult | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/adventure/${adventureId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const parsed: MessageResult = JSON.parse(event.data);
      setLastMessage(parsed);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [adventureId]);

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(JSON.stringify({ content }));
  }, []);

  return { sendMessage, lastMessage };
}
