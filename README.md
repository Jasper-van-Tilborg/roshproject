# Rosh Project - Tournament Website Builder

A Next.js application for creating and managing tournament websites with AI-powered generation and visual editing capabilities.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic Claude API (required for AI generation)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Where to get these:**

- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) → Project → Settings → API
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/) → API Keys

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Features

### 1. Dashboard (`/dashboard`)

The central hub for managing tournaments.

**Features:**

- Login system (default: `admin` / `admin123`)
- Create new tournaments
- Edit existing tournaments
- Publish or delete tournaments
- View tournament list with status indicators (draft/published)

**How it works:**

- Tournaments are stored in Supabase database
- Each tournament has: name, description, dates, location, colors, generated code
- Status can be set to `draft` or `published`
- Published tournaments are accessible via `/[slug]` route

### 2. AI Wizard Editor (`/editor/wizard`)

A multi-step wizard that uses AI (Claude) to generate complete tournament websites.

**How it works:**

1. **Step 1: Basic Information**

   - Tournament name, description, date, location
   - All fields are required

2. **Step 2: Game Details**

   - Game type (CS2, Valorant, League of Legends, etc.)
   - Number of participants
   - Bracket type (Single/Double Elimination, Group Stage, Round Robin)

3. **Step 3: Design & Styling**

   - Primary and secondary colors (with color picker)
   - Font family selection

4. **Step 4: Components**

   - Optional components via checkboxes:
     - Teams/Bracket display
     - Twitch livestream
     - Sponsors section
     - Schedule/Program
     - Registration form
     - Social media links

5. **AI Generation**

   - Answers are formatted into a JSON object
   - Sent to Claude API with a detailed system prompt
   - Claude generates complete HTML, CSS, and JavaScript code
   - Code is parsed and separated into HTML/CSS/JS components

6. **Live Editor**
   - After generation, opens the live code editor
   - Edit HTML, CSS, and JavaScript in real-time
   - Live preview with iframe
   - Save as draft or publish

**Technical Details:**

- Uses Anthropic Claude Sonnet 4.5 model
- System prompt instructs AI to generate editable, component-based code
- Code uses `data-component` and `data-editable` attributes
- CSS Variables for easy customization
- Modular JavaScript structure

**Edit Mode:**

- Access via `/editor/wizard?edit=true&id={tournamentId}`
- Loads existing tournament data from database
- Pre-fills wizard answers
- Loads generated code into editor

### 3. Custom Visual Editor (`/custom`)

A drag-and-drop visual editor for building tournament websites without writing code.

**Features:**

- **Component Library**: Pre-built components (Navigation, Hero, About, Teams, Bracket, Twitch, Sponsors, etc.)
- **Drag & Drop**: Add components by dragging from sidebar
- **Reorder**: Drag components to reorder them
- **Edit Components**: Click components to edit their properties
- **Color Customization**: Global color settings with live preview
- **Font Settings**: Customize title and text fonts
- **Image Uploads**: Upload and use images in components
- **Live Preview**: See changes in real-time
- **Responsive Viewports**: Desktop, tablet, mobile preview

**How it works:**

- Components are React components with editable props
- Uses `@dnd-kit` for drag-and-drop functionality
- Component state is managed in a centralized array
- Each component has a unique ID and type
- Changes are reflected immediately in preview

**Available Components:**

- Navigation
- Hero
- About
- Program/Schedule
- Bracket
- Teams
- Twitch Stream
- Sponsors
- Social Media Links
- Footer
- Image
- Stats
- Registration
- FAQ
- Group Stage

### 4. Tournament Pages (`/[slug]`)

Public-facing pages for published tournaments.

**Features:**

- Displays tournament information
- Shows generated website code in iframe
- Responsive design
- SEO-friendly URLs

## 🏗️ Architecture

### Tech Stack

- **Next.js 15.5.7** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Supabase** - PostgreSQL database and authentication
- **Anthropic Claude API** - AI website generation
- **@dnd-kit** - Drag and drop functionality
- **GSAP** - Animations

### Project Structure

```
app/
├── [slug]/              # Public tournament pages
├── api/
│   ├── openai/         # Claude API proxy
│   └── tournaments/    # Tournament CRUD endpoints
├── components/
│   ├── LiveCodeEditor.tsx      # Code editor with preview
│   ├── LivePreview.tsx          # Preview component
│   └── ...
├── custom/             # Visual drag-and-drop editor
├── dashboard/          # Tournament management
├── editor/
│   └── wizard/         # AI wizard editor
└── utils/
    ├── claude-template-generator.ts  # AI generation logic
    └── component-parser.ts           # Component parsing
```

### Database Schema

**Tournaments Table:**

- `id` - UUID primary key
- `name` - Tournament name
- `slug` - URL-friendly identifier
- `description` - Tournament description
- `start_date`, `end_date` - Event dates
- `location` - Event location
- `max_participants` - Participant limit
- `primary_color`, `secondary_color` - Theme colors
- `generated_code_html`, `generated_code_css`, `generated_code_js` - Generated code
- `generated_code_full` - Complete HTML page
- `wizard_answers` - JSON of wizard responses
- `custom_components` - Array of component types
- `status` - `draft` or `published`
- `created_at`, `updated_at` - Timestamps

### API Routes

**`/api/openai`** (POST)

- Proxies requests to Anthropic Claude API
- Handles API key securely (server-side only)
- Returns generated code

**`/api/tournaments`** (GET, POST, PUT, DELETE)

- GET: List tournaments (with optional filters)
- POST: Create new tournament
- PUT: Update existing tournament
- DELETE: Delete tournament

**`/api/tournaments/[slug]`** (GET)

- Get single tournament by slug

### AI Generation Flow

1. **Wizard Answers** → Formatted to JSON object
2. **JSON + System Prompt** → Combined into complete prompt
3. **Claude API** → Generates HTML/CSS/JS code
4. **Code Parsing** → Extracts HTML, CSS, JS from response
5. **Live Editor** → Displays code for editing
6. **Database Save** → Stores code in separate columns

**System Prompt:**

- 750+ lines of instructions
- Specifies component structure
- Requires `data-component` attributes
- Enforces CSS Variables
- Modular JavaScript structure
- Responsive design requirements

## 📦 Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code quality
```

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy!

### Database Setup

See `SUPABASE_SETUP.md` for database schema and setup instructions.

## 🔒 Security

- **API Keys**: Never expose API keys in client-side code
- **Supabase**: Use only the `anon`/`public` key (not `service_role`)
- **Environment Variables**: `.env.local` is automatically ignored by git
- **RLS**: Supabase Row Level Security should be configured

## 🎯 Key Features Explained

### AI Live Editor

The AI Live Editor combines:

1. **Wizard Interface**: Step-by-step questionnaire
2. **AI Generation**: Claude API generates complete websites
3. **Code Editor**: Edit generated code in real-time
4. **Live Preview**: See changes instantly in iframe

**Use Case**: Users who want AI to generate a website, then fine-tune it manually.

### Custom Live Editor

The Custom Live Editor provides:

1. **Visual Building**: Drag-and-drop interface
2. **No Code Required**: Build websites visually
3. **Pre-built Components**: Ready-to-use tournament components
4. **Real-time Editing**: Edit component properties instantly
5. **Responsive Preview**: Test on different screen sizes

**Use Case**: Users who want full control without writing code.

## ❓ Troubleshooting

**Build fails?**

- Check all environment variables are set
- Verify Next.js version compatibility

**Database errors?**

- See `SUPABASE_SETUP.md` for setup instructions
- Check Supabase connection and RLS policies

**AI not working?**

- Verify `ANTHROPIC_API_KEY` is correct
- Check API quota/limits
- Review console for error messages

**Editor not loading code?**

- Check browser console for errors
- Verify code format (should have HTML/CSS/JS separated)
- Check component parsing logic

## 📝 Important Files

- `app/dashboard/page.tsx` - Tournament management dashboard
- `app/editor/wizard/page.tsx` - AI wizard editor
- `app/custom/page.tsx` - Visual drag-and-drop editor
- `app/components/LiveCodeEditor.tsx` - Code editor with preview
- `app/utils/claude-template-generator.ts` - AI generation logic
- `app/api/tournaments/route.ts` - Tournament API endpoints
- `lib/supabase.ts` - Supabase client configuration

## 🔄 Data Flow

### Creating a Tournament

1. User fills wizard → Answers stored in state
2. Click "Generate" → Answers formatted to JSON
3. JSON sent to Claude API → AI generates code
4. Code parsed → Separated into HTML/CSS/JS
5. Code displayed in editor → User can edit
6. Click "Save" → Code saved to database
7. Click "Publish" → Status set to `published`

### Editing a Tournament

1. Click "Edit" in dashboard → Navigate to `/editor/wizard?edit=true&id={id}`
2. Load tournament data → Fetch from `/api/tournaments/{id}`
3. Pre-fill wizard → Load `wizard_answers` into state
4. Load code → Display in editor
5. Make changes → Edit code
6. Save → Update database

## 🎨 Customization

### Adding New Components

1. Create component in `app/custom/page.tsx`
2. Add to component library array
3. Define component props interface
4. Add edit form in component editor
5. Update component parser if needed

### Modifying AI Generation

1. Edit `app/utils/claude-template-generator.ts`
2. Update `CLAUDE_SYSTEM_PROMPT` for new requirements
3. Modify `buildClaudePrompt()` for new data format
4. Adjust code parsing logic if output format changes

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Who Did What

- Custom Live Editor: Bor
- AI Live Editor: Jasper
- Components: Jasper, Thijn, Tim & Bor
- Login Page: Jasper
- Admin Page: Jasper
- Database: Jasper
- AI Wizard: Jasper
- Claude AI Integration: Jasper & Thijn
- (See Bracket Vercel by Thijn)
