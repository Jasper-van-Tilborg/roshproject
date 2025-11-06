# Supabase Database Setup

Deze applicatie gebruikt Supabase om gegenereerde toernooi websites op te slaan in een database.

## Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account aan
2. Maak een nieuw project aan
3. Wacht tot het project is opgezet (kan een paar minuten duren)

## Stap 2: Database Schema Installeren

1. Ga naar je Supabase Dashboard
2. Klik op "SQL Editor" in het linker menu
3. Kopieer de inhoud van `supabase-schema.sql`
4. Plak het in de SQL Editor en klik op "Run"
5. Dit maakt de `tournaments` tabel aan met alle benodigde kolommen

## Stap 3: Environment Variables Instellen

1. Ga naar je Supabase Dashboard
2. Klik op "Settings" > "API"
3. Kopieer de volgende waarden:

   - **Project URL** (bijv. `https://xxxxx.supabase.co`)
   - **anon/public key** - Dit is de **anon** key in de tabel (NIET de `service_role` key!)
     - De `anon` key is de **public** key die veilig is voor client-side code
     - De `service_role` key is **geheim** en mag NOOIT in client-side code worden gebruikt

4. Maak een `.env.local` bestand in de root van je project:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=je_project_url_hier
   NEXT_PUBLIC_SUPABASE_ANON_KEY=je_anon_key_hier
   ```

5. Herstart je development server (`npm run dev`)

## Stap 4: Row Level Security (RLS) Configureren

Voor lokale ontwikkeling zonder authenticatie, kun je RLS tijdelijk uitschakelen:

1. Open het bestand `disable-rls.sql`
2. Kopieer de inhoud en plak deze in de Supabase SQL Editor
3. Run het script

Dit script biedt twee opties:

- **Optie 1**: RLS helemaal uitschakelen (`ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY`)
- **Optie 2**: Policies maken die alles toestaan (aanbevolen - RLS blijft actief maar alles is toegestaan)

**LET OP:**

- Deze instellingen zijn **ALLEEN voor lokale ontwikkeling**
- Voor productie moet je RLS policies correct configureren met authenticatie
- Gebruik Optie 2 als je RLS later weer wilt gebruiken zonder alles opnieuw te configureren

Om RLS later weer aan te zetten (als je Optie 1 hebt gebruikt):

```sql
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
```

## Database Schema

De `tournaments` tabel bevat:

- `id` (UUID) - Unieke identifier
- `name` - Naam van het toernooi
- `description` - Beschrijving
- `location` - Locatie
- `start_date`, `end_date` - Datums
- `max_participants`, `entry_fee`, `prize_pool` - Toernooi details
- `primary_color`, `secondary_color` - Kleuren
- `status` - 'draft' of 'published'
- `slug` - URL-vriendelijke naam (uniek)
- `generated_code_html/css/js/full` - De gegenereerde code
- `wizard_answers` - JSON met wizard antwoorden
- `custom_components` - JSON met custom componenten
- `created_at`, `updated_at` - Timestamps

## API Endpoints

- `GET /api/tournaments` - Haal alle tournaments op (optioneel ?status=draft of ?status=published)
- `POST /api/tournaments` - Maak nieuw tournament aan
- `PUT /api/tournaments` - Update bestaand tournament
- `GET /api/tournaments/[slug]` - Haal tournament op via slug (alleen published)

## Troubleshooting

**Error: "relation 'tournaments' does not exist"**

- Run de SQL schema in Supabase SQL Editor

**Error: "new row violates row-level security policy"**

- Run de RLS policies voor lokale ontwikkeling (zie Stap 4)

**Error: "Invalid API key"**

- Controleer of je de juiste `NEXT_PUBLIC_SUPABASE_ANON_KEY` hebt gebruikt (niet de service_role key)
- Zorg dat `.env.local` bestaat en de variabelen correct zijn

**Error: "Failed to fetch"**

- Controleer of je Supabase project URL correct is
- Zorg dat je internet connectie werkt
- Check of je Supabase project actief is (niet paused)
