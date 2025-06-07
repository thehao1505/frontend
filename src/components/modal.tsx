"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-lg w-full max-w-xl border-[1px] border-neutral-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-[56px] items-center justify-center border-b-[1px] border-neutral-800 text-white font-semibold text-md">
          {title}
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
