import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, Tournament, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // Return 200 with empty array instead of 500 - this is not a server error,
      // just missing configuration. The client can handle empty arrays gracefully.
      console.warn('Supabase is not configured. Returning empty tournaments array. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
      return NextResponse.json(
        { 
          tournaments: [] 
        },
        { status: 200 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    const supabase = getSupabase()
    
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Handle invalid API key error
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT') || error.code === 'PGRST301') {
        console.error('Invalid Supabase API key. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
        return NextResponse.json(
          { 
            error: 'Invalid API key. Please check your Supabase configuration in your environment variables.',
            code: error.code,
            tournaments: [] 
          },
          { status: 401 }
        )
      }
      
      // Return empty array instead of error if it's a permission/RLS issue
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        console.warn('RLS policy issue - returning empty array. Check Supabase RLS policies.')
        return NextResponse.json({ tournaments: [] })
      }
      
      return NextResponse.json(
        { 
          error: error.message || 'Database error',
          code: error.code,
          tournaments: [] 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ tournaments: data || [] })
  } catch (error: unknown) {
    console.error('Error fetching tournaments:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch tournaments'
    return NextResponse.json(
      { 
        error: message,
        tournaments: [] 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      maxParticipants,
      entryFee,
      prizePool,
      primaryColor,
      secondaryColor,
      status,
      generatedCode,
      wizardAnswers,
      customComponents
    } = body
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    console.log('Received generatedCode:', {
      hasHtml: !!generatedCode?.html,
      htmlLength: generatedCode?.html?.length || 0,
      hasCss: !!generatedCode?.css,
      cssLength: generatedCode?.css?.length || 0,
      hasJs: !!generatedCode?.js,
      jsLength: generatedCode?.js?.length || 0,
      hasFull: !!generatedCode?.full,
      fullLength: generatedCode?.full?.length || 0
    });

    const tournamentData: Tournament = {
      name,
      description: description || '',
      location: location || '',
      start_date: startDate || '',
      end_date: endDate || null,
      max_participants: String(maxParticipants || 8),
      entry_fee: entryFee || '',
      prize_pool: prizePool || '',
      primary_color: primaryColor || '#3B82F6',
      secondary_color: secondaryColor || '#10B981',
      status: status || 'draft',
      slug,
      generated_code_html: generatedCode?.html || '',
      generated_code_css: generatedCode?.css || '',
      generated_code_js: generatedCode?.js || '',
      generated_code_full: generatedCode?.full || '',
      wizard_answers: wizardAnswers || {},
      custom_components: customComponents || []
    }
    
    console.log('Tournament data to save:', {
      htmlLength: tournamentData.generated_code_html.length,
      cssLength: tournamentData.generated_code_css.length,
      jsLength: tournamentData.generated_code_js.length,
      fullLength: tournamentData.generated_code_full.length
    });
    
    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ tournament: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating tournament:', error)
    const message = error instanceof Error ? error.message : 'Failed to create tournament'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      id,
      name,
      description,
      location,
      startDate,
      endDate,
      maxParticipants,
      entryFee,
      prizePool,
      primaryColor,
      secondaryColor,
      status,
      generatedCode,
      wizardAnswers,
      customComponents
    } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      )
    }
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const updateData: Partial<Tournament> = {
      name,
      description: description || '',
      location: location || '',
      start_date: startDate || '',
      end_date: endDate || null,
      max_participants: String(maxParticipants || 8),
      entry_fee: entryFee || '',
      prize_pool: prizePool || '',
      primary_color: primaryColor || '#3B82F6',
      secondary_color: secondaryColor || '#10B981',
      status: status || 'draft',
      slug,
      updated_at: new Date().toISOString()
    }
    
    console.log('PUT - Received generatedCode:', {
      hasHtml: !!generatedCode?.html,
      htmlLength: generatedCode?.html?.length || 0,
      hasCss: !!generatedCode?.css,
      cssLength: generatedCode?.css?.length || 0,
      hasJs: !!generatedCode?.js,
      jsLength: generatedCode?.js?.length || 0,
      hasFull: !!generatedCode?.full,
      fullLength: generatedCode?.full?.length || 0
    });

    if (generatedCode) {
      updateData.generated_code_html = generatedCode.html || ''
      updateData.generated_code_css = generatedCode.css || ''
      updateData.generated_code_js = generatedCode.js || ''
      updateData.generated_code_full = generatedCode.full || ''
    }
    
    console.log('PUT - Update payload:', {
      htmlLength: updateData.generated_code_html?.length || 0,
      cssLength: updateData.generated_code_css?.length || 0,
      jsLength: updateData.generated_code_js?.length || 0,
      fullLength: updateData.generated_code_full?.length || 0
    });
    
    if (wizardAnswers) {
      updateData.wizard_answers = wizardAnswers
    }
    
    if (customComponents) {
      updateData.custom_components = customComponents
    }
    
    // Get fresh Supabase client with current env vars
    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ tournament: data })
  } catch (error: unknown) {
    console.error('Error updating tournament:', error)
    const message = error instanceof Error ? error.message : 'Failed to update tournament'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabase()
    
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting tournament:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete tournament'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

