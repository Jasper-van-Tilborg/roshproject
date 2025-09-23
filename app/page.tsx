import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] max-w-full overflow-hidden" style={{
      background: 'linear-gradient(135deg, #6F87FF 0%, #131F5C 84%)'
    }}>
      {/* Header */}
      <header className="bg-blue-900 text-white w-full">
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
      <main className="grid grid-rows-[1fr_auto] w-full">
        {/* Hero Section */}
        <section className="flex items-center justify-center px-6 w-full">
          <div className="grid grid-cols-12 gap-8 w-full max-w-7xl mx-auto items-center mt-16">
            <div className="col-span-5 space-y-8 items-center">
               <h1 className="text-6xl font-bold text-white uppercase">THE LEGION EVENT</h1>
               <p className="text-white text-xl">
                 Voor en door Lenovo Legion Gaming - Het ultieme platform voor CS2 esports competitie
               </p>
                <div className="flex space-x-10">
                  <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors" style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                  }}>
                    Tournaments
                  </button>
                  <button className="bg-blue-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors" style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                  }}>
                    Info
                  </button>
                </div>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-5 flex justify-end">
              {/* Placeholder for image/video */}
              <div className="flex items-center justify-center text-6xl text-gray-600 max-w-full" style={{
                boxShadow: '0 0 50px rgba(255, 255, 255, 0.5)',
                borderRadius: '20px'
              }}>
                <img src="/heroimg.png" alt="Hero Image" />
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Content Section */}
        <section className="px-6 pb-16 w-full mt-16">
          <div className="grid grid-cols-12 w-full max-w-7xl mx-auto">
            <div className="col-span-12 rounded-4xl p-8 text-center relative overflow-hidden" style={{
              backgroundImage: 'url(/achtergrond-info-sec.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 0 50px rgba(255, 255, 255, 0.5)'
            }}>
              {/* Event Logo */}
              <div className="flex justify-center mb-6">
                <Image 
                  src="/eventlogo.png" 
                  alt="Legion Event Logo" 
                  width={400} 
                  height={100}
                  className="h-24 w-auto"
                />
              </div>
                <p className="text-white text-lg mb-8 leading-relaxed text-center max-w-4xl mx-auto">
                Stap binnen in de wereld van ultieme competitie! Hier vind je alles over onze toernooien: 
                van spannende match-ups en teaminformatie tot live brackets en real-time standen. 
                Volg jouw favoriete teams, voorspel wie er wint en beleef het toernooi alsof je er zelf bij bent.
              </p>
              <div className="flex justify-center">
                <button className="bg-blue-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors" style={{
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                }}>
                  View tournament
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <h3 className="text-lg font-bold mb-2">THE LEGION EVENT</h3>
              <p className="text-gray-300 text-sm mb-4">
                Het ultieme platform voor CS2 esports competitie
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Bracket</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Clips</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Predictions</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Tournaments</a>
              </div>
              <p className="text-gray-400 text-xs mt-4">
                © 2024 The Legion Event. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
