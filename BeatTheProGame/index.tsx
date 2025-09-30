/**
 * Beat the Pro Game - Portable Package
 * Version 1.0.0
 * 
 * A whitelabel keyboard reaction speed game component
 * that can be easily integrated into any React/Next.js project
 */

export { default as BeatThePro } from './src/BeatThePro';
export type { BeatTheProConfig } from './src/BeatThePro';

// Export sub-components for advanced use cases
export { default as Timer } from './src/Timer';
export { default as Scoreboard } from './src/Scoreboard';
export { default as KeyboardInput } from './src/KeyboardInput';
export { default as Result } from './src/Result';

// Export example configurations
export * from './src/config.example';
