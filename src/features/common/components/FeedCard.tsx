"use client";

import { Post, User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard } from "./PostCard";

export const FeedCard = ({
  currentUser,
  feedType = "forYou",
}: {
  currentUser: User | null;
  feedType?: "forYou" | "following";
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loader = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(
    async (pageNum: number, limit: number) => {
      if (!currentUser?._id) return;

      setIsLoading(true);

      try {
        let response;
        if (feedType === "following") {
          // Fetch posts from users I follow
          response = await axiosInstance.get(
            `${config.url}/api/v1/recommendations/following?page=${pageNum}&limit=${limit}`
          );
        } else {
          // Fetch recommended posts (For You)
          response = await axiosInstance.get(
            `${config.url}/api/v1/recommendations/hybrid?page=${pageNum}&limit=${limit}`
          );
        }

        const items =
          feedType === "following" ? response.data.items : response.data.items;

        if (items.length === 0) {
          setHasMore(false);
        } else {
          if (pageNum === 1) {
            setPosts(items);
          } else {
            setPosts((prev) => [...prev, ...items]);
          }
        }
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?._id, feedType]
  );

  useEffect(() => {
    if (currentUser?._id) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1, 20);
    }
  }, [currentUser?._id, feedType, fetchPosts]);

  useEffect(() => {
    if (page > 1 && currentUser?._id) {
      fetchPosts(page, 20);
    }
  }, [page, currentUser?._id, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading]);

  return (
    <div className="flex-1 custom-messages-scroll-overlay">
      {posts?.map((post, index) => (
        <PostCard
          key={`${post._id}-${index}`}
          post={post}
          currentUser={currentUser || null}
        />
      ))}
      {hasMore && (
        <div ref={loader}>
          <span className="text-sm text-neutral-800 animate-pulse">
            Loading...
          </span>
        </div>
      )}
    </div>
  );
};
