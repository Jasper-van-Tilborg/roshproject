'use client'

import { useState, useEffect } from 'react'
import Footer, { FooterConfig } from './Footer'

export default function FooterWrapper() {
  const [config, setConfig] = useState<Partial<FooterConfig> | null>(null)

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('footerConfig')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(parsed)
      } catch (e) {
        console.error('Error loading footer config:', e)
        setConfig({})
      }
    } else {
      setConfig({})
    }
  }, [])

  if (config === null) {
    return null // Don't render until config is loaded
  }

  return <Footer config={config} />
}

