import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center radial-gradient">
      
      {/* Minimalistische content */}
      <div className="text-center z-10 max-w-2xl mx-auto px-6">
        <div className="glass-card rounded-2xl p-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            TOURNAMENT
            <br />
            <span style={{ color: '#482CFF' }}>
              CREATOR
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Maak professionele toernooi websites in minuten.
            <br />
            Geen code nodig.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <button className="text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:bg-[#420AB2]" style={{
                backgroundColor: '#482CFF',
                boxShadow: '0 0 30px rgba(72, 44, 255, 0.4)'
              }}>
                START CREATING
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
