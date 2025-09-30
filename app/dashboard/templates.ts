// Template definities voor toernooi pagina's

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  layoutStyle: string;
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
    id: 'classic-stack',
    name: 'Classic Stack',
    description: 'Traditionele verticale layout met full-width secties. Hero bovenaan, gevolgd door overzichtelijke content blokken. Perfect voor standaard toernooien met duidelijke hiërarchie.',
    category: 'Classic',
    layoutStyle: 'Verticaal gestapeld, full-width secties',
    thumbnail: '/templates/classic-stack.svg',
    components: ['header', 'livestream', 'description', 'tournamentDetails', 'schedule', 'stats', 'sponsors', 'social', 'contact'],
    defaultConfig: {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'sidebar-pro',
    name: 'Sidebar Pro',
    description: 'Moderne sidebar layout met vaste navigatie links en scrollbare content rechts. Ideaal voor data-rijke toernooien met veel informatie die georganiseerd moet worden.',
    category: 'Professional',
    layoutStyle: 'Sidebar navigation + main content area',
    thumbnail: '/templates/sidebar-pro.svg',
    components: ['header', 'tournamentDetails', 'livestream', 'schedule', 'stats', 'description', 'prizes', 'sponsors', 'social'],
    defaultConfig: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#f59e0b',
      backgroundColor: '#f8fafc'
    }
  },
  {
    id: 'grid-master',
    name: 'Grid Master',
    description: 'Volledig modulaire grid layout waar elke sectie als card wordt weergegeven. Flexibel en visueel aantrekkelijk met veel witruimte. Perfect voor moderne, clean designs.',
    category: 'Modern',
    layoutStyle: 'Multi-column grid met cards',
    thumbnail: '/templates/grid-master.svg',
    components: ['header', 'description', 'livestream', 'stats', 'schedule', 'tournamentDetails', 'prizes', 'registration', 'sponsors'],
    defaultConfig: {
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Dynamische 50/50 split layout met livestream prominent aan één kant en informatie aan de andere kant. Excellent voor live events waar de stream de focus moet hebben.',
    category: 'Live Events',
    layoutStyle: '50/50 split sections met focal points',
    thumbnail: '/templates/split-screen.svg',
    components: ['header', 'livestream', 'schedule', 'description', 'stats', 'tournamentDetails', 'registration', 'social', 'sponsors'],
    defaultConfig: {
      primaryColor: '#ef4444',
      secondaryColor: '#f59e0b',
      backgroundColor: '#18181b'
    }
  },
  {
    id: 'asymmetric-flow',
    name: 'Asymmetric Flow',
    description: 'Creatieve asymmetrische layout met wisselende content breedtes en staggered secties. Voor toernooien die opvallen met een uniek, artistiek design.',
    category: 'Creative',
    layoutStyle: 'Asymmetrisch met wisselende breedtes',
    thumbnail: '/templates/asymmetric-flow.svg',
    components: ['header', 'description', 'livestream', 'stats', 'schedule', 'prizes', 'tournamentDetails', 'sponsors', 'social', 'contact'],
    defaultConfig: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      backgroundColor: '#fafafa'
    }
  },
  {
    id: 'card-cascade',
    name: 'Card Cascade',
    description: 'Elegant cascading card design met overlappende secties en depth effecten. Geeft een premium gevoel met layer-on-layer presentatie. Ideaal voor high-end toernooien.',
    category: 'Premium',
    layoutStyle: 'Overlappende cards met depth',
    thumbnail: '/templates/card-cascade.svg',
    components: ['header', 'livestream', 'description', 'stats', 'tournamentDetails', 'schedule', 'prizes', 'registration', 'sponsors', 'social'],
    defaultConfig: {
      primaryColor: '#6366f1',
      secondaryColor: '#a855f7',
      backgroundColor: '#f9fafb'
    }
  },
  {
    id: 'magazine-style',
    name: 'Magazine Style',
    description: 'Editorial magazine layout met multi-column text flows en featured content blocks. Perfect voor storytelling en content-rijke toernooi presentaties.',
    category: 'Editorial',
    layoutStyle: 'Multi-column magazine layout',
    thumbnail: '/templates/magazine-style.svg',
    components: ['header', 'description', 'livestream', 'schedule', 'stats', 'tournamentDetails', 'rules', 'prizes', 'sponsors', 'social', 'contact'],
    defaultConfig: {
      primaryColor: '#dc2626',
      secondaryColor: '#ea580c',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'tabbed-compact',
    name: 'Tabbed Compact',
    description: 'Ruimtebesparend tabbed interface design waar content georganiseerd is in tabs. Maximum informatie in minimum ruimte, perfect voor mobile-first toernooien.',
    category: 'Compact',
    layoutStyle: 'Tabbed interface met compacte secties',
    thumbnail: '/templates/tabbed-compact.svg',
    components: ['header', 'livestream', 'schedule', 'stats', 'tournamentDetails', 'description', 'prizes', 'rules', 'registration'],
    defaultConfig: {
      primaryColor: '#0891b2',
      secondaryColor: '#06b6d4',
      backgroundColor: '#f0fdfa'
    }
  },
  {
    id: 'dashboard-view',
    name: 'Dashboard View',
    description: 'Data-centric dashboard layout met widgets, charts en realtime stats. Voor toernooien waar statistieken en live data centraal staan. Analytics-focused design.',
    category: 'Analytics',
    layoutStyle: 'Dashboard met data widgets',
    thumbnail: '/templates/dashboard-view.svg',
    components: ['header', 'stats', 'livestream', 'schedule', 'tournamentDetails', 'description', 'prizes', 'sponsors', 'social'],
    defaultConfig: {
      primaryColor: '#7c3aed',
      secondaryColor: '#2563eb',
      backgroundColor: '#fafaf9'
    }
  },
  {
    id: 'hero-focused',
    name: 'Hero Focused',
    description: 'Imposante fullscreen hero met parallax effect en compacte informatiesecties daaronder. Voor toernooien die een sterke visuele impact willen maken vanaf het eerste moment.',
    category: 'Impact',
    layoutStyle: 'Fullscreen hero + compact content',
    thumbnail: '/templates/hero-focused.svg',
    components: ['header', 'description', 'registration', 'livestream', 'stats', 'schedule', 'tournamentDetails', 'prizes', 'sponsors', 'social', 'contact'],
    defaultConfig: {
      primaryColor: '#db2777',
      secondaryColor: '#f59e0b',
      backgroundColor: '#ffffff'
    }
  }
];

// Custom template (lege layout)
export const CUSTOM_TEMPLATE: TemplateConfig = {
  id: 'custom',
  name: 'Custom',
  description: 'Start met een volledig lege pagina en bouw je eigen unieke layout vanaf nul. Geen vooraf ingestelde secties, volledige creatieve vrijheid.',
  category: 'Custom',
  layoutStyle: 'Vrije indeling, start vanaf nul',
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

// Helper functie om template informatie te krijgen voor UI display
export function getTemplateDisplayInfo(templateId: string): {
  name: string;
  description: string;
  layoutStyle: string;
  componentCount: number;
} | null {
  const template = getTemplateById(templateId);
  if (!template) return null;
  
  return {
    name: template.name,
    description: template.description,
    layoutStyle: template.layoutStyle,
    componentCount: template.components.length
  };
}