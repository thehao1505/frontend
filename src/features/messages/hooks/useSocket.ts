/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketProps {
  token: string;
  currentUserId: string | null;
  onMessage?: (message: any) => void;
}

export const useSocket = ({ token, currentUserId, onMessage }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on("connect", () => {
      console.log(`🟢 Connected to WebSocket server`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from WebSocket server");
    });

    socket.on("newMessage", (message) => {
      console.log("📩 New message received:", message);
      onMessage?.(message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token, currentUserId, onMessage]);

  return socketRef;
};
