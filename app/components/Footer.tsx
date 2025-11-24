'use client'

import React from 'react'
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
    twitter?: string
    discord?: string
    facebook?: string
    youtube?: string
  }
  links: FooterLink[]
  layout: 'layout1' | 'layout2' | 'layout3'
  padding: number
  showDivider: boolean
  showBottomDivider: boolean
  logoUrl?: string
  logoText?: string
  navigationLinks: {
    home: { label: string; url: string }
    info: { label: string; url: string }
    bracket: { label: string; url: string }
    location: { label: string; url: string }
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

interface FooterProps {
  config?: Partial<FooterConfig>
}

export default function Footer({ config = {} }: FooterProps) {
  const finalConfig: FooterConfig = { ...defaultConfig, ...config }
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
  } = finalConfig

  if (!showFooter) {
    return null
  }


  const renderSocialLinks = () => {
    if (!showSocialLinks) return null

    const activeSocials = Object.entries(socialLinks).filter(([_, url]) => url && url.trim() !== '')
    if (activeSocials.length === 0) return null

    return (
      <div className="flex gap-4 flex-wrap">
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'inline-block'
            }}
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
            Instagram
          </a>
        )}
        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'inline-block'
            }}
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
            Twitter
          </a>
        )}
        {socialLinks.discord && (
          <a
            href={socialLinks.discord}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'inline-block'
            }}
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
            Discord
          </a>
        )}
        {socialLinks.facebook && (
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'inline-block'
            }}
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
            Facebook
          </a>
        )}
        {socialLinks.youtube && (
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'inline-block'
            }}
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
            YouTube
          </a>
        )}
      </div>
    )
  }

  const renderLogo = () => {
    // Check if logoUrl exists and is not empty after trimming
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
              // Fallback to text logo if image fails to load
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

  const renderNavigationLink = (link: { label: string; url: string }) => (
    <Link
      href={link.url}
      style={{
        color: linkColor,
        transition: 'all 0.3s ease',
        position: 'relative',
        display: 'inline-block'
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
  )

  // Layout 1: Links logo, rechts 4 stukken met info, rechts onder socials
  const renderLayout1 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
        {/* Logo Links */}
        <div className="md:col-span-3">
          {renderLogo()}
        </div>

        {/* Navigation Links Rechts */}
        <div className="md:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderNavigationLink(navigationLinks.home)}
            {renderNavigationLink(navigationLinks.info)}
            {renderNavigationLink(navigationLinks.bracket)}
            {renderNavigationLink(navigationLinks.location)}
          </div>
        </div>
      </div>

      {/* Copyright Links, Socials Rechts */}
      <div className={`flex justify-between items-center pt-6 ${showBottomDivider ? 'border-t' : ''}`} style={showBottomDivider ? { borderColor: `${linkColor}20` } : {}}>
        {copyrightText && (
          <div
            style={{
              color: linkColor,
              fontSize: '0.875rem'
            }}
          >
            {copyrightText}
          </div>
        )}
        <div className="flex justify-end">
          {renderSocialLinks()}
        </div>
      </div>
    </>
  )

  // Layout 2: Links 4 stukken met info, rechts logo met socials linksonder
  const renderLayout2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
        {/* Navigation Links Links */}
        <div className="md:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderNavigationLink(navigationLinks.home)}
            {renderNavigationLink(navigationLinks.info)}
            {renderNavigationLink(navigationLinks.bracket)}
            {renderNavigationLink(navigationLinks.location)}
          </div>
        </div>

        {/* Logo Rechts */}
        <div className="md:col-span-3 flex justify-end md:justify-start">
          {renderLogo()}
        </div>
      </div>

      {/* Socials Links, Copyright Rechts */}
      <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: `${linkColor}20` }}>
        <div className="flex justify-start">
          {renderSocialLinks()}
        </div>
        {copyrightText && (
          <div
            style={{
              color: linkColor,
              fontSize: '0.875rem'
            }}
          >
            {copyrightText}
          </div>
        )}
      </div>
    </>
  )

  // Layout 3: Links 2 stukken, rechts 2 stukken, logo in het midden, socials rechtsonderin
  const renderLayout3 = () => (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-6">
        {/* Links 2 stukken */}
        <div className="flex flex-row gap-6">
          {renderNavigationLink(navigationLinks.home)}
          {renderNavigationLink(navigationLinks.info)}
        </div>

        {/* Logo in het midden */}
        <div className="flex justify-center">
          {renderLogo()}
        </div>

        {/* Rechts 2 stukken */}
        <div className="flex flex-row gap-6">
          {renderNavigationLink(navigationLinks.bracket)}
          {renderNavigationLink(navigationLinks.location)}
        </div>
      </div>

      {/* Copyright Links, Socials Rechts */}
      <div className={`flex justify-between items-center pt-6 ${showBottomDivider ? 'border-t' : ''}`} style={showBottomDivider ? { borderColor: `${linkColor}20` } : {}}>
        {copyrightText && (
          <div
            style={{
              color: linkColor,
              fontSize: '0.875rem'
            }}
          >
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
      {showDivider && (
        <div
          style={{
            borderTop: `1px solid ${linkColor}20`,
            marginBottom: `${padding / 2}px`
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-6">
        {renderLayout()}
      </div>
    </footer>
  )
}

