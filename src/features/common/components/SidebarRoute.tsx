"use client";

import { Home, Heart, Search, User, MessageCircle } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { usePathname } from "next/navigation";
import useCurrentUser from "../hooks/useCurrentUser";

export const SidebarRoutes = () => {
  const { currentUser } = useCurrentUser();
  const pathname = usePathname();
  const onClick = () => {};

  return (
    <div className="flex flex-col gap-y-4 flex-1 justify-center">
      <ul className="flex flex-col gap-y-3 px-2">
        <SidebarItem href="/" icon={Home} onClick={onClick} isActive={pathname === "/"} />
        <SidebarItem
          href="/search"
          icon={Search}
          onClick={onClick}
          isActive={pathname === "/search"}
        />
        <SidebarItem
          href="/messages"
          icon={MessageCircle}
          onClick={onClick}
          isActive={pathname === "/messages"}
        />
        <SidebarItem
          href="/notifications"
          icon={Heart}
          onClick={onClick}
          isActive={pathname === "/notifications"}
        />
        <SidebarItem
          href={`/${currentUser?.username}`}
          icon={User}
          onClick={onClick}
          isActive={pathname === `/${currentUser?.username}`}
        />
      </ul>
    </div>
  );
};
