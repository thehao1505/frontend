"use client";

import { Post, User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { cn, config } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Images,
  MapPin,
  Paperclip,
  Text,
  Smile,
  TriangleAlert,
  MoreVertical,
  Pencil,
  Trash2,
  Heart,
} from "lucide-react";
import ShareButton from "./ShareButton";
import ThreadReplyButton from "./ThreadReplyButton";
import { HorizontalImageGallery } from "./HorizontalImageGallery";
import Modal from "@/components/modal";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";

interface PostCardProp {
  currentUser: User | null;
  post: Post;
}

export const PostCard = ({ currentUser, post }: PostCardProp) => {
  const [editedContent, setEditedContent] = useState(post.content);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [liked, setLiked] = useState(
    post?.likes?.includes(currentUser?._id || "")
  );
  const [images, setImages] = useState<string[]>(post.images);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLiked(post.likes.includes(currentUser?._id || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axiosInstance.post(
        `${config.url}/api/v1/upload/multiple`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setImages((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editedContent.length === 0 && images.length === 0) {
        setError("Please enter some content or add an image");
      } else {
        await axiosInstance.patch(`${config.url}/api/v1/posts/${post._id}`, {
          content: editedContent,
          images,
        });

        setIsEditing(false);
        setEditedContent(editedContent);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = () => {
    router.push(`/@${post.author.username}/post/${post._id}`);
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
            {currentUser?._id === post.author._id && (
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
              <Modal
                title="New Thread"
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
              >
                <div className="text-sm text-neutral-200">
                  {!!error && (
                    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                      <TriangleAlert className="size-4" />
                      <p>Please enter some content or add an image</p>
                    </div>
                  )}
                  <div className="flex flex-row items-start gap-3 w-full border-b-[1px] border-neutral-800">
                    <Avatar className="w-9 h-9 rounded-full overflow-hidden">
                      <AvatarImage
                        src={currentUser?.avatar}
                        alt={currentUser?.username}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {currentUser?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col pb-3">
                      <div className="flex items-center text-sm gap-1 font-medium text-white">
                        <span className="text-white text-[15px] font-semibold">
                          {currentUser?.username}
                        </span>
                      </div>
                      <TextareaAutosize
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="What's on your mind?"
                        minRows={1}
                        maxRows={20}
                        className="w-full bg-transparent border-none text-[15px] text-white focus:outline-none resize-none leading-snug placeholder:text-neutral-500 custom-messages-scroll-overlay"
                      />

                      <HorizontalImageGallery
                        images={post.images}
                        isPostDetailPage={false}
                      />

                      <div className="flex flex-row items-center ml-[-8px]">
                        <Images
                          onClick={() => imageInputRef.current?.click()}
                          className="w-5 h-5 text-muted-foreground m-2 cursor-pointer"
                        />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Smile className="w-5 h-5 text-muted-foreground m-2" />
                        <MapPin className="w-5 h-5 text-muted-foreground m-2" />
                        <Text className="w-5 h-5 text-muted-foreground m-2" />
                        <Paperclip className="w-5 h-5 text-muted-foreground m-2" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <div className="flex-1 flex items-center justify-start">
                    <p className="text-sm text-muted-foreground">
                      Anyone can reply or repost
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={isLoading}
                    className="text-white font-semibold rounded-xl border border-neutral-800"
                    onClick={() => handleSubmit()}
                  >
                    Update
                  </Button>
                </div>
              </Modal>
            ) : (
              <p className="text-sm text-white whitespace-pre-line">
                <span
                  onClick={() => handlePostClick()}
                  className="cursor-pointer inline-block min-h-[1.25rem]"
                >
                  {editedContent ? editedContent : "\u200B"}
                </span>
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
            <ThreadReplyButton post={post} currentUser={currentUser} />
            <ShareButton />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
