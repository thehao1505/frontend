"use client";

import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Images,
  MapPin,
  Paperclip,
  Text,
  Smile,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { HorizontalImageGallery } from "./HorizontalImageGallery";

export const CreatePostCard = ({
  currentUser,
}: {
  currentUser: User | null;
}) => {
  const [content, setContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!showPopup) {
      setContent("");
      setImages([]);
    }
  }, [showPopup]);

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (content.length === 0 && images.length === 0) {
        setError("Please enter some content or add an image");
      } else {
        await axiosInstance.post(`${config.url}/api/v1/posts`, {
          content: content.trim(),
          images,
        });

        setShowPopup(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="px-6 py-4 flex justify-between text-white w-full border-b-[1px] border-neutral-800">
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
        <div className="flex-1 flex items-center justify-center">
          <input
            onClick={() => setShowPopup(true)}
            type="text"
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none text-sm text-muted-foreground focus:outline-none pl-3 pb-1"
          />
        </div>

        <Button
          variant="ghost"
          className="text-white font-semibold rounded-xl border border-neutral-800"
          onClick={() => setShowPopup(true)}
        >
          Post
        </Button>
      </div>

      {showPopup && (
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  minRows={1}
                  maxRows={20}
                  className="w-full bg-transparent border-none text-[15px] text-white focus:outline-none resize-none leading-snug placeholder:text-neutral-500 custom-messages-scroll-overlay"
                />

                <HorizontalImageGallery
                  images={images}
                  isPostDetailPage={true}
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
              Post
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
