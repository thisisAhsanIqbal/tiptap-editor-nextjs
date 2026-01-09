export type Database = {
  public: {
    Tables: {
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
        }
      }
    }
  }
}
