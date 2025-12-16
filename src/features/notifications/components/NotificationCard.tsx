"use client";

import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { parseCookies } from "nookies";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Notification } from "@/features/types";
import { NotificationLabel } from "./NotificationLabel";

export const NotificationCard = () => {
  const token = parseCookies().token;
  const { currentUser } = useCurrentUser();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleIncomingNotification = useCallback(
    (notification: Notification) => {
      console.log("🔔 New notification from socket:", notification);
      setNotifications((prev) => {
        // Prevent duplicate notifications
        const isDuplicate = prev.some((noti) => noti._id === notification._id);
        if (isDuplicate) {
          console.log("⚠️ Duplicate notification prevented:", notification._id);
          return prev;
        }
        return [notification, ...prev];
      });
    },
    []
  );

  // Set current user ID when currentUser changes
  useEffect(() => {
    setCurrentUserId(currentUser?._id || null);
  }, [currentUser?._id]);

  useNotificationSocket({
    token,
    currentUserId,
    onNotification: handleIncomingNotification,
  });

  const fetchNotifications = useCallback(async (page: number) => {
    console.log(`fetchNotifications`);
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/notifications?page=${page}&limit=10`
      );
      return res.data || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }, []);

  const loadInitialNotifications = useCallback(async () => {
    if (!currentUserId) return;
    setIsInitialLoading(true);
    setPage(1);
    setHasMore(true);

    const initialNotifications = await fetchNotifications(1);
    if (initialNotifications.length === 0) {
      setHasMore(false);
      setNotifications([]);
    } else {
      setNotifications(initialNotifications);
      setPage(2);
    }

    setIsInitialLoading(false);
  }, [fetchNotifications, currentUserId]);

  const loadOlderNotifications = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const olderNotifications = await fetchNotifications(page);
    if (olderNotifications.length === 0) {
      setHasMore(false);
    } else {
      setNotifications((prev) => [...prev, ...olderNotifications]);
      setPage((prev) => prev + 1);
    }

    setIsLoadingMore(false);
  }, [fetchNotifications, page, isLoadingMore, hasMore]);

  // Load initial notifications when user changes
  useEffect(() => {
    if (currentUserId) {
      loadInitialNotifications();
    }
  }, [currentUserId, loadInitialNotifications]);

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
  }, [hasMore, isLoadingMore, loadOlderNotifications]);

  return (
    <>
      <Navbar
        title={"Activities"}
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full pt-6 overflow-y-auto">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No notifications!</p>
            </div>
          ) : (
            <>
              {notifications.map((noti) => (
                <NotificationLabel key={noti._id} notification={noti} />
              ))}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <p className="text-muted-foreground">Loading more...</p>
                </div>
              )}
              <div ref={observerRef} className="h-1" />
            </>
          )}
        </div>
      </div>
    </>
  );
};
