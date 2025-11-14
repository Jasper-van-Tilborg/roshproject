import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Helper function to get Supabase client with current environment variables
// This ensures we always use the latest env vars, not cached values
function getSupabaseClient(): SupabaseClient {
  // Get env vars and trim whitespace (in case they're on one line)
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim() || 'https://placeholder.supabase.co'
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'placeholder-key'
  
  // Log in development to help debug
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating Supabase client:', {
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
      urlStartsWith: supabaseUrl.substring(0, 20),
      keyLastChars: supabaseAnonKey ? '***' + supabaseAnonKey.slice(-10) : 'none',
      urlIsPlaceholder: supabaseUrl === 'https://placeholder.supabase.co',
      keyIsPlaceholder: supabaseAnonKey === 'placeholder-key'
    })
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create client - will be recreated on each access to ensure fresh env vars
// Use getSupabaseClient() in API routes instead of direct supabase export
export const supabase = getSupabaseClient()

// Export function to get fresh client
export function getSupabase(): SupabaseClient {
  return getSupabaseClient()
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase config check:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
      urlIsPlaceholder: url === 'https://placeholder.supabase.co',
      keyIsPlaceholder: key === 'placeholder-key',
      urlStartsWith: url?.substring(0, 20) || 'none',
      keyLastChars: key ? '***' + key.slice(-10) : 'none'
    })
  }
  
  return !!(
    url && 
    key &&
    url !== 'https://placeholder.supabase.co' &&
    key !== 'placeholder-key' &&
    url.length > 0 &&
    key.length > 0
  )
}

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



