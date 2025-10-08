# Rosh Project

Een Next.js applicatie met Claude AI integratie voor het ROSH toernooi platform.

## 📋 Inhoudsopgave

- [Vereisten](#vereisten)
- [Installatie](#installatie)
- [Configuratie](#configuratie)
- [Development](#development)
- [Project Structuur](#project-structuur)
- [Beschikbare Routes](#beschikbare-routes)
- [Claude AI Integratie](#claude-ai-integratie)
- [Deployment](#deployment)

## 🔧 Vereisten

- Node.js 20.x of hoger
- npm of yarn
- Een Anthropic API key (voor Claude AI functionaliteit)

## 📦 Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/jouw-username/roshproject.git
   cd roshproject
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Maak een environment file aan**
   
   Maak een `.env.local` bestand in de root directory:
   ```bash
   touch .env.local
   ```

## ⚙️ Configuratie

### Environment Variables

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```env
# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Anthropic API Key verkrijgen

1. Ga naar [Anthropic Console](https://console.anthropic.com/)
2. Log in of maak een account aan
3. Navigeer naar "API Keys"
4. Genereer een nieuwe API key
5. Kopieer de key en plak deze in je `.env.local` bestand

## 🚀 Development

### Development server starten

```bash
npm run dev
```

De applicatie is nu beschikbaar op [http://localhost:3000](http://localhost:3000)

### Production build maken

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structuur

```
roshproject/
├── app/
│   ├── [slug]/              # Dynamische routes
│   │   └── page.tsx
│   ├── api/
│   │   └── openai/          # Claude API endpoint
│   │       └── route.ts
│   ├── components/          # React componenten
│   │   ├── DarkVeil.tsx
│   │   ├── DarkVeil.css
│   │   ├── header.tsx
│   │   ├── livestream.tsx
│   │   ├── OpenAITest.tsx   # Claude test component
│   │   └── tournament-info.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── test-openai/         # Claude AI test pagina
│   │   └── page.tsx
│   ├── tournament/
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/                  # Statische assets
│   ├── achtergrond-info-sec.png
│   ├── eventlogo.png
│   ├── heroimg.png
│   ├── logoheader.png
│   └── ...
├── .env.local              # Environment variabelen (niet in git)
├── next.config.ts          # Next.js configuratie
├── package.json
├── tsconfig.json
└── README.md
```

## 🗺️ Beschikbare Routes

- `/` - Homepage
- `/dashboard` - Dashboard pagina
- `/tournament` - Toernooi informatie
- `/test-openai` - Claude AI test interface
- `/api/openai` - Claude API endpoint (POST & GET)

## 🤖 Claude AI Integratie

### API Endpoint

**POST** `/api/openai`

Request body:
```json
{
  "message": "Jouw vraag hier",
  "model": "claude-sonnet-4-5-20250929"  // Optioneel, dit is de standaard
}
```

Response:
```json
{
  "response": "Claude's antwoord",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 50
  }
}
```

**GET** `/api/openai`

Geeft status informatie over de API endpoint.

### Claude Test Interface

Bezoek `/test-openai` om de Claude AI integratie te testen via een gebruiksvriendelijke interface.

### Beschikbare Claude Modellen

Je kunt het model parameter aanpassen in je request:

- `claude-sonnet-4-5-20250929` - Nieuwste Sonnet 4.5 (standaard)
- `claude-3-5-sonnet-20240620` - Claude 3.5 Sonnet
- `claude-3-opus-20240229` - Meest capabel model
- `claude-3-sonnet-20240229` - Balans tussen snelheid en kwaliteit
- `claude-3-haiku-20240307` - Snelste en meest kosteneffectieve

### Implementatie Details

De Claude API wordt aangeroepen via directe fetch requests naar `https://api.anthropic.com/v1/messages`. Dit is gedaan om compatibiliteitsproblemen met de Anthropic SDK en Next.js 15 + Turbopack te vermijden.

## 🎨 Tech Stack

- **Framework**: Next.js 15.5.3 (met Turbopack)
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude API
- **Animaties**: GSAP
- **Drag & Drop**: @dnd-kit
- **TypeScript**: Voor type safety

## 📚 Dependencies

### Main Dependencies
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@dnd-kit/*` - Drag and drop functionaliteit
- `gsap` & `@gsap/react` - Animaties
- `ogl` - WebGL library

### Dev Dependencies
- `typescript` - TypeScript support
- `tailwindcss` - Utility-first CSS framework
- `eslint` - Code linting

## 🚢 Deployment

### Vercel (Aanbevolen)

1. Push je code naar GitHub
2. Importeer je repository in [Vercel](https://vercel.com)
3. Voeg de environment variabelen toe in de Vercel dashboard:
   - `ANTHROPIC_API_KEY`
4. Deploy!

### Andere platforms

Zorg ervoor dat:
- Node.js 20+ wordt ondersteund
- Environment variabelen correct zijn ingesteld
- Build command: `npm run build`
- Start command: `npm start`

## 🔒 Security

- **Nooit** je `.env.local` bestand committen naar git
- Houd je API keys geheim
- Gebruik environment variabelen voor gevoelige data
- De API key wordt alleen server-side gebruikt, nooit client-side

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 License

Dit project is onderdeel van het ROSH toernooi platform.

## 📞 Contact

Voor vragen of support, neem contact op met het development team.

---

**Happy coding! 🚀**
