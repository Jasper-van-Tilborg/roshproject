import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_PROJECT_URL'
]

const SUPABASE_ANON_KEY_KEYS = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLIC_ANON_KEY'
]

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

function resolveEnvValue(keys: string[]): { value: string; source?: string } {
  for (const key of keys) {
    const raw = process.env[key]
    if (raw && raw.trim()) {
      return { value: raw.trim(), source: key }
    }
  }
  return { value: '' }
}

function getSupabaseConfig() {
  const resolvedUrl = resolveEnvValue(SUPABASE_URL_KEYS)
  const resolvedKey = resolveEnvValue(SUPABASE_ANON_KEY_KEYS)

  return {
    url: resolvedUrl.value || PLACEHOLDER_URL,
    key: resolvedKey.value || PLACEHOLDER_KEY,
    sources: {
      url: resolvedUrl.source,
      key: resolvedKey.source
    }
  }
}

// Helper function to get Supabase client with current environment variables
// This ensures we always use the latest env vars, not cached values
function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig()
  
  // Log in development to help debug
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating Supabase client:', {
      urlLength: config.url.length,
      keyLength: config.key.length,
      urlStartsWith: config.url.substring(0, 20),
      keyLastChars: config.key ? '***' + config.key.slice(-10) : 'none',
      urlIsPlaceholder: config.url === PLACEHOLDER_URL,
      keyIsPlaceholder: config.key === PLACEHOLDER_KEY,
      urlSource: config.sources.url || 'not set',
      keySource: config.sources.key || 'not set'
    })
  }
  
  return createClient(config.url, config.key)
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
  const url = resolveEnvValue(SUPABASE_URL_KEYS).value
  const key = resolveEnvValue(SUPABASE_ANON_KEY_KEYS).value
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase config check:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
      urlIsPlaceholder: url === PLACEHOLDER_URL,
      keyIsPlaceholder: key === PLACEHOLDER_KEY,
      urlStartsWith: url?.substring(0, 20) || 'none',
      keyLastChars: key ? '***' + key.slice(-10) : 'none'
    })
  }
  
  return !!(
    url && 
    key &&
    url !== PLACEHOLDER_URL &&
    key !== PLACEHOLDER_KEY &&
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



