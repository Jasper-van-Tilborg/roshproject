'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DarkVeil from '../components/DarkVeil';

interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: string;
  entryFee: string;
  prizePool: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'draft' | 'published';
  createdAt: string;
  generatedCode?: {
    html: string;
    css: string;
    js: string;
    full: string;
  };
}

export default function TournamentPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const slug = params.slug as string;
        
        // Probeer eerst vanuit Supabase
        const response = await fetch(`/api/tournaments/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          const dbTournament = data.tournament;
          
          // Transform Supabase format naar lokale format
          const tournament: Tournament = {
            id: dbTournament.id,
            name: dbTournament.name,
            description: dbTournament.description || '',
            location: dbTournament.location || '',
            startDate: dbTournament.start_date || '',
            endDate: dbTournament.end_date || '',
            maxParticipants: dbTournament.max_participants || '8',
            entryFee: dbTournament.entry_fee || '',
            prizePool: dbTournament.prize_pool || '',
            primaryColor: dbTournament.primary_color || '#3B82F6',
            secondaryColor: dbTournament.secondary_color || '#10B981',
            status: dbTournament.status,
            createdAt: dbTournament.created_at,
            generatedCode: {
              html: dbTournament.generated_code_html || '',
              css: dbTournament.generated_code_css || '',
              js: dbTournament.generated_code_js || '',
              full: dbTournament.generated_code_full || ''
            }
          };
          
          setTournament(tournament);
          setLoading(false);
          return;
        }
        
        // Fallback naar localStorage als Supabase niet beschikbaar is
        const savedTournaments = localStorage.getItem('tournaments');
        let tournaments: Tournament[] = [];
        
        if (savedTournaments) {
          try {
            tournaments = JSON.parse(savedTournaments);
          } catch (error) {
            console.error('Error parsing tournaments from localStorage:', error);
          }
        }

        const generateSlug = (name: string) => {
          return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        };

        const foundTournament = tournaments.find(t => 
          generateSlug(t.name) === slug && t.status === 'published'
        );

        if (foundTournament) {
          setTournament(foundTournament);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.03}
            scanlineIntensity={0}
            speed={0.2}
            scanlineFrequency={0.3}
            warpAmount={0.1}
            resolutionScale={1}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Toernooi laden...</p>
        </div>
      </div>
    );
  }

  if (notFound || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.03}
            scanlineIntensity={0}
            speed={0.2}
            scanlineFrequency={0.3}
            warpAmount={0.1}
            resolutionScale={1}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Toernooi niet gevonden</h1>
          <p className="text-gray-600 mb-4">Het toernooi dat je zoekt bestaat niet of is niet gepubliceerd.</p>
          <Link
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Terug naar Home
          </Link>
        </div>
      </div>
    );
  }

  // If tournament has generatedCode, render that in iframe
  if (tournament.generatedCode?.full || tournament.generatedCode) {
    // Always use separate HTML, CSS, and JS if available (more reliable)
    // This ensures CSS and JS are always included
    const html = tournament.generatedCode?.html || ''
    const css = tournament.generatedCode?.css || ''
    const js = tournament.generatedCode?.js || ''
    
    // If we have separate HTML/CSS/JS, always use those
    // Only fall back to 'full' if separate parts are completely missing
    let htmlToRender: string
    
    if (html || css || js) {
      // We have at least one separate part, combine them
      htmlToRender = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournament.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        ${js}
    </script>
</body>
</html>`
    } else if (tournament.generatedCode?.full) {
      // Fallback to 'full' if separate parts don't exist
      htmlToRender = tournament.generatedCode.full
    } else {
      // Last resort: empty page
      htmlToRender = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournament.name}</title>
</head>
<body>
    <h1>Geen code beschikbaar</h1>
</body>
</html>`
    }
    
    return (
      <div className="w-full h-screen">
        <iframe
          srcDoc={htmlToRender}
          className="w-full h-full border-0"
          title={tournament.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    )
  }

  // Fallback to default template
  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        backgroundColor: '#ffffff',
        color: '#000000'
      }}
    >
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.04}
          scanlineIntensity={0}
          speed={0.3}
          scanlineFrequency={0.2}
          warpAmount={0.15}
          resolutionScale={1}
        />
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: tournament.primaryColor }}
              >
                {tournament.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                <p className="text-gray-600">{tournament.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {tournament.startDate && new Date(tournament.startDate).toLocaleDateString('nl-NL')}
                {tournament.endDate && tournament.startDate !== tournament.endDate && 
                  ` - ${new Date(tournament.endDate).toLocaleDateString('nl-NL')}`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tournament Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: tournament.primaryColor }}
              >
                Over dit toernooi
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                {tournament.description}
              </p>
            </div>

            {/* Tournament Details */}
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: tournament.primaryColor }}
              >
                Toernooi Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Locatie</h3>
                  <p className="text-gray-600">{tournament.location || 'Niet opgegeven'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Max. Deelnemers</h3>
                  <p className="text-gray-600">{tournament.maxParticipants || 'Onbeperkt'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Inschrijfgeld</h3>
                  <p className="text-gray-600">€{tournament.entryFee || '0'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Prijzenpot</h3>
                  <p className="text-gray-600">€{tournament.prizePool || '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div 
                className="p-6 rounded-lg text-white"
                style={{ backgroundColor: tournament.primaryColor }}
              >
                <h3 className="text-xl font-bold mb-4">Inschrijven</h3>
                <p className="mb-4">Schrijf je nu in voor dit toernooi!</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Inschrijfgeld:</span>
                    <span className="font-semibold">€{tournament.entryFee || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max. deelnemers:</span>
                    <span className="font-semibold">{tournament.maxParticipants || 'Onbeperkt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prijzenpot:</span>
                    <span className="font-semibold">€{tournament.prizePool || '0'}</span>
                  </div>
                </div>

                <button 
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  style={{ color: tournament.primaryColor }}
                >
                  Inschrijven voor Toernooi
                </button>
              </div>

              {/* Tournament Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg text-center text-white"
                  style={{ backgroundColor: tournament.secondaryColor }}
                >
                  <div className="text-2xl font-bold">{tournament.maxParticipants || '∞'}</div>
                  <div className="text-sm opacity-90">Max. Deelnemers</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center text-white"
                  style={{ backgroundColor: tournament.primaryColor }}
                >
                  <div className="text-2xl font-bold">€{tournament.prizePool || '0'}</div>
                  <div className="text-sm opacity-90">Prijzenpot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
