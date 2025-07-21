"use client";

import { Post } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { cn, config } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import ShareButton from "./ShareButton";
import ThreadReplyButton from "./ThreadReplyButton";
import { HorizontalImageGallery } from "./HorizontalImageGallery";

interface PostCardProp {
  currentUser: string | null;
  post: Post;
}

export const PostCard = ({ currentUser, post }: PostCardProp) => {
  const [editedContent, setEditedContent] = useState(post.content);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isEditing, setIsEditing] = useState(false);
  const [liked, setLiked] = useState(post.likes.includes(currentUser || ""));
  const [error, setError] = useState(false);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setLiked(post.likes.includes(currentUser || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const toggleLike = () => {
    if (!currentUser) return;

    startTransition(async () => {
      try {
        if (liked) {
          await axiosInstance.post(
            `${config.url}/api/v1/posts/${post._id}/unLike`
          );
          setLikeCount((prev) => prev - 1);
        } else {
          await axiosInstance.post(
            `${config.url}/api/v1/posts/${post._id}/like`
          );
          setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
      } catch (err) {
        console.error("Toggle like failed:", err);
      }
    });
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        `${config.url}/api/v1/posts/${post._id}/soft-delete`
      );
      window.location.reload();
    } catch (err) {
      console.error("Delete post failed:", err);
    }
  };

  const handleEdit = async () => {
    try {
      if (editedContent.length === 0 && post.images.length === 0) {
        setError(true);
        return;
      } else {
        await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${post._id}`,
          { content: editedContent }
        );
        setIsEditing(false);
        setEditedContent(editedContent);
      }
    } catch (err) {
      console.error("Edit post failed:", err);
    }
  };

  const handlePostClick = () => {
    router.push(`/${post.author.username}/post/${post._id}`);
  };

  const handleAuthorClick = () => {
    router.push(`/@${post.author.username}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full border-b-[1px] border-neutral-800"
    >
      <div className="flex flex-row items-start gap-3 w-full px-6 py-3">
        <Avatar className="w-9 h-9 rounded-full overflow-hidden">
          <AvatarImage
            src={post.author.avatar}
            alt={post.author.username}
            className="object-cover"
          />
          <AvatarFallback>
            {post.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm gap-1 font-medium text-white">
              <span
                onClick={() => handleAuthorClick()}
                className="cursor-pointer hover:underline"
              >
                {post.author.username}
              </span>
              <span className="text-xs text-muted-foreground">• </span>
              <span
                onClick={() => handlePostClick()}
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
              >
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {currentUser === post.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {isEditing ? (
              <>
                {!!error && (
                  <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlert className="size-4" />
                    <p>Please don&apos;t leave the content empty</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-700"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(post.content);
                      }}
                      className="bg-neutral-800 text-white px-4 py-1 rounded hover:bg-neutral-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-white whitespace-pre-line">
                {editedContent}
              </p>
            )}
          </div>

          <HorizontalImageGallery
            images={post.images}
            _id={post._id}
            username={post.author.username}
            isPostDetailPage={false}
          />

          <div className="flex items-center gap-6 text-muted-foreground text-sm pt-2">
            <button
              onClick={toggleLike}
              disabled={isPending || !currentUser}
              className={cn(
                "flex items-center gap-1 transition-colors duration-150",
                liked
                  ? "text-red-500 hover:fill-red-400"
                  : "hover:text-neutral-400"
              )}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-red-500")} />
              {likeCount}
            </button>
            <ThreadReplyButton postId={post._id} currentUser={currentUser} />
            <ShareButton />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
