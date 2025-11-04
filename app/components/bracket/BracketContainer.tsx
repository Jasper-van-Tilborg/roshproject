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
  fitToContainer = false,
  interactive = false,
}: BracketContainerProps & { fitToContainer?: boolean; interactive?: boolean }) {
  const [bracketData, setBracketData] = useState<BracketData>(() =>
    BracketGenerator.generate(type, teams, seededTeams)
  );
  
  // Regenerate bracket if type or teams change
  React.useEffect(() => {
    setBracketData(BracketGenerator.generate(type, teams, seededTeams));
  }, [type, teams, seededTeams]);
  
  const handleMatchComplete = (matchOrId: string | MatchType) => {
    let match: MatchType | null;
    let matchId: string;
    
    if (typeof matchOrId === 'string') {
      matchId = matchOrId;
      match = findMatch(bracketData, matchId);
    } else {
      match = matchOrId;
      matchId = match.id;
    }
    
    if (!match || !match.result) return;
    
    // Update bracket with result
    const updatedBracket = BracketGenerator.updateMatchResult(
      bracketData,
      matchId,
      match.result
    );
    
    setBracketData(updatedBracket);
    
    // Call callback if provided
    if (onMatchComplete) {
      onMatchComplete(match, match.result);
    }
  };
  
  const direction = theme?.layout?.direction || 'horizontal';
  
  return (
    <ThemeProvider theme={theme}>
      <div
        className={`${fitToContainer ? styles.bracketWrapperFit : styles.bracketWrapper} ${
          direction === 'vertical' ? styles.bracketWrapperVertical : ''
        } ${className}`}
      >
        <div className={fitToContainer ? styles.bracketRoundsFit : styles.bracketRounds}>
          {bracketData.rounds.map((round, index) => (
            <Round
              key={round.id}
              round={round}
              showSeeds={showSeeds}
              onMatchComplete={handleMatchComplete}
              interactive={interactive}
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

