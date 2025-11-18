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

🧭 NAVIGATION COMPONENT SPECIFICATIES

Het Navigation component (header/navbar) moet volledig bewerkbaar zijn met de volgende structuur:

1. FORMAT SELECTIE
   Het Navigation component moet 4 verschillende formaten ondersteunen via data-attribute:
   - data-nav-format="default" - Logo links, nav links rechts (standaard navbar)
   - data-nav-format="centered" - Logo gecentreerd, nav links links en rechts van logo
   - data-nav-format="minimal" - Logo links, nav links rechts, maar met minimale spacing
   - data-nav-format="spacious" - Logo links, nav links rechts, maar met ruime spacing

   HTML structuur:
   <header id="navigation-section" class="navigation-section" data-component="navigation" data-editable="true" data-nav-format="default">
     <nav class="nav-container">
       <div class="nav-logo">
         <img id="nav-logo-img" src="" alt="Logo" data-editable-image="true" />
       </div>
       <ul class="nav-links" data-nav-links="true">
         <li><a href="#hero-section" data-nav-link-text="Home">Home</a></li>
         <li><a href="#bracket-section" data-nav-link-text="Bracket">Bracket</a></li>
         <li><a href="#schedule-section" data-nav-link-text="Programma">Programma</a></li>
         <li><a href="#about-section" data-nav-link-text="Over">Over</a></li>
       </ul>
     </nav>
   </header>

   BELANGRIJK:
   - Elke nav link moet data-nav-link-text attribuut hebben met de bewerkbare tekst
   - De href moet automatisch naar de juiste sectie leiden (#hero-section, #bracket-section, etc.)
   - Gebruik CSS classes voor format variaties: .nav-format-default, .nav-format-centered, .nav-format-minimal, .nav-format-spacious
   
   CSS voor format variaties (VERPLICHT te implementeren):
   
   /* Default Format - Logo links, nav rechts */
   [data-nav-format="default"] .nav-container,
   .nav-format-default .nav-container {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 1rem 2rem;
   }
   [data-nav-format="default"] .nav-links,
   .nav-format-default .nav-links {
     display: flex;
     list-style: none;
     gap: 2rem;
   }
   
   /* Centered Format - Logo gecentreerd, nav links en rechts */
   [data-nav-format="centered"] .nav-container,
   .nav-format-centered .nav-container {
     display: flex;
     align-items: center;
     justify-content: space-between;
     padding: 1rem 2rem;
     position: relative;
   }
   [data-nav-format="centered"] .nav-logo,
   .nav-format-centered .nav-logo {
     position: absolute;
     left: 50%;
     top: 50%;
     transform: translate(-50%, -50%);
     z-index: 10;
     pointer-events: none;
   }
   [data-nav-format="centered"] .nav-logo img,
   .nav-format-centered .nav-logo img {
     pointer-events: auto;
   }
   [data-nav-format="centered"] .nav-links,
   .nav-format-centered .nav-links {
     display: flex;
     list-style: none;
     margin: 0;
     padding: 0;
     width: 100%;
     position: relative;
     z-index: 1;
     gap: 2rem;
   }
   /* First 2 links go to the left */
   [data-nav-format="centered"] .nav-links li:nth-child(1),
   .nav-format-centered .nav-links li:nth-child(1),
   [data-nav-format="centered"] .nav-links li:nth-child(2),
   .nav-format-centered .nav-links li:nth-child(2) {
     margin-right: auto;
   }
   /* Add a spacer between 2nd and 3rd link using a pseudo-element on the ul */
   [data-nav-format="centered"] .nav-links::after,
   .nav-format-centered .nav-links::after {
     content: '';
     flex: 1;
     order: 1;
     min-width: 150px;
   }
   /* Links from 3rd onwards go to the right */
   [data-nav-format="centered"] .nav-links li:nth-child(n+3),
   .nav-format-centered .nav-links li:nth-child(n+3) {
     order: 2;
     margin-left: auto;
   }
   
   /* Minimal Format - Default maar met minimale spacing */
   [data-nav-format="minimal"] .nav-container,
   .nav-format-minimal .nav-container {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 0.5rem 1rem;
   }
   [data-nav-format="minimal"] .nav-links,
   .nav-format-minimal .nav-links {
     display: flex;
     list-style: none;
     gap: 0.75rem;
   }
   
   /* Spacious Format - Default maar met ruime spacing */
   [data-nav-format="spacious"] .nav-container,
   .nav-format-spacious .nav-container {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 2rem 4rem;
   }
   [data-nav-format="spacious"] .nav-links,
   .nav-format-spacious .nav-links {
     display: flex;
     list-style: none;
     gap: 3rem;
   }

2. LOGO UPLOAD
   - Logo moet in een <img> element met id="nav-logo-img" en data-editable-image="true"
   - Standaard src kan leeg zijn of een placeholder
   - Logo moet responsive zijn en goed schalen

3. NAV LINKS
   - Alle nav links moeten in een <ul class="nav-links"> met data-nav-links="true"
   - Elke link moet data-nav-link-text attribuut hebben voor bewerkbare tekst
   - Href moet automatisch naar componenten leiden (gebruik #component-id format)
   - Minimaal 4 links genereren: Home, Bracket, Programma, Over

4. CSS VARIABLES
   Gebruik CSS variables voor bewerkbare eigenschappen:
   :root {
     --nav-bg-color: #ffffff;
     --nav-text-color: #000000;
     --nav-logo-width: 120px;
     --nav-logo-height: 40px;
     --nav-link-spacing: 2rem; /* Voor minimal/spacious variaties */
   }

5. JAVASCRIPT CONFIG
   const navConfig = {
     format: 'default', // 'default', 'centered', 'minimal', 'spacious'
     logo: {
       src: '',
       alt: 'Logo'
     },
     links: [
       { text: 'Home', href: '#hero-section' },
       { text: 'Bracket', href: '#bracket-section' },
       { text: 'Programma', href: '#schedule-section' },
       { text: 'Over', href: '#about-section' }
     ]
   }

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
                      code.match(/```\s*\n(\/\*[\s\S]*?\*\/[\s\S]*?)\n```/) ||
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

