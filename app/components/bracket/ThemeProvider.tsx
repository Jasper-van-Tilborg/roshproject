'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { BracketTheme } from './types';
import styles from './Bracket.module.css';

const defaultTheme: Required<BracketTheme> = {
  colors: {
    background: '#ffffff',
    roundBackground: '#f5f5f5',
    matchBackground: '#ffffff',
    teamSlotBackground: '#f9f9f9',
    teamSlotHover: '#e8e8e8',
    teamSlotWinner: '#4ade80',
    teamSlotLoser: '#f87171',
    border: '#e0e0e0',
    borderActive: '#3b82f6',
    text: '#1a1a1a',
    textSecondary: '#666666',
    connector: '#cbd5e1',
    byeBackground: '#fef3c7',
  },
  fonts: {
    family: 'system-ui, -apple-system, sans-serif',
    size: {
      teamName: '14px',
      roundLabel: '16px',
      matchLabel: '12px',
    },
    weight: {
      teamName: '500',
      roundLabel: '600',
      matchLabel: '400',
    },
  },
  spacing: {
    round: '40px',
    match: '20px',
    teamSlot: '4px',
    container: '20px',
  },
  borders: {
    width: '1px',
    radius: '6px',
    style: 'solid',
  },
  layout: {
    direction: 'horizontal',
    matchWidth: '200px',
    matchHeight: 'auto',
  },
};

interface ThemeContextValue {
  theme: Required<BracketTheme>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  theme?: BracketTheme;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const mergedTheme = mergeTheme(defaultTheme, theme || {});
  
  // Apply CSS variables to root
  React.useEffect(() => {
    const root = document.documentElement;
    const vars = generateCSSVariables(mergedTheme);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    return () => {
      Object.keys(vars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [mergedTheme]);
  
  return (
    <ThemeContext.Provider value={{ theme: mergedTheme }}>
      <div className={styles.bracketContainer} style={generateInlineStyles(mergedTheme)}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useBracketTheme(): Required<BracketTheme> {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultTheme;
  }
  return context.theme;
}

function mergeTheme(
  defaultTheme: Required<BracketTheme>,
  customTheme: BracketTheme
): Required<BracketTheme> {
  return {
    colors: { 
      ...defaultTheme.colors, 
      ...(customTheme.colors || {}) 
    },
    fonts: {
      family: customTheme.fonts?.family ?? defaultTheme.fonts.family,
      size: { 
        ...defaultTheme.fonts.size, 
        ...(customTheme.fonts?.size || {}) 
      },
      weight: { 
        ...defaultTheme.fonts.weight, 
        ...(customTheme.fonts?.weight || {}) 
      },
    },
    spacing: { 
      ...defaultTheme.spacing, 
      ...(customTheme.spacing || {}) 
    },
    borders: { 
      ...defaultTheme.borders, 
      ...(customTheme.borders || {}) 
    },
    layout: { 
      ...defaultTheme.layout, 
      ...(customTheme.layout || {}) 
    },
  };
}

function generateCSSVariables(theme: Required<BracketTheme>): Record<string, string> {
  return {
    '--bracket-bg': theme.colors.background!,
    '--bracket-round-bg': theme.colors.roundBackground!,
    '--bracket-match-bg': theme.colors.matchBackground!,
    '--bracket-team-slot-bg': theme.colors.teamSlotBackground!,
    '--bracket-team-slot-hover': theme.colors.teamSlotHover!,
    '--bracket-team-slot-winner': theme.colors.teamSlotWinner!,
    '--bracket-team-slot-loser': theme.colors.teamSlotLoser!,
    '--bracket-border': theme.colors.border!,
    '--bracket-border-active': theme.colors.borderActive!,
    '--bracket-text': theme.colors.text!,
    '--bracket-text-secondary': theme.colors.textSecondary!,
    '--bracket-connector': theme.colors.connector!,
    '--bracket-bye-bg': theme.colors.byeBackground!,
    '--bracket-font-family': theme.fonts.family!,
    '--bracket-font-size-team': theme.fonts.size!.teamName!,
    '--bracket-font-size-round': theme.fonts.size!.roundLabel!,
    '--bracket-font-size-match': theme.fonts.size!.matchLabel!,
    '--bracket-font-weight-team': theme.fonts.weight!.teamName!,
    '--bracket-font-weight-round': theme.fonts.weight!.roundLabel!,
    '--bracket-font-weight-match': theme.fonts.weight!.matchLabel!,
    '--bracket-spacing-round': theme.spacing.round!,
    '--bracket-spacing-match': theme.spacing.match!,
    '--bracket-spacing-slot': theme.spacing.teamSlot!,
    '--bracket-spacing-container': theme.spacing.container!,
    '--bracket-border-width': theme.borders.width!,
    '--bracket-border-radius': theme.borders.radius!,
    '--bracket-border-style': theme.borders.style!,
    '--bracket-match-width': theme.layout.matchWidth!,
    '--bracket-match-height': theme.layout.matchHeight!,
  };
}

function generateInlineStyles(theme: Required<BracketTheme>): React.CSSProperties {
  return {
    backgroundColor: theme.colors.background!,
    fontFamily: theme.fonts.family!,
    padding: theme.spacing.container!,
  };
}

