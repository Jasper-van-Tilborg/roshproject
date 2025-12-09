'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  nl: {
    // Dashboard
    'dashboard.title': 'Tournament Dashboard',
    'dashboard.welcome': 'Welkom Admin! Kies een optie.',
    'dashboard.create.tournament': 'Maak Toernooi',
    'dashboard.create.description': 'Maak een nieuw toernooi aan met alle benodigde instellingen en deelnemers.',
    'dashboard.create.button': 'Maak Nieuw Toernooi',
    'dashboard.manage.tournament': 'Beheer Toernooi',
    'dashboard.manage.description': 'Beheer bestaande toernooien, bekijk resultaten en pas instellingen aan.',
    'dashboard.manage.button': 'Beheer Toernooi',
    'back': 'Terug',
    
    // Template Selection
    'template.selection.title': 'Kies hoe je je Toernooi Pagina wilt Maken',
    'template.selection.subtitle': 'Laat onze wizard de perfecte template voor je genereren op basis van je wensen, of start met een volledig lege pagina en bouw alles zelf op.',
    'template.selection.options': '2 Opties',
    'template.selection.wizard': 'Wizard',
    'template.selection.wizard.title': 'Template Wizard',
    'template.selection.wizard.description': 'Beantwoord een paar vragen en laat ons de perfecte template voor je toernooi genereren op basis van jouw wensen.',
    'template.selection.wizard.button': 'Start Wizard',
    'template.selection.wizard.features.personal': '🎯 Persoonlijk',
    'template.selection.wizard.features.fast': '⚡ Snel',
    'template.selection.wizard.features.smart': '🧙‍♂️ Slim',
    'template.selection.custom.title': 'Custom',
    'template.selection.custom.description': 'Start met een volledig lege pagina en bouw je eigen unieke layout vanaf nul. Geen vooraf ingestelde secties, volledige creatieve vrijheid.',
    'template.selection.custom.button': 'Start met Lege Pagina',
    'template.selection.custom.features.freedom': '🎨 Volledige vrijheid',
    'template.selection.custom.features.customizable': '🔧 Volledig aanpasbaar',
    'template.selection.custom.features.build': '⚡ Vanaf nul opbouwen',
    
    // Manage Tournament
    'manage.title': 'Toernooi Beheren',
    'manage.subtitle': 'Beheer je toernooien en bekijk hun status',
    'manage.drafts': 'Drafts',
    'manage.published': 'Gepubliceerd',
    'manage.no.drafts': 'Geen drafts',
    'manage.no.drafts.description': 'Je hebt nog geen toernooi drafts opgeslagen.',
    'manage.no.published': 'Geen gepubliceerde toernooien',
    'manage.no.published.description': 'Publiceer je eerste toernooi om het hier te zien.',
    'manage.edit': 'Bewerken',
    'manage.delete': 'Verwijderen',
    'manage.view': 'Bekijken',
    'manage.publish': 'Publiceren',
    'manage.unpublish': 'Depubliceren',
    'manage.status.draft': 'Draft',
    'manage.status.published': 'Gepubliceerd',
    'manage.create.first': 'Eerste Toernooi Aanmaken',
    'manage.view.page': 'Bekijk Pagina',
    'manage.no.preview': 'Geen preview beschikbaar',
  },
  en: {
    // Dashboard
    'dashboard.title': 'Tournament Dashboard',
    'dashboard.welcome': 'Welcome Admin! Choose an option.',
    'dashboard.create.tournament': 'Create Tournament',
    'dashboard.create.description': 'Create a new tournament with all the necessary settings and participants.',
    'dashboard.create.button': 'Create New Tournament',
    'dashboard.manage.tournament': 'Manage Tournament',
    'dashboard.manage.description': 'Manage existing tournaments, view results, and adjust settings.',
    'dashboard.manage.button': 'Manage Tournament',
    'back': 'Back',
    
    // Template Selection
    'template.selection.title': 'Choose how you want to create your Tournament Page',
    'template.selection.subtitle': 'Let our wizard generate the perfect template for you based on your preferences, or start with a completely empty page and build everything yourself.',
    'template.selection.options': '2 Options',
    'template.selection.wizard': 'Wizard',
    'template.selection.wizard.title': 'Template Wizard',
    'template.selection.wizard.description': 'Answer a few questions and let us generate the perfect template for your tournament based on your preferences.',
    'template.selection.wizard.button': 'Start Wizard',
    'template.selection.wizard.features.personal': '🎯 Personal',
    'template.selection.wizard.features.fast': '⚡ Fast',
    'template.selection.wizard.features.smart': '🧙‍♂️ Smart',
    'template.selection.custom.title': 'Custom',
    'template.selection.custom.description': 'Start with a completely empty page and build your own unique layout from scratch. No preset sections, complete creative freedom.',
    'template.selection.custom.button': 'Start with Empty Page',
    'template.selection.custom.features.freedom': '🎨 Complete freedom',
    'template.selection.custom.features.customizable': '🔧 Fully customizable',
    'template.selection.custom.features.build': '⚡ Build from scratch',
    
    // Manage Tournament
    'manage.title': 'Manage Tournament',
    'manage.subtitle': 'Manage your tournaments and view their status',
    'manage.drafts': 'Drafts',
    'manage.published': 'Published',
    'manage.no.drafts': 'No drafts',
    'manage.no.drafts.description': 'You have not saved any tournament drafts yet.',
    'manage.no.published': 'No published tournaments',
    'manage.no.published.description': 'Publish your first tournament to see it here.',
    'manage.edit': 'Edit',
    'manage.delete': 'Delete',
    'manage.view': 'View',
    'manage.publish': 'Publish',
    'manage.unpublish': 'Unpublish',
    'manage.status.draft': 'Draft',
    'manage.status.published': 'Published',
    'manage.create.first': 'Create First Tournament',
    'manage.view.page': 'View Page',
    'manage.no.preview': 'No preview available',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'nl' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.nl] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

