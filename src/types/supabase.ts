export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          content: Json
          user_id: string
          created_at: string
          updated_at: string
          is_public: boolean
          version: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: Json
          user_id: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          version?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          version?: number
        }
      }
    }
  }
}