import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.EXPO_PUBLIC_API_URL;

interface WebSocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

type WebSocketProviderProps = {
  children: ReactNode;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  const sendMessage = useCallback(
    (event: string, data?: any) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(event, data);
      } else {
        console.warn("WebSocket is not connected. Message not sent.");
      }
    },
    [isConnected]
  );

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, isConnected, sendMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
