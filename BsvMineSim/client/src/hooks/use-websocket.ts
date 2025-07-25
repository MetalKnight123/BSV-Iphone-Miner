import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  retryCount: number;
  lastConnected: Date | null;
}

export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    retryCount: 0,
    lastConnected: null,
  });
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const maxRetries = 5;
  const baseRetryDelay = 1000; // 1 second

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState(prev => ({ ...prev, status: 'connecting' }));

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState({
          status: 'connected',
          retryCount: 0,
          lastConnected: new Date(),
        });
        
        // Send ping to maintain connection
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type === 'pong') {
            // Connection is alive, schedule next ping
            setTimeout(() => {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
              }
            }, 30000); // Ping every 30 seconds
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
        
        // Attempt reconnection with exponential backoff
        if (connectionState.retryCount < maxRetries) {
          const delay = baseRetryDelay * Math.pow(2, connectionState.retryCount);
          console.log(`Reconnecting in ${delay}ms (attempt ${connectionState.retryCount + 1}/${maxRetries})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionState(prev => ({ 
              ...prev, 
              retryCount: prev.retryCount + 1 
            }));
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
          toast({
            title: "Connection Lost",
            description: "Unable to reconnect to mining pool. Please refresh the page.",
            variant: "destructive",
          });
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState(prev => ({ ...prev, status: 'error' }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState(prev => ({ ...prev, status: 'error' }));
    }
  }, [connectionState.retryCount, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionState({
      status: 'disconnected',
      retryCount: 0,
      lastConnected: null,
    });
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  // Handle visibility change - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionState.status !== 'connected') {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connectionState.status, connect]);

  return {
    connectionStatus: connectionState.status,
    isConnected: connectionState.status === 'connected',
    lastMessage,
    retryCount: connectionState.retryCount,
    lastConnected: connectionState.lastConnected,
    sendMessage,
    connect,
    disconnect,
  };
}
