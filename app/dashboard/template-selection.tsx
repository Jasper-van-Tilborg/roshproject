'use client';

import { useState } from 'react';
import { TOURNAMENT_TEMPLATES, CUSTOM_TEMPLATE, TemplateConfig } from './templates';

interface TemplateSelectionProps {
  onSelectTemplate: (templateId: string) => void;
}

// TemplateCard Component
function TemplateCard({ 
  template, 
  onSelect 
}: { 
  template: TemplateConfig; 
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:border-blue-500 hover:shadow-xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
          {template.category}
        </span>
      </div>

      {/* Thumbnail Preview */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {/* Template Preview Placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <svg 
            className="w-24 h-24 text-gray-300 group-hover:text-blue-400 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
            />
          </svg>
        </div>
        
        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            Selecteer Template
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {template.description}
        </p>
        
        {/* Layout Style Badge */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="font-medium">{template.layoutStyle}</span>
          </div>
        </div>
        
        {/* Component Count */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{template.components.length} secties</span>
        </div>
      </div>
    </div>
  );
}

// CustomCard Component
function CustomCard({ onSelect }: { onSelect: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 overflow-hidden transition-all duration-300 hover:border-blue-500 hover:shadow-xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Custom Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
          Custom
        </span>
      </div>

      {/* Icon Area */}
      <div className="relative h-56 flex items-center justify-center">
        <div className="relative">
          {/* Animated Background Circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-500 bg-opacity-10 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-purple-500 bg-opacity-10 rounded-full animate-pulse delay-75"></div>
          </div>
          
          {/* Plus Icon */}
          <svg 
            className="relative w-20 h-20 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </div>
        
        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            Start met Lege Pagina
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-900 bg-opacity-50">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {CUSTOM_TEMPLATE.name}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {CUSTOM_TEMPLATE.description}
        </p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
            🎨 Volledige vrijheid
          </span>
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
            🔧 Volledig aanpasbaar
          </span>
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
            ⚡ Vanaf nul opbouwen
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Template Selection Component
export default function TemplateSelection({ onSelectTemplate }: TemplateSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Kies een Template voor je Toernooi Pagina
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Start met een professioneel ontworpen template of bouw je eigen unieke layout vanaf nul. 
              Alle templates zijn volledig aanpasbaar naar jouw wensen.
            </p>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {/* Category Filter Info */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{TOURNAMENT_TEMPLATES.length} Professionele Templates</span> + Custom Optie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Template Cards */}
          {TOURNAMENT_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template.id)}
            />
          ))}

          {/* Custom Card */}
          <CustomCard onSelect={() => onSelectTemplate('custom')} />
        </div>

        {/* Info Section */}
        <div className="mt-16 space-y-8">
          {/* Features Grid */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Waarom Templates Gebruiken?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">100% Whitelabel</h3>
                <p className="text-gray-600 text-sm">Alle kleuren, fonts, teksten en layouts volledig aanpasbaar.</p>
              </div>
              
              <div>
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Responsive Design</h3>
                <p className="text-gray-600 text-sm">Perfect weergegeven op alle apparaten met live preview.</p>
              </div>
              
              <div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Snel Starten</h3>
                <p className="text-gray-600 text-sm">Professioneel ontwerp direct gebruiken, binnen minuten live.</p>
              </div>

              <div>
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Drag & Drop</h3>
                <p className="text-gray-600 text-sm">Verplaats en herschik alle secties naar jouw wens.</p>
              </div>
            </div>
          </div>

          {/* Template Categories */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Template Categorieën</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from(new Set(TOURNAMENT_TEMPLATES.map(t => t.category))).map((category, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-700">{category}</span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {TOURNAMENT_TEMPLATES.filter(t => t.category === category).length} template{TOURNAMENT_TEMPLATES.filter(t => t.category === category).length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
