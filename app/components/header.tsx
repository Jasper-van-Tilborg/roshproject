'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Types voor de header configuratie
interface NavItem {
  name: string;
  href: string;
  isActive?: boolean;
}

interface HeaderConfig {
  id?: string;
  name?: string;
  savedAt?: string;
  logo?: {
    src?: string;
    alt: string;
    width?: number;
    height?: number;
    file?: File; // Voor geüploade bestanden
  };
  favicon?: {
    src: string;
    file?: File; // Voor geüploade bestanden
  };
  navItems: NavItem[];
  layout: 'horizontal' | 'vertical' | 'centered';
  theme: 'light' | 'dark' | 'transparent';
  showMobileMenu?: boolean;
  sticky?: boolean;
  customStyles?: React.CSSProperties;
  navigationLayout: 'logo-left' | 'logo-center' | 'logo-right' | 'logo-top' | 'logo-bottom';
}

interface HeaderProps {
  config?: HeaderConfig;
  onNavClick?: (item: NavItem) => void;
}

// Header Builder Component - Voor gebruikers zonder programmeerkennis
interface HeaderBuilderProps {
  onConfigChange: (config: HeaderConfig) => void;
  initialConfig?: HeaderConfig;
}

export function HeaderBuilder({ onConfigChange, initialConfig = defaultConfig }: HeaderBuilderProps) {
  // State management zoals in dashboard
  const [config, setConfig] = useState<HeaderConfig>(initialConfig);
  const [newPageName, setNewPageName] = useState('');
  const [newPageLink, setNewPageLink] = useState('');
  const [currentView, setCurrentView] = useState<'config' | 'preview' | 'export'>('config');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [savedConfigs, setSavedConfigs] = useState<HeaderConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [configName, setConfigName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Laad opgeslagen configuraties uit localStorage
  useEffect(() => {
    const savedConfigs = localStorage.getItem('headerConfigs');
    if (savedConfigs) {
      try {
        const parsedConfigs = JSON.parse(savedConfigs);
        setSavedConfigs(parsedConfigs);
      } catch (error) {
        console.error('Error loading header configs from localStorage:', error);
      }
    }
  }, []);

  // Functie om configuratie op te slaan
  const saveConfig = () => {
    if (!configName.trim()) {
      alert('Voer een naam in voor de configuratie!');
      return;
    }

    const newConfig = {
      ...config,
      id: Date.now().toString(),
      name: configName.trim(),
      savedAt: new Date().toISOString()
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('headerConfigs', JSON.stringify(updatedConfigs));
    
    setShowSaveDialog(false);
    setConfigName('');
    alert('Configuratie opgeslagen!');
  };

  // Functie om configuratie te laden
  const loadConfig = (configId: string) => {
    const configToLoad = savedConfigs.find(c => c.id === configId);
    if (configToLoad) {
      setConfig(configToLoad);
      setSelectedConfigId(configId);
      onConfigChange(configToLoad);
    }
  };

  // Functie om configuratie te verwijderen
  const deleteConfig = (configId: string) => {
    if (confirm('Weet je zeker dat je deze configuratie wilt verwijderen?')) {
      const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
      setSavedConfigs(updatedConfigs);
      localStorage.setItem('headerConfigs', JSON.stringify(updatedConfigs));
      
      if (selectedConfigId === configId) {
        setSelectedConfigId(null);
        setConfig(defaultConfig);
        onConfigChange(defaultConfig);
      }
    }
  };

  const updateConfig = (updates: Partial<HeaderConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        updateConfig({
          logo: {
            ...config.logo,
            src: result,
            alt: config.logo?.alt || file.name,
            file: file
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Favicon upload handler
  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaviconPreview(result);
        updateConfig({
          favicon: {
            src: result,
            file: file
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Automatische pagina creatie bij link toevoegen
  const addPage = () => {
    if (newPageName.trim()) {
      const pageName = newPageName.trim();
      const pageLink = newPageLink.trim() || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
      
      const newPage: NavItem = {
        name: pageName,
        href: pageLink,
        isActive: false
      };
      
      updateConfig({
        navItems: [...config.navItems, newPage]
      });
      
      // Reset form
      setNewPageName('');
      setNewPageLink('');
      
      // Toon bevestiging
      alert(`Pagina "${pageName}" is toegevoegd met link "${pageLink}"`);
    }
  };

  const removePage = (index: number) => {
    const updatedPages = config.navItems.filter((_, i) => i !== index);
    updateConfig({ navItems: updatedPages });
  };

  const updatePageName = (index: number, newName: string) => {
    const updatedPages = config.navItems.map((page, i) => 
      i === index ? { ...page, name: newName } : page
    );
    updateConfig({ navItems: updatedPages });
  };

  const updatePageLink = (index: number, newLink: string) => {
    const updatedPages = config.navItems.map((page, i) => 
      i === index ? { ...page, href: newLink } : page
    );
    updateConfig({ navItems: updatedPages });
  };

  // Reset naar default configuratie
  const resetConfig = () => {
    if (confirm('Weet je zeker dat je alle wijzigingen wilt resetten?')) {
      setConfig(defaultConfig);
      setSelectedConfigId(null);
      onConfigChange(defaultConfig);
    }
  };

  // Render functie voor verschillende views
  const renderConfigView = () => (
    <div className="space-y-6">
      {/* Header met acties */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🎨 Header Configurator</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 Opslaan
          </button>
          <button
            onClick={resetConfig}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Opgeslagen configuraties */}
      {savedConfigs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">📁 Opgeslagen Configuraties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedConfigs.map((savedConfig) => (
              <div key={savedConfig.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{savedConfig.name}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => savedConfig.id && loadConfig(savedConfig.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📂
                    </button>
                    <button
                      onClick={() => savedConfig.id && deleteConfig(savedConfig.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {savedConfig.savedAt && new Date(savedConfig.savedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logo sectie */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📷 Logo Instellingen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL (link naar je logo)
            </label>
            <input
              type="url"
              value={config.logo?.src || ''}
              onChange={(e) => updateConfig({
                logo: { ...config.logo, src: e.target.value, alt: 'Logo' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo beschrijving
            </label>
            <input
              type="text"
              value={config.logo?.alt || ''}
              onChange={(e) => updateConfig({
                logo: { ...config.logo, alt: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mijn Toernooi Logo"
            />
          </div>
        </div>
      </div>

      {/* Pagina's sectie */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📄 Pagina's Beheren</h3>
        
        {/* Bestaande pagina's */}
        <div className="space-y-3 mb-4">
          {config.navItems.map((page, index) => (
            <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-md">
              <input
                type="text"
                value={page.name}
                onChange={(e) => updatePageName(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pagina naam"
              />
              <input
                type="text"
                value={page.href}
                onChange={(e) => updatePageLink(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/pagina-link"
              />
              <button
                onClick={() => removePage(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* Nieuwe pagina toevoegen */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nieuwe pagina naam"
          />
          <input
            type="text"
            value={newPageLink}
            onChange={(e) => setNewPageLink(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Link (optioneel)"
          />
          <button
            onClick={addPage}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            ➕ Toevoegen
          </button>
        </div>
      </div>

      {/* Stijl opties */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎨 Stijl Opties</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kleurenschema
            </label>
            <select
              value={config.theme}
              onChange={(e) => updateConfig({ theme: e.target.value as HeaderConfig['theme'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">☀️ Licht (wit)</option>
              <option value="dark">🌙 Donker (zwart)</option>
              <option value="transparent">✨ Transparant</option>
            </select>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opstelling
            </label>
            <select
              value={config.layout}
              onChange={(e) => updateConfig({ layout: e.target.value as HeaderConfig['layout'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="horizontal">↔️ Horizontaal</option>
              <option value="vertical">↕️ Verticaal</option>
              <option value="centered">🎯 Gecentreerd</option>
            </select>
          </div>
        </div>

        {/* Extra opties */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sticky}
              onChange={(e) => updateConfig({ sticky: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">📌 Header blijft bovenaan (sticky)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showMobileMenu}
              onChange={(e) => updateConfig({ showMobileMenu: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">📱 Mobiel menu tonen</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPreviewView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">👀 Live Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewViewport('desktop')}
            className={`px-3 py-1 rounded ${previewViewport === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setPreviewViewport('tablet')}
            className={`px-3 py-1 rounded ${previewViewport === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            📱 Tablet
          </button>
          <button
            onClick={() => setPreviewViewport('mobile')}
            className={`px-3 py-1 rounded ${previewViewport === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className={`mx-auto transition-all duration-300 ${
          previewViewport === 'desktop' ? 'max-w-6xl' :
          previewViewport === 'tablet' ? 'max-w-2xl' :
          'max-w-sm'
        }`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <Header config={config} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">💾 Export Configuratie</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Configuratie Code</h3>
        <p className="text-sm text-gray-600 mb-4">
          Kopieer deze code om je header configuratie te gebruiken in je project:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm border">
          {JSON.stringify(config, null, 2)}
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          📋 Kopieer naar klembord
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header met acties */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🎨 Header Configurator</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              💾 Opslaan
            </button>
            <button
              onClick={resetConfig}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Reset
            </button>
            <button
              onClick={() => setCurrentView('export')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Export
            </button>
          </div>
        </div>
      </div>

      {/* Split screen layout */}
      <div className="flex h-screen">
        {/* Links: Configuratie panelen */}
        <div className="w-1/2 bg-white border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Opgeslagen configuraties */}
            {savedConfigs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">📁 Opgeslagen Configuraties</h3>
                <div className="grid grid-cols-1 gap-2">
                  {savedConfigs.map((savedConfig) => (
                    <div key={savedConfig.id} className="border rounded-lg p-3 hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{savedConfig.name}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => savedConfig.id && loadConfig(savedConfig.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            📂
                          </button>
                          <button
                            onClick={() => savedConfig.id && deleteConfig(savedConfig.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {savedConfig.savedAt && new Date(savedConfig.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logo sectie */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">📷 Logo Instellingen</h3>
              
              {/* Logo upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Upload (PNG)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">Klik om logo te uploaden</span>
                    <span className="text-xs text-gray-500">PNG, JPG (max 5MB)</span>
                  </label>
                </div>
                
                {/* Logo preview */}
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-20 max-w-32 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              {/* Logo URL (alternatief) */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Of logo URL
                </label>
                <input
                  type="url"
                  value={config.logo?.src || ''}
                  onChange={(e) => {
                    updateConfig({
                      logo: { ...config.logo, src: e.target.value, alt: 'Logo' }
                    });
                    setLogoPreview(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://example.com/logo.png"
                />
              </div>

          {/* Logo beschrijving */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo beschrijving
            </label>
            <input
              type="text"
              value={config.logo?.alt || ''}
              onChange={(e) => updateConfig({
                logo: { ...config.logo, alt: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Mijn Toernooi Logo"
            />
          </div>
        </div>

        {/* Favicon sectie */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🌐 Favicon Instellingen</h3>
          
          {/* Favicon upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon Upload (ICO, PNG)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/x-icon,image/png,image/jpeg,image/jpg"
                onChange={handleFaviconUpload}
                className="hidden"
                id="favicon-upload"
              />
              <label
                htmlFor="favicon-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">Klik om favicon te uploaden</span>
                <span className="text-xs text-gray-500">ICO, PNG, JPG (max 2MB)</span>
              </label>
            </div>
            
            {/* Favicon preview */}
            {faviconPreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <img
                    src={faviconPreview}
                    alt="Favicon preview"
                    className="w-8 h-8 object-contain border rounded"
                  />
                  <span className="text-sm text-gray-500">16x16px (browser tab)</span>
                </div>
              </div>
            )}
          </div>

          {/* Favicon URL (alternatief) */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Of favicon URL
            </label>
            <input
              type="url"
              value={config.favicon?.src || ''}
              onChange={(e) => {
                updateConfig({
                  favicon: { ...config.favicon, src: e.target.value }
                });
                setFaviconPreview(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="https://example.com/favicon.ico"
            />
          </div>

          <div className="text-xs text-gray-500">
            💡 Tip: Een favicon wordt getoond in de browser tab. Gebruik een vierkant bestand (16x16px of 32x32px) voor het beste resultaat.
          </div>
        </div>

            {/* Pagina's sectie */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">📄 Pagina's Beheren</h3>
              
              {/* Bestaande pagina's */}
              <div className="space-y-2 mb-3">
                {config.navItems.map((page, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-white rounded border">
                    <input
                      type="text"
                      value={page.name}
                      onChange={(e) => updatePageName(index, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Pagina naam"
                    />
                    <input
                      type="text"
                      value={page.href}
                      onChange={(e) => updatePageLink(index, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="/link"
                    />
                    <button
                      onClick={() => removePage(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>

              {/* Nieuwe pagina toevoegen */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nieuwe pagina"
                />
                <input
                  type="text"
                  value={newPageLink}
                  onChange={(e) => setNewPageLink(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Link (optioneel)"
                />
                <button
                  onClick={addPage}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  ➕
                </button>
              </div>
            </div>

            {/* Navigatie Opstelling */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">🎯 Navigatie Opstelling</h3>
              
              <div className="space-y-3">
                {/* Logo positie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Positie
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateConfig({ navigationLayout: 'logo-left' })}
                      className={`p-2 rounded border text-sm ${
                        config.navigationLayout === 'logo-left' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      📍 Links
                    </button>
                    <button
                      onClick={() => updateConfig({ navigationLayout: 'logo-center' })}
                      className={`p-2 rounded border text-sm ${
                        config.navigationLayout === 'logo-center' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🎯 Midden
                    </button>
                    <button
                      onClick={() => updateConfig({ navigationLayout: 'logo-right' })}
                      className={`p-2 rounded border text-sm ${
                        config.navigationLayout === 'logo-right' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      📍 Rechts
                    </button>
                    <button
                      onClick={() => updateConfig({ navigationLayout: 'logo-top' })}
                      className={`p-2 rounded border text-sm ${
                        config.navigationLayout === 'logo-top' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      ⬆️ Boven
                    </button>
                  </div>
                </div>

                {/* Layout type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout Type
                  </label>
                  <select
                    value={config.layout}
                    onChange={(e) => updateConfig({ layout: e.target.value as HeaderConfig['layout'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="horizontal">↔️ Horizontaal</option>
                    <option value="vertical">↕️ Verticaal</option>
                    <option value="centered">🎯 Gecentreerd</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stijl opties */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">🎨 Stijl Opties</h3>
              
              <div className="space-y-3">
                {/* Thema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kleurenschema
                  </label>
                  <select
                    value={config.theme}
                    onChange={(e) => updateConfig({ theme: e.target.value as HeaderConfig['theme'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="light">☀️ Licht (wit)</option>
                    <option value="dark">🌙 Donker (zwart)</option>
                    <option value="transparent">✨ Transparant</option>
                  </select>
                </div>

                {/* Extra opties */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.sticky}
                      onChange={(e) => updateConfig({ sticky: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📌 Sticky header</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showMobileMenu}
                      onChange={(e) => updateConfig({ showMobileMenu: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📱 Mobiel menu</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rechts: Live Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">👀 Live Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-3 py-1 rounded text-sm ${previewViewport === 'desktop' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
                >
                  🖥️ Desktop
                </button>
                <button
                  onClick={() => setPreviewViewport('tablet')}
                  className={`px-3 py-1 rounded text-sm ${previewViewport === 'tablet' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
                >
                  📱 Tablet
                </button>
                <button
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-3 py-1 rounded text-sm ${previewViewport === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
                >
                  📱 Mobile
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className={`mx-auto transition-all duration-300 ${
                previewViewport === 'desktop' ? 'max-w-full' :
                previewViewport === 'tablet' ? 'max-w-md' :
                'max-w-xs'
              }`}>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Header config={config} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">💾 Configuratie Opslaan</h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Naam voor deze configuratie"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={saveConfig}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Opslaan
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export dialog */}
      {currentView === 'export' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">💾 Export Configuratie</h3>
              <button
                onClick={() => setCurrentView('config')}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 Kopieer naar klembord
                </button>
                <button
                  onClick={() => setCurrentView('config')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default configuratie
const defaultConfig: HeaderConfig = {
  logo: {
    src: '/logoheader.png',
    alt: 'Logo',
    width: 150,
    height: 50
  },
  favicon: {
    src: '/favicon.ico'
  },
  navItems: [],
  layout: 'horizontal',
  theme: 'light',
  showMobileMenu: true,
  sticky: true,
  navigationLayout: 'logo-center'
};

export default function Header({ config = defaultConfig, onNavClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(config.navItems.find(item => item.isActive)?.name || config.navItems[0]?.name);

  // Update favicon wanneer configuratie verandert
  useEffect(() => {
    if (config.favicon?.src) {
      // Verwijder bestaande favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Voeg nieuwe favicon toe
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.href = config.favicon.src;
      faviconLink.type = config.favicon.src.includes('.ico') ? 'image/x-icon' : 'image/png';
      document.head.appendChild(faviconLink);
    }
  }, [config.favicon]);

  const handleNavClick = (item: NavItem) => {
    setActiveItem(item.name);
    setIsMobileMenuOpen(false);
    onNavClick?.(item);
  };

  const getThemeClasses = () => {
    const baseClasses = 'transition-all duration-300';
    
    switch (config.theme) {
      case 'dark':
        return `${baseClasses} bg-gray-900 text-white shadow-lg`;
      case 'transparent':
        return `${baseClasses} bg-transparent text-gray-800 backdrop-blur-sm`;
      default:
        return `${baseClasses} bg-white text-gray-800 shadow-md`;
    }
  };

  const getLayoutClasses = () => {
    switch (config.layout) {
      case 'vertical':
        return 'flex-col space-y-4';
      case 'centered':
        return 'flex-col items-center space-y-4';
      default:
        return 'flex-row items-center justify-between';
    }
  };

  const getNavigationLayoutClasses = () => {
    switch (config.navigationLayout) {
      case 'logo-center':
        return 'flex-row items-center justify-center space-x-8';
      case 'logo-right':
        return 'flex-row items-center justify-end space-x-8';
      case 'logo-top':
        return 'flex-col items-center space-y-4';
      case 'logo-bottom':
        return 'flex-col-reverse items-center space-y-reverse space-y-4';
      default: // logo-left
        return 'flex-row items-center justify-between';
    }
  };

  const getStickyClasses = () => {
    return config.sticky ? 'sticky top-0 z-50' : '';
  };

  return (
    <header 
      className={`${getThemeClasses()} ${getStickyClasses()} w-full`}
      style={config.customStyles}
    >
      <div className="container mx-auto px-4 py-4">
        <div className={`flex ${getNavigationLayoutClasses()}`}>
          {/* Logo en navigatie items samen gecentreerd */}
          <div className="flex items-center space-x-8">
            {/* Logo sectie */}
            {config.logo && config.logo.src && (
              <div className="flex-shrink-0">
                <Image
                  src={config.logo.src}
                  alt={config.logo.alt}
                  width={config.logo.width || 150}
                  height={config.logo.height || 50}
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Desktop navigatie */}
            {config.navItems.length > 0 && (
              <nav className="hidden md:flex space-x-8">
                {config.navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeItem === item.name
                        ? config.theme === 'dark' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-blue-100 text-blue-700'
                        : config.theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Mobile menu button - rechts uitgelijnd */}
          {config.showMobileMenu && config.navItems.length > 0 && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile navigatie */}
        {config.showMobileMenu && isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              {config.navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeItem === item.name
                      ? config.theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-blue-100 text-blue-700'
                      : config.theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Exporteer ook de types voor gebruik in andere componenten
export type { HeaderConfig, NavItem, HeaderProps };