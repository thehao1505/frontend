"use client";

import { MessageCircle, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Modal from "@/components/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: User;
  createdAt: string;
  updatedAt: string;
}

export default function ThreadReplyButton({
  postId,
  currentUser,
}: {
  postId: string | null;
  currentUser: string | null;
}) {
  return (
    <>
      <button className="flex items-center gap-1 hover:text-neutral-400">
        <MessageCircle className="w-4 h-4" />
        <span>100</span>
      </button>
    </>
  );
}
