import { Button } from "@/components/ui/button";
import ShareButton from "@/features/common/components/ShareButton";
import ThreadReplyButton from "@/features/common/components/ThreadReplyButton";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";
import { Notification } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { cn, config } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, memo, startTransition } from "react";

const NotificationLabel = memo(
  ({ notification }: { notification: Notification }) => {
    const router = useRouter();
    const { currentUser } = useCurrentUser();

    // Memoize expensive calculations
    const formattedDate = useMemo(() => {
      return formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: false,
      });
    }, [notification.createdAt]);

    const liked = useMemo(() => {
      if (!currentUser?._id || !notification.postId?.likes) return false;
      return notification.postId.likes.includes(currentUser._id);
    }, [currentUser?._id, notification.postId?.likes]);

    const likeCount = useMemo(() => {
      return notification.postId?.likes?.length || 0;
    }, [notification.postId?.likes]);

    const isFollowed = useMemo(() => {
      if (!notification.senderId?._id || !currentUser?._id) return false;
      return (
        notification.senderId.followers.includes(currentUser._id) &&
        currentUser.followings.includes(notification.senderId._id)
      );
    }, [
      notification.senderId?._id,
      notification.senderId?.followers,
      currentUser?._id,
      currentUser?.followings,
    ]);

    const handleNotificationClick = () => {
      switch (notification.type) {
        case "FOLLOW":
          router.push(`/@${notification.senderId.username}`);
          break;
        case "LIKE":
          router.push(
            `/@${notification.senderId.username}/post/${notification.postId?._id}`
          );
          break;
        case "POST_REPLY":
          router.push(
            `/@${notification.senderId.username}/post/${notification}`
          );
      }
    };

    const handleAuthorClick = () => {
      router.push(`/@${notification.senderId.username}`);
    };

    return (
      <div>
        <div className="flex flex-row h-full gap-x-3 py-3 pl-6">
          <Avatar className="w-9 h-9 rounded-full items-start overflow-hidden">
            <AvatarImage
              src={notification.senderId.avatar}
              alt={notification.senderId.username}
              className="object-cover"
            />
            <AvatarFallback>
              {notification.senderId.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center text-sm gap-1 font-medium text-white">
              <span
                onClick={() => handleAuthorClick()}
                className="cursor-pointer hover:underline"
              >
                {notification.senderId.username}
              </span>
              <span> </span>
              <span className="text-sm text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            <div
              onClick={handleNotificationClick}
              className="flex flex-col gap-1 cursor-pointer"
            >
              {notification.type === "LIKE" && (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground w-full whitespace-pre-line">
                    Liked your post
                  </p>
                  <p className="text-sm text-white w-full whitespace-pre-line pr-10">
                    {notification.postId?.content}
                  </p>
                  <div className="flex items-center gap-6 text-muted-foreground text-sm pt-1 w-full">
                    <button
                      className={cn(
                        "flex items-center gap-1 transition-colors duration-150",
                        liked
                          ? "text-red-500 hover:fill-red-400"
                          : "hover:text-neutral-400"
                      )}
                    >
                      <Heart
                        className={cn("w-4 h-4", liked && "fill-red-500")}
                      />
                      <span>{likeCount}</span>
                    </button>
                    <ThreadReplyButton
                      post={notification.postId || null}
                      currentUser={currentUser}
                    />
                    <ShareButton />
                  </div>
                </div>
              )}
              {notification.type === "FOLLOW" && (
                <p className="text-sm text-muted-foreground w-full whitespace-pre-line">
                  Followed you
                </p>
              )}
              {notification.type === "POST_REPLY" && (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground w-full whitespace-pre-line">
                    Replied to your post
                  </p>
                  <p className="text-sm text-white w-full whitespace-pre-line pr-10">
                    {notification.postId?.content}
                  </p>
                  <div className="flex items-center gap-6 text-muted-foreground text-sm pt-1 w-full">
                    <button
                      className={cn(
                        "flex items-center gap-1 transition-colors duration-150",
                        liked
                          ? "text-red-500 hover:fill-red-400"
                          : "hover:text-neutral-400"
                      )}
                    >
                      <Heart
                        className={cn("w-4 h-4", liked && "fill-red-500")}
                      />
                      <span>{likeCount}</span>
                    </button>
                    <ThreadReplyButton
                      post={notification.postId || null}
                      currentUser={currentUser}
                    />
                    <ShareButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative h-[1px] w-full">
          <div className="absolute left-18 right-0 top-0 h-px bg-white/30" />
        </div>
      </div>
    );
  }
);

export { NotificationLabel };
