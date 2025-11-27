'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { parseComponentsFromHTML, Component, updateComponentInHTML } from '../utils/component-parser'

// Color Picker Component - Volledig nieuw vanaf scratch
function ColorPicker({ 
  color, 
  onColorChange, 
  onClose 
}: { 
  color: string
  onColorChange: (color: string) => void
  onClose: () => void
}) {
  // Helper functions
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
    }
    return { r: f(0), g: f(8), b: f(4) }
  }

  // Initialize state
  const initColor = color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#ff0000'
  const initHsl = hexToHsl(initColor)
  const [hue, setHue] = useState(initHsl.h)
  const [saturation, setSaturation] = useState(initHsl.s)
  const [lightness, setLightness] = useState(initHsl.l)
  const [rgb, setRgb] = useState(hslToRgb(initHsl.h, initHsl.s, initHsl.l))

  const pickerRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const draggingType = useRef<'picker' | 'hue' | null>(null)
  const onColorChangeRef = useRef(onColorChange)
  const lastColorRef = useRef<string>('')
  const isInternalUpdateRef = useRef(false)

  // Keep ref updated
  useEffect(() => {
    onColorChangeRef.current = onColorChange
  }, [onColorChange])

  // Sync with color prop
  useEffect(() => {
    if (color && /^#[0-9A-Fa-f]{6}$/.test(color) && color !== lastColorRef.current && !isInternalUpdateRef.current) {
      const hsl = hexToHsl(color)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
      setRgb(hslToRgb(hsl.h, hsl.s, hsl.l))
      lastColorRef.current = color
    }
    isInternalUpdateRef.current = false
  }, [color])

  // Update color when HSL changes
  useEffect(() => {
    const newHex = hslToHex(hue, saturation, lightness)
    setRgb(hslToRgb(hue, saturation, lightness))
    
    if (newHex !== lastColorRef.current) {
      lastColorRef.current = newHex
      isInternalUpdateRef.current = true
      onColorChangeRef.current(newHex)
    }
  }, [hue, saturation, lightness])

  // Saturation/Lightness picker - STANDARD FORMULE
  const updatePicker = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (!pickerRef.current) return
    const rect = pickerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    // STANDARD HSL: S = x * 100%, L = 100% - (y * 50%)
    setSaturation(x * 100)
    setLightness(100 - (y * 50))
  }

  const handlePickerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    draggingType.current = 'picker'
    updatePicker(e)
  }

  // Hue slider
  const updateHue = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHue(x * 360)
  }

  const handleHueDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    draggingType.current = 'hue'
    updateHue(e)
  }

  // Mouse events
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      if (draggingType.current === 'picker') updatePicker(e)
      else if (draggingType.current === 'hue') updateHue(e)
    }

    const handleUp = () => {
      isDragging.current = false
      draggingType.current = null
    }

    document.addEventListener('mousemove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [])

  // RGB input handler
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) }
    setRgb(newRgb)
    
    const r = newRgb.r / 255, g = newRgb.g / 255, b = newRgb.b / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    setHue(h * 360)
    setSaturation(s * 100)
    setLightness(l * 100)
  }

  const displayColor = hslToHex(hue, saturation, lightness)
  const indicatorTop = ((100 - lightness) / 50) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Kleur Kiezen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Saturation/Lightness Picker */}
        <div className="mb-4">
          <div
            ref={pickerRef}
            className="w-full h-64 rounded-lg cursor-crosshair relative overflow-hidden border border-gray-700 select-none"
            style={{
              background: `
                linear-gradient(to bottom, transparent, black),
                linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
              `
            }}
            onMouseDown={handlePickerDown}
            onClick={(e) => !isDragging.current && updatePicker(e)}
          >
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none z-10"
              style={{
                left: `${saturation}%`,
                top: `${Math.max(0, Math.min(100, indicatorTop))}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
              }}
            />
          </div>
        </div>

        {/* Hue Slider */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-lg border-2 border-gray-600 shadow-lg flex-shrink-0" style={{ backgroundColor: displayColor }} />
          <div className="flex-1">
            <div
              ref={hueRef}
              className="w-full h-6 rounded-lg cursor-pointer relative overflow-hidden border border-gray-700 select-none"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
              onMouseDown={handleHueDown}
              onClick={(e) => !isDragging.current && updateHue(e)}
            >
              <div
                className="absolute top-0 bottom-0 w-2 border-2 border-white shadow-lg pointer-events-none z-10"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Hex Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">Hex Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={displayColor.toUpperCase()}
              onChange={(e) => {
                let val = e.target.value.trim().toUpperCase()
                if (val && !val.startsWith('#')) val = '#' + val
                if (val.startsWith('#')) {
                  const hex = val.slice(1).replace(/[^0-9A-F]/g, '').slice(0, 6)
                  if (hex.length === 6) {
                    const hsl = hexToHsl('#' + hex)
                    setHue(hsl.h)
                    setSaturation(hsl.s)
                    setLightness(hsl.l)
                  }
                }
              }}
              className="flex-1 px-2 py-1.5 bg-gray-900/60 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#482CFF]"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* RGB Inputs */}
        <div className="grid grid-cols-3 gap-3">
          {(['r', 'g', 'b'] as const).map((ch) => (
            <div key={ch}>
              <label className="block text-gray-400 text-xs mb-1">{ch.toUpperCase()}</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb[ch]}
                onChange={(e) => handleRgbChange(ch, parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-gray-900/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ComponentEditorProps {
  html: string
  css: string
  js: string
  onCodeChange?: (html: string, css: string, js: string) => void
  viewport?: 'desktop' | 'tablet' | 'mobile'
  onViewportChange?: (viewport: 'desktop' | 'tablet' | 'mobile') => void
  onSaveDraft?: () => Promise<void>
  onPublish?: () => Promise<void>
  isSaving?: boolean
  tournamentName?: string
}

interface PageSettings {
  viewport: 'desktop' | 'tablet' | 'mobile'
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

interface FontSettings {
  titleFamily: string
  titleWeight: string
  titleSize: string
  textFamily: string
  textWeight: string
  textSize: string
}

export default function ComponentEditor({ 
  html, 
  css, 
  js, 
  onCodeChange,
  viewport: externalViewport,
  onViewportChange,
  onSaveDraft,
  onPublish,
  isSaving = false,
  tournamentName = ''
}: ComponentEditorProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [editedHtml, setEditedHtml] = useState(html)
  const [editedCss, setEditedCss] = useState(css)
  const [editedJs, setEditedJs] = useState(js)
  const [activeLeftTab, setActiveLeftTab] = useState<'components' | 'colors' | 'fonts' | 'publish'>('components')
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    viewport: externalViewport || 'desktop',
    primaryColor: '#482CFF',
    secondaryColor: '#420AB2',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  })
  // Extract font settings from CSS
  const extractFontSettings = useCallback((css: string): FontSettings => {
    // Default values
    let titleFamily = 'Inter'
    let titleWeight = '700'
    let titleSize = '16'
    let textFamily = 'Inter'
    let textWeight = '400'
    let textSize = '11'

    if (!css || css.trim().length === 0) {
      return { titleFamily, titleWeight, titleSize, textFamily, textWeight, textSize }
    }

    // First, extract CSS variable definitions from :root
    const cssVariables: { [key: string]: string } = {}
    const rootMatch = css.match(/:root\s*\{([^}]+)\}/i)
    if (rootMatch) {
      const rootContent = rootMatch[1]
      // Match --font-primary: 'Playfair Display', serif;
      const fontPrimaryMatch = rootContent.match(/--font-primary:\s*['"]?([^'";,}]+)['"]?/i)
      if (fontPrimaryMatch && fontPrimaryMatch[1]) {
        cssVariables['--font-primary'] = fontPrimaryMatch[1].trim().replace(/['"]/g, '').split(',')[0].trim()
      }
      const fontSecondaryMatch = rootContent.match(/--font-secondary:\s*['"]?([^'";,}]+)['"]?/i)
      if (fontSecondaryMatch && fontSecondaryMatch[1]) {
        cssVariables['--font-secondary'] = fontSecondaryMatch[1].trim().replace(/['"]/g, '').split(',')[0].trim()
      }
    }

    // Helper function to resolve CSS variable or return direct value
    const resolveFontFamily = (value: string): string => {
      const varMatch = value.match(/var\(--font-(primary|secondary)\)/i)
      if (varMatch) {
        const varName = `--font-${varMatch[1]}`
        return cssVariables[varName] || value
      }
      return value.trim().replace(/['"]/g, '').split(',')[0].trim()
    }

    // Try to extract title font settings - look for h1, h2, h3, or .title
    const titleFamilyMatches = [
      css.match(/h1[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/h2[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/h3[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/h1,\s*h2,\s*h3[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/\.title[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/\[class\*="title"\][^{]*\{[^}]*font-family:\s*([^;]+);/i)
    ]
    for (const match of titleFamilyMatches) {
      if (match && match[1]) {
        const resolved = resolveFontFamily(match[1])
        if (resolved && resolved !== 'sans-serif' && resolved !== 'serif' && resolved !== 'monospace' && !resolved.startsWith('var(')) {
          titleFamily = resolved
          break
        }
      }
    }

    // If we found a CSS variable for font-primary, use it for titles
    if (cssVariables['--font-primary']) {
      titleFamily = cssVariables['--font-primary']
    }

    // Try to extract title font-weight - check multiple selectors
    const titleWeightMatches = [
      css.match(/\.hero-title[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/\.section-title[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/h1[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/h2[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/h3[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/h1,\s*h2,\s*h3[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/\.title[^{]*\{[^}]*font-weight:\s*(\d+)/i)
    ]
    for (const match of titleWeightMatches) {
      if (match && match[1]) {
        titleWeight = match[1]
        break
      }
    }

    // Try to extract title font-size - check multiple selectors
    // Priority: hero-title > section-title > h1 > h2 > h3 > general title
    const titleSizeMatches = [
      { selector: /\.hero-title[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 1 },
      { selector: /\.section-title[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 2 },
      { selector: /h1[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 3 },
      { selector: /h2[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 4 },
      { selector: /h3[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 5 },
      { selector: /h1,\s*h2,\s*h3[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 6 },
      { selector: /\.title[^{]*\{[^}]*font-size:\s*([^;]+);/i, priority: 7 }
    ]
    
    // Sort by priority and try each match
    titleSizeMatches.sort((a, b) => a.priority - b.priority)
    
    for (const { selector } of titleSizeMatches) {
      const match = css.match(selector)
      if (match && match[1]) {
        const sizeValue = match[1].trim()
        let extractedSize: string | null = null
        
        // Try to extract from clamp() - prioritize max value (most representative of actual size)
        const clampMatch = sizeValue.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
        if (clampMatch) {
          // For clamp(), use the max value as it's the most representative of the actual rendered size
          const maxValue = clampMatch[3].trim()
          const maxPx = maxValue.match(/(\d+)px/)
          if (maxPx && maxPx[1]) {
            extractedSize = maxPx[1]
          } else {
            // Try max value in rem (convert to px)
            const maxRem = maxValue.match(/(\d+\.?\d*)rem/)
            if (maxRem && maxRem[1]) {
              extractedSize = Math.round(parseFloat(maxRem[1]) * 16).toString()
            } else {
              // Fallback to middle value if it has px
              const middleValue = clampMatch[2].trim()
              const middlePx = middleValue.match(/(\d+)px/)
              if (middlePx && middlePx[1]) {
                extractedSize = middlePx[1]
              }
            }
          }
        } else {
          // Try direct px value
          const pxMatch = sizeValue.match(/(\d+)px/)
          if (pxMatch && pxMatch[1]) {
            extractedSize = pxMatch[1]
          } else {
            // Try rem value (convert to px, assuming 16px base)
            const remMatch = sizeValue.match(/(\d+\.?\d*)rem/)
            if (remMatch && remMatch[1]) {
              extractedSize = Math.round(parseFloat(remMatch[1]) * 16).toString()
            }
          }
        }
        
        if (extractedSize) {
          titleSize = extractedSize
          break
        }
      }
    }

    // Try to extract text font settings - look for body or p
    const textFamilyMatches = [
      css.match(/body[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/p[^{]*\{[^}]*font-family:\s*([^;]+);/i),
      css.match(/\*\s*\{[^}]*font-family:\s*([^;]+);/i)
    ]
    for (const match of textFamilyMatches) {
      if (match && match[1]) {
        const resolved = resolveFontFamily(match[1])
        if (resolved && resolved !== 'sans-serif' && resolved !== 'serif' && resolved !== 'monospace' && !resolved.startsWith('var(')) {
          textFamily = resolved
          break
        }
      }
    }

    // If we found a CSS variable for font-secondary, use it for text
    if (cssVariables['--font-secondary']) {
      textFamily = cssVariables['--font-secondary']
    }

    // Try to extract text font-weight - check body, p, and other text selectors
    const textWeightMatches = [
      css.match(/body[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/p[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/\*\s*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/\.hero-subtitle[^{]*\{[^}]*font-weight:\s*(\d+)/i),
      css.match(/\.section-description[^{]*\{[^}]*font-weight:\s*(\d+)/i)
    ]
    for (const match of textWeightMatches) {
      if (match && match[1]) {
        textWeight = match[1]
        break
      }
    }

    // Try to extract text font-size - check body, p, and other text selectors
    const textSizeMatches = [
      css.match(/body[^{]*\{[^}]*font-size:\s*([^;]+);/i),
      css.match(/p[^{]*\{[^}]*font-size:\s*([^;]+);/i),
      css.match(/\*\s*\{[^}]*font-size:\s*([^;]+);/i),
      css.match(/\.hero-subtitle[^{]*\{[^}]*font-size:\s*([^;]+);/i),
      css.match(/\.section-description[^{]*\{[^}]*font-size:\s*([^;]+);/i)
    ]
    for (const match of textSizeMatches) {
      if (match && match[1]) {
        const sizeValue = match[1].trim()
        // Try direct px value
        const pxMatch = sizeValue.match(/(\d+)px/)
        if (pxMatch && pxMatch[1]) {
          textSize = pxMatch[1]
          break
        }
        // Try rem value (convert to px, assuming 16px base)
        const remMatch = sizeValue.match(/(\d+\.?\d*)rem/)
        if (remMatch && remMatch[1]) {
          textSize = Math.round(parseFloat(remMatch[1]) * 16).toString()
          break
        }
        // Try clamp() for text
        const clampMatch = sizeValue.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
        if (clampMatch) {
          const middleValue = clampMatch[2].trim()
          const middlePx = middleValue.match(/(\d+)px/)
          if (middlePx && middlePx[1]) {
            textSize = middlePx[1]
            break
          }
        }
      }
    }

    return {
      titleFamily,
      titleWeight,
      titleSize,
      textFamily,
      textWeight,
      textSize
    }
  }, [])

  const [fontSettings, setFontSettings] = useState<FontSettings>(() => {
    return extractFontSettings(css)
  })
  const [originalFontSettings, setOriginalFontSettings] = useState<FontSettings>(() => {
    return extractFontSettings(css)
  })
  const [fontSettingsModified, setFontSettingsModified] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState<{ type: 'background' | 'color' | null }>({ type: null })
  const [currentColors, setCurrentColors] = useState<{ backgroundColor?: string; color?: string }>({})

  // Initialize current colors when component is selected
  useEffect(() => {
    if (selectedComponent) {
      setCurrentColors({
        backgroundColor: selectedComponent.styles.backgroundColor,
        color: selectedComponent.styles.color
      })
    }
  }, [selectedComponent?.id])

  // Sync external viewport prop
  useEffect(() => {
    if (externalViewport) {
      setPageSettings(prev => ({ ...prev, viewport: externalViewport }))
    }
  }, [externalViewport])

  const handleViewportChange = (viewport: 'desktop' | 'tablet' | 'mobile') => {
    setPageSettings(prev => ({ ...prev, viewport }))
    if (onViewportChange) {
      onViewportChange(viewport)
    }
  }
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onCodeChangeRef = useRef(onCodeChange)
  const lastParsedRef = useRef<{ html: string; css: string }>({ html: '', css: '' })
  const lastComponentsRef = useRef<Component[]>([])
  const isParsingRef = useRef(false)
  const isApplyingFontsRef = useRef(false)
  const lastAppliedFontsRef = useRef<string>('')

  // Keep ref updated
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange
  }, [onCodeChange])

  // Helper function to ensure navigation format CSS exists
  const ensureNavigationFormatCSS = useCallback((cssContent: string): string => {
    // Check if navigation format CSS already exists
    if (cssContent.includes('[data-nav-format="default"]') || cssContent.includes('.nav-format-default')) {
      return cssContent
    }
    
    // Add navigation format CSS if it doesn't exist
    const navigationFormatCSS = `
/* Navigation Format Styles - Auto-generated */
[data-nav-format="default"] .nav-container,
.nav-format-default .nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

[data-nav-format="default"] .nav-logo,
.nav-format-default .nav-logo {
  flex-shrink: 0;
}

[data-nav-format="default"] .nav-links,
.nav-format-default .nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

[data-nav-format="centered"] .nav-container,
.nav-format-centered .nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  position: relative;
}

[data-nav-format="centered"] .nav-logo,
.nav-format-centered .nav-logo {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

[data-nav-format="centered"] .nav-logo img,
.nav-format-centered .nav-logo img {
  pointer-events: auto;
}

[data-nav-format="centered"] .nav-links,
.nav-format-centered .nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  position: relative;
  z-index: 1;
  gap: 2rem;
}

/* First 2 links go to the left */
[data-nav-format="centered"] .nav-links li:nth-child(1),
.nav-format-centered .nav-links li:nth-child(1),
[data-nav-format="centered"] .nav-links li:nth-child(2),
.nav-format-centered .nav-links li:nth-child(2) {
  margin-right: auto;
  order: 0;
}

/* Spacer element (added via JavaScript) */
[data-nav-format="centered"] .nav-links .nav-spacer,
.nav-format-centered .nav-links .nav-spacer {
  flex: 1;
  order: 1;
  min-width: 150px;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Links from 3rd onwards go to the right */
[data-nav-format="centered"] .nav-links li:nth-child(n+3):not(.nav-spacer),
.nav-format-centered .nav-links li:nth-child(n+3):not(.nav-spacer) {
  order: 2;
  margin-left: auto;
}

[data-nav-format="minimal"] .nav-container,
.nav-format-minimal .nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
}

[data-nav-format="minimal"] .nav-logo,
.nav-format-minimal .nav-logo {
  flex-shrink: 0;
}

[data-nav-format="minimal"] .nav-links,
.nav-format-minimal .nav-links {
  display: flex;
  list-style: none;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

[data-nav-format="spacious"] .nav-container,
.nav-format-spacious .nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 4rem;
}

[data-nav-format="spacious"] .nav-logo,
.nav-format-spacious .nav-logo {
  flex-shrink: 0;
}

[data-nav-format="spacious"] .nav-links,
.nav-format-spacious .nav-links {
  display: flex;
  list-style: none;
  gap: 3rem;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin: 0;
}

.nav-links a {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.7;
}
`
    
    return cssContent.trim() + '\n\n' + navigationFormatCSS.trim()
  }, [])

  // Update local state when props change (important for loading existing code)
  useEffect(() => {
    setEditedHtml(html)
  }, [html])

  useEffect(() => {
    // Only update if CSS actually changed (prevent infinite loops)
    if (editedCss === css) return
    
    // Ensure navigation format CSS exists
    const cssWithNav = ensureNavigationFormatCSS(css)
    setEditedCss(cssWithNav)
    // Extract font settings from new CSS when it changes
    const extracted = extractFontSettings(css)
    
    // Only update original font settings if they're different from current original
    // This prevents resetting when CSS is updated with our own font changes
    setOriginalFontSettings(prev => {
      // If font settings haven't been manually modified, update original
      if (!fontSettingsModified) {
        return extracted
      }
      // If they have been modified, keep the original (don't reset it)
      return prev
    })
    
    // Only reset font settings if they haven't been manually modified
    // This prevents overwriting user changes when CSS prop updates
    if (!fontSettingsModified) {
      setFontSettings(extracted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [css])

  useEffect(() => {
    setEditedJs(js)
  }, [js])

  // Parse components when HTML changes
  useEffect(() => {
    // Prevent infinite loops: don't parse if already parsing or if nothing changed
    if (isParsingRef.current) return
    if (lastParsedRef.current.html === editedHtml && lastParsedRef.current.css === editedCss) {
      return
    }
    
    isParsingRef.current = true
    
    try {
      const parsed = parseComponentsFromHTML(editedHtml, editedCss)
      
      // Check if components actually changed before updating state
      const componentsChanged = 
        lastComponentsRef.current.length !== parsed.length ||
        lastComponentsRef.current.some((comp, idx) => {
          const newComp = parsed[idx]
          return !newComp || comp.id !== newComp.id || comp.type !== newComp.type
        })
      
      if (componentsChanged) {
        // Preserve logo properties from existing components when updating
        const updatedParsed = parsed.map(newComp => {
          const existingComp = components.find(c => c.id === newComp.id)
          if (existingComp && existingComp.properties.logo && newComp.properties.logo) {
            // If existing component has a logo with src, preserve it
            const existingLogo = existingComp.properties.logo as { src?: string; alt?: string }
            const newLogo = newComp.properties.logo as { src?: string; alt?: string }
            // Preserve existing logo if it's a data URL (uploaded) and new logo is empty or not a data URL
            if (existingLogo.src && existingLogo.src.startsWith('data:') && (!newLogo.src || newLogo.src === '' || newLogo.src === 'data:,' || (!newLogo.src.startsWith('data:') && newLogo.src !== existingLogo.src))) {
              return {
                ...newComp,
                properties: {
                  ...newComp.properties,
                  logo: existingLogo
                }
              }
            }
            // Also preserve if new logo src matches existing (to prevent overwriting)
            if (existingLogo.src && newLogo.src && existingLogo.src === newLogo.src) {
              return {
                ...newComp,
                properties: {
                  ...newComp.properties,
                  logo: existingLogo
                }
              }
            }
          }
          return newComp
        })
        
        // Update refs to track what we've parsed
        lastParsedRef.current = { html: editedHtml, css: editedCss }
        lastComponentsRef.current = updatedParsed
        setComponents(updatedParsed)
      } else {
        // Even if components didn't change, update the parsed ref to prevent re-parsing
        lastParsedRef.current = { html: editedHtml, css: editedCss }
      }
    } catch (error) {
      console.error('Error parsing components:', error)
    } finally {
      // Reset flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isParsingRef.current = false
      }, 0)
    }
  }, [editedHtml, editedCss, editedJs])

  // Apply font settings to CSS and update via onCodeChange
  // Only apply if font settings have been modified by user
  useEffect(() => {
    if (!onCodeChangeRef.current || !fontSettingsModified) return
    if (isApplyingFontsRef.current) return

    // Create a signature of current font settings to check if we've already applied them
    const fontSignature = `${fontSettings.titleFamily}-${fontSettings.titleWeight}-${fontSettings.titleSize}-${fontSettings.textFamily}-${fontSettings.textWeight}-${fontSettings.textSize}`
    if (lastAppliedFontsRef.current === fontSignature) return

    isApplyingFontsRef.current = true

    // Remove existing font style rules from CSS (if any)
    // Remove both old and new format font rules
    let cleanCss = editedCss
    // Remove font-related rules that we'll add dynamically (old format)
    cleanCss = cleanCss.replace(/\/\* Title Font Settings \*\/[\s\S]*?\/\* Text Font Settings \*\/[\s\S]*?\/\* Override for elements[\s\S]*?\}/g, '')
    // Remove new format font rules (with multiple patterns to catch all variations)
    cleanCss = cleanCss.replace(/\/\* Title Font Settings \*\/[\s\S]*?\/\* Apply text font to links[\s\S]*?\}/g, '')
    cleanCss = cleanCss.replace(/\/\* Title Font Settings \*\/[\s\S]*?\/\* Apply text font to paragraphs[\s\S]*?\}/g, '')
    // Also remove any font-size, font-weight, font-family rules from h1-h6 and .hero-title, .section-title that we might have added
    // This ensures we start with a clean slate
    cleanCss = cleanCss.replace(/h1[^{]*\{[^}]*font-(?:size|weight|family):[^;]+;?[^}]*\}/gi, (match) => {
      // Remove only font-* properties, keep other properties
      return match.replace(/font-(?:size|weight|family):[^;]+;?/gi, '').replace(/\{[\s]*\}/g, '')
    })

    // Check if font settings differ from original
    const hasChanges = 
      fontSettings.titleFamily !== originalFontSettings.titleFamily ||
      fontSettings.titleWeight !== originalFontSettings.titleWeight ||
      fontSettings.titleSize !== originalFontSettings.titleSize ||
      fontSettings.textFamily !== originalFontSettings.textFamily ||
      fontSettings.textWeight !== originalFontSettings.textWeight ||
      fontSettings.textSize !== originalFontSettings.textSize

    if (!hasChanges) {
      // If no changes, just use clean CSS without font overrides
      const finalCss = cleanCss.trim()
      // Only update if CSS actually changed (prevent infinite loops)
      if (editedCss !== finalCss) {
        setEditedCss(finalCss)
        if (onCodeChangeRef.current) {
          onCodeChangeRef.current(editedHtml, finalCss, editedJs)
        }
      }
      return
    }

    // Add new font styles only if they differ from original
    // Use more specific selectors to ensure they override original CSS
    const fontStyles = `
      /* Title Font Settings - Applied with high specificity */
      h1, h2, h3, h4, h5, h6,
      .title, [class*="title"],
      .hero-title, .section-title,
      h1 *, h2 *, h3 *, h4 *, h5 *, h6 *,
      .title *, [class*="title"] *,
      .hero-title *, .section-title * {
        font-family: '${fontSettings.titleFamily}', sans-serif !important;
        font-weight: ${fontSettings.titleWeight} !important;
        font-size: ${fontSettings.titleSize}px !important;
      }

      /* Text Font Settings */
      body {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }

      /* Apply text font to paragraphs and general text elements */
      p, span:not([class*="title"]):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6),
      .text, [class*="text"]:not([class*="title"]),
      .hero-subtitle, .section-description,
      .timeline-description, .about-text, .register-description,
      .faq-answer, .footer-tagline, .footer-copyright {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }

      /* Apply text font to links and list items */
      a:not([class*="title"]):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6),
      li:not([class*="title"]) {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }
    `

    const updatedCss = cleanCss.trim() + '\n' + fontStyles
    
    // Only update if CSS actually changed (prevent infinite loops)
    if (editedCss !== updatedCss) {
      lastAppliedFontsRef.current = fontSignature
      setEditedCss(updatedCss)
      
      // Notify parent of CSS change using ref to avoid dependency issues
      if (onCodeChangeRef.current) {
        onCodeChangeRef.current(editedHtml, updatedCss, editedJs)
      }
    } else {
      lastAppliedFontsRef.current = fontSignature
    }
    
    // Reset flag after a short delay
    setTimeout(() => {
      isApplyingFontsRef.current = false
    }, 0)
  }, [fontSettings, editedHtml, editedJs, fontSettingsModified, originalFontSettings])

  // Generate preview HTML with font settings applied
  useEffect(() => {
    // Only add font styles to preview if they've been modified
    let cssWithFonts = editedCss
    if (fontSettingsModified) {
      // Check if font settings differ from original
      const hasChanges = 
        fontSettings.titleFamily !== originalFontSettings.titleFamily ||
        fontSettings.titleWeight !== originalFontSettings.titleWeight ||
        fontSettings.titleSize !== originalFontSettings.titleSize ||
        fontSettings.textFamily !== originalFontSettings.textFamily ||
        fontSettings.textWeight !== originalFontSettings.textWeight ||
        fontSettings.textSize !== originalFontSettings.textSize

      if (hasChanges) {
        // Remove existing font overrides (both old and new format)
        cssWithFonts = cssWithFonts.replace(/\/\* Title Font Settings \*\/[\s\S]*?\/\* Text Font Settings \*\/[\s\S]*?\/\* Override for elements[\s\S]*?\}/g, '')
        cssWithFonts = cssWithFonts.replace(/\/\* Title Font Settings \*\/[\s\S]*?\/\* Apply text font to links[\s\S]*?\}/g, '')
        
        const fontStyles = `
      /* Title Font Settings - Applied with high specificity */
      h1, h2, h3, h4, h5, h6,
      .title, [class*="title"],
      .hero-title, .section-title,
      h1 *, h2 *, h3 *, h4 *, h5 *, h6 *,
      .title *, [class*="title"] *,
      .hero-title *, .section-title * {
        font-family: '${fontSettings.titleFamily}', sans-serif !important;
        font-weight: ${fontSettings.titleWeight} !important;
        font-size: ${fontSettings.titleSize}px !important;
      }

      /* Text Font Settings */
      body {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }

      /* Apply text font to paragraphs and general text elements */
      p, span:not([class*="title"]):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6),
      .text, [class*="text"]:not([class*="title"]),
      .hero-subtitle, .section-description,
      .timeline-description, .about-text, .register-description,
      .faq-answer, .footer-tagline, .footer-copyright {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }

      /* Apply text font to links and list items */
      a:not([class*="title"]):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6),
      li:not([class*="title"]) {
        font-family: '${fontSettings.textFamily}', sans-serif !important;
        font-weight: ${fontSettings.textWeight} !important;
        font-size: ${fontSettings.textSize}px !important;
      }
    `
        cssWithFonts = cssWithFonts.trim() + '\n' + fontStyles
      }
    }

    // Navigation format CSS - Add dynamic CSS for navigation formats
    const navigationFormatCSS = `
      /* Navigation Format Styles */
      [data-nav-format="default"] .nav-container,
      .nav-format-default .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
      }
      
      [data-nav-format="default"] .nav-logo,
      .nav-format-default .nav-logo {
        flex-shrink: 0;
      }
      
      [data-nav-format="default"] .nav-links,
      .nav-format-default .nav-links {
        display: flex;
        list-style: none;
        gap: 2rem;
        margin: 0;
        padding: 0;
      }
      
      [data-nav-format="centered"] .nav-container,
      .nav-format-centered .nav-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        position: relative;
      }
      
      [data-nav-format="centered"] .nav-logo,
      .nav-format-centered .nav-logo {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        pointer-events: none;
      }
      
      [data-nav-format="centered"] .nav-logo img,
      .nav-format-centered .nav-logo img {
        pointer-events: auto;
      }
      
      [data-nav-format="centered"] .nav-links,
      .nav-format-centered .nav-links {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
        position: relative;
        z-index: 1;
        gap: 2rem;
      }
      
      /* First 2 links go to the left */
      [data-nav-format="centered"] .nav-links li:nth-child(1),
      .nav-format-centered .nav-links li:nth-child(1),
      [data-nav-format="centered"] .nav-links li:nth-child(2),
      .nav-format-centered .nav-links li:nth-child(2) {
        margin-right: auto;
        order: 0;
      }
      
      /* Spacer element (added via JavaScript) */
      [data-nav-format="centered"] .nav-links .nav-spacer,
      .nav-format-centered .nav-links .nav-spacer {
        flex: 1;
        order: 1;
        min-width: 150px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      /* Links from 3rd onwards go to the right */
      [data-nav-format="centered"] .nav-links li:nth-child(n+3):not(.nav-spacer),
      .nav-format-centered .nav-links li:nth-child(n+3):not(.nav-spacer) {
        order: 2;
        margin-left: auto;
      }
      
      [data-nav-format="minimal"] .nav-container,
      .nav-format-minimal .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
      }
      
      [data-nav-format="minimal"] .nav-logo,
      .nav-format-minimal .nav-logo {
        flex-shrink: 0;
      }
      
      [data-nav-format="minimal"] .nav-links,
      .nav-format-minimal .nav-links {
        display: flex;
        list-style: none;
        gap: 0.75rem;
        margin: 0;
        padding: 0;
      }
      
      [data-nav-format="spacious"] .nav-container,
      .nav-format-spacious .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 4rem;
      }
      
      [data-nav-format="spacious"] .nav-logo,
      .nav-format-spacious .nav-logo {
        flex-shrink: 0;
      }
      
      [data-nav-format="spacious"] .nav-links,
      .nav-format-spacious .nav-links {
        display: flex;
        list-style: none;
        gap: 3rem;
        margin: 0;
        padding: 0;
      }
      
      /* General navigation styles */
      .nav-links li {
        margin: 0;
      }
      
      .nav-links a {
        text-decoration: none;
        color: inherit;
        transition: opacity 0.2s;
      }
      
      .nav-links a:hover {
        opacity: 0.7;
      }
    `

    const combinedHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ${cssWithFonts}
        ${navigationFormatCSS}
        /* Selection highlight */
        .component-selected {
          outline: 3px solid #8B5CF6 !important;
          outline-offset: -3px;
          position: relative;
        }
        .component-selected::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: rgba(139, 92, 246, 0.1);
          pointer-events: none;
        }
        .component-hover {
          outline: 2px dashed #3B82F6 !important;
          outline-offset: -2px;
        }
    </style>
</head>
<body>
    ${editedHtml}
    <script>
        ${editedJs}
        
        // Add component selection highlighting
        document.addEventListener('DOMContentLoaded', function() {
          const selectedId = '${selectedComponent?.id || ''}';
          if (selectedId) {
            const el = document.getElementById(selectedId) || 
                      document.querySelector('[data-component="' + selectedId + '"]');
            if (el) {
              el.classList.add('component-selected');
              // Scroll within iframe only, use 'nearest' to avoid scrolling too far
              // Prevent scrolling the parent page
              try {
                const iframe = window.frameElement || (window.parent && window.parent.document.querySelector('iframe'));
                if (iframe && iframe.contentWindow === window) {
                  // We're inside an iframe, scroll only within iframe
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                } else {
                  // Scroll within current window only
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
              } catch (e) {
                // Fallback: just scroll within iframe
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
            }
          }
          
          // Add spacer for centered navigation format
          const centeredNavs = document.querySelectorAll('[data-nav-format="centered"] .nav-links, .nav-format-centered .nav-links');
          centeredNavs.forEach(function(navLinks) {
            const links = Array.from(navLinks.children);
            if (links.length >= 3) {
              // Check if spacer already exists
              const existingSpacer = navLinks.querySelector('.nav-spacer');
              if (!existingSpacer) {
                // Create spacer element
                const spacer = document.createElement('li');
                spacer.className = 'nav-spacer';
                spacer.style.flex = '1';
                spacer.style.minWidth = '150px';
                spacer.style.order = '1';
                spacer.style.listStyle = 'none';
                spacer.style.margin = '0';
                spacer.style.padding = '0';
                
                // Insert after 2nd link
                if (links[1] && links[1].nextSibling) {
                  navLinks.insertBefore(spacer, links[1].nextSibling);
                } else if (links[1]) {
                  navLinks.appendChild(spacer);
                }
                
                // Set order for remaining links
                for (let i = 2; i < links.length; i++) {
                  if (links[i] && links[i] !== spacer) {
                    links[i].style.order = '2';
                    links[i].style.marginLeft = 'auto';
                  }
                }
              }
            }
          });
        });
    </script>
</body>
</html>`
    
    setPreviewHtml(combinedHtml)
  }, [editedHtml, editedCss, editedJs, selectedComponent, fontSettings, fontSettingsModified, originalFontSettings])

  // Update iframe when preview changes
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewHtml
    }
  }, [previewHtml])

  // Update component
  const updateComponent = useCallback((componentId: string, updates: {
    properties?: { [key: string]: unknown }
    styles?: { [key: string]: string }
  }) => {
    const newHtml = updateComponentInHTML(editedHtml, componentId, updates)
    
    // If logo is being updated, ensure it's properly set in the HTML
    if (updates.properties?.logo) {
      const logoData = updates.properties.logo as { src?: string; alt?: string }
      if (logoData.src) {
        // Force update the HTML to include the logo src
        const parser = new DOMParser()
        let bodyContent = newHtml
        if (newHtml.includes('<body')) {
          const bodyMatch = newHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
          if (bodyMatch) {
            bodyContent = bodyMatch[1]
          }
        }
        const doc = parser.parseFromString(`<div>${bodyContent}</div>`, 'text/html')
        const element = doc.getElementById(componentId) || doc.querySelector(`[data-component="${componentId}"]`)
        if (element) {
          let logoImg = element.querySelector('#nav-logo-img')
          if (!logoImg) {
            logoImg = element.querySelector('[data-editable-image="true"]')
          }
          if (!logoImg) {
            logoImg = element.querySelector('.nav-logo img') || element.querySelector('nav img') || element.querySelector('header img')
          }
          if (logoImg) {
            logoImg.setAttribute('src', logoData.src)
            if (logoImg.tagName === 'IMG') {
              (logoImg as HTMLImageElement).src = logoData.src
            }
          }
          const wrapper = doc.querySelector('div')
          if (wrapper) {
            setEditedHtml(wrapper.innerHTML)
          } else {
            setEditedHtml(newHtml)
          }
        } else {
          setEditedHtml(newHtml)
        }
      } else {
        setEditedHtml(newHtml)
      }
    } else {
      setEditedHtml(newHtml)
    }
    
    // Update current colors if color styles are being updated
    if (updates.styles) {
      if ('background-color' in updates.styles) {
        setCurrentColors(prev => ({ ...prev, backgroundColor: updates.styles!['background-color'] }))
      }
      if ('color' in updates.styles) {
        setCurrentColors(prev => ({ ...prev, color: updates.styles!.color }))
      }
    }
    
    // Update components list
    setComponents(prev => prev.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          properties: { ...comp.properties, ...updates.properties },
          styles: { ...comp.styles, ...updates.styles }
        }
      }
      return comp
    }))

    // Update selected component
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({
        ...selectedComponent,
        properties: { ...selectedComponent.properties, ...updates.properties },
        styles: { ...selectedComponent.styles, ...updates.styles }
      })
    }

    // Ensure navigation format CSS exists before saving
    const cssWithNav = ensureNavigationFormatCSS(editedCss)

    // Notify parent
    if (onCodeChangeRef.current) {
      onCodeChangeRef.current(newHtml, cssWithNav, editedJs)
    }
  }, [editedHtml, editedCss, editedJs, selectedComponent, ensureNavigationFormatCSS])

  const handleIframeClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const componentId = target.id || target.closest('[data-component]')?.getAttribute('data-component')
    if (componentId) {
      const comp = components.find(c => c.id === componentId)
      if (comp) setSelectedComponent(comp)
    }
  }

  const getComponentIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    const icons: { [key: string]: React.ReactElement } = {
      // Hero section - spotlight/star icon
      hero: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      // Bracket/Teams - tournament bracket icon (tournament tree structure)
      bracket: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v4M6 12v4M6 16v4M18 4v4M18 12v4M18 16v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h6M6 16h6M18 8h-6M18 16h-6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M12 12h6" />
        </svg>
      ),
      // Teams - users/team icon
      teams: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      // Twitch - Twitch logo
      twitch: (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
      // Livestream - video camera icon
      livestream: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      // Sponsors - briefcase/business icon
      sponsors: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      // Schedule - calendar icon
      schedule: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      // Program - list/calendar icon
      program: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      // Registration - clipboard/form icon
      registration: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Contact - envelope icon
      contact: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      // Footer - chevron down icon
      footer: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      ),
      // Header - navigation/menu icon
      header: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      // Navigation - navigation/menu icon
      navigation: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      // About - info circle icon
      about: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      // Description - document text icon
      description: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Tournament Details - information/document icon
      tournamentDetails: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Stats - chart/bar icon
      stats: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      // Prizes - trophy icon
      prizes: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      // Rules - document check icon
      rules: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      // Social - share/social icon
      social: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      // Section - generic box/container icon
      section: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
    // Return specific icon or default section icon
    return icons[type] || icons.section
  }

  return (
    <div className="flex h-full" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* Left Subpanel - Icon Navigation */}
      <div className="w-16 glass-card border-r border-white/20 flex flex-col relative z-10">
        <div className="p-2 space-y-2">
          {/* Components Icon */}
          <button
            onClick={() => setActiveLeftTab('components')}
            className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
              activeLeftTab === 'components'
                ? 'bg-[#482CFF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Components"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {/* Colors Icon */}
          <button
            onClick={() => setActiveLeftTab('colors')}
            className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
              activeLeftTab === 'colors'
                ? 'bg-[#482CFF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          {/* Fonts Icon */}
          <button
            onClick={() => setActiveLeftTab('fonts')}
            className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
              activeLeftTab === 'fonts'
                ? 'bg-[#482CFF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Fonts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Publish Icon */}
          <button
            onClick={() => setActiveLeftTab('publish')}
            className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
              activeLeftTab === 'publish'
                ? 'bg-[#482CFF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Publish"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Left Sidebar - Content based on active tab */}
      <div className="w-64 glass-card border-r border-white/20 flex flex-col relative z-10">
        {activeLeftTab === 'components' && (
          <>
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold text-lg mb-2">Componenten</h2>
              <p className="text-gray-300 text-xs">
                {components.length} componenten op de pagina
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {components.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Geen componenten gevonden
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {components.map((component) => (
                    <button
                      key={component.id}
                      onClick={() => setSelectedComponent(component)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedComponent?.id === component.id
                          ? 'bg-[#482CFF] text-white shadow-lg'
                          : 'glass-button text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 text-gray-300">
                          {getComponentIcon(component.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{component.name}</div>
                          <div className="text-xs opacity-75 truncate">{component.type}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeLeftTab === 'colors' && (
          <>
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold text-lg mb-2">Kleuren</h2>
              <p className="text-gray-300 text-xs">Pagina kleuren aanpassen</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-gray-300 text-xs mb-2">Primaire Kleur</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={pageSettings.primaryColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pageSettings.primaryColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-2">Secundaire Kleur</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={pageSettings.secondaryColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pageSettings.secondaryColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-2">Achtergrond</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={pageSettings.backgroundColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pageSettings.backgroundColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-2">Tekst Kleur</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={pageSettings.textColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-12 h-10 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pageSettings.textColor}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeLeftTab === 'fonts' && (
          <>
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold text-lg mb-2">Font</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Titles Section */}
              <div>
                <label className="block text-gray-300 text-xs mb-3">Titles</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Font Family</label>
                    <select 
                      value={fontSettings.titleFamily}
                      onChange={(e) => {
                        setFontSettings(prev => ({ ...prev, titleFamily: e.target.value }))
                        setFontSettingsModified(true)
                      }}
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-gray-400 text-xs mb-1.5">Font Weight</label>
                      <select 
                        value={fontSettings.titleWeight}
                        onChange={(e) => {
                          setFontSettings(prev => ({ ...prev, titleWeight: e.target.value }))
                          setFontSettingsModified(true)
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-400 text-xs mb-1.5">Font Size</label>
                      <input
                        type="number"
                        value={fontSettings.titleSize}
                        onChange={(e) => {
                          setFontSettings(prev => ({ ...prev, titleSize: e.target.value }))
                          setFontSettingsModified(true)
                        }}
                        placeholder="16"
                        min="8"
                        max="72"
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Section */}
              <div>
                <label className="block text-gray-300 text-xs mb-3">Text</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Font Family</label>
                    <select 
                      value={fontSettings.textFamily}
                      onChange={(e) => {
                        setFontSettings(prev => ({ ...prev, textFamily: e.target.value }))
                        setFontSettingsModified(true)
                      }}
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-gray-400 text-xs mb-1.5">Font Weight</label>
                      <select 
                        value={fontSettings.textWeight}
                        onChange={(e) => {
                          setFontSettings(prev => ({ ...prev, textWeight: e.target.value }))
                          setFontSettingsModified(true)
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-400 text-xs mb-1.5">Font Size</label>
                      <input
                        type="number"
                        value={fontSettings.textSize}
                        onChange={(e) => {
                          setFontSettings(prev => ({ ...prev, textSize: e.target.value }))
                          setFontSettingsModified(true)
                        }}
                        placeholder="11"
                        min="8"
                        max="72"
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeLeftTab === 'publish' && (
          <>
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold text-lg mb-2">Publiceren</h2>
              <p className="text-gray-300 text-xs">Publiceer of sla op als draft</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-3">
                <button
                  onClick={onSaveDraft}
                  disabled={isSaving || !onSaveDraft}
                  className="w-full glass-button px-4 py-3 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>{isSaving ? 'Opslaan...' : 'Opslaan als Draft'}</span>
                </button>
                
                <button
                  onClick={onPublish}
                  disabled={isSaving || !onPublish}
                  className="w-full px-4 py-3 bg-[#482CFF] text-white rounded-lg hover:bg-[#420AB2] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg"
                  style={{
                    boxShadow: !isSaving ? '0 0 20px rgba(72, 44, 255, 0.4)' : 'none'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{isSaving ? 'Publiceert...' : 'Publiceren'}</span>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-white font-semibold text-sm mb-3">Status</h3>
                {isSaving ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A9.001 9.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a9.003 9.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-sm">Bezig met opslaan...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {!onSaveDraft || !onPublish ? (
                      <div className="flex items-start space-x-2 text-yellow-400">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs">Publiceer functionaliteit niet beschikbaar</p>
                      </div>
                    ) : !html || html.trim().length === 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2 text-red-400">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium mb-1">Kan niet publiceren</p>
                            <p className="text-xs text-gray-400">Geen HTML content gevonden. Genereer eerst een website via de wizard.</p>
                          </div>
                        </div>
                      </div>
                    ) : !tournamentName || tournamentName.trim().length === 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2 text-yellow-400">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium mb-1">Toernooi naam vereist</p>
                            <p className="text-xs text-gray-400">Voer een toernooi naam in via het invoerveld in de header.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2 text-green-400">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium mb-1">Klaar om te publiceren</p>
                          <p className="text-xs text-gray-400">Alle vereisten zijn voldaan. Je kunt nu opslaan of publiceren.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col bg-white relative z-10">
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <div className="w-full h-full overflow-auto" id="preview-scroll-container">
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              className="w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
              style={{ minHeight: '100%', display: 'block' }}
              onLoad={() => {
              // Add click handlers to iframe for component selection
              if (iframeRef.current?.contentWindow) {
                try {
                  const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
                  
                  // Remove old listeners
                  iframeDoc.querySelectorAll('[data-selectable]').forEach(el => {
                    el.removeEventListener('click', handleIframeClick as EventListener)
                    el.removeAttribute('data-selectable')
                  })

                  // Add click handlers to all components
                  components.forEach(comp => {
                    const el = iframeDoc.getElementById(comp.id) || 
                              iframeDoc.querySelector(`[data-component="${comp.id}"]`)
                    if (el) {
                      el.setAttribute('data-selectable', 'true')
                      el.style.cursor = 'pointer'
                      el.addEventListener('click', (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedComponent(comp)
                        // Scroll within iframe only, prevent page scroll
                        setTimeout(() => {
                          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
                        }, 100)
                      })
                    }
                  })
                } catch (error) {
                  // Cross-origin issues, ignore
                  console.log('Could not add click handlers:', error)
                }
              }
            }}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Property Editor */}
      <div className="w-80 glass-card border-l border-white/20 flex flex-col relative z-10">
        {selectedComponent ? (
          <>
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex-shrink-0 text-gray-300">
                  {getComponentIcon(selectedComponent.type)}
                </div>
                <div>
                  <h2 className="text-white font-bold">{selectedComponent.name}</h2>
                  <p className="text-gray-300 text-xs">{selectedComponent.type}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Hero-specific properties */}
              {selectedComponent.type === 'hero' && (
                <>
                  {/* Format Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          value: 'image-left', 
                          label: 'Image Left', 
                          desc: 'Image left, text right',
                          preview: (
                            <div className="flex items-center gap-2 h-12">
                              <div className="w-8 h-8 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="h-2 bg-[#482CFF] rounded w-3/4"></div>
                                <div className="h-2 bg-[#482CFF] rounded w-1/2"></div>
                                <div className="flex gap-1">
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                            </div>
                          )
                        },
                        { 
                          value: 'image-right', 
                          label: 'Image Right', 
                          desc: 'Text left, image right',
                          preview: (
                            <div className="flex items-center gap-2 h-12">
                              <div className="flex-1 space-y-1">
                                <div className="h-2 bg-[#482CFF] rounded w-3/4"></div>
                                <div className="h-2 bg-[#482CFF] rounded w-1/2"></div>
                                <div className="flex gap-1">
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-6 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          )
                        },
                        { 
                          value: 'image-top', 
                          label: 'Image Top', 
                          desc: 'Image top, text bottom',
                          preview: (
                            <div className="space-y-2 h-12">
                              <div className="w-full h-4 bg-gray-600 rounded flex items-center justify-center">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="space-y-1">
                                <div className="h-1.5 bg-[#482CFF] rounded w-3/4"></div>
                                <div className="h-1.5 bg-[#482CFF] rounded w-1/2"></div>
                                <div className="flex gap-1">
                                  <div className="h-1 w-5 bg-gray-600 rounded"></div>
                                  <div className="h-1 w-5 bg-gray-600 rounded"></div>
                                  <div className="h-1 w-5 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                            </div>
                          )
                        },
                        { 
                          value: 'image-full', 
                          label: 'Image Full', 
                          desc: 'Full width image',
                          preview: (
                            <div className="h-12 w-full bg-gray-600 rounded flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )
                        },
                        { 
                          value: 'text-only', 
                          label: 'Text Only', 
                          desc: 'No image, text only',
                          preview: (
                            <div className="h-12 w-full relative flex items-center justify-center">
                              <div className="w-full space-y-1.5 px-2">
                                <div className="h-2.5 bg-[#482CFF] rounded w-full"></div>
                                <div className="h-2 bg-[#482CFF]/80 rounded w-4/5 mx-auto"></div>
                                <div className="flex gap-1.5 justify-center">
                                  <div className="h-1.5 w-7 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-7 bg-gray-600 rounded"></div>
                                  <div className="h-1.5 w-7 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="absolute top-1 right-1 opacity-50">
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            </div>
                          )
                        }
                      ].map((format) => {
                        const isSelected = (selectedComponent.properties.heroFormat || 'image-left') === format.value
                        return (
                          <button
                            key={format.value}
                            onClick={() => updateComponent(selectedComponent.id, {
                              properties: { heroFormat: format.value }
                            })}
                            className={`p-3 rounded-lg border transition-all text-left relative group ${
                              isSelected
                                ? 'border-[#482CFF] bg-[#482CFF]/20'
                                : 'border-gray-700 bg-gray-900/60 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-white text-xs font-medium mb-2">{format.label}</div>
                            <div className="mb-2">{format.preview}</div>
                            <div className="text-gray-400 text-xs">{format.desc}</div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-[#482CFF] rounded-full"></div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Image Upload - Only show if format is not text-only */}
                  {(selectedComponent.properties.heroFormat || 'image-left') !== 'text-only' && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 text-sm">Image</h3>
                      <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors cursor-pointer bg-gray-900/60">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const src = event.target?.result as string
                                updateComponent(selectedComponent.id, {
                                  properties: {
                                    image: {
                                      src: src,
                                      alt: 'Hero image'
                                    }
                                  }
                                })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                          id="hero-image-upload"
                        />
                        <label htmlFor="hero-image-upload" className="cursor-pointer">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-300 text-xs mb-1">Klik om afbeelding te uploaden</p>
                          <p className="text-gray-500 text-xs">PNG, JPG, SVG</p>
                        </label>
                      </div>
                      {(selectedComponent.properties.image as { src?: string })?.src && (
                        <div className="relative">
                          <img
                            src={(selectedComponent.properties.image as { src?: string }).src}
                            alt={(selectedComponent.properties.image as { alt?: string })?.alt || 'Hero image'}
                            className="w-full h-auto rounded-lg border border-gray-700"
                          />
                          <button
                            onClick={() => {
                              updateComponent(selectedComponent.id, {
                                properties: {
                                  image: {
                                    src: '',
                                    alt: 'Hero image'
                                  }
                                }
                              })
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-600 rounded text-white text-xs"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    </div>
                  )}

                  {/* Hero Text */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Text</h3>
                    <textarea
                      value={String(selectedComponent.properties.heroText || '')}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        properties: { heroText: e.target.value }
                      })}
                      placeholder="Hero Text..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all resize-none"
                    />
                  </div>

                  {/* Tournament Info */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Tournament info</h3>
                    
                    {/* Boxes Count */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-xs mb-2">Boxes (max 4)</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={Math.min(4, Math.max(1, Array.isArray(selectedComponent.properties.tournamentBoxes) ? selectedComponent.properties.tournamentBoxes.length : 1))}
                        onChange={(e) => {
                          const count = Math.min(4, Math.max(1, parseInt(e.target.value) || 1))
                          const currentBoxes = Array.isArray(selectedComponent.properties.tournamentBoxes) 
                            ? [...selectedComponent.properties.tournamentBoxes] 
                            : []
                          
                          // Adjust array to match count
                          const newBoxes = []
                          for (let i = 0; i < count; i++) {
                            newBoxes.push(currentBoxes[i] || { title: '', paragraph: '' })
                          }
                          
                          updateComponent(selectedComponent.id, {
                            properties: { tournamentBoxes: newBoxes }
                          })
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>

                    {/* Tournament Boxes */}
                    <div className="space-y-4">
                      {Array.isArray(selectedComponent.properties.tournamentBoxes) && selectedComponent.properties.tournamentBoxes.length > 0 ? (
                        selectedComponent.properties.tournamentBoxes.map((box: { title?: string; paragraph?: string }, index: number) => (
                          <div key={index} className="space-y-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700">
                            <div className="text-white text-xs font-medium mb-2">Box {index + 1}</div>
                            
                            <div>
                              <label className="block text-gray-300 text-xs mb-1">Title</label>
                              <input
                                type="text"
                                value={box.title || ''}
                                onChange={(e) => {
                                  const updatedBoxes = [...(selectedComponent.properties.tournamentBoxes as Array<{ title?: string; paragraph?: string }>)]
                                  updatedBoxes[index] = { ...updatedBoxes[index], title: e.target.value }
                                  updateComponent(selectedComponent.id, {
                                    properties: { tournamentBoxes: updatedBoxes }
                                  })
                                }}
                                placeholder="Title Text"
                                className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 text-xs mb-1">Paragraph</label>
                              <input
                                type="text"
                                value={box.paragraph || ''}
                                onChange={(e) => {
                                  const updatedBoxes = [...(selectedComponent.properties.tournamentBoxes as Array<{ title?: string; paragraph?: string }>)]
                                  updatedBoxes[index] = { ...updatedBoxes[index], paragraph: e.target.value }
                                  updateComponent(selectedComponent.id, {
                                    properties: { tournamentBoxes: updatedBoxes }
                                  })
                                }}
                                placeholder="Paragraph Text"
                                className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs text-center py-4">
                          Geen boxes. Verhoog het aantal boxes hierboven.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* About-specific properties */}
              {selectedComponent.type === 'about' && (
                <>
                  {/* Format Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          value: 'grid-2x2', 
                          label: 'Grid 2x2', 
                          desc: '4 boxes in 2x2 grid',
                          preview: (
                            <div className="grid grid-cols-2 gap-1 h-12">
                              <div className="bg-gray-600 rounded"></div>
                              <div className="bg-gray-600 rounded"></div>
                              <div className="bg-gray-600 rounded"></div>
                              <div className="bg-gray-600 rounded"></div>
                            </div>
                          )
                        },
                        { 
                          value: 'grid-2x1', 
                          label: 'Grid 2x1', 
                          desc: '2 boxes horizontal',
                          preview: (
                            <div className="flex gap-1 h-12">
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                            </div>
                          )
                        },
                        { 
                          value: 'grid-3x1', 
                          label: 'Grid 3x1', 
                          desc: '3 boxes horizontal',
                          preview: (
                            <div className="flex gap-1 h-12">
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                            </div>
                          )
                        },
                        { 
                          value: 'grid-4x1', 
                          label: 'Grid 4x1', 
                          desc: '4 boxes horizontal',
                          preview: (
                            <div className="flex gap-1 h-12">
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                            </div>
                          )
                        }
                      ].map((format) => {
                        const isSelected = (selectedComponent.properties.aboutFormat || 'grid-2x2') === format.value
                        return (
                          <button
                            key={format.value}
                            onClick={() => updateComponent(selectedComponent.id, {
                              properties: { aboutFormat: format.value }
                            })}
                            className={`p-3 rounded-lg border transition-all text-left relative group ${
                              isSelected
                                ? 'border-[#482CFF] bg-[#482CFF]/20'
                                : 'border-gray-700 bg-gray-900/60 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-white text-xs font-medium mb-2">{format.label}</div>
                            <div className="mb-2">{format.preview}</div>
                            <div className="text-gray-400 text-xs">{format.desc}</div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-[#482CFF] rounded-full"></div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Title</h3>
                    <input
                      type="text"
                      value={String(selectedComponent.properties.aboutTitle || '')}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        properties: { aboutTitle: e.target.value }
                      })}
                      placeholder="Title Text..."
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Text</h3>
                    <textarea
                      value={String(selectedComponent.properties.aboutText || '')}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        properties: { aboutText: e.target.value }
                      })}
                      placeholder="About Text..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all resize-none"
                    />
                  </div>

                  {/* About Boxes */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">About Boxes</h3>
                    
                    {/* Boxes Count */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-xs mb-2">Boxes (max 4)</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={Math.min(4, Math.max(1, Array.isArray(selectedComponent.properties.aboutBoxes) ? selectedComponent.properties.aboutBoxes.length : 1))}
                        onChange={(e) => {
                          const count = Math.min(4, Math.max(1, parseInt(e.target.value) || 1))
                          const currentBoxes = Array.isArray(selectedComponent.properties.aboutBoxes) 
                            ? [...selectedComponent.properties.aboutBoxes] 
                            : []
                          
                          // Adjust array to match count
                          const newBoxes = []
                          for (let i = 0; i < count; i++) {
                            newBoxes.push(currentBoxes[i] || { title: '' })
                          }
                          
                          updateComponent(selectedComponent.id, {
                            properties: { aboutBoxes: newBoxes }
                          })
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>

                    {/* About Boxes */}
                    <div className="space-y-4">
                      {Array.isArray(selectedComponent.properties.aboutBoxes) && selectedComponent.properties.aboutBoxes.length > 0 ? (
                        selectedComponent.properties.aboutBoxes.map((box: { title?: string }, index: number) => (
                          <div key={index} className="space-y-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700">
                            <div className="text-white text-xs font-medium mb-2">Box {index + 1}</div>
                            
                            <div>
                              <label className="block text-gray-300 text-xs mb-1">Title</label>
                              <input
                                type="text"
                                value={box.title || ''}
                                onChange={(e) => {
                                  const updatedBoxes = [...(selectedComponent.properties.aboutBoxes as Array<{ title?: string }>)]
                                  updatedBoxes[index] = { ...updatedBoxes[index], title: e.target.value }
                                  updateComponent(selectedComponent.id, {
                                    properties: { aboutBoxes: updatedBoxes }
                                  })
                                }}
                                placeholder="Title Text"
                                className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs text-center py-4">
                          Geen boxes. Verhoog het aantal boxes hierboven.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Program-specific properties (schedule is hetzelfde als program) */}
              {(selectedComponent.type === 'program' || selectedComponent.type === 'schedule') && (
                <>
                  {/* Format Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          value: 'grid-2x1', 
                          label: 'Grid 2x1', 
                          desc: '2 boxes horizontal',
                          preview: (
                            <div className="flex gap-1 h-12">
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                            </div>
                          )
                        },
                        { 
                          value: 'grid-4x1', 
                          label: 'Grid 4x1', 
                          desc: '4 boxes horizontal',
                          preview: (
                            <div className="flex gap-1 h-12">
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                              <div className="flex-1 bg-gray-600 rounded"></div>
                            </div>
                          )
                        }
                      ].map((format) => {
                        const isSelected = (selectedComponent.properties.programFormat || 'grid-2x1') === format.value
                        return (
                          <button
                            key={format.value}
                            onClick={() => updateComponent(selectedComponent.id, {
                              properties: { programFormat: format.value }
                            })}
                            className={`p-3 rounded-lg border transition-all text-left relative group ${
                              isSelected
                                ? 'border-[#482CFF] bg-[#482CFF]/20'
                                : 'border-gray-700 bg-gray-900/60 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-white text-xs font-medium mb-2">{format.label}</div>
                            <div className="mb-2">{format.preview}</div>
                            <div className="text-gray-400 text-xs">{format.desc}</div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-[#482CFF] rounded-full"></div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Title</h3>
                    <input
                      type="text"
                      value={String(selectedComponent.properties.programTitle || '')}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        properties: { programTitle: e.target.value }
                      })}
                      placeholder="Title Text..."
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Text</h3>
                    <textarea
                      value={String(selectedComponent.properties.programText || '')}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        properties: { programText: e.target.value }
                      })}
                      placeholder="Program Text..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all resize-none"
                    />
                  </div>

                  {/* Program Boxes */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Program Boxes</h3>
                    
                    {/* Boxes Count */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-xs mb-2">Boxes (max 4)</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={Math.min(4, Math.max(1, Array.isArray(selectedComponent.properties.programBoxes) ? selectedComponent.properties.programBoxes.length : 1))}
                        onChange={(e) => {
                          const count = Math.min(4, Math.max(1, parseInt(e.target.value) || 1))
                          const currentBoxes = Array.isArray(selectedComponent.properties.programBoxes) 
                            ? [...selectedComponent.properties.programBoxes] 
                            : []
                          
                          // Adjust array to match count
                          const newBoxes = []
                          for (let i = 0; i < count; i++) {
                            newBoxes.push(currentBoxes[i] || { title: '' })
                          }
                          
                          updateComponent(selectedComponent.id, {
                            properties: { programBoxes: newBoxes }
                          })
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                      />
                    </div>

                    {/* Program Boxes */}
                    <div className="space-y-4">
                      {Array.isArray(selectedComponent.properties.programBoxes) && selectedComponent.properties.programBoxes.length > 0 ? (
                        selectedComponent.properties.programBoxes.map((box: { title?: string }, index: number) => (
                          <div key={index} className="space-y-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700">
                            <div className="text-white text-xs font-medium mb-2">Box {index + 1}</div>
                            
                            <div>
                              <label className="block text-gray-300 text-xs mb-1">Title</label>
                              <input
                                type="text"
                                value={box.title || ''}
                                onChange={(e) => {
                                  const updatedBoxes = [...(selectedComponent.properties.programBoxes as Array<{ title?: string }>)]
                                  updatedBoxes[index] = { ...updatedBoxes[index], title: e.target.value }
                                  updateComponent(selectedComponent.id, {
                                    properties: { programBoxes: updatedBoxes }
                                  })
                                }}
                                placeholder="Title Text"
                                className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs text-center py-4">
                          Geen boxes. Verhoog het aantal boxes hierboven.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Navigation-specific properties */}
              {selectedComponent.type === 'navigation' && (
                <>
                  {/* Format Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'default', label: 'Default Design', desc: 'Logo left' },
                        { value: 'centered', label: 'Centered Logo', desc: 'Logo mid' },
                        { value: 'minimal', label: 'Minimal Spacing', desc: 'Logo left' },
                        { value: 'spacious', label: 'Spacious Layout', desc: 'Logo left' }
                      ].map((format) => {
                        const isSelected = (selectedComponent.properties.navFormat || 'default') === format.value
                        return (
                          <button
                            key={format.value}
                            onClick={() => updateComponent(selectedComponent.id, {
                              properties: { navFormat: format.value }
                            })}
                            className={`p-3 rounded-lg border transition-all text-left relative group ${
                              isSelected
                                ? 'border-[#482CFF] bg-[#482CFF]/20'
                                : 'border-gray-700 bg-gray-900/60 hover:border-gray-600'
                            }`}
                            onMouseEnter={(e) => {
                              // Show preview on hover (placeholder for now)
                            }}
                          >
                            <div className="text-white text-xs font-medium mb-1">{format.label}</div>
                            <div className="text-gray-400 text-xs">{format.desc}</div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-[#482CFF] rounded-full"></div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Logo</h3>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors cursor-pointer bg-gray-900/60">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const src = event.target?.result as string
                                const currentLogo = (selectedComponent.properties.logo as { src?: string; alt?: string }) || {}
                                updateComponent(selectedComponent.id, {
                                  properties: {
                                    logo: {
                                      ...currentLogo,
                                      src: src,
                                      alt: currentLogo.alt || 'Logo'
                                    }
                                  }
                                })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-300 text-xs mb-1">Klik om logo te uploaden</p>
                          <p className="text-gray-500 text-xs">PNG, JPG, SVG</p>
                        </label>
                      </div>
                      {(selectedComponent.properties.logo as { src?: string })?.src && (
                        <div className="relative">
                          <img
                            src={(selectedComponent.properties.logo as { src?: string }).src}
                            alt={(selectedComponent.properties.logo as { alt?: string })?.alt || 'Logo'}
                            className="w-full h-auto rounded-lg border border-gray-700"
                          />
                          <button
                            onClick={() => {
                              updateComponent(selectedComponent.id, {
                                properties: {
                                  logo: {
                                    src: '',
                                    alt: 'Logo'
                                  }
                                }
                              })
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-600 rounded text-white text-xs"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nav Links */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Nav Links</h3>
                    <div className="space-y-2">
                      {Array.isArray(selectedComponent.properties.navLinks) && selectedComponent.properties.navLinks.length > 0 ? (
                        (selectedComponent.properties.navLinks as Array<{ text?: string; href?: string }>).map((link, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs w-6">{index + 1}</span>
                            <input
                              type="text"
                              value={link.text || ''}
                              onChange={(e) => {
                                const updatedLinks = [...(selectedComponent.properties.navLinks as Array<{ text?: string; href?: string }>)]
                                updatedLinks[index] = { ...updatedLinks[index], text: e.target.value }
                                updateComponent(selectedComponent.id, {
                                  properties: { navLinks: updatedLinks }
                                })
                              }}
                              placeholder="Text"
                              className="flex-1 px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#482CFF] focus:ring-2 focus:ring-[#482CFF]/50 transition-all"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs text-center py-4">
                          Geen nav links gevonden. Voeg links toe in de HTML.
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const currentLinks = Array.isArray(selectedComponent.properties.navLinks) 
                            ? [...(selectedComponent.properties.navLinks as Array<{ text?: string; href?: string }>)]
                            : []
                          const newLink = { text: 'Nieuwe Link', href: '#section' }
                          updateComponent(selectedComponent.id, {
                            properties: { navLinks: [...currentLinks, newLink] }
                          })
                        }}
                        className="w-full px-3 py-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-800/60 transition-all flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add more</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Style Properties */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">Styling</h3>
                <div className="space-y-4">
                  {/* Achtergrond Kleur */}
                  <div>
                    <label className="block text-gray-300 text-xs mb-2">Achtergrond Kleur</label>
                    <button
                      onClick={() => setColorPickerOpen({ type: 'background' })}
                      className="flex items-center space-x-3 p-2 rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800/60 transition-all w-full"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-lg flex-shrink-0"
                        style={{ backgroundColor: currentColors.backgroundColor || selectedComponent.styles.backgroundColor || '#000000' }}
                      />
                      <span className="text-gray-300 text-sm font-mono">
                        {currentColors.backgroundColor || selectedComponent.styles.backgroundColor || '#000000'}
                      </span>
                    </button>
                  </div>

                  {/* Tekst Kleur */}
                  <div>
                    <label className="block text-gray-300 text-xs mb-2">Tekst Kleur</label>
                    <button
                      onClick={() => setColorPickerOpen({ type: 'color' })}
                      className="flex items-center space-x-3 p-2 rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800/60 transition-all w-full"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-lg flex-shrink-0"
                        style={{ backgroundColor: currentColors.color || selectedComponent.styles.color || '#ffffff' }}
                      />
                      <span className="text-gray-300 text-sm font-mono">
                        {currentColors.color || selectedComponent.styles.color || '#ffffff'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Picker Modal */}
              {colorPickerOpen.type && (
                <ColorPicker
                  key={`${colorPickerOpen.type}-${selectedComponent.id}-${colorPickerOpen.type === 'background' 
                    ? (currentColors.backgroundColor || selectedComponent.styles.backgroundColor || '#000000')
                    : (currentColors.color || selectedComponent.styles.color || '#ffffff')}`}
                  color={colorPickerOpen.type === 'background' 
                    ? (currentColors.backgroundColor || selectedComponent.styles.backgroundColor || '#000000')
                    : (currentColors.color || selectedComponent.styles.color || '#ffffff')}
                  onColorChange={(newColor) => {
                    if (colorPickerOpen.type === 'background') {
                      updateComponent(selectedComponent.id, {
                        styles: { 'background-color': newColor }
                      })
                    } else {
                      updateComponent(selectedComponent.id, {
                        styles: { color: newColor }
                      })
                    }
                  }}
                  onClose={() => setColorPickerOpen({ type: null })}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <p className="text-sm">Selecteer een component om te bewerken</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
