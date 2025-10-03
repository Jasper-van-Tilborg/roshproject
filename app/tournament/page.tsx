import TournamentInfo from "../components/tournament-info";
import DarkVeil from "../components/DarkVeil";

export default function TournamentPage() {
  return (
    <div className="relative">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.04}
          scanlineIntensity={0}
          speed={0.3}
          scanlineFrequency={0.2}
          warpAmount={0.15}
          resolutionScale={1}
        />
      </div>
      <TournamentInfo />
    </div>
  );
}
