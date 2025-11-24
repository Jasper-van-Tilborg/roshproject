'use client'

import { useState, useEffect, useRef } from 'react'
import Footer, { FooterConfig, FooterLink } from '../components/Footer'

export default function FooterControlPage() {
    const [config, setConfig] = useState<FooterConfig>({
        showFooter: true,
        backgroundColor: '#111827',
        textColor: '#f3f4f6',
        linkColor: '#d1d5db',
        linkHoverColor: '#60a5fa',
        copyrightText: '© 2025 Alle rechten voorbehouden.',
        showSocialLinks: true,
        socialLinks: {
            instagram: '',
            twitter: '',
            discord: '',
            facebook: '',
            youtube: ''
        },
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
    })

    const previewRef = useRef<HTMLDivElement>(null)

    // State for collapsible sections
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

    // Load config from localStorage on mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('footerConfig')
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig)
                setConfig(parsed)
            } catch (e) {
                console.error('Error loading footer config:', e)
            }
        }
    }, [])

    // Save config to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('footerConfig', JSON.stringify(config))
    }, [config])

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


    const updateSocialLink = (platform: keyof FooterConfig['socialLinks'], value: string) => {
        updateConfig({
            socialLinks: {
                ...config.socialLinks,
                [platform]: value
            }
        })
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#111827' }}>
            {/* Left Sidebar - Checkbox */}
            <div className="w-64 border-r border-gray-700 overflow-y-auto" style={{ backgroundColor: '#1f2937' }}>
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-white">Footer Instellingen</h1>
                    <p className="text-sm text-gray-400 mt-1">Pas de footer aan en bekijk live preview</p>
                </div>

                <div className="p-4">
                    {/* Footer Toggle */}
                    <div className="flex flex-col items-start gap-3 p-4 border border-gray-600 rounded-lg bg-gray-800">
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
                        {/* Mock page content to show footer in context */}
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

                        {/* Footer Preview */}
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.layout ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSections.layout && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-2">
                                                Footer Layout
                                            </label>
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    onClick={() => updateConfig({ layout: 'layout1' })}
                                                    className={`relative border-2 rounded-lg overflow-hidden transition-all w-full ${config.layout === 'layout1'
                                                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <img
                                                        src="/footer 1.png"
                                                        alt="Footer Layout 1"
                                                        className="w-full h-auto object-contain"
                                                    />
                                                    {config.layout === 'layout1' && (
                                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => updateConfig({ layout: 'layout2' })}
                                                    className={`relative border-2 rounded-lg overflow-hidden transition-all w-full ${config.layout === 'layout2'
                                                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <img
                                                        src="/footer 2.png"
                                                        alt="Footer Layout 2"
                                                        className="w-full h-auto object-contain"
                                                    />
                                                    {config.layout === 'layout2' && (
                                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => updateConfig({ layout: 'layout3' })}
                                                    className={`relative border-2 rounded-lg overflow-hidden transition-all w-full ${config.layout === 'layout3'
                                                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <img
                                                        src="/footer 3.png"
                                                        alt="Footer Layout 3"
                                                        className="w-full h-auto object-contain"
                                                    />
                                                    {config.layout === 'layout3' && (
                                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Padding: {config.padding}px
                                            </label>
                                            <input
                                                type="range"
                                                min="24"
                                                max="96"
                                                value={config.padding}
                                                onChange={(e) => updateConfig({ padding: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="showBottomDivider"
                                                checked={config.showBottomDivider}
                                                onChange={(e) => updateConfig({ showBottomDivider: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="showBottomDivider" className="text-xs font-medium text-gray-300">
                                                Scheidingsstreep
                                            </label>
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSections.colors && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Achtergrondkleur
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={config.backgroundColor}
                                                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.backgroundColor}
                                                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                                    className="w-24 px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Tekstkleur
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={config.textColor}
                                                    onChange={(e) => updateConfig({ textColor: e.target.value })}
                                                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.textColor}
                                                    onChange={(e) => updateConfig({ textColor: e.target.value })}
                                                    className="w-24 px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Linkkleur
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={config.linkColor}
                                                    onChange={(e) => updateConfig({ linkColor: e.target.value })}
                                                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.linkColor}
                                                    onChange={(e) => updateConfig({ linkColor: e.target.value })}
                                                    className="w-24 px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Link hover kleur
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={config.linkHoverColor}
                                                    onChange={(e) => updateConfig({ linkHoverColor: e.target.value })}
                                                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.linkHoverColor}
                                                    onChange={(e) => updateConfig({ linkHoverColor: e.target.value })}
                                                    className="w-24 px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                />
                                            </div>
                                        </div>
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.socialLinks ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSections.socialLinks && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                id="showSocialLinks"
                                                checked={config.showSocialLinks}
                                                onChange={(e) => updateConfig({ showSocialLinks: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="showSocialLinks" className="text-sm font-medium text-gray-300">
                                                Social Media Links weergeven
                                            </label>
                                        </div>
                                        {config.showSocialLinks && (
                                            <div className="space-y-3 pl-6">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                                        Instagram URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={config.socialLinks.instagram || ''}
                                                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                        placeholder="https://instagram.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                                        Twitter URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={config.socialLinks.twitter || ''}
                                                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                        placeholder="https://twitter.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                                        Discord URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={config.socialLinks.discord || ''}
                                                        onChange={(e) => updateSocialLink('discord', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                        placeholder="https://discord.gg/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                                        Facebook URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={config.socialLinks.facebook || ''}
                                                        onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                        placeholder="https://facebook.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                                        YouTube URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={config.socialLinks.youtube || ''}
                                                        onChange={(e) => updateSocialLink('youtube', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                        placeholder="https://youtube.com/..."
                                                    />
                                                </div>
                                            </div>
                                        )}
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.logo ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSections.logo && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Logo Upload
                                            </label>
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            // Check file size (max 5MB)
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

                                                {/* Preview */}
                                                {config.logoUrl && config.logoUrl.trim() !== '' && (
                                                    <div className="relative">
                                                        <div className="border border-gray-600 rounded p-3 bg-gray-800">
                                                            <img
                                                                src={config.logoUrl}
                                                                alt="Logo preview"
                                                                className="max-h-24 w-auto mx-auto object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'
                                                                }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => updateConfig({ logoUrl: '' })}
                                                            className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition"
                                                        >
                                                            Logo Verwijderen
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Upload een afbeelding voor je logo (max 5MB)
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Logo Tekst (fallback)
                                            </label>
                                            <input
                                                type="text"
                                                value={config.logoText || ''}
                                                onChange={(e) => updateConfig({ logoText: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                placeholder="LOGO"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Wordt gebruikt als er geen logo is geüpload
                                            </p>
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.navigationLinks ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSections.navigationLinks && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Home
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.home.label}
                                                    onChange={(e) => updateNavigationLink('home', 'label', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.home.url}
                                                    onChange={(e) => updateNavigationLink('home', 'url', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="/url"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Info
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.info.label}
                                                    onChange={(e) => updateNavigationLink('info', 'label', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.info.url}
                                                    onChange={(e) => updateNavigationLink('info', 'url', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="/url"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Bracket
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.bracket.label}
                                                    onChange={(e) => updateNavigationLink('bracket', 'label', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.bracket.url}
                                                    onChange={(e) => updateNavigationLink('bracket', 'url', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="/url"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Location
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.location.label}
                                                    onChange={(e) => updateNavigationLink('location', 'label', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    type="text"
                                                    value={config.navigationLinks.location.url}
                                                    onChange={(e) => updateNavigationLink('location', 'url', e.target.value)}
                                                    className="px-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white"
                                                    placeholder="/url"
                                                />
                                            </div>
                                        </div>
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
                                    <svg
                                        className={`w-5 h-5 transition-transform ${openSections.copyright ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
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

