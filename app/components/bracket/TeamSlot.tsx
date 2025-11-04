'use client';

import React from 'react';
import { Team, MatchResult } from './types';
import { useBracketTheme } from './ThemeProvider';
import styles from './Bracket.module.css';

interface TeamSlotProps {
  team: Team | null;
  isWinner?: boolean;
  isLoser?: boolean;
  showSeed?: boolean;
  matchResult?: MatchResult;
  slot: 'team1' | 'team2';
  isBye?: boolean;
}

export default function TeamSlot({
  team,
  isWinner = false,
  isLoser = false,
  showSeed = false,
  matchResult,
  slot,
  isBye = false,
}: TeamSlotProps) {
  const theme = useBracketTheme();
  
  if (!team && !isBye) {
    return (
      <div
        className={`${styles.teamSlot} ${styles.teamSlotEmpty}`}
        style={{
          minHeight: '40px',
          backgroundColor: theme.colors.teamSlotBackground!,
        }}
      >
        <span className={styles.teamSlotPlaceholder}>TBD</span>
      </div>
    );
  }
  
  if (isBye) {
    return (
      <div
        className={`${styles.teamSlot} ${styles.teamSlotBye}`}
        style={{
          backgroundColor: theme.colors.byeBackground!,
          color: theme.colors.textSecondary!,
        }}
      >
        <span>Bye</span>
      </div>
    );
  }
  
  const displayName = team?.customLabel || team?.name || 'Unknown';
  const score = matchResult
    ? slot === 'team1'
      ? matchResult.team1Score
      : matchResult.team2Score
    : undefined;
  
  const isMatchWinner =
    matchResult?.winner === team?.id ||
    (matchResult?.completed &&
      matchResult.winner &&
      matchResult.winner === team?.id);
  
  return (
    <div
      className={`${styles.teamSlot} ${
        isWinner || isMatchWinner ? styles.teamSlotWinner : ''
      } ${isLoser ? styles.teamSlotLoser : ''}`}
      style={{
        backgroundColor:
          isWinner || isMatchWinner
            ? theme.colors.teamSlotWinner!
            : isLoser
            ? theme.colors.teamSlotLoser!
            : theme.colors.teamSlotBackground!,
        color: theme.colors.text!,
        fontSize: theme.fonts.size!.teamName!,
        fontWeight: theme.fonts.weight!.teamName!,
      }}
    >
      {showSeed && team?.seed !== undefined && (
        <span className={styles.teamSeed}>{team.seed}</span>
      )}
      <span className={styles.teamName}>{displayName}</span>
      {score !== undefined && (
        <span className={styles.teamScore}>{score}</span>
      )}
    </div>
  );
}

