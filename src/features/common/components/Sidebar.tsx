"use client";

import { Logo } from "./Logo";
import { Logout } from "./Logout";
import { SidebarRoutes } from "./SidebarRoute";

export const Sidebar = () => {
  return (
    <aside className="hidden bg-transparent md:flex fixed flex-col w-[76px] left-0 shrink-0 h-full">
      <Logo />
      <SidebarRoutes />
      <Logout />
    </aside>
  );
};
