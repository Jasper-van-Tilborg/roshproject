import React from 'react';
import { render, screen } from '@testing-library/react';
import Round from '../Round';
import { ThemeProvider } from '../ThemeProvider';
import { Round as RoundType, Team } from '../types';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Round', () => {
  const mockTeam1: Team = { id: '1', name: 'Team 1' };
  const mockTeam2: Team = { id: '2', name: 'Team 2' };
  const mockTeam3: Team = { id: '3', name: 'Team 3' };
  const mockTeam4: Team = { id: '4', name: 'Team 4' };

  const mockRound: RoundType = {
    id: 'round-1',
    roundIndex: 0,
    name: 'Round 1',
    matches: [
      {
        id: 'match-1',
        roundId: 'round-1',
        roundIndex: 0,
        matchIndex: 0,
        team1: mockTeam1,
        team2: mockTeam2,
        result: {},
      },
      {
        id: 'match-2',
        roundId: 'round-1',
        roundIndex: 0,
        matchIndex: 1,
        team1: mockTeam3,
        team2: mockTeam4,
        result: {},
      },
    ],
  };

  it('should render round name', () => {
    render(
      <TestWrapper>
        <Round round={mockRound} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('should render all matches in round', () => {
    render(
      <TestWrapper>
        <Round round={mockRound} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Team 3')).toBeInTheDocument();
    expect(screen.getByText('Team 4')).toBeInTheDocument();
  });

  it('should display consolation label for losers bracket', () => {
    const losersRound: RoundType = {
      ...mockRound,
      isConsolation: true,
    };
    
    render(
      <TestWrapper>
        <Round round={losersRound} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Round 1 \(Losers\)/)).toBeInTheDocument();
  });

  it('should display grand finals label', () => {
    const finalsRound: RoundType = {
      ...mockRound,
      isFinals: true,
      name: 'Grand Finals',
    };
    
    render(
      <TestWrapper>
        <Round round={finalsRound} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Grand Finals \(Grand Finals\)/)).toBeInTheDocument();
  });
});

