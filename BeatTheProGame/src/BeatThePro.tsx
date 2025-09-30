'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Timer from './Timer';
import Scoreboard from './Scoreboard';
import KeyboardInput from './KeyboardInput';
import Result from './Result';

export interface BeatTheProConfig {
  // Game Settings
  gameDuration?: number; // in seconds
  proScore?: number;
  proName?: string;
  playerName?: string;
  availableKeys?: string[]; // Custom keys to use in the game
  enableKeyCombinations?: boolean; // Enable key combinations like "W+A"
  
  // Styling
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  winColor?: string;
  loseColor?: string;
  
  // Callbacks
  onGameEnd?: (playerScore: number, hasWon: boolean) => void;
  onBackToDashboard?: () => void;
  
  // Display
  title?: string;
  subtitle?: string;
  showInstructions?: boolean;
}

type GamePhase = 'start' | 'playing' | 'finished';

// Default available keys
const DEFAULT_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'W', 'E', 'R', 'Q', 'Z', 'X', 'C', 'V', 'SPACE'];

// Key combinations for advanced difficulty
const KEY_COMBINATIONS = [
  'W+A', 'W+D', 'S+A', 'S+D',
  'SHIFT+W', 'SHIFT+A', 'SHIFT+S', 'SHIFT+D',
  'A+D', 'Q+E', 'Z+X',
];

export default function BeatThePro({ config = {} }: { config?: BeatTheProConfig }) {
  // Extract config with defaults
  const {
    gameDuration = 30,
    proScore = 100,
    proName = 'Pro',
    playerName = 'Jij',
    availableKeys = DEFAULT_KEYS,
    enableKeyCombinations = false,
    primaryColor = '#3B82F6',
    secondaryColor = '#8B5CF6',
    accentColor = '#F59E0B',
    backgroundColor = '#FFFFFF',
    textColor = '#1F2937',
    winColor = '#10B981',
    loseColor = '#EF4444',
    title = 'Beat the Pro',
    subtitle = 'Druk de juiste toetsen in zo snel mogelijk!',
    showInstructions = true,
    onGameEnd,
    onBackToDashboard,
  } = config;

  // Combine single keys with combinations if enabled
  const allAvailableKeys = enableKeyCombinations 
    ? [...availableKeys, ...KEY_COMBINATIONS]
    : availableKeys;

  // Game State
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [playerScore, setPlayerScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [currentTargetKey, setCurrentTargetKey] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  // Generate random key
  const generateRandomKey = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * allAvailableKeys.length);
    return allAvailableKeys[randomIndex];
  }, [allAvailableKeys]);

  // Start Game
  const startGame = useCallback(() => {
    setGamePhase('playing');
    setPlayerScore(0);
    setTimeLeft(gameDuration);
    setStreak(0);
    setMistakes(0);
    setCurrentTargetKey(generateRandomKey());
  }, [gameDuration, generateRandomKey]);

  // Reset Game
  const resetGame = useCallback(() => {
    setGamePhase('start');
    setPlayerScore(0);
    setTimeLeft(gameDuration);
    setStreak(0);
    setMistakes(0);
    setCurrentTargetKey('');
  }, [gameDuration]);

  // Handle Correct Key Press
  const handleCorrectKey = useCallback(() => {
    if (gamePhase === 'playing') {
      const streakBonus = Math.floor(streak / 5); // Bonus every 5 streak
      setPlayerScore(prev => prev + 1 + streakBonus);
      setStreak(prev => prev + 1);
      // Generate new target key
      setCurrentTargetKey(generateRandomKey());
    }
  }, [gamePhase, streak, generateRandomKey]);

  // Handle Wrong Key Press
  const handleWrongKey = useCallback(() => {
    if (gamePhase === 'playing') {
      setStreak(0); // Reset streak on mistake
      setMistakes(prev => prev + 1);
      // Don't change the target key - player must press the correct one
    }
  }, [gamePhase]);

  // Game Timer
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    if (timeLeft <= 0) {
      setGamePhase('finished');
      const hasWon = playerScore >= proScore;
      onGameEnd?.(playerScore, hasWon);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft, playerScore, proScore, onGameEnd]);

  return (
    <div 
      className="h-screen w-full overflow-hidden flex flex-col"
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
          <h1 
            className="text-2xl sm:text-3xl font-bold mb-1"
            style={{ color: primaryColor }}
          >
            {title}
          </h1>
          <p 
            className="text-sm sm:text-base"
            style={{ color: textColor, opacity: 0.8 }}
          >
            {subtitle}
          </p>
        </div>

        {/* Start Screen */}
        {gamePhase === 'start' && (
          <div className="text-center flex-1 flex flex-col justify-between overflow-hidden py-2">
            {/* Instructions - Compact Grid Layout */}
            {showInstructions && (
              <div 
                className="max-w-4xl mx-auto p-4 rounded-xl shadow-lg"
                style={{ backgroundColor: '#F9FAFB' }}
              >
                <h2 
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  📋 Spelregels
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left text-xs" style={{ color: textColor }}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⏱️</span>
                    <div>
                      <div className="font-semibold">{gameDuration}s Tijd</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⌨️</span>
                    <div>
                      <div className="font-semibold">Juiste Toets</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <div className="font-semibold">Score {proScore}+</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <div className="font-semibold">Streak Bonus</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-semibold">Fout = Reset</div>
                    </div>
                  </div>
                  {enableKeyCombinations && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🎮</span>
                      <div>
                        <div className="font-semibold">Combinaties</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pro Score Preview - Compact */}
            <div className="max-w-sm mx-auto my-4">
              <div 
                className="p-4 rounded-xl shadow-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                <div className="text-white">
                  <div className="text-xs font-medium opacity-90 mb-1">Te Verslaan</div>
                  <div className="text-4xl font-bold mb-1">{proScore}</div>
                  <div className="text-xs opacity-90">door {proName}</div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl text-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl mx-auto"
              style={{ backgroundColor: primaryColor }}
            >
              🚀 Start Spel
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {gamePhase === 'playing' && (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            {/* Timer */}
            <Timer 
              timeLeft={timeLeft}
              totalTime={gameDuration}
              isRunning={true}
              config={{ primaryColor, secondaryColor }}
            />

            {/* Scoreboard */}
            <Scoreboard
              playerScore={playerScore}
              proScore={proScore}
              playerName={playerName}
              proName={proName}
              config={{ primaryColor, secondaryColor, backgroundColor, textColor }}
            />

            {/* Keyboard Input */}
            <KeyboardInput
              currentTargetKey={currentTargetKey}
              onCorrectKey={handleCorrectKey}
              onWrongKey={handleWrongKey}
              isActive={true}
              streak={streak}
              config={{ primaryColor, secondaryColor, accentColor, errorColor: loseColor }}
            />
          </div>
        )}

        {/* Result Screen */}
        {gamePhase === 'finished' && (
          <div className="flex-1 overflow-y-auto">
            <Result
            playerScore={playerScore}
            proScore={proScore}
            playerName={playerName}
            proName={proName}
            mistakes={mistakes}
            onRestart={resetGame}
            onBackToDashboard={onBackToDashboard}
            config={{ primaryColor, secondaryColor, winColor, loseColor }}
          />
          </div>
        )}
      </div>
    </div>
  );
}
