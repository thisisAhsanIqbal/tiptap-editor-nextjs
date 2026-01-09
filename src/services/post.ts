// Re-export from Supabase service for backward compatibility
// This allows existing imports from @/services/post to continue working
export type { Post } from "@/lib/supabase/post";
export { default as postService } from "@/lib/supabase/post";

// Also export as default for backward compatibility
import postServiceDefault from "@/lib/supabase/post";
export default postServiceDefault;
