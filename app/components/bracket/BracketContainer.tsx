'use client';

import React, { useState } from 'react';
import { BracketContainerProps, BracketData, Match as MatchType } from './types';
import { ThemeProvider } from './ThemeProvider';
import { BracketGenerator } from './BracketGenerator';
import Round from './Round';
import styles from './Bracket.module.css';

export default function BracketContainer({
  type,
  teams,
  theme,
  onMatchComplete,
  seededTeams = false,
  showSeeds = false,
  className = '',
}: BracketContainerProps) {
  const [bracketData, setBracketData] = useState<BracketData>(() =>
    BracketGenerator.generate(type, teams, seededTeams)
  );
  
  // Regenerate bracket if type or teams change
  React.useEffect(() => {
    setBracketData(BracketGenerator.generate(type, teams, seededTeams));
  }, [type, teams, seededTeams]);
  
  const handleMatchComplete = (matchId: string) => {
    const match = findMatch(bracketData, matchId);
    if (!match || !match.result) return;
    
    // Update bracket with result
    const updatedBracket = BracketGenerator.updateMatchResult(
      bracketData,
      matchId,
      match.result
    );
    
    setBracketData(updatedBracket);
    
    // Call callback if provided
    if (onMatchComplete && match) {
      onMatchComplete(match, match.result);
    }
  };
  
  const direction = theme?.layout?.direction || 'horizontal';
  
  return (
    <ThemeProvider theme={theme}>
      <div
        className={`${styles.bracketWrapper} ${
          direction === 'vertical' ? styles.bracketWrapperVertical : ''
        } ${className}`}
      >
        <div className={styles.bracketRounds}>
          {bracketData.rounds.map((round) => (
            <Round
              key={round.id}
              round={round}
              showSeeds={showSeeds}
              onMatchComplete={handleMatchComplete}
            />
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
}

function findMatch(bracketData: BracketData, matchId: string): MatchType | null {
  for (const round of bracketData.rounds) {
    const match = round.matches.find((m) => m.id === matchId);
    if (match) return match;
  }
  return null;
}

