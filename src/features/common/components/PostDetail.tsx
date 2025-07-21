"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import useUser from "../hooks/useUser";
import { useCallback, useEffect, useState, useTransition } from "react";
import axiosInstance from "@/lib/axios";
import { Post } from "@/features/types";
import { cn, config } from "@/lib/utils";
import { Navbar } from "./Navbar";
import useCurrentUser from "../hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRight,
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import ShareButton from "./ShareButton";
import { HorizontalImageGallery } from "./HorizontalImageGallery";
import ThreadReplyButton from "./ThreadReplyButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PostDetail = () => {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);
  const { currentUser } = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const { user, error } = useUser(
    username.startsWith("@") ? username.slice(1) : ""
  );

  const [postDetail, setPostDetail] = useState<Post>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liked, setLiked] = useState(
    postDetail?.likes.includes(currentUser?._id || "")
  );
  const [likeCount, setLikeCount] = useState(0);
  const [formattedDate, setFormattedDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(postDetail?.content);

  useEffect(() => {
    if (postDetail?.createdAt) {
      setFormattedDate(
        formatDistanceToNow(new Date(postDetail.createdAt), {
          addSuffix: false,
        })
      );
    }
  }, [postDetail?.createdAt]);

  const toggleLike = () => {
    if (!currentUser) return;

    startTransition(async () => {
      try {
        if (liked) {
          await axiosInstance.post(
            `${config.url}/api/v1/posts/${postDetail?._id}/unLike`
          );
          setLikeCount((prev) => prev - 1);
        } else {
          await axiosInstance.post(
            `${config.url}/api/v1/posts/${postDetail?._id}/like`
          );
          setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
      } catch (err) {
        console.error("Toggle like failed:", err);
      }
    });
  };

  const fetchPostDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/posts/${params.postId}`
      );

      setPostDetail(res.data);
      setLiked(res.data.likes.includes(currentUser?._id || ""));
      setLikeCount(res.data.likes.length);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostDetail();
  }, [params.postId, currentUser, isLoading]);

  useEffect(() => {
    setLiked(postDetail?.likes.includes(currentUser?._id || ""));
    setEditedContent(postDetail?.content);
  }, [currentUser?._id, postDetail?.likes, postDetail?.content]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        `${config.url}/api/v1/posts/${postDetail?._id}/soft-delete`
      );
      window.location.reload();
    } catch (err) {
      console.error("Delete post failed:", err);
    }
  };

  const handleEdit = async () => {
    try {
      if (editedContent?.length === 0 && postDetail?.images.length === 0) {
        return;
      } else {
        await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postDetail?._id}`,
          { content: editedContent }
        );
        setIsEditing(false);
        setEditedContent(editedContent);
      }
    } catch (err) {
      console.error("Edit post failed:", err);
    }
  };

  if (!username.startsWith("@") || error) {
    return notFound();
  }

  return (
    <>
      <Navbar title="Thread" showOptionsButton={true} showBackButton={true} />
      <div className="bg-neutral-900 border-[1px] border-neutral-800 h-[calc(100vh-60px)] w-full rounded-t-3xl">
        <div className="flex flex-col h-full px-6 pt-6">
          <div className="flex flex-row gap-3 w-full items-center pb-2">
            <Avatar className="w-9 h-9 rounded-full overflow-hidden">
              <AvatarImage
                src={postDetail?.author.avatar}
                alt={postDetail?.author.username}
                className="object-cover"
              />
              <AvatarFallback>
                {postDetail?.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center text-sm font-medium text-white">
              <span>{postDetail?.author.username}</span>
              <span className="text-xs pl-1 text-muted-foreground">
                • {formattedDate}
              </span>
            </div>
            {currentUser?._id === postDetail?.author._id && (
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
          <div className="flex flex-col">
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
                          setEditedContent(postDetail?.content);
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
              images={postDetail?.images || []}
              _id={postDetail?._id || ""}
              username={postDetail?.author.username || ""}
              isPostDetailPage={true}
            />

            <div className="flex items-center gap-6 text-muted-foreground text-sm py-3 border-b border-neutral-800">
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
                <span>{likeCount}</span>
              </button>
              <ThreadReplyButton
                postId={postDetail?._id || ""}
                currentUser={currentUser?._id || ""}
              />
              <ShareButton />
            </div>
            <div className="flex flex-row items-center justify-between py-4">
              <p className="text-sm text-white font-semibold">Most related</p>
              <div className="flex flex-row items-center text-sm text-muted-foreground">
                <p>See activity</p>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
