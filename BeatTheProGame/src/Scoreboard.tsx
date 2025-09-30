'use client';

import React from 'react';

interface ScoreboardProps {
  playerScore: number;
  proScore: number;
  playerName?: string;
  proName?: string;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function Scoreboard({ 
  playerScore, 
  proScore, 
  playerName = 'Jij',
  proName = 'Pro',
  config 
}: ScoreboardProps) {
  const primaryColor = config?.primaryColor || '#3B82F6';
  const secondaryColor = config?.secondaryColor || '#10B981';
  const backgroundColor = config?.backgroundColor || '#F3F4F6';
  const textColor = config?.textColor || '#1F2937';
  
  const isAhead = playerScore >= proScore;
  const scoreDifference = Math.abs(playerScore - proScore);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Score Comparison */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Player Score */}
        <div 
          className="p-3 rounded-xl shadow-lg transition-all duration-300"
          style={{ 
            backgroundColor: isAhead ? secondaryColor : backgroundColor,
            color: isAhead ? 'white' : textColor
          }}
        >
          <div className="text-xs font-medium opacity-80 mb-1">{playerName}</div>
          <div className="text-3xl font-bold">{playerScore}</div>
        </div>
        
        {/* Pro Score */}
        <div 
          className="p-3 rounded-xl shadow-lg transition-all duration-300"
          style={{ 
            backgroundColor: !isAhead ? secondaryColor : backgroundColor,
            color: !isAhead ? 'white' : textColor
          }}
        >
          <div className="text-xs font-medium opacity-80 mb-1">{proName}</div>
          <div className="text-3xl font-bold">{proScore}</div>
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="text-center">
        <div 
          className="inline-block px-3 py-1 rounded-full font-semibold text-xs transition-all duration-300"
          style={{ 
            backgroundColor: isAhead ? secondaryColor : primaryColor,
            color: 'white'
          }}
        >
          {isAhead ? (
            <>🔥 +{scoreDifference}</>
          ) : scoreDifference === 0 ? (
            <>⚡ Gelijk!</>
          ) : (
            <>💪 -{scoreDifference}</>
          )}
        </div>
      </div>
    </div>
  );
}
