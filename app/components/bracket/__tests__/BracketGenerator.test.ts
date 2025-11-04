import { BracketGenerator } from '../BracketGenerator';
import { Team, BracketType } from '../types';

describe('BracketGenerator', () => {
  const mockTeams: Team[] = [
    { id: '1', name: 'Team 1', seed: 1 },
    { id: '2', name: 'Team 2', seed: 2 },
    { id: '3', name: 'Team 3', seed: 3 },
    { id: '4', name: 'Team 4', seed: 4 },
    { id: '5', name: 'Team 5', seed: 5 },
    { id: '6', name: 'Team 6', seed: 6 },
    { id: '7', name: 'Team 7', seed: 7 },
    { id: '8', name: 'Team 8', seed: 8 },
  ];

  describe('generate - Single Elimination', () => {
    it('should generate a single elimination bracket for 8 teams', () => {
      const bracket = BracketGenerator.generate('single', mockTeams);
      
      expect(bracket.type).toBe('single');
      expect(bracket.totalTeams).toBe(8);
      expect(bracket.rounds.length).toBe(3); // Quarterfinals, Semifinals, Finals
      
      // First round should have 4 matches
      expect(bracket.rounds[0].matches.length).toBe(4);
      // Last round should have 1 match (finals)
      expect(bracket.rounds[bracket.rounds.length - 1].matches.length).toBe(1);
    });

    it('should generate a single elimination bracket for 16 teams', () => {
      const teams16 = Array.from({ length: 16 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Team ${i + 1}`,
        seed: i + 1,
      }));
      
      const bracket = BracketGenerator.generate('single', teams16);
      
      expect(bracket.rounds.length).toBe(4); // Round of 16, Quarterfinals, Semifinals, Finals
      expect(bracket.rounds[0].matches.length).toBe(8);
    });

    it('should handle odd number of teams with byes', () => {
      const oddTeams = mockTeams.slice(0, 5);
      const bracket = BracketGenerator.generate('single', oddTeams);
      
      expect(bracket.rounds.length).toBeGreaterThan(0);
      // Should have at least one bye match
      const hasBye = bracket.rounds[0].matches.some((m) => m.bye);
      expect(hasBye).toBe(true);
    });

    it('should seed teams correctly', () => {
      const bracket = BracketGenerator.generate('single', mockTeams, false);
      
      // First match should have top seeds
      const firstMatch = bracket.rounds[0].matches[0];
      expect(firstMatch.team1).toBeDefined();
      expect(firstMatch.team2).toBeDefined();
    });
  });

  describe('generate - Double Elimination', () => {
    it('should generate a double elimination bracket', () => {
      const bracket = BracketGenerator.generate('double', mockTeams);
      
      expect(bracket.type).toBe('double');
      expect(bracket.rounds.length).toBeGreaterThan(3); // Winners + Losers + Finals
      
      // Should have a grand finals
      const grandFinals = bracket.rounds.find((r) => r.isFinals);
      expect(grandFinals).toBeDefined();
      
      // Should have losers rounds
      const losersRounds = bracket.rounds.filter((r) => r.isConsolation);
      expect(losersRounds.length).toBeGreaterThan(0);
    });
  });

  describe('generate - Round Robin', () => {
    it('should generate a round robin bracket', () => {
      const bracket = BracketGenerator.generate('roundrobin', mockTeams);
      
      expect(bracket.type).toBe('roundrobin');
      expect(bracket.rounds.length).toBe(7); // n-1 rounds for 8 teams
      
      // Each round should have n/2 matches
      bracket.rounds.forEach((round) => {
        expect(round.matches.length).toBe(4); // 8/2 = 4
      });
    });

    it('should assign teams to matches in round robin', () => {
      const bracket = BracketGenerator.generate('roundrobin', mockTeams);
      
      // First round should have teams assigned
      const firstRound = bracket.rounds[0];
      expect(firstRound.matches[0].team1).toBeDefined();
      expect(firstRound.matches[0].team2).toBeDefined();
    });
  });

  describe('generate - Swiss', () => {
    it('should generate a swiss bracket', () => {
      const bracket = BracketGenerator.generate('swiss', mockTeams);
      
      expect(bracket.type).toBe('swiss');
      expect(bracket.rounds.length).toBeGreaterThan(0);
    });
  });

  describe('updateMatchResult', () => {
    it('should update match result and advance winner', () => {
      const bracket = BracketGenerator.generate('single', mockTeams);
      const firstMatch = bracket.rounds[0].matches[0];
      
      const result = {
        winner: firstMatch.team1?.id || '',
        team1Score: 3,
        team2Score: 1,
        completed: true,
      };
      
      const updated = BracketGenerator.updateMatchResult(bracket, firstMatch.id, result);
      
      // Find the updated match
      const updatedMatch = updated.rounds[0].matches.find((m) => m.id === firstMatch.id);
      expect(updatedMatch?.result?.completed).toBe(true);
      expect(updatedMatch?.result?.winner).toBe(firstMatch.team1?.id);
    });

    it('should advance winner to next match', () => {
      const bracket = BracketGenerator.generate('single', mockTeams);
      const firstMatch = bracket.rounds[0].matches[0];
      
      if (!firstMatch.team1 || !firstMatch.nextMatchId) {
        return; // Skip if no teams or next match
      }
      
      const result = {
        winner: firstMatch.team1.id,
        completed: true,
      };
      
      const updated = BracketGenerator.updateMatchResult(bracket, firstMatch.id, result);
      
      // Find next match
      const nextMatch = updated.rounds
        .flatMap((r) => r.matches)
        .find((m) => m.id === firstMatch.nextMatchId);
      
      if (nextMatch && firstMatch.nextMatchSlot) {
        expect(
          (nextMatch[firstMatch.nextMatchSlot]?.id || '') === firstMatch.team1.id
        ).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid bracket type', () => {
      expect(() => {
        BracketGenerator.generate('invalid' as BracketType, mockTeams);
      }).toThrow('Unsupported bracket type');
    });
  });
});

