import { type JSONContent } from "@tiptap/react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import categoryService from "./category";

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

// Map database row to Post type
const mapRowToPost = (row: PostRow): Post => ({
  title: row.title,
  html: row.html,
  json: row.json,
  cover: row.cover || '',
  author: row.author,
  readingTime: row.reading_time,
  createdAt: row.created_at,
  id: row.id, // Add id to Post type if needed
  metaTitle: row.meta_title || '',
  metaDescription: row.meta_description || '',
  published: row.published ?? false,
  slug: row.slug || '',
});

export type Post = {
  id?: string;
  title: string;
  html: string;
  json: JSONContent;
  cover: string;
  author: string;
  readingTime: number;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  published?: boolean;
  slug?: string;
};

// Get a single post by ID or slug
const getPost = async (idOrSlug?: string): Promise<Post | null> => {
  try {
    // If ID or slug provided, get specific post
    if (idOrSlug) {
      // Check if it looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let data = null;
      let error = null;
      
      // Priority: Always try by slug first (for SEO-friendly URLs)
      // If not found by slug, fallback to ID
      // If parameter is a UUID, try by ID first, then slug
      if (isUUID) {
        // It's a UUID, try by ID first
        const idResult = await supabase
          .from('posts')
          .select('*')
          .eq('id', idOrSlug)
          .single();
        
        if (idResult.data) {
          data = idResult.data;
        } else {
          // Not found by ID, try by slug as fallback
          const slugResult = await supabase
            .from('posts')
            .select('*')
            .eq('slug', idOrSlug)
            .single();
          data = slugResult.data;
          error = slugResult.error;
        }
      } else {
        // Not a UUID, try by slug first (priority)
        const slugResult = await supabase
          .from('posts')
          .select('*')
          .eq('slug', idOrSlug)
          .single();
        
        if (slugResult.data) {
          data = slugResult.data;
        } else if (slugResult.error && slugResult.error.code === 'PGRST116') {
          // Not found by slug, try by ID as fallback (in case slug is missing in DB)
          const idResult = await supabase
            .from('posts')
            .select('*')
            .eq('id', idOrSlug)
            .single();
          data = idResult.data;
          error = idResult.error;
        } else {
          error = slugResult.error;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching post by ID or slug:', {
          idOrSlug,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      if (!data) {
        console.warn('No post found with ID or slug:', idOrSlug);
        return null;
      }

      const post = mapRowToPost(data);
      // Fetch categories for this post
      try {
        const categories = await categoryService.getByPostId(data.id);
        post.categoryIds = categories.map(cat => cat.id);
      } catch (error) {
        console.warn('Error fetching categories for post:', error);
        post.categoryIds = [];
      }
      return post;
    }

    // If no ID provided, return null (for creating new posts)
    // Don't fetch the latest post - let the form start empty
    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
};

// Get all posts
const getAllPosts = async (): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data ? data.map(mapRowToPost) : [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Helper function to extract error message from Supabase error
const getErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  // Supabase errors have a specific structure
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.details) {
    return `${error.message || 'Error'}: ${error.details}`;
  }
  
  // Try to stringify if it's an object
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error occurred';
  }
};

// Save or update a post
const savePost = async (postData: Partial<Post>): Promise<Post | null> => {
  try {
    // Get current user if authenticated (optional - only if using RLS with user_id)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.warn('Auth error (non-critical):', authError);
    }
    
    // Generate slug from title if not provided
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    const slug = postData.slug?.trim() || (postData.title ? generateSlug(postData.title) : null);

    const insertData: PostInsert = {
      title: postData.title || '',
      html: postData.html || '',
      json: postData.json || {},
      cover: postData.cover || null,
      author: postData.author || 'Anonymous',
      reading_time: postData.readingTime || 1,
      user_id: user?.id || null, // Set user_id if authenticated
      meta_title: postData.metaTitle || null,
      meta_description: postData.metaDescription || null,
      published: postData.published ?? true, // Default to published if not specified
      slug: slug || null,
    };

    // Validate required fields
    if (!insertData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!insertData.html.trim()) {
      throw new Error('Content is required');
    }

    // If post has an ID, update it; otherwise, create new
    if (postData.id) {
      const { data, error } = await supabase
        .from('posts')
        .update(insertData)
        .eq('id', postData.id)
        .select()
        .single();

      if (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Supabase update error:', {
          message: errorMessage,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        throw new Error(`Failed to update post: ${errorMessage}`);
      }
      
      if (!data) return null;
      
      const post = mapRowToPost(data);
      
      // Save categories if provided
      if (postData.categoryIds && postData.categoryIds.length > 0) {
        try {
          await categoryService.linkToPost(data.id, postData.categoryIds);
          post.categoryIds = postData.categoryIds;
        } catch (error) {
          console.warn('Error saving categories:', error);
          // Don't throw - post was saved successfully
        }
      } else if (postData.categoryIds !== undefined) {
        // If categoryIds is explicitly empty array, remove all categories
        try {
          await categoryService.linkToPost(data.id, []);
          post.categoryIds = [];
        } catch (error) {
          console.warn('Error removing categories:', error);
        }
      } else {
        // If categoryIds not provided, fetch existing ones
        try {
          const categories = await categoryService.getByPostId(data.id);
          post.categoryIds = categories.map(cat => cat.id);
        } catch (error) {
          console.warn('Error fetching categories:', error);
          post.categoryIds = [];
        }
      }
      
      return post;
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Supabase insert error:', {
          message: errorMessage,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
          insertData: {
            ...insertData,
            json: '[JSON Content]', // Don't log full JSON
          },
        });
        throw new Error(`Failed to create post: ${errorMessage}`);
      }
      
      if (!data) return null;
      
      const post = mapRowToPost(data);
      
      // Save categories if provided
      if (postData.categoryIds && postData.categoryIds.length > 0) {
        try {
          await categoryService.linkToPost(data.id, postData.categoryIds);
          post.categoryIds = postData.categoryIds;
        } catch (error) {
          console.warn('Error saving categories:', error);
          // Don't throw - post was created successfully
        }
      } else {
        post.categoryIds = [];
      }
      
      return post;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : getErrorMessage(error);
    console.error('Error saving post:', {
      message: errorMessage,
      error,
    });
    throw new Error(errorMessage);
  }
};

// Delete a post
const deletePost = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

const postService = {
  get: getPost,
  getAll: getAllPosts,
  save: savePost,
  delete: deletePost,
};

export default postService;