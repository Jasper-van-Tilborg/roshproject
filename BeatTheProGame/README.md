# 🎮 Beat the Pro Game - Portable Package

Een volledig standalone, whitelabel keyboard reaction speed game component voor React/Next.js projecten.

## ✨ Features

- ✅ **100% Portable** - Kopieer en plak in elk React project
- ✅ **Geen Extra Dependencies** - Alleen React/React-DOM nodig
- ✅ **TypeScript Support** - Volledig getypeerd
- ✅ **Whitelabel** - Alle kleuren en teksten configureerbaar
- ✅ **Custom Keys** - Kies zelf welke toetsen gebruikt worden
- ✅ **Responsive** - Werkt op mobile, tablet en desktop
- ✅ **Framework Agnostic** - Next.js, CRA, Vite, Remix, etc.

## 📦 Wat zit erin?

```
BeatTheProGame/
├── index.tsx              # Main export
├── package.json           # Package info
├── INSTALL.md            # Installatie instructies
├── README.md             # Deze file
├── src/
│   ├── BeatThePro.tsx    # Hoofdcomponent
│   ├── Timer.tsx         # Timer component
│   ├── Scoreboard.tsx    # Score display
│   ├── KeyboardInput.tsx # Keyboard handler
│   ├── Result.tsx        # Eindscherm
│   ├── config.example.ts # Voorbeeld configs
│   └── README.md         # Volledige documentatie
└── example/
    └── page.example.tsx  # Gebruik voorbeelden
```

## 🚀 Quick Start

### 1. Kopieer de Map

```bash
cp -r BeatTheProGame /path/to/your-project/components/
```

### 2. Importeer en Gebruik

```tsx
import BeatThePro from '@/components/BeatTheProGame';

export default function Page() {
  return <BeatThePro />;
}
```

### 3. Klaar! 🎉

Zie `INSTALL.md` voor gedetailleerde installatie instructies.

## 🎮 Basis Gebruik

```tsx
<BeatThePro 
  config={{
    gameDuration: 30,
    proScore: 100,
    availableKeys: ['W', 'A', 'S', 'D'],
    primaryColor: '#3B82F6',
    title: 'Beat the Pro',
  }}
/>
```

## 📚 Documentatie

- **`INSTALL.md`** - Complete installatie instructies
- **`src/README.md`** - Volledige API documentatie
- **`example/page.example.tsx`** - Werkende voorbeelden
- **`src/config.example.ts`** - Kant-en-klare configuraties

## ⚙️ Configuratie Highlights

### Custom Toetsen

```tsx
// Alleen WASD
availableKeys: ['W', 'A', 'S', 'D']

// Touch typing
availableKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L']

// Nummers
availableKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
```

### Styling

```tsx
config={{
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  accentColor: '#10B981',
  backgroundColor: '#FFFFFF',
  // ... meer opties
}}
```

### Callbacks

```tsx
config={{
  onGameEnd: (score, hasWon) => {
    console.log('Game ended!', score, hasWon);
  },
  onBackToDashboard: () => {
    router.push('/dashboard');
  },
}}
```

## 🎯 Voorbeelden

### WASD Challenge
```tsx
<BeatThePro config={{ availableKeys: ['W', 'A', 'S', 'D'] }} />
```

### Dark Mode
```tsx
<BeatThePro config={{ 
  backgroundColor: '#0F172A',
  textColor: '#E2E8F0',
  primaryColor: '#8B5CF6',
}} />
```

Zie `example/page.example.tsx` voor meer voorbeelden!

## 📋 Requirements

- React 18+ of 19+
- React-DOM 18+ of 19+
- Tailwind CSS (aanbevolen) of custom CSS

## 🌐 Framework Support

Werkt met:
- ✅ Next.js 13+ (App Router)
- ✅ Next.js 12 (Pages Router)
- ✅ Create React App
- ✅ Vite + React
- ✅ Remix
- ✅ Gatsby
- ✅ Elk React framework

## 🔧 Development

### In je project

```bash
cd your-project
npm install
npm run dev
```

### Hot Reload

Als je de component aanpast, zal je project automatisch reloaden.

## 📝 TypeScript

Volledig getypeerd! Import types:

```tsx
import BeatThePro, { type BeatTheProConfig } from '@/components/BeatTheProGame';

const config: BeatTheProConfig = {
  // ... autocomplete werkt!
};
```

## 🐛 Troubleshooting

Zie `INSTALL.md` sectie "Troubleshooting" voor veelvoorkomende problemen.

## 📄 License

MIT - Vrij te gebruiken voor commerciële doeleinden.

## 🤝 Contributing

Dit is een portable package. Pas aan naar je eigen wensen!

## 📞 Support

Voor vragen of problemen, zie de volledige documentatie in `src/README.md`.

---

**Gemaakt met ❤️ voor snelle integratie in elk React project**
