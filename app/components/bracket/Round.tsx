'use client';

import React from 'react';
import { Round as RoundType, Match as MatchType } from './types';
import { useBracketTheme } from './ThemeProvider';
import Match from './Match';
import styles from './Bracket.module.css';

interface RoundProps {
  round: RoundType;
  showSeeds?: boolean;
  onMatchComplete?: (matchOrId: string | MatchType) => void;
  interactive?: boolean;
}

export default function Round({ round, showSeeds = false, onMatchComplete, interactive = false }: RoundProps) {
  const theme = useBracketTheme();
  
  return (
    <div
      className={styles.round}
      style={{
        marginRight: theme.spacing.round!,
        backgroundColor: theme.colors.roundBackground!,
        padding: theme.spacing.match!,
        borderRadius: theme.borders.radius!,
      }}
    >
      <h3
        className={styles.roundTitle}
        style={{
          fontSize: theme.fonts.size!.roundLabel!,
          fontWeight: theme.fonts.weight!.roundLabel!,
          color: theme.colors.text!,
          marginBottom: theme.spacing.match!,
        }}
      >
        {round.name}
        {round.isConsolation && ' (Losers)'}
        {round.isFinals && ' (Grand Finals)'}
      </h3>
      
      <div className={styles.roundMatches}>
        {round.matches.map((match) => (
          <div key={match.id} className={styles.matchWrapper}>
            <Match
              match={match}
              showSeeds={showSeeds}
              onMatchComplete={(m) => onMatchComplete?.(m)}
              interactive={interactive}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

