'use client'

import { useState, useCallback, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateTournamentTemplate } from '../../utils/claude-template-generator'
import ComponentEditor from '../../components/ComponentEditor'
import LoadingOverlay from '../../components/LoadingOverlay'

// Inline Color Picker Component
function InlineColorPicker({
  color,
  onChange,
  label,
  required
}: {
  color: string
  onChange: (color: string) => void
  label: string
  required?: boolean
}) {
  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  // Initialize HSL from color
  const initializeFromColor = (hexColor: string) => {
    if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      return { h: 0, s: 100, l: 50 }
    }
    return hexToHsl(hexColor)
  }

  const initialValues = initializeFromColor(color)
  const [hue, setHue] = useState(initialValues.h)
  const [saturation, setSaturation] = useState(initialValues.s)
  const [lightness, setLightness] = useState(initialValues.l)
  const [isExpanded, setIsExpanded] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const draggingType = useRef<'picker' | 'hue' | null>(null)

  const lastColorRef = useRef<string>(color)
  const isInternalUpdateRef = useRef(false)

  // Update when color prop changes externally
  useEffect(() => {
    if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) return
    
    // Only update if color changed externally (not from our internal updates)
    if (color !== lastColorRef.current && !isInternalUpdateRef.current) {
      const hsl = hexToHsl(color)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
      lastColorRef.current = color
    }
    isInternalUpdateRef.current = false
  }, [color])

  // Update color when HSL changes
  useEffect(() => {
    const newHex = hslToHex(hue, saturation, lightness)
    if (newHex !== lastColorRef.current) {
      lastColorRef.current = newHex
      isInternalUpdateRef.current = true
      onChange(newHex)
    }
  }, [hue, saturation, lightness, onChange])

  // Handle saturation/lightness picker
  const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pickerRef.current) return
    const rect = pickerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setSaturation(x * 100)
    setLightness((1 - y) * 100)
  }

  const handlePickerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    draggingType.current = 'picker'
    handlePickerClick(e)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      
      if (draggingType.current === 'picker' && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
        setSaturation(x * 100)
        setLightness((1 - y) * 100)
      } else if (draggingType.current === 'hue' && hueRef.current) {
        const rect = hueRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setHue(x * 360)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      draggingType.current = null
    }

    if (isExpanded) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isExpanded])

  // Handle hue slider
  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHue(x * 360)
  }

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    draggingType.current = 'hue'
    handleHueClick(e)
  }

  const displayColor = hslToHex(hue, saturation, lightness)
  const hueColor = `hsl(${hue}, 100%, 50%)`

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim().toUpperCase()
    
    // Add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value
    }
    
    // Normalize to 6 hex digits
    if (value.startsWith('#')) {
      const hex = value.slice(1).replace(/[^0-9A-F]/g, '').slice(0, 6)
      if (hex.length === 6) {
        value = '#' + hex
        const hsl = hexToHsl(value)
        setHue(hsl.h)
        setSaturation(hsl.s)
        setLightness(hsl.l)
        // onChange will be called by useEffect
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Compact Color Display */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-20 h-12 rounded-lg border-2 border-gray-700 hover:border-purple-500 transition-all cursor-pointer overflow-hidden group"
          style={{ backgroundColor: displayColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="relative floating-label-input flex-1">
          <input
            type="text"
            value={displayColor.toUpperCase()}
            onChange={handleHexChange}
            placeholder="#000000"
            className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all font-mono ${displayColor ? 'has-value' : ''}`}
          />
          <label className={`floating-label ${displayColor ? 'floating-label-active' : ''}`}>
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        </div>
      </div>

      {/* Expanded Color Picker */}
      {isExpanded && (
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-4 space-y-4">
          {/* Saturation/Lightness Picker */}
          <div>
            <div
              ref={pickerRef}
              className="w-full h-48 rounded-lg cursor-crosshair relative overflow-hidden border border-gray-700"
              style={{
                background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${hueColor})`
              }}
              onMouseDown={handlePickerMouseDown}
            >
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none z-10"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          </div>

          {/* Hue Slider and Color Preview */}
          <div className="flex items-center space-x-4">
            {/* Color Preview */}
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-600 shadow-lg"
                style={{ backgroundColor: displayColor }}
              />
            </div>

            {/* Hue Slider */}
            <div className="flex-1">
              <div
                ref={hueRef}
                className="w-full h-6 rounded-lg cursor-pointer relative overflow-hidden border border-gray-700"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                }}
                onMouseDown={handleHueMouseDown}
              >
                <div
                  className="absolute top-0 bottom-0 w-2 border-2 border-white shadow-lg pointer-events-none"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

// Back button component
function BackButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-x-1 cursor-pointer"
    >
      <svg 
        className={`w-5 h-5 text-white transition-all duration-300 ${isHovered ? 'transform -translate-x-1' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-300">
        Terug
      </span>
    </button>
  );
}

function WizardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams?.get('edit') === 'true'
  const tournamentId = searchParams?.get('id') || null
  
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
  const [isLoadingTournament, setIsLoadingTournament] = useState(false)
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

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
    if (isEditMode && tournamentId) {
      console.log('Edit mode detected, loading tournament data from API...', tournamentId)
      setIsLoadingTournament(true)
      setEditingTournamentId(tournamentId)
      setError(null) // Reset error
      
      // Haal tournament data op uit database
      console.log('Fetching tournament with ID:', tournamentId)
      const apiUrl = `/api/tournaments/${tournamentId}`
      console.log('API URL:', apiUrl)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Fetch timeout - taking too long')
        setIsLoadingTournament(false)
        setError('Het laden duurt te lang. Controleer je internetverbinding.')
        setShowEditor(false)
      }, 10000) // 10 second timeout
      
      fetch(apiUrl)
        .then(async response => {
          console.log('Response status:', response.status, response.statusText)
          
          let data
          try {
            data = await response.json()
            console.log('Response data:', data)
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError)
            const text = await response.text().catch(() => 'Could not read response')
            console.error('Response text:', text)
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
          }
          
          if (!response.ok) {
            const errorMessage = data?.error || data?.message || `Failed to fetch tournament: ${response.status}`
            const errorHint = data?.hint || ''
            console.error('API error response:', {
              status: response.status,
              error: errorMessage,
              code: data?.code,
              details: data?.details,
              hint: errorHint
            })
            const fullError = errorHint ? `${errorMessage}\n\n${errorHint}` : errorMessage
            throw new Error(fullError)
          }
          return data
        })
        .then(data => {
          if (data.tournament) {
            const dbTournament = data.tournament
            console.log('Loaded tournament from API:', {
              name: dbTournament.name,
              hasHtml: !!dbTournament.generated_code_html,
              hasCss: !!dbTournament.generated_code_css,
              hasJs: !!dbTournament.generated_code_js,
              htmlLength: dbTournament.generated_code_html?.length || 0,
              cssLength: dbTournament.generated_code_css?.length || 0,
              jsLength: dbTournament.generated_code_js?.length || 0
            })
            
            // Set tournament name
            setTournamentName(dbTournament.name || '')
            
            // Set generated code
            const codeToSet = {
              html: dbTournament.generated_code_html || '',
              css: dbTournament.generated_code_css || '',
              js: dbTournament.generated_code_js || '',
              full: dbTournament.generated_code_full || ''
            }
            
            setGeneratedCode(codeToSet)
            
            // Load wizard answers if available
            if (dbTournament.wizard_answers && typeof dbTournament.wizard_answers === 'object') {
              setAnswers(dbTournament.wizard_answers as Record<string, string | number | boolean>)
            } else {
              // Maak basis wizard answers van tournament data
              const basicAnswers = {
                tournament_name: dbTournament.name,
                tournament_date: dbTournament.start_date,
                tournament_location: dbTournament.location,
                tournament_description: dbTournament.description,
                participants: parseInt(dbTournament.max_participants || '8', 10),
                game: 'CS2',
                primary_color: dbTournament.primary_color || '#C8247F',
                secondary_color: dbTournament.secondary_color || '#8E8E8E',
                components: dbTournament.custom_components?.map((c: {type?: string}) => c.type).filter(Boolean) || ['bracket', 'twitch', 'sponsors']
              }
              setAnswers(basicAnswers)
            }
            
            // Check if there's actually any code
            const hasCode = !!(codeToSet.html || codeToSet.css || codeToSet.js || codeToSet.full)
            
            // Open editor immediately
            if (hasCode) {
              console.log('Opening editor directly - has code')
            } else {
              console.log('Opening editor - no code yet, user can generate')
            }
            setIsLoadingTournament(false) // CRITICAL: Reset loading state
            setShowEditor(true)
            setCurrentStep(wizardSteps.length - 1)
            clearTimeout(timeoutId) // Clear timeout on success
          } else {
            clearTimeout(timeoutId)
            throw new Error('Tournament data not found in response')
          }
        })
        .catch(error => {
          console.error('Error loading tournament:', error)
          clearTimeout(timeoutId) // Clear timeout on error
          setError(`Fout bij laden van toernooi: ${error.message}`)
          setIsLoadingTournament(false)
          // Don't set showEditor if there's an error
          setShowEditor(false)
        })
      
      // Cleanup timeout on unmount
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [isEditMode, tournamentId])

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

  // Show editor if:
  // 1. showEditor is true AND generatedCode exists, OR
  // 2. We're in edit mode AND have editingTournamentId (always show editor in edit mode)
  const shouldShowEditor = (showEditor && generatedCode) || (isEditMode && editingTournamentId)
  
  // Debug log
  if (isEditMode) {
    console.log('Render check - shouldShowEditor:', shouldShowEditor, {
      showEditor,
      hasGeneratedCode: !!generatedCode,
      isEditMode,
      editingTournamentId,
      generatedCodeHtml: generatedCode?.html?.substring(0, 50) || 'none'
    })
  }
  
  // In edit mode, always show editor (even if no code yet - user can generate)
  // Otherwise, show editor only if we have code
  if (shouldShowEditor) {
    // If we're loading tournament data, show loading screen
    if (isLoadingTournament) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white">Toernooi laden...</div>
        </div>
      )
    }
    
    // If there's an error in edit mode, show error and allow user to continue
    if (error && isEditMode) {
      const isApiKeyError = error.includes('API key') || error.includes('Supabase API key')
      const isRLSError = error.includes('Toegang geweigerd') || error.includes('RLS') || error.includes('permission')
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md p-6">
            <div className="flex items-center space-x-2 text-red-500 text-xl mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Fout</span>
            </div>
            <div className="text-white mb-4">{error}</div>
            {isApiKeyError && (
              <div className="text-yellow-400 text-sm mb-6 p-4 bg-yellow-900/20 rounded-lg">
                <p className="font-semibold mb-2">Oplossing:</p>
                <p className="mb-2">1. Controleer je .env.local bestand in de project root</p>
                <p className="mb-2">2. Zorg dat NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY correct zijn</p>
                <p className="mb-2">3. <strong>Herstart je development server</strong> (stop met Ctrl+C en start opnieuw met npm run dev)</p>
                <p className="text-xs text-gray-400 mt-2">Check de terminal waar npm run dev draait voor debug informatie</p>
              </div>
            )}
            {isRLSError && (
              <div className="text-yellow-400 text-sm mb-6 p-4 bg-yellow-900/20 rounded-lg">
                <p className="font-semibold mb-2">Oplossing:</p>
                <p>Controleer je Supabase RLS policies in het Supabase Dashboard</p>
              </div>
            )}
            <button
              onClick={() => {
                setError(null)
                setShowEditor(false)
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Terug naar Wizard
            </button>
          </div>
        </div>
      )
    }
    
    // If we don't have code yet but we're in edit mode, wait a bit for data to load
    // But don't wait forever - if we've been waiting and there's no error, show editor anyway
    if (!generatedCode && isEditMode && editingTournamentId && !error) {
      // Wait a moment for the fetch to complete
      // If still no code after a short delay, show editor anyway (user can generate)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white">Laden...</div>
        </div>
      )
    }
    
    // Only render editor if we have code OR we're not in edit mode
    if (!generatedCode && !isEditMode) {
      return null
    }
    
    // Set tournament name from answers if not set
    if (!tournamentName && answers.tournament_name) {
      setTournamentName(String(answers.tournament_name))
    }

    return (
      <div className="h-screen flex flex-col radial-gradient relative overflow-hidden">
        {/* Header met glassmorphism effect - fixed position */}
        <div className="glass-card border-b border-white/20 px-6 py-4 flex items-center relative z-20 flex-shrink-0">
          {/* Left Section */}
          <div className="flex-1 flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-white">LIVE EDITOR</h1>
              <p className="text-sm text-gray-300">Edit your page in real-time</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative floating-label-input">
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Toernooi naam..."
                  className={`px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all w-48 ${tournamentName ? 'has-value' : ''}`}
                />
                <label className={`floating-label ${tournamentName ? 'floating-label-active' : ''}`}>
                  Toernooi naam
                </label>
              </div>
            </div>
          </div>
          
          {/* Viewport Selector - Absolute Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-gray-700">
              {(['desktop', 'tablet', 'mobile'] as const).map((vp) => (
                <button
                  key={vp}
                  onClick={() => setViewport(vp)}
                  className={`p-2 rounded transition-all ${
                    viewport === vp
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={vp.charAt(0).toUpperCase() + vp.slice(1)}
                >
                  {vp === 'desktop' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {vp === 'tablet' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {vp === 'mobile' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowEditor(false)}
              className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to wizard</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative z-10" style={{ minHeight: 0 }}>
          {generatedCode ? (
            <ComponentEditor
              html={generatedCode.html}
              css={generatedCode.css}
              js={generatedCode.js}
              onCodeChange={handleCodeChange}
              viewport={viewport}
              onViewportChange={setViewport}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              isSaving={isSaving}
              tournamentName={tournamentName}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-white relative z-10">
              <div className="text-center glass-card p-8 rounded-xl">
                <p className="text-xl mb-4 font-semibold">Geen code gevonden</p>
                <p className="text-gray-300 mb-6">Genereer nieuwe code via de wizard of gebruik de knop hieronder</p>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-3 bg-[#482CFF] text-white rounded-lg hover:bg-[#420AB2] transition-all font-semibold shadow-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(72, 44, 255, 0.4)'
                  }}
                >
                  Ga naar Wizard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const step = wizardSteps[currentStep]
  const progress = ((currentStep + 1) / wizardSteps.length) * 100

  return (
    <div className="min-h-screen w-full overflow-hidden relative radial-gradient">

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header met terug knop */}
        <div className="mb-6">
          <BackButton onClick={() => router.push('/dashboard')} />
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
              className="bg-[#482CFF] h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(72, 44, 255, 0.5)'
              }}
            />
          </div>
        </div>

        {/* Wizard Content */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2 text-center" style={{
            color: '#482CFF'
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
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${answers[question.id] ? 'has-value' : ''}`}
                      />
                      <label className={`floating-label ${answers[question.id] ? 'floating-label-active' : ''}`}>
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
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none transition-all ${answers[question.id] ? 'has-value' : ''}`}
                      />
                      <label className={`floating-label ${answers[question.id] ? 'floating-label-active' : ''}`}>
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
                        min="1"
                        className={`w-full px-4 py-3 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${answers[question.id] && Number(answers[question.id]) > 0 ? 'has-value' : ''}`}
                      />
                      <label className={`floating-label ${answers[question.id] && Number(answers[question.id]) > 0 ? 'floating-label-active' : ''}`}>
                        {question.question}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                    </div>
                  )}

                  {question.type === 'color' && (
                    <InlineColorPicker
                      color={String(answers[question.id] || '#3B82F6')}
                      onChange={(newColor) => handleAnswer(question.id, newColor)}
                      label={question.question}
                      required={question.required}
                    />
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
                className="px-6 py-3 bg-[#482CFF] text-white rounded-lg hover:bg-[#420AB2] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg transform hover:scale-105"
                style={{
                  boxShadow: canProceed() ? '0 0 20px rgba(72, 44, 255, 0.4)' : 'none'
                }}
              >
                Volgende →
              </button>
            ) : (
              <button
                onClick={generateWebsite}
                disabled={!canProceed() || isGenerating}
                className="px-8 py-4 bg-[#482CFF] text-white rounded-lg hover:bg-[#420AB2] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-2xl transform hover:scale-105"
                style={{
                  boxShadow: (!isGenerating && canProceed()) ? '0 0 30px rgba(72, 44, 255, 0.5)' : 'none'
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
