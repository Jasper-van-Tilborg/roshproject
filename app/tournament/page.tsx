'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TournamentSettings from '../components/TournamentSettings';
import BracketContainer from '../components/bracket/BracketContainer';
import DarkVeil from '../components/DarkVeil';
import { Team, BracketType, BracketTheme, Match, MatchResult } from '../components/bracket/types';

export default function TournamentPage() {
  const [bracketType, setBracketType] = useState<BracketType>('single');
  const [showSeeds, setShowSeeds] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Team Alpha', seed: 1 },
    { id: '2', name: 'Team Beta', seed: 2 },
    { id: '3', name: 'Team Gamma', seed: 3 },
    { id: '4', name: 'Team Delta', seed: 4 },
    { id: '5', name: 'Team Epsilon', seed: 5 },
    { id: '6', name: 'Team Zeta', seed: 6 },
    { id: '7', name: 'Team Eta', seed: 7 },
    { id: '8', name: 'Team Theta', seed: 8 },
    { id: '9', name: 'Team Iota', seed: 9 },
    { id: '10', name: 'Team Kappa', seed: 10 },
    { id: '11', name: 'Team Lambda', seed: 11 },
    { id: '12', name: 'Team Mu', seed: 12 },
    { id: '13', name: 'Team Nu', seed: 13 },
    { id: '14', name: 'Team Xi', seed: 14 },
    { id: '15', name: 'Team Omicron', seed: 15 },
    { id: '16', name: 'Team Pi', seed: 16 },
  ]);

  // Dynamic theme based on selection
  const bracketTheme: BracketTheme = useMemo(() => {
    if (theme === 'dark') {
      return {
        colors: {
          background: 'transparent',
          roundBackground: 'rgba(255, 255, 255, 0.05)',
          matchBackground: 'rgba(0, 0, 0, 0.4)',
          teamSlotBackground: 'rgba(255, 255, 255, 0.1)',
          teamSlotHover: 'rgba(255, 255, 255, 0.15)',
          teamSlotWinner: '#10b981',
          teamSlotLoser: '#ef4444',
          border: 'rgba(255, 255, 255, 0.2)',
          borderActive: '#3b82f6',
          text: '#ffffff',
          textSecondary: '#a0a0a0',
          connector: 'rgba(255, 255, 255, 0.1)',
          byeBackground: 'rgba(255, 193, 7, 0.2)',
        },
        fonts: {
          family: 'Inter, system-ui, sans-serif',
          size: {
            teamName: '14px',
            roundLabel: '16px',
            matchLabel: '12px',
          },
          weight: {
            teamName: '600',
            roundLabel: '700',
            matchLabel: '500',
          },
        },
        spacing: {
          round: '20px',
          match: '12px',
          teamSlot: '4px',
          container: '0px',
        },
        borders: {
          width: '1px',
          radius: '8px',
          style: 'solid',
        },
        layout: {
          direction: 'horizontal',
          matchWidth: '180px',
          matchHeight: 'auto',
        },
      };
    } else {
      return {
        colors: {
          background: 'transparent',
          roundBackground: 'rgba(255, 255, 255, 0.1)',
          matchBackground: 'rgba(255, 255, 255, 0.9)',
          teamSlotBackground: 'rgba(255, 255, 255, 0.2)',
          teamSlotHover: 'rgba(255, 255, 255, 0.3)',
          teamSlotWinner: '#34d399',
          teamSlotLoser: '#fca5a5',
          border: 'rgba(255, 255, 255, 0.3)',
          borderActive: '#3b82f6',
          text: '#ffffff',
          textSecondary: '#e0e0e0',
          connector: 'rgba(255, 255, 255, 0.2)',
          byeBackground: 'rgba(255, 193, 7, 0.3)',
        },
        fonts: {
          family: 'Inter, system-ui, sans-serif',
        },
        spacing: {
          round: '20px',
          match: '12px',
          teamSlot: '4px',
          container: '0px',
        },
        borders: {
          width: '1px',
          radius: '8px',
          style: 'solid',
        },
        layout: {
          direction: 'horizontal',
          matchWidth: '180px',
          matchHeight: 'auto',
        },
      };
    }
  }, [theme]);

  // Auto-scale bracket to fit container
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const container = document.getElementById('bracket-container');
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Estimate bracket size based on rounds and matches
      const numRounds = Math.ceil(Math.log2(teams.length)) || 1;
      const estimatedWidth = numRounds * 220; // Approximate width per round
      const estimatedHeight = Math.pow(2, numRounds - 1) * 60; // Approximate height

      const scaleX = containerWidth / estimatedWidth;
      const scaleY = containerHeight / estimatedHeight;
      const newScale = Math.min(scaleX, scaleY, 1) * 0.95; // 95% to add padding
      
      setScale(Math.max(0.3, newScale)); // Minimum scale of 30%
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [teams, bracketType]);

  const handleMatchComplete = (match: Match, result: MatchResult) => {
    console.log('Match completed:', match, result);
    // Here you could update your backend/store
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.04}
          scanlineIntensity={0}
          speed={0.3}
          scanlineFrequency={0.2}
          warpAmount={0.15}
          resolutionScale={1}
        />
      </div>

      {/* Settings Sidebar */}
      <TournamentSettings
        bracketType={bracketType}
        onBracketTypeChange={setBracketType}
        teams={teams}
        onTeamsChange={setTeams}
        showSeeds={showSeeds}
        onShowSeedsChange={setShowSeeds}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Bracket Area */}
      <div
        id="bracket-container"
        className="absolute left-80 right-0 top-0 bottom-0 flex items-center justify-center overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease',
        }}
      >
        <BracketContainer
          type={bracketType}
          teams={teams}
          theme={bracketTheme}
          onMatchComplete={handleMatchComplete}
          seededTeams={true}
          showSeeds={showSeeds}
          fitToContainer={true}
          interactive={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
