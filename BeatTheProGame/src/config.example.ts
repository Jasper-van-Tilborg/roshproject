import { BeatTheProConfig } from './BeatThePro';

/**
 * Voorbeeld Configuraties voor Beat the Pro
 * Kopieer een van deze configuraties en pas aan naar wens
 */

// Default Configuratie - Blauw Theme
export const defaultConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  proName: 'Pro Gamer',
  playerName: 'Speler',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  accentColor: '#F59E0B',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  winColor: '#10B981',
  loseColor: '#EF4444',
  title: 'Beat the Pro',
  subtitle: 'Druk zo snel mogelijk op toetsen en versla de pro!',
  showInstructions: true,
};

// E-Sports Tournament Theme - Groen/Zwart
export const esportsConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 120,
  proName: 'Tournament Champion',
  playerName: 'Challenger',
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  accentColor: '#FBBF24',
  backgroundColor: '#111827',
  textColor: '#F9FAFB',
  winColor: '#34D399',
  loseColor: '#F87171',
  title: 'E-Sports Speed Challenge',
  subtitle: 'Prove your reflexes against the champion!',
  showInstructions: true,
};

// Corporate Theme - Professional Blauw
export const corporateConfig: BeatTheProConfig = {
  gameDuration: 45,
  proScore: 80,
  proName: 'Company Record',
  playerName: 'Employee',
  primaryColor: '#0044cc',
  secondaryColor: '#ff6600',
  accentColor: '#FFD700',
  backgroundColor: '#F5F5F5',
  textColor: '#333333',
  winColor: '#28a745',
  loseColor: '#dc3545',
  title: 'Team Building Challenge',
  subtitle: 'Beat the company record and win prizes!',
  showInstructions: true,
};

// Hardcore Mode - Moeilijk
export const hardcoreConfig: BeatTheProConfig = {
  gameDuration: 20,
  proScore: 150,
  proName: 'Elite Pro',
  playerName: 'Hardcore Player',
  primaryColor: '#DC2626',
  secondaryColor: '#991B1B',
  accentColor: '#F59E0B',
  backgroundColor: '#1F2937',
  textColor: '#F9FAFB',
  winColor: '#10B981',
  loseColor: '#7F1D1D',
  title: 'Hardcore Challenge',
  subtitle: 'Only the fastest survive!',
  showInstructions: true,
};

// Beginner Friendly - Makkelijk
export const beginnerConfig: BeatTheProConfig = {
  gameDuration: 60,
  proScore: 60,
  proName: 'Training Bot',
  playerName: 'New Player',
  primaryColor: '#60A5FA',
  secondaryColor: '#A78BFA',
  accentColor: '#FCD34D',
  backgroundColor: '#FFFFFF',
  textColor: '#374151',
  winColor: '#34D399',
  loseColor: '#FCA5A5',
  title: 'Practice Mode',
  subtitle: 'Take your time and improve your speed!',
  showInstructions: true,
};

// Dark Mode Theme
export const darkModeConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  proName: 'Night Owl Pro',
  playerName: 'Dark Knight',
  primaryColor: '#8B5CF6',
  secondaryColor: '#6366F1',
  accentColor: '#EC4899',
  backgroundColor: '#0F172A',
  textColor: '#E2E8F0',
  winColor: '#10B981',
  loseColor: '#EF4444',
  title: 'Midnight Challenge',
  subtitle: 'Speed typing in the dark!',
  showInstructions: true,
};

// Rainbow Theme - Kleurrijk
export const rainbowConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  proName: 'Rainbow Master',
  playerName: 'Color Champion',
  primaryColor: '#EC4899',
  secondaryColor: '#8B5CF6',
  accentColor: '#F59E0B',
  backgroundColor: '#FDF2F8',
  textColor: '#831843',
  winColor: '#10B981',
  loseColor: '#EF4444',
  title: 'Rainbow Rush',
  subtitle: 'Colorful speed challenge!',
  showInstructions: true,
};

// Minimalist Theme - Simpel en Clean
export const minimalistConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  proName: 'Pro',
  playerName: 'You',
  primaryColor: '#000000',
  secondaryColor: '#4B5563',
  accentColor: '#6B7280',
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  winColor: '#000000',
  loseColor: '#6B7280',
  title: 'Speed Test',
  subtitle: 'Simple. Fast. Clean.',
  showInstructions: false,
};

// ============================================
// CUSTOM KEY CONFIGURATIONS
// ============================================

// Only WASD Keys - Gaming Style
export const wasdOnlyConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 80,
  proName: 'Gamer',
  playerName: 'Player',
  availableKeys: ['W', 'A', 'S', 'D'],
  primaryColor: '#8B5CF6',
  secondaryColor: '#6366F1',
  accentColor: '#EC4899',
  title: 'WASD Challenge',
  subtitle: 'Gaming keys only!',
};

// Home Row Keys - Touch Typing
export const homeRowConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  availableKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  title: 'Home Row Master',
  subtitle: 'Touch typing training!',
};

// Numbers Only
export const numbersOnlyConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 90,
  availableKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  primaryColor: '#F59E0B',
  secondaryColor: '#D97706',
  title: 'Number Sprint',
  subtitle: 'Numbers only challenge!',
};

// Letters Only (No Space)
export const lettersOnlyConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  availableKeys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  title: 'Alphabet Challenge',
  subtitle: 'All letters in play!',
};

// Easy Mode - Few Keys
export const easyKeysConfig: BeatTheProConfig = {
  gameDuration: 45,
  proScore: 60,
  availableKeys: ['A', 'S', 'D', 'F', 'SPACE'],
  primaryColor: '#60A5FA',
  title: 'Easy Mode',
  subtitle: 'Only 5 keys to master!',
};

// Hard Mode - Many Keys
export const hardKeysConfig: BeatTheProConfig = {
  gameDuration: 20,
  proScore: 150,
  availableKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE'],
  primaryColor: '#DC2626',
  title: 'Hard Mode',
  subtitle: 'All keyboard keys!',
};

// Arrow Keys Only
export const arrowKeysConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 80,
  availableKeys: ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'],
  primaryColor: '#6366F1',
  title: 'Arrow Keys Challenge',
  subtitle: 'Navigate with arrows!',
};

// Custom Dutch Characters (example)
export const dutchConfig: BeatTheProConfig = {
  gameDuration: 30,
  proScore: 100,
  availableKeys: ['A', 'E', 'I', 'O', 'U', 'N', 'D', 'R', 'T', 'S', 'L', 'SPACE'],
  title: 'Nederlandse Toetsen',
  subtitle: 'Meest gebruikte letters!',
};
