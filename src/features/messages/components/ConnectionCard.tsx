"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { User } from "../../types";
import { useRouter } from "next/navigation";

export const ConnectionCard = ({
  connection,
  lastMessage,
}: {
  connection: User;
  lastMessage?: string;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/messages/${connection.username}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-row border-b border-neutral-800 px-6 py-3 items-center gap-x-3 cursor-pointer hover:bg-neutral-800"
    >
      <Avatar className="w-12 h-12 rounded-full overflow-hidden">
        <AvatarImage
          src={connection.avatar}
          alt={connection.username}
          className="object-cover"
        />
        <AvatarFallback>{connection.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-sm gap-1 font-medium text-white">
        <span className="cursor-pointer hover:underline">
          {connection.username}
        </span>
        <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
          {lastMessage || "Tap to chat"}
        </span>
      </div>
    </div>
  );
};
