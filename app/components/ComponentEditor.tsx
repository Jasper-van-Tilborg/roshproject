'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { parseComponentsFromHTML, Component, updateComponentInHTML } from '../utils/component-parser'

interface ComponentEditorProps {
  html: string
  css: string
  js: string
  onCodeChange?: (html: string, css: string, js: string) => void
  viewport?: 'desktop' | 'tablet' | 'mobile'
  onViewportChange?: (viewport: 'desktop' | 'tablet' | 'mobile') => void
}

interface PageSettings {
  viewport: 'desktop' | 'tablet' | 'mobile'
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

export default function ComponentEditor({ 
  html, 
  css, 
  js, 
  onCodeChange,
  viewport: externalViewport,
  onViewportChange
}: ComponentEditorProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [editedHtml, setEditedHtml] = useState(html)
  const [editedCss, setEditedCss] = useState(css)
  const [editedJs, setEditedJs] = useState(js)
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    viewport: externalViewport || 'desktop',
    primaryColor: '#482CFF',
    secondaryColor: '#420AB2',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  })

  // Sync external viewport prop
  useEffect(() => {
    if (externalViewport) {
      setPageSettings(prev => ({ ...prev, viewport: externalViewport }))
    }
  }, [externalViewport])

  const handleViewportChange = (viewport: 'desktop' | 'tablet' | 'mobile') => {
    setPageSettings(prev => ({ ...prev, viewport }))
    if (onViewportChange) {
      onViewportChange(viewport)
    }
  }
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onCodeChangeRef = useRef(onCodeChange)

  // Keep ref updated
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange
  }, [onCodeChange])

  // Update local state when props change (important for loading existing code)
  useEffect(() => {
    setEditedHtml(html)
  }, [html])

  useEffect(() => {
    setEditedCss(css)
  }, [css])

  useEffect(() => {
    setEditedJs(js)
  }, [js])

  // Parse components when HTML changes
  useEffect(() => {
    try {
      const parsed = parseComponentsFromHTML(editedHtml, editedCss)
      setComponents(parsed)
    } catch (error) {
      console.error('Error parsing components:', error)
    }
  }, [editedHtml, editedCss, editedJs])

  // Generate preview HTML
  useEffect(() => {
    const combinedHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ${editedCss}
        /* Selection highlight */
        .component-selected {
          outline: 3px solid #8B5CF6 !important;
          outline-offset: -3px;
          position: relative;
        }
        .component-selected::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: rgba(139, 92, 246, 0.1);
          pointer-events: none;
        }
        .component-hover {
          outline: 2px dashed #3B82F6 !important;
          outline-offset: -2px;
        }
    </style>
</head>
<body>
    ${editedHtml}
    <script>
        ${editedJs}
        
        // Add component selection highlighting
        document.addEventListener('DOMContentLoaded', function() {
          const selectedId = '${selectedComponent?.id || ''}';
          if (selectedId) {
            const el = document.getElementById(selectedId) || 
                      document.querySelector('[data-component="' + selectedId + '"]');
            if (el) {
              el.classList.add('component-selected');
              // Scroll within iframe only, use 'nearest' to avoid scrolling too far
              // Prevent scrolling the parent page
              try {
                const iframe = window.frameElement || (window.parent && window.parent.document.querySelector('iframe'));
                if (iframe && iframe.contentWindow === window) {
                  // We're inside an iframe, scroll only within iframe
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                } else {
                  // Scroll within current window only
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
              } catch (e) {
                // Fallback: just scroll within iframe
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
            }
          }
        });
    </script>
</body>
</html>`
    
    setPreviewHtml(combinedHtml)
  }, [editedHtml, editedCss, editedJs, selectedComponent])

  // Update iframe when preview changes
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewHtml
    }
  }, [previewHtml])

  // Update component
  const updateComponent = useCallback((componentId: string, updates: {
    properties?: { [key: string]: unknown }
    styles?: { [key: string]: string }
  }) => {
    const newHtml = updateComponentInHTML(editedHtml, componentId, updates)
    setEditedHtml(newHtml)
    
    // Update components list
    setComponents(prev => prev.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          properties: { ...comp.properties, ...updates.properties },
          styles: { ...comp.styles, ...updates.styles }
        }
      }
      return comp
    }))

    // Update selected component
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({
        ...selectedComponent,
        properties: { ...selectedComponent.properties, ...updates.properties },
        styles: { ...selectedComponent.styles, ...updates.styles }
      })
    }

    // Notify parent
    if (onCodeChangeRef.current) {
      onCodeChangeRef.current(newHtml, editedCss, editedJs)
    }
  }, [editedHtml, editedCss, editedJs, selectedComponent])

  const handleIframeClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const componentId = target.id || target.closest('[data-component]')?.getAttribute('data-component')
    if (componentId) {
      const comp = components.find(c => c.id === componentId)
      if (comp) setSelectedComponent(comp)
    }
  }

  const getComponentIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    const icons: { [key: string]: React.ReactElement } = {
      // Hero section - spotlight/star icon
      hero: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      // Bracket/Teams - tournament bracket icon (tournament tree structure)
      bracket: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v4M6 12v4M6 16v4M18 4v4M18 12v4M18 16v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h6M6 16h6M18 8h-6M18 16h-6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M12 12h6" />
        </svg>
      ),
      // Teams - users/team icon
      teams: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      // Twitch - Twitch logo
      twitch: (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
      // Livestream - video camera icon
      livestream: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      // Sponsors - briefcase/business icon
      sponsors: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      // Schedule - calendar icon
      schedule: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      // Registration - clipboard/form icon
      registration: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Contact - envelope icon
      contact: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      // Footer - chevron down icon
      footer: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      ),
      // Header - navigation/menu icon
      header: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      // About - info circle icon
      about: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      // Description - document text icon
      description: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Tournament Details - information/document icon
      tournamentDetails: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Stats - chart/bar icon
      stats: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      // Prizes - trophy icon
      prizes: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      // Rules - document check icon
      rules: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      // Social - share/social icon
      social: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      // Section - generic box/container icon
      section: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
    // Return specific icon or default section icon
    return icons[type] || icons.section
  }

  return (
    <div className="flex h-full" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Left Sidebar - Component List */}
      <div className="w-64 glass-card border-r border-white/20 flex flex-col relative z-10">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-white font-bold text-lg mb-2">Componenten</h2>
          <p className="text-gray-300 text-xs">
            {components.length} componenten op de pagina
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {components.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              Geen componenten gevonden
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {components.map((component) => (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedComponent?.id === component.id
                      ? 'bg-[#482CFF] text-white shadow-lg'
                      : 'glass-button text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 text-gray-300">
                      {getComponentIcon(component.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{component.name}</div>
                      <div className="text-xs opacity-75 truncate">{component.type}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col bg-white relative z-10">
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <div className="w-full h-full overflow-auto" id="preview-scroll-container">
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              className="w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
              style={{ minHeight: '100%', display: 'block' }}
              onLoad={() => {
              // Add click handlers to iframe for component selection
              if (iframeRef.current?.contentWindow) {
                try {
                  const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
                  
                  // Remove old listeners
                  iframeDoc.querySelectorAll('[data-selectable]').forEach(el => {
                    el.removeEventListener('click', handleIframeClick as EventListener)
                    el.removeAttribute('data-selectable')
                  })

                  // Add click handlers to all components
                  components.forEach(comp => {
                    const el = iframeDoc.getElementById(comp.id) || 
                              iframeDoc.querySelector(`[data-component="${comp.id}"]`)
                    if (el) {
                      el.setAttribute('data-selectable', 'true')
                      el.style.cursor = 'pointer'
                      el.addEventListener('click', (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedComponent(comp)
                        // Scroll within iframe only, prevent page scroll
                        setTimeout(() => {
                          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
                        }, 100)
                      })
                    }
                  })
                } catch (error) {
                  // Cross-origin issues, ignore
                  console.log('Could not add click handlers:', error)
                }
              }
            }}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Property Editor */}
      <div className="w-80 glass-card border-l border-white/20 flex flex-col relative z-10">
        {selectedComponent ? (
          <>
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex-shrink-0 text-gray-300">
                  {getComponentIcon(selectedComponent.type)}
                </div>
                <div>
                  <h2 className="text-white font-bold">{selectedComponent.name}</h2>
                  <p className="text-gray-300 text-xs">{selectedComponent.type}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Content Properties */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">Inhoud</h3>
                <div className="space-y-3">
                  {selectedComponent.properties.title !== undefined && (
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Titel</label>
                      <input
                        type="text"
                        value={String(selectedComponent.properties.title || '')}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { title: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  )}
                  
                  {selectedComponent.properties.subtitle !== undefined && (
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Ondertitel</label>
                      <input
                        type="text"
                        value={String(selectedComponent.properties.subtitle || '')}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  )}

                  {selectedComponent.properties.description !== undefined && (
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Beschrijving</label>
                      <textarea
                        value={String(selectedComponent.properties.description || '')}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 resize-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Style Properties */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">Styling</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Achtergrond Kleur</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#000000'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { 'background-color': e.target.value }
                        })}
                        className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.backgroundColor || '#000000'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { 'background-color': e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Tekst Kleur</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.color || '#ffffff'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { color: e.target.value }
                        })}
                        className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.color || '#ffffff'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { color: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Padding</label>
                    <input
                      type="text"
                      value={selectedComponent.styles.padding || ''}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        styles: { padding: e.target.value }
                      })}
                      placeholder="bijv. 2rem"
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <p className="text-sm">Selecteer een component om te bewerken</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
