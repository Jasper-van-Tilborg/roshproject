/**
 * Voorbeeld gebruik van FooterWithControl component
 * 
 * Deze component combineert de footer functionaliteit met een optioneel control panel.
 * Je kunt het gebruiken als:
 * 1. Standalone footer (zonder control panel)
 * 2. Footer met control panel (voor editing)
 */

import FooterWithControl, { FooterConfig } from './FooterWithControl'

// Voorbeeld 1: Standalone footer (zonder control panel)
export function ExampleStandaloneFooter() {
  const customConfig: Partial<FooterConfig> = {
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    copyrightText: '© 2025 Mijn Bedrijf',
    navigationLinks: {
      home: { label: 'Home', url: '/' },
      info: { label: 'Over Ons', url: '/about' },
      bracket: { label: 'Bracket', url: '/bracket' },
      location: { label: 'Contact', url: '/contact' }
    }
  }

  return <FooterWithControl config={customConfig} showControlPanel={false} />
}

// Voorbeeld 2: Footer met control panel (voor editing)
export function ExampleFooterWithControl() {
  return <FooterWithControl showControlPanel={true} storageKey="myFooterConfig" />
}

// Voorbeeld 3: Footer met custom config en control panel
export function ExampleCustomFooterWithControl() {
  const initialConfig: Partial<FooterConfig> = {
    layout: 'layout2',
    padding: 60,
    socialLinks: {
      instagram: 'https://instagram.com/mijnaccount',
      x: 'https://x.com/mijnaccount'
    }
  }

  return (
    <FooterWithControl 
      config={initialConfig} 
      showControlPanel={true}
      storageKey="customFooterConfig"
    />
  )
}

