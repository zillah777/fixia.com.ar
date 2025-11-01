import { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

/**
 * Custom hook for managing WebSocket connections to notification gateway
 * Provides real-time notification delivery with automatic reconnection
 *
 * Features:
 * - Automatic JWT token authentication
 * - Connection state tracking
 * - Event subscription management
 * - Automatic reconnection with exponential backoff
 * - Fallback polling support
 *
 * Usage:
 * const { socket, isConnected } = useWebSocket();
 *
 * socket?.on('notification:new', (data) => {
 *   console.log('New notification:', data.notification);
 * });
 */

interface UseWebSocketOptions {
  enabled?: boolean;
  reconnectionDelay?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketStatus {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnectionTime: Date | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketStatus {
  const {
    enabled = true,
    reconnectionDelay = 1000,
    maxReconnectAttempts = 10,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnectionTime: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get JWT token from localStorage or cookies
   */
  const getAuthToken = useCallback((): string | null => {
    try {
      // Try to get from httpOnly cookie via API header
      // For client-side socket auth, we need the token in memory or sessionStorage
      const token =
        localStorage.getItem('fixia_access_token') ||
        sessionStorage.getItem('fixia_access_token');

      return token;
    } catch (error) {
      console.warn('Failed to retrieve auth token:', error);
      return null;
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  const initializeSocket = useCallback(() => {
    if (!enabled || socketRef.current?.connected) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      console.warn('⚠️ WebSocket: No authentication token available');
      setStatus((prev) => ({
        ...prev,
        error: 'Authentication token not found',
        isConnecting: false,
      }));
      return;
    }

    setStatus((prev) => ({ ...prev, isConnecting: true }));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.fixia.app';

      const newSocket = io(`${apiUrl}/notifications`, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: Math.min(
          reconnectionDelay * Math.pow(2, reconnectAttemptsRef.current),
          30000 // Max 30 seconds between attempts
        ),
        reconnectionDelayMax: 30000,
        reconnectionAttempts: maxReconnectAttempts,
        transports: ['websocket', 'polling'],
      });

      // Connection successful
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected:', newSocket.id);
        socketRef.current = newSocket;
        reconnectAttemptsRef.current = 0;

        setStatus((prev) => ({
          ...prev,
          socket: newSocket,
          isConnected: true,
          isConnecting: false,
          error: null,
          lastConnectionTime: new Date(),
        }));

        // Request sync of notifications
        newSocket.emit('notification:sync-request', {
          lastSyncTime: localStorage.getItem('fixia_last_notification_sync'),
        });
      });

      // Connection confirmation from server
      newSocket.on('connection-confirmed', (data) => {
        console.log('✅ Connection confirmed by server:', data);
      });

      // Handle connection errors
      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error.message);
        reconnectAttemptsRef.current++;

        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error.message,
        }));
      });

      // Handle disconnect
      newSocket.on('disconnect', (reason) => {
        console.log('👋 WebSocket disconnected:', reason);
        socketRef.current = null;

        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
      });

      // Handle errors
      newSocket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        setStatus((prev) => ({
          ...prev,
          error: typeof error === 'string' ? error : 'Unknown WebSocket error',
        }));
      });

      // Keep-alive ping-pong
      const pingInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping', { timestamp: new Date().toISOString() });
        }
      }, 30000); // Ping every 30 seconds

      // Cleanup ping interval on disconnect
      newSocket.on('disconnect', () => {
        clearInterval(pingInterval);
      });
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      setStatus((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to initialize WebSocket',
      }));
    }
  }, [enabled, getAuthToken, reconnectionDelay, maxReconnectAttempts]);

  /**
   * Effect: Initialize socket on mount and when token becomes available
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Small delay to ensure auth token is loaded
    const initTimeout = setTimeout(() => {
      initializeSocket();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
    };
  }, [enabled, initializeSocket]);

  /**
   * Effect: Handle token changes (e.g., after login)
   */
  useEffect(() => {
    const handleStorageChange = () => {
      // Token changed - reconnect with new token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      initializeSocket();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeSocket]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return status;
}

/**
 * Hook for listening to specific WebSocket events
 * Automatically handles subscription and cleanup
 */
export function useWebSocketEvent<T = any>(
  socket: Socket | null,
  eventName: string,
  callback: (data: T) => void
): void {
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
}

/**
 * Hook for emitting WebSocket events
 */
export function useWebSocketEmit(socket: Socket | null) {
  return useCallback(
    (eventName: string, data?: any) => {
      if (!socket?.connected) {
        console.warn(`⚠️ Cannot emit event "${eventName}" - WebSocket not connected`);
        return;
      }

      socket.emit(eventName, data);
    },
    [socket]
  );
}
