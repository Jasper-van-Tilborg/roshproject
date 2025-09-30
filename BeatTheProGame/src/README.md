# Beat the Pro - Whitelabel Game Component

Een volledig configureerbare, whitelabel game component voor React + Next.js waarbij spelers zo snel mogelijk toetsen indrukken om een pro-score te verslaan.

## 📋 Overzicht

Beat the Pro is een reactiesnelheid game waarbij spelers binnen een vaste tijd (standaard 30 seconden) **de juiste toetsen** moeten indrukken die het spel random toont. Alleen correcte toetsen tellen mee voor de score. Het doel is om de vooraf ingestelde "Pro" score te bereiken of te overtreffen.

## 🎮 Features

- ✅ **Volledig Whitelabel**: Alle kleuren, teksten en instellingen configureerbaar
- ✅ **Modulaire Architectuur**: Aparte componenten voor Timer, Scoreboard, KeyboardInput en Result
- ✅ **Responsive Design**: Werkt perfect op mobile, tablet en desktop
- ✅ **Realtime Feedback**: Live score updates en visuele effecten bij elke toetsaanslag
- ✅ **Keyboard Event Handling**: Detecteert alle keyboard input betrouwbaar
- ✅ **Embeddable**: Kan eenvoudig ingebed worden in bestaande websites
- ✅ **TypeScript Support**: Volledig getypeerd voor betere developer experience

## 📦 Componenten Structuur

```
app/components/BeatThePro/
├── BeatThePro.tsx       # Hoofdcomponent met game logic
├── Timer.tsx            # Timer component met progress bar
├── Scoreboard.tsx       # Score weergave en vergelijking
├── KeyboardInput.tsx    # Keyboard input handler met visuele feedback
├── Result.tsx           # Eindscherm met resultaten
├── index.tsx            # Export file
└── README.md            # Deze documentatie
```

## 🚀 Gebruik

### Basis Gebruik

```tsx
import BeatThePro from './components/BeatThePro';

export default function MyPage() {
  return <BeatThePro />;
}
```

### Met Configuratie

```tsx
import BeatThePro from './components/BeatThePro';

export default function MyPage() {
  return (
    <BeatThePro 
      config={{
        // Game Settings
        gameDuration: 30,        // Spelduur in seconden
        proScore: 100,           // Te verslaan score
        proName: 'Pro Gamer',    // Naam van de pro
        playerName: 'Speler',    // Naam van de speler
        
        // Styling
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        winColor: '#10B981',
        loseColor: '#EF4444',
        
        // Display
        title: 'Beat the Pro',
        subtitle: 'Druk zo snel mogelijk op toetsen!',
        showInstructions: true,
        
        // Callbacks
        onGameEnd: (playerScore, hasWon) => {
          console.log('Game ended!', { playerScore, hasWon });
        },
        onBackToDashboard: () => {
          // Navigate terug naar dashboard
        },
      }}
    />
  );
}
```

## ⚙️ Configuratie Opties

### BeatTheProConfig Interface

```typescript
interface BeatTheProConfig {
  // Game Settings
  gameDuration?: number;        // Spelduur in seconden (default: 30)
  proScore?: number;            // Te verslaan score (default: 100)
  proName?: string;             // Naam pro (default: 'Pro')
  playerName?: string;          // Naam speler (default: 'Jij')
  availableKeys?: string[];     // Custom toetsen (default: zie hieronder)
  
  // Styling
  primaryColor?: string;        // Hoofdkleur (default: '#3B82F6')
  secondaryColor?: string;      // Secundaire kleur (default: '#8B5CF6')
  accentColor?: string;         // Accent kleur (default: '#F59E0B')
  backgroundColor?: string;     // Achtergrondkleur (default: '#FFFFFF')
  textColor?: string;           // Tekstkleur (default: '#1F2937')
  winColor?: string;            // Win kleur (default: '#10B981')
  loseColor?: string;           // Verlies kleur (default: '#EF4444')
  
  // Display
  title?: string;               // Titel (default: 'Beat the Pro')
  subtitle?: string;            // Ondertitel
  showInstructions?: boolean;   // Toon instructies (default: true)
  
  // Callbacks
  onGameEnd?: (playerScore: number, hasWon: boolean) => void;
  onBackToDashboard?: () => void;
}
```

### Default Available Keys

```typescript
['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 
 'W', 'E', 'R', 'Q', 'Z', 'X', 'C', 'V', 'SPACE']
```

## ⌨️ Custom Toetsen Configureren

Je kunt volledig zelf bepalen welke toetsen in het spel gebruikt worden via de `availableKeys` property.

### Basis Voorbeeld

```tsx
<BeatThePro 
  config={{
    availableKeys: ['W', 'A', 'S', 'D'],
    title: 'WASD Challenge',
  }}
/>
```

### Voorbeelden van Toets Sets

**Gaming Keys (WASD)**
```tsx
availableKeys: ['W', 'A', 'S', 'D']
```

**Home Row (Touch Typing)**
```tsx
availableKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L']
```

**Nummers**
```tsx
availableKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
```

**Alle Letters**
```tsx
availableKeys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
                'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
```

**Arrow Keys**
```tsx
availableKeys: ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT']
```

**Easy Mode (Weinig toetsen)**
```tsx
availableKeys: ['A', 'S', 'D', 'F', 'SPACE']
```

**Hard Mode (Veel toetsen)**
```tsx
availableKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
                'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 
                'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE']
```

### Toets Namen

Voor speciale toetsen gebruik je de JavaScript KeyboardEvent codes:

| Toets | Code |
|-------|------|
| Letters | `'A'`, `'B'`, `'C'`, etc. |
| Nummers | `'1'`, `'2'`, `'3'`, etc. |
| Spatiebalk | `'SPACE'` |
| Enter | `'ENTER'` |
| Pijltjes | `'ARROWUP'`, `'ARROWDOWN'`, `'ARROWLEFT'`, `'ARROWRIGHT'` |
| Tab | `'TAB'` |
| Shift | `'SHIFTLEFT'`, `'SHIFTRIGHT'` |
| Control | `'CONTROLLEFT'`, `'CONTROLRIGHT'` |

**💡 Tip**: Test welke code een toets heeft door `event.code` te console.loggen in een keydown event handler.

## 🎨 Whitelabel Styling

Alle visuele aspecten kunnen worden aangepast via de config:

### Kleuren Schema's

**Blauw Theme (Default)**
```tsx
primaryColor: '#3B82F6',
secondaryColor: '#8B5CF6',
accentColor: '#F59E0B',
```

**Groen Theme**
```tsx
primaryColor: '#10B981',
secondaryColor: '#059669',
accentColor: '#F59E0B',
```

**Rood Theme**
```tsx
primaryColor: '#EF4444',
secondaryColor: '#DC2626',
accentColor: '#F59E0B',
```

## 📱 Responsive Design

Het spel is volledig responsive en past zich aan aan verschillende schermformaten:

- **Mobile**: Optimized voor touch en kleine schermen
- **Tablet**: Balanced layout voor medium screens
- **Desktop**: Volledige layout met alle features

## 🔌 Integration met Dashboard

### Voorbeeld: Dashboard Integratie

```tsx
'use client';

import { useRouter } from 'next/navigation';
import BeatThePro from '../components/BeatThePro';

export default function DashboardBeatThePro() {
  const router = useRouter();
  
  // Haal configuratie uit localStorage of context
  const tournamentConfig = JSON.parse(
    localStorage.getItem('tournamentConfig') || '{}'
  );
  
  return (
    <BeatThePro 
      config={{
        gameDuration: 30,
        proScore: tournamentConfig.proScore || 100,
        primaryColor: tournamentConfig.primaryColor,
        secondaryColor: tournamentConfig.secondaryColor,
        
        onGameEnd: (playerScore, hasWon) => {
          // Opslaan in database of localStorage
          fetch('/api/game-results', {
            method: 'POST',
            body: JSON.stringify({ playerScore, hasWon }),
          });
        },
        
        onBackToDashboard: () => {
          router.push('/dashboard');
        },
      }}
    />
  );
}
```

## 🎯 Game Logic

1. **Start**: Speler klikt op "Start Spel"
2. **Playing**: 
   - Timer start met countdown
   - Het spel toont een random toets die de speler moet indrukken
   - **Correcte toets**: +1 punt, nieuwe toets wordt getoond, streak gaat omhoog
   - **Foute toets**: Geen punten, streak reset, dezelfde toets blijft staan
   - **Streak bonus**: Elke 5 correcte toetsen achter elkaar geeft bonus punten
   - Realtime vergelijking met pro-score
   - Visuele feedback: groen voor correct, rood voor fout
3. **Finished**:
   - Eindresultaten worden getoond
   - Win/verlies status
   - Performance metrics (score, accuracy, fouten)
   - Opties voor herspelen of terug naar dashboard

## 📊 Analytics & Tracking

Gebruik de `onGameEnd` callback om game data te tracken:

```tsx
onGameEnd: (playerScore, hasWon) => {
  // Google Analytics
  gtag('event', 'game_complete', {
    score: playerScore,
    won: hasWon,
  });
  
  // Custom tracking
  trackGameResult({
    playerScore,
    hasWon,
    timestamp: Date.now(),
  });
}
```

## 🐛 Troubleshooting

### Keyboard events werken niet

De component gebruikt `window.addEventListener` voor keyboard events. Zorg ervoor dat:
- De component is gemount
- Er geen andere keyboard event listeners zijn die events blokkeren
- De browser focus heeft (niet in een iframe zonder focus)

### Styling override werkt niet

Gebruik inline styles via de config in plaats van CSS classes voor whitelabel aanpassingen.

## 🚀 Deployment

Het spel werkt out-of-the-box met Next.js. Voor productie:

```bash
npm run build
npm run start
```

## 📋 Quick Reference - Toetsen Aanpassen

### Stap 1: Open je pagina file
```tsx
// app/beatthepro/page.tsx
import BeatThePro from '../components/BeatThePro';
```

### Stap 2: Voeg availableKeys toe aan config
```tsx
<BeatThePro 
  config={{
    availableKeys: ['W', 'A', 'S', 'D'],  // Jouw custom toetsen
    title: 'WASD Challenge',
    proScore: 80,
  }}
/>
```

### Stap 3: Test het spel
- Start de development server
- Ga naar `/beatthepro`
- Het spel gebruikt nu alleen je gekozen toetsen!

### Populaire Toets Sets

| Set | Keys | Gebruik |
|-----|------|---------|
| WASD | `['W', 'A', 'S', 'D']` | Gaming |
| Home Row | `['A', 'S', 'D', 'F', 'J', 'K', 'L']` | Touch typing |
| Numbers | `['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']` | Number training |
| Easy | `['A', 'S', 'D', 'SPACE']` | Beginners |
| Full Alpha | `['A'-'Z']` (array) | Advanced |

### Voorbeeld: Import een preset

```tsx
import { wasdOnlyConfig } from '../components/BeatThePro/config.example';

export default function MyPage() {
  return <BeatThePro config={wasdOnlyConfig} />;
}
```

## 📄 Licentie

Whitelabel - Vrij te gebruiken en aan te passen voor commerciële doeleinden.

## 🤝 Support

Voor vragen of issues, contacteer het development team.
