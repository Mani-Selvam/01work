import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  subscribe: (handler: MessageHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const subscribersRef = useRef<Set<MessageHandler>>(new Set());

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        subscribersRef.current.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('Error in WebSocket message handler:', error);
          }
        });
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  const subscribe = useCallback((handler: MessageHandler) => {
    subscribersRef.current.add(handler);
    
    return () => {
      subscribersRef.current.delete(handler);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ lastMessage, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(handler?: MessageHandler) {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  useEffect(() => {
    if (handler) {
      return context.subscribe(handler);
    }
  }, [handler, context]);

  return context;
}
