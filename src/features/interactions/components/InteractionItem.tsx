"use client";

import { Interaction, Post, UserActivityType } from "@/features/types";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Eye,
  Search,
  Clock,
  Link as LinkIcon,
  Heart,
  Share,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";

export const InteractionItem = ({
  interaction,
}: {
  interaction: Interaction;
}) => {
  const router = useRouter();
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(interaction.createdAt), {
      addSuffix: true,
    });
  }, [interaction.createdAt]);

  const formattedDwellTime = useMemo(() => {
    if (!interaction.dwellTime) return null;
    const seconds = Math.floor(interaction.dwellTime / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, [interaction.dwellTime]);

  const handlePostClick = async () => {
    if (!interaction.postId) return;

    setIsLoadingPost(true);
    try {
      try {
        await axiosInstance.post(
          `${config.url}/api/v1/posts/${interaction.postId._id}/click`
        );
      } catch (err) {
        console.error("Post click tracking failed:", err);
      }

      const res = await axiosInstance.get<Post>(
        `${config.url}/api/v1/posts/${interaction.postId._id}`
      );
      const post = res.data;
      router.push(`/@${post.author.username}/post/${interaction.postId._id}`);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const getActivityIcon = () => {
    switch (interaction.userActivityType) {
      case UserActivityType.POST_VIEW:
        return <Eye className="w-4 h-4" />;
      case UserActivityType.SEARCH:
        return <Search className="w-4 h-4" />;
      case UserActivityType.LIKE:
        return <Heart className="w-4 h-4" />;
      case UserActivityType.SHARE:
        return <Share className="w-4 h-4" />;
      case UserActivityType.POST_CLICK:
        return <LinkIcon className="w-4 h-4" />;
      case UserActivityType.UNLIKE:
        return <Heart className="w-4 h-4" />;
      case UserActivityType.REPLY_POST:
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityLabel = () => {
    switch (interaction.userActivityType) {
      case UserActivityType.POST_VIEW:
        return "You have viewed this post";
      case UserActivityType.SEARCH:
        return "You have searched for this term";
      case UserActivityType.POST_CLICK:
        return "You have clicked on this post";
      case UserActivityType.UNLIKE:
        return "You have unliked this post";
      case UserActivityType.LIKE:
        return "You have liked this post";
      case UserActivityType.SHARE:
        return "You have shared this post";
      case UserActivityType.REPLY_POST:
        return "You have replied to this post";
      default:
        return "You have performed this action";
    }
  };

  return (
    <div className={cn("border-b border-neutral-800/50")}>
      <div className="flex flex-row gap-x-4 py-4 px-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-muted-foreground">
          {getActivityIcon()}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-white">{getActivityLabel()}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>

          {interaction.searchText && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Search:</span> "
              {interaction.searchText}"
            </div>
          )}

          {interaction.postId && (
            <div
              onClick={handlePostClick}
              className={cn(
                "text-sm text-primary hover:underline cursor-pointer mt-1 text-white",
                isLoadingPost && "opacity-50 cursor-wait"
              )}
            >
              {isLoadingPost
                ? "Loading post..."
                : `${interaction.postId.content.slice(0, 30)}...`}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {interaction.dwellTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Dwell: {formattedDwellTime}</span>
              </div>
            )}
            {interaction.isEmbedded && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <span>Embedded</span>
                {interaction.lastEmbeddedAt && (
                  <span className="ml-1">
                    (
                    {formatDistanceToNow(new Date(interaction.lastEmbeddedAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
