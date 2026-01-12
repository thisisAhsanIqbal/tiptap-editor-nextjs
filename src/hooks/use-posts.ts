"use client";

import React from "react";
import postService, { Post } from "@/services/post";

export function usePosts() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allPosts = await postService.getAll();
        setPosts(allPosts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
        setError(errorMessage);
        console.error('Error loading posts:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const refetch = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allPosts = await postService.getAll();
      setPosts(allPosts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { posts, isLoading, error, refetch };
}
