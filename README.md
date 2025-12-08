# Rosh Project

Een Next.js applicatie voor het maken en beheren van toernooi websites met AI-ondersteuning.

## 🚀 Snel Starten

### Installatie

```bash
npm install
```

### Environment Variables

Maak een `.env.local` bestand aan met:

```env
# Supabase (verplicht)
NEXT_PUBLIC_SUPABASE_URL=je_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=je_supabase_anon_key

# Anthropic Claude API (verplicht voor AI)
ANTHROPIC_API_KEY=je_anthropic_api_key
```

**Waar haal je deze vandaan?**

- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) → Project → Settings → API
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/) → API Keys

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## 📋 Wat kan je doen?

- **Dashboard** (`/dashboard`) - Beheer toernooien

  - Login: `admin` / `admin123`
  - Maak nieuwe toernooien aan
  - Bewerk bestaande toernooien
  - Publiceer of verwijder toernooien

- **AI Wizard** (`/editor/wizard`) - Maak websites met AI

  - Beantwoord vragen over je toernooi
  - AI genereert automatisch een website
  - Bewerk de code in real-time

- **Toernooi Pagina** (`/[slug]`) - Bekijk gepubliceerde toernooien

- **Custom Page Editor** (`/custom`) - Visuele editor voor toernooi websites

  - **Wat is het?** Een visuele drag-and-drop editor waarmee je volledige toernooi websites kunt bouwen zonder code te schrijven. Alles gebeurt visueel met live preview.

  - **Hoe werkt het?**
    1. **Componenten selecteren**: Kies in het linker paneel welke componenten je wilt gebruiken (Navigation, Hero, About, Teams, etc.)
    2. **Volgorde aanpassen**: Sleep componenten omhoog of omlaag om de volgorde te wijzigen
    3. **Componenten configureren**: Klik op een component in de lijst om het rechter paneel te openen met alle instellingen
    4. **Live preview**: Alle wijzigingen zie je direct in het midden van het scherm
    5. **Aanpassen**: Pas tekst, kleuren, fonts, afbeeldingen, layouts en meer aan via de instellingen panelen

  - **Beschikbare componenten**:
    - **Navigation**: Logo, menu items, CTA button
    - **Hero**: Verschillende templates met tekst, buttons en afbeeldingen
    - **About**: Informatie sectie met afbeelding en tekst
    - **Program**: Programma/schema weergave
    - **Teams**: Team overzicht met spelers en logo's
    - **Bracket**: Toernooi bracket visualisatie
    - **FAQ**: Veelgestelde vragen sectie
    - **Footer**: Verschillende footer layouts

  - **Features**:
    - 🎨 **Kleuren**: Pas globale kleuren aan die door de hele website worden gebruikt
    - 🔤 **Fonts**: Kies fonts en pas groottes aan
    - 🖼️ **Afbeeldingen**: Upload afbeeldingen of gebruik URLs
    - 📱 **Responsive**: Bekijk hoe je website eruit ziet op desktop, tablet of mobile
    - 🔄 **Drag & Drop**: Sleep componenten om de volgorde te wijzigen
    - 👁️ **Live Preview**: Zie alle wijzigingen direct in real-time

  - **Tips**:
    - Gebruik de viewport switcher (bovenaan rechts) om te zien hoe je site eruit ziet op verschillende schermen
    - Klik op "Fullscreen" voor een volledig scherm preview
    - Gebruik de "Reset" knop om alle instellingen terug te zetten naar standaardwaarden
    - Componenten kunnen worden verborgen door het oog-icoon uit te zetten

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database
- **Anthropic Claude** - AI website generatie

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build voor productie
npm start        # Start productie server
npm run lint     # Check code kwaliteit
```

## 🚢 Deployment naar Vercel

1. Push code naar GitHub
2. Importeer project in [Vercel](https://vercel.com)
3. Voeg environment variables toe in Vercel Dashboard
4. Deploy!

Zie `SUPABASE_SETUP.md` voor database setup instructies.

## 📝 Belangrijke Bestanden

- `app/dashboard/page.tsx` - Dashboard voor toernooi beheer
- `app/editor/wizard/page.tsx` - AI wizard voor website generatie
- `app/api/tournaments/route.ts` - API endpoints voor toernooien
- `lib/supabase.ts` - Supabase client configuratie

## 🔒 Veiligheid

- Gebruik alleen de **anon/public** key van Supabase (niet service_role)
- Deel je API keys nooit publiekelijk
- `.env.local` wordt automatisch genegeerd door git

## ❓ Problemen?

- **Build faalt?** Controleer of alle environment variables zijn ingesteld
- **Database errors?** Zie `SUPABASE_SETUP.md` voor setup instructies
- **AI werkt niet?** Controleer of `ANTHROPIC_API_KEY` correct is ingesteld
