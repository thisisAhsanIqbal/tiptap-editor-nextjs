"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuCalendarDays, LuClock, LuPencil, LuFileText } from "react-icons/lu";

import { usePosts } from "@/hooks/use-posts";

export default function PostsPage() {
  const router = useRouter();
  const { posts, isLoading, error } = usePosts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateHtml = (html: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Loading posts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl w-full mx-auto py-10 px-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 font-medium">Error: {error}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Check the browser console for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            All Posts
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {posts.length} {posts.length === 1 ? "post" : "posts"} found
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
        >
          <LuPencil className="size-4" />
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <LuFileText className="size-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No posts yet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Get started by creating your first post!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
          >
            <LuPencil className="size-4" />
            <span>Create Your First Post</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            // Debug: Log post data
            if (!post.id) {
              console.warn('Post without ID:', post);
            }
            
            return (
            <div
              key={post.id || `post-${posts.indexOf(post)}`}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group"
              onClick={() => {
                if (post.id) {
                  console.log('Navigating to post:', post.id);
                  router.push(`/posts/${post.id}`);
                } else {
                  console.error('Post ID is missing:', post);
                  alert('Post ID is missing. Cannot navigate to post detail.');
                }
              }}
            >
              {/* Cover Image */}
              {post.cover && (
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title || "Untitled Post"}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                  {truncateHtml(post.html)}
                </p>

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    <LuCalendarDays className="size-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LuClock className="size-4" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>

                {/* Author */}
                {post.author && (
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    By {post.author}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
