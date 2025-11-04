// Main exports
export { default as BracketContainer } from './BracketContainer';
export { default as Round } from './Round';
export { default as Match } from './Match';
export { default as TeamSlot } from './TeamSlot';
export { ThemeProvider, useBracketTheme } from './ThemeProvider';
export { BracketGenerator } from './BracketGenerator';

// Type exports
export type {
  Team,
  BracketType,
  Match as MatchType,
  Round as RoundType,
  BracketData,
  BracketTheme,
  BracketContainerProps,
  MatchResult,
} from './types';

