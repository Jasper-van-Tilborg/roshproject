'use client';

import React from 'react';

interface ResultProps {
  playerScore: number;
  proScore: number;
  playerName?: string;
  proName?: string;
  mistakes?: number;
  onRestart: () => void;
  onBackToDashboard?: () => void;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    winColor?: string;
    loseColor?: string;
  };
}

export default function Result({ 
  playerScore, 
  proScore, 
  playerName = 'Jij',
  proName = 'Pro',
  mistakes = 0,
  onRestart,
  onBackToDashboard,
  config 
}: ResultProps) {
  const primaryColor = config?.primaryColor || '#3B82F6';
  const secondaryColor = config?.secondaryColor || '#8B5CF6';
  const winColor = config?.winColor || '#10B981';
  const loseColor = config?.loseColor || '#EF4444';
  
  const hasWon = playerScore >= proScore;
  const scoreDifference = Math.abs(playerScore - proScore);
  const winPercentage = ((playerScore / proScore) * 100).toFixed(1);
  const totalPresses = playerScore + mistakes;
  const accuracy = totalPresses > 0 ? ((playerScore / totalPresses) * 100).toFixed(1) : '0';
  
  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      {/* Result Icon & Title */}
      <div className="mb-8">
        <div className="text-9xl mb-4 animate-bounce">
          {hasWon ? '🏆' : '💪'}
        </div>
        <h2 
          className="text-5xl font-bold mb-2"
          style={{ color: hasWon ? winColor : loseColor }}
        >
          {hasWon ? 'Je hebt de pro verslagen!' : 'Pro wint deze ronde!'}
        </h2>
        <p className="text-xl text-gray-600">
          {hasWon 
            ? `Geweldig! Je was ${scoreDifference} punten sneller!` 
            : `Bijna! Je was ${scoreDifference} punten te kort.`
          }
        </p>
      </div>
      
      {/* Score Breakdown */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">{playerName}</div>
            <div 
              className="text-6xl font-bold"
              style={{ color: hasWon ? winColor : primaryColor }}
            >
              {playerScore}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">{proName}</div>
            <div 
              className="text-6xl font-bold"
              style={{ color: !hasWon ? winColor : primaryColor }}
            >
              {proScore}
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Score %</div>
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              {winPercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Verschil</div>
            <div className="text-2xl font-bold" style={{ color: secondaryColor }}>
              {scoreDifference}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Accuracy</div>
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              {accuracy}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Fouten</div>
            <div className="text-2xl font-bold" style={{ color: loseColor }}>
              {mistakes}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: primaryColor }}
        >
          🔄 Opnieuw Spelen
        </button>
        
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: 'white',
              color: primaryColor,
              border: `2px solid ${primaryColor}`
            }}
          >
            ← Terug naar Dashboard
          </button>
        )}
      </div>
      
      {/* Share Section (Optional) */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-4">Deel je score!</p>
        <div className="flex gap-4 justify-center">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => {
              const text = `Ik heb ${hasWon ? 'de pro verslagen' : 'tegen de pro gespeeld'} met een score van ${playerScore}! 🎮`;
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
                alert('Score gekopieerd naar klembord!');
              }
            }}
          >
            📱 Delen
          </button>
        </div>
      </div>
    </div>
  );
}
