# 🎮 Beat the Pro Game - Snelstart Gids

## 📦 Deze Map Naar Een Ander Project Kopiëren

### Stap 1: Kopieer de hele map

**Windows:**
```cmd
xcopy /E /I "BeatTheProGame" "C:\path\to\new-project\components\BeatTheProGame"
```

**Mac/Linux:**
```bash
cp -r BeatTheProGame /path/to/new-project/components/BeatTheProGame
```

### Stap 2: Navigeer naar je nieuwe project

```bash
cd /path/to/new-project
```

### Stap 3: Voeg Tailwind config toe (als je Tailwind gebruikt)

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './components/BeatTheProGame/**/*.{js,ts,jsx,tsx}', // 👈 Voeg dit toe
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Stap 4: Maak een nieuwe pagina

**Next.js App Router:**
```tsx
// app/game/page.tsx
'use client';

import BeatThePro from '@/components/BeatTheProGame';

export default function GamePage() {
  return <BeatThePro />;
}
```

**Next.js Pages Router:**
```tsx
// pages/game.tsx
import BeatThePro from '../components/BeatTheProGame';

export default function GamePage() {
  return <BeatThePro />;
}
```

**React (CRA/Vite):**
```tsx
// src/pages/Game.tsx
import BeatThePro from '../components/BeatTheProGame';

export default function Game() {
  return <BeatThePro />;
}
```

### Stap 5: Start je server en test!

```bash
npm run dev
# of
yarn dev
# of
pnpm dev
```

Ga naar `http://localhost:3000/game` (of je configureerde route).

## ⚙️ Configureren

Open je pagina en pas de config aan:

```tsx
<BeatThePro 
  config={{
    // Pas aan naar jouw wensen!
    gameDuration: 30,
    proScore: 100,
    availableKeys: ['W', 'A', 'S', 'D'],
    primaryColor: '#3B82F6',
    title: 'Mijn Game',
  }}
/>
```

## 📁 Wat zit in deze map?

```
BeatTheProGame/
├── 📄 index.tsx              → Main export (importeer hiervandaan)
├── 📄 package.json           → Package metadata
├── 📄 README.md              → Overzicht documentatie
├── 📄 INSTALL.md             → Gedetailleerde installatie
├── 📄 HOW-TO-USE.md          → Deze file (quick start)
│
├── 📁 src/                   → Component source files
│   ├── BeatThePro.tsx        → Hoofdcomponent ⭐
│   ├── Timer.tsx             → Timer component
│   ├── Scoreboard.tsx        → Score display
│   ├── KeyboardInput.tsx     → Keyboard handler
│   ├── Result.tsx            → Eindscherm
│   ├── config.example.ts     → Voorbeeld configuraties
│   ├── index.tsx             → Component exports
│   └── README.md             → Volledige API docs
│
└── 📁 example/               → Voorbeelden
    └── page.example.tsx      → Werkende voorbeelden
```

## 🎯 Meest Gebruikte Configuraties

### WASD Gaming Keys
```tsx
<BeatThePro config={{ availableKeys: ['W', 'A', 'S', 'D'] }} />
```

### Touch Typing (Home Row)
```tsx
<BeatThePro config={{ availableKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'] }} />
```

### Numbers Only
```tsx
<BeatThePro config={{ availableKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] }} />
```

### Easy Mode (Weinig keys)
```tsx
<BeatThePro config={{ 
  availableKeys: ['A', 'S', 'D', 'SPACE'],
  gameDuration: 45,
  proScore: 60,
}} />
```

### Dark Theme
```tsx
<BeatThePro config={{ 
  backgroundColor: '#0F172A',
  textColor: '#E2E8F0',
  primaryColor: '#8B5CF6',
}} />
```

## 🎨 Styling Aanpassen

Alle kleuren zijn configureerbaar:

```tsx
<BeatThePro config={{
  primaryColor: '#YOUR_COLOR',      // Hoofdkleur
  secondaryColor: '#YOUR_COLOR',    // Secundaire kleur
  accentColor: '#YOUR_COLOR',       // Accent (correcte toets)
  backgroundColor: '#YOUR_COLOR',   // Achtergrond
  textColor: '#YOUR_COLOR',         // Tekst
  winColor: '#YOUR_COLOR',          // Win status
  loseColor: '#YOUR_COLOR',         // Verlies/fout kleur
}} />
```

## 📞 Callbacks Gebruiken

```tsx
<BeatThePro config={{
  onGameEnd: (playerScore, hasWon) => {
    // Doe iets met het resultaat
    console.log('Score:', playerScore);
    console.log('Gewonnen:', hasWon);
    
    // Bijvoorbeeld: opslaan in database
    // fetch('/api/save-score', { ... });
  },
  onBackToDashboard: () => {
    // Navigeer terug
    router.push('/dashboard');
  },
}} />
```

## 🔧 Zonder Tailwind CSS?

Als je geen Tailwind gebruikt, voeg deze CSS toe:

```css
/* styles/beatthepro.css */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-25%); }
  50% { transform: translateY(0); }
}
```

En importeer in je project:
```tsx
import './styles/beatthepro.css';
```

## ✅ Checklist voor Nieuw Project

- [ ] Kopieer `BeatTheProGame` map
- [ ] Update `tailwind.config.js` (als gebruikt)
- [ ] Maak een pagina/route
- [ ] Importeer `BeatThePro` component
- [ ] Voeg `'use client'` toe (Next.js App Router)
- [ ] Test het spel
- [ ] Pas configuratie aan naar wens

## 🐛 Problemen?

**"Module not found"**
- Check je import path
- Zorg dat de map op de juiste locatie staat

**"Tailwind classes werken niet"**
- Voeg het pad toe aan `tailwind.config.js`

**"Keyboard werkt niet"**
- Voeg `'use client'` toe (Next.js)
- Component moet in browser runnen

**TypeScript errors**
- Check `tsconfig.json` paths configuratie

Zie `INSTALL.md` voor meer troubleshooting!

## 📚 Meer Informatie

- **Volledige API docs**: `src/README.md`
- **Voorbeelden**: `example/page.example.tsx`
- **Presets**: `src/config.example.ts`

## 🚀 Klaar!

Je bent nu klaar om het spel in elk project te gebruiken! 🎮

Voor vragen, zie de andere documentatie bestanden in deze map.
