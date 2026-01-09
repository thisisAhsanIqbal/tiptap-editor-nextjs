"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useExport } from "@/hooks/use-export";
import { usePost } from "@/hooks/use-post";

import ActionBar from "../../(edit)/_components/action-bar";
import PostForm from "../../(edit)/_components/post-form";
import "../../(edit)/style.scss";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [editable, setEditable] = useState(true);
  const { debouncedSave, savePost, saveStatus, isLoading, post, error, createNewPost } = usePost(postId);
  const { exportToDocx } = useExport();

  const handlePreview = () => {
    if (post?.id) {
      router.push(`/post-csr?id=${post.id}`);
    } else {
      // If no post ID, store current post data in sessionStorage for preview
      if (post) {
        sessionStorage.setItem('previewPost', JSON.stringify(post));
      }
      router.push("/post-csr");
    }
  };

  const handleExport = async () => {
    if (!post) {
      alert("No content to export");
      return;
    }

    try {
      const filename = `${post.title || "document"}.docx`;
      await exportToDocx(post.json, filename);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

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
      <ActionBar
        onPreview={handlePreview}
        onExport={handleExport}
        editable={editable}
        onToggleEditable={setEditable}
      />
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
        editable={editable} 
        onSave={savePost}
        saveStatus={saveStatus}
        onCreateNew={createNewPost}
      />
    </div>
  );
}
