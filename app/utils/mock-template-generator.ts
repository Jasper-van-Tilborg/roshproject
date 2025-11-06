// Mock template generator voor testing van de editor
export function generateMockTemplate(config: any): string {
  const { title, date, location, description, participants, game, theme, components } = config

  return `'use client'

import { useState } from 'react'

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState('bracket')

  const teams = Array.from({ length: ${participants} }, (_, i) => ({
    id: i + 1,
    name: \`Team \${String.fromCharCode(65 + i)}\`,
    logo: ['🦁', '🐺', '🦅', '🐉', '🦈', '🐯', '🦂', '🐆'][i % 8],
    group: i < ${Math.ceil(participants / 2)} ? 'A' : 'B'
  }))

  const groupA = teams.filter(t => t.group === 'A')
  const groupB = teams.filter(t => t.group === 'B')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09003C] via-purple-900 to-[#C8247F] font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09003C]"></div>
        
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-2xl tracking-tight">
              ${title.toUpperCase()}
            </div>
            <div className="hidden md:flex space-x-8 text-white">
              <a href="#about" className="hover:text-[#C8247F] transition-colors duration-300">Over</a>
              <a href="#teams" className="hover:text-[#C8247F] transition-colors duration-300">Teams</a>
              <a href="#contact" className="hover:text-[#C8247F] transition-colors duration-300">Contact</a>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-6 px-6 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20">
              <span className="text-[#C8247F] font-bold text-sm tracking-widest uppercase">Officieel Toernooi</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
              ${title.toUpperCase()}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C8247F] to-purple-400">
                EVENT
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-white text-lg">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📅</span>
                <span className="font-semibold">${date}</span>
              </div>
              <div className="hidden sm:block w-2 h-2 bg-[#C8247F] rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">📍</span>
                <span className="font-semibold">${location}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#C8247F] to-purple-500 text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#C8247F]/50">
                Schrijf Nu In
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#09003C] transition-all duration-300">
                Meer Info
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Over Het Toernooi
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              ${description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-4">Prijs Pool</h3>
              <p className="text-3xl font-black text-[#C8247F] mb-2">€5,000</p>
              <p className="text-gray-300">Totaal prijzengeld</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-4">Teams</h3>
              <p className="text-3xl font-black text-[#C8247F] mb-2">${participants}</p>
              <p className="text-gray-300">Deelnemende teams</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-white mb-4">Game</h3>
              <p className="text-3xl font-black text-[#C8247F] mb-2">${game}</p>
              <p className="text-gray-300">Counter-Strike 2</p>
            </div>
          </div>
        </div>
      </section>

      ${components.includes('bracket') ? `
      {/* Teams Section */}
      <section id="teams" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Deelnemende Teams
            </h2>
            <p className="text-xl text-gray-300">
              De beste teams strijden om de overwinning
            </p>
          </div>

          {/* Group Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-full p-2 border border-white border-opacity-20">
              <button
                onClick={() => setActiveTab('groupA')}
                className={\`px-8 py-3 rounded-full font-bold transition-all duration-300 \${
                  activeTab === 'groupA' 
                    ? 'bg-gradient-to-r from-[#C8247F] to-purple-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }\`}
              >
                Groep A
              </button>
              <button
                onClick={() => setActiveTab('groupB')}
                className={\`px-8 py-3 rounded-full font-bold transition-all duration-300 \${
                  activeTab === 'groupB' 
                    ? 'bg-gradient-to-r from-[#C8247F] to-purple-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }\`}
              >
                Groep B
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'groupA' ? groupA : groupB).map((team) => (
              <div key={team.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 hover:border-[#C8247F] hover:scale-105 transition-all duration-300 text-center">
                <div className="text-6xl mb-4">{team.logo}</div>
                <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                <div className="text-sm text-gray-300">
                  Groep {team.group}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      ` : ''}

      ${components.includes('twitch') ? `
      {/* Twitch Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Live Stream
            </h2>
            <p className="text-xl text-gray-300">
              Volg het toernooi live op Twitch
            </p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-xl">Twitch Stream</p>
                <p className="text-gray-400">Live tijdens het toernooi</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      ` : ''}

      ${components.includes('sponsors') ? `
      {/* Sponsors Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Sponsors
            </h2>
            <p className="text-xl text-gray-300">
              Met dank aan onze partners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {['Lenovo Legion', 'HyperX', 'Red Bull'].map((sponsor, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center hover:border-[#C8247F] transition-all duration-300">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-white">{sponsor}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      ` : ''}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Klaar Voor De Strijd?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Schrijf je team nu in en maak kans op de overwinning!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-12 py-4 bg-gradient-to-r from-[#C8247F] to-purple-500 text-white font-bold text-lg rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#C8247F]/50">
              Inschrijven
            </button>
            <button className="px-12 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-[#09003C] transition-all duration-300">
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white border-opacity-20">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="text-white font-bold text-2xl mb-4">${title.toUpperCase()} EVENT</div>
          <p className="text-gray-300 mb-6">Het ultieme ${game} toernooi</p>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-[#C8247F] transition-colors duration-200">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-[#C8247F] transition-colors duration-200">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-[#C8247F] transition-colors duration-200">
              Discord
            </a>
          </div>
          <p className="text-gray-400">&copy; 2025 ${title} Event. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  )
}`
}

