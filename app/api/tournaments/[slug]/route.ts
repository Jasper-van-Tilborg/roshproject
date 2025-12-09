import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '../../../../lib/supabase'

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const isConfigured = isSupabaseConfigured()
    
    const { slug } = await params
    
    if (!isConfigured) {
      console.error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
      return NextResponse.json(
        { error: 'Supabase is not configured. Please configure your environment variables.' },
        { status: 500 }
      )
    }
    const identifier = slug
    
    const isId = isUUID(identifier)
    
    const supabase = getSupabase()
    
    let query = supabase
      .from('tournaments')
      .select('*')
    
    if (isId) {
      query = query.eq('id', identifier)
    } else {
      query = query.eq('slug', identifier).eq('status', 'published')
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        identifier,
        isId,
        fullError: JSON.stringify(error, null, 2)
      })
      
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
        return NextResponse.json(
          { error: 'Tournament niet gevonden' },
          { status: 404 }
        )
      }
      
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



