'use client'

import { useState, useEffect } from 'react'
import { generateTournamentTemplate } from '../utils/claude-template-generator'
import { generateMockTemplate } from '../utils/mock-template-generator'
import LivePreview from '../components/LivePreview'

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

export default function EditorPage() {
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'code'>('config')
  const [autoGenerate, setAutoGenerate] = useState(true)

  const generateTemplate = async () => {
    setIsGenerating(true)
    try {
      // Generate with Claude API
      const result = await generateTournamentTemplate(config)
      if (result.success && result.code) {
        setGeneratedCode(result.code)
        setActiveTab('preview')
      } else {
        // Fallback to mock generator if Claude fails
        const mockCode = generateMockTemplate(config)
        setGeneratedCode(mockCode)
        setActiveTab('preview')
      }
    } catch (error) {
      console.error('Error generating template:', error)
      // Fallback to mock generator on error
      const mockCode = generateMockTemplate(config)
      setGeneratedCode(mockCode)
      setActiveTab('preview')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateConfig = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof TournamentConfig],
          [child]: value
        }
      }))
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

  // Auto-generate preview when config changes
  useEffect(() => {
    if (autoGenerate) {
      const mockCode = generateMockTemplate(config)
      setGeneratedCode(mockCode)
    }
  }, [config, autoGenerate])

  // Auto-generate on page load
  useEffect(() => {
    if (!generatedCode) {
      generateTemplate()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
            <div className="flex space-x-4 items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-generate</span>
              </label>
              <button
                onClick={generateTemplate}
                disabled={isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Genereren...' : 'Genereer Template'}
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
              <h2 className="text-lg font-semibold mb-4">Configuratie</h2>
              
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bracket Type
                  </label>
                  <select
                    value={config.bracketType}
                    onChange={(e) => updateConfig('bracketType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single_elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="group_stage">Group Stage</option>
                    <option value="round_robin">Round Robin</option>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lettertype
                    </label>
                    <select
                      value={config.theme.fontFamily}
                      onChange={(e) => updateConfig('theme.fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
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

          {/* Preview/Code Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('config')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'config'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Config JSON
                  </button>
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
                {activeTab === 'config' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configuratie JSON</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                    <LivePreview generatedCode={generatedCode} config={config} />
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
                        <p>Klik op "Genereer Template" om de code te zien</p>
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
