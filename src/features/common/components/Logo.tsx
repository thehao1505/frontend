"use client";

import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center justify-center hover:opacity-75 transition">
        <div className="size-18 relative ml-3">
          <Image src="/logo.svg" alt="Y" fill />
        </div>
      </div>
    </Link>
  );
};
