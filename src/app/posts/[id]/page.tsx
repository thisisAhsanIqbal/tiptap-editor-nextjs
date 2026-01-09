"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuCalendarDays, LuClock, LuPencil } from "react-icons/lu";

import TiptapRenderer from "@/components/tiptap-renderer/client-renderer";
import { usePost } from "@/hooks/use-post";
import PostContent from "@/components/shared/post-content";
import PostHeader from "@/components/shared/post-header";
import PostSharing from "@/components/shared/post-sharing";
import PostToc from "@/components/shared/post-toc";
import PostReadingProgress from "@/components/shared/reading-progress";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { post, isLoading, error } = usePost(postId);

  // Debug logging
  React.useEffect(() => {
    console.log('PostDetailPage - postId:', postId);
    console.log('PostDetailPage - params:', params);
  }, [postId, params]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Loading post...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl w-full mx-auto py-10 px-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-6">
          <p className="text-red-800 dark:text-red-200 font-medium">
            {error || "Post not found"}
          </p>
          {postId && (
            <p className="text-sm text-red-600 dark:text-red-300 mt-2">
              Post ID: {postId}
            </p>
          )}
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Check the browser console for more details.
          </p>
        </div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
        >
          <LuArrowLeft className="size-4" />
          <span>Back to All Posts</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="py-10 px-6 flex flex-col items-center">
      <PostReadingProgress />
      
      {/* Back Button and Edit Button */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <LuArrowLeft className="size-4" />
          <span>Back to All Posts</span>
        </Link>
        <Link
          href={`/edit/${post.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
        >
          <LuPencil className="size-4" />
          <span>Edit Post</span>
        </Link>
      </div>

      <PostHeader
        title={post.title}
        author={post.author}
        createdAt={post.createdAt}
        readingTime={post.readingTime}
        cover={post.cover}
      />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-12">
        <PostSharing />
        <PostContent>
          <TiptapRenderer>{post.html}</TiptapRenderer>
        </PostContent>
        <PostToc />
      </div>
    </article>
  );
}
