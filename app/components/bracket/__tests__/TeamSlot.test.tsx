import React from 'react';
import { render, screen } from '@testing-library/react';
import TeamSlot from '../TeamSlot';
import { ThemeProvider } from '../ThemeProvider';
import { Team, MatchResult } from '../types';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('TeamSlot', () => {
  const mockTeam: Team = {
    id: '1',
    name: 'Test Team',
    seed: 1,
  };

  it('should render team name', () => {
    render(
      <TestWrapper>
        <TeamSlot team={mockTeam} slot="team1" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('should render seed when showSeed is true', () => {
    render(
      <TestWrapper>
        <TeamSlot team={mockTeam} slot="team1" showSeed={true} />
      </TestWrapper>
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render custom label if provided', () => {
    const teamWithLabel: Team = {
      ...mockTeam,
      customLabel: 'Custom Name',
    };
    
    render(
      <TestWrapper>
        <TeamSlot team={teamWithLabel} slot="team1" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Custom Name')).toBeInTheDocument();
    expect(screen.queryByText('Test Team')).not.toBeInTheDocument();
  });

  it('should render placeholder for empty slot', () => {
    render(
      <TestWrapper>
        <TeamSlot team={null} slot="team1" />
      </TestWrapper>
    );
    
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('should render bye indicator', () => {
    render(
      <TestWrapper>
        <TeamSlot team={null} slot="team1" isBye={true} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Bye')).toBeInTheDocument();
  });

  it('should render score when provided', () => {
    const result: MatchResult = {
      team1Score: 3,
      team2Score: 1,
      completed: true,
    };
    
    render(
      <TestWrapper>
        <TeamSlot team={mockTeam} slot="team1" matchResult={result} />
      </TestWrapper>
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should apply winner styling when isWinner is true', () => {
    const { container } = render(
      <TestWrapper>
        <TeamSlot team={mockTeam} slot="team1" isWinner={true} />
      </TestWrapper>
    );
    
    const teamSlot = container.querySelector('.teamSlot');
    expect(teamSlot?.classList.contains('teamSlotWinner')).toBe(true);
  });
});

