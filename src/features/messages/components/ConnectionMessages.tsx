/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { useParams } from "next/navigation";
import { parseCookies } from "nookies";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Navbar } from "@/features/common/components/Navbar";
import useUser from "@/features/common/hooks/useUser";
import TextareaAutosize from "react-textarea-autosize";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

interface Message {
  sender: {
    _id: string;
    avatar: string;
  };
  content: string;
}

export const ConnectionMessageCard = () => {
  const token = parseCookies().token;
  const { currentUser } = useCurrentUser();
  const { connectionUsername } = useParams();
  const { user } = useUser(connectionUsername as string);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleIncomingMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const socketRef = useSocket({ token, currentUserId, onMessage: handleIncomingMessage });

  useEffect(() => {
    setCurrentUserId(currentUser?._id || null);
  }, [currentUser]);

  const handleSend = () => {
    if (!content.trim()) return;
    const newMsg = {
      sender: { _id: currentUserId || "", avatar: currentUser?.avatar || "" },
      content,
    };
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        receiverId: user?._id,
        content,
      });
      setContent("");
    }
    setMessages((prev) => [...prev, newMsg]);
    setContent("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(
        `${config.url}/api/v1/message/conversation?connectionId=${user?._id}&page=${page}&limit=${limit}`
      );
      return res.data || [];
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (isLoadingMore || !hasMore || !user?._id || !currentUser?._id) return;
    setIsLoadingMore(true);

    const container = containerRef.current;
    const previousHeight = container?.scrollHeight ?? 0;

    const older = await fetchMessages(page, 10);
    if (older.length === 0) {
      setHasMore(false);
    } else {
      setMessages((prev) => [...prev, ...older]);
      setPage((prev) => prev + 1);
    }

    setTimeout(() => {
      const newHeight = container?.scrollHeight ?? 0;
      if (container) container.scrollTop = newHeight - previousHeight;
      setIsLoadingMore(false);
    }, 0);
  };

  useEffect(() => {
    loadOlderMessages();
  }, [user?._id, currentUser?._id]);

  useEffect(() => {
    if (!topObserverRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topEntry = entries[0];
        if (topEntry.isIntersecting && hasMore && !isLoadingMore) {
          loadOlderMessages();
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(topObserverRef.current);

    return () => {
      if (topObserverRef.current) observer.unobserve(topObserverRef.current);
    };
  }, [hasMore, isLoadingMore]);

  const [hasScrollbar, setHasScrollbar] = useState(false);

  useEffect(() => {
    const checkScrollbar = () => {
      if (containerRef.current) {
        const element = containerRef.current;
        const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
        setHasScrollbar(hasVerticalScrollbar);
      }
    };

    checkScrollbar();

    const timeoutId = setTimeout(checkScrollbar, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <>
      <Navbar title={user?.username || "Messages"} showOptionsButton={true} showBackButton={true} />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          <div
            ref={containerRef}
            className={`flex-1 overflow-y-auto p-4 space-y-2 custom-messages-scroll-overlay`}
          >
            <div ref={topObserverRef} />
            {isLoadingMore && (
              <p className="text-center text-neutral-400 text-sm">Loading more...</p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-row gap-x-2 ${
                  msg.sender._id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender._id !== currentUserId ? (
                  <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                    <AvatarImage src={msg.sender.avatar} alt="" className="object-cover" />
                  </Avatar>
                ) : (
                  <></>
                )}
                <div
                  className={`px-4 py-2 rounded-3xl max-w-[70%] h-auto break-words whitespace-pre-wrap ${
                    msg.sender._id === currentUserId
                      ? "bg-red-800 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-neutral-700 sticky bottom-0 w-full flex items-center">
            <TextareaAutosize
              className="flex-1 px-3 rounded-2xl resize-none border border-neutral-700 focus:outline-none focus:ring-0 p-2 mr-3 text-white placeholder:text-muted-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              minRows={1}
              maxRows={5}
            />
            <button
              onClick={handleSend}
              className="bg-red-800 text-white px-4 py-2 rounded-2xl cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
