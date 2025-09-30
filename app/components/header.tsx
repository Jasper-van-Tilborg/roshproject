'use client';

import React from 'react';
import Image from 'next/image';

// Types voor de header configuratie
interface HeaderConfig {
  logo?: {
    src?: string;
    alt: string;
    width?: number;
    height?: number;
  };
  backgroundColor?: string;
  textColor?: string;
}

interface HeaderProps {
  config?: HeaderConfig;
}

// Default configuratie
const defaultConfig: HeaderConfig = {
  logo: {
    src: '/logoheader.png',
    alt: 'Logo',
    width: 200,
    height: 80
  },
  backgroundColor: '#ffffff',
  textColor: '#000000'
};

export default function Header({ config = defaultConfig }: HeaderProps) {
  const backgroundColor = config.backgroundColor || '#ffffff';
  const textColor = config.textColor || '#000000';
  
  return (
    <header 
      className="w-full shadow-sm"
      style={{
        backgroundColor: backgroundColor,
        color: textColor
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center">
          {/* Logo sectie - gecentreerd */}
          {config.logo && config.logo.src && (
            <div className="flex-shrink-0">
              <Image
                src={config.logo.src}
                alt={config.logo.alt}
                width={config.logo.width || 200}
                height={config.logo.height || 80}
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Exporteer ook de types voor gebruik in andere componenten
export type { HeaderConfig, HeaderProps };