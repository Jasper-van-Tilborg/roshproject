'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState('groupA')

  const config = {
    title: 'The Legion Event',
    date: '25 oktober 2025',
    location: 'Comic Con',
    description: 'Het is een csgo toernooi op comic con',
    participants: 8,
    bracketType: 'group stage',
    game: 'CS2',
    primaryColor: '#952990',
    secondaryColor: '#8E8E8E',
    sponsors: [
      { name: 'Lenovo Legion', logo: '/sponsors/lenovo-legion.png' },
      { name: 'HyperX', logo: '/sponsors/hyperx.png' },
      { name: 'Red Bull', logo: '/sponsors/redbull.png' }
    ],
    socialMedia: {
      instagram: 'https://instagram.com/thelegionevent',
      facebook: 'https://facebook.com/thelegionevent'
    },
    teams: [
      { id: 1, name: 'Team Alpha', logo: '🎮', group: 'A', wins: 0, losses: 0 },
      { id: 2, name: 'Team Bravo', logo: '⚡', group: 'A', wins: 0, losses: 0 },
      { id: 3, name: 'Team Charlie', logo: '🔥', group: 'A', wins: 0, losses: 0 },
      { id: 4, name: 'Team Delta', logo: '💎', group: 'A', wins: 0, losses: 0 },
      { id: 5, name: 'Team Echo', logo: '🚀', group: 'B', wins: 0, losses: 0 },
      { id: 6, name: 'Team Foxtrot', logo: '⭐', group: 'B', wins: 0, losses: 0 },
      { id: 7, name: 'Team Golf', logo: '🎯', group: 'B', wins: 0, losses: 0 },
      { id: 8, name: 'Team Hotel', logo: '👑', group: 'B', wins: 0, losses: 0 }
    ]
  }

  const groupA = config.teams.filter(team => team.group === 'A')
  const groupB = config.teams.filter(team => team.group === 'B')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-purple-900/30">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🎮</span>
            <span className="text-xl font-bold text-white">The Legion Event</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#info" className="text-gray-300 hover:text-white transition-colors duration-200">Info</a>
            <a href="#teams" className="text-gray-300 hover:text-white transition-colors duration-200">Teams</a>
            <a href="#sponsors" className="text-gray-300 hover:text-white transition-colors duration-200">Sponsors</a>
          </div>
          <button 
            className="px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
          >
            Schrijf Nu In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {config.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {config.date} • {config.location}
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            {config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}>
              Schrijf Nu In
            </button>
            <button className="px-8 py-4 rounded-full font-semibold text-white border-2 border-purple-500 hover:bg-purple-500 transition-all duration-300">
              Meer Info
            </button>
          </div>
        </div>
      </section>

      {/* Tournament Info */}
      <section id="info" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Toernooi Informatie</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">Datum</h3>
              <p className="text-gray-300">{config.date}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Locatie</h3>
              <p className="text-gray-300">{config.location}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Deelnemers</h3>
              <p className="text-gray-300">{config.participants} teams</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30">
              <div className="text-3xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-white mb-2">Game</h3>
              <p className="text-gray-300">{config.game}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teams Section */}
      <section id="teams" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Teams</h2>
          
          {/* Group Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-full p-2 border border-purple-900/30">
              <button
                onClick={() => setActiveTab('groupA')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'groupA' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'groupA' ? { background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` } : {}}
              >
                Groep A
              </button>
              <button
                onClick={() => setActiveTab('groupB')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'groupB' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'groupB' ? { background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` } : {}}
              >
                Groep B
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'groupA' ? groupA : groupB).map((team) => (
              <div key={team.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">{team.logo}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                  <div className="flex justify-center space-x-4 text-sm text-gray-400">
                    <span>W: {team.wins}</span>
                    <span>L: {team.losses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section id="sponsors" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Sponsors</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {config.sponsors.map((sponsor, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-900/30 text-center hover:border-purple-500/50 transition-all duration-300">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-white">{sponsor.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-purple-900/30">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a href={config.socialMedia.instagram} className="text-gray-400 hover:text-white transition-colors duration-200">
              Instagram
            </a>
            <a href={config.socialMedia.facebook} className="text-gray-400 hover:text-white transition-colors duration-200">
              Facebook
            </a>
          </div>
          <p className="text-gray-400">&copy; 2025 The Legion Event. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  )
}