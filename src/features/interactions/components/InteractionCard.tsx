"use client";

import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Interaction, InteractionsResponse } from "@/features/types";
import { InteractionItem } from "./InteractionItem";

export const InteractionCard = () => {
  const { currentUser } = useCurrentUser();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchInteractions = useCallback(async (pageNum: number) => {
    try {
      const res = await axiosInstance.get<InteractionsResponse>(
        `${config.url}/api/v1/users/interactions/list?page=${pageNum}&limit=10`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching interactions:", error);
      return { total: 0, interactions: [] };
    }
  }, []);

  const loadInitialInteractions = useCallback(async () => {
    if (!currentUser?._id) return;
    setIsInitialLoading(true);
    setPage(1);
    setHasMore(true);

    const data = await fetchInteractions(1);
    if (data.interactions.length === 0) {
      setHasMore(false);
      setInteractions([]);
      setTotal(0);
    } else {
      setInteractions(data.interactions);
      setTotal(data.total);
      setPage(2);
      setHasMore(data.interactions.length < data.total);
    }

    setIsInitialLoading(false);
  }, [fetchInteractions, currentUser?._id]);

  const loadOlderInteractions = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const data = await fetchInteractions(page);
    if (data.interactions.length === 0) {
      setHasMore(false);
    } else {
      setInteractions((prev) => [...prev, ...data.interactions]);
      setPage((prev) => prev + 1);
      setHasMore(interactions.length + data.interactions.length < data.total);
    }

    setIsLoadingMore(false);
  }, [fetchInteractions, page, isLoadingMore, hasMore, interactions.length]);

  // Load initial interactions when user changes
  useEffect(() => {
    if (currentUser?._id) {
      loadInitialInteractions();
    }
  }, [currentUser?._id, loadInitialInteractions]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadOlderInteractions();
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
  }, [hasMore, isLoadingMore, loadOlderInteractions]);

  return (
    <>
      <Navbar
        title={"User Interactions"}
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          {total > 0 && (
            <div className="px-6 py-4 border-b border-neutral-800">
              <p className="text-sm text-muted-foreground">
                Total: {total} interactions
              </p>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Loading interactions...</p>
              </div>
            ) : interactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">No interactions found!</p>
              </div>
            ) : (
              <>
                {interactions.map((interaction) => (
                  <InteractionItem
                    key={interaction._id}
                    interaction={interaction}
                  />
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
      </div>
    </>
  );
};
