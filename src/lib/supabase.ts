import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          status: 'Pending' | 'Generated'
          offer_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          status?: 'Pending' | 'Generated'
          offer_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          status?: 'Pending' | 'Generated'
          offer_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      company_settings: {
        Row: {
          id: string
          company_name: string
          company_address: string
          company_website: string
          company_phone: string
          logo_url: string
          primary_color: string
          sender_name: string
          sender_email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name?: string
          company_address?: string
          company_website?: string
          company_phone?: string
          logo_url?: string
          primary_color?: string
          sender_name?: string
          sender_email?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_address?: string
          company_website?: string
          company_phone?: string
          logo_url?: string
          primary_color?: string
          sender_name?: string
          sender_email?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
