'use client';

import React, { useState } from 'react';
import BracketContainer from '../components/bracket/BracketContainer';
import { Team, BracketType, Match, MatchResult } from '../components/bracket/types';

export default function BracketDemoPage() {
  const [selectedType, setSelectedType] = useState<BracketType>('single');
  const [matchHistory, setMatchHistory] = useState<Array<{ match: Match; result: MatchResult }>>([]);

  // Example teams with seeds
  const exampleTeams: Team[] = [
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
  ];

  // Custom theme example - Dark theme
  const darkTheme = {
    colors: {
      background: '#1a1a1a',
      roundBackground: '#2d2d2d',
      matchBackground: '#3a3a3a',
      teamSlotBackground: '#4a4a4a',
      teamSlotHover: '#5a5a5a',
      teamSlotWinner: '#10b981',
      teamSlotLoser: '#ef4444',
      border: '#555555',
      borderActive: '#3b82f6',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      connector: '#444444',
      byeBackground: '#4a3a00',
    },
    fonts: {
      family: 'Inter, system-ui, sans-serif',
      size: {
        teamName: '15px',
        roundLabel: '18px',
        matchLabel: '13px',
      },
      weight: {
        teamName: '600',
        roundLabel: '700',
        matchLabel: '500',
      },
    },
    spacing: {
      round: '50px',
      match: '25px',
      teamSlot: '6px',
      container: '30px',
    },
    borders: {
      width: '2px',
      radius: '8px',
      style: 'solid',
    },
    layout: {
      direction: 'horizontal' as const,
      matchWidth: '220px',
      matchHeight: 'auto',
    },
  };

  // Custom theme example - Light theme with custom colors
  const lightTheme = {
    colors: {
      background: '#f8fafc',
      roundBackground: '#ffffff',
      matchBackground: '#ffffff',
      teamSlotBackground: '#f1f5f9',
      teamSlotHover: '#e2e8f0',
      teamSlotWinner: '#34d399',
      teamSlotLoser: '#fca5a5',
      border: '#cbd5e1',
      borderActive: '#3b82f6',
      text: '#1e293b',
      textSecondary: '#64748b',
      connector: '#e2e8f0',
      byeBackground: '#fef3c7',
    },
    fonts: {
      family: 'Roboto, system-ui, sans-serif',
    },
  };

  const handleMatchComplete = (match: Match, result: MatchResult) => {
    setMatchHistory((prev) => [...prev, { match, result }]);
    console.log('Match completed:', match.id, result);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#1a1a1a' }}>
          Tournament Bracket Component Demo
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          A fully customizable tournament bracket component library for React + Next.js
        </p>

        {/* Controls */}
        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Bracket Type</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(['single', 'double', 'roundrobin', 'swiss'] as BracketType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedType === type ? '#3b82f6' : '#e5e5e5',
                  color: selectedType === type ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: selectedType === type ? '600' : '400',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'roundrobin' ? 'Round Robin' : type === 'double' ? 'Double Elimination' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Single Elimination Example */}
        {selectedType === 'single' && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
              Single Elimination Bracket (16 Teams)
            </h2>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'auto',
                backgroundColor: '#fff',
              }}
            >
              <BracketContainer
                type="single"
                teams={exampleTeams}
                theme={lightTheme}
                onMatchComplete={handleMatchComplete}
                seededTeams={true}
                showSeeds={true}
              />
            </div>
          </div>
        )}

        {/* Double Elimination Example */}
        {selectedType === 'double' && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
              Double Elimination Bracket (16 Teams)
            </h2>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'auto',
                backgroundColor: '#fff',
              }}
            >
              <BracketContainer
                type="double"
                teams={exampleTeams}
                theme={lightTheme}
                onMatchComplete={handleMatchComplete}
                seededTeams={true}
                showSeeds={true}
              />
            </div>
          </div>
        )}

        {/* Round Robin Example */}
        {selectedType === 'roundrobin' && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
              Round Robin Tournament (16 Teams)
            </h2>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'auto',
                backgroundColor: '#fff',
              }}
            >
              <BracketContainer
                type="roundrobin"
                teams={exampleTeams.slice(0, 8)} // Use 8 teams for round robin to keep it manageable
                theme={lightTheme}
                onMatchComplete={handleMatchComplete}
                showSeeds={true}
              />
            </div>
          </div>
        )}

        {/* Swiss Example */}
        {selectedType === 'swiss' && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
              Swiss System Tournament (16 Teams)
            </h2>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'auto',
                backgroundColor: '#fff',
              }}
            >
              <BracketContainer
                type="swiss"
                teams={exampleTeams.slice(0, 8)} // Use 8 teams for swiss
                theme={lightTheme}
                onMatchComplete={handleMatchComplete}
                showSeeds={true}
              />
            </div>
          </div>
        )}

        {/* Dark Theme Example */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
            Dark Theme Example (8 Teams, Single Elimination)
          </h2>
          <div
            style={{
              border: '1px solid #555',
              borderRadius: '8px',
              overflow: 'auto',
            }}
          >
            <BracketContainer
              type="single"
              teams={exampleTeams.slice(0, 8)}
              theme={darkTheme}
              onMatchComplete={handleMatchComplete}
              seededTeams={true}
              showSeeds={true}
            />
          </div>
        </div>

        {/* Match History */}
        {matchHistory.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>Match History</h2>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {matchHistory.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <strong>Match {item.match.matchIndex + 1}</strong> (Round {item.match.roundIndex + 1})
                  <br />
                  Winner: {item.result.winner || 'N/A'}
                  {item.result.team1Score !== undefined && item.result.team2Score !== undefined && (
                    <>
                      <br />
                      Score: {item.result.team1Score} - {item.result.team2Score}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Examples */}
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>Usage Example</h2>
          <pre
            style={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px',
            }}
          >
            <code>{`import BracketContainer from '@/components/bracket/BracketContainer';
import { Team } from '@/components/bracket/types';

const teams: Team[] = [
  { id: '1', name: 'Team Alpha', seed: 1 },
  { id: '2', name: 'Team Beta', seed: 2 },
  // ... more teams
];

<BracketContainer
  type="single"
  teams={teams}
  theme={{
    colors: {
      background: '#ffffff',
      teamSlotWinner: '#4ade80',
      // ... more colors
    },
    fonts: {
      family: 'Inter, sans-serif',
    },
  }}
  onMatchComplete={(match, result) => {
    console.log('Match completed:', match, result);
  }}
  seededTeams={true}
  showSeeds={true}
/>`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

