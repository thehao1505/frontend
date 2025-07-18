"use client";

import { CreatePostCard } from "@/features/common/components/CreatePostCard";
import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { FeedCard } from "@/features/common/components/FeedCard";

export const DashboardCard = () => {
  const { currentUser } = useCurrentUser();

  return (
    <>
      <Navbar
        title={"For your page"}
        showOptionsButton={false}
        showBackButton={false}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          <CreatePostCard currentUser={currentUser} />
          <FeedCard currentUser={currentUser} />
        </div>
      </div>
    </>
  );
};
