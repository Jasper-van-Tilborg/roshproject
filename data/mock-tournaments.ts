import { Tournament } from '../lib/supabase'

const baseTournament: Tournament = {
  id: 'mock-tournament-1',
  name: 'Winter Championship 2026',
  description: 'Een mock toernooi zodat het dashboard werkt zonder Supabase.',
  location: 'Rotterdam Ahoy',
  start_date: '2026-12-12',
  end_date: '2026-12-14',
  max_participants: '16',
  entry_fee: '€50',
  prize_pool: '€25.000',
  primary_color: '#755DFF',
  secondary_color: '#38BDF8',
  status: 'published',
  slug: 'winter-championship-2026',
  generated_code_html: '',
  generated_code_css: '',
  generated_code_js: '',
  generated_code_full: '',
  wizard_answers: {},
  custom_components: []
}

export const mockTournaments: Tournament[] = [
  baseTournament,
  {
    ...baseTournament,
    id: 'mock-tournament-2',
    name: 'Spring Invitational',
    slug: 'spring-invitational-2026',
    start_date: '2026-03-20',
    end_date: '2026-03-22',
    location: 'Amsterdam RAI',
    prize_pool: '€15.000',
    status: 'draft'
  }
]

export function findMockTournament(identifier: string): Tournament | undefined {
  const normalized = identifier.toLowerCase()
  return mockTournaments.find(
    (tournament) =>
      tournament.id?.toLowerCase() === normalized ||
      tournament.slug.toLowerCase() === normalized
  )
}

