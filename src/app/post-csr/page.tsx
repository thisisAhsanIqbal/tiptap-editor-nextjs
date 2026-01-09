"use client";
import Image from "next/image";
import { Suspense, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import TiptapRenderer from "@/components/tiptap-renderer/client-renderer";
import { usePost } from "@/hooks/use-post";
import { Post } from "@/services/post";

import PostContent from "../../components/shared/post-content";
import PostHeader from "../../components/shared/post-header";
import PostSharing from "../../components/shared/post-sharing";
import PostToc from "../../components/shared/post-toc";
import PostReadingProgress from "../../components/shared/reading-progress";

function PostPageContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const { post: loadedPost, isLoading } = usePost(postId || undefined);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  // Check for preview post in sessionStorage (for unsaved posts)
  useEffect(() => {
    if (!postId) {
      const stored = sessionStorage.getItem('previewPost');
      if (stored) {
        try {
          setPreviewPost(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing preview post:', e);
        }
      }
    }
  }, [postId]);

  const post = postId ? loadedPost : previewPost;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Loading preview...
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="py-10 px-6 flex flex-col items-center ">
      <PostReadingProgress />
      <PostHeader
        title={post.title}
        author={post.author}
        createdAt={post.createdAt}
        readingTime={post.readingTime}
        cover={post.cover}
      />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">
        <PostSharing />
        <PostContent>
          <TiptapRenderer>{post.html}</TiptapRenderer>
        </PostContent>
        <PostToc />
      </div>
      <Image
        src={"/doraemon.png"}
        width={350}
        height={350}
        alt=""
        className="mx-auto mt-20"
      />
    </article>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Loading preview...
        </div>
      </div>
    }>
      <PostPageContent />
    </Suspense>
  );
}
