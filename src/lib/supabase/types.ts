export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      post_categories: {
        Row: {
          post_id: string
          category_id: string
        }
        Insert: {
          post_id: string
          category_id: string
        }
        Update: {
          post_id?: string
          category_id?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          html: string
          json: any // JSONContent from TipTap
          cover: string | null
          author: string
          reading_time: number
          created_at: string
          updated_at: string
          user_id?: string | null
          published?: boolean
          slug?: string | null
          excerpt?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Insert: {
          id?: string
          title: string
          html: string
          json: any
          cover?: string | null
          author: string
          reading_time?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          published?: boolean
          slug?: string | null
          excerpt?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          id?: string
          title?: string
          html?: string
          json?: any
          cover?: string | null
          author?: string
          reading_time?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          published?: boolean
          slug?: string | null
          excerpt?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
        }
      }
    }
  }
}
