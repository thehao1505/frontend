"use client";

import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { parseCookies } from "nookies";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Notification } from "@/features/types";

export const NotificationCard = () => {
  const token = parseCookies().token;
  const { currentUser } = useCurrentUser();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleIncomingNotification = useCallback(
    (notification: Notification) => {
      console.log("🔔 New notification from socket:", notification);
      setNotifications((prev) => [notification, ...prev]);
    },
    []
  );

  useEffect(() => {
    setCurrentUserId(currentUser?._id || null);
  }, [currentUser]);

  useNotificationSocket({
    token,
    currentUserId,
    onNotification: handleIncomingNotification,
  });

  const fetchNotifications = useCallback(async (page: number) => {
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/notifications?page=${page}&limit=10`
      );
      return res.data || [];
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadOlderNotifications = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const olderNotifications = await fetchNotifications(page);
    if (olderNotifications.length === 0) {
      setHasMore(false);
    } else {
      setNotifications((prev) => [...prev, ...olderNotifications]);
      setPage((prev) => prev + 1);
    }

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 0);
  };

  useEffect(() => {
    loadOlderNotifications();
  }, []);

  useEffect(() => {
    setCurrentUserId(currentUser?._id || null);
  }, [currentUser?._id]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadOlderNotifications();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore]);

  return (
    <>
      <Navbar
        title={"Activities"}
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full pt-6">
          <div className="text-white">{notifications[0]?._id || "a"}</div>
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No notifications!</p>
            </div>
          )}
          {notifications.length > 0 && (
            <div ref={observerRef} className="h-1"></div>
          )}
        </div>
      </div>
    </>
  );
};
