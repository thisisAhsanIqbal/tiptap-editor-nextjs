"use client";

import React from "react";

import { useParams } from "next/navigation";

import { usePost } from "@/hooks/use-post";

import PostForm from "../../(edit)/_components/post-form";
import "../../(edit)/style.scss";

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const { debouncedSave, savePost, saveStatus, isLoading, post, error, createNewPost } = usePost(postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto py-10 px-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 font-medium">Error: {error}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Check the browser console for more details. If this is an RLS policy error, see RLS_POLICY_NOTE.md
          </p>
        </div>
      )}
      <PostForm 
        post={post} 
        editable={true} 
        onSave={savePost}
        saveStatus={saveStatus}
        onCreateNew={createNewPost}
      />
    </div>
  );
}
