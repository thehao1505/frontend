"use client";

import { destroyCookie } from "nookies";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const Logout = () => {
  const router = useRouter();

  const handleLogout = () => {
    destroyCookie(null, "token", { path: "/" });
    router.push("/login");
  };

  return (
    <div
      className="flex items-center justify-center hover:opacity-75 transition"
      onClick={handleLogout}
    >
      <div className="size-18 relative ml-3">
        <LogOut className="size-6 stroke-2 text-neutral-600" />{" "}
      </div>
    </div>
  );
};
