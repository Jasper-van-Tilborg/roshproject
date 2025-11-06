'use client'

import { useState, useEffect } from 'react'

interface LivePreviewProps {
  generatedCode: string
  config: Record<string, unknown>
}

export default function LivePreview({ generatedCode, config }: LivePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (generatedCode) {
      setIsLoading(true)
      
      // Check if it's HTML/CSS/JS format or React format
      const isHtmlFormat = generatedCode.includes('<!DOCTYPE html>') || 
                          generatedCode.includes('<html') ||
                          generatedCode.includes('index.html')

      if (isHtmlFormat) {
        // Handle HTML/CSS/JS format
        let htmlContent = generatedCode
        
        // Extract HTML from code blocks if present
        const htmlMatch = generatedCode.match(/```html\s*\n([\s\S]*?)\n```/)
        if (htmlMatch) {
          htmlContent = htmlMatch[1]
        }

        // Create complete HTML page
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tournament Preview</title>
    <style>
        body { margin: 0; font-family: ${config.theme?.fontFamily || 'Inter'}, sans-serif; }
        .error { color: #ef4444; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

        setPreviewHtml(html)
        setIsLoading(false)
        return
      }

      // Handle React format (fallback)
      let componentCode = generatedCode
      
      // If the code contains markdown code blocks, extract the TypeScript code
      const codeBlockMatch = generatedCode.match(/```(?:typescript|tsx|jsx)?\s*\n([\s\S]*?)\n```/)
      if (codeBlockMatch) {
        componentCode = codeBlockMatch[1]
      }

      // Check if code is complete (has closing tags and proper structure)
      const hasCompleteComponent = componentCode.includes('export default function') && 
                                   componentCode.includes('return (') && 
                                   componentCode.includes('</div>') &&
                                   componentCode.includes('}') &&
                                   !componentCode.includes('prizes: {') && // Check for incomplete objects
                                   !componentCode.includes('sponsors: {') && // Check for other incomplete objects
                                   !componentCode.includes('rules: {') && // Check for other incomplete objects
                                   componentCode.split('{').length === componentCode.split('}').length && // Balanced braces
                                   componentCode.trim().endsWith('}') // Ends with closing brace

      if (!hasCompleteComponent) {
        console.log('Code is incomplete, using mock template. Generated code length:', componentCode.length)
        console.log('Code ends with:', componentCode.slice(-50))
        // Use mock template if generated code is incomplete
        const mockCode = `
'use client'

import { useState } from 'react'

export default function TournamentPage() {
  const config = {
    theme: {
      primaryColor: '${config.theme?.primaryColor || '#3B82F6'}',
      secondaryColor: '${config.theme?.secondaryColor || '#10B981'}',
      fontFamily: '${config.theme?.fontFamily || 'Inter'}'
    },
    tournament: {
      title: '${config.title || 'Championship Toernooi'}',
      date: '${config.date || 'Datum nog te bepalen'}',
      location: '${config.location || 'Online/TBA'}',
      description: '${config.description || 'Een spannend toernooi voor alle deelnemers'}',
      participants: ${config.participants || 8},
      game: '${config.game || 'CS2'}'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-2xl tracking-tight">
              ${config.title?.toUpperCase() || 'CHAMPIONSHIP'}
            </div>
            <div className="hidden md:flex space-x-8 text-white">
              <a href="#about" className="hover:text-purple-400 transition-colors duration-300">Over</a>
              <a href="#teams" className="hover:text-purple-400 transition-colors duration-300">Teams</a>
              <a href="#contact" className="hover:text-purple-400 transition-colors duration-300">Contact</a>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-6 px-6 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20">
              <span className="text-purple-400 font-bold text-sm tracking-widest uppercase">Officieel Toernooi</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
              ${config.title?.toUpperCase() || 'CHAMPIONSHIP'}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                EVENT
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-white text-lg">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📅</span>
                <span className="font-semibold">${config.date || 'Datum TBD'}</span>
              </div>
              <div className="hidden sm:block w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">📍</span>
                <span className="font-semibold">${config.location || 'Online'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
                Schrijf Nu In
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-slate-900 transition-all duration-300">
                Meer Info
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Over Het Toernooi
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              ${config.description || 'Een spannend toernooi voor alle deelnemers'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-4">Prijs Pool</h3>
              <p className="text-3xl font-black text-purple-400 mb-2">€5,000</p>
              <p className="text-gray-300">Totaal prijzengeld</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-4">Teams</h3>
              <p className="text-3xl font-black text-purple-400 mb-2">${config.participants || 8}</p>
              <p className="text-gray-300">Deelnemende teams</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-white mb-4">Game</h3>
              <p className="text-3xl font-black text-purple-400 mb-2">${config.game || 'CS2'}</p>
              <p className="text-gray-300">Counter-Strike 2</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white border-opacity-20">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="text-white font-bold text-2xl mb-4">${config.title?.toUpperCase() || 'CHAMPIONSHIP'} EVENT</div>
          <p className="text-gray-300 mb-6">Het ultieme ${config.game || 'CS2'} toernooi</p>
          <p className="text-gray-400">&copy; 2025 ${config.title || 'Championship'} Event. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  )
}`
        componentCode = mockCode
      }

      // Create a complete HTML page with the component
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: ${config.theme?.fontFamily || 'Inter'}, sans-serif; }
        .preview-container { min-height: 100vh; }
        .error { color: #ef4444; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        try {
            // Tournament configuration
            const tournamentConfig = ${JSON.stringify(config, null, 8)};
            
            // Component code
            ${componentCode}
            
            // Render the component
            ReactDOM.render(<TournamentPage />, document.getElementById('root'));
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = '<div class="error"><h3>Preview Error</h3><p>Error: ' + error.message + '</p><p>This usually means the generated code is incomplete or has syntax errors.</p></div>';
        }
    </script>
</body>
</html>`

      setPreviewHtml(html)
      setIsLoading(false)
    }
  }, [generatedCode, config])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preview wordt geladen...</p>
        </div>
      </div>
    )
  }

  if (!generatedCode) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <p className="text-gray-600">Klik op &quot;Genereer Template&quot; om een preview te zien</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-600">Live Preview</span>
      </div>
      <iframe
        srcDoc={previewHtml}
        className="w-full h-96"
        title="Template Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
