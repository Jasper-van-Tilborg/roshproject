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
        
        {headerConfig && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">💾 Configuratie Code</h2>
            <p className="text-sm text-gray-600 mb-4">
              Kopieer deze code om je header configuratie te gebruiken:
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(headerConfig, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
