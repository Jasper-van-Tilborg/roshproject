import React from 'react';
import { render, screen } from '@testing-library/react';
import Match from '../Match';
import { ThemeProvider } from '../ThemeProvider';
import { Match as MatchType, Team } from '../types';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Match', () => {
  const mockTeam1: Team = {
    id: '1',
    name: 'Team Alpha',
    seed: 1,
  };

  const mockTeam2: Team = {
    id: '2',
    name: 'Team Beta',
    seed: 2,
  };

  const mockMatch: MatchType = {
    id: 'match-1',
    roundId: 'round-1',
    roundIndex: 0,
    matchIndex: 0,
    team1: mockTeam1,
    team2: mockTeam2,
    result: {},
  };

  it('should render both teams', () => {
    render(
      <TestWrapper>
        <Match match={mockMatch} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  it('should render match index', () => {
    render(
      <TestWrapper>
        <Match match={mockMatch} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Match 1/)).toBeInTheDocument();
  });

  it('should render seeds when showSeeds is true', () => {
    render(
      <TestWrapper>
        <Match match={mockMatch} showSeeds={true} />
      </TestWrapper>
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display winner when match is completed', () => {
    const completedMatch: MatchType = {
      ...mockMatch,
      result: {
        winner: mockTeam1.id,
        completed: true,
      },
    };
    
    render(
      <TestWrapper>
        <Match match={completedMatch} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Winner: Team Alpha/)).toBeInTheDocument();
  });

  it('should handle bye matches', () => {
    const byeMatch: MatchType = {
      ...mockMatch,
      team2: null,
      bye: true,
    };
    
    render(
      <TestWrapper>
        <Match match={byeMatch} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Bye')).toBeInTheDocument();
  });
});

