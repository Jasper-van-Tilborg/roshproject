// Helper functie om gegenereerde TSX code om te zetten naar een HTML preview
export function convertCodeToPreviewHTML(code: string): string {
  // Verwijder imports en 'use client'
  let cleanCode = code
    .replace(/^['"]use client['"];?\s*/gm, '')
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  
  // Extract de return statement inhoud (JSX)
  const returnMatch = cleanCode.match(/return\s*\(([\s\S]*?)\n\s*\)/);
  let jsx = returnMatch ? returnMatch[1] : cleanCode;
  
  // Converteer className naar class voor HTML
  jsx = jsx.replace(/className=/g, 'class=');
  
  // Verwijder onbekende HTML attributen die problemen kunnen geven
  jsx = jsx.replace(/onChange=\{[^}]*\}/g, '');
  jsx = jsx.replace(/onClick=\{[^}]*\}/g, 'onclick="return false;"');
  jsx = jsx.replace(/onSubmit=\{[^}]*\}/g, 'onsubmit="return false;"');
  jsx = jsx.replace(/value=\{[^}]*\}/g, '');
  
  // Bouw complete HTML
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tournament Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700;900&family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Smooth scroll */
    html {
      scroll-behavior: smooth;
    }
    
    /* Custom animations */
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }
  </style>
</head>
<body>
  ${jsx}
</body>
</html>`;
}

// Alternatieve functie: render de code als React in een sandboxed omgeving
export function createPreviewURL(code: string): string {
  const html = convertCodeToPreviewHTML(code);
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

