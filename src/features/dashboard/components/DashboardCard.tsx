"use client";

import { CreatePostCard } from "@/features/common/components/CreatePostCard";
import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { FeedCard } from "@/features/common/components/FeedCard";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const DashboardCard = () => {
  const { currentUser } = useCurrentUser();
  const [feedType, setFeedType] = useState<"forYou" | "following">("forYou");

  const feedTypeLabels = {
    forYou: "For You",
    following: "Following",
  };

  return (
    <>
      <Navbar
        title={
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:opacity-80 transition-opacity text-white font-semibold">
              <span>{feedTypeLabels[feedType]}</span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-800 border-neutral-700">
              <DropdownMenuItem
                className="text-white hover:bg-neutral-700 cursor-pointer"
                onClick={() => setFeedType("forYou")}
              >
                For You
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-neutral-700 cursor-pointer"
                onClick={() => setFeedType("following")}
              >
                Following
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        showOptionsButton={false}
        showBackButton={false}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          <CreatePostCard currentUser={currentUser} />
          <FeedCard currentUser={currentUser} feedType={feedType} />
        </div>
      </div>
    </>
  );
};
