import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { findMockTournament, mockTournaments } from '../../../../data/mock-tournaments'

// Helper om te detecteren of een string een UUID is
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// GET - Haal tournament op via slug of ID
// Detecteert automatisch of de parameter een UUID (ID) of een slug is
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check if Supabase is properly configured
    const isConfigured = isSupabaseConfigured()
    
    const { slug } = await params
    
    if (!isConfigured) {
      const mock = findMockTournament(slug)
      if (mock) {
        return NextResponse.json({ tournament: mock, warning: 'Supabase niet geconfigureerd - mock data' })
      }
      return NextResponse.json(
        { error: 'Supabase niet geconfigureerd en mock toernooi niet gevonden', tournaments: mockTournaments },
        { status: 404 }
      )
    }
    const identifier = slug
    
    console.log('API route received identifier:', identifier)
    
    // Check if it's a UUID (ID) or a slug
    const isId = isUUID(identifier)
    console.log('Is UUID:', isId)
    
    // Get fresh Supabase client with current env vars
    const supabase = getSupabase()
    
    let query = supabase
      .from('tournaments')
      .select('*')
    
    if (isId) {
      // It's an ID, fetch by ID (no status filter for editing)
      console.log('Fetching by ID:', identifier)
      query = query.eq('id', identifier)
    } else {
      // It's a slug, fetch by slug (only published tournaments)
      console.log('Fetching by slug:', identifier)
      query = query.eq('slug', identifier).eq('status', 'published')
    }
    
    console.log('Executing Supabase query...')
    const { data, error } = await query.single()
    console.log('Query result:', { hasData: !!data, hasError: !!error })
    
    if (error) {
      // Log de volledige error voor debugging
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        identifier,
        isId,
        fullError: JSON.stringify(error, null, 2)
      })
      
      // Check for API key errors - alleen als het echt een API key error is
      // PGRST302 = Invalid API key
      // PGRST301 kan RLS zijn OF API key, check message
      const isApiKeyError = (
        error.code === 'PGRST302' ||
        (error.code === 'PGRST301' && (
          error.message?.includes('Invalid API key') || 
          error.message?.includes('JWT') ||
          error.message?.includes('JWT expired') ||
          error.message?.includes('JWT secret')
        )) ||
        error.message?.includes('Invalid API key') || 
        (error.message?.includes('JWT') && error.message?.includes('invalid'))
      )
      
      // Check for RLS/permission errors
      const isRLSError = (
        error.code === 'PGRST301' && !isApiKeyError ||
        error.message?.includes('permission') || 
        error.message?.includes('policy') ||
        error.message?.includes('RLS') ||
        error.message?.includes('row-level security')
      )
      
      if (isApiKeyError) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.error('⚠️ Supabase API key error detected:', {
          errorCode: error.code,
          errorMessage: error.message,
          hasUrl: !!url,
          hasKey: !!key,
          urlLength: url?.length || 0,
          keyLength: key?.length || 0,
          urlStartsWith: url?.substring(0, 30) || 'none',
          keyLastChars: key ? '***' + key.slice(-10) : 'none',
          urlIsPlaceholder: url === 'https://placeholder.supabase.co',
          keyIsPlaceholder: key === 'placeholder-key'
        })
        
        return NextResponse.json(
          { 
            error: 'Supabase API key error. Controleer je NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local en herstart de development server.',
            code: error.code,
            hint: 'Zorg dat je .env.local in de project root staat en herstart met: npm run dev',
            debug: {
              hasUrl: !!url,
              hasKey: !!key,
              urlLength: url?.length || 0,
              keyLength: key?.length || 0
            }
          },
          { status: 401 }
        )
      }
      
      if (isRLSError) {
        console.warn('⚠️ RLS policy issue - check Supabase RLS policies')
        return NextResponse.json(
          { 
            error: 'Toegang geweigerd. Controleer je Supabase RLS policies.',
            code: error.code,
            hint: 'Zorg dat je RLS policies correct zijn ingesteld in Supabase Dashboard'
          },
          { status: 403 }
        )
      }
      
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Tournament niet gevonden' },
          { status: 404 }
        )
      }
      
      // Generic error - return the actual error message
      return NextResponse.json(
        { 
          error: error.message || 'Database fout',
          code: error.code,
          details: error.details,
          hint: error.hint || 'Controleer de server logs voor meer details'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ tournament: data })
  } catch (error: unknown) {
    console.error('Error fetching tournament:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch tournament'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}



