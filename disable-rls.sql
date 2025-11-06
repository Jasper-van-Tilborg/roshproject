-- SQL Script om Row Level Security tijdelijk uit te schakelen
-- ⚠️ ALLEEN VOOR LOKALE ONTWIKKELING - NOOIT IN PRODUCTIE GEBRUIKEN!

-- Optie 1: RLS helemaal uitschakelen (niet aanbevolen, maar werkt)
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;

-- Optie 2: Policies maken die alles toestaan (beter, maar RLS blijft actief)
-- Gebruik deze optie als je RLS later weer wilt gebruiken zonder alles opnieuw te configureren

-- Verwijder alle bestaande policies
DROP POLICY IF EXISTS "Published tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON tournaments;

-- Maak nieuwe policies die ALLES toestaan (zonder authenticatie check)
CREATE POLICY "Allow all reads" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON tournaments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes" ON tournaments FOR DELETE USING (true);

-- Als je Optie 1 hebt gebruikt en RLS weer wilt aanzetten, run dit:
-- ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;



