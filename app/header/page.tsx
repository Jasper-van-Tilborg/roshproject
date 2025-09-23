'use client';

import { useState } from 'react';
import { HeaderBuilder } from '../components/header';
import type { HeaderConfig } from '../components/header';

export default function HeaderPage() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);

  const handleConfigChange = (config: HeaderConfig) => {
    setHeaderConfig(config);
    // Hier kun je de configuratie opslaan naar een database of localStorage
    console.log('Header configuratie opgeslagen:', config);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🏆 Toernooi Header Configurator
        </h1>
        
        <HeaderBuilder 
          onConfigChange={handleConfigChange}
        />
      </div>
    </div>
  );
}
