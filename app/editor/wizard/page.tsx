'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateTournamentTemplate } from '../../utils/claude-template-generator'
import ComponentEditor from '../../components/ComponentEditor'
import DarkVeil from '../../components/DarkVeil'
import Link from 'next/link'
import LoadingOverlay from '../../components/LoadingOverlay'

interface WizardStep {
  id: string
  title: string
  questions: Array<{
    id: string
    question: string
    type: 'text' | 'textarea' | 'select' | 'number' | 'color' | 'checkbox'
    placeholder?: string
    options?: Array<{ value: string; label: string }>
    required?: boolean
    dependsOn?: string
  }>
}

const wizardSteps: WizardStep[] = [
  {
    id: 'basic',
    title: 'Basis Informatie',
    questions: [
      {
        id: 'tournament_name',
        question: 'Wat is de naam van je toernooi?',
        type: 'text',
        placeholder: 'Bijv. Winter Championship 2025',
        required: true
      },
      {
        id: 'tournament_description',
        question: 'Beschrijf je toernooi (wat maakt het uniek?)',
        type: 'textarea',
        placeholder: 'Een spannend toernooi voor...',
        required: true
      },
      {
        id: 'tournament_date',
        question: 'Wanneer vindt het toernooi plaats?',
        type: 'text',
        placeholder: 'Bijv. 25 oktober 2025',
        required: true
      },
      {
        id: 'tournament_location',
        question: 'Waar vindt het toernooi plaats?',
        type: 'text',
        placeholder: 'Bijv. Comic Con Rotterdam',
        required: true
      }
    ]
  },
  {
    id: 'game',
    title: 'Game Details',
    questions: [
      {
        id: 'game_type',
        question: 'Welk spel wordt er gespeeld?',
        type: 'select',
        options: [
          { value: 'CS2', label: 'Counter-Strike 2' },
          { value: 'Valorant', label: 'Valorant' },
          { value: 'League of Legends', label: 'League of Legends' },
          { value: 'Dota 2', label: 'Dota 2' },
          { value: 'Rocket League', label: 'Rocket League' },
          { value: 'FIFA', label: 'FIFA' },
          { value: 'Overwatch', label: 'Overwatch' },
          { value: 'Anders', label: 'Anders' }
        ],
        required: true
      },
      {
        id: 'participants',
        question: 'Hoeveel teams/deelnemers?',
        type: 'number',
        placeholder: 'Bijv. 8, 16, 32',
        required: true
      },
      {
        id: 'bracket_type',
        question: 'Welk bracket type?',
        type: 'select',
        options: [
          { value: 'single_elimination', label: 'Single Elimination' },
          { value: 'double_elimination', label: 'Double Elimination' },
          { value: 'group_stage', label: 'Group Stage' },
          { value: 'round_robin', label: 'Round Robin' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'design',
    title: 'Design & Styling',
    questions: [
      {
        id: 'primary_color',
        question: 'Primaire kleur (accent kleur)',
        type: 'color',
        required: true
      },
      {
        id: 'secondary_color',
        question: 'Secundaire kleur',
        type: 'color',
        required: true
      },
      {
        id: 'font_family',
        question: 'Lettertype voorkeur',
        type: 'select',
        options: [
          { value: 'Inter', label: 'Inter' },
          { value: 'Roboto', label: 'Roboto' },
          { value: 'Open Sans', label: 'Open Sans' },
          { value: 'Poppins', label: 'Poppins' },
          { value: 'Montserrat', label: 'Montserrat' },
          { value: 'Playfair Display', label: 'Playfair Display' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'components',
    title: 'Componenten',
    questions: [
      {
        id: 'include_teams',
        question: 'Teams/Bracket weergave toevoegen?',
        type: 'checkbox',
        required: false
      },
      {
        id: 'include_twitch',
        question: 'Twitch livestream toevoegen?',
        type: 'checkbox',
        required: false
      },
      {
        id: 'include_sponsors',
        question: 'Sponsors sectie toevoegen?',
        type: 'checkbox',
        required: false
      },
      {
        id: 'include_schedule',
        question: 'Programma/Schedule toevoegen?',
        type: 'checkbox',
        required: false
      },
      {
        id: 'include_registration',
        question: 'Inschrijving formulier toevoegen?',
        type: 'checkbox',
        required: false
      },
      {
        id: 'include_social',
        question: 'Social media links toevoegen?',
        type: 'checkbox',
        required: false
      }
    ]
  }
]

function WizardPageContent() {
  const searchParams = useSearchParams()
  const isEditMode = searchParams?.get('edit') === 'true'
  
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>('')
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [generatedCode, setGeneratedCode] = useState<{
    html: string
    css: string
    js: string
    full: string
  } | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tournamentName, setTournamentName] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null)

  // Memoize onCodeChange callback to prevent infinite loops
  const handleCodeChange = useCallback((html: string, css: string, js: string) => {
    setGeneratedCode(prev => {
      if (!prev) return prev
      return {
        ...prev,
        html,
        css,
        js,
        full: ''
      }
    })
  }, [])

  // Load existing tournament data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Load tournament ID
      const editingId = localStorage.getItem('editingTournamentId')
      if (editingId) {
        setEditingTournamentId(editingId)
        localStorage.removeItem('editingTournamentId')
      }

      // Load tournament name
      const editingName = localStorage.getItem('editingTournamentName')
      if (editingName) {
        setTournamentName(editingName)
        localStorage.removeItem('editingTournamentName')
      }

      // Load generated code
      const editingCode = localStorage.getItem('editingTournamentCode')
      if (editingCode) {
        try {
          const codeData = JSON.parse(editingCode)
          setGeneratedCode({
            html: codeData.html || '',
            css: codeData.css || '',
            js: codeData.js || '',
            full: codeData.full || ''
          })
          setShowEditor(true) // Open editor directly
          localStorage.removeItem('editingTournamentCode')
        } catch (error) {
          console.error('Error parsing editing tournament code:', error)
        }
      }

      // Load wizard answers if available
      const editingAnswers = localStorage.getItem('editingTournamentAnswers')
      if (editingAnswers) {
        try {
          const answersData = JSON.parse(editingAnswers)
          setAnswers(answersData)
          localStorage.removeItem('editingTournamentAnswers')
        } catch (error) {
          console.error('Error parsing editing tournament answers:', error)
        }
      }
    }
  }, [isEditMode])

  // Generate slug from tournament name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Save as draft
  const handleSaveDraft = useCallback(async () => {
    if (!tournamentName.trim()) {
      const defaultName = String(answers.tournament_name || 'Nieuw Toernooi')
      setTournamentName(defaultName)
    }

    const name = String(tournamentName.trim() || answers.tournament_name || 'Nieuw Toernooi')
    
    if (!generatedCode) {
      alert('Genereer eerst een website voordat je opslaat!')
      return
    }

    setIsSaving(true)

    try {
      // Combine HTML/CSS/JS into full HTML
      const fullHtml = generatedCode.html.includes('<!DOCTYPE') 
        ? generatedCode.html
        : `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>${generatedCode.css}</style>
</head>
<body>
    ${generatedCode.html}
    <script>${generatedCode.js}</script>
</body>
</html>`

      console.log('handleSaveDraft - generatedCode before save:', {
        htmlLength: generatedCode.html?.length || 0,
        cssLength: generatedCode.css?.length || 0,
        jsLength: generatedCode.js?.length || 0
      });

      const tournamentData = {
        name: name,
        description: answers.tournament_description || '',
        location: answers.tournament_location || '',
        startDate: answers.tournament_date || '',
        endDate: '',
        maxParticipants: String(answers.participants || 8),
        entryFee: '',
        prizePool: '',
        primaryColor: String(answers.primary_color || '#3B82F6'),
        secondaryColor: String(answers.secondary_color || '#10B981'),
        customComponents: [],
        status: 'draft' as const,
        generatedCode: {
          html: generatedCode.html || '',
          css: generatedCode.css || '',
          js: generatedCode.js || '',
          full: fullHtml
        },
        wizardAnswers: answers
      }
      
      console.log('handleSaveDraft - tournamentData.generatedCode:', {
        htmlLength: tournamentData.generatedCode.html.length,
        cssLength: tournamentData.generatedCode.css.length,
        jsLength: tournamentData.generatedCode.js.length,
        fullLength: tournamentData.generatedCode.full.length
      });

      // Check if we're editing an existing tournament
      let existingTournament: { id: string; name: string } | null = null
      
      if (editingTournamentId) {
        // We're editing an existing tournament, use the ID
        existingTournament = { id: editingTournamentId, name }
      } else {
        // Check if tournament with same name already exists
        const existingResponse = await fetch(`/api/tournaments?status=draft`)
        if (existingResponse.ok) {
          const existingData = await existingResponse.json() as { tournaments?: Array<{ id: string; name: string }> }
          existingTournament = existingData.tournaments?.find((t) => t.name === name) || null
        }
      }

      // Save to Supabase (POST for new, PUT for update)
      const response = await fetch('/api/tournaments', {
        method: existingTournament ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tournamentData,
          ...(existingTournament && { id: existingTournament.id })
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      const result = await response.json()
      
      // Also save to localStorage as backup
      try {
        const savedTournaments = localStorage.getItem('tournaments')
        let tournaments: Array<Record<string, unknown>> = []
        
        if (savedTournaments) {
          tournaments = JSON.parse(savedTournaments)
        }
        
        tournaments.push({
          ...tournamentData,
          id: result.tournament.id,
          createdAt: result.tournament.created_at
        })
        
        localStorage.setItem('tournaments', JSON.stringify(tournaments))
      } catch (localError) {
        console.warn('Failed to save to localStorage:', localError)
      }
      
      alert('✅ Draft opgeslagen in database! Je kunt deze later bewerken vanuit het dashboard.')
      setIsSaving(false)
    } catch (error: unknown) {
      console.error('Error saving draft:', error)
      const message = error instanceof Error ? error.message : 'Probeer het opnieuw.'
      alert(`❌ Fout bij opslaan: ${message}`)
      setIsSaving(false)
    }
  }, [tournamentName, generatedCode, answers, editingTournamentId])

  // Publish tournament
  const handlePublish = useCallback(async () => {
    if (!tournamentName.trim()) {
      const defaultName = String(answers.tournament_name || 'Nieuw Toernooi')
      setTournamentName(defaultName)
    }

    const name = String(tournamentName.trim() || answers.tournament_name || 'Nieuw Toernooi')
    
    if (!generatedCode) {
      alert('Genereer eerst een website voordat je publiceert!')
      return
    }

    setIsSaving(true)

    try {
      // Combine HTML/CSS/JS into full HTML
      const fullHtml = generatedCode.html.includes('<!DOCTYPE') 
        ? generatedCode.html
        : `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>${generatedCode.css}</style>
</head>
<body>
    ${generatedCode.html}
    <script>${generatedCode.js}</script>
</body>
</html>`

      const slug = generateSlug(name)

        console.log('handlePublish - generatedCode before save:', {
          htmlLength: generatedCode.html?.length || 0,
          cssLength: generatedCode.css?.length || 0,
          jsLength: generatedCode.js?.length || 0
        });

        const tournamentData = {
          name: name,
          description: answers.tournament_description || '',
          location: answers.tournament_location || '',
          startDate: answers.tournament_date || '',
          endDate: '',
          maxParticipants: String(answers.participants || 8),
          entryFee: '',
          prizePool: '',
          primaryColor: String(answers.primary_color || '#3B82F6'),
          secondaryColor: String(answers.secondary_color || '#10B981'),
          customComponents: [],
          status: 'published' as const,
          generatedCode: {
            html: generatedCode.html || '',
            css: generatedCode.css || '',
            js: generatedCode.js || '',
            full: fullHtml
          },
          wizardAnswers: answers
        }
        
        console.log('handlePublish - tournamentData.generatedCode:', {
          htmlLength: tournamentData.generatedCode.html.length,
          cssLength: tournamentData.generatedCode.css.length,
          jsLength: tournamentData.generatedCode.js.length,
          fullLength: tournamentData.generatedCode.full.length
        });

      // Check if we're editing an existing tournament
      let existingTournament: { id: string; name: string; status: string } | null = null
      
      if (editingTournamentId) {
        // We're editing an existing tournament, use the ID
        existingTournament = { id: editingTournamentId, name, status: 'published' }
      } else {
        // Check if tournament with same name already exists
        const existingResponse = await fetch('/api/tournaments')
        if (existingResponse.ok) {
          const existingData = await existingResponse.json() as { tournaments?: Array<{ id: string; name: string; status: string }> }
          existingTournament = existingData.tournaments?.find((t) => 
            t.name === name && (t.status === 'published' || t.status === 'draft')
          ) || null
        }
      }

      // Save to Supabase (POST for new, PUT for update)
      const response = await fetch('/api/tournaments', {
        method: existingTournament ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tournamentData,
          ...(existingTournament && { id: existingTournament.id })
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish tournament')
      }

      const result = await response.json()
      
      // Also save to localStorage as backup
      try {
        const savedTournaments = localStorage.getItem('tournaments')
        let tournaments: Array<Record<string, unknown>> = []
        
        if (savedTournaments) {
          tournaments = JSON.parse(savedTournaments) as Array<Record<string, unknown>>
        }
        
        tournaments.push({
          ...tournamentData,
          id: result.tournament.id,
          createdAt: result.tournament.created_at,
          slug: slug
        })
        
        localStorage.setItem('tournaments', JSON.stringify(tournaments))
      } catch (localError) {
        console.warn('Failed to save to localStorage:', localError)
      }
      
      alert(`✅ Website gepubliceerd in database! Bekijk hem op: /${slug}`)
      setIsSaving(false)
      
      // Optionally redirect to published page
      // window.location.href = `/${slug}`
    } catch (error: unknown) {
      console.error('Error publishing:', error)
      const message = error instanceof Error ? error.message : 'Probeer het opnieuw.'
      alert(`❌ Fout bij publiceren: ${message}`)
      setIsSaving(false)
    }
  }, [tournamentName, generatedCode, answers, editingTournamentId])

  const handleAnswer = (questionId: string, value: string | number | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const canProceed = () => {
    const step = wizardSteps[currentStep]
    return step.questions.every(q => {
      if (q.required && !q.dependsOn) {
        return answers[q.id] !== undefined && answers[q.id] !== ''
      }
      return true
    })
  }

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generateWebsite = async () => {
    setIsGenerating(true)
    setError(null)
    setGenerationProgress(0)
    setGenerationStatus('Initialiseren...')
    
    try {
      // Simuleer progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev
          const newProgress = prev + Math.random() * 3
          
          // Update status based on progress
          if (newProgress < 20) {
            setGenerationStatus('Configuratie verwerken...')
          } else if (newProgress < 40) {
            setGenerationStatus('HTML genereren...')
          } else if (newProgress < 60) {
            setGenerationStatus('CSS styling toevoegen...')
          } else if (newProgress < 80) {
            setGenerationStatus('JavaScript functionaliteit...')
          } else {
            setGenerationStatus('Finaliseren...')
          }
          
          return Math.min(90, newProgress)
        })
      }, 800)
      
      // Convert wizard answers to format expected by generateTournamentTemplate
      setGenerationStatus('Configuratie verwerken...')
      setGenerationProgress(10)
      
      const formattedAnswers: Record<string, string | number | boolean> = {
        tournament_name: String(answers.tournament_name || ''),
        tournament_description: String(answers.tournament_description || ''),
        tournament_date: String(answers.tournament_date || ''),
        tournament_location: String(answers.tournament_location || ''),
        game_type: String(answers.game_type || 'CS2'),
        participants: Number(answers.participants || 8),
        bracket_type: String(answers.bracket_type || 'single_elimination'),
        primary_color: String(answers.primary_color || '#3B82F6'),
        secondary_color: String(answers.secondary_color || '#10B981'),
        font_family: String(answers.font_family || 'Inter'),
        include_teams: Boolean(answers.include_teams),
        include_twitch: Boolean(answers.include_twitch),
        include_sponsors: Boolean(answers.include_sponsors),
        include_schedule: Boolean(answers.include_schedule),
        include_registration: Boolean(answers.include_registration),
        include_social: Boolean(answers.include_social),
      }
      
      setGenerationStatus('Claude AI genereert je website...')
      setGenerationProgress(30)
      
      const result = await generateTournamentTemplate(formattedAnswers)
      
      clearInterval(progressInterval)
      setGenerationProgress(95)
      setGenerationStatus('Website bijna klaar!')
      
      if (result.success && result.code) {
        // Als we componenten hebben (van de nieuwe parser met HTML/CSS/JS separaat)
        if (result.components) {
          // Gebruik components, zelfs als CSS of JS leeg is
          setGeneratedCode({
            html: result.components.html || '',
            css: result.components.css || '',
            js: result.components.js || '',
            full: result.code
          })
          console.log('Generated code set:', {
            htmlLength: result.components.html?.length || 0,
            cssLength: result.components.css?.length || 0,
            jsLength: result.components.js?.length || 0
          });
        } else {
          // Parse de code om HTML, CSS en JS te extraheren
          let html = result.code
          let css = ''
          let js = ''

          // Probeer CSS en JS te extraheren uit de HTML
          const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
          const jsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i)

          if (cssMatch) {
            css = cssMatch[1].trim()
            // Verwijder style tag maar behoud HTML structuur
            html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '')
          }

          if (jsMatch) {
            js = jsMatch[1].trim()
            // Verwijder script tag maar behoud HTML structuur
            html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/i, '')
          }

          // Als er geen style/script tags zijn, probeer code blocks te parsen
          if (!css && !js) {
            const codeBlocks = result.code.match(/```(html|css|javascript|js)\s*\n([\s\S]*?)\n```/gi)
            if (codeBlocks) {
              codeBlocks.forEach(block => {
                const match = block.match(/```(html|css|javascript|js)\s*\n([\s\S]*?)\n```/i)
                if (match) {
                  const type = match[1].toLowerCase()
                  const content = match[2].trim()
                  if (type === 'html' || type === 'htm') {
                    html = content
                  } else if (type === 'css') {
                    css = content
                  } else if (type === 'javascript' || type === 'js') {
                    js = content
                  }
                }
              })
            }
          }

          // Fallback: als alles nog leeg is, gebruik de volledige code als HTML
          if (!html || (!css && !js)) {
            html = result.code
          }

          setGeneratedCode({
            html: html.trim(),
            css: css.trim(),
            js: js.trim(),
            full: result.code
          })
        }
        
        setGenerationProgress(100)
        setGenerationStatus('Klaar!')
        
        // Korte delay om 100% te laten zien
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setShowEditor(true)
      } else {
        setError(result.error || 'Kon website niet genereren')
        setGenerationStatus('Fout opgetreden')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout')
      setGenerationStatus('Fout opgetreden')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  if (showEditor && generatedCode) {
    // Set tournament name from answers if not set
    if (!tournamentName && answers.tournament_name) {
      setTournamentName(String(answers.tournament_name))
    }

    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-white">Live Editor</h1>
                <p className="text-sm text-gray-400">Bewerk je website in real-time</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Toernooi naam..."
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500 w-48"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>💾</span>
              <span>{isSaving ? 'Opslaan...' : 'Opslaan als Draft'}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
              style={{
                boxShadow: !isSaving ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
              }}
            >
              <span>🚀</span>
              <span>{isSaving ? 'Publiceert...' : 'Publiceren'}</span>
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Terug
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ComponentEditor
            html={generatedCode.html}
            css={generatedCode.css}
            js={generatedCode.js}
            onCodeChange={handleCodeChange}
          />
        </div>
      </div>
    )
  }

  const step = wizardSteps[currentStep]
  const progress = ((currentStep + 1) / wizardSteps.length) * 100

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* DarkVeil achtergrond */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.03}
          scanlineIntensity={0}
          speed={0.2}
          scanlineFrequency={0.3}
          warpAmount={0.1}
          resolutionScale={1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header met terug knop */}
        <div className="mb-6">
          <Link href="/">
            <button className="mb-4 px-4 py-2 bg-gray-800 bg-opacity-60 backdrop-blur-sm border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <span>←</span>
              <span>Terug naar Home</span>
            </button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white text-lg font-semibold">
              Stap {currentStep + 1} van {wizardSteps.length}: {step.title}
            </h2>
            <span className="text-gray-300 text-sm bg-gray-800 bg-opacity-60 backdrop-blur-sm px-3 py-1 rounded-full">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-full h-3 border border-gray-700">
            <div
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
              }}
            />
          </div>
        </div>

        {/* Wizard Content */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2 text-center" style={{
            background: 'linear-gradient(45deg, #8B5CF6, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Maak Je Toernooi Website
          </h1>
          <p className="text-center text-gray-400 mb-8 text-sm">
            Beantwoord een paar vragen en laat AI je website maken
          </p>

          <div className="space-y-6">
            {step.questions.map((question) => {
              // Check if question should be shown based on dependencies
              const shouldShow = !question.dependsOn || answers[question.dependsOn]
              if (!shouldShow) return null

              return (
                <div key={question.id} className="space-y-2">
                  {question.type === 'text' && (
                    <div className="relative floating-label-input">
                      <input
                        type="text"
                        value={String(answers[question.id] || '')}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${answers[question.id] ? 'has-value' : ''}`}
                      />
                      <label className="floating-label">
                        {question.question}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                    </div>
                  )}

                  {question.type === 'textarea' && (
                    <div className="relative floating-label-input">
                      <textarea
                        value={String(answers[question.id] || '')}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none transition-all ${answers[question.id] ? 'has-value' : ''}`}
                      />
                      <label className="floating-label">
                        {question.question}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                    </div>
                  )}

                  {question.type === 'select' && (
                    <select
                      value={String(answers[question.id] || '')}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900"
                    >
                      <option value="" className="bg-gray-900">Selecteer...</option>
                      {question.options?.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'number' && (
                    <div className="relative floating-label-input">
                      <input
                        type="number"
                        value={Number(answers[question.id] || 0)}
                        onChange={(e) => handleAnswer(question.id, parseInt(e.target.value) || 0)}
                        placeholder={question.placeholder}
                        min="1"
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${answers[question.id] ? 'has-value' : ''}`}
                      />
                      <label className="floating-label">
                        {question.question}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                    </div>
                  )}

                  {question.type === 'color' && (
                    <div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={String(answers[question.id] || '#3B82F6')}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          className="w-20 h-12 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer transition-all hover:border-purple-500"
                        />
                        <div className="relative floating-label-input flex-1">
                          <input
                            type="text"
                            value={String(answers[question.id] || '#3B82F6')}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            placeholder="#3B82F6"
                            className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${answers[question.id] ? 'has-value' : ''}`}
                          />
                          <label className="floating-label">
                            {question.question}
                            {question.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.type === 'checkbox' && (
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={Boolean(answers[question.id])}
                        onChange={(e) => handleAnswer(question.id, e.target.checked)}
                        className="w-5 h-5 text-purple-500 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded focus:ring-2 focus:ring-purple-500 transition-all group-hover:border-purple-500"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">Ja, voeg dit toe</span>
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              ← Vorige
            </button>

            {currentStep < wizardSteps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                style={{
                  boxShadow: canProceed() ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                }}
              >
                Volgende →
              </button>
            ) : (
              <button
                onClick={generateWebsite}
                disabled={!canProceed() || isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
                style={{
                  boxShadow: (!isGenerating && canProceed()) ? '0 0 30px rgba(139, 92, 246, 0.5)' : 'none'
                }}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Genereert Website...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">🎨</span>
                    Genereer Website
                  </span>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900 bg-opacity-60 backdrop-blur-sm border border-red-700 rounded-lg text-red-200">
              <strong className="text-red-300">Fout:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isGenerating}
        status={generationStatus}
        progress={generationProgress}
      />
    </div>
  )
}

export default function WizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Laden...</div>
      </div>
    }>
      <WizardPageContent />
    </Suspense>
  )
}
