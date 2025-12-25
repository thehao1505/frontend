"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/navigation";

interface SearchUser {
  _id: string;
  username: string;
  avatar: string;
  fullName?: string;
}

export const UserSearchCard = ({ user }: { user: SearchUser }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/@${user.username}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-row border-b border-neutral-800 px-6 py-3 items-center gap-x-3 cursor-pointer hover:bg-neutral-800"
    >
      <Avatar className="w-12 h-12 rounded-full overflow-hidden">
        <AvatarImage
          src={user.avatar}
          alt={user.username}
          className="object-cover"
        />
        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-sm gap-1 font-medium text-white">
        <span className="cursor-pointer hover:underline">{user.username}</span>
        {user.fullName && (
          <span className="text-xs text-muted-foreground">{user.fullName}</span>
        )}
      </div>
    </div>
  );
};
