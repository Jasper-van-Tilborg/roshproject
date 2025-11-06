import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// GET - Haal tournament op via slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
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
  } catch (error: any) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}


