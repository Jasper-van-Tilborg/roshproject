'use client'

import { useState, useEffect, useCallback } from 'react'
import { generateTournamentTemplate } from '../../utils/claude-template-generator'
import { generateMockTemplate } from '../../utils/mock-template-generator'
import LivePreview from '../../components/LivePreview'

interface TournamentConfig {
  title: string
  date: string
  location: string
  description: string
  participants: number
  bracketType: string
  game: string
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  components: string[]
}

export default function AutoEditorPage() {
  const [config, setConfig] = useState<TournamentConfig>({
    title: 'The Legion Event',
    date: '25 oktober 2025',
    location: 'Comic Con',
    description: 'Het is een csgo toernooi op comic con',
    participants: 8,
    bracketType: 'group_stage',
    game: 'CS2',
    theme: {
      primaryColor: '#C8247F',
      secondaryColor: '#8E8E8E',
      fontFamily: 'Inter'
    },
    components: ['bracket', 'twitch', 'sponsors']
  })

  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(true)
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'code'>('preview')

  const generateTemplate = useCallback(async () => {
    setIsGenerating(true)
    // Convert config to flat format expected by generateTournamentTemplate
    const flatConfig: Record<string, string | number | boolean> = {
      title: config.title,
      date: config.date,
      location: config.location,
      description: config.description,
      participants: config.participants,
      bracketType: config.bracketType,
      game: config.game,
      primaryColor: config.theme.primaryColor,
      secondaryColor: config.theme.secondaryColor,
      fontFamily: config.theme.fontFamily,
      components: config.components.join(',')
    }
    try {
      // Generate with Claude API
      const result = await generateTournamentTemplate(flatConfig)
      if (result.success && result.code) {
        setGeneratedCode(result.code)
        setActiveTab('preview')
      } else {
        // Fallback to mock generator if Claude fails
        const mockCode = generateMockTemplate(flatConfig)
        setGeneratedCode(mockCode)
        setActiveTab('preview')
      }
    } catch (error) {
      console.error('Error generating template:', error)
      // Fallback to mock generator on error
      const mockCode = generateMockTemplate(flatConfig)
      setGeneratedCode(mockCode)
      setActiveTab('preview')
    } finally {
      setIsGenerating(false)
    }
  }, [config])

  const updateConfig = (key: string, value: unknown) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setConfig(prev => {
        const parentValue = prev[parent as keyof TournamentConfig]
        if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value
            }
          }
        }
        return prev
      })
    } else {
      setConfig(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  const toggleComponent = (component: string) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.filter(c => c !== component)
        : [...prev.components, component]
    }))
  }

  // State voor editing tournament
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null)

  // Auto-generate on page load
  useEffect(() => {
    // Load config from localStorage if available (from wizard or dashboard)
    const savedConfig = localStorage.getItem('wizardConfig')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        localStorage.removeItem('wizardConfig') // Clear after loading
      } catch (error) {
        console.error('Error parsing saved config:', error)
      }
    }

    // Check if we're editing an existing tournament
    const editingId = localStorage.getItem('editingTournamentId')
    if (editingId) {
      setEditingTournamentId(editingId)
      localStorage.removeItem('editingTournamentId') // Clear after loading
      
      // Load existing generated code if available
      const existingCode = localStorage.getItem('editingTournamentCode')
      if (existingCode) {
        setGeneratedCode(existingCode)
        setIsGenerating(false)
        localStorage.removeItem('editingTournamentCode') // Clear after loading
        // Don't auto-generate when editing existing tournament
        return
      }
    }
    
    // Only generate if not editing or no existing code found
    generateTemplate()
  }, [generateTemplate])

  // Auto-generate preview when config changes
  useEffect(() => {
    if (generatedCode && !editingTournamentId) {
      // Only auto-regenerate if not editing existing tournament
      generateTemplate()
    }
  }, [config, generateTemplate, generatedCode, editingTournamentId])

  // Functie om wijzigingen op te slaan in database
  const handleSaveChanges = async () => {
    if (!editingTournamentId) {
      alert('Geen toernooi om op te slaan')
      return
    }

    try {
      // Parse generated code om HTML, CSS, JS te extraheren
      let htmlCode = ''
      let cssCode = ''
      let jsCode = ''
      const fullCode = generatedCode

      // Probeer HTML, CSS en JS uit generated code te extraheren
      const htmlMatch = generatedCode.match(/```html\s*\n([\s\S]*?)\n```/i) || 
                        generatedCode.match(/<html[\s\S]*?<\/html>/i)
      if (htmlMatch) {
        htmlCode = htmlMatch[1] || htmlMatch[0]
      }

      const cssMatch = generatedCode.match(/```css\s*\n([\s\S]*?)\n```/i) || 
                       generatedCode.match(/<style[\s\S]*?<\/style>/i)
      if (cssMatch) {
        cssCode = cssMatch[1] || cssMatch[0]
      }

      const jsMatch = generatedCode.match(/```javascript\s*\n([\s\S]*?)\n```/i) || 
                      generatedCode.match(/```js\s*\n([\s\S]*?)\n```/i) ||
                      generatedCode.match(/<script[\s\S]*?<\/script>/i)
      if (jsMatch) {
        jsCode = jsMatch[1] || jsMatch[0]
      }

      // Update tournament in database
      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTournamentId,
          name: config.title,
          description: config.description,
          location: config.location,
          startDate: config.date,
          endDate: '',
          maxParticipants: String(config.participants),
          entryFee: '',
          prizePool: '',
          primaryColor: config.theme.primaryColor,
          secondaryColor: config.theme.secondaryColor,
          status: 'draft', // Keep as draft, user can publish later
          generatedCode: {
            html: htmlCode,
            css: cssCode,
            js: jsCode,
            full: fullCode
          },
          wizardAnswers: {
            tournament_name: config.title,
            tournament_date: config.date,
            tournament_location: config.location,
            tournament_description: config.description,
            participants: config.participants,
            game: config.game,
            primary_color: config.theme.primaryColor,
            secondary_color: config.theme.secondaryColor,
            components: config.components
          },
          customComponents: config.components.map(type => ({ type }))
        })
      })

      if (response.ok) {
        alert('✅ Wijzigingen opgeslagen!')
      } else {
        const error = await response.json()
        alert(`❌ Fout bij opslaan: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('❌ Fout bij opslaan van wijzigingen. Probeer het opnieuw.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AI Tournament Generator</h1>
            <div className="flex items-center space-x-4">
              {isGenerating && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">AI genereert template...</span>
                </div>
              )}
              {editingTournamentId && (
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Wijzigingen Opslaan
                </button>
              )}
              <button
                onClick={generateTemplate}
                disabled={isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Genereren...' : 'Opnieuw Genereren'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Live Aanpassingen</h2>
              <p className="text-sm text-gray-600 mb-4">
                Pas de instellingen aan en zie direct het resultaat in de preview!
              </p>
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toernooi Titel
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => updateConfig('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum
                  </label>
                  <input
                    type="text"
                    value={config.date}
                    onChange={(e) => updateConfig('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locatie
                  </label>
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => updateConfig('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => updateConfig('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aantal Deelnemers
                  </label>
                  <input
                    type="number"
                    value={config.participants}
                    onChange={(e) => updateConfig('participants', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game
                  </label>
                  <select
                    value={config.game}
                    onChange={(e) => updateConfig('game', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CS2">CS2</option>
                    <option value="Valorant">Valorant</option>
                    <option value="League of Legends">League of Legends</option>
                    <option value="Dota 2">Dota 2</option>
                    <option value="Rocket League">Rocket League</option>
                  </select>
                </div>
              </div>

              {/* Theme Colors */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">Kleuren</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primaire Kleur
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={config.theme.primaryColor}
                        onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.primaryColor}
                        onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secundaire Kleur
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateConfig('theme.secondaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateConfig('theme.secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Components */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">Componenten</h3>
                <div className="space-y-2">
                  {[
                    { key: 'bracket', label: 'Bracket/Teams', icon: '🏆' },
                    { key: 'twitch', label: 'Twitch Stream', icon: '📺' },
                    { key: 'sponsors', label: 'Sponsors', icon: '💼' },
                    { key: 'schedule', label: 'Programma', icon: '📅' },
                    { key: 'registration', label: 'Inschrijving', icon: '📝' },
                    { key: 'social', label: 'Social Media', icon: '🔗' }
                  ].map((component) => (
                    <label key={component.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.components.includes(component.key)}
                        onChange={() => toggleComponent(component.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg">{component.icon}</span>
                      <span className="text-sm text-gray-700">{component.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'preview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'code'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Generated Code
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'preview' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Generated Preview</h3>
                    <LivePreview generatedCode={generatedCode} config={config as unknown as Record<string, unknown>} />
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Generated Code</h3>
                    {generatedCode ? (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                        {generatedCode}
                      </pre>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Code wordt gegenereerd...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
