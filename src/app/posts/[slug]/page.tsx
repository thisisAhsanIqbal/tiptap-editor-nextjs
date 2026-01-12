"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuPencil } from "react-icons/lu";

import TiptapRenderer from "@/components/tiptap-renderer/client-renderer";
import { usePost } from "@/hooks/use-post";
import PostContent from "@/components/shared/post-content";
import PostHeader from "@/components/shared/post-header";
import PostToc from "@/components/shared/post-toc";
import PostReadingProgress from "@/components/shared/reading-progress";
import categoryService from "@/lib/supabase/category";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Handle both slug and ID - the param name is [slug] but it can contain either slug or ID
  const slugOrId = params.slug as string;
  const { post, isLoading, error } = usePost(slugOrId);
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([]);

  // Fetch categories when post is loaded
  React.useEffect(() => {
    if (post?.id) {
      categoryService.getByPostId(post.id)
        .then((cats) => {
          setCategories(cats.map(cat => ({ id: cat.id, name: cat.name })));
        })
        .catch((err) => {
          console.error('Error fetching categories:', err);
          setCategories([]);
        });
    } else {
      setCategories([]);
    }
  }, [post?.id]);

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
          {slugOrId && (
            <p className="text-sm text-red-600 dark:text-red-300 mt-2">
              Slug/ID: {slugOrId}
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
        {post.slug || post.id ? (
          <Link
            href={`/edit/${post.slug || post.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
          >
            <LuPencil className="size-4" />
            <span>Edit Post</span>
          </Link>
        ) : null}
      </div>

      <div className="w-full lg:w-auto lg:max-w-[calc(720px+256px+3rem)] mx-auto">
        <PostHeader
          title={post.title}
          author={post.author}
          createdAt={post.createdAt}
          readingTime={post.readingTime}
          cover={post.cover}
          categories={categories.map(cat => cat.name)}
        />
      </div>
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-12 lg:max-w-[calc(720px+256px+3rem)] mx-auto">
        <PostContent>
          <TiptapRenderer>{post.html}</TiptapRenderer>
        </PostContent>
        <PostToc />
      </div>
    </article>
  );
}
