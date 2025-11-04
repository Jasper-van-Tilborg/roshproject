# Tournament Bracket Component Library

A fully customizable tournament bracket component library for React + Next.js (TypeScript), designed as a reusable component package. Supports multiple bracket types with extensive theming options.

## Features

- ✅ **Multiple Bracket Types**: Single elimination, double elimination, round robin, and Swiss system
- ✅ **Flexible Team Support**: Handle any number of teams with automatic bye handling
- ✅ **Fully Customizable**: Extensive theming options for colors, fonts, spacing, borders, and layouts
- ✅ **Responsive Design**: Works seamlessly on mobile and desktop with horizontal scrolling for large brackets
- ✅ **Manual Seeding**: Support for pre-seeded teams
- ✅ **Custom Labels**: Support custom team/player names
- ✅ **TypeScript**: Fully typed with comprehensive interfaces
- ✅ **Match Results**: Track and display match results with winner advancement

## Installation

The bracket components are located in `app/components/bracket/`. To use them in your Next.js project:

```typescript
import BracketContainer from '@/app/components/bracket/BracketContainer';
import { Team, BracketType } from '@/app/components/bracket/types';
```

## Quick Start

```tsx
import BracketContainer from '@/app/components/bracket/BracketContainer';
import { Team } from '@/app/components/bracket/types';

const teams: Team[] = [
  { id: '1', name: 'Team Alpha', seed: 1 },
  { id: '2', name: 'Team Beta', seed: 2 },
  { id: '3', name: 'Team Gamma', seed: 3 },
  { id: '4', name: 'Team Delta', seed: 4 },
];

export default function TournamentPage() {
  return (
    <BracketContainer
      type="single"
      teams={teams}
      seededTeams={true}
      showSeeds={true}
      onMatchComplete={(match, result) => {
        console.log('Match completed:', match, result);
      }}
    />
  );
}
```

## Component API

### `BracketContainer`

The main component that renders the entire bracket.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `'single' \| 'double' \| 'roundrobin' \| 'swiss'` | Yes | - | The bracket type to generate |
| `teams` | `Team[]` | Yes | - | Array of teams participating in the tournament |
| `theme` | `BracketTheme` | No | `defaultTheme` | Custom theme object for styling |
| `onMatchComplete` | `(match: Match, result: MatchResult) => void` | No | - | Callback fired when a match is completed |
| `seededTeams` | `boolean` | No | `false` | If true, teams are already seeded (order matters) |
| `showSeeds` | `boolean` | No | `false` | Display seed numbers next to team names |
| `className` | `string` | No | `''` | Additional CSS classes |

#### Example

```tsx
<BracketContainer
  type="single"
  teams={teams}
  theme={{
    colors: {
      background: '#ffffff',
      teamSlotWinner: '#4ade80',
      // ... more colors
    },
    fonts: {
      family: 'Inter, sans-serif',
    },
  }}
  onMatchComplete={(match, result) => {
    // Handle match completion
    updateDatabase(match.id, result);
  }}
  seededTeams={true}
  showSeeds={true}
/>
```

### `Team` Interface

```typescript
interface Team {
  id: string;              // Unique identifier
  name: string;            // Team/player name
  seed?: number;           // Optional seed number
  customLabel?: string;    // Optional custom display label
  [key: string]: any;      // Allow additional custom properties
}
```

### `BracketTheme` Interface

```typescript
interface BracketTheme {
  colors?: {
    background?: string;
    roundBackground?: string;
    matchBackground?: string;
    teamSlotBackground?: string;
    teamSlotHover?: string;
    teamSlotWinner?: string;
    teamSlotLoser?: string;
    border?: string;
    borderActive?: string;
    text?: string;
    textSecondary?: string;
    connector?: string;
    byeBackground?: string;
  };
  fonts?: {
    family?: string;
    size?: {
      teamName?: string;
      roundLabel?: string;
      matchLabel?: string;
    };
    weight?: {
      teamName?: string;
      roundLabel?: string;
      matchLabel?: string;
    };
  };
  spacing?: {
    round?: string;
    match?: string;
    teamSlot?: string;
    container?: string;
  };
  borders?: {
    width?: string;
    radius?: string;
    style?: string;
  };
  layout?: {
    direction?: 'horizontal' | 'vertical';
    matchWidth?: string;
    matchHeight?: string;
  };
}
```

## Bracket Types

### Single Elimination

The most common bracket type. Teams are eliminated after one loss.

```tsx
<BracketContainer type="single" teams={teams} />
```

### Double Elimination

Teams have a second chance in the losers bracket after their first loss.

```tsx
<BracketContainer type="double" teams={teams} />
```

### Round Robin

Each team plays every other team. Best record wins.

```tsx
<BracketContainer type="roundrobin" teams={teams} />
```

### Swiss System

Teams are paired based on their current record in each round.

```tsx
<BracketContainer type="swiss" teams={teams} />
```

## Theming Examples

### Dark Theme

```tsx
const darkTheme = {
  colors: {
    background: '#1a1a1a',
    roundBackground: '#2d2d2d',
    matchBackground: '#3a3a3a',
    teamSlotBackground: '#4a4a4a',
    teamSlotWinner: '#10b981',
    teamSlotLoser: '#ef4444',
    border: '#555555',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
  },
};

<BracketContainer type="single" teams={teams} theme={darkTheme} />
```

### Custom Colors

```tsx
const customTheme = {
  colors: {
    teamSlotWinner: '#34d399',
    teamSlotLoser: '#fca5a5',
    borderActive: '#3b82f6',
  },
  spacing: {
    round: '50px',
    match: '25px',
  },
  borders: {
    radius: '12px',
    width: '2px',
  },
};
```

### Custom Fonts

```tsx
const fontTheme = {
  fonts: {
    family: 'Roboto, sans-serif',
    size: {
      teamName: '16px',
      roundLabel: '20px',
    },
    weight: {
      teamName: '700',
      roundLabel: '800',
    },
  },
};
```

## Handling Match Results

The `onMatchComplete` callback provides access to match data and results:

```tsx
<BracketContainer
  type="single"
  teams={teams}
  onMatchComplete={(match, result) => {
    // match.id - Match identifier
    // match.team1, match.team2 - Teams in the match
    // result.winner - ID of winning team
    // result.team1Score, result.team2Score - Scores (if provided)
    // result.completed - Whether match is finished
    
    // Update your backend/store
    updateMatch(match.id, {
      winner: result.winner,
      scores: {
        team1: result.team1Score,
        team2: result.team2Score,
      },
    });
  }}
/>
```

## Advanced Usage

### Manual Seeding

If teams are already in the correct order, set `seededTeams={true}`:

```tsx
const teams = [
  { id: '1', name: 'Team 1', seed: 1 },
  { id: '2', name: 'Team 2', seed: 2 },
  // ... in seed order
];

<BracketContainer type="single" teams={teams} seededTeams={true} />
```

### Custom Team Labels

Use `customLabel` to display different text than the team name:

```tsx
const teams = [
  { 
    id: '1', 
    name: 'Team Alpha Official Name', 
    customLabel: 'Alpha',
    seed: 1 
  },
];
```

### Programmatic Bracket Updates

You can use `BracketGenerator.updateMatchResult` to programmatically update matches:

```tsx
import { BracketGenerator } from '@/app/components/bracket';

// Generate bracket
const bracket = BracketGenerator.generate('single', teams);

// Update a match result
const updated = BracketGenerator.updateMatchResult(
  bracket,
  'match-id',
  {
    winner: 'team-1-id',
    team1Score: 3,
    team2Score: 1,
    completed: true,
  }
);
```

## Component Structure

```
bracket/
├── BracketContainer.tsx   # Top-level component
├── Round.tsx              # Round component
├── Match.tsx              # Match component
├── TeamSlot.tsx           # Team/player slot component
├── ThemeProvider.tsx      # Theme context provider
├── BracketGenerator.ts    # Bracket generation utility
├── types.ts               # TypeScript interfaces
├── Bracket.module.css     # Styling with CSS Modules
├── index.ts               # Public exports
└── __tests__/             # Unit tests
    ├── BracketGenerator.test.ts
    ├── TeamSlot.test.tsx
    ├── Match.test.tsx
    └── Round.test.tsx
```

## Testing

Run tests with:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Tests cover:
- Bracket generation logic for all bracket types
- Component rendering
- Theme application
- Match result updates

## Responsive Design

The bracket automatically adapts to different screen sizes:

- **Desktop**: Horizontal layout with scrolling for large brackets
- **Mobile**: Vertical stack layout
- **Tablet**: Adaptive based on viewport

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Examples

See `app/bracket-demo/page.tsx` for comprehensive examples including:

- Single elimination with 16 teams
- Double elimination bracket
- Round robin tournament
- Swiss system
- Dark and light themes
- Match history tracking

## License

Part of the roshproject codebase.

## Contributing

When modifying the bracket components:

1. Update TypeScript types if adding new props/interfaces
2. Add tests for new functionality
3. Update this README if API changes
4. Ensure responsive design still works
5. Test with various team counts (odd/even, small/large)

