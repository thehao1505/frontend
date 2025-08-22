"use client";

import { PostCard } from "@/features/common/components/PostCard";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { Post } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export const SearchCard = () => {
  const { currentUser } = useCurrentUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState<string>("");
  const [hasResult, setHasResult] = useState<string>("");
  const [showBackButton, setShowBackButton] = useState<boolean>(false);

  const handleSend = async () => {
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/recommendations/search?page=1&limit=10&text=${content}`
      );
      setPosts(res.data);
      setShowBackButton(true);
      setHasResult(content);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickBack = () => {
    setPosts([]);
    setShowBackButton(false);
    setHasResult("");
  };

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
          {posts.length === 0 ? (
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
              {/* // TODO: User suggestion below search bar. */}
            </div>
          ) : (
            <div className="pt-4 custom-messages-scroll-overlay">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  currentUser={currentUser}
                  post={post}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
