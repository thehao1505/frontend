"use client";

import {
  Images,
  MapPin,
  MessageCircle,
  Paperclip,
  Text,
  Smile,
  TriangleAlert,
  CornerDownRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axios";
import Modal from "@/components/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Post, User } from "@/features/types";
import TextareaAutosize from "react-textarea-autosize";
import { config } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HorizontalImageGallery } from "./HorizontalImageGallery";

export default function ThreadReplyButton({
  post,
  currentUser,
  onUpdate,
}: {
  post: Post | null;
  currentUser: User | null;
  onUpdate?: (p: Post) => void;
}) {
  const [replyPosts, setReplyPosts] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCountReplyPost = async () => {
    try {
      const res = await axiosInstance.get(
        `${config.url}/api/v1/posts/${post?._id}/amount-reply-post`
      );

      setReplyPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCountReplyPost();
  }, [post?._id, replyPosts]);

  const handleSubmit = async () => {
    if (!post?._id) return;

    try {
      setIsLoading(true);
      if (content.length === 0 && images.length === 0) {
        setError("Please enter some content or add at least an image.");
      } else {
        const res = await axiosInstance.post(`${config.url}/api/v1/posts`, {
          content: content.trim(),
          images,
          parentId: post._id,
        });

        if (onUpdate) {
          onUpdate(res.data);
        }
        setReplyPosts((prev) => prev + 1);
        setShowPopup(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="flex items-center gap-1 hover:text-neutral-400"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{replyPosts}</span>
      </button>
      <Modal
        title="New Thread"
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      >
        <div className="text-sm text-neutral-200">
          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlert className="size-4" />
              <p>Please enter some content or add an image</p>
            </div>
          )}
          <div className="flex flex-row items-start gap-3 w-full pb-1">
            <Avatar className="w-9 h-9 rounded-full overflow-hidden">
              <AvatarImage
                src={post?.author?.avatar}
                alt={post?.author?.username}
                className="object-cover"
              />
              <AvatarFallback>
                {post?.author?.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center text-sm gap-1 font-medium text-white">
                <span className="text-white text-[15px] font-semibold">
                  {post?.author?.username}
                </span>
              </div>
              <p className="text-sm text-white whitespace-pre-line">
                <span className="cursor-pointer inline-block min-h-[1.25rem]">
                  {post?.content ? post?.content : "\u200B"}
                </span>
              </p>

              <HorizontalImageGallery
                images={post?.images || []}
                isPostDetailPage={false}
              />
            </div>
          </div>
          <div className="text-muted-foreground pl-12 pb-2 flex flex-row">
            <CornerDownRight className="w-4 h-4" />
            {` Reply this post below`}
          </div>
          <div className="flex flex-row items-start gap-3 w-full">
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
            <div className="flex-1 flex flex-col">
              <div className="flex items-center text-sm gap-1 font-medium text-white">
                <span className="text-white text-[15px] font-semibold">
                  {currentUser?.username}
                </span>
              </div>
              <TextareaAutosize
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Reply this post"
                minRows={1}
                maxRows={20}
                className="w-full bg-transparent border-none text-[15px] text-white focus:outline-none resize-none leading-snug placeholder:text-neutral-500 custom-messages-scroll-overlay"
              />

              <HorizontalImageGallery images={images} isPostDetailPage={true} />

              <div className="flex flex-row items-center pt-1 ml-[-8px]">
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
        <div className="flex justify-between pt-4">
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
            Reply
          </Button>
        </div>
      </Modal>
    </>
  );
}
