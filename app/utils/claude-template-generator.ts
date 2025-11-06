// System prompt voor Claude model - Verbeterde versie voor bewerkbare componenten
export const CLAUDE_SYSTEM_PROMPT = `Je bent een expert frontend developer die professionele, bewerkbare toernooi-websites bouwt.

🎯 DOEL
Genereer een complete, zelfstandige website in puur HTML, CSS en JavaScript die:
- Direct in de browser werkt zonder build tools
- Volledig bewerkbaar is via een live editor
- Component-gebaseerd is voor eenvoudige aanpassingen
- Modern en responsive is

⚙️ STRUCTUUR REQUIREMENTS

1. HTML STRUCTUUR
- Elke component in een eigen <section> met uniek ID (bijv. id="hero-section")
- Data-attributes voor identificatie: data-component="hero" data-editable="true"
- Semantische HTML5 elementen (header, main, section, article, footer)
- Duidelijke class namen: .tournament-hero, .team-card, .bracket-container

2. CSS ORGANISATIE
- CSS Variables voor alle kleuren en instellingen in :root {}
- Elke component heeft eigen CSS sectie met comment header
- Gebruik flexbox/grid voor layout
- Mobile-first responsive design met media queries
- Geen inline styles, alles via classes

3. JAVASCRIPT MODULARITEIT
- Config object met alle instellingen bovenaan script.js
- Elke component heeft eigen init/render functie
- Component functies zijn zelfstandig en herbruikbaar
- Event listeners netjes georganiseerd per component

📐 COMPONENT ARCHITECTUUR

Elke component moet deze structuur volgen:

<!-- HTML -->
<section id="component-name-section" class="component-section" data-component="component-name" data-editable="true">
  <div class="component-container">
    <!-- Component inhoud -->
  </div>
</section>

/* CSS */
/* ===== COMPONENT: Component Name ===== */
#component-name-section {
  /* Component specifieke styles */
}

/* JavaScript */
// Component: Component Name
function initComponentName() {
  const section = document.getElementById('component-name-section');
  // Component logica
}

🧱 BEWERKBAARHEID REQUIREMENTS

Om componenten makkelijk bewerkbaar te maken:

1. HTML IDs en classes moeten beschrijvend zijn:
   - Goed: id="tournament-hero", class="team-card"
   - Slecht: id="div1", class="box"

2. CSS moet CSS Variables gebruiken:
   :root {
     --hero-bg-color: #1a1a2e;
     --hero-text-color: #ffffff;
     --hero-padding: 4rem;
   }

3. JavaScript moet config object gebruiken:
   const config = {
     hero: {
       title: "Tournament Name",
       subtitle: "Join the competition",
       background: "#1a1a2e"
     }
   }

4. Tekst content moet in data-attributes of JS variabelen:
   <h1 data-editable-text="tournament.title">Tournament Name</h1>
   OF
   const content = { tournament: { title: "Tournament Name" } };

📦 OUTPUT FORMAT

Je moet de code leveren in dit exacte formaat:

\`\`\`html
<!-- index.html -->
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tournament Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Alle HTML hier -->
    <script src="script.js"></script>
</body>
</html>
\`\`\`

\`\`\`css
/* style.css */
:root {
    /* CSS Variables */
}

/* Component styles */
\`\`\`

\`\`\`javascript
// script.js
const config = {
    /* Config object */
};

// Component functies
\`\`\`

❌ BELANGRIJKE RESTRICTIES
- GEEN React, Vue, of andere frameworks
- GEEN inline styles (behalve waar echt nodig)
- GEEN hardcoded content (gebruik config/data)
- GEEN externe dependencies (behalve Google Fonts als nodig)
- WEL: Vanilla JavaScript ES6+
- WEL: Moderne CSS (Flexbox, Grid, Variables)
- WEL: Responsive design
- WEL: Accessible HTML

✅ BEST PRACTICES
- Clean, leesbare code met comments
- Consistent indentatie en formatting
- Performance-optimized (minimal reflow/repaint)
- Cross-browser compatible
- SEO-friendly markup

📝 OUTPUT INSTRUCTIE
Lever ALLEEN de drie code bestanden (HTML, CSS, JS) in code blocks.
Geen uitleg, geen pseudocode, alleen werkende code.`;

// Helper functie om wizard antwoorden om te zetten naar een Claude prompt
export function buildClaudePrompt(answers: Record<string, string | number | boolean>): string {
  // Converteer wizard antwoorden naar JSON formaat voor de nieuwe system prompt
  const components: string[] = [];
  
  // Bepaal welke componenten geïncludeerd moeten worden
  if (answers.include_schedule) components.push('schedule');
  if (answers.include_teams) components.push('bracket');
  if (answers.include_sponsors) components.push('sponsors');
  if (answers.include_registration) components.push('registration');
  if (answers.include_social) components.push('social');
  if (answers.include_twitch) components.push('twitch');

  const tournamentData = {
    title: answers.tournament_name || 'Championship Toernooi',
    date: answers.tournament_date || 'Datum nog te bepalen',
    location: answers.tournament_location || 'Online/TBA',
    description: answers.tournament_description || 'Een spannend toernooi voor alle deelnemers',
    participants: answers.participants || 16,
    bracketType: answers.bracket_type || 'single_elimination',
    game: answers.game_type || 'CS2',
    theme: {
      primaryColor: answers.primary_color || '#3B82F6',
      secondaryColor: answers.secondary_color || '#10B981',
      fontFamily: answers.font_family || 'Inter'
    },
    components: components
  }

  return `${CLAUDE_SYSTEM_PROMPT}

---

TOURNAMENT CONFIGURATIE:
${JSON.stringify(tournamentData, null, 2)}

Genereer nu een complete HTML/CSS/JavaScript website volgens de bovenstaande specificaties.
Lever de drie bestanden (HTML, CSS, JS) in aparte code blocks.`;
}

// Functie om Claude API aan te roepen
export async function generateTournamentTemplate(
  answers: Record<string, string | number | boolean>
): Promise<{ 
  success: boolean
  code?: string
  error?: string
  components?: {
    html: string
    css: string
    js: string
  }
}> {
  try {
    const prompt = buildClaudePrompt(answers);
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        systemPrompt: CLAUDE_SYSTEM_PROMPT,
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 32768, // Hoge limit voor complete websites met HTML, CSS en JS
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to generate template',
      };
    }

    const data = await response.json();
    
    // Extract alle code blocks (HTML, CSS, JS)
    const code = data.response;
    
    console.log('Claude response length:', code.length);
    console.log('First 500 chars:', code.substring(0, 500));
    
    // Parse multiple code blocks - probeer verschillende patronen
    // HTML match - probeer eerst html code block, dan standalone HTML
    const htmlMatch = code.match(/```html\s*\n([\s\S]*?)\n```/i) || 
                      code.match(/```\s*\n(<!DOCTYPE[\s\S]*?)\n```/i) ||
                      code.match(/```\s*\n(<html[\s\S]*?)\n```/i);
    
    // CSS match - probeer css code block, dan standalone CSS
    const cssMatch = code.match(/```css\s*\n([\s\S]*?)\n```/i) || 
                      code.match(/```\s*\n(\/\*[\s\S]*?\*\/[\s\S]*?)\n```/s) ||
                      code.match(/```\s*\n(:root\s*\{[\s\S]*?)\n```/i) ||
                      code.match(/```\s*\n(\.[\w-]+\s*\{[\s\S]*?)\n```/i);
    
    // JS match - probeer javascript/js code block
    const jsMatch = code.match(/```javascript\s*\n([\s\S]*?)\n```/i) || 
                    code.match(/```js\s*\n([\s\S]*?)\n```/i) ||
                    code.match(/```\s*\n(const\s+[\w]+\s*=[\s\S]*?)\n```/i) ||
                    code.match(/```\s*\n(function\s+[\w]+\s*\([\s\S]*?)\n```/i);
    
    console.log('Parsed matches:', {
      html: htmlMatch ? htmlMatch[1].substring(0, 100) : 'NOT FOUND',
      css: cssMatch ? cssMatch[1].substring(0, 100) : 'NOT FOUND',
      js: jsMatch ? jsMatch[1].substring(0, 100) : 'NOT FOUND'
    });
    
    // Combine alle code in een object
    const parsedCode = {
      html: htmlMatch ? htmlMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
      js: jsMatch ? jsMatch[1].trim() : '',
      combined: code // Fallback naar volledige response als parsing faalt
    };

    // Als we HTML/CSS/JS hebben, combineer ze tot een werkende pagina
    // Maar retourneer altijd components, zelfs als een deel ontbreekt
    if (parsedCode.html || parsedCode.css || parsedCode.js) {
      // Combine tot een complete HTML pagina met embedded CSS en JS
      let htmlContent = parsedCode.html || '<div></div>';
      let cssContent = parsedCode.css || '';
      let jsContent = parsedCode.js || '';
      
      // Als HTML al een complete pagina is met style/script tags, extract die
      if (htmlContent.includes('<style>') && !cssContent) {
        const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) {
          cssContent = styleMatch[1].trim();
          htmlContent = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        }
      }
      
      if (htmlContent.includes('<script>') && !jsContent) {
        const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
          jsContent = scriptMatch[1].trim();
          htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        }
      }
      
      // Combineer tot full HTML
      const fullHtml = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tournament</title>
    <style>${cssContent}</style>
</head>
<body>
    ${htmlContent}
    <script>${jsContent}</script>
</body>
</html>`;
      
      return {
        success: true,
        code: fullHtml,
        components: {
          html: htmlContent,
          css: cssContent,
          js: jsContent
        }
      };
    }

    // Fallback: probeer om alle code te extracten
    const codeBlockRegex = /```(?:html|css|javascript|js)?\s*\n([\s\S]*?)\n```/gi;
    const matches = [...code.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      return {
        success: true,
        code: matches.map(m => m[1]).join('\n\n'),
      };
    }

    // Laatste fallback: retourneer volledige response
    return {
      success: true,
      code: parsedCode.combined,
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Functie om gegenereerde code op te slaan als component bestand
export function saveGeneratedTemplate(code: string, tournamentName: string): string {
  // In een echte implementatie zou je dit naar de server sturen
  // Voor nu retourneren we de code die de gebruiker kan copy-pasten
  const filename = tournamentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `// Save this as: app/tournaments/${filename}/page.tsx\n\n${code}`;
}

// Test functie om de nieuwe prompt te testen
export function testNewPrompt() {
  const testConfig = {
    tournament_name: 'Test Tournament',
    tournament_date: '2025-01-01',
    tournament_location: 'Online',
    tournament_description: 'A test tournament',
    participants: 8,
    bracket_type: 'single_elimination',
    game_type: 'CS2',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    font_family: 'Inter',
    include_teams: true,
    include_twitch: true
  }

  return buildClaudePrompt(testConfig)
}

