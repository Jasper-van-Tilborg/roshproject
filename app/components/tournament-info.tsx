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
    </div>
  )
}

export default TournamentInfo