'use client';

// TIJDELIJKE TEST PAGINA - Verwijder na testen!
import { BeatThePro } from '../../BeatTheProGame';

export default function TestGamePage() {
  return (
    <BeatThePro 
      config={{
        gameDuration: 30,
        proScore: 100,
        availableKeys: ['W', 'A', 'S', 'D', 'F', 'J', 'K', 'L', 'SPACE'],
        enableKeyCombinations: true, // 🔥 Key combinaties ingeschakeld!
        title: 'Beat the Pro - TEST',
        subtitle: 'Met key combinaties! Druk bijv. W+A tegelijk in',
        primaryColor: '#3B82F6',
      }}
    />
  );
}
