/**
 * Beat the Pro Game - Volledig Voorbeeld
 * 
 * Dit bestand laat zien hoe je het spel in je project integreert
 */

'use client'; // Next.js App Router - verwijder deze regel voor andere frameworks

import BeatThePro, { type BeatTheProConfig } from '../index';
// Of: import BeatThePro from '@/components/BeatTheProGame';

export default function BeatTheProGamePage() {
  // Basis configuratie
  const config: BeatTheProConfig = {
    // Game Settings
    gameDuration: 30,
    proScore: 100,
    proName: 'Pro Gamer',
    playerName: 'Speler',
    
    // Custom Keys - Pas aan naar wens!
    availableKeys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'SPACE'],
    // Andere voorbeelden:
    // availableKeys: ['W', 'A', 'S', 'D'],  // Alleen WASD
    // availableKeys: ['1', '2', '3', '4', '5'],  // Nummers
    
    // Styling - Whitelabel kleuren
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    winColor: '#10B981',
    loseColor: '#EF4444',
    
    // Display
    title: 'Beat the Pro',
    subtitle: 'Druk de juiste toetsen in zo snel mogelijk!',
    showInstructions: true,
    
    // Callbacks
    onGameEnd: (playerScore, hasWon) => {
      console.log('Game ended!', { playerScore, hasWon });
      
      // Voorbeelden van wat je hier kunt doen:
      
      // 1. Opslaan in localStorage
      const gameResult = {
        score: playerScore,
        won: hasWon,
        timestamp: new Date().toISOString(),
      };
      const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
      results.push(gameResult);
      localStorage.setItem('gameResults', JSON.stringify(results));
      
      // 2. Versturen naar API
      // fetch('/api/game-results', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(gameResult),
      // });
      
      // 3. Analytics tracking
      // gtag('event', 'game_complete', {
      //   score: playerScore,
      //   won: hasWon,
      // });
      
      // 4. Show custom notification
      // if (hasWon) {
      //   toast.success('Je hebt gewonnen!');
      // }
    },
    
    onBackToDashboard: () => {
      // Voor Next.js:
      // router.push('/dashboard');
      
      // Voor andere frameworks:
      // navigate('/dashboard');
      // of: window.location.href = '/dashboard';
      
      console.log('Back to dashboard clicked');
    },
  };

  return (
    <div className="min-h-screen">
      <BeatThePro config={config} />
    </div>
  );
}

// ============================================
// ANDERE GEBRUIK VOORBEELDEN
// ============================================

/**
 * Voorbeeld 1: Minimale Setup
 */
export function MinimalExample() {
  return <BeatThePro />;
}

/**
 * Voorbeeld 2: WASD Gaming Mode
 */
export function WASDGameExample() {
  return (
    <BeatThePro 
      config={{
        availableKeys: ['W', 'A', 'S', 'D'],
        title: 'WASD Challenge',
        proScore: 80,
        primaryColor: '#8B5CF6',
      }}
    />
  );
}

/**
 * Voorbeeld 3: Touch Typing Trainer
 */
export function TouchTypingExample() {
  return (
    <BeatThePro 
      config={{
        availableKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
        gameDuration: 45,
        proScore: 90,
        title: 'Home Row Master',
        subtitle: 'Touch typing oefening',
        primaryColor: '#10B981',
      }}
    />
  );
}

/**
 * Voorbeeld 4: Met Preset Config
 */
// import { wasdOnlyConfig } from '@/components/BeatTheProGame/src/config.example';
// 
// export function PresetExample() {
//   return <BeatThePro config={wasdOnlyConfig} />;
// }

/**
 * Voorbeeld 5: Dark Mode
 */
export function DarkModeExample() {
  return (
    <BeatThePro 
      config={{
        primaryColor: '#8B5CF6',
        secondaryColor: '#6366F1',
        accentColor: '#EC4899',
        backgroundColor: '#0F172A',
        textColor: '#E2E8F0',
        title: 'Midnight Challenge',
      }}
    />
  );
}

/**
 * Voorbeeld 6: Embedded in andere component
 */
export function EmbeddedExample() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Mijn Game Pagina</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            {/* Your leaderboard component */}
          </div>
        </div>
        
        {/* Game */}
        <div className="lg:col-span-2">
          <BeatThePro 
            config={{
              backgroundColor: 'transparent',
              showInstructions: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
