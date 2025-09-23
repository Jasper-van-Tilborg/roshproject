'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Game types
interface GameSymbol {
  id: string;
  type: 'key' | 'mouse' | 'esports';
  display: string;
  key: string;
  icon: string;
}

interface GameState {
  phase: 'start' | 'playing' | 'paused' | 'gameOver';
  score: number;
  lives: number;
  level: number;
  currentSymbol: GameSymbol | null;
  reactionTime: number;
  timeLeft: number;
  combo: number;
  streak: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

// Game symbols
const GAME_SYMBOLS: GameSymbol[] = [
  // WASD keys
  { id: 'w', type: 'key', display: 'W', key: 'KeyW', icon: '⬆️' },
  { id: 'a', type: 'key', display: 'A', key: 'KeyA', icon: '⬅️' },
  { id: 's', type: 'key', display: 'S', key: 'KeyS', icon: '⬇️' },
  { id: 'd', type: 'key', display: 'D', key: 'KeyD', icon: '➡️' },
  
  // Other keys
  { id: 'space', type: 'key', display: 'SPACE', key: 'Space', icon: '⏸️' },
  { id: 'shift', type: 'key', display: 'SHIFT', key: 'ShiftLeft', icon: '⬆️' },
  { id: 'ctrl', type: 'key', display: 'CTRL', key: 'ControlLeft', icon: '🔧' },
  
  // Mouse
  { id: 'click', type: 'mouse', display: 'CLICK', key: 'click', icon: '🖱️' },
  
  // E-sports symbols
  { id: 'headshot', type: 'esports', display: 'HEADSHOT', key: 'headshot', icon: '🎯' },
  { id: 'multikill', type: 'esports', display: 'MULTIKILL', key: 'multikill', icon: '⚡' },
  { id: 'ace', type: 'esports', display: 'ACE', key: 'ace', icon: '👑' },
];

// Pro scores (targets to beat)
const PRO_SCORES = {
  'Faker': { score: 2500, level: 15 },
  's1mple': { score: 2400, level: 14 },
  'ZywOo': { score: 2300, level: 13 },
  'TenZ': { score: 2200, level: 12 },
  'Shroud': { score: 2100, level: 11 },
};

export default function BeatThePro() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    score: 0,
    lives: 3,
    level: 1,
    currentSymbol: null,
    reactionTime: 0,
    timeLeft: 0,
    combo: 0,
    streak: 0,
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [symbolStartTime, setSymbolStartTime] = useState(0);

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('beatTheProLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // Game timing calculations
  const getReactionTimeLimit = useCallback((level: number) => {
    return Math.max(300, 800 - (level * 30)); // Gets faster each level
  }, []);

  const getSymbolInterval = useCallback((level: number) => {
    return Math.max(1000, 2000 - (level * 100)); // Symbols appear faster
  }, []);

  // Generate random symbol
  const generateRandomSymbol = useCallback((): GameSymbol => {
    const availableSymbols = GAME_SYMBOLS.filter(symbol => 
      symbol.id !== gameState.currentSymbol?.id
    );
    return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
  }, [gameState.currentSymbol]);

  // Calculate score based on reaction time
  const calculateScore = useCallback((reactionTime: number, level: number, combo: number) => {
    const baseScore = Math.max(10, 100 - Math.floor(reactionTime / 10));
    const levelMultiplier = 1 + (level * 0.1);
    const comboMultiplier = 1 + (combo * 0.05);
    return Math.floor(baseScore * levelMultiplier * comboMultiplier);
  }, []);

  // Handle symbol click/key press
  const handleSymbolAction = useCallback((symbol: GameSymbol) => {
    if (gameState.phase !== 'playing' || !gameState.currentSymbol) return;

    const reactionTime = Date.now() - symbolStartTime;
    const timeLimit = getReactionTimeLimit(gameState.level);

    if (reactionTime <= timeLimit) {
      // Success!
      const points = calculateScore(reactionTime, gameState.level, gameState.combo);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        combo: prev.combo + 1,
        streak: prev.streak + 1,
        reactionTime,
        currentSymbol: null,
      }));

      // Check for level up
      if (gameState.streak > 0 && gameState.streak % 10 === 0) {
        setGameState(prev => ({
          ...prev,
          level: prev.level + 1,
        }));
      }
    } else {
      // Too slow or wrong key
      setGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        combo: 0,
        streak: 0,
        currentSymbol: null,
      }));

      if (gameState.lives <= 1) {
        // Game over
        setGameState(prev => ({ ...prev, phase: 'gameOver' }));
        saveScore();
      }
    }
  }, [gameState, symbolStartTime, getReactionTimeLimit, calculateScore]);

  // Save score to leaderboard
  const saveScore = useCallback(() => {
    if (!playerName.trim()) return;

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: playerName.trim(),
      score: gameState.score,
      level: gameState.level,
      date: new Date().toISOString(),
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('beatTheProLeaderboard', JSON.stringify(updatedLeaderboard));
  }, [playerName, gameState.score, gameState.level, leaderboard]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.phase !== 'playing' || !gameState.currentSymbol) return;

      if (event.code === gameState.currentSymbol.key) {
        event.preventDefault();
        handleSymbolAction(gameState.currentSymbol);
      }
    };

    const handleClick = () => {
      if (gameState.phase !== 'playing' || !gameState.currentSymbol) return;

      if (gameState.currentSymbol.type === 'mouse') {
        handleSymbolAction(gameState.currentSymbol);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClick);
    };
  }, [gameState, handleSymbolAction]);

  // Game loop
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const interval = setInterval(() => {
      if (gameState.currentSymbol) {
        // Symbol is showing, check if time ran out
        const timeElapsed = Date.now() - symbolStartTime;
        const timeLimit = getReactionTimeLimit(gameState.level);

        if (timeElapsed > timeLimit) {
          // Time ran out
          setGameState(prev => ({
            ...prev,
            lives: prev.lives - 1,
            combo: 0,
            streak: 0,
            currentSymbol: null,
          }));

          if (gameState.lives <= 1) {
            setGameState(prev => ({ ...prev, phase: 'gameOver' }));
            saveScore();
          }
        }
      } else {
        // Show new symbol
        const newSymbol = generateRandomSymbol();
        setGameState(prev => ({ ...prev, currentSymbol: newSymbol }));
        setSymbolStartTime(Date.now());
      }
    }, getSymbolInterval(gameState.level));

    return () => clearInterval(interval);
  }, [gameState, symbolStartTime, getReactionTimeLimit, getSymbolInterval, generateRandomSymbol, saveScore]);

  // Start game
  const startGame = () => {
    if (!playerName.trim()) {
      alert('Voer eerst je naam in!');
      return;
    }

    setGameState({
      phase: 'playing',
      score: 0,
      lives: 3,
      level: 1,
      currentSymbol: null,
      reactionTime: 0,
      timeLeft: 0,
      combo: 0,
      streak: 0,
    });
    setGameStartTime(Date.now());
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      phase: 'start',
      score: 0,
      lives: 3,
      level: 1,
      currentSymbol: null,
      reactionTime: 0,
      timeLeft: 0,
      combo: 0,
      streak: 0,
    });
  };

  // Share score
  const shareScore = () => {
    const text = `Ik heb ${gameState.score} reflex-punten gescoord in Beat the Pro! 🎮⚡ Kan jij me verslaan?`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Score gekopieerd naar klembord!');
    }
  };

  // Get pro to beat
  const getProToBeat = () => {
    const proNames = Object.keys(PRO_SCORES);
    const randomPro = proNames[Math.floor(Math.random() * proNames.length)];
    return { name: randomPro, ...PRO_SCORES[randomPro as keyof typeof PRO_SCORES] };
  };

  const currentPro = getProToBeat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚡ Beat the Pro
          </h1>
          <p className="text-xl text-blue-200 mb-2">
            Test je reflexen als een echte e-sporter!
          </p>
          <p className="text-lg text-blue-300">
            Probeer <span className="font-bold text-yellow-400">{currentPro.name}</span> te verslaan ({currentPro.score} punten)
          </p>
        </div>

        {/* Game Area */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-8">
          {gameState.phase === 'start' && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">🎮 Start de Challenge</h2>
                <div className="max-w-md mx-auto">
                  <label className="block text-white text-lg mb-2">Je naam:</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Voer je naam in..."
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-3">🎯 Hoe werkt het?</h3>
                  <ul className="text-blue-200 space-y-2 text-left">
                    <li>• Symbolen verschijnen op het scherm</li>
                    <li>• Klik/druk snel op de juiste toets</li>
                    <li>• Reactietijd: {getReactionTimeLimit(1)}ms</li>
                    <li>• 3 levens, elke miss = -1 leven</li>
                    <li>• Combo's geven bonus punten!</li>
                  </ul>
                </div>

                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-3">🏆 Pro Targets</h3>
                  <div className="space-y-2 text-left">
                    {Object.entries(PRO_SCORES).map(([name, data]) => (
                      <div key={name} className="flex justify-between text-blue-200">
                        <span>{name}:</span>
                        <span className="font-bold text-yellow-400">{data.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                🚀 Start Game
              </button>
            </div>
          )}

          {gameState.phase === 'playing' && (
            <div className="text-center">
              {/* Game Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{gameState.score}</div>
                  <div className="text-blue-200">Score</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{gameState.lives}</div>
                  <div className="text-blue-200">Levens</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{gameState.level}</div>
                  <div className="text-blue-200">Level</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{gameState.combo}</div>
                  <div className="text-blue-200">Combo</div>
                </div>
              </div>

              {/* Current Symbol */}
              {gameState.currentSymbol && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-12 mx-auto max-w-md">
                    <div className="text-8xl mb-4">{gameState.currentSymbol.icon}</div>
                    <div className="text-4xl font-bold text-white mb-2">
                      {gameState.currentSymbol.display}
                    </div>
                    <div className="text-lg text-white/80">
                      {gameState.currentSymbol.type === 'key' && 'Druk op de toets'}
                      {gameState.currentSymbol.type === 'mouse' && 'Klik met de muis'}
                      {gameState.currentSymbol.type === 'esports' && 'Klik hier!'}
                    </div>
                  </div>
                  
                  {/* Reaction Timer */}
                  <div className="mt-4">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full transition-all duration-100"
                        style={{ 
                          width: `${Math.max(0, 100 - ((Date.now() - symbolStartTime) / getReactionTimeLimit(gameState.level)) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-white/60 text-sm mt-2">
                      {getReactionTimeLimit(gameState.level)}ms reactietijd
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center text-white/60">
                <p>Druk op de juiste toets of klik wanneer gevraagd!</p>
              </div>
            </div>
          )}

          {gameState.phase === 'gameOver' && (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">🎮 Game Over!</h2>
              
              <div className="bg-white/10 rounded-lg p-8 mb-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-3xl font-bold text-white mb-2">{gameState.score}</div>
                <div className="text-blue-200 mb-4">Finale Score</div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{gameState.level}</div>
                    <div className="text-blue-200">Level</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{gameState.streak}</div>
                    <div className="text-blue-200">Best Streak</div>
                  </div>
                </div>
              </div>

              {/* Beat Pro Check */}
              {gameState.score >= currentPro.score && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-8 max-w-md mx-auto">
                  <div className="text-4xl mb-2">👑</div>
                  <div className="text-2xl font-bold text-white mb-2">PRO VERSLAAN!</div>
                  <div className="text-white">
                    Je hebt <span className="font-bold">{currentPro.name}</span> verslagen!
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  🔄 Opnieuw Spelen
                </button>
                <button
                  onClick={shareScore}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  📱 Deel Score
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nog geen scores! Wees de eerste! 🎮
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200' :
                      'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{entry.name}</div>
                          <div className="text-sm text-gray-500">Level {entry.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{entry.score}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
