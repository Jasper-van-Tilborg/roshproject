# Tournament Creator Platform

A comprehensive Next.js application for creating and managing tournament websites with AI-powered generation. Build professional tournament sites in minutes without writing code.

## 🚀 Features

### AI-Powered Website Generation

- **Multi-step Wizard**: Answer questions about your tournament and let AI generate a complete website
- **Claude AI Integration**: Uses Anthropic's Claude Sonnet 4.5 for intelligent website generation
- **Component-based Architecture**: Generated websites use modular, editable components
- **Live Preview**: See changes in real-time as you edit

### Advanced Live Editor

- **Component Editor**: Visual editing interface for all website components
- **Code Editor**: Direct HTML, CSS, and JavaScript editing with syntax highlighting
- **Split View**: Edit code and preview simultaneously
- **Viewport Selector**: Test your site on desktop, tablet, and mobile views
- **Property Editor**: Edit component properties through an intuitive UI
- **Font & Color Settings**: Global typography and color customization

### Tournament Management

- **Dashboard**: Centralized management for all tournaments
- **Draft System**: Save work-in-progress tournaments
- **Publishing**: Publish tournaments with unique URLs (slugs)
- **Edit Mode**: Edit existing tournaments with full code preservation

### Custom Editors

- **Template Editor**: Manual template configuration with live preview
- **Auto Editor**: Automatic regeneration on configuration changes
- **Mock Generator**: Fallback template generation when AI is unavailable

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Components](#components)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## 🛠 Tech Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling

### Backend & Database

- **Supabase** - PostgreSQL database with real-time capabilities
- **Next.js API Routes** - Server-side endpoints

### AI & External Services

- **Anthropic Claude API** - AI website generation
  - Model: `claude-sonnet-4-5-20250929`
  - Max tokens: 32,768

### Additional Dependencies

- **@dnd-kit** - Drag and drop functionality
- **@gsap/react** - Animation library
- **ogl** - WebGL utilities

## 📁 Project Structure

```
roshproject/
├── app/
│   ├── [slug]/                    # Dynamic route for published tournaments
│   │   └── page.tsx               # Tournament display page
│   ├── api/                       # API routes
│   │   ├── openai/                # Claude AI endpoint
│   │   │   └── route.ts
│   │   └── tournaments/           # Tournament CRUD operations
│   │       ├── route.ts           # GET, POST, PUT, DELETE
│   │       └── [slug]/            # GET specific tournament
│   │           └── route.ts
│   ├── components/                # React components
│   │   ├── ComponentEditor.tsx   # Main live editor component
│   │   ├── LiveCodeEditor.tsx    # Code editor with preview
│   │   ├── LivePreview.tsx       # Preview component
│   │   ├── LoadingOverlay.tsx    # Loading screen
│   │   ├── Notification.tsx       # Notification system
│   │   └── ...
│   ├── dashboard/                 # Tournament management
│   │   └── page.tsx              # Dashboard interface
│   ├── editor/                    # Editor pages
│   │   ├── wizard/               # AI wizard
│   │   │   └── page.tsx          # Multi-step wizard
│   │   ├── auto/                 # Auto editor
│   │   │   └── page.tsx          # Auto-regenerating editor
│   │   └── page.tsx              # Manual template editor
│   ├── hooks/                     # Custom React hooks
│   │   └── useNotification.tsx   # Notification hook
│   ├── utils/                     # Utility functions
│   │   ├── claude-template-generator.ts  # AI prompt builder
│   │   ├── component-parser.ts   # HTML component parser
│   │   └── mock-template-generator.ts    # Fallback generator
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage
│   └── globals.css                # Global styles
├── lib/
│   └── supabase.ts                # Supabase client configuration
├── public/                         # Static assets
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js configuration
└── tsconfig.json                   # TypeScript configuration
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Anthropic API key

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd roshproject
npm install
```

### Step 2: Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Anthropic Claude API (Required for AI generation)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Where to get these:**

- **Supabase**: Dashboard → Project Settings → API
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/) → API Keys

### Step 3: Database Setup

1. Create a Supabase project
2. Run this SQL to create the `tournaments` table:

```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  max_participants TEXT,
  entry_fee TEXT,
  prize_pool TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  slug TEXT UNIQUE,
  generated_code_html TEXT,
  generated_code_css TEXT,
  generated_code_js TEXT,
  generated_code_full TEXT,
  wizard_answers JSONB,
  custom_components JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tournaments_slug ON tournaments(slug);
CREATE INDEX idx_tournaments_status ON tournaments(status);
```

3. Configure Row Level Security (RLS):
   - Enable RLS on the `tournaments` table
   - Create policies for SELECT (public read for published), INSERT, UPDATE, DELETE

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a New Tournament

1. Navigate to `/dashboard`
2. Login with credentials (default: `admin` / `admin123`)
3. Click "New Tournament" → redirects to `/editor/wizard`
4. Complete the 4-step wizard:
   - **Step 1**: Basic Information (name, description, date, location)
   - **Step 2**: Game Details (game type, participants, bracket type)
   - **Step 3**: Design & Styling (colors, font family)
   - **Step 4**: Components (select which components to include)
5. Click "Generate Website" → AI generates code
6. Editor opens automatically with generated code
7. Edit using component sidebar or direct code editing
8. Click "Save as Draft" or "Publish"

### Editing an Existing Tournament

1. Go to `/dashboard`
2. Click "Edit" on any tournament
3. Redirects to `/editor/wizard?edit=true&id={tournamentId}`
4. Editor opens with existing code loaded
5. Make changes and save

### Viewing Published Tournaments

Published tournaments are accessible at `/{slug}` where slug is auto-generated from the tournament name.

Example: "Winter Championship 2025" → `/winter-championship-2025`

## 🔌 API Routes

### `/api/openai` - Claude AI Endpoint

**POST** - Generate website code

```typescript
{
  message: string,           // User prompt
  systemPrompt: string,      // System instructions
  model?: string,            // Default: 'claude-sonnet-4-5-20250929'
  max_tokens?: number        // Default: 32768
}
```

**GET** - Health check
Returns API status and configuration check.

### `/api/tournaments` - Tournament CRUD

**GET** - List tournaments

- Query params: `?status=draft` or `?status=published`
- Returns: `{ tournaments: Tournament[] }`

**POST** - Create tournament

```typescript
{
  name: string,
  description?: string,
  location?: string,
  startDate?: string,
  endDate?: string,
  maxParticipants?: string,
  entryFee?: string,
  prizePool?: string,
  primaryColor?: string,
  secondaryColor?: string,
  status?: 'draft' | 'published',
  generatedCode?: {
    html: string,
    css: string,
    js: string,
    full: string
  },
  wizardAnswers?: Record<string, unknown>,
  customComponents?: Array<Record<string, unknown>>
}
```

**PUT** - Update tournament
Same body as POST, but requires `id` field.

**DELETE** - Delete tournament

- Query params: `?id={tournamentId}`
- Returns: `{ success: boolean }`

### `/api/tournaments/[slug]` - Get Tournament

**GET** - Fetch tournament by slug or ID

- Automatically detects if parameter is UUID (ID) or slug
- Returns: `{ tournament: Tournament }`

## 🧩 Components

### ComponentEditor

Main live editor component with:

- Component sidebar (lists all detected components)
- Property editor (edit component properties via UI)
- Code editor (direct HTML/CSS/JS editing)
- Live preview (real-time iframe preview)
- Viewport selector (desktop/tablet/mobile)
- Font & color settings

**Props:**

```typescript
{
  html: string,
  css: string,
  js: string,
  onCodeChange?: (html, css, js) => void,
  viewport?: 'desktop' | 'tablet' | 'mobile',
  onViewportChange?: (viewport) => void,
  onSaveDraft?: () => Promise<void>,
  onPublish?: () => Promise<void>,
  isSaving?: boolean,
  tournamentName?: string
}
```

### LiveCodeEditor

Code editor with split view and preview:

- Three modes: Split View, Preview Only, Code Only
- HTML, CSS, JavaScript tabs
- Real-time preview updates
- Code statistics (lines, characters)

### Component Parser

Parses HTML and detects editable components:

**Supported Component Types:**

- `navigation` - Header/navbar
- `hero` - Hero section
- `about` - About section
- `program` - Schedule/program section
- `bracket` - Tournament bracket
- `twitch` - Twitch stream embed
- `sponsors` - Sponsors section
- `registration` - Registration form
- `footer` - Footer section

**Component Detection:**
Components are detected by:

1. `data-component` attributes
2. ID patterns (e.g., `hero-section`, `navigation-section`)
3. `data-editable="true"` attributes
4. Class name patterns

## 🏗 Architecture

### AI Generation Flow

```
User completes wizard
    ↓
Wizard answers formatted
    ↓
buildClaudePrompt() creates prompt
    ↓
generateTournamentTemplate() calls Claude API
    ↓
Claude generates HTML/CSS/JavaScript
    ↓
Response parsed (extract code blocks)
    ↓
Code separated into HTML/CSS/JS
    ↓
ComponentEditor opens with code
    ↓
parseComponentsFromHTML() detects components
    ↓
User can edit via UI or code
```

### Component Editing Flow

```
User selects component
    ↓
Component properties displayed
    ↓
User edits property
    ↓
updateComponentInHTML() updates HTML
    ↓
Preview updates in real-time
    ↓
onCodeChange callback fired
    ↓
Parent component saves changes
```

### Data Flow

```
Wizard → AI Generation → ComponentEditor → Database
    ↓           ↓              ↓            ↓
Answers    Generated Code   Edited Code   Saved Code
```

## 🎨 Component Specifications

### Navigation Component

**Properties:**

- `navFormat`: `'default' | 'centered' | 'minimal' | 'spacious'`
- `logo`: `{ src: string, alt: string }`
- `navLinks`: `Array<{ text: string, href: string }>`

**HTML Structure:**

```html
<header
  id="navigation-section"
  data-component="navigation"
  data-nav-format="default"
>
  <nav class="nav-container">
    <div class="nav-logo">
      <img id="nav-logo-img" data-editable-image="true" />
    </div>
    <ul class="nav-links" data-nav-links="true">
      <li><a data-nav-link-text="Home" href="#hero">Home</a></li>
    </ul>
  </nav>
</header>
```

### Hero Component

**Properties:**

- `heroFormat`: `'image-left' | 'image-right' | 'image-top' | 'image-full' | 'text-only'`
- `image`: `{ src: string, alt: string }`
- `heroText`: `string`
- `tournamentBoxes`: `Array<{ title: string, paragraph: string }>` (max 4)

**HTML Structure:**

```html
<section id="hero-section" data-component="hero" data-hero-format="image-left">
  <div class="hero-container">
    <div class="hero-image-wrapper">
      <img id="hero-image" data-editable-image="true" />
    </div>
    <div class="hero-content">
      <h1 data-editable-text="hero.text">Hero Text</h1>
      <div class="hero-tournament-info">
        <div data-tournament-box="1">
          <h3 data-editable-text="tournament.box1.title">Title</h3>
          <p data-editable-text="tournament.box1.paragraph">Paragraph</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### About Component

**Properties:**

- `aboutFormat`: `'grid-2x2' | 'grid-2x1' | 'grid-3x1' | 'grid-4x1'`
- `aboutTitle`: `string`
- `aboutText`: `string`
- `aboutBoxes`: `Array<{ title: string }>` (max 4)

### Program Component

**Properties:**

- `programFormat`: `'grid-2x1' | 'grid-4x1'`
- `programTitle`: `string`
- `programText`: `string`
- `programBoxes`: `Array<{ title: string }>` (max 4)

## 🐛 Troubleshooting

### AI Generation Issues

**Problem**: AI doesn't generate code

- **Solution**:
  - Check `ANTHROPIC_API_KEY` in `.env.local`
  - Verify API quota/credits at Anthropic
  - Check console for error messages
  - Ensure prompt isn't too long (max tokens: 32,768)

**Problem**: Code parsing fails

- **Solution**:
  - Verify Claude response contains code blocks
  - Check format: `` html`,  ``css` , ````javascript `
  - Review console logs for parsing errors

### Database Issues

**Problem**: "Supabase not configured"

- **Solution**:
  - Verify `.env.local` file exists
  - Check variable names (no typos, no extra spaces)
  - Restart development server: `npm run dev`

**Problem**: "Invalid API key"

- **Solution**:
  - Use the `anon` key (not `service_role`)
  - Ensure key is complete (no truncation)
  - Restart development server

**Problem**: "RLS policy issue"

- **Solution**:
  - Go to Supabase Dashboard → Authentication → Policies
  - Ensure SELECT policies are public for published tournaments
  - Or temporarily disable RLS for development

### Component Detection Issues

**Problem**: Components not detected

- **Solution**:
  - Verify HTML has `data-component` attributes
  - Check sections have unique IDs
  - Review component parser logs
  - Ensure HTML structure matches specifications

### Preview Issues

**Problem**: Preview doesn't work

- **Solution**:
  - Check iframe `srcDoc` is correctly set
  - Verify HTML/CSS/JS are properly combined
  - Check browser console for errors
  - Verify iframe sandbox attributes

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy

### Production Considerations

- Use only `NEXT_PUBLIC_*` variables for client-side code
- Keep `ANTHROPIC_API_KEY` server-side only (no `NEXT_PUBLIC_` prefix)
- Configure Supabase RLS policies for production
- Monitor API usage (Anthropic charges per request)
- Set up error tracking (e.g., Sentry)
- Configure CORS if needed

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔒 Security

- Never commit `.env.local` to version control
- Use only the `anon` key from Supabase (never `service_role`)
- Keep API keys secure and rotate regularly
- Implement proper authentication for production
- Configure RLS policies appropriately

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API Docs](https://docs.anthropic.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Built with Next.js and React
- AI powered by Anthropic Claude
- Database hosted on Supabase
- Styled with Tailwind CSS

---

**Made with ❤️ for tournament organizers**
