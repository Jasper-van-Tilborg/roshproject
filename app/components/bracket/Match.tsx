'use client';

import React, { useState } from 'react';
import { Match as MatchType, MatchResult } from './types';
import { useBracketTheme } from './ThemeProvider';
import TeamSlot from './TeamSlot';
import styles from './Bracket.module.css';
import MatchResultModal from '../MatchResultModal';

interface MatchProps {
  match: MatchType;
  showSeeds?: boolean;
  onMatchComplete?: (match: MatchType) => void;
  interactive?: boolean;
}

export default function Match({ match, showSeeds = false, onMatchComplete, interactive = false }: MatchProps) {
  const theme = useBracketTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleClick = () => {
    if (interactive && match.team1 && match.team2) {
      setIsModalOpen(true);
    }
  };

  const handleSaveResult = (result: MatchResult) => {
    if (onMatchComplete) {
      const updatedMatch = { ...match, result };
      onMatchComplete(updatedMatch);
    }
  };
  
  return (
    <>
      <div
        className={styles.match}
        onClick={handleClick}
        style={{
          backgroundColor: theme.colors.matchBackground!,
          borderColor: theme.colors.border!,
          borderWidth: theme.borders.width!,
          borderStyle: theme.borders.style!,
          borderRadius: theme.borders.radius!,
          width: theme.layout.matchWidth!,
          minHeight: theme.layout.matchHeight!,
          cursor: interactive && match.team1 && match.team2 ? 'pointer' : 'default',
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
    {interactive && (
      <MatchResultModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveResult}
      />
    )}
    </>
  );
}

