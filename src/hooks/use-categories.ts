"use client";

import React from "react";
import categoryService, { Category } from "@/lib/supabase/category";

export function useCategories() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allCategories = await categoryService.getAll();
        setCategories(allCategories);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
        setError(errorMessage);
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const refetch = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCategories = await categoryService.getAll();
      setCategories(allCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { categories, isLoading, error, refetch };
}
