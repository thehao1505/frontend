import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Notification } from "@/features/types";
import { config } from "@/lib/utils";

interface UseNotificationSocketProps {
  token: string;
  currentUserId: string | null;
  onNotification?: (notification: Notification) => void;
}

export function useNotificationSocket({
  token,
  currentUserId,
  onNotification,
}: UseNotificationSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !currentUserId) return;

    const socket = io(config.url, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`🟢 Connected to WebSocket server`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from WebSocket server");
    });

    socket.on("new-notification", (notification: Notification) => {
      console.log("📨 Received notification via WebSocket:", notification);
      onNotification?.(notification);
    });

    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, currentUserId, onNotification]);

  return socketRef;
}
