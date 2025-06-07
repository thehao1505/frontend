"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface NavbarProps {
  title: string;
  showBackButton?: boolean;
  showOptionsButton?: boolean;
  onOptionsClick?: () => void;
}

export const Navbar = ({
  title,
  showBackButton = false,
  showOptionsButton = false,
  onOptionsClick,
}: NavbarProps) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-[60px] w-full">
      <div className="fixed top-0 flex flex-col w-[640px] z-50">
        <div className="h-[60px] flex items-center justify-between px-6">
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              className="p-1 rounded-full bg-neutral-900 border-[1px] border-neutral-800 hover:scale-110 transition cursor-pointer"
            >
              <ArrowLeft size={15} color="white" />
            </button>
          ) : (
            <div className="w-[40px]" />
          )}

          <h1 className="text-white font-semibold text-md">{title}</h1>

          {showOptionsButton ? (
            <button
              onClick={onOptionsClick}
              className="p-1 rounded-full bg-neutral-900 border-[1px] border-neutral-800 hover:scale-110 transition cursor-pointer"
            >
              <MoreHorizontal size={15} color="white" />
            </button>
          ) : (
            <div className="w-[40px]" />
          )}
        </div>
      </div>
    </div>
  );
};
