"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TournamentInfo = () => {
  return (
    <div className="min-h-screen" style={{
      background: 'var(--legion-gradient)'
    }}>
      {/* Header */}
        <header className="text-white w-full" style={{ backgroundColor: 'var(--legion-header-bg)' }}>
        <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center max-w-7xl mx-auto">
          <div className="col-span-2">
            <Image 
              src="/logoheader.png" 
              alt="Legion Logo" 
              width={120} 
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <nav className="col-span-8 flex justify-center space-x-20">
            <a href="#" className="hover:underline text-large">Bracket</a>
            <a href="#" className="hover:underline text-large">Clips</a>
            <a href="#" className="hover:underline text-large">Predictions</a>
          </nav>
          <div className="col-span-2 text-right text-2xl">EN/V</div>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex items-center justify-center px-6 w-full min-h-[calc(70vh-80px)]">
        <div className="grid grid-cols-12 gap-8 w-full max-w-7xl mx-auto items-center">
          {/* Left Content */}
          <div className="col-span-5 space-y-8">
            <h1 className="text-6xl font-bold text-white uppercase leading-tight">
              THE LEGI<span className="text-transparent" style={{ 
                background: 'linear-gradient(45deg, #6F87FF, #131F5C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>O</span>N EVENT
            </h1>
            
            <p className="text-white text-xl leading-relaxed">
              Voor en door Lenovo Legion Gaming - Het ultieme platform voor CS2 esports competitie
            </p>
            
             {/* Event Details Boxes */}
             <div className="grid grid-cols-4 gap-20 mt-8">
               <div className="rounded-lg p-2 text-center h-24 w-35 flex flex-col justify-start transition-all duration-300 transform hover:scale-110 hover:z-10 cursor-pointer" style={{ 
                 backgroundColor: 'var(--legion-box-bg)',
                 boxShadow: 'var(--legion-box-border)'
               }}>
                 <div className="text-white text-sm font-medium mb-2 h-6 flex items-center justify-center">Startdatum</div>
                 <div className="text-white text-lg font-bold flex-1 flex items-center justify-center">15-12-2025</div>
               </div>
               <div className="rounded-lg p-2 text-center h-24 w-35 flex flex-col justify-start transition-all duration-300 transform hover:scale-110 hover:z-10 cursor-pointer" style={{ 
                 backgroundColor: 'var(--legion-box-bg)',
                 boxShadow: 'var(--legion-box-border)'
               }}>
                 <div className="text-white text-sm font-medium mb-2 h-6 flex items-center justify-center">Format</div>
                 <div className="text-white text-lg font-bold flex-1 flex items-center justify-center">Single Elimination</div>
               </div>
               <div className="rounded-lg p-2 text-center h-24 w-35 flex flex-col justify-start transition-all duration-300 transform hover:scale-110 hover:z-10 cursor-pointer" style={{ 
                 backgroundColor: 'var(--legion-box-bg)',
                 boxShadow: 'var(--legion-box-border)'
               }}>
                 <div className="text-white text-sm font-medium mb-2 h-6 flex items-center justify-center">Teams</div>
                 <div className="text-white text-lg font-bold flex-1 flex items-center justify-center">16</div>
               </div>
               <div className="rounded-lg p-2 text-center h-24 w-35 flex flex-col justify-start transition-all duration-300 transform hover:scale-110 hover:z-10 cursor-pointer" style={{ 
                 backgroundColor: 'var(--legion-box-bg)',
                 boxShadow: 'var(--legion-box-border)'
               }}>
                 <div className="text-white text-sm font-medium mb-2 h-6 flex items-center justify-center">Prize Pool</div>
                 <div className="text-white text-lg font-bold flex-1 flex items-center justify-center">€50,000</div>
               </div>
             </div>
          </div>
          
          {/* Spacer */}
          <div className="col-span-2"></div>
          
          {/* Right Image Section */}
          <div className="col-span-5 flex justify-end">
            <div className="relative" style={{
              boxShadow: 'var(--legion-shadow)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              <Image 
                src="/heroimg.png" 
                alt="Legion Event Arena" 
                width={500} 
                height={400}
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Step-to-Step Component */}
      <section className="px-6 py-16 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <div className="w-24 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            <div className="mx-8">
              <h2 className="text-6xl font-bold text-white uppercase tracking-wider text-center" style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
              }}>
                DOE JE MEE?
              </h2>
            </div>
            <div className="w-24 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Play Minigame */}
            <div className="relative rounded-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300" style={{ 
              backgroundColor: 'var(--legion-box-bg)',
              boxShadow: 'var(--legion-box-border)'
            }}>
              {/* Background Number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[12rem] font-extrabold text-slate-700 opacity-20 leading-none">1</span>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 uppercase">
                  Speel De Minigame
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  Elk punt dat jij scoort telt mee voor de progressbar. Je kunt zo vaak als je wilt proberen de highscore te verbreken. Met alle behaalde punten samen zorgen jullie ervoor dat de prijzenpot blijft groeien.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Daarnaast geven we elke week een prijs aan de speler met de hoogste score. De winnaar wordt iedere vrijdag tijdens de match day live op stream door Morrog bekendgemaakt.
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center justify-center">
                    Speel De Minigame
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Chat on Twitch */}
            <div className="relative rounded-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300" style={{ 
              backgroundColor: 'var(--legion-box-bg)',
              boxShadow: 'var(--legion-box-border)'
            }}>
              {/* Background Number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[12rem] font-extrabold text-slate-700 opacity-20 leading-none">2</span>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.149 0L.537 4.119v16.296h5.731V24h3.224l3.045-3.585h4.659l6.269-6.296V0H2.149zm19.164 13.612l-3.582 3.585H12l-3.045 3.585v-3.585H4.119V2.149h17.194v11.463zm-3.582-7.179v6.358h-2.149V6.433h2.149zm-5.731 0v6.358H9.403V6.433h2.149z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 uppercase">
                  Chat Mee Op Twitch
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  Op matchdays kun je de progressbar écht een boost geven. Tijdens de matches telt elke chatmessage in de livestream van <span className="font-semibold text-blue-400">Morrog</span> als een punt voor de progressbar.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  Deze chatpunten wegen zwaarder dan die van de minigame, dus live aanwezig zijn is dé manier om de volledige prijzenpot vrij te spelen.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Dus pak iets te drinken, leg de snacks klaar en tune in!
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center justify-center">
                    Chat Mee Op Twitch
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Comment on Instagram */}
            <div className="relative rounded-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300" style={{ 
              backgroundColor: 'var(--legion-box-bg)',
              boxShadow: 'var(--legion-box-border)'
            }}>
              {/* Background Number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[12rem] font-extrabold text-slate-700 opacity-20 leading-none">3</span>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 uppercase">
                  Comment Op Instagram
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  Zie je een post van <span className="font-semibold text-blue-400">@lenovobenelux</span> voorbij komen? Laat een comment achter voor extra bonuspunten!
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  Iedere comment telt mee als een punt voor de progressbar.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  <span className="font-bold text-white">Let wel op:</span> spammen heeft geen zin. Ons systeem negeert dubbele comments, dus kwaliteit boven kwantiteit!
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center justify-center">
                    Laat Een Comment Achter
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Twitch Integration Section */}
      <section className="px-6 py-16 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-16">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-24 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
            </div>
            
            {/* Title with enhanced styling */}
            <div className="relative z-10 text-center">
            <div className="mx-8">
              <h2 className="text-6xl font-bold text-white uppercase tracking-wider text-center" style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
              }}>
                LIVESTREAM
              </h2>
            </div>
              
              {/* Decorative elements */}
              <div className="flex items-center justify-center mt-4 space-x-4">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent to-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-8 h-1 bg-gradient-to-l from-transparent to-pink-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Countdown & Agenda */}
            <div className="lg:col-span-1 space-y-6">
              {/* Next Stream Countdown */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 uppercase">Next Stream</h3>
                <div className="text-center">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">09</div>
                      <div className="text-xs text-slate-400">Days</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">14</div>
                      <div className="text-xs text-slate-400">Hours</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">50</div>
                      <div className="text-xs text-slate-400">Min</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">37</div>
                      <div className="text-xs text-slate-400">Sec</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-purple-400">MORROG</p>
                    <p>Tournament Practice</p>
                  </div>
                </div>
              </div>

              {/* Stream Schedule */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 uppercase">Upcoming Streams</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div>
                      <p className="text-white font-medium">27 September</p>
                      <p className="text-slate-400 text-sm">Tournament Day 1</p>
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div>
                      <p className="text-white font-medium">4 October</p>
                      <p className="text-slate-400 text-sm">Qualification</p>
                    </div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div>
                      <p className="text-white font-medium">11 October</p>
                      <p className="text-slate-400 text-sm">Quarter Finals</p>
                    </div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Stream Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                {/* Stream Header */}
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">M</span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">MORROG</h3>
                        <p className="text-slate-400 text-sm">Live on Twitch</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 text-sm font-medium">LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Twitch Stream Embed */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                  {/* Video Player */}
                  <div className="lg:col-span-3 relative">
                    <div className="aspect-video bg-black">
                      <iframe
                        src="https://player.twitch.tv/?channel=morrog&parent=localhost&parent=127.0.0.1&autoplay=true&muted=false"
                        height="100%"
                        width="100%"
                        allowFullScreen
                        allow="autoplay; encrypted-media; picture-in-picture"
                        className="w-full h-full"
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>

                  {/* Twitch Chat Sidebar */}
                  <div className="lg:col-span-1 bg-slate-900/50 border-l border-slate-700">
                    <div className="p-4 border-b border-slate-700">
                      <h4 className="text-white font-bold text-sm uppercase">Chat over video's</h4>
                    </div>
                    
                    <div className="h-96">
                      <iframe
                        src="https://www.twitch.tv/embed/morrog/chat?parent=localhost&parent=127.0.0.1"
                        height="100%"
                        width="100%"
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Game Section */}
      <section className="px-6 py-16 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-16">
            <div className="w-24 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            <div className="mx-8">
              <h2 className="text-6xl font-bold text-white uppercase tracking-wider text-center">
                MINI GAME
              </h2>
            </div>
            <div className="w-24 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* Diagonal pattern background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }}></div>
                </div>
                
                {/* Mini Game Content */}
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-4 uppercase">AIM TRAINER</h3>
                  <p className="text-slate-400 text-lg mb-8">Test je precisie en verbeter je aim skills</p>
                  
                  {/* Game Stats */}
                  <div className="grid grid-cols-3 gap-8 mb-8 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">30s</div>
                      <div className="text-sm text-slate-400">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-2">∞</div>
                      <div className="text-sm text-slate-400">Targets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">0</div>
                      <div className="text-sm text-slate-400">High Score</div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Link href="https://rosh-minigame-aimtrainer.vercel.app/" target="_blank" rel="noopener noreferrer">
                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25">
                      <span className="flex items-center justify-center">
                        START TRAINING
                        <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 text-white py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">THE LEGION EVENT</h3>
              <p className="text-slate-300 text-sm mb-6">
                Het ultieme platform voor CS2 esports competitie
              </p>
              <div className="flex justify-center space-x-8 text-sm">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-105">Bracket</a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-105">Clips</a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:scale-105">Predictions</a>
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-all duration-300 hover:scale-105">Tournaments</a>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-slate-500 text-xs">
                  © 2024 The Legion Event. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TournamentInfo