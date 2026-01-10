import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Map database row to Category type
const mapRowToCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const categoryService = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return (data || []).map(mapRowToCategory);
    } catch (error) {
      console.error('Error in getAll categories:', error);
      throw error;
    }
  },

  // Get categories for a specific post
  getByPostId: async (postId: string): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select(`
          category_id,
          categories (
            id,
            name,
            slug,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching post categories:', error);
        throw new Error(`Failed to fetch post categories: ${error.message}`);
      }

      // Extract categories from the joined data
      const categories = (data || [])
        .map((item: any) => item.categories)
        .filter(Boolean)
        .map(mapRowToCategory);

      return categories;
    } catch (error) {
      console.error('Error in getByPostId:', error);
      throw error;
    }
  },

  // Create a new category
  create: async (categoryData: { name: string; description?: string }): Promise<Category> => {
    try {
      // Generate slug from name
      const slug = categoryData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const insertData: CategoryInsert = {
        name: categoryData.name,
        slug,
        description: categoryData.description || null,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw new Error(`Failed to create category: ${error.message}`);
      }

      return mapRowToCategory(data);
    } catch (error) {
      console.error('Error in create category:', error);
      throw error;
    }
  },

  // Link categories to a post
  linkToPost: async (postId: string, categoryIds: string[]): Promise<void> => {
    try {
      // First, delete all existing links for this post
      const { error: deleteError } = await supabase
        .from('post_categories')
        .delete()
        .eq('post_id', postId);

      if (deleteError) {
        console.error('Error deleting existing post categories:', deleteError);
        throw new Error(`Failed to delete existing categories: ${deleteError.message}`);
      }

      // Then, insert new links
      if (categoryIds.length > 0) {
        const links = categoryIds.map(categoryId => ({
          post_id: postId,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabase
          .from('post_categories')
          .insert(links);

        if (insertError) {
          console.error('Error linking categories to post:', insertError);
          throw new Error(`Failed to link categories: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in linkToPost:', error);
      throw error;
    }
  },
};

export default categoryService;
