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
        `${config.url}/api/v1/posts?page=${pageNum}&limit=${limit}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        if (pageNum === 1) {
          // Nếu là page đầu tiên, thay thế toàn bộ posts
          setPosts(response.data);
        } else {
          // Nếu là page tiếp theo, append vào posts hiện tại
          setPosts((prev) => [...prev, ...response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setIsLoading(false); // Đã sửa: từ true thành false
    }
  };

  // Fetch posts khi component mount hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser?._id) {
      setPosts([]); // Reset posts
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      fetchPosts(1, 2);
    }
  }, [currentUser?._id]);

  // Fetch posts khi page thay đổi (không phải page 1)
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, 2);
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
    <div
      className="flex-1 custom-messages-scroll-overlay"
    >
      {posts.map((post, index) => (
        <PostCard key={`${post._id}-${index}`} post={post} currentUser={currentUser?._id || null} />
      ))}
      {hasMore && (
        <div ref={loader}>
          <span className="text-sm text-neutral-800 animate-pulse">Loading...</span>
        </div>
      )}
    </div>
  );
};