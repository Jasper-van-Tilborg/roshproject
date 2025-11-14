import { NextRequest, NextResponse } from 'next/server'
import { supabase, Tournament } from '../../../lib/supabase'

// GET - Haal alle tournaments op (met optionele status filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'draft' of 'published' of null voor alle
    
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ tournaments: data || [] })
  } catch (error: unknown) {
    console.error('Error fetching tournaments:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch tournaments'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// POST - Maak nieuw tournament aan
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
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Debug logging
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

// PUT - Update bestaand tournament
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
    
    // Generate slug if name changed
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
    
    // Debug logging
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

// DELETE - Verwijder tournament
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

