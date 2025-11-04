'use client';

import React, { useState } from 'react';
import { BracketType, Team } from './bracket/types';

interface TournamentSettingsProps {
  bracketType: BracketType;
  onBracketTypeChange: (type: BracketType) => void;
  teams: Team[];
  onTeamsChange: (teams: Team[]) => void;
  showSeeds: boolean;
  onShowSeedsChange: (show: boolean) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export default function TournamentSettings({
  bracketType,
  onBracketTypeChange,
  teams,
  onTeamsChange,
  showSeeds,
  onShowSeedsChange,
  theme,
  onThemeChange,
}: TournamentSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addTeam = () => {
    const newTeam: Team = {
      id: `team-${teams.length + 1}`,
      name: `Team ${teams.length + 1}`,
      seed: teams.length + 1,
    };
    onTeamsChange([...teams, newTeam]);
  };

  const removeTeam = (id: string) => {
    onTeamsChange(teams.filter((t) => t.id !== id));
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    onTeamsChange(
      teams.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-black/80 backdrop-blur-md border-r border-white/10 transition-all duration-300 z-50 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
      style={{
        boxShadow: '2px 0 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
      >
        {isExpanded ? '←' : '→'}
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Toernooi Instellingen</h2>

          {/* Bracket Type */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">Bracket Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['single', 'double', 'roundrobin', 'swiss'] as BracketType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onBracketTypeChange(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    bracketType === type
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {type === 'roundrobin' ? 'Round Robin' : type === 'double' ? 'Double Elim' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">Thema</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onThemeChange('light')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Show Seeds */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-white text-sm font-medium">
              <span>Toon Seeds</span>
              <button
                onClick={() => onShowSeedsChange(!showSeeds)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  showSeeds ? 'bg-blue-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    showSeeds ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Teams Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">Teams ({teams.length})</label>
              <button
                onClick={addTeam}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
              >
                + Team
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                    className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Team naam"
                  />
                  <input
                    type="number"
                    value={team.seed || ''}
                    onChange={(e) => updateTeam(team.id, { seed: parseInt(e.target.value) || undefined })}
                    className="w-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Seed"
                  />
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white text-xs rounded transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

