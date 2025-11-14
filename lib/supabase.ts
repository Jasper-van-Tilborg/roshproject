import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Use dummy values during build time if env vars are not set
// This prevents build failures on Vercel when env vars are not configured yet
const buildTimeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const buildTimeKey = supabaseAnonKey || 'placeholder-key'

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    console.warn('Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
  }
}

export const supabase = createClient(buildTimeUrl, buildTimeKey)

// Database types
export interface Tournament {
  id?: string
  name: string
  description: string
  location: string
  start_date: string
  end_date: string | null
  max_participants: string
  entry_fee: string
  prize_pool: string
  primary_color: string
  secondary_color: string
  status: 'draft' | 'published'
  slug: string
  created_at?: string
  updated_at?: string
  generated_code_html: string
  generated_code_css: string
  generated_code_js: string
  generated_code_full: string
  wizard_answers: Record<string, unknown>
  custom_components?: Array<Record<string, unknown>>
}



