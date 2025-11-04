'use client';

import React from 'react';
import { Match as MatchType } from './types';
import { useBracketTheme } from './ThemeProvider';
import TeamSlot from './TeamSlot';
import styles from './Bracket.module.css';

interface MatchProps {
  match: MatchType;
  showSeeds?: boolean;
  onMatchComplete?: (match: MatchType) => void;
}

export default function Match({ match, showSeeds = false, onMatchComplete }: MatchProps) {
  const theme = useBracketTheme();
  
  const team1Winner =
    !!(match.result?.completed && match.result.winner === match.team1?.id);
  const team2Winner =
    !!(match.result?.completed && match.result.winner === match.team2?.id);
  
  const team1Loser =
    !!(match.result?.completed &&
    match.result.winner &&
    match.result.winner !== match.team1?.id);
  const team2Loser =
    !!(match.result?.completed &&
    match.result.winner &&
    match.result.winner !== match.team2?.id);
  
  return (
    <div
      className={styles.match}
      style={{
        backgroundColor: theme.colors.matchBackground!,
        borderColor: theme.colors.border!,
        borderWidth: theme.borders.width!,
        borderStyle: theme.borders.style!,
        borderRadius: theme.borders.radius!,
        width: theme.layout.matchWidth!,
        minHeight: theme.layout.matchHeight!,
      }}
    >
      <div className={styles.matchHeader}>
        <span
          className={styles.matchLabel}
          style={{
            fontSize: theme.fonts.size!.matchLabel!,
            fontWeight: theme.fonts.weight!.matchLabel!,
            color: theme.colors.textSecondary!,
          }}
        >
          Match {match.matchIndex + 1}
        </span>
      </div>
      
      <div className={styles.matchContent}>
        <TeamSlot
          team={match.team1 ?? null}
          isWinner={team1Winner}
          isLoser={team1Loser}
          showSeed={showSeeds}
          matchResult={match.result}
          slot="team1"
          isBye={match.bye && !match.team1}
        />
        
        <div className={styles.matchVs}>vs</div>
        
        <TeamSlot
          team={match.team2 ?? null}
          isWinner={team2Winner}
          isLoser={team2Loser}
          showSeed={showSeeds}
          matchResult={match.result}
          slot="team2"
          isBye={match.bye && !match.team2}
        />
      </div>
      
      {match.result?.completed && onMatchComplete && (
        <div className={styles.matchResult}>
          <span style={{ color: theme.colors.textSecondary! }}>
            Winner: {match.team1?.id === match.result.winner ? match.team1?.name : match.team2?.name}
          </span>
        </div>
      )}
    </div>
  );
}

