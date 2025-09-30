# Beat the Pro Game - Installatie Instructies

## 📦 Overzicht

Dit is een standalone, portable React/Next.js game component die je in elk project kunt gebruiken.

## 🚀 Installatie

### Optie 1: Kopieer de Map

1. Kopieer de hele `BeatTheProGame` map naar je project:
   ```bash
   cp -r BeatTheProGame /path/to/your/project/
   ```

2. Plaats de map in je project structuur:
   ```
   your-project/
   ├── app/
   ├── components/
   │   └── BeatTheProGame/    👈 Hier
   ├── public/
   └── package.json
   ```

### Optie 2: Symlink (Development)

Voor development kun je een symlink maken:
```bash
ln -s /path/to/BeatTheProGame /path/to/your-project/components/BeatTheProGame
```

## 📋 Dependencies

Het spel heeft alleen deze peer dependencies nodig:

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

**Geen extra packages nodig!** Het spel gebruikt alleen vanilla React.

## 🎮 Basis Gebruik

### In een Next.js Project

```tsx
// app/game/page.tsx
'use client';

import BeatThePro from '@/components/BeatTheProGame';

export default function GamePage() {
  return <BeatThePro />;
}
```

### In een React Project

```tsx
// src/pages/Game.tsx
import BeatThePro from '../components/BeatTheProGame';

export default function Game() {
  return <BeatThePro />;
}
```

## ⚙️ Met Configuratie

```tsx
import BeatThePro from '@/components/BeatTheProGame';

export default function GamePage() {
  return (
    <BeatThePro 
      config={{
        gameDuration: 30,
        proScore: 100,
        availableKeys: ['W', 'A', 'S', 'D'],
        primaryColor: '#3B82F6',
        title: 'Beat the Pro',
        onGameEnd: (score, hasWon) => {
          console.log('Game ended!', score, hasWon);
        },
      }}
    />
  );
}
```

## 🎨 CSS/Styling

### Tailwind CSS (Aanbevolen)

Het spel gebruikt Tailwind CSS classes. Zorg ervoor dat Tailwind is geconfigureerd in je project:

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './BeatTheProGame/**/*.{js,ts,jsx,tsx}', // 👈 Voeg dit toe
  ],
  // ... rest van config
}
```

### Custom CSS

Als je geen Tailwind gebruikt, moet je de basis styles toevoegen:

```css
/* styles/beatthepro.css */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
```

## 📁 Structuur

```
BeatTheProGame/
├── index.tsx              # Main export file
├── package.json           # Package metadata
├── INSTALL.md            # This file
├── src/
│   ├── BeatThePro.tsx    # Main game component
│   ├── Timer.tsx         # Timer component
│   ├── Scoreboard.tsx    # Score display
│   ├── KeyboardInput.tsx # Keyboard handler
│   ├── Result.tsx        # End screen
│   ├── config.example.ts # Example configs
│   ├── index.tsx         # Component exports
│   └── README.md         # Full documentation
└── example/
    └── page.example.tsx  # Usage example
```

## 🔧 TypeScript

TypeScript is volledig ondersteund. Types worden automatisch geëxporteerd:

```tsx
import BeatThePro, { type BeatTheProConfig } from '@/components/BeatTheProGame';

const config: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
};
```

## 🌐 Framework Compatibiliteit

### ✅ Werkt met:

- **Next.js 13+** (App Router) - `'use client'` component
- **Next.js 12** (Pages Router)
- **Create React App**
- **Vite + React**
- **Remix**
- **Gatsby**
- Elk ander React framework

### ⚠️ Let op:

- Het spel is een **Client Component** (`'use client'` in Next.js)
- Gebruikt browser APIs (window, document)
- Niet geschikt voor SSR tijdens render (alleen na hydration)

## 🚨 Troubleshooting

### "Module not found"

Zorg ervoor dat je import path klopt:
```tsx
// Next.js met @ alias
import BeatThePro from '@/components/BeatTheProGame';

// Of relatief path
import BeatThePro from '../BeatTheProGame';
```

### Tailwind classes werken niet

Voeg het pad toe aan `tailwind.config.js`:
```js
content: [
  './BeatTheProGame/**/*.{tsx,ts}',
]
```

### Keyboard events werken niet

Het component moet in de browser runnen. In Next.js:
```tsx
'use client'; // 👈 Voeg dit toe bovenaan je file
```

### TypeScript errors

Zorg ervoor dat TypeScript de component kan vinden:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🎯 Quick Start Checklist

- [ ] Kopieer `BeatTheProGame` map naar je project
- [ ] Configureer Tailwind (of voeg custom CSS toe)
- [ ] Importeer `BeatThePro` component
- [ ] Voeg `'use client'` toe (Next.js App Router)
- [ ] Test het spel!

## 📚 Volledige Documentatie

Zie `src/README.md` voor complete documentatie over:
- Alle configuratie opties
- Custom toetsen setup
- Styling/theming
- Callbacks en events
- Voorbeelden
- Best practices

## 💡 Voorbeeld Implementatie

Zie `example/page.example.tsx` voor een volledig werkend voorbeeld.

## 🤝 Support

Voor vragen, check de README of open een issue in je project repository.
