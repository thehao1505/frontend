"use client";

import { PostCard } from "@/features/common/components/PostCard";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { Post } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserSearchCard } from "./UserSearchCard";

interface SearchUser {
  _id: string;
  username: string;
  avatar: string;
  fullName?: string;
}

interface SearchResponse {
  similarPosts: Post[];
  users: SearchUser[];
}

export const SearchCard = () => {
  const { currentUser } = useCurrentUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [content, setContent] = useState<string>("");
  const [hasResult, setHasResult] = useState<string>("");
  const [showBackButton, setShowBackButton] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");

  // Pagination states for posts
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [postsIsLoading, setPostsIsLoading] = useState(false);

  // Pagination states for users
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasMore, setUsersHasMore] = useState(true);
  const [usersIsLoading, setUsersIsLoading] = useState(false);

  const postsLoader = useRef<HTMLDivElement | null>(null);
  const usersLoader = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async (pageNum: number, isInitial: boolean = false) => {
    if (!hasResult || postsIsLoading || (!postsHasMore && !isInitial)) return;

    setPostsIsLoading(true);
    try {
      const res = await axiosInstance.get<SearchResponse>(
        `${config.url}/api/v1/recommendations/search?page=${pageNum}&limit=10&text=${hasResult}`
      );
      const newPosts = res.data.similarPosts || [];

      if (newPosts.length === 0) {
        setPostsHasMore(false);
      } else {
        if (isInitial || pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => {
            // Filter out duplicates based on _id
            const existingIds = new Set(prev.map((p) => p._id));
            const uniqueNewPosts = newPosts.filter(
              (p) => !existingIds.has(p._id)
            );
            return [...prev, ...uniqueNewPosts];
          });
          // If no new unique posts, we've reached the end
          if (newPosts.length < 10) {
            setPostsHasMore(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPostsIsLoading(false);
    }
  };

  const fetchUsers = async (pageNum: number, isInitial: boolean = false) => {
    if (!hasResult || usersIsLoading || (!usersHasMore && !isInitial)) return;

    setUsersIsLoading(true);
    try {
      const res = await axiosInstance.get<SearchResponse>(
        `${config.url}/api/v1/recommendations/search?page=${pageNum}&limit=10&text=${hasResult}`
      );
      const newUsers = res.data.users || [];

      if (newUsers.length === 0) {
        setUsersHasMore(false);
      } else {
        if (isInitial || pageNum === 1) {
          setUsers(newUsers);
        } else {
          setUsers((prev) => {
            // Filter out duplicates based on _id
            const existingIds = new Set(prev.map((u) => u._id));
            const uniqueNewUsers = newUsers.filter(
              (u) => !existingIds.has(u._id)
            );
            return [...prev, ...uniqueNewUsers];
          });
          // If no new unique users, we've reached the end
          if (newUsers.length < 10) {
            setUsersHasMore(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUsersIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      // Reset pagination states
      setPostsPage(1);
      setUsersPage(1);
      setPostsHasMore(true);
      setUsersHasMore(true);
      setPosts([]);
      setUsers([]);

      // Fetch initial data
      const res = await axiosInstance.get<SearchResponse>(
        `${config.url}/api/v1/recommendations/search?page=1&limit=10&text=${content}`
      );
      setPosts(res.data.similarPosts || []);
      setUsers(res.data.users || []);
      setShowBackButton(true);
      setHasResult(content);

      // Set hasMore based on initial response
      if ((res.data.similarPosts || []).length < 10) {
        setPostsHasMore(false);
      }
      if ((res.data.users || []).length < 10) {
        setUsersHasMore(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickBack = () => {
    setPosts([]);
    setUsers([]);
    setShowBackButton(false);
    setHasResult("");
    setActiveTab("posts");
    setPostsPage(1);
    setUsersPage(1);
    setPostsHasMore(true);
    setUsersHasMore(true);
  };

  // Load more posts when page changes
  useEffect(() => {
    if (postsPage > 1 && hasResult) {
      fetchPosts(postsPage, false);
    }
  }, [postsPage]);

  // Load more users when page changes
  useEffect(() => {
    if (usersPage > 1 && hasResult) {
      fetchUsers(usersPage, false);
    }
  }, [usersPage]);

  // Intersection Observer for posts infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          postsHasMore &&
          !postsIsLoading &&
          activeTab === "posts" &&
          hasResult
        ) {
          setPostsPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = postsLoader.current;
    if (currentLoader && activeTab === "posts") {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [postsHasMore, postsIsLoading, activeTab, hasResult]);

  // Intersection Observer for users infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          usersHasMore &&
          !usersIsLoading &&
          activeTab === "users" &&
          hasResult
        ) {
          setUsersPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = usersLoader.current;
    if (currentLoader && activeTab === "users") {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [usersHasMore, usersIsLoading, activeTab, hasResult]);

  const hasResults = posts.length > 0 || users.length > 0;

  return (
    <>
      <div className="flex items-center justify-center h-[60px] w-full">
        <div className="fixed top-0 flex flex-col w-[640px] z-50">
          <div className="h-[60px] flex items-center justify-between px-6">
            {showBackButton ? (
              <button
                onClick={handleClickBack}
                className="p-1 rounded-full bg-neutral-900 border-[1px] border-neutral-800 hover:scale-110 transition cursor-pointer"
              >
                <ArrowLeft size={15} color="white" />
              </button>
            ) : (
              <div className="w-[40px]" />
            )}

            <h1 className="text-white font-semibold text-md">
              {!hasResult ? "Search" : hasResult}
            </h1>

            <div className="w-[40px]" />
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          {!hasResults ? (
            <div className="w-full mx-auto px-6 pt-6 pb-4">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Search"
                className="w-full p-2 px-10 border rounded-xl border-neutral-700 bg-neutral-950 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              {content && (
                <div className="w-full mt-[-16px] pt-6 mx-auto bg-neutral-800 rounded-b-xl shadow-lg z-10">
                  <div
                    className="px-4 py-2 mt-[-16px] pt-4 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700 rounded-xl"
                    onClick={handleSend}
                  >
                    Press Enter to search "
                    <span className="text-white">{content}</span>"
                  </div>
                </div>
              )}
              {/* // TODO: User suggestion below search bar into this page. */}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-around w-full h-[49px]">
                <div
                  className={`flex items-center justify-center h-full w-full cursor-pointer border-b-[1px] ${
                    activeTab === "posts"
                      ? "border-white"
                      : "border-neutral-600"
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  <p
                    className={`text-sm font-semibold ${
                      activeTab === "posts" ? "text-white" : "text-neutral-600"
                    }`}
                  >
                    Similar Posts
                  </p>
                </div>

                <div
                  className={`flex items-center justify-center h-full w-full cursor-pointer border-b-[1px] ${
                    activeTab === "users"
                      ? "border-white"
                      : "border-neutral-600"
                  }`}
                  onClick={() => setActiveTab("users")}
                >
                  <p
                    className={`text-sm font-semibold ${
                      activeTab === "users" ? "text-white" : "text-neutral-600"
                    }`}
                  >
                    Users
                  </p>
                </div>
              </div>
              <div className="flex-1 custom-messages-scroll-overlay">
                {activeTab === "posts" && (
                  <>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        currentUser={currentUser}
                        post={post}
                      />
                    ))}
                    {postsHasMore && (
                      <div ref={postsLoader} className="py-4 text-center">
                        <span className="text-sm text-neutral-400 animate-pulse">
                          Loading...
                        </span>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "users" && (
                  <>
                    {users.map((user) => (
                      <UserSearchCard key={user._id} user={user} />
                    ))}
                    {usersHasMore && (
                      <div ref={usersLoader} className="py-4 text-center">
                        <span className="text-sm text-neutral-400 animate-pulse">
                          Loading...
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
