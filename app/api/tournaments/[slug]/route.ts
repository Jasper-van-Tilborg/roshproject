import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// GET - Haal tournament op via slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
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



