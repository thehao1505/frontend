/* eslint-disable react-hooks/exhaustive-deps */
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

  const fetchPosts = async (page: number, limit: number) => {
    if (!hasMore || !currentUser?._id) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.get(
        `${config.url}/api/v1/posts?page=${page}&limit=${limit}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    fetchPosts(page, 2);
  }, [currentUser?._id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
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
    <>
      {posts.map((post, index) => (
        <PostCard key={index} post={post} currentUser={currentUser?._id || null} />
      ))}
      {hasMore && (
        <div ref={loader}>
          <span className="text-sm text-white animate-pulse">Loading...</span>
        </div>
      )}
    </>
  );
};
