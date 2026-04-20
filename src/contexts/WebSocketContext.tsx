import { Client, StompSubscription } from '@stomp/stompjs';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type StompContextType = {
  subscribe: (destination: string, callback: (data: unknown) => void) => StompSubscription | null;
  publish: (destination: string, body: string) => void;
  isConnected: boolean;
};

const WebSocketContext = createContext<StompContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

const buildWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

const useWebSocketProviderState = (): StompContextType => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new Client({
      brokerURL: buildWebSocketUrl(),
      reconnectDelay: 3000,
      onConnect: () => setIsConnected(true),
      onWebSocketClose: () => setIsConnected(false),
      onStompError: (frame) => console.error('STOMP error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  const subscribe = useCallback((destination: string, callback: (data: unknown) => void) => {
    const client = clientRef.current;
    if (!client || !client.connected) return null;
    return client.subscribe(destination, (message) => {
      try {
        callback(JSON.parse(message.body));
      } catch {
        callback(message.body);
      }
    });
  }, []);

  const publish = useCallback((destination: string, body: string) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({ destination, body });
    } else {
      console.warn('STOMP client not connected');
    }
  }, []);

  return useMemo(() => ({ subscribe, publish, isConnected }), [subscribe, publish, isConnected]);
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const state = useWebSocketProviderState();
  return (
    <WebSocketContext.Provider value={state}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
