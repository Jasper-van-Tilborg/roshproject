'use client';

import React, { useState } from 'react';
import { Match as MatchType, MatchResult } from './bracket/types';

interface MatchResultModalProps {
  match: MatchType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: MatchResult) => void;
}

export default function MatchResultModal({
  match,
  isOpen,
  onClose,
  onSave,
}: MatchResultModalProps) {
  const [team1Score, setTeam1Score] = useState<string>(
    match.result?.team1Score?.toString() || ''
  );
  const [team2Score, setTeam2Score] = useState<string>(
    match.result?.team2Score?.toString() || ''
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    const winner = score1 > score2 ? match.team1?.id : score2 > score1 ? match.team2?.id : undefined;

    onSave({
      team1Score: score1,
      team2Score: score2,
      winner: winner,
      completed: true,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800">Match Resultaat</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">
              {match.team1?.name || 'TBD'}
            </span>
            <input
              type="number"
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div className="text-center text-gray-500 font-bold">VS</div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">
              {match.team2?.name || 'TBD'}
            </span>
            <input
              type="number"
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all font-medium"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

