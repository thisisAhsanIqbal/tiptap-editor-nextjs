"use client";

import React from "react";

import postService, { Post } from "@/services/post";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function usePost(postId?: string) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [post, setPost] = React.useState<Post | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Load post on mount
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('usePost: Loading post with ID:', postId);
        const loadedPost = await postService.get(postId);
        console.log('usePost: Loaded post:', loadedPost ? { id: loadedPost.id, title: loadedPost.title } : 'null');
        setPost(loadedPost);
        if (!loadedPost && postId) {
          setError(`Post with ID "${postId}" not found`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load post';
        setError(errorMessage);
        console.error('Error loading post:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [postId]);

  const savePost = React.useCallback(async (values: Partial<Post>, createNew: boolean = false) => {
    try {
      setSaveStatus("saving");
      setError(null);
      
      // If creating new post, don't include the ID
      // If updating existing post, include the ID
      const postToSave = createNew
        ? {
            // Create new post - don't include ID
            ...values,
            id: undefined, // Explicitly remove ID to create new post
          }
        : {
            // Update existing post - include ID if it exists
            ...post,
            ...values,
          };
      
      // Ensure we have required fields
      if (!postToSave.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!postToSave.html?.trim()) {
        throw new Error('Content is required');
      }
      
      const savedPost = await postService.save(postToSave);
      
      if (savedPost) {
        // If creating a new post, clear the form to allow creating another
        // If updating, keep the updated post so user can continue editing
        if (createNew) {
          setPost(null); // Clear form after creating new post
        } else {
          setPost(savedPost); // Update with saved post (keep it loaded for further edits)
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        throw new Error('Failed to save post - no data returned from server');
      }
    } catch (err) {
      console.error("Save failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Failed to save post';
      setError(errorMessage);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [post]);

  const debouncedSave = React.useMemo(
    () => debounce(savePost, 2000),
    [savePost]
  );

  // Manual save function (for button click)
  const handleManualSave = React.useCallback(async () => {
    const editor = document.querySelector('.ProseMirror');
    if (!editor) {
      setError('Editor not found');
      return;
    }
    
    // The save will be triggered by the form watch, but we can also call it directly
    // The PostForm component handles getting the current editor content
    await savePost({});
  }, [savePost]);

  const createNewPost = React.useCallback(() => {
    setPost(null);
    setError(null);
  }, []);

  return { 
    savePost, 
    debouncedSave, 
    handleManualSave,
    createNewPost,
    saveStatus, 
    isLoading, 
    post,
    error,
    refetch: async () => {
      setIsLoading(true);
      const loadedPost = await postService.get(postId);
      setPost(loadedPost);
      setIsLoading(false);
    }
  };
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
