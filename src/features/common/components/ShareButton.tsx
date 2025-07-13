"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ShareButton({ link }: { link?: string }) {
  const [copied, setCopied] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleCopy = async () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(link || window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  return (
    <>
      {!copied ? (
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 hover:text-neutral-400 transition-all duration-200 transform ${
            isClicked ? "scale-95" : ""
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Share</span>
        </button>
      ) : (
        <button
          className={`flex items-center gap-1 text-green-600 transition-all duration-200 transform ${
            isClicked ? "scale-95" : ""
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Copied link!</span>
        </button>
      )}
    </>
  );
}
