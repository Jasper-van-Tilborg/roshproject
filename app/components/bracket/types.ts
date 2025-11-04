export interface Team {
  id: string;
  name: string;
  seed?: number;
  customLabel?: string;
  [key: string]: unknown; // Allow additional custom properties
}

export type BracketType = 'single' | 'double' | 'roundrobin' | 'swiss';

export interface MatchResult {
  team1Score?: number;
  team2Score?: number;
  winner?: string; // team id
  completed?: boolean;
}

export interface Match {
  id: string;
  roundId: string;
  roundIndex: number;
  matchIndex: number;
  team1?: Team | null;
  team2?: Team | null;
  result?: MatchResult;
  nextMatchId?: string; // For linking matches (e.g., winner goes to next round)
  nextMatchSlot?: 'team1' | 'team2'; // Which slot in next match
  bye?: boolean; // True if this match is a bye
}

export interface Round {
  id: string;
  roundIndex: number;
  name: string;
  matches: Match[];
  isConsolation?: boolean; // For double elimination losers bracket
  isFinals?: boolean; // For grand finals in double elimination
}

export interface BracketData {
  rounds: Round[];
  type: BracketType;
  totalTeams: number;
}

export interface BracketTheme {
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

export interface BracketContainerProps {
  type: BracketType;
  teams: Team[];
  theme?: BracketTheme;
  onMatchComplete?: (match: Match, result: MatchResult) => void;
  seededTeams?: boolean; // If true, teams are already seeded
  showSeeds?: boolean;
  className?: string;
}

