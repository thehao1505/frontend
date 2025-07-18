"use client";

import { Navbar } from "@/features/common/components/Navbar";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionCard } from "./ConnectionCard";
import { config } from "@/lib/utils";

export const MessageCard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connections, setConnections] = useState<User[]>([]);

  const [hasScrollbar, setHasScrollbar] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollbar = () => {
      if (scrollContainerRef.current) {
        const element = scrollContainerRef.current;
        const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
        setHasScrollbar(hasVerticalScrollbar);
      }
    };

    checkScrollbar();

    const timeoutId = setTimeout(checkScrollbar, 100);

    return () => clearTimeout(timeoutId);
  }, [connections, isLoading]);

  const fetchConnection = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${config.url}/api/v1/users/connection/user`);
      setConnections(res.data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar title="Messages" showOptionsButton={true} showBackButton={true} />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          <div className="w-full mx-auto px-6 pt-6 pb-4">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 px-10 border rounded-xl border-neutral-700 bg-neutral-950 text-white"
            />
          </div>
          <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto pl-4 py-4 space-y-2 custom-messages-scroll-overlay`}
          >
            {isLoading && <p className="text-sm text-white">Loading</p>}
            {connections.length === 0 && !isLoading ? (
              <p className="text-sm text-neutral-400 text-center">
                You don&apos;t have any connection now. <br /> You have to follow the others and get
                follow back to Chat.
              </p>
            ) : (
              connections.map((connection) => (
                <ConnectionCard key={connection._id} connection={connection} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
