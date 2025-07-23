"use client";

import React, { useRef, useState } from "react";

export const HorizontalImageGallery = ({
  images,
  isPostDetailPage,
  _id,
  username,
}: {
  images: string[];
  isPostDetailPage: boolean;
  _id?: string;
  username?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const redirectLink = isPostDetailPage ? "" : `/@${username}/post/${_id}`;
  const margin = isPostDetailPage
    ? "mr-[-24px] ml-[-24px]"
    : "mr-[-24px] ml-[-72px]";

  const width = isPostDetailPage ? "w-[16px]" : "w-[64px]";

  return (
    <>
      {images.length > 0 && (
        <div
          ref={scrollRef}
          className={`flex overflow-x-auto py-2 ${margin} space-x-2 custom-messages-scroll-overlay cursor-grab active:cursor-grabbing select-none`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <a className={`${width} shrink-0`} href={redirectLink}></a>
          {images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="rounded-md object-cover max-h-60 flex-1 basis-[48%] pointer-events-none"
            />
          ))}
          <a className="w-[16px] shrink-0" href={redirectLink}></a>
        </div>
      )}
    </>
  );
};
