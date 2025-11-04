import { Team, Match, Round, BracketData, BracketType, MatchResult } from './types';

export class BracketGenerator {
  /**
   * Generate bracket data based on bracket type and teams
   */
  static generate(
    type: BracketType,
    teams: Team[],
    seeded: boolean = false
  ): BracketData {
    switch (type) {
      case 'single':
        return this.generateSingleElimination(teams, seeded);
      case 'double':
        return this.generateDoubleElimination(teams, seeded);
      case 'roundrobin':
        return this.generateRoundRobin(teams);
      case 'swiss':
        return this.generateSwiss(teams);
      default:
        throw new Error(`Unsupported bracket type: ${type}`);
    }
  }

  /**
   * Generate single elimination bracket
   */
  private static generateSingleElimination(
    teams: Team[],
    seeded: boolean
  ): BracketData {
    const processedTeams = seeded ? [...teams] : this.seedTeams(teams);
    const numTeams = processedTeams.length;
    const rounds = Math.ceil(Math.log2(numTeams)) || 1;
    const bracketSize = Math.pow(2, rounds);
    
    const roundsData: Round[] = [];
    
    // First round - include byes if needed
    const firstRoundMatches: Match[] = [];
    let matchIndex = 0;
    
    for (let i = 0; i < bracketSize; i += 2) {
      const team1 = processedTeams[i] || null;
      const team2 = processedTeams[i + 1] || null;
      const isBye = !team1 || !team2;
      
      const match: Match = {
        id: `round-0-match-${matchIndex}`,
        roundId: 'round-0',
        roundIndex: 0,
        matchIndex: matchIndex++,
        team1: team1,
        team2: team2,
        bye: isBye,
        result: {},
      };
      
      firstRoundMatches.push(match);
    }
    
    roundsData.push({
      id: 'round-0',
      roundIndex: 0,
      name: this.getRoundName(rounds, 0),
      matches: firstRoundMatches,
    });
    
    // Generate subsequent rounds
    for (let round = 1; round < rounds; round++) {
      const prevRoundMatches = roundsData[round - 1].matches;
      const matches: Match[] = [];
      
      for (let i = 0; i < prevRoundMatches.length; i += 2) {
        const match: Match = {
          id: `round-${round}-match-${Math.floor(i / 2)}`,
          roundId: `round-${round}`,
          roundIndex: round,
          matchIndex: Math.floor(i / 2),
          team1: null,
          team2: null,
          result: {},
        };
        
        // Link to previous matches
        if (prevRoundMatches[i]) {
          prevRoundMatches[i].nextMatchId = match.id;
          prevRoundMatches[i].nextMatchSlot = 'team1';
        }
        if (prevRoundMatches[i + 1]) {
          prevRoundMatches[i + 1].nextMatchId = match.id;
          prevRoundMatches[i + 1].nextMatchSlot = 'team2';
        }
        
        matches.push(match);
      }
      
      roundsData.push({
        id: `round-${round}`,
        roundIndex: round,
        name: this.getRoundName(rounds, round),
        matches: matches,
      });
    }
    
    return {
      rounds: roundsData,
      type: 'single',
      totalTeams: numTeams,
    };
  }

  /**
   * Generate double elimination bracket
   */
  private static generateDoubleElimination(
    teams: Team[],
    seeded: boolean
  ): BracketData {
    const processedTeams = seeded ? [...teams] : this.seedTeams(teams);
    const numTeams = processedTeams.length;
    const rounds = Math.ceil(Math.log2(numTeams)) || 1;
    
    // Winners bracket (same as single elimination)
    const winnersBracket = this.generateSingleElimination(processedTeams, true);
    
    // Losers bracket - more complex, simplified version
    const losersRounds: Round[] = [];
    
    // Generate simplified losers bracket
    for (let i = 0; i < rounds - 1; i++) {
      const roundMatches: Match[] = [];
      const numMatches = Math.max(1, Math.floor(winnersBracket.rounds[i].matches.length / 2));
      
      for (let j = 0; j < numMatches; j++) {
        roundMatches.push({
          id: `losers-round-${i}-match-${j}`,
          roundId: `losers-round-${i}`,
          roundIndex: i,
          matchIndex: j,
          team1: null,
          team2: null,
          result: {},
        });
      }
      
      losersRounds.push({
        id: `losers-round-${i}`,
        roundIndex: i,
        name: `Losers Round ${i + 1}`,
        matches: roundMatches,
        isConsolation: true,
      });
    }
    
    // Grand Finals
    const grandFinals: Round = {
      id: 'grand-finals',
      roundIndex: rounds,
      name: 'Grand Finals',
      matches: [
        {
          id: 'grand-finals-match-0',
          roundId: 'grand-finals',
          roundIndex: rounds,
          matchIndex: 0,
          team1: null,
          team2: null,
          result: {},
        },
      ],
      isFinals: true,
    };
    
    return {
      rounds: [...winnersBracket.rounds, ...losersRounds, grandFinals],
      type: 'double',
      totalTeams: numTeams,
    };
  }

  /**
   * Generate round robin bracket
   */
  private static generateRoundRobin(teams: Team[]): BracketData {
    const rounds: Round[] = [];
    const numTeams = teams.length;
    
    // Round robin: each team plays every other team
    // For even number of teams: (n-1) rounds, n/2 matches per round
    // For odd number: n rounds, (n-1)/2 matches per round
    
    const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
    const matchesPerRound = Math.floor(numTeams / 2);
    
    // Create rounds
    for (let round = 0; round < numRounds; round++) {
      const matches: Match[] = [];
      
      for (let match = 0; match < matchesPerRound; match++) {
        matches.push({
          id: `roundrobin-round-${round}-match-${match}`,
          roundId: `roundrobin-round-${round}`,
          roundIndex: round,
          matchIndex: match,
          team1: null,
          team2: null,
          result: {},
        });
      }
      
      rounds.push({
        id: `roundrobin-round-${round}`,
        roundIndex: round,
        name: `Round ${round + 1}`,
        matches: matches,
      });
    }
    
    // Assign teams to matches (simplified round-robin pairing algorithm)
    const teamIndices = teams.map((_, i) => i);
    
    for (let round = 0; round < numRounds; round++) {
      const roundTeams = [...teamIndices];
      if (numTeams % 2 === 1) {
        roundTeams.push(-1); // Bye placeholder
      }
      
      // Rotate teams
      const fixed = roundTeams[0];
      const rotated = [...roundTeams.slice(1)];
      rotated.push(rotated.shift()!);
      roundTeams[0] = fixed;
      roundTeams.splice(1, rotated.length, ...rotated);
      
      // Pair up
      for (let i = 0; i < matchesPerRound; i++) {
        const team1Idx = roundTeams[i];
        const team2Idx = roundTeams[numTeams - 1 - i];
        
        if (team1Idx !== -1 && team2Idx !== -1) {
          rounds[round].matches[i].team1 = teams[team1Idx];
          rounds[round].matches[i].team2 = teams[team2Idx];
        }
      }
    }
    
    return {
      rounds: rounds,
      type: 'roundrobin',
      totalTeams: numTeams,
    };
  }

  /**
   * Generate Swiss bracket (simplified - pairs teams based on record)
   */
  private static generateSwiss(teams: Team[]): BracketData {
    // Swiss system: teams are paired based on their current record
    // For simplicity, we'll generate multiple rounds
    const numRounds = Math.ceil(Math.log2(teams.length));
    const rounds: Round[] = [];
    
    // Initialize all teams with 0 wins
    const teamRecords = teams.map((team) => ({ team, wins: 0, losses: 0 }));
    
    for (let round = 0; round < numRounds; round++) {
      // Sort by record (wins - losses)
      teamRecords.sort((a, b) => {
        const diffA = a.wins - a.losses;
        const diffB = b.wins - b.losses;
        return diffB - diffA;
      });
      
      const matches: Match[] = [];
      const used = new Set<number>();
      
      // Pair teams with similar records
      for (let i = 0; i < teamRecords.length; i++) {
        if (used.has(i)) continue;
        
        let j = i + 1;
        while (j < teamRecords.length && used.has(j)) {
          j++;
        }
        
        if (j < teamRecords.length) {
          matches.push({
            id: `swiss-round-${round}-match-${matches.length}`,
            roundId: `swiss-round-${round}`,
            roundIndex: round,
            matchIndex: matches.length,
            team1: teamRecords[i].team,
            team2: teamRecords[j].team,
            result: {},
          });
          used.add(i);
          used.add(j);
        }
      }
      
      rounds.push({
        id: `swiss-round-${round}`,
        roundIndex: round,
        name: `Round ${round + 1}`,
        matches: matches,
      });
    }
    
    return {
      rounds: rounds,
      type: 'swiss',
      totalTeams: teams.length,
    };
  }

  /**
   * Seed teams based on their current order or seed property
   */
  private static seedTeams(teams: Team[]): Team[] {
    // Sort by seed if available, otherwise maintain order
    const sorted = [...teams].sort((a, b) => {
      const seedA = a.seed ?? Infinity;
      const seedB = b.seed ?? Infinity;
      return seedA - seedB;
    });
    
    // Power of 2 bracket seeding (1 vs 16, 2 vs 15, etc.)
    const numTeams = sorted.length;
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const seeded: (Team | null)[] = new Array(bracketSize).fill(null);
    
    if (numTeams <= 1) {
      return sorted;
    }
    
    // Simple seeding: place teams in bracket positions
    seeded[0] = sorted[0];
    let writeIdx = 1;
    
    for (let i = 1; i < numTeams && writeIdx < bracketSize; i++) {
      seeded[writeIdx] = sorted[i];
      writeIdx += 2;
      if (writeIdx >= bracketSize) {
        writeIdx = 2;
      }
    }
    
    return seeded.filter((t): t is Team => t !== null);
  }

  /**
   * Get round name (e.g., "Round of 16", "Semifinals", "Finals")
   */
  private static getRoundName(totalRounds: number, roundIndex: number): string {
    const roundNumber = totalRounds - roundIndex;
    
    if (roundNumber === 1) return 'Finals';
    if (roundNumber === 2) return 'Semifinals';
    if (roundNumber === 3) return 'Quarterfinals';
    
    const teamsInRound = Math.pow(2, roundNumber);
    return `Round of ${teamsInRound}`;
  }

  /**
   * Update match result and advance winner to next match
   */
  static updateMatchResult(
    bracketData: BracketData,
    matchId: string,
    result: MatchResult
  ): BracketData {
    const updatedData = JSON.parse(JSON.stringify(bracketData)); // Deep clone
    
    // Find and update the match
    for (const round of updatedData.rounds) {
      const match = round.matches.find((m: Match) => m.id === matchId);
      if (match) {
        match.result = { ...match.result, ...result, completed: true };
        
        // Advance winner to next match
        if (result.winner && match.nextMatchId) {
          const winnerTeam = result.winner === match.team1?.id ? match.team1 : match.team2;
          
          // Find next match
          for (const nextRound of updatedData.rounds) {
            const nextMatch = nextRound.matches.find((m: Match) => m.id === match.nextMatchId);
            if (nextMatch && winnerTeam) {
              if (match.nextMatchSlot === 'team1') {
                nextMatch.team1 = winnerTeam;
              } else if (match.nextMatchSlot === 'team2') {
                nextMatch.team2 = winnerTeam;
              }
              break;
            }
          }
        }
        break;
      }
    }
    
    return updatedData;
  }
}

