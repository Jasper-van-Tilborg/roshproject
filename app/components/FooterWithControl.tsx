'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export interface FooterLink {
  id: string
  label: string
  url: string
  isExternal?: boolean
}

export interface FooterConfig {
  showFooter: boolean
  backgroundColor: string
  textColor: string
  linkColor: string
  linkHoverColor: string
  copyrightText: string
  showSocialLinks: boolean
  socialLinks: {
    instagram?: string
    x?: string
    discord?: string
    facebook?: string
    youtube?: string
    linkedin?: string
  }
  links: FooterLink[]
  layout: 'layout1' | 'layout2' | 'layout3'
  padding: number
  showDivider: boolean
  showBottomDivider: boolean
  logoUrl?: string
  logoText?: string
  navigationLinks: {
    home: { label: string; url: string; subItems?: Array<{ label: string; url: string }> }
    info: { label: string; url: string; subItems?: Array<{ label: string; url: string }> }
    bracket: { label: string; url: string; subItems?: Array<{ label: string; url: string }> }
    location: { label: string; url: string; subItems?: Array<{ label: string; url: string }> }
  }
}

const defaultConfig: FooterConfig = {
  showFooter: true,
  backgroundColor: '#111827',
  textColor: '#f3f4f6',
  linkColor: '#d1d5db',
  linkHoverColor: '#60a5fa',
  copyrightText: '© 2025 Alle rechten voorbehouden.',
  showSocialLinks: true,
  socialLinks: {},
  links: [],
  layout: 'layout1',
  padding: 48,
  showDivider: true,
  showBottomDivider: true,
  logoUrl: '',
  logoText: 'LOGO',
  navigationLinks: {
    home: { label: 'Home', url: '/' },
    info: { label: 'Info', url: '/info' },
    bracket: { label: 'Bracket', url: '/bracket' },
    location: { label: 'Location', url: '/location' }
  }
}

interface FooterWithControlProps {
  config?: Partial<FooterConfig>
  showControlPanel?: boolean
  storageKey?: string
}

// Footer Component (internal)
function Footer({ config }: { config: FooterConfig }) {
  const {
    showFooter,
    backgroundColor,
    textColor,
    linkColor,
    linkHoverColor,
    copyrightText,
    showSocialLinks,
    socialLinks,
    links,
    layout,
    padding,
    showDivider,
    showBottomDivider,
    logoUrl,
    logoText,
    navigationLinks
  } = config

  if (!showFooter) {
    return null
  }

  const renderSocialLinks = () => {
    const activeSocials = Object.entries(socialLinks).filter(([_, url]) => url && url.trim() !== '')
    if (activeSocials.length === 0) return null

    const socialIconStyle = {
      color: linkColor,
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      display: 'inline-block',
      width: '24px',
      height: '24px'
    }

    return (
      <div className="flex gap-4 flex-wrap items-center">
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="Instagram"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        )}
        {socialLinks.x && (
          <a
            href={socialLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="X"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        )}
        {socialLinks.discord && (
          <a
            href={socialLinks.discord}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="Discord"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        )}
        {socialLinks.facebook && (
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="Facebook"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        )}
        {socialLinks.youtube && (
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="YouTube"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        )}
        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={socialIconStyle}
            onMouseEnter={(e) => {
              const element = e.currentTarget
              element.style.color = linkHoverColor
              element.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget
              element.style.color = linkColor
              element.style.transform = 'translateY(0)'
            }}
            aria-label="LinkedIn"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        )}
      </div>
    )
  }

  const renderLogo = () => {
    const validLogoUrl = logoUrl && logoUrl.trim() !== ''

    if (validLogoUrl) {
      return (
        <div className="flex items-center" style={{ minHeight: '48px' }}>
          <img
            src={logoUrl.trim()}
            alt="Logo"
            className="max-h-12 w-auto object-contain"
            style={{
              maxWidth: '200px',
              height: 'auto',
              display: 'block'
            }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = document.createElement('div')
                fallback.style.color = textColor
                fallback.style.fontSize = '1.5rem'
                fallback.style.fontWeight = 'bold'
                fallback.textContent = logoText || 'LOGO'
                parent.appendChild(fallback)
              }
            }}
          />
        </div>
      )
    }
    return (
      <div
        style={{
          color: textColor,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {logoText || 'LOGO'}
      </div>
    )
  }

  const renderNavigationLink = (link: { label: string; url: string; subItems?: Array<{ label: string; url: string }> }) => {
    const hasSubItems = link.subItems && link.subItems.length > 0

    return (
      <div className="flex flex-col">
        <Link
          href={link.url}
          style={{
            color: linkColor,
            transition: 'all 0.3s ease',
            position: 'relative',
            display: 'inline-block',
            fontWeight: '600',
            marginBottom: hasSubItems ? '8px' : '0'
          }}
          className="footer-link"
          onMouseEnter={(e) => {
            const element = e.currentTarget
            element.style.color = linkHoverColor
            element.style.transform = 'translateY(-2px)'
            element.style.textShadow = `0 0 8px ${linkHoverColor}40, 0 0 12px ${linkHoverColor}30`
          }}
          onMouseLeave={(e) => {
            const element = e.currentTarget
            element.style.color = linkColor
            element.style.transform = 'translateY(0)'
            element.style.textShadow = 'none'
          }}
        >
          {link.label}
        </Link>
        {hasSubItems && link.subItems && (
          <div className="flex flex-col gap-2" style={{ marginLeft: '0', paddingLeft: '0' }}>
            {link.subItems.map((subItem, index) => (
              <Link
                key={index}
                href={subItem.url}
                style={{
                  color: linkColor,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  opacity: 0.8
                }}
                className="footer-link"
                onMouseEnter={(e) => {
                  const element = e.currentTarget
                  element.style.color = linkHoverColor
                  element.style.opacity = '1'
                  element.style.transform = 'translateY(-2px)'
                  element.style.textShadow = `0 0 8px ${linkHoverColor}40, 0 0 12px ${linkHoverColor}30`
                }}
                onMouseLeave={(e) => {
                  const element = e.currentTarget
                  element.style.color = linkColor
                  element.style.opacity = '0.8'
                  element.style.transform = 'translateY(0)'
                  element.style.textShadow = 'none'
                }}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderLayout1 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
        <div className="md:col-span-3">
          {renderLogo()}
        </div>
        <div className="md:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderNavigationLink(navigationLinks.home)}
            {renderNavigationLink(navigationLinks.info)}
            {renderNavigationLink(navigationLinks.bracket)}
            {renderNavigationLink(navigationLinks.location)}
          </div>
        </div>
      </div>
      <div className={`flex justify-between items-center pt-6 ${showBottomDivider ? 'border-t' : ''}`} style={showBottomDivider ? { borderColor: `${linkColor}20` } : {}}>
        {copyrightText && (
          <div style={{ color: linkColor, fontSize: '0.875rem' }}>
            {copyrightText}
          </div>
        )}
        <div className="flex justify-end">
          {renderSocialLinks()}
        </div>
      </div>
    </>
  )

  const renderLayout2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
        <div className="md:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderNavigationLink(navigationLinks.home)}
            {renderNavigationLink(navigationLinks.info)}
            {renderNavigationLink(navigationLinks.bracket)}
            {renderNavigationLink(navigationLinks.location)}
          </div>
        </div>
        <div className="md:col-span-3 flex justify-end md:justify-start">
          {renderLogo()}
        </div>
      </div>
      <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: `${linkColor}20` }}>
        <div className="flex justify-start">
          {renderSocialLinks()}
        </div>
        {copyrightText && (
          <div style={{ color: linkColor, fontSize: '0.875rem' }}>
            {copyrightText}
          </div>
        )}
      </div>
    </>
  )

  const renderLayout3 = () => (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-6">
        <div className="flex flex-row gap-6">
          {renderNavigationLink(navigationLinks.home)}
          {renderNavigationLink(navigationLinks.info)}
        </div>
        <div className="flex justify-center">
          {renderLogo()}
        </div>
        <div className="flex flex-row gap-6">
          {renderNavigationLink(navigationLinks.bracket)}
          {renderNavigationLink(navigationLinks.location)}
        </div>
      </div>
      <div className={`flex justify-between items-center pt-6 ${showBottomDivider ? 'border-t' : ''}`} style={showBottomDivider ? { borderColor: `${linkColor}20` } : {}}>
        {copyrightText && (
          <div style={{ color: linkColor, fontSize: '0.875rem' }}>
            {copyrightText}
          </div>
        )}
        <div className="flex justify-end">
          {renderSocialLinks()}
        </div>
      </div>
    </>
  )

  const renderLayout = () => {
    switch (layout) {
      case 'layout1':
        return renderLayout1()
      case 'layout2':
        return renderLayout2()
      case 'layout3':
        return renderLayout3()
      default:
        return renderLayout1()
    }
  }

  return (
    <footer
      style={{
        backgroundColor,
        color: textColor,
        paddingTop: `${padding}px`,
        paddingBottom: `${padding}px`
      }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-6">
        {renderLayout()}
      </div>
    </footer>
  )
}

// Main Component
export default function FooterWithControl({ config: initialConfig = {}, showControlPanel = false, storageKey = 'footerConfig' }: FooterWithControlProps) {
  const [config, setConfig] = useState<FooterConfig>(() => {
    const merged = { ...defaultConfig, ...initialConfig }
    if (typeof window !== 'undefined' && showControlPanel) {
      const savedConfig = localStorage.getItem(storageKey)
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig)
          return { ...merged, ...parsed }
        } catch (e) {
          console.error('Error loading footer config:', e)
        }
      }
    }
    return merged
  })

  const previewRef = useRef<HTMLDivElement>(null)

  const [openSections, setOpenSections] = useState({
    layout: false,
    colors: false,
    socialLinks: false,
    logo: false,
    navigationLinks: false,
    copyright: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    if (showControlPanel && typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem(storageKey)
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig)
          setConfig(prev => ({ ...prev, ...parsed }))
        } catch (e) {
          console.error('Error loading footer config:', e)
        }
      }
    }
  }, [showControlPanel, storageKey])

  useEffect(() => {
    if (showControlPanel && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(config))
    }
  }, [config, showControlPanel, storageKey])

  const updateConfig = (updates: Partial<FooterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const updateNavigationLink = (key: keyof FooterConfig['navigationLinks'], field: 'label' | 'url', value: string) => {
    updateConfig({
      navigationLinks: {
        ...config.navigationLinks,
        [key]: {
          ...config.navigationLinks[key],
          [field]: value
        }
      }
    })
  }

  const addSubItem = (key: keyof FooterConfig['navigationLinks']) => {
    const currentSubItems = config.navigationLinks[key].subItems || []
    updateConfig({
      navigationLinks: {
        ...config.navigationLinks,
        [key]: {
          ...config.navigationLinks[key],
          subItems: [...currentSubItems, { label: '', url: '' }]
        }
      }
    })
  }

  const updateSubItem = (key: keyof FooterConfig['navigationLinks'], index: number, field: 'label' | 'url', value: string) => {
    const currentSubItems = config.navigationLinks[key].subItems || []
    const updatedSubItems = [...currentSubItems]
    updatedSubItems[index] = {
      ...updatedSubItems[index],
      [field]: value
    }
    updateConfig({
      navigationLinks: {
        ...config.navigationLinks,
        [key]: {
          ...config.navigationLinks[key],
          subItems: updatedSubItems
        }
      }
    })
  }

  const removeSubItem = (key: keyof FooterConfig['navigationLinks'], index: number) => {
    const currentSubItems = config.navigationLinks[key].subItems || []
    const updatedSubItems = currentSubItems.filter((_, i) => i !== index)
    updateConfig({
      navigationLinks: {
        ...config.navigationLinks,
        [key]: {
          ...config.navigationLinks[key],
          subItems: updatedSubItems.length > 0 ? updatedSubItems : undefined
        }
      }
    })
  }

  const renderSubItems = (key: keyof FooterConfig['navigationLinks']) => {
    const subItems = config.navigationLinks[key].subItems || []
    return (
      <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-600">
        {subItems.map((subItem, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <input
                type="text"
                value={subItem.label}
                onChange={(e) => updateSubItem(key, index, 'label', e.target.value)}
                className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                placeholder="Sub-item label"
              />
              <input
                type="text"
                value={subItem.url}
                onChange={(e) => updateSubItem(key, index, 'url', e.target.value)}
                className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                placeholder="/url"
              />
            </div>
            <button
              onClick={() => removeSubItem(key, index)}
              className="px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
              title="Verwijderen"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => addSubItem(key)}
          className="w-full px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
        >
          + Sub-item toevoegen
        </button>
      </div>
    )
  }

  const updateSocialLink = (platform: keyof FooterConfig['socialLinks'], value: string) => {
    updateConfig({
      socialLinks: {
        ...config.socialLinks,
        [platform]: value
      }
    })
  }

  // If control panel is not shown, just render the footer
  if (!showControlPanel) {
    return <Footer config={config} />
  }

  // Render with control panel
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#111827' }}>
      {/* Left Sidebar - Checkbox */}
      <div className="w-64 border-r border-gray-700 overflow-y-auto" style={{ backgroundColor: '#1f2937' }}>
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Footer Instellingen</h1>
          <p className="text-sm text-gray-400 mt-1">Pas de footer aan en bekijk live preview</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 p-4 border border-gray-600 rounded-lg bg-gray-800">
            <label htmlFor="showFooter" className="text-sm font-medium text-white">
              Footer weergeven
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="showFooter"
                checked={config.showFooter}
                onChange={(e) => updateConfig({ showFooter: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content - Live Preview */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-700 p-4" style={{ backgroundColor: '#1f2937' }}>
          <h2 className="text-xl font-semibold text-white">Live Preview</h2>
          <p className="text-sm text-gray-400">Wijzigingen worden direct getoond</p>
        </div>
        <div className="flex-1 overflow-auto p-8" ref={previewRef} style={{ backgroundColor: '#111827' }}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 min-h-[60vh] p-8 mb-0 rounded">
              <h1 className="text-3xl font-bold mb-4 text-white">Voorbeeld Pagina</h1>
              <p className="text-gray-300 mb-4">
                Dit is een voorbeeldpagina om de footer in context te zien. Scroll naar beneden om de footer te bekijken.
              </p>
              <div className="space-y-4">
                <div className="h-32 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            </div>
            <Footer config={config} />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Options Box */}
      <div className="w-80 border-l border-gray-700 overflow-y-auto" style={{ backgroundColor: '#1f2937' }}>
        <div className="p-4">
          <div className="border border-gray-600 rounded-lg bg-gray-800 p-4">
            <div className="space-y-0">
              {/* Layout Section */}
              <div className="border-b border-gray-600 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('layout')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Layout</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.layout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.layout && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">Footer Layout</label>
                      <div className="flex flex-col gap-4">
                        {['layout1', 'layout2', 'layout3'].map((layoutOption) => (
                          <button
                            key={layoutOption}
                            onClick={() => updateConfig({ layout: layoutOption as 'layout1' | 'layout2' | 'layout3' })}
                            className={`relative border-2 rounded-lg overflow-hidden transition-all w-full ${
                              config.layout === layoutOption
                                ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={`/footer ${layoutOption.replace('layout', '')}.png`}
                              alt={`Footer ${layoutOption}`}
                              className="w-full h-auto object-contain"
                            />
                            {config.layout === layoutOption && (
                              <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Padding: {config.padding}px</label>
                      <input
                        type="range"
                        min="24"
                        max="96"
                        value={config.padding}
                        onChange={(e) => updateConfig({ padding: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="showBottomDivider" className="text-xs font-medium text-gray-300">Scheidingsstreep</label>
                      <input
                        type="checkbox"
                        id="showBottomDivider"
                        checked={config.showBottomDivider}
                        onChange={(e) => updateConfig({ showBottomDivider: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Colors Section */}
              <div className="border-b border-gray-600 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('colors')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Kleuren</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.colors && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'backgroundColor', label: 'Achtergrondkleur' },
                      { key: 'textColor', label: 'Tekstkleur' },
                      { key: 'linkColor', label: 'Linkkleur' },
                      { key: 'linkHoverColor', label: 'Link hover kleur' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-300 mb-1">{label}</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={config[key as keyof FooterConfig] as string}
                            onChange={(e) => updateConfig({ [key]: e.target.value } as Partial<FooterConfig>)}
                            className="w-8 h-8 rounded border border-gray-600 cursor-pointer flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={config[key as keyof FooterConfig] as string}
                            onChange={(e) => updateConfig({ [key]: e.target.value } as Partial<FooterConfig>)}
                            style={{ width: '72px' }}
                            className="px-1.5 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Links Section */}
              <div className="border-b border-gray-600 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('socialLinks')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Social Media Links</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.socialLinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.socialLinks && (
                  <div className="space-y-3">
                    {[
                      { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                      { key: 'x', label: 'X (Twitter) URL', placeholder: 'https://x.com/...' },
                      { key: 'discord', label: 'Discord URL', placeholder: 'https://discord.gg/...' },
                      { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                      { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
                      { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/...' }
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-300 mb-1">{label}</label>
                        <input
                          type="text"
                          value={config.socialLinks[key as keyof FooterConfig['socialLinks']] || ''}
                          onChange={(e) => updateSocialLink(key as keyof FooterConfig['socialLinks'], e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logo Section */}
              <div className="border-b border-gray-600 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('logo')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Logo</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.logo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.logo && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Logo Upload</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('Bestand is te groot. Maximum grootte is 5MB.')
                                return
                              }
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const result = event.target?.result as string
                                if (result) {
                                  updateConfig({ logoUrl: result })
                                }
                              }
                              reader.onerror = () => {
                                alert('Fout bij het lezen van het bestand.')
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs cursor-pointer bg-gray-800 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {config.logoUrl && config.logoUrl.trim() !== '' && (
                          <div className="relative">
                            <div className="border border-gray-600 rounded p-3 bg-gray-800">
                              <img src={config.logoUrl} alt="Logo preview" className="max-h-24 w-auto mx-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                            <button onClick={() => updateConfig({ logoUrl: '' })} className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition">
                              Logo Verwijderen
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Upload een afbeelding voor je logo (max 5MB)</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Logo Tekst (fallback)</label>
                      <input
                        type="text"
                        value={config.logoText || ''}
                        onChange={(e) => updateConfig({ logoText: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                        placeholder="LOGO"
                      />
                      <p className="text-xs text-gray-400 mt-1">Wordt gebruikt als er geen logo is geüpload</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links Section */}
              <div className="border-b border-gray-600 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('navigationLinks')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Navigatie Links</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.navigationLinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.navigationLinks && (
                  <div className="space-y-3">
                    {(['home', 'info', 'bracket', 'location'] as const).map((key) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-300 mb-1 capitalize">{key}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={config.navigationLinks[key].label}
                            onChange={(e) => updateNavigationLink(key, 'label', e.target.value)}
                            className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={config.navigationLinks[key].url}
                            onChange={(e) => updateNavigationLink(key, 'url', e.target.value)}
                            className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                            placeholder="/url"
                          />
                        </div>
                        {renderSubItems(key)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copyright Section */}
              <div className="pb-4">
                <button
                  onClick={() => toggleSection('copyright')}
                  className="w-full flex items-center justify-between text-base font-semibold text-white py-2 px-2 -mx-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span>Copyright</span>
                  <svg className={`w-5 h-5 transition-transform ${openSections.copyright ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSections.copyright && (
                  <div>
                    <textarea
                      value={config.copyrightText}
                      onChange={(e) => updateConfig({ copyrightText: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                      rows={2}
                      placeholder="Copyright tekst"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

