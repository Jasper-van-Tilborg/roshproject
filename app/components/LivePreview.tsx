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
      
      const isHtmlFormat = generatedCode.includes('<!DOCTYPE html>') || 
                          generatedCode.includes('<html') ||
                          generatedCode.includes('index.html')

      if (isHtmlFormat) {
        let htmlContent = generatedCode
        
        const htmlMatch = generatedCode.match(/```html\s*\n([\s\S]*?)\n```/)
        if (htmlMatch) {
          htmlContent = htmlMatch[1]
        }
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Tournament Preview</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 0;
            font-family: ${(config.theme as { fontFamily?: string })?.fontFamily || 'Inter'}, sans-serif;
            width: 100%;
            overflow-x: hidden;
        }
        img { max-width: 100%; height: auto; }
        .error { color: #ef4444; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
        @media (max-width: 640px) {
            body { font-size: 14px; }
        }
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

      let componentCode = generatedCode
      
      const codeBlockMatch = generatedCode.match(/```(?:typescript|tsx|jsx)?\s*\n([\s\S]*?)\n```/)
      if (codeBlockMatch) {
        componentCode = codeBlockMatch[1]
      }

      const hasCompleteComponent = componentCode.includes('export default function') && 
                                   componentCode.includes('return (') && 
                                   componentCode.includes('</div>') &&
                                   componentCode.includes('}') &&
                                   !componentCode.includes('prizes: {') &&
                                   !componentCode.includes('sponsors: {') &&
                                   !componentCode.includes('rules: {') &&
                                   componentCode.split('{').length === componentCode.split('}').length &&
                                   componentCode.trim().endsWith('}')

      if (!hasCompleteComponent) {
        console.error('Generated code is incomplete')
        setPreviewHtml('<div class="error"><h3>Preview Error</h3><p>De gegenereerde code is incompleet of heeft syntax fouten.</p></div>')
        setIsLoading(false)
        return
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Template Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 0;
            font-family: ${(config.theme as { fontFamily?: string })?.fontFamily || 'Inter'}, sans-serif;
            width: 100%;
            overflow-x: hidden;
        }
        #root { width: 100%; min-height: 100vh; }
        img { max-width: 100%; height: auto; }
        .preview-container { min-height: 100vh; width: 100%; }
        .error { color: #ef4444; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
        @media (max-width: 640px) {
            body { font-size: 14px; }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        try {
            const tournamentConfig = ${JSON.stringify(config, null, 8)};
            ${componentCode}
            ReactDOM.render(<TournamentPage />, document.getElementById('root'));
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = '<div class="error"><h3>Preview Error</h3><p>Error: ' + error.message + '</p></div>';
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
    <div className="border rounded-lg overflow-hidden w-full">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-600">Live Preview</span>
      </div>
      <div className="w-full overflow-auto bg-white">
        <iframe
          srcDoc={previewHtml}
          className="w-full border-0 block h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px]"
          title="Template Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
