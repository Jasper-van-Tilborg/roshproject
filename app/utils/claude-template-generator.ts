// System prompt voor Claude model
export const CLAUDE_SYSTEM_PROMPT = `Context: Je bent een webdeveloper gespecialiseerd in het maken van templates voor online toernooien. De templates worden gegenereerd op basis van antwoorden op vooraf bepaalde vragen. Jij hoeft deze vragen niet zelf te bedenken — je krijgt alleen de antwoorden. 

Doel: Ontwikkel een volledig webtemplate dat aansluit op de ontvangen gebruikersantwoorden. De template moet automatisch relevante onderdelen toevoegen, afhankelijk van wat de gebruiker heeft aangegeven. 

De code moet modulair, gestructureerd en makkelijk aanpasbaar zijn door andere ontwikkelaars of AI-assistenten zoals Cursor. 

De gegenereerde code wordt gebruikt binnen een low-code platform dat toelaat dat gebruikers elementen visueel kunnen bewerken (tekst, kleur, stijl, structuur).  
Zorg dat de code hiërarchisch logisch is opgebouwd zodat deze gemakkelijk kan worden gemanipuleerd of vervangen door AI-assistenten zoals Cursor.

Invoer: 
Een reeks antwoorden van de gebruiker op vaste vragen (zoals type toernooi, aantal teams, stijl, gewenste functies, kleuren, thema, etc.). 

Logica: Op basis van deze antwoorden bepaal je: 
Welke onderdelen de template bevat (bijv. brackets, Twitch-integratie, statistieken, algemene info). 
Hoe elk onderdeel wordt weergegeven (layout, kleuren, stijl, structuur). 
Welke technologieën worden toegepast (HTML, CSS, JavaScript of Next.js). 
De invoer bestaat uit een gestructureerde prompt die wordt aangeleverd door het low-code platform (bijv. Cursor).  
Deze bevat velden zoals:
- Primaire kleur
- Secundaire kleur
- Titel, datum, locatie, beschrijving
- Lijst van componenten met hun bijbehorende gegevens

Component Architecture: 
Bouw elk onderdeel als een herbruikbare en geïsoleerde component. 
Gebruik props, config-objecten of JSON-structuren om elk onderdeel aan te sturen. 
Componenten mogen nooit statische waarden bevatten die niet door de gebruiker aangepast kunnen worden. 
Structuurvoorbeeld: 
components/ 
  TournamentInfo.jsx 
  BracketDisplay.jsx 
  TwitchEmbed.jsx 
  StatsBoard.jsx 
config/ 
  tournamentConfig.json 

Elk component leest zijn instellingen uit config/ of props. 

Customizability: 
Alle teksten, kleuren, knoppen, en afbeeldingen moeten aanpasbaar zijn via een configuratiebestand of UI-variabelen. 
Gebruik duidelijke variabelen of thema-objecten (bijv. theme.primaryColor, theme.fontFamily). 
Beschrijf bij elk component welke eigenschappen aanpasbaar zijn en hoe. 
Vermijd hardcoded waardes in CSS of JS — gebruik Tailwind-classes of variabelen. 
- Alle elementen (tekst, knoppen, afbeeldingen) moeten individueel selecteerbaar zijn in een visuele editor (zoals Cursor).
- Gebruik duidelijke HTML-structuren en classnames zodat het platform makkelijk kan detecteren welke onderdelen aanpasbaar zijn.

Cursor Compatibility: 
Schrijf schone, goed geformatteerde code (consistent gebruik van tabs, imports en exports). 
Voeg duidelijke componentnamen en korte commentaarregels toe, zodat Cursor makkelijk wijzigingen kan herkennen. 
Vermijd inline styling; gebruik Tailwind of utility classes voor eenvoud. 
De output moet direct bruikbaar zijn in een Next.js- of React-project. 

Mogelijke onderdelen: 
Toernooi-overzicht (informatie, regels, teams, tijden) 
Bracket-weergave 
Twitch- of livestream-integratie 
Statistieken en scoreborden 
Dynamische visuele lay-out (thema of kleurenschema) 

Uitvoer: Genereer een complete webtemplate met moderne, uitbreidbare code (HTML, CSS, JS of Next.js). Voeg een korte toelichting toe over: 
Hoe elk component werkt 
Welke props of configuratie het gebruikt 
Hoe de gebruiker het later kan aanpassen via Cursor of config-bestanden`;

// Helper functie om wizard antwoorden om te zetten naar een Claude prompt
export function buildClaudePrompt(answers: Record<string, string | number | boolean>): string {
  const componentsText: string[] = [];
  
  // Bepaal welke componenten geïncludeerd moeten worden
  if (answers.include_schedule) {
    componentsText.push(`- 🗓️ Programma/Schema sectie met dagindeling: ${answers.schedule_details || 'standaard programma indeling met tijdslots'}`);
  }
  
  if (answers.include_teams) {
    componentsText.push(`- 🧑‍🤝‍🧑 Teams sectie met deelnemer informatie en bracket visualisatie voor ${answers.participants || '16'} teams/deelnemers`);
  }
  
  if (answers.include_sponsors) {
    componentsText.push(`- 💼 Sponsoren sectie met logo grid: ${answers.sponsors_list || 'placeholder sponsor logos'}`);
  }
  
  if (answers.include_registration) {
    componentsText.push(`- 📬 Inschrijfformulier met velden: ${answers.form_fields || 'naam, email, teamnaam, aantal teamleden'}`);
  }
  
  if (answers.include_social) {
    componentsText.push(`- 🔗 Social media links sectie: ${answers.social_links || 'Facebook, Instagram, Twitter, Discord'}`);
  }
  
  if (answers.include_twitch) {
    componentsText.push(`- 📺 Twitch livestream embed voor kanaal: ${answers.twitch_channel || 'placeholder_channel'}`);
  }

  const bracketInfo = answers.bracket_type ? `\n- Bracket type: ${String(answers.bracket_type).replace('_', ' ')}` : '';
  const gameInfo = answers.game_type ? `\n- Game: ${String(answers.game_type).toUpperCase()}` : '';

  return `${CLAUDE_SYSTEM_PROMPT}

---

Genereer een VOLLEDIGE, FUNCTIONELE Next.js pagina in TypeScript voor een professioneel toernooi website.

**BELANGRIJKE VEREISTEN:**
- Gebruik ALLEEN Tailwind CSS classes (GEEN custom CSS, GEEN style tags)
- Maak een complete, standalone React component
- Export een default function component
- Gebruik TypeScript met proper typing
- Maak het volledig responsive (mobile-first approach)
- Voeg smooth animations en hover effects toe
- Gebruik moderne design patterns: gradients, shadows, glassmorphism
- Zorg voor goede accessibility (a11y)
- Gebruik semantic HTML

---
**TOERNOOI INFORMATIE:**
- Titel: ${answers.tournament_name || 'Championship Toernooi'}
- Datum: ${answers.tournament_date || 'Datum nog te bepalen'}
- Locatie: ${answers.tournament_location || 'Online/TBA'}
- Beschrijving: ${answers.tournament_description || 'Een spannend toernooi voor alle deelnemers'}
- Deelnemers: ${answers.participants || '16'} teams/spelers${bracketInfo}${gameInfo}

**DESIGN SPECIFICATIES:**
- Primaire kleur (gebruik voor CTA's, accenten): ${answers.primary_color || '#3B82F6'} 
- Secundaire kleur (gebruik voor highlights): ${answers.secondary_color || '#10B981'}
- Gewenste stijl: ${answers.brand_style || 'modern'} (pas dit toe in het design)
- Lettertype stijl: ${answers.font_family || 'Inter'} (gebruik font-sans voor modern, font-serif voor elegant, font-mono voor tech)

**TE IMPLEMENTEREN SECTIES:**
1. **Hero sectie** (VERPLICHT):
   - Grote hero met gradient achtergrond gebruikmakend van de primaire kleuren
   - Toernooi titel (groot en opvallend)
   - Subtitle met datum en locatie  
   - Prominente "Schrijf Nu In" / "Meer Info" CTA knoppen
   - Optioneel: hero afbeelding of illustratie

2. **Over het Toernooi** (VERPLICHT):
   - Beschrijving van het toernooi
   - Belangrijkste informatie in kaarten/cards:
     * Datum
     * Locatie
     * Aantal deelnemers
     * Prize pool (indien relevant)
     * Format/Bracket type

${componentsText.length > 0 ? '\n3. **Geselecteerde Extra Componenten:**\n' + componentsText.join('\n') : ''}

4. **Footer** (VERPLICHT):
   - Copyright informatie
   - Contact details
   - Social media links (indien gespecificeerd)

---
**DESIGN GUIDELINES:**
- Gebruik een moderne, aantrekkelijke layout
- Implementeer een gradient background met de gespecificeerde kleuren
- Voeg micro-interactions toe (hover effects, smooth scrolls)
- Gebruik cards met shadows voor informatie blokken
- Maak knoppen prominent met gradients en hover animations
- Zorg voor voldoende witruimte (padding/margin)
- Gebruik icons waar mogelijk (bijv. 📅 voor datum, 📍 voor locatie)
- Implementeer een sticky header indien logisch

**TECHNICAL REQUIREMENTS:**
- Begin direct met \`\`\`typescript
- Export default function TournamentPage() { ... }
- Gebruik 'use client' directive als interactiviteit nodig is
- Gebruik alleen Next.js Image component voor afbeeldingen
- Geen externe dependencies behalve Next.js core
- Gebruik Tailwind's built-in color palette of de gespecificeerde hex colors
- Responsive breakpoints: sm:, md:, lg:, xl:

**BELANGRIJKE OPMERKINGEN:**
- Genereer ALLEEN de TypeScript/React component code
- GEEN uitleg, GEEN markdown buiten de code block
- De code moet direct copy-pasteable zijn
- Zorg dat alle gespecificeerde componenten aanwezig zijn

Begin nu met de code:`;
}

// Functie om Claude API aan te roepen
export async function generateTournamentTemplate(
  answers: Record<string, string | number | boolean>
): Promise<{ success: boolean; code?: string; error?: string }> {
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
    
    // Extract code from response
    let code = data.response;
    
    // Als Claude een code block heeft gebruikt, extract de code
    const codeBlockRegex = /```(?:typescript|tsx|jsx|javascript)?\s*\n([\s\S]*?)\n```/;
    const match = code.match(codeBlockRegex);
    if (match) {
      code = match[1];
    }

    return {
      success: true,
      code,
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

