'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface LiveCodeEditorProps {
  html: string
  css: string
  js: string
  onCodeChange?: (html: string, css: string, js: string) => void
  initialMode?: 'split' | 'preview' | 'code'
}

export default function LiveCodeEditor({ 
  html, 
  css, 
  js, 
  onCodeChange,
  initialMode = 'split' 
}: LiveCodeEditorProps) {
  const [mode, setMode] = useState<'split' | 'preview' | 'code'>(initialMode)
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')
  const [localHtml, setLocalHtml] = useState(html)
  const [localCss, setLocalCss] = useState(css)
  const [localJs, setLocalJs] = useState(js)
  const [previewHtml, setPreviewHtml] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onCodeChangeRef = useRef(onCodeChange)
  const lastChangeRef = useRef({ html: '', css: '', js: '' })

  // Keep ref updated
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange
  }, [onCodeChange])

  // Update local state when props change (only if actually different)
  useEffect(() => {
    setLocalHtml(prev => prev !== html ? html : prev)
    setLocalCss(prev => prev !== css ? css : prev)
    setLocalJs(prev => prev !== js ? js : prev)
  }, [html, css, js])

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
        ${localCss}
    </style>
</head>
<body>
    ${localHtml}
    <script>
        ${localJs}
    </script>
</body>
</html>`
    
    setPreviewHtml(combinedHtml)
    
    // Only notify parent if values actually changed (prevent infinite loop)
    if (
      lastChangeRef.current.html !== localHtml ||
      lastChangeRef.current.css !== localCss ||
      lastChangeRef.current.js !== localJs
    ) {
      lastChangeRef.current = { html: localHtml, css: localCss, js: localJs }
      
      // Use ref to avoid dependency issues
      if (onCodeChangeRef.current) {
        onCodeChangeRef.current(localHtml, localCss, localJs)
      }
    }
  }, [localHtml, localCss, localJs]) // Removed onCodeChange from deps

  // Hot reload preview when code changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframe = iframeRef.current
      iframe.srcdoc = previewHtml
    }
  }, [previewHtml])

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'html': return localHtml
      case 'css': return localCss
      case 'js': return localJs
    }
  }

  const setCurrentCode = (value: string) => {
    switch (activeTab) {
      case 'html':
        setLocalHtml(value)
        break
      case 'css':
        setLocalCss(value)
        break
      case 'js':
        setLocalJs(value)
        break
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('split')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'split' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'preview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Preview Only
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'code' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Code Only
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel */}
        {(mode === 'split' || mode === 'code') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-700`}>
            {/* Code Tabs */}
            <div className="flex bg-gray-800 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'html'
                    ? 'border-blue-500 text-blue-400 bg-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'css'
                    ? 'border-blue-500 text-blue-400 bg-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                CSS
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'js'
                    ? 'border-blue-500 text-blue-400 bg-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                JavaScript
              </button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-auto bg-gray-900">
              <textarea
                value={getCurrentCode()}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                style={{ 
                  tabSize: 2,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace'
                }}
                spellCheck={false}
              />
            </div>

            {/* Code Info */}
            <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
              {activeTab.toUpperCase()}: {getCurrentCode().split('\n').length} regels, {getCurrentCode().length} karakters
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(mode === 'split' || mode === 'preview') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-white`}>
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
            <div className="flex-1 overflow-auto bg-gray-100">
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Live Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
