'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { parseComponentsFromHTML, Component, updateComponentInHTML } from '../utils/component-parser'

interface ComponentEditorProps {
  html: string
  css: string
  js: string
  onCodeChange?: (html: string, css: string, js: string) => void
}

export default function ComponentEditor({ 
  html, 
  css, 
  js, 
  onCodeChange
}: ComponentEditorProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [editedHtml, setEditedHtml] = useState(html)
  const [editedCss] = useState(css)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onCodeChangeRef = useRef(onCodeChange)

  // Keep ref updated
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange
  }, [onCodeChange])

  // Parse components when HTML changes
  useEffect(() => {
    try {
      const parsed = parseComponentsFromHTML(editedHtml, editedCss)
      setComponents(parsed)
    } catch (error) {
      console.error('Error parsing components:', error)
    }
  }, [editedHtml, editedCss, js])

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
        ${js}
        
        // Add component selection highlighting
        document.addEventListener('DOMContentLoaded', function() {
          const selectedId = '${selectedComponent?.id || ''}';
          if (selectedId) {
            const el = document.getElementById(selectedId) || 
                      document.querySelector('[data-component="' + selectedId + '"]');
            if (el) {
              el.classList.add('component-selected');
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
    </script>
</body>
</html>`
    
    setPreviewHtml(combinedHtml)
  }, [editedHtml, editedCss, js, selectedComponent])

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
      onCodeChangeRef.current(newHtml, editedCss, js)
    }
  }, [editedHtml, editedCss, js, selectedComponent])

  const handleIframeClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const componentId = target.id || target.closest('[data-component]')?.getAttribute('data-component')
    if (componentId) {
      const comp = components.find(c => c.id === componentId)
      if (comp) setSelectedComponent(comp)
    }
  }

  const getComponentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      hero: '🎯',
      bracket: '🏆',
      twitch: '📺',
      sponsors: '💼',
      schedule: '📅',
      registration: '📝',
      contact: '✉️',
      footer: '🔻',
      about: 'ℹ️',
      section: '📦'
    }
    return icons[type] || '📄'
  }

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Sidebar - Component List */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-bold text-lg mb-2">Componenten</h2>
          <p className="text-gray-400 text-xs">
            {components.length} componenten op de pagina
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {components.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
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
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getComponentIcon(component.type)}</span>
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
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600 font-medium">Live Preview</span>
          </div>
          <button
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.srcdoc = previewHtml
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Herlaad
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 relative">
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
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

      {/* Right Sidebar - Property Editor */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {selectedComponent ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getComponentIcon(selectedComponent.type)}</span>
                <div>
                  <h2 className="text-white font-bold">{selectedComponent.name}</h2>
                  <p className="text-gray-400 text-xs">{selectedComponent.type}</p>
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
                      <label className="block text-gray-400 text-xs mb-1">Titel</label>
                      <input
                        type="text"
                        value={selectedComponent.properties.title || ''}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { title: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                  
                  {selectedComponent.properties.subtitle !== undefined && (
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Ondertitel</label>
                      <input
                        type="text"
                        value={selectedComponent.properties.subtitle || ''}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {selectedComponent.properties.description !== undefined && (
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Beschrijving</label>
                      <textarea
                        value={selectedComponent.properties.description || ''}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          properties: { description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
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
                    <label className="block text-gray-400 text-xs mb-1">Achtergrond Kleur</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#000000'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { 'background-color': e.target.value }
                        })}
                        className="w-12 h-10 bg-gray-900 border border-gray-700 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.backgroundColor || '#000000'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { 'background-color': e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Tekst Kleur</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.color || '#ffffff'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { color: e.target.value }
                        })}
                        className="w-12 h-10 bg-gray-900 border border-gray-700 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.color || '#ffffff'}
                        onChange={(e) => updateComponent(selectedComponent.id, {
                          styles: { color: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Padding</label>
                    <input
                      type="text"
                      value={selectedComponent.styles.padding || ''}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        styles: { padding: e.target.value }
                      })}
                      placeholder="bijv. 2rem"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👈</div>
              <p className="text-sm">Selecteer een component om te bewerken</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
