"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/features/common/components/Navbar";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import useUser from "@/features/common/hooks/useUser";
import axiosInstance from "@/lib/axios";
import { cn, config } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ChartNoAxesCombined, Instagram } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import EditProfileCard from "./EditProfileCard";
import { CreatePostCard } from "@/features/common/components/CreatePostCard";
import { UserPost } from "./UserPost";
import { UserReplyPost } from "./UserReplyPost";

export const ProfileCard = () => {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);

  const { user } = useUser(username.startsWith("@") ? username.slice(1) : "");
  const { currentUser } = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"thread" | "replies">("thread");
  const [followersCounts, setFollowersCounts] = useState<number>(0);
  const [isFollowed, setIsFollowed] = useState<boolean>(() => {
    if (!user?._id || !currentUser?._id) return false;
    return (
      user.followers.includes(currentUser._id) &&
      currentUser.followings.includes(user._id)
    );
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/users/username/${
          username.startsWith("@") ? username.slice(1) : ""
        }`
      );
      setFollowersCounts(res.data.followers.length);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, [username]);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollowed]);

  useEffect(() => {
    if (!user?._id || !currentUser?._id) return;
    setIsFollowed(
      user.followers.includes(currentUser._id) &&
        currentUser.followings.includes(user._id)
    );
  }, [user, currentUser]);

  const toggleFollow = () => {
    if (user?._id === currentUser?._id) return;

    startTransition(async () => {
      try {
        if (isFollowed) {
          await axiosInstance.post(
            `${config.url}/api/v1/users/unFollow/${user?._id}`
          );
          setFollowersCounts((prev) => prev - 1);
          setIsFollowed(false);
        } else {
          await axiosInstance.post(
            `${config.url}/api/v1/users/follow/${user?._id}`
          );
          setFollowersCounts((prev) => prev + 1);
          setIsFollowed(true);
        }
      } catch (err) {
        console.error("Toggle like failed:", err);
      }
    });
  };

  const handleMessageClick = () => {
    router.push(`/messages/${user?.username}`);
  };

  if (!username.startsWith("@")) {
    return notFound();
  }

  return (
    <>
      <Navbar
        title={
          (user?._id === currentUser?._id ? "Your Profile" : user?.username) ||
          ""
        }
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full">
          <div className="flex-1 custom-messages-scroll-overlay">
            <div className="flex flex-col items-center w-full pt-5 px-6 pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col ">
                  <h1 className="text-2xl font-bold text-white">
                    {user?.fullName}
                  </h1>
                  <p className="text-sm text-white">{user?.username}</p>
                </div>
                <Avatar className="w-21 h-21 rounded-full overflow-hidden">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.username}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user?.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {user?.shortDescription && (
                <p className="text-sm text-white w-full mt-4">
                  {user?.shortDescription}
                </p>
              )}
              <div className="flex items-center justify-between w-full h-9 mt-3">
                <p className="text-sm text-neutral-400">
                  {followersCounts} followers
                </p>
                <div className="flex flex-row gap-x-3">
                  <ChartNoAxesCombined
                    size={24}
                    className="text-white cursor-pointer"
                  />
                  <Instagram size={24} className="text-white cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-x-3 w-full px-6 py-3">
              {user?._id === currentUser?._id ? (
                <EditProfileCard
                  currentUser={currentUser}
                  onProfileUpdated={fetchUserProfile}
                />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={toggleFollow}
                    disabled={isPending}
                    className={cn(
                      "font-semibold rounded-lg flex-1 border border-neutral-700",
                      isFollowed
                        ? "text-white"
                        : "bg-red-800 text-white hover:bg-red-900"
                    )}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </Button>
                  <Button
                    onClick={handleMessageClick}
                    variant="ghost"
                    className="text-white font-semibold rounded-lg flex-1 border border-neutral-700"
                  >
                    Message
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center justify-around w-full h-[49px]">
              <div
                className={`flex items-center justify-center h-full w-full cursor-pointer border-b-[1px] ${
                  activeTab === "thread" ? "border-white" : "border-neutral-600"
                }`}
                onClick={() => setActiveTab("thread")}
              >
                <p
                  className={`text-sm font-semibold ${
                    activeTab === "thread" ? "text-white" : "text-neutral-600"
                  }`}
                >
                  Thread
                </p>
              </div>

              <div
                className={`flex items-center justify-center h-full w-full cursor-pointer border-b-[1px] ${
                  activeTab === "replies"
                    ? "border-white"
                    : "border-neutral-600"
                }`}
                onClick={() => setActiveTab("replies")}
              >
                <p
                  className={`text-sm font-semibold ${
                    activeTab === "replies" ? "text-white" : "text-neutral-600"
                  }`}
                >
                  Replies
                </p>
              </div>
            </div>

            {user?._id === currentUser?._id && (
              <CreatePostCard currentUser={user} />
            )}

            <div>
              {activeTab === "thread" && <UserPost user={user} />}

              {activeTab === "replies" && <UserReplyPost user={user} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
