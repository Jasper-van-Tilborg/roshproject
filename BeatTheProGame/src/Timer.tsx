'use client';

import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: string;
  };
}

export default function Timer({ timeLeft, totalTime, isRunning, config }: TimerProps) {
  const primaryColor = config?.primaryColor || '#3B82F6';
  const secondaryColor = config?.secondaryColor || '#EF4444';
  const fontSize = config?.fontSize || '4rem';
  
  const percentage = (timeLeft / totalTime) * 100;
  const isLowTime = percentage < 20;
  
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Timer Display */}
      <div 
        className={`font-bold transition-all duration-300 ${isLowTime && isRunning ? 'animate-pulse' : ''}`}
        style={{ 
          fontSize: '2.5rem',
          color: isLowTime ? secondaryColor : primaryColor 
        }}
      >
        {timeLeft}s
      </div>
      
      {/* Progress Bar */}
      <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isLowTime ? secondaryColor : primaryColor
          }}
        />
      </div>
    </div>
  );
}
