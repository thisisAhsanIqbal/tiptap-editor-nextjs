import { type JSONContent } from "@tiptap/react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

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
};

// Get a single post by ID
const getPost = async (id?: string): Promise<Post | null> => {
  try {
    // If ID provided, get specific post
    if (id) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post by ID:', {
          id,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      if (!data) {
        console.warn('No post found with ID:', id);
        return null;
      }

      return mapRowToPost(data);
    }

    // If no ID, get the latest post
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest post:', error);
      return null;
    }

    return data ? mapRowToPost(data) : null;
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
    
    const insertData: PostInsert = {
      title: postData.title || '',
      html: postData.html || '',
      json: postData.json || {},
      cover: postData.cover || null,
      author: postData.author || 'Anonymous',
      reading_time: postData.readingTime || 1,
      user_id: user?.id || null, // Set user_id if authenticated
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
      return data ? mapRowToPost(data) : null;
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
      return data ? mapRowToPost(data) : null;
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