// Template definities voor toernooi pagina's

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  components: string[];
  defaultConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
}

export const TOURNAMENT_TEMPLATES: TemplateConfig[] = [
  {
    id: 'hero-content',
    name: 'Hero + Content Blokken',
    description: 'Professionele layout met grote hero sectie bovenaan en gestructureerde content blokken voor over, sponsors, inschrijven en nieuws.',
    category: 'Populair',
    thumbnail: '/templates/hero-content.svg',
    components: ['header', 'description', 'tournamentDetails', 'registration', 'sponsors', 'schedule', 'rules'],
    defaultConfig: {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'sidebar-layout',
    name: 'Sidebar Layout',
    description: 'Efficiënte layout met navigatie in de zijbalk en ruimte voor brackets, schema\'s en wedstrijdinformatie in het hoofdvlak.',
    category: 'Esports',
    thumbnail: '/templates/sidebar-layout.svg',
    components: ['header', 'schedule', 'tournamentDetails', 'stats', 'rules', 'prizes', 'registration'],
    defaultConfig: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#f59e0b',
      backgroundColor: '#f8fafc'
    }
  },
  {
    id: 'landing-page',
    name: 'Landing Page Style',
    description: 'Impactvolle 1-pager met fullscreen hero, duidelijke call-to-action en scrollbare secties voor maximale conversie.',
    category: 'Marketing',
    thumbnail: '/templates/landing-page.svg',
    components: ['header', 'description', 'registration', 'tournamentDetails', 'prizes', 'social', 'contact'],
    defaultConfig: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'grid-card',
    name: 'Grid / Card Layout',
    description: 'Overzichtelijke grid layout met kaarten voor teams, spelers of matches. Inclusief filter- en zoekopties voor grote toernooien.',
    category: 'Tournament',
    thumbnail: '/templates/grid-card.svg',
    components: ['header', 'description', 'stats', 'schedule', 'tournamentDetails', 'prizes', 'sponsors'],
    defaultConfig: {
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'media-centric',
    name: 'Media-Centric',
    description: 'Perfect voor live events met centrale livestream (Twitch/YouTube), realtime wedstrijdinfo en interactieve chat.',
    category: 'Streaming',
    thumbnail: '/templates/media-centric.svg',
    components: ['livestream', 'header', 'schedule', 'tournamentDetails', 'stats', 'social', 'sponsors'],
    defaultConfig: {
      primaryColor: '#ef4444',
      secondaryColor: '#f59e0b',
      backgroundColor: '#18181b'
    }
  }
];

// Custom template (lege layout)
export const CUSTOM_TEMPLATE: TemplateConfig = {
  id: 'custom',
  name: 'Custom',
  description: 'Start met een lege pagina en bouw je eigen unieke layout vanaf nul.',
  category: 'Custom',
  thumbnail: '/templates/custom.svg',
  components: [],
  defaultConfig: {
    primaryColor: '#0044cc',
    secondaryColor: '#ff6600',
    backgroundColor: '#ffffff'
  }
};

// Helper functie om template op te halen
export function getTemplateById(id: string): TemplateConfig | undefined {
  if (id === 'custom') return CUSTOM_TEMPLATE;
  return TOURNAMENT_TEMPLATES.find(template => template.id === id);
}

// Helper functie om enabled components object te maken
export function getEnabledComponentsFromTemplate(templateId: string): Record<string, boolean> {
  const template = getTemplateById(templateId);
  if (!template) return {};
  
  const allComponents = [
    'header',
    'description',
    'tournamentDetails',
    'registration',
    'stats',
    'schedule',
    'rules',
    'prizes',
    'sponsors',
    'social',
    'contact',
    'livestream'
  ];
  
  const enabledComponents: Record<string, boolean> = {};
  allComponents.forEach(component => {
    enabledComponents[component] = template.components.includes(component);
  });
  
  return enabledComponents;
}
