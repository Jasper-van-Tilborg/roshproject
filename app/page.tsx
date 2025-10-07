import DarkVeil from "./components/DarkVeil";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.03}
          scanlineIntensity={0}
          speed={0.2}
          scanlineFrequency={0.3}
          warpAmount={0.1}
          resolutionScale={1}
        />
      </div>
      
      {/* Minimalistische content */}
      <div className="text-center z-10 max-w-2xl mx-auto px-6">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-gray-700">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            TOURNAMENT
            <br />
            <span className="text-transparent bg-clip-text" style={{
              background: 'linear-gradient(45deg, #8B5CF6, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CREATOR
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Maak professionele toernooi websites in minuten.
            <br />
            Geen code nodig.
          </p>
          
          <Link href="/dashboard">
            <button className="text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl" style={{
              background: 'linear-gradient(45deg, #8B5CF6, #3B82F6)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
            }}>
              START CREATING
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
