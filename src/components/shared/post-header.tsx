import React from "react";

import Image from "next/image";
import Link from "next/link";
import { LuCalendarDays, LuClock, LuTag } from "react-icons/lu";

interface PostHeaderProps {
  title: string;
  cover?: string | null;
  author: string;
  createdAt: string;
  readingTime: number;
  categories?: string[];
}

// Format date as "06 May 2026"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const PostHeader = ({
  title,
  author,
  cover,
  createdAt,
  readingTime,
  categories = [],
}: PostHeaderProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center mb-6 gap-4">
        <Image
          src={"/avatar.jpg"}
          width={50}
          height={50}
          alt=""
          className="rounded-full"
        />
        <div className="">
          <div className="font-semibold mb-3">
            By <u>{author}</u>
          </div>
          <div className="flex items-center flex-wrap gap-x-3">
            {categories.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <LuTag size={18} />
                  <span>{categories.join(", ")}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-300" />
              </>
            )}
            <div className="flex items-center gap-2 text-sm">
              <LuCalendarDays size={18} />
              <span>{formatDate(createdAt)}</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-300" />
            <div className="flex items-center gap-2 text-sm">
              <LuClock size={18} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-3xl leading-snug md:text-4xl md:leading-normal font-bold">
        {title}
      </h1>

      {cover && (
        <Image
          src={cover}
          alt={title}
          width={1200}
          height={628}
          className="my-10 rounded-lg w-full h-auto object-cover"
          style={{ aspectRatio: '16/9' }}
          priority
        />
      )}
    </div>
  );
};

export default PostHeader;
