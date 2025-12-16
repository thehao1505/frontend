"use client";

import { Post, User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { PostCard } from "./PostCard";

export const FeedCard = ({ currentUser }: { currentUser: User | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loader = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async (pageNum: number, limit: number) => {
    if (!hasMore || !currentUser?._id || isLoading) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.get(
        `${config.url}/api/v1/recommendations/hybrid?page=${pageNum}&limit=${limit}`
      );

      if (response.data.items.length === 0) {
        setHasMore(false);
      } else {
        if (pageNum === 1) {
          setPosts(response.data.items);
        } else {
          setPosts((prev) => [...prev, ...response.data.items]);
        }
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1, 10);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, 10);
    }
  }, [page]);

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
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading]);

  return (
    <div className="flex-1 custom-messages-scroll-overlay">
      {posts.map((post, index) => (
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
