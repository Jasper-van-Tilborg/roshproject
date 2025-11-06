-- Supabase database schema voor tournaments
-- Run dit in je Supabase SQL Editor

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT NULL,
  max_participants TEXT DEFAULT '8',
  entry_fee TEXT DEFAULT '',
  prize_pool TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  generated_code_html TEXT DEFAULT '',
  generated_code_css TEXT DEFAULT '',
  generated_code_js TEXT DEFAULT '',
  generated_code_full TEXT DEFAULT '',
  wizard_answers JSONB DEFAULT '{}'::jsonb,
  custom_components JSONB DEFAULT '[]'::jsonb
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow anyone to read published tournaments
CREATE POLICY "Published tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (status = 'published');

-- Create policy: Allow authenticated users to read all tournaments (for dashboard)
CREATE POLICY "Authenticated users can view all tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

-- Create policy: Allow authenticated users to insert tournaments
CREATE POLICY "Authenticated users can insert tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy: Allow authenticated users to update tournaments
CREATE POLICY "Authenticated users can update tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy: Allow authenticated users to delete tournaments
CREATE POLICY "Authenticated users can delete tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (true);

-- Note: Voor lokale ontwikkeling zonder authenticatie, kun je tijdelijk deze policies gebruiken:
-- DROP POLICY IF EXISTS "Published tournaments are viewable by everyone" ON tournaments;
-- CREATE POLICY "Allow all reads" ON tournaments FOR SELECT USING (true);
-- CREATE POLICY "Allow all inserts" ON tournaments FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow all updates" ON tournaments FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all deletes" ON tournaments FOR DELETE USING (true);


