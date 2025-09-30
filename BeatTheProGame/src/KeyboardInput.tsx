'use client';

import React, { useEffect, useState } from 'react';

interface KeyboardInputProps {
  currentTargetKey: string;
  onCorrectKey: () => void;
  onWrongKey: () => void;
  isActive: boolean;
  streak: number;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    errorColor?: string;
  };
}

export default function KeyboardInput({ 
  currentTargetKey, 
  onCorrectKey, 
  onWrongKey, 
  isActive, 
  streak,
  config 
}: KeyboardInputProps) {
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  
  const primaryColor = config?.primaryColor || '#3B82F6';
  const secondaryColor = config?.secondaryColor || '#8B5CF6';
  const accentColor = config?.accentColor || '#10B981';
  const errorColor = config?.errorColor || '#EF4444';

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for some keys
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
      }
      
      // Track pressed keys for combinations
      const keyDisplay = event.code === 'Space' ? 'SPACE' : 
                         event.code.startsWith('Shift') ? 'SHIFT' :
                         event.code.startsWith('Control') ? 'CTRL' :
                         event.key.toUpperCase();
      
      setPressedKeys(prev => new Set(prev).add(keyDisplay));
      
      // Build current combination
      const currentCombo = Array.from(pressedKeys).concat(keyDisplay).sort().join('+');
      const displayCombo = keyDisplay;
      
      setLastPressedKey(displayCombo);
      
      // Check if it's a combination target
      let isKeyCorrect = false;
      if (currentTargetKey.includes('+')) {
        // Target is a combination
        const targetKeys = currentTargetKey.split('+').sort().join('+');
        isKeyCorrect = currentCombo === targetKeys;
      } else {
        // Single key target
        isKeyCorrect = keyDisplay === currentTargetKey;
      }
      
      setIsCorrect(isKeyCorrect);
      
      if (isKeyCorrect) {
        // Trigger pulse effect
        setPulseEffect(true);
        setTimeout(() => {
          setPulseEffect(false);
          setIsCorrect(null);
          setLastPressedKey('');
          setPressedKeys(new Set());
        }, 300);
        
        onCorrectKey();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const keyDisplay = event.code === 'Space' ? 'SPACE' : 
                         event.code.startsWith('Shift') ? 'SHIFT' :
                         event.code.startsWith('Control') ? 'CTRL' :
                         event.key.toUpperCase();
      
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyDisplay);
        return newSet;
      });
      
      // If combination wasn't correct, trigger wrong key
      if (pressedKeys.size > 0 && !isCorrect) {
        setIsCorrect(false);
        setPulseEffect(true);
        setTimeout(() => {
          setPulseEffect(false);
          setIsCorrect(null);
          setLastPressedKey('');
        }, 300);
        onWrongKey();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, currentTargetKey, onCorrectKey, onWrongKey, pressedKeys, isCorrect]);

  if (!isActive) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⌨️</div>
        <div className="text-xl text-gray-600 font-medium">
          Klik op "Start Spel" om te beginnen!
        </div>
      </div>
    );
  }

  const displayColor = isCorrect === true ? accentColor : 
                       isCorrect === false ? errorColor : 
                       primaryColor;

  const isCombo = currentTargetKey.includes('+');
  const keySize = isCombo ? 'min-w-[160px] h-32 px-4' : 'w-32 h-32';
  const fontSize = isCombo ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl';

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Target Key Display - What player needs to press */}
      <div className="text-center">
        <div className="text-xs text-gray-600 font-medium mb-1">Druk op deze toets:</div>
        <div 
          className={`relative ${keySize} flex items-center justify-center rounded-2xl shadow-xl transition-all duration-200 ${
            pulseEffect ? 'scale-95' : 'scale-100'
          }`}
          style={{ 
            backgroundColor: displayColor,
            boxShadow: pulseEffect ? `0 0 40px ${displayColor}` : `0 8px 30px rgba(0,0,0,0.3)`,
            border: `3px solid ${pulseEffect ? 'white' : 'transparent'}`
          }}
        >
          <div className={`${fontSize} font-bold text-white break-words text-center px-2`}>
            {currentTargetKey}
          </div>
          
          {/* Ripple Effect */}
          {pulseEffect && (
            <div 
              className="absolute inset-0 rounded-3xl animate-ping"
              style={{ backgroundColor: displayColor, opacity: 0.4 }}
            />
          )}
        </div>
      </div>

      {/* Feedback Message */}
      {isCorrect !== null && (
        <div 
          className={`text-lg font-bold animate-fade-in transition-all duration-200`}
          style={{ color: isCorrect ? accentColor : errorColor }}
        >
          {isCorrect ? '✓ Correct!' : '✗ Fout!'}
        </div>
      )}

      {/* Streak Display */}
      {streak > 0 && (
        <div 
          className="px-4 py-2 rounded-full font-bold text-white text-sm animate-fade-in shadow-lg"
          style={{ backgroundColor: secondaryColor }}
        >
          🔥 Streak: {streak}
        </div>
      )}
    </div>
  );
}
