"use client";

import { PostCard } from "@/features/common/components/PostCard";
import { Post, User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const UserReplyPost = ({ user }: { user: User | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loader = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async (pageNum: number) => {
    if (!hasMore || !user?._id || isLoading) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.get(
        `${config.url}/api/v1/posts?page=${pageNum}&limit=10&author=${user._id}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        if (pageNum === 1) {
          setPosts(response.data);
        } else {
          setPosts((prev) => [...prev, ...response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1);
    }
  }, [user?._id]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
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
          currentUser={user || null}
        />
      ))}
      {hasMore && (
        <div ref={loader}>
          <span className="text-sm text-neutral-800 animate-pulse">...</span>
        </div>
      )}
    </div>
  );
};
