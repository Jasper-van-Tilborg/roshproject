'use client';

import { useMemo, useState } from 'react';
import type { ReactNode, MouseEvent as ReactMouseEvent, ChangeEvent } from 'react';
import Link from 'next/link';

const createId = () => Math.random().toString(36).substring(2, 9);

const moveItem = <T,>(list: T[], from: number, to: number) => {
  const updated = [...list];
  const [removed] = updated.splice(from, 1);
  updated.splice(to, 0, removed);
  return updated;
};

type IconName =
  | 'components'
  | 'colors'
  | 'fonts'
  | 'uploads'
  | 'navigation'
  | 'hero'
  | 'about'
  | 'program'
  | 'bracket'
  | 'twitch'
  | 'sponsors'
  | 'socials'
  | 'footer'
  | 'image'
  | 'teams'
  | 'stats'
  | 'registration'
  | 'faq'
  | 'group-stage';

const ICONS: Record<IconName, ReactNode> = {
  components: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <path d="M17.5 14.5v6" />
      <path d="M14 17.5h7" />
    </svg>
  ),
  colors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 0 0 0 18 2.5 2.5 0 0 0 0-5h-3.5" />
      <path d="M7 6h.01" />
      <path d="M5 12h.01" />
      <path d="M7 18h.01" />
      <path d="M12 9h.01" />
    </svg>
  ),
  fonts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l4-16 4 16h4" />
      <path d="M9 12h6" />
    </svg>
  ),
  uploads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12" />
      <path d="M8 8l4-4 4 4" />
      <rect x="4" y="16" width="16" height="4" rx="1" />
    </svg>
  ),
  navigation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h8" />
    </svg>
  ),
  hero: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 13l2-2 2 2 3-3 4 4" />
      <path d="M7 8h.01" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  ),
  program: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M4 11h16" />
    </svg>
  ),
  bracket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h4v6H5v8" />
      <path d="M19 5h-4v6h4v8" />
      <path d="M9 8h6" />
      <path d="M9 16h6" />
    </svg>
  ),
  twitch: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M8 9v4" />
      <path d="M12 9v4" />
      <path d="M8 17l3-3h5l4-4" />
    </svg>
  ),
  sponsors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7h8l3 4-3 4H8l-3-4z" />
      <path d="M8 7V3" />
      <path d="M16 7V3" />
      <path d="M8 15v6" />
      <path d="M16 15v6" />
    </svg>
  ),
  socials: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.6 10.6 15.4 7.4" />
      <path d="M8.6 13.4 15.4 16.6" />
    </svg>
  ),
  footer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 15h16" />
      <path d="M8 19v-4" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <path d="M21 15l-4.5-4.5L11 15l-2-2-4 4" />
    </svg>
  ),
  teams: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  registration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 11v6" />
      <path d="M19 14l3-3-3-3" />
    </svg>
  ),
  faq: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  'group-stage': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={className}>
      {ICONS[name]}
    </span>
  );
}

type ComponentToggle = {
  id: string;
  label: string;
  icon: IconName;
};

const COMPONENTS: ComponentToggle[] = [
  { id: 'navigation', label: 'Navigation', icon: 'navigation' },
  { id: 'hero', label: 'Hero section', icon: 'hero' },
  { id: 'about', label: 'About', icon: 'about' },
  { id: 'program', label: 'Program / Schedule', icon: 'program' },
  { id: 'group-stage', label: 'Group Stage', icon: 'group-stage' },
  { id: 'bracket', label: 'Bracket', icon: 'bracket' },
  { id: 'teams', label: 'Teams', icon: 'teams' },
  { id: 'stats', label: 'Stats', icon: 'stats' },
  { id: 'registration', label: 'Registration Form', icon: 'registration' },
  { id: 'faq', label: 'FAQ', icon: 'faq' },
  { id: 'twitch', label: 'Twitch Stream', icon: 'twitch' },
  { id: 'sponsors', label: 'Sponsors', icon: 'sponsors' },
  { id: 'socials', label: 'Socials', icon: 'socials' },
  { id: 'footer', label: 'Footer', icon: 'footer' },
];

const NAVIGATION_FORMATS = [
  { id: 'default', label: 'Default Design', subLabel: 'Logo left' },
  { id: 'centered', label: 'Centered Logo', subLabel: 'Logo mid' },
  { id: 'minimal', label: 'Minimal Spacing', subLabel: 'Logo right' },
  { id: 'spacious', label: 'Spacious Layout', subLabel: 'Logo left' },
];

const VIEWPORTS: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];

type EditorTab = 'components' | 'colors' | 'fonts' | 'uploads';

type ThemeColorKey =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'link'
  | 'linkHover'
  | 'bodyText'
  | 'headingText'
  | 'mutedText'
  | 'pageBackground'
  | 'sectionBackground'
  | 'cardBackground'
  | 'navBackground'
  | 'navText'
  | 'navHover'
  | 'footerBackground'
  | 'footerText'
  | 'footerLink'
  | 'footerLinkHover'
  | 'buttonPrimary'
  | 'buttonPrimaryText'
  | 'buttonPrimaryHover'
  | 'buttonSecondary'
  | 'buttonSecondaryText'
  | 'buttonSecondaryHover'
  | 'border'
  | 'divider'
  | 'overlay'
  | 'shadow';

const DEFAULT_COLORS: Record<ThemeColorKey, string> = {
  primary: '#755DFF',
  secondary: '#3A7AFE',
  accent: '#FF5F8D',
  link: '#7AA2FF',
  linkHover: '#A6C1FF',
  bodyText: '#CBD5F5',
  headingText: '#FFFFFF',
  mutedText: '#7A83A1',
  pageBackground: '#05060D',
  sectionBackground: '#0E1020',
  cardBackground: '#11132A',
  navBackground: '#0B0D1C',
  navText: '#FFFFFF',
  navHover: '#A5B4FF',
  footerBackground: '#05060D',
  footerText: '#9AA0C2',
  footerLink: '#7AA2FF',
  footerLinkHover: '#BBD1FF',
  buttonPrimary: '#755DFF',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryHover: '#9C8DFF',
  buttonSecondary: '#1D1F3E',
  buttonSecondaryText: '#FFFFFF',
  buttonSecondaryHover: '#2C2E57',
  border: '#20233F',
  divider: '#2E3158',
  overlay: '#0A0E24',
  shadow: '#0F1433',
};

const THEME_PRESETS: Array<{ id: string; name: string; colors: Partial<Record<ThemeColorKey, string>> }> = [
  {
    id: 'neon',
    name: 'Neon Pulse',
    colors: {
      primary: '#9C1AFF',
      secondary: '#00D5FF',
      accent: '#FF4ECD',
      pageBackground: '#01040E',
      sectionBackground: '#0A0F1F',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Heat',
    colors: {
      primary: '#FF7A18',
      secondary: '#AF002D',
      accent: '#FFD447',
      pageBackground: '#0C0401',
      sectionBackground: '#1F0A05',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Frost',
    colors: {
      primary: '#5ED6FF',
      secondary: '#93A1FF',
      accent: '#B8FFCB',
      cardBackground: '#0F1A2E',
      pageBackground: '#030711',
    },
  },
];

type FontSettings = {
  headingFamily: string;
  bodyFamily: string;
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
    small: number;
  };
  weights: {
    heading: number;
    body: number;
  };
  lineHeight: number;
  letterSpacing: number;
};

type UploadItem = {
  id: string;
  name: string;
  url: string;
  size: string;
  usedIn: string[];
};

export default function CustomTemplatePage() {
  const [componentState, setComponentState] = useState<Record<string, boolean>>(() =>
    COMPONENTS.reduce((acc, comp) => {
      acc[comp.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [activeComponent, setActiveComponent] = useState<string>('navigation');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [navFormat, setNavFormat] = useState<string>('default');
  const [activeTab, setActiveTab] = useState<EditorTab>('components');
  const [colorPalette, setColorPalette] = useState<Record<ThemeColorKey, string>>(DEFAULT_COLORS);
  const [overlayOpacity, setOverlayOpacity] = useState(0.72);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    headingFamily: 'Space Grotesk',
    bodyFamily: 'Inter',
    sizes: { h1: 48, h2: 36, h3: 28, h4: 20, body: 16, small: 13 },
    weights: { heading: 700, body: 400 },
    lineHeight: 140,
    letterSpacing: 2,
  });
  const [uploads, setUploads] = useState<UploadItem[]>([
    {
      id: 'logo',
      name: 'team-legion-logo.png',
      url: 'https://images.rosh.gg/logo.png',
      size: '320 KB',
      usedIn: ['Navigation', 'Hero'],
    },
    {
      id: 'banner',
      name: 'hero-banner.jpg',
      url: 'https://images.rosh.gg/banner.jpg',
      size: '1.2 MB',
      usedIn: ['Hero section'],
    },
  ]);

  const [navigationSettings, setNavigationSettings] = useState({
    logoUrl: '',
    logoWidth: 140,
    linkType: 'home' as 'home' | 'custom',
    customUrl: '/',
    sticky: true,
    textColor: '#FFFFFF',
    hoverColor: '#A6B4FF',
    activeColor: '#755DFF',
    backgroundColor: 'rgba(5,6,13,0.85)',
    padding: { top: 16, bottom: 16 },
    cta: {
      enabled: true,
      label: 'Schrijf je team in',
      link: '#register-section',
      background: '#755DFF',
      textColor: '#FFFFFF',
      radius: 999,
    },
    menuItems: [
      { id: createId(), label: 'Home', type: 'section', value: '#hero-section', icon: '', enabled: true },
      { id: createId(), label: 'Over', type: 'section', value: '#about-section', icon: '', enabled: true },
      { id: createId(), label: 'Schema', type: 'section', value: '#schedule-section', icon: '', enabled: true },
      { id: createId(), label: 'Teams', type: 'section', value: '#teams-section', icon: '', enabled: true },
    ],
  });

  const [heroSettings, setHeroSettings] = useState({
    title: 'Het grootste Rocket League toernooi van de winter',
    subtitle: 'Het grootste Rocket League toernooi van de winter',
    overlayColor: '#05060D',
    overlayOpacity: 60,
    blurOverlay: false,
    alignment: 'center' as 'left' | 'center' | 'right',
    verticalAlignment: 'center' as 'top' | 'center' | 'bottom',
    primaryButton: {
      label: 'Schrijf je team in',
      link: '#register-section',
      background: '#755DFF',
      textColor: '#FFFFFF',
    },
    secondaryButton: {
      label: 'Meer informatie',
      link: '#about-section',
      borderColor: '#755DFF',
      textColor: '#FFFFFF',
    },
  });

  const [aboutSettings, setAboutSettings] = useState({
    layout: 'image-left' as 'image-left' | 'image-right' | 'stacked',
    imageUrl: 'https://images.rosh.gg/hero.jpg',
    imageRadius: 24,
    imageShadow: true,
    title: 'De ultieme wintercompetitie',
    subtitle: 'Over het toernooi',
    paragraph:
      'Welkom bij de Winter Championship 2026, het meest prestigieuze Rocket League toernooi van het seizoen. In de iconische Rotterdam Ahoy strijden 16 topteams om de felbegeerde wintertrofee en een totaal prijzenpot van €25.000.',
    bullets: [
      { id: createId(), text: 'Groepsfase met 16 topteams' },
      { id: createId(), text: 'Live publiek en professionele setup' },
    ],
    buttons: [
      { id: createId(), label: 'Bekijk schema', link: '#schedule-section' },
    ],
    backgroundColor: '#05060D',
    padding: { top: 80, bottom: 80 },
  });

  const [programSettings, setProgramSettings] = useState({
    layout: 'timeline' as 'timeline' | 'table',
    columnWidth: 40,
    backgroundColor: '#0E1020',
    borderColor: '#20233F',
    timeColor: '#755DFF',
    items: [
      { id: createId(), time: '09:00', title: 'Deuren Open & Check-in', description: 'Teams melden zich aan en doen warming-up', icon: '' },
      { id: createId(), time: '10:00', title: 'Openingsceremonie', description: 'Verwelkoming en toernooi introductie', icon: '' },
      { id: createId(), time: '11:00', title: 'Groepsfase - Ronde 1', description: 'Eerste wedstrijden in alle vier groepen', icon: '' },
    ],
  });

  const [bracketSettings, setBracketSettings] = useState({
    source: 'manual' as 'manual' | 'api',
    apiEndpoint: '',
    style: {
      mode: 'default' as 'default' | 'compact',
      animations: true,
      lineThickness: 2,
      lineColor: '#755DFF',
      teamBlockColor: '#11132A',
      winnerColor: '#4ADE80',
    },
    rounds: [
      {
        id: createId(),
        name: 'Round of 16',
        matches: [
          { id: createId(), teamA: 'Team Alpha', teamB: 'Team Beta', scoreA: '16', scoreB: '12' },
          { id: createId(), teamA: 'Team Gamma', teamB: 'Team Delta', scoreA: '14', scoreB: '16' },
        ],
      },
      {
        id: createId(),
        name: 'Quarter Finals',
        matches: [
          { id: createId(), teamA: 'Team Alpha', teamB: 'Team Delta', scoreA: '16', scoreB: '14' },
        ],
      },
    ],
  });

  const [twitchSettings, setTwitchSettings] = useState({
    channel: 'roshlive',
    autoplay: false,
    showChat: true,
    layout: 'stacked' as 'stacked' | 'side-by-side' | 'stream-only',
    width: 100,
    height: 420,
    background: '#05060D',
  });

  const [sponsorSettings, setSponsorSettings] = useState({
    layout: 'grid' as 'grid' | 'carousel',
    columns: 3,
    logoSize: 80,
    gap: 20,
    grayscaleHover: true,
    backgroundColor: '#0E1020',
    divider: false,
    logos: [
      { id: createId(), name: 'Lenovo Legion', url: 'https://images.rosh.gg/lenovo.png', link: '#' },
      { id: createId(), name: 'Intel', url: 'https://images.rosh.gg/intel.png', link: '#' },
      { id: createId(), name: 'NVIDIA', url: 'https://images.rosh.gg/nvidia.png', link: '#' },
      { id: createId(), name: 'Red Bull', url: 'https://images.rosh.gg/redbull.png', link: '#' },
    ],
  });

  const [socialSettings, setSocialSettings] = useState({
    display: 'icon-text' as 'icon' | 'icon-text',
    size: 20,
    style: 'filled' as 'filled' | 'outline' | 'rounded',
    icons: [
      { id: 'twitch', label: 'Twitch', enabled: true, link: '#' },
      { id: 'youtube', label: 'YouTube', enabled: true, link: '#' },
      { id: 'twitter', label: 'Twitter', enabled: true, link: '#' },
      { id: 'instagram', label: 'Instagram', enabled: false, link: '#' },
      { id: 'tiktok', label: 'TikTok', enabled: false, link: '#' },
      { id: 'discord', label: 'Discord', enabled: true, link: '#' },
    ],
  });

  const [footerSettings, setFooterSettings] = useState({
    logoUrl: '',
    description: 'Het grootste wintertoernooi van het jaar',
    copyright: '© 2026 Winter Championship. Alle rechten voorbehouden.',
    layout: 'three-columns' as 'two-columns' | 'three-columns' | 'centered',
    backgroundColor: '#05060D',
    textColor: '#FFFFFF',
    divider: true,
    spacing: 32,
    links: {
      tournament: [
        { id: createId(), label: 'Over', link: '#about-section' },
        { id: createId(), label: 'Schema', link: '#schedule-section' },
        { id: createId(), label: 'Groepen', link: '#bracket-section' },
        { id: createId(), label: 'Teams', link: '#teams-section' },
      ],
      info: [
        { id: createId(), label: 'Inschrijven', link: '#register-section' },
        { id: createId(), label: 'FAQ', link: '#faq-section' },
        { id: createId(), label: 'Reglement', link: '#' },
        { id: createId(), label: 'Contact', link: '#' },
      ],
    },
    showSocials: true,
  });

  const activeComponentLabel = useMemo(
    () => COMPONENTS.find((comp) => comp.id === activeComponent)?.label || 'Navigation',
    [activeComponent]
  );

  const handleToggleComponent = (id: string) => {
    setComponentState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setActiveComponent(id);
  };

  const scrollToComponent = (id: string, element?: HTMLElement) => {
    setTimeout(() => {
      const componentElement = element || 
                               document.querySelector(`[data-component-id="${id}"]`) || 
                               document.getElementById(`${id}-section`) ||
                               document.querySelector(`section[id*="${id}"]`) ||
                               document.querySelector(`nav[data-component-id="${id}"]`) ||
                               document.querySelector(`footer[data-component-id="${id}"]`);
      
      if (componentElement) {
        // Zoek de preview scroll container
        const scrollContainer = document.querySelector('[data-preview-scroll-container]') as HTMLElement;
        
        if (scrollContainer) {
          // Gebruik getBoundingClientRect om de exacte positie te berekenen
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = componentElement.getBoundingClientRect();
          
          // Bereken de huidige scroll positie plus de offset van het element
          const currentScrollTop = scrollContainer.scrollTop;
          const elementTopRelativeToContainer = elementRect.top - containerRect.top;
          const elementTopInScrollSpace = currentScrollTop + elementTopRelativeToContainer;
          
          // Scroll naar het midden van de container
          const containerHeight = scrollContainer.clientHeight;
          const elementHeight = elementRect.height;
          const targetScroll = elementTopInScrollSpace - (containerHeight / 2) + (elementHeight / 2);
          
          scrollContainer.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
          });
        } else {
          // Fallback naar normale scrollIntoView
          componentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleComponentClick = (id: string, e?: ReactMouseEvent) => {
    if (e) {
      // Als er een event is, check of het een link of button is
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.closest('input') || target.closest('form')) {
        return; // Laat links en buttons werken
      }
    }
    // Alleen de component selecteren, niet de visibility togglen
    setActiveComponent(id);
    
    // Scroll naar de component
    scrollToComponent(id, e?.currentTarget as HTMLElement);
  };

  const handleComponentSelect = (id: string) => {
    setActiveComponent(id);
    scrollToComponent(id);
  };

  const handleColorChange = (key: ThemeColorKey, value: string) => {
    setColorPalette((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((preset) => preset.id === presetId);
    if (!preset) return;
    setColorPalette((prev) => ({
      ...prev,
      ...preset.colors,
    }));
  };

  const resetColors = () => {
    setColorPalette(DEFAULT_COLORS);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateNavigationMenuItem = (id: string, field: string, value: string | boolean) => {
    setNavigationSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addNavigationMenuItem = () => {
    setNavigationSettings((prev) => ({
      ...prev,
      menuItems: [
        ...prev.menuItems,
        { id: createId(), label: 'Nieuw item', type: 'section', value: '#', icon: '', enabled: true },
      ],
    }));
  };

  const removeNavigationMenuItem = (id: string) => {
    setNavigationSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((item) => item.id !== id),
    }));
  };

  const moveNavigationMenuItem = (from: number, to: number) => {
    setNavigationSettings((prev) => ({
      ...prev,
      menuItems: moveItem(prev.menuItems, from, to),
    }));
  };

  const updateAboutList = (type: 'bullets' | 'buttons', id: string, field: string, value: string) => {
    if (type === 'bullets') {
      setAboutSettings((prev) => ({
        ...prev,
        bullets: prev.bullets.map((bullet) => (bullet.id === id ? { ...bullet, [field]: value } : bullet)),
      }));
    } else {
      setAboutSettings((prev) => ({
        ...prev,
        buttons: prev.buttons.map((button) => (button.id === id ? { ...button, [field]: value } : button)),
      }));
    }
  };

  const addAboutItem = (type: 'bullets' | 'buttons') => {
    if (type === 'bullets') {
      setAboutSettings((prev) => ({
        ...prev,
        bullets: [...prev.bullets, { id: createId(), text: 'Nieuw punt' }],
      }));
    } else {
      setAboutSettings((prev) => ({
        ...prev,
        buttons: [...prev.buttons, { id: createId(), label: 'Nieuwe knop', link: '#' }],
      }));
    }
  };

  const removeAboutItem = (type: 'bullets' | 'buttons', id: string) => {
    if (type === 'bullets') {
      setAboutSettings((prev) => ({
        ...prev,
        bullets: prev.bullets.filter((bullet) => bullet.id !== id),
      }));
    } else {
      setAboutSettings((prev) => ({
        ...prev,
        buttons: prev.buttons.filter((button) => button.id !== id),
      }));
    }
  };

  const updateProgramItem = (id: string, field: string, value: string) => {
    setProgramSettings((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addProgramItem = () => {
    setProgramSettings((prev) => ({
      ...prev,
      items: [...prev.items, { id: createId(), time: '00:00', title: 'Nieuw item', description: '', icon: '' }],
    }));
  };

  const removeProgramItem = (id: string) => {
    setProgramSettings((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const moveProgramItem = (from: number, to: number) => {
    setProgramSettings((prev) => ({
      ...prev,
      items: moveItem(prev.items, from, to),
    }));
  };

  const updateBracketMatch = (roundId: string, matchId: string, field: string, value: string) => {
    setBracketSettings((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              matches: round.matches.map((match) => (match.id === matchId ? { ...match, [field]: value } : match)),
            }
          : round
      ),
    }));
  };

  const addBracketRound = () => {
    setBracketSettings((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          id: createId(),
          name: 'Nieuwe ronde',
          matches: [{ id: createId(), teamA: 'Team A', teamB: 'Team B', scoreA: '-', scoreB: '-' }],
        },
      ],
    }));
  };

  const addBracketMatch = (roundId: string) => {
    setBracketSettings((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              matches: [
                ...round.matches,
                { id: createId(), teamA: 'Team A', teamB: 'Team B', scoreA: '-', scoreB: '-' },
              ],
            }
          : round
      ),
    }));
  };

  const updateSponsorLogo = (id: string, field: string, value: string) => {
    setSponsorSettings((prev) => ({
      ...prev,
      logos: prev.logos.map((logo) => (logo.id === id ? { ...logo, [field]: value } : logo)),
    }));
  };

  const addSponsorLogo = () => {
    setSponsorSettings((prev) => ({
      ...prev,
      logos: [...prev.logos, { id: createId(), name: 'Nieuwe sponsor', url: '', link: '#' }],
    }));
  };

  const removeSponsorLogo = (id: string) => {
    setSponsorSettings((prev) => ({
      ...prev,
      logos: prev.logos.filter((logo) => logo.id !== id),
    }));
  };

  const updateFooterLinks = (section: 'tournament' | 'info', id: string, field: 'label' | 'link', value: string) => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: prev.links[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const addFooterLink = (section: 'tournament' | 'info') => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: [...prev.links[section], { id: createId(), label: 'Nieuwe link', link: '#' }],
      },
    }));
  };

  const renderSettingsPanel = () => {
    const panelClass = 'flex-1 overflow-y-auto px-6 py-6 space-y-6';
    switch (activeComponent) {
      case 'navigation':
        return (
          <div className={panelClass}>
            <section>
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40 mb-3">Format</h3>
              <div className="space-y-2">
                {NAVIGATION_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setNavFormat(format.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      navFormat === format.id
                        ? 'border-[#755DFF] bg-[#1a1d36] shadow-[0_0_20px_rgba(117,93,255,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <p className="font-semibold">{format.label}</p>
                    <p className="text-xs uppercase tracking-widest text-white/40">{format.subLabel}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Logo</h3>
              <input
                type="text"
                value={navigationSettings.logoUrl}
                onChange={(e) => setNavigationSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="Logo URL"
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setNavigationSettings((prev) => ({ ...prev, logoUrl: url })))} />
              <label className="text-xs text-white/60 flex flex-col gap-2">
                Breedte ({navigationSettings.logoWidth}px)
                <input
                  type="range"
                  min={60}
                  max={240}
                  value={navigationSettings.logoWidth}
                  onChange={(e) => setNavigationSettings((prev) => ({ ...prev, logoWidth: Number(e.target.value) }))}
                />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Menu-items</h3>
              <div className="flex gap-4 text-sm text-white/70">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={navigationSettings.linkType === 'home'}
                    onChange={() => setNavigationSettings((prev) => ({ ...prev, linkType: 'home' }))}
                  />
                  Link naar home
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={navigationSettings.linkType === 'custom'}
                    onChange={() => setNavigationSettings((prev) => ({ ...prev, linkType: 'custom' }))}
                  />
                  Custom URL
                </label>
                {navigationSettings.linkType === 'custom' && (
                  <input
                    type="text"
                    value={navigationSettings.customUrl}
                    onChange={(e) => setNavigationSettings((prev) => ({ ...prev, customUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10"
                    placeholder="https://"
                  />
                )}
              </div>
              <div className="space-y-3">
                {navigationSettings.menuItems.map((item, index) => (
                  <div key={item.id} className="p-3 rounded-xl border border-white/10 bg-[#11132A]/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={item.label}
                        onChange={(e) => updateNavigationMenuItem(item.id, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm"
                      />
                      <button
                        className="text-xs px-2 py-1 border border-white/10 rounded-lg"
                        onClick={() => updateNavigationMenuItem(item.id, 'enabled', !item.enabled)}
                      >
                        {item.enabled ? 'Aan' : 'Uit'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => updateNavigationMenuItem(item.id, 'type', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm"
                      >
                        <option value="section">Sectie scroll</option>
                        <option value="external">Externe link</option>
                      </select>
                      <input
                        value={item.value}
                        onChange={(e) => updateNavigationMenuItem(item.id, 'value', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm"
                        placeholder={item.type === 'section' ? '#hero-section' : 'https://'}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <div className="flex gap-2">
                        <button disabled={index === 0} onClick={() => moveNavigationMenuItem(index, index - 1)}>↑</button>
                        <button disabled={index === navigationSettings.menuItems.length - 1} onClick={() => moveNavigationMenuItem(index, index + 1)}>↓</button>
                      </div>
                      <button onClick={() => removeNavigationMenuItem(item.id)}>Verwijder</button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addNavigationMenuItem}
                  className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                >
                  + Voeg menu-item toe
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Stijl</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-white/60 space-y-1">
                  Tekstkleur
                  <input type="color" value={navigationSettings.textColor} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, textColor: e.target.value }))} />
                </label>
                <label className="text-xs text-white/60 space-y-1">
                  Hover kleur
                  <input type="color" value={navigationSettings.hoverColor} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, hoverColor: e.target.value }))} />
                </label>
                <label className="text-xs text-white/60 space-y-1">
                  Actieve kleur
                  <input type="color" value={navigationSettings.activeColor} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, activeColor: e.target.value }))} />
                </label>
                <label className="text-xs text-white/60 space-y-1">
                  Achtergrond
                  <input type="color" value={navigationSettings.backgroundColor} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                <label>
                  Padding top ({navigationSettings.padding.top}px)
                  <input
                    type="range"
                    min={8}
                    max={48}
                    value={navigationSettings.padding.top}
                    onChange={(e) => setNavigationSettings((prev) => ({ ...prev, padding: { ...prev.padding, top: Number(e.target.value) } }))}
                  />
                </label>
                <label>
                  Padding bottom ({navigationSettings.padding.bottom}px)
                  <input
                    type="range"
                    min={8}
                    max={48}
                    value={navigationSettings.padding.bottom}
                    onChange={(e) => setNavigationSettings((prev) => ({ ...prev, padding: { ...prev.padding, bottom: Number(e.target.value) } }))}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={navigationSettings.sticky}
                  onChange={(e) => setNavigationSettings((prev) => ({ ...prev, sticky: e.target.checked }))}
                />
                Sticky navigation
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">CTA-knop</h3>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={navigationSettings.cta.enabled}
                  onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, enabled: e.target.checked } }))}
                />
                Toon CTA
              </label>
              {navigationSettings.cta.enabled && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={navigationSettings.cta.label}
                    onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, label: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Titel"
                  />
                  <input
                    type="text"
                    value={navigationSettings.cta.link}
                    onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, link: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-white/60 space-y-1">
                      Kleur
                      <input type="color" value={navigationSettings.cta.background} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, background: e.target.value } }))} />
                    </label>
                    <label className="text-xs text-white/60 space-y-1">
                      Tekstkleur
                      <input type="color" value={navigationSettings.cta.textColor} onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, textColor: e.target.value } }))} />
                    </label>
                  </div>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Border radius ({navigationSettings.cta.radius}px)
                    <input
                      type="range"
                      min={0}
                      max={999}
                      value={navigationSettings.cta.radius}
                      onChange={(e) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, radius: Number(e.target.value) } }))}
                    />
                  </label>
                </div>
              )}
            </section>
          </div>
        );
      case 'hero':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Content</h3>
              <input
                type="text"
                value={heroSettings.title}
                onChange={(e) => setHeroSettings((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Titel"
              />
              <textarea
                value={heroSettings.subtitle}
                onChange={(e) => setHeroSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                rows={3}
                placeholder="Subtitel"
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Overlay</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                <label>
                  Kleur
                  <input type="color" value={heroSettings.overlayColor} onChange={(e) => setHeroSettings((prev) => ({ ...prev, overlayColor: e.target.value }))} />
                </label>
                <label>
                  Opacity ({heroSettings.overlayOpacity}%)
                  <input type="range" min={0} max={100} value={heroSettings.overlayOpacity} onChange={(e) => setHeroSettings((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) }))} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={heroSettings.blurOverlay} onChange={(e) => setHeroSettings((prev) => ({ ...prev, blurOverlay: e.target.checked }))} />
                Blur overlay
              </label>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Uitlijning</h3>
              <select
                value={heroSettings.alignment}
                onChange={(e) => setHeroSettings((prev) => ({ ...prev, alignment: e.target.value as typeof heroSettings.alignment }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="left">Links</option>
                <option value="center">Midden</option>
                <option value="right">Rechts</option>
              </select>
              <select
                value={heroSettings.verticalAlignment}
                onChange={(e) => setHeroSettings((prev) => ({ ...prev, verticalAlignment: e.target.value as typeof heroSettings.verticalAlignment }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="top">Boven</option>
                <option value="center">Midden</option>
                <option value="bottom">Onder</option>
              </select>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Knoppen</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-white/50">Primaire knop</h4>
                  <input
                    value={heroSettings.primaryButton.label}
                    onChange={(e) => setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, label: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Tekst"
                  />
                  <input
                    value={heroSettings.primaryButton.link}
                    onChange={(e) => setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, link: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                  <div className="flex gap-2 text-xs text-white/60">
                    <span>
                      <input type="color" value={heroSettings.primaryButton.background} onChange={(e) => setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, background: e.target.value } }))} />
                    </span>
                    <span>
                      <input type="color" value={heroSettings.primaryButton.textColor} onChange={(e) => setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, textColor: e.target.value } }))} />
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-white/50">Secundaire knop</h4>
                  <input
                    value={heroSettings.secondaryButton.label}
                    onChange={(e) => setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, label: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Tekst"
                  />
                  <input
                    value={heroSettings.secondaryButton.link}
                    onChange={(e) => setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, link: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                  <div className="flex gap-2 text-xs text-white/60">
                    <span>
                      <input type="color" value={heroSettings.secondaryButton.borderColor} onChange={(e) => setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, borderColor: e.target.value } }))} />
                    </span>
                    <span>
                      <input type="color" value={heroSettings.secondaryButton.textColor} onChange={(e) => setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, textColor: e.target.value } }))} />
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      case 'about':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Layout</h3>
              <select
                value={aboutSettings.layout}
                onChange={(e) => setAboutSettings((prev) => ({ ...prev, layout: e.target.value as typeof aboutSettings.layout }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="image-left">Links afbeelding / rechts tekst</option>
                <option value="image-right">Rechts afbeelding / links tekst</option>
                <option value="stacked">Afbeelding boven / tekst onder</option>
              </select>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Afbeelding</h3>
              <input
                type="text"
                value={aboutSettings.imageUrl}
                onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Afbeelding URL"
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setAboutSettings((prev) => ({ ...prev, imageUrl: url })))} />
              <label className="text-xs text-white/60 flex flex-col gap-1">
                Ronde hoeken ({aboutSettings.imageRadius}px)
                <input type="range" min={0} max={64} value={aboutSettings.imageRadius} onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageRadius: Number(e.target.value) }))} />
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={aboutSettings.imageShadow} onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageShadow: e.target.checked }))} />
                Shadow effect
              </label>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Tekst</h3>
              <input
                value={aboutSettings.subtitle}
                onChange={(e) => setAboutSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Subtitel"
              />
              <input
                value={aboutSettings.title}
                onChange={(e) => setAboutSettings((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Titel"
              />
              <textarea
                value={aboutSettings.paragraph}
                onChange={(e) => setAboutSettings((prev) => ({ ...prev, paragraph: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Paragraaf"
              />
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Bullet points</h3>
              {aboutSettings.bullets.map((bullet) => (
                <div key={bullet.id} className="flex gap-2">
                  <input
                    value={bullet.text}
                    onChange={(e) => updateAboutList('bullets', bullet.id, 'text', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                  />
                  <button onClick={() => removeAboutItem('bullets', bullet.id)} className="text-xs px-2 py-1 border border-white/10 rounded-lg">–</button>
                </div>
              ))}
              <button onClick={() => addAboutItem('bullets')} className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70">+ Punt toevoegen</button>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Knoppen</h3>
              {aboutSettings.buttons.map((button) => (
                <div key={button.id} className="flex gap-2">
                  <input
                    value={button.label}
                    onChange={(e) => updateAboutList('buttons', button.id, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Tekst"
                  />
                  <input
                    value={button.link}
                    onChange={(e) => updateAboutList('buttons', button.id, 'link', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                  <button onClick={() => removeAboutItem('buttons', button.id)} className="text-xs px-2 py-1 border border-white/10 rounded-lg">–</button>
                </div>
              ))}
              <button onClick={() => addAboutItem('buttons')} className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70">+ Knop toevoegen</button>
            </section>
            <section className="space-y-3 text-xs text-white/60">
              <label>
                Achtergrondkleur
                <input type="color" value={aboutSettings.backgroundColor} onChange={(e) => setAboutSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
              </label>
              <label>
                Padding top ({aboutSettings.padding.top}px)
                <input type="range" min={40} max={160} value={aboutSettings.padding.top} onChange={(e) => setAboutSettings((prev) => ({ ...prev, padding: { ...prev.padding, top: Number(e.target.value) } }))} />
              </label>
              <label>
                Padding bottom ({aboutSettings.padding.bottom}px)
                <input type="range" min={40} max={160} value={aboutSettings.padding.bottom} onChange={(e) => setAboutSettings((prev) => ({ ...prev, padding: { ...prev.padding, bottom: Number(e.target.value) } }))} />
              </label>
            </section>
          </div>
        );
      case 'program':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Items in schema</h3>
              {programSettings.items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-white/10 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={item.time}
                      onChange={(e) => updateProgramItem(item.id, 'time', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Tijd"
                    />
                    <input
                      value={item.icon}
                      onChange={(e) => updateProgramItem(item.id, 'icon', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Icon (optioneel)"
                    />
                  </div>
                  <input
                    value={item.title}
                    onChange={(e) => updateProgramItem(item.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Titel"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => updateProgramItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    rows={2}
                    placeholder="Beschrijving"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <div className="flex gap-2">
                      <button disabled={index === 0} onClick={() => moveProgramItem(index, index - 1)}>↑</button>
                      <button disabled={index === programSettings.items.length - 1} onClick={() => moveProgramItem(index, index + 1)}>↓</button>
                    </div>
                    <button onClick={() => removeProgramItem(item.id)}>Verwijder</button>
                  </div>
                </div>
              ))}
              <button onClick={addProgramItem} className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70">+ Voeg programma-item toe</button>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Layout</h3>
              <select
                value={programSettings.layout}
                onChange={(e) => setProgramSettings((prev) => ({ ...prev, layout: e.target.value as typeof programSettings.layout }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="timeline">Timeline-weergave</option>
                <option value="table">Tabel-weergave</option>
              </select>
              {programSettings.layout === 'timeline' && (
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Tijd kolombreedte ({programSettings.columnWidth}%)
                  <input type="range" min={20} max={60} value={programSettings.columnWidth} onChange={(e) => setProgramSettings((prev) => ({ ...prev, columnWidth: Number(e.target.value) }))} />
                </label>
              )}
            </section>
            <section className="space-y-2 text-xs text-white/60">
              <label>
                Achtergrondkleur
                <input type="color" value={programSettings.backgroundColor} onChange={(e) => setProgramSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
              </label>
              <label>
                Border kleur
                <input type="color" value={programSettings.borderColor} onChange={(e) => setProgramSettings((prev) => ({ ...prev, borderColor: e.target.value }))} />
              </label>
              <label>
                Tijdkleur
                <input type="color" value={programSettings.timeColor} onChange={(e) => setProgramSettings((prev) => ({ ...prev, timeColor: e.target.value }))} />
              </label>
            </section>
          </div>
        );
      case 'bracket':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Bron</h3>
              <select
                value={bracketSettings.source}
                onChange={(e) => setBracketSettings((prev) => ({ ...prev, source: e.target.value as typeof bracketSettings.source }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="manual">Handmatig</option>
                <option value="api">API</option>
              </select>
              {bracketSettings.source === 'api' && (
                <input
                  value={bracketSettings.apiEndpoint}
                  onChange={(e) => setBracketSettings((prev) => ({ ...prev, apiEndpoint: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                  placeholder="https://api.challonge.com/..."
                />
              )}
            </section>
            {bracketSettings.source === 'manual' && (
              <section className="space-y-3">
                {bracketSettings.rounds.map((round) => (
                  <div key={round.id} className="rounded-xl border border-white/10 p-3 space-y-3 bg-[#11132A]/50">
                    <input
                      value={round.name}
                      onChange={(e) =>
                        setBracketSettings((prev) => ({
                          ...prev,
                          rounds: prev.rounds.map((r) => (r.id === round.id ? { ...r, name: e.target.value } : r)),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm"
                      placeholder="Ronde naam"
                    />
                    {round.matches.map((match) => (
                      <div key={match.id} className="grid grid-cols-2 gap-2 text-sm">
                        <input
                          value={match.teamA}
                          onChange={(e) => updateBracketMatch(round.id, match.id, 'teamA', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10"
                          placeholder="Team A"
                        />
                        <input
                          value={match.teamB}
                          onChange={(e) => updateBracketMatch(round.id, match.id, 'teamB', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10"
                          placeholder="Team B"
                        />
                        <input
                          value={match.scoreA}
                          onChange={(e) => updateBracketMatch(round.id, match.id, 'scoreA', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10"
                          placeholder="Score A"
                        />
                        <input
                          value={match.scoreB}
                          onChange={(e) => updateBracketMatch(round.id, match.id, 'scoreB', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10"
                          placeholder="Score B"
                        />
                      </div>
                    ))}
                    <button onClick={() => addBracketMatch(round.id)} className="text-xs text-white/70 border border-dashed border-white/20 rounded-lg px-3 py-1">
                      + Voeg match toe
                    </button>
                  </div>
                ))}
                <button onClick={addBracketRound} className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70">
                  + Voeg ronde toe
                </button>
              </section>
            )}
            <section className="space-y-2 text-xs text-white/60">
              <label>
                Weergave
                <select
                  value={bracketSettings.style.mode}
                  onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, mode: e.target.value as typeof bracketSettings.style.mode } }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                >
                  <option value="default">Standaard</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={bracketSettings.style.animations}
                  onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, animations: e.target.checked } }))}
                />
                Animaties
              </label>
              <label>
                Lijn dikte ({bracketSettings.style.lineThickness}px)
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={bracketSettings.style.lineThickness}
                  onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, lineThickness: Number(e.target.value) } }))}
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label>
                  Lijn kleur
                  <input type="color" value={bracketSettings.style.lineColor} onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, lineColor: e.target.value } }))} />
                </label>
                <label>
                  Team block
                  <input type="color" value={bracketSettings.style.teamBlockColor} onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, teamBlockColor: e.target.value } }))} />
                </label>
                <label>
                  Winnaar kleur
                  <input type="color" value={bracketSettings.style.winnerColor} onChange={(e) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, winnerColor: e.target.value } }))} />
                </label>
              </div>
            </section>
          </div>
        );
      case 'twitch':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Stream instellingen</h3>
              <input
                value={twitchSettings.channel}
                onChange={(e) => setTwitchSettings((prev) => ({ ...prev, channel: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Kanaalnaam"
              />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={twitchSettings.autoplay} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, autoplay: e.target.checked }))} />
                Autoplay
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={twitchSettings.showChat} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, showChat: e.target.checked }))} />
                Chat tonen
              </label>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Layout</h3>
              <select
                value={twitchSettings.layout}
                onChange={(e) => setTwitchSettings((prev) => ({ ...prev, layout: e.target.value as typeof twitchSettings.layout }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
              >
                <option value="stacked">Embed boven, chat onder</option>
                <option value="side-by-side">Embed rechts + chat links</option>
                <option value="stream-only">Alleen stream</option>
              </select>
              {twitchSettings.layout === 'side-by-side' && (
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Embed breedte ({twitchSettings.width}%)
                  <input type="range" min={40} max={100} value={twitchSettings.width} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, width: Number(e.target.value) }))} />
                </label>
              )}
              <label className="text-xs text-white/60 flex flex-col gap-1">
                Hoogte ({twitchSettings.height}px)
                <input type="range" min={240} max={720} value={twitchSettings.height} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, height: Number(e.target.value) }))} />
              </label>
              <label className="text-xs text-white/60">
                Achtergrondkleur
                <input type="color" value={twitchSettings.background} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, background: e.target.value }))} />
              </label>
            </section>
          </div>
        );
      case 'sponsors':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Sponsorlogo’s</h3>
              {sponsorSettings.logos.map((logo) => (
                <div key={logo.id} className="flex gap-2 items-center">
                  <input
                    value={logo.name}
                    onChange={(e) => updateSponsorLogo(logo.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Naam"
                  />
                  <input
                    value={logo.url}
                    onChange={(e) => updateSponsorLogo(logo.id, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Logo URL"
                  />
                  <input
                    value={logo.link}
                    onChange={(e) => updateSponsorLogo(logo.id, 'link', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                  <button onClick={() => removeSponsorLogo(logo.id)} className="text-xs px-2 py-1 border border-white/10 rounded-lg">–</button>
                </div>
              ))}
              <button onClick={addSponsorLogo} className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70">+ Voeg sponsor toe</button>
            </section>
            <section className="space-y-2 text-xs text-white/60">
              <label>
                Weergave
                <select
                  value={sponsorSettings.layout}
                  onChange={(e) => setSponsorSettings((prev) => ({ ...prev, layout: e.target.value as typeof sponsorSettings.layout }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                >
                  <option value="grid">Raster</option>
                  <option value="carousel">Carousel</option>
                </select>
              </label>
              <label>
                Logos per rij ({sponsorSettings.columns})
                <input type="range" min={2} max={6} value={sponsorSettings.columns} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, columns: Number(e.target.value) }))} />
              </label>
              <label>
                Logo-grootte ({sponsorSettings.logoSize}px)
                <input type="range" min={40} max={140} value={sponsorSettings.logoSize} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, logoSize: Number(e.target.value) }))} />
              </label>
              <label>
                Afstand ({sponsorSettings.gap}px)
                <input type="range" min={8} max={40} value={sponsorSettings.gap} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, gap: Number(e.target.value) }))} />
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={sponsorSettings.grayscaleHover} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, grayscaleHover: e.target.checked }))} />
                Grayscale hover
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={sponsorSettings.divider} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, divider: e.target.checked }))} />
                Divider lines
              </label>
              <label>
                Achtergrondkleur
                <input type="color" value={sponsorSettings.backgroundColor} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
              </label>
            </section>
          </div>
        );
      case 'socials':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Social opties</h3>
              {socialSettings.icons.map((icon) => (
                <div key={icon.id} className="flex gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={icon.enabled}
                      onChange={(e) =>
                        setSocialSettings((prev) => ({
                          ...prev,
                          icons: prev.icons.map((item) => (item.id === icon.id ? { ...item, enabled: e.target.checked } : item)),
                        }))
                      }
                    />
                    {icon.label}
                  </label>
                  <input
                    value={icon.link}
                    onChange={(e) =>
                      setSocialSettings((prev) => ({
                        ...prev,
                        icons: prev.icons.map((item) => (item.id === icon.id ? { ...item, link: e.target.value } : item)),
                      }))
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                    placeholder="Link"
                  />
                </div>
              ))}
            </section>
            <section className="space-y-2 text-xs text-white/60">
              <label>
                Weergave
                <select
                  value={socialSettings.display}
                  onChange={(e) => setSocialSettings((prev) => ({ ...prev, display: e.target.value as typeof socialSettings.display }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                >
                  <option value="icon">Alleen iconen</option>
                  <option value="icon-text">Icon + tekst</option>
                </select>
              </label>
              <label>
                Icon style
                <select
                  value={socialSettings.style}
                  onChange={(e) => setSocialSettings((prev) => ({ ...prev, style: e.target.value as typeof socialSettings.style }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                >
                  <option value="filled">Filled</option>
                  <option value="outline">Outline</option>
                  <option value="rounded">Rounded</option>
                </select>
              </label>
              <label>
                Grootte ({socialSettings.size}px)
                <input type="range" min={12} max={32} value={socialSettings.size} onChange={(e) => setSocialSettings((prev) => ({ ...prev, size: Number(e.target.value) }))} />
              </label>
            </section>
          </div>
        );
      case 'footer':
        return (
          <div className={panelClass}>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Footer content</h3>
              <input
                value={footerSettings.logoUrl}
                onChange={(e) => setFooterSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Logo URL"
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url })))} />
              <textarea
                value={footerSettings.description}
                onChange={(e) => setFooterSettings((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                rows={2}
                placeholder="Beschrijving"
              />
              <input
                value={footerSettings.copyright}
                onChange={(e) => setFooterSettings((prev) => ({ ...prev, copyright: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                placeholder="Copyright tekst"
              />
            </section>
            <section className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Navigatie links</h3>
              {['tournament', 'info'].map((section) => (
                <div key={section} className="space-y-2">
                  <p className="text-xs uppercase text-white/50">{section === 'tournament' ? 'Toernooi' : 'Informatie'}</p>
                  {footerSettings.links[section as 'tournament' | 'info'].map((link) => (
                    <div key={link.id} className="flex gap-2">
                      <input
                        value={link.label}
                        onChange={(e) => updateFooterLinks(section as 'tournament' | 'info', link.id, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                        placeholder="Label"
                      />
                      <input
                        value={link.link}
                        onChange={(e) => updateFooterLinks(section as 'tournament' | 'info', link.id, 'link', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                        placeholder="Link"
                      />
                    </div>
                  ))}
                  <button onClick={() => addFooterLink(section as 'tournament' | 'info')} className="text-xs px-3 py-1 border border-dashed border-white/20 rounded-lg text-white/70">
                    + Link toevoegen
                  </button>
                </div>
              ))}
            </section>
            <section className="space-y-2 text-xs text-white/60">
              <label>
                Layout
                <select
                  value={footerSettings.layout}
                  onChange={(e) => setFooterSettings((prev) => ({ ...prev, layout: e.target.value as typeof footerSettings.layout }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                >
                  <option value="two-columns">2 koloms</option>
                  <option value="three-columns">3 koloms</option>
                  <option value="centered">Centered</option>
                </select>
              </label>
              <label>
                Spacing ({footerSettings.spacing}px)
                <input type="range" min={16} max={64} value={footerSettings.spacing} onChange={(e) => setFooterSettings((prev) => ({ ...prev, spacing: Number(e.target.value) }))} />
              </label>
              <label>
                Achtergrondkleur
                <input type="color" value={footerSettings.backgroundColor} onChange={(e) => setFooterSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
              </label>
              <label>
                Tekstkleur
                <input type="color" value={footerSettings.textColor} onChange={(e) => setFooterSettings((prev) => ({ ...prev, textColor: e.target.value }))} />
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={footerSettings.divider} onChange={(e) => setFooterSettings((prev) => ({ ...prev, divider: e.target.checked }))} />
                Divider
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={footerSettings.showSocials} onChange={(e) => setFooterSettings((prev) => ({ ...prev, showSocials: e.target.checked }))} />
                Socials
              </label>
            </section>
          </div>
        );
      default:
        return (
          <div className={panelClass}>
            <p className="text-sm text-white/60">Selecteer een component om instellingen te tonen.</p>
          </div>
        );
    }
  };

  const updateFontSetting = (path: string, value: string | number) => {
    setFontSettings((prev) => {
      if (path.startsWith('sizes.')) {
        const key = path.replace('sizes.', '') as keyof FontSettings['sizes'];
        return {
          ...prev,
          sizes: {
            ...prev.sizes,
            [key]: Number(value),
          },
        };
      }
      if (path.startsWith('weights.')) {
        const key = path.replace('weights.', '') as keyof FontSettings['weights'];
        return {
          ...prev,
          weights: {
            ...prev.weights,
            [key]: Number(value),
          },
        };
      }
      return {
        ...prev,
        [path]: value,
      } as FontSettings;
    });
  };

  const addUpload = () => {
    const nextIndex = uploads.length + 1;
    setUploads((prev) => [
      ...prev,
      {
        id: `asset-${nextIndex}`,
        name: `new-asset-${nextIndex}.png`,
        url: 'https://images.rosh.gg/placeholders/new.png',
        size: '540 KB',
        usedIn: [],
      },
    ]);
  };

  const deleteUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const renameUpload = (id: string, name: string) => {
    setUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#05060D] text-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/10 bg-[#0E1020] px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Live Editor</p>
          <h1 className="text-2xl font-semibold mt-1">Bouw een geheel eigen pagina</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
            {VIEWPORTS.map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition ${
                  viewport === vp ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                }`}
              >
                {vp}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-sm"
          >
            ← Terug naar dashboard
          </Link>
          <button className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm transition">
            Naar wizard
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative pt-[85px]">
        {/* Left panel */}
        <aside className="w-[420px] bg-[#0E1020] border-r border-white/10 flex fixed left-0 top-[85px] h-[calc(100vh-85px)] overflow-y-auto z-10">
          <div className="w-20 border-r border-white/10 flex flex-col items-center py-6 gap-4">
            {[
              { id: 'components', label: 'Components', icon: 'components' as IconName },
              { id: 'colors', label: 'Colors', icon: 'colors' as IconName },
              { id: 'fonts', label: 'Fonts', icon: 'fonts' as IconName },
              { id: 'uploads', label: 'Uploads', icon: 'uploads' as IconName },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-[#755DFF] bg-[#1a1d36] text-white shadow-[0_10px_25px_rgba(117,93,255,0.35)]'
                      : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                  title={tab.label}
                  aria-label={tab.label}
                >
                  <Icon name={tab.icon} className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-6 py-5 border-b border-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">Editor</p>
              <h2 className="text-lg font-semibold capitalize">
                {activeTab === 'components' && 'Select and change your components'}
                {activeTab === 'colors' && 'Global theme colors'}
                {activeTab === 'fonts' && 'Typography system'}
                {activeTab === 'uploads' && 'Asset library'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {activeTab === 'components' && (
                <>
                  {COMPONENTS.map((component) => {
                    const isActive = activeComponent === component.id;
                    return (
                      <div
                        key={component.id}
                        onClick={() => handleComponentSelect(component.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                          isActive ? 'border-[#755DFF] bg-[#1a1d36]' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <Icon name={component.icon} className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">{component.label}</p>
                            <p className="text-xs text-white/40 capitalize">
                              {componentState[component.id] ? 'visible on canvas' : 'click to show'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setComponentState((prev) => ({
                              ...prev,
                              [component.id]: !prev[component.id],
                            }));
                          }}
                          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                            componentState[component.id] ? 'bg-[#755DFF]' : 'bg-white/15'
                          }`}
                          role="switch"
                          aria-checked={componentState[component.id]}
                        >
                          <span
                            className={`inline-block h-5 w-5 bg-white rounded-full transform transition ${
                              componentState[component.id] ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ['primary', 'Primary'],
                        ['secondary', 'Secondary'],
                        ['accent', 'Accent'],
                        ['link', 'Link'],
                        ['linkHover', 'Link hover'],
                        ['bodyText', 'Body text'],
                        ['headingText', 'Headings'],
                        ['mutedText', 'Muted'],
                        ['pageBackground', 'Page background'],
                        ['sectionBackground', 'Section background'],
                        ['cardBackground', 'Card background'],
                        ['navBackground', 'Navigation bg'],
                        ['navText', 'Navigation text'],
                        ['navHover', 'Navigation hover'],
                        ['footerBackground', 'Footer bg'],
                        ['footerText', 'Footer text'],
                        ['footerLink', 'Footer link'],
                        ['footerLinkHover', 'Footer link hover'],
                        ['buttonPrimary', 'Button primary'],
                        ['buttonPrimaryText', 'Button primary text'],
                        ['buttonPrimaryHover', 'Button primary hover'],
                        ['buttonSecondary', 'Button secondary'],
                        ['buttonSecondaryText', 'Button secondary text'],
                        ['buttonSecondaryHover', 'Button secondary hover'],
                        ['border', 'Borders'],
                        ['divider', 'Dividers'],
                        ['overlay', 'Overlay'],
                        ['shadow', 'Shadow'],
                      ] as Array<[ThemeColorKey, string]>
                    ).map(([key, label]) => (
                      <label key={key} className="bg-[#11132A] border border-white/10 rounded-xl px-3 py-3 flex flex-col gap-3">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={colorPalette[key]}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                          />
                          <input
                            value={colorPalette[key]}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="flex-1 bg-[#0E1020] border border-white/10 rounded-lg px-3 py-2 text-xs tracking-[0.2em] uppercase focus:outline-none focus:border-[#755DFF]"
                          />
                        </div>
                        {key === 'overlay' && (
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Math.round(overlayOpacity * 100)}
                              onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                              className="flex-1"
                            />
                            <span className="text-xs text-white/60 w-12 text-right">{Math.round(overlayOpacity * 100)}%</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Theme presets</p>
                      <button
                        onClick={resetColors}
                        className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white transition"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset.id)}
                          className="rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#0E1020] py-3 px-2"
                        >
                          <span className="text-xs uppercase tracking-[0.3em] block mb-2 text-white/60">
                            {preset.name}
                          </span>
                          <div className="flex gap-2">
                            {Object.values(preset.colors).slice(0, 4).map((color, index) => (
                              <span
                                key={`${preset.id}-${index}`}
                                className="flex-1 h-4 rounded-full"
                                style={{ background: color }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Heading font</span>
                      <input
                        value={fontSettings.headingFamily}
                        onChange={(e) => updateFontSetting('headingFamily', e.target.value)}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Body font</span>
                      <input
                        value={fontSettings.bodyFamily}
                        onChange={(e) => updateFontSetting('bodyFamily', e.target.value)}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      />
                    </label>
                  </div>

                  <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4">
                    <p className="text-sm font-semibold mb-3">Font sizes</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(fontSettings.sizes).map(([key, value]) => (
                        <label key={key} className="flex flex-col gap-2">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">{key}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={12}
                              max={96}
                              value={value}
                              onChange={(e) => updateFontSetting(`sizes.${key}`, Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-white/70 w-10 text-right">{value}px</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Heading weight</span>
                      <input
                        type="number"
                        min={100}
                        max={900}
                        step={100}
                        value={fontSettings.weights.heading}
                        onChange={(e) => updateFontSetting('weights.heading', Number(e.target.value))}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Body weight</span>
                      <input
                        type="number"
                        min={100}
                        max={900}
                        step={100}
                        value={fontSettings.weights.body}
                        onChange={(e) => updateFontSetting('weights.body', Number(e.target.value))}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Line height</span>
                      <input
                        type="range"
                        min={110}
                        max={180}
                        value={fontSettings.lineHeight}
                        onChange={(e) => updateFontSetting('lineHeight', Number(e.target.value))}
                      />
                      <span className="text-xs text-white/60">{fontSettings.lineHeight}%</span>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Letter spacing</span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={fontSettings.letterSpacing}
                        onChange={(e) => updateFontSetting('letterSpacing', Number(e.target.value))}
                      />
                      <span className="text-xs text-white/60">{fontSettings.letterSpacing} px</span>
                    </label>
                  </div>

                  <button className="w-full mt-4 rounded-lg border border-white/10 bg-[#11132A] py-3 text-sm hover:border-white/30 transition">
                    Apply to all components
                  </button>
                </div>
              )}

              {activeTab === 'uploads' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={addUpload}
                      className="flex-1 bg-[#11132A] border border-dashed border-white/20 rounded-xl py-3 text-sm text-white/70 hover:border-white/40 hover:text-white transition"
                    >
                      Upload new asset
                    </button>
                    <span className="text-xs text-white/40 uppercase tracking-[0.3em]">
                      {uploads.length} items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {uploads.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-[#11132A] border border-white/10 rounded-2xl p-4 flex gap-4 items-center"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1B1F3E] to-[#0B0E1C] border border-white/5 flex items-center justify-center">
                          <Icon name="image" className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <input
                            value={asset.name}
                            onChange={(e) => renameUpload(asset.id, e.target.value)}
                            className="bg-transparent text-sm font-semibold w-full focus:outline-none focus:border-b focus:border-[#755DFF]"
                          />
                          <p className="text-xs text-white/40">{asset.size}</p>
                          {asset.usedIn.length > 0 && (
                            <p className="text-[11px] text-white/50 mt-1">
                              Used in: {asset.usedIn.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="text-xs text-white/60 hover:text-white transition">Copy URL</button>
                          <button
                            onClick={() => deleteUpload(asset.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Middle preview area */}
        <section className="flex-1 bg-[#03040B] relative flex flex-col ml-[420px] mr-[360px] h-[calc(100vh-85px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto" data-preview-scroll-container>
            <div 
              className="w-full min-h-full bg-gradient-to-br from-[#0B0E1F] to-[#020308]"
              style={{ 
                backgroundColor: colorPalette.pageBackground,
                fontFamily: fontSettings.bodyFamily,
                color: colorPalette.bodyText
              }}
            >
              {/* Navigation */}
              {componentState.navigation && (
                <nav 
                  data-component-id="navigation"
                  onClick={(e) => handleComponentClick('navigation', e)}
                  className={`${navigationSettings.sticky ? 'sticky top-0' : ''} z-50 backdrop-blur-md border-b cursor-pointer relative group`}
                  style={{ 
                    backgroundColor: navigationSettings.backgroundColor,
                    borderColor: colorPalette.border,
                    paddingTop: navigationSettings.padding.top,
                    paddingBottom: navigationSettings.padding.bottom,
                  }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                  <div className="container mx-auto px-6 flex items-center justify-between relative z-20 gap-8">
                    <div className="flex items-center gap-4">
                      {navigationSettings.logoUrl ? (
                        <img
                          src={navigationSettings.logoUrl}
                          alt="Logo"
                          style={{ width: navigationSettings.logoWidth, height: 'auto' }}
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-xl font-bold" style={{ color: navigationSettings.textColor }}>
                          Tournament
                        </div>
                      )}
                    </div>
                    <ul className={`flex items-center gap-6 ${navFormat === 'centered' ? 'justify-center flex-1' : ''}`}>
                      {navigationSettings.menuItems
                        .filter((item) => item.enabled && item.label.trim())
                        .map((item, idx) => (
                          <li key={item.id} className="relative">
                            <a 
                              href={item.type === 'section' ? item.value : item.value || '#'}
                              className="text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: navigationSettings.textColor }}
                              onMouseEnter={(e) => e.currentTarget.style.color = navigationSettings.hoverColor}
                              onMouseLeave={(e) => e.currentTarget.style.color = navigationSettings.textColor}
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                    </ul>
                    {navigationSettings.cta.enabled && (
                      <a
                        href={navigationSettings.cta.link}
                        className="px-6 py-2 rounded-full font-semibold text-sm transition-transform hover:scale-105"
                        style={{
                          backgroundColor: navigationSettings.cta.background,
                          color: navigationSettings.cta.textColor,
                          borderRadius: navigationSettings.cta.radius,
                        }}
                      >
                        {navigationSettings.cta.label}
                      </a>
                    )}
                  </div>
                </nav>
              )}

              {/* Hero Section */}
              {componentState.hero && (
                <section 
                  id="hero-section"
                  data-component-id="hero"
                  onClick={(e) => handleComponentClick('hero', e)}
                  className={`relative py-20 px-6 overflow-hidden cursor-pointer group flex`}
                  style={{ backgroundColor: colorPalette.sectionBackground }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: heroSettings.overlayColor,
                      opacity: heroSettings.overlayOpacity / 100,
                      filter: heroSettings.blurOverlay ? 'blur(8px)' : 'none',
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div
                    className="container mx-auto max-w-5xl relative z-20 flex flex-col gap-6"
                    style={{
                      textAlign: heroSettings.alignment,
                      justifyContent:
                        heroSettings.verticalAlignment === 'top'
                          ? 'flex-start'
                          : heroSettings.verticalAlignment === 'bottom'
                          ? 'flex-end'
                          : 'center',
                    }}
                  >
                    <div className="mb-2 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Rocket League
                    </div>
                    <h1 
                      className="font-bold mb-4"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h1}px`,
                        fontWeight: fontSettings.weights.heading,
                        lineHeight: `${fontSettings.lineHeight}%`
                      }}
                    >
                      {heroSettings.title}
                    </h1>
                    <p className="text-lg mb-6 opacity-90 max-w-3xl" style={{ color: colorPalette.bodyText, marginLeft: heroSettings.alignment === 'left' ? 0 : 'auto', marginRight: heroSettings.alignment === 'right' ? 0 : 'auto' }}>
                      {heroSettings.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-6 mb-8" style={{ justifyContent: heroSettings.alignment === 'left' ? 'flex-start' : heroSettings.alignment === 'right' ? 'flex-end' : 'center' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span className="text-sm">17 januari 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        <span className="text-sm">Rotterdam Ahoy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        <span className="text-sm">16 Teams</span>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-wrap" style={{ justifyContent: heroSettings.alignment === 'left' ? 'flex-start' : heroSettings.alignment === 'right' ? 'flex-end' : 'center' }}>
                      <a 
                        href={heroSettings.primaryButton.link}
                        className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: heroSettings.primaryButton.background,
                          color: heroSettings.primaryButton.textColor
                        }}
                      >
                        {heroSettings.primaryButton.label}
                      </a>
                      <a 
                        href={heroSettings.secondaryButton.link}
                        className="px-6 py-3 rounded-lg font-semibold border transition-all hover:scale-105"
                        style={{ 
                          borderColor: heroSettings.secondaryButton.borderColor,
                          color: heroSettings.secondaryButton.textColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {heroSettings.secondaryButton.label}
                      </a>
                    </div>
                  </div>
                </section>
              )}

              {/* About Section */}
              {componentState.about && (
                <section 
                  id="about-section"
                  data-component-id="about"
                  onClick={(e) => handleComponentClick('about', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: aboutSettings.backgroundColor, paddingTop: aboutSettings.padding.top, paddingBottom: aboutSettings.padding.bottom }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl relative z-20">
                    <div className="grid gap-10 items-center md:grid-cols-2" style={{ flexDirection: aboutSettings.layout === 'stacked' ? 'column' : undefined }}>
                      {(aboutSettings.layout === 'image-left' || aboutSettings.layout === 'stacked') && (
                        <div className="w-full flex justify-center">
                          <img
                            src={aboutSettings.imageUrl}
                            alt="About visual"
                            className={`w-full max-w-md ${aboutSettings.imageShadow ? 'shadow-2xl' : ''}`}
                            style={{ borderRadius: aboutSettings.imageRadius }}
                          />
                        </div>
                      )}
                      <div className="space-y-4">
                        <p className="text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                          {aboutSettings.subtitle}
                        </p>
                        <h2 
                          className="text-4xl font-bold"
                          style={{ 
                            color: colorPalette.headingText,
                            fontFamily: fontSettings.headingFamily,
                            fontSize: `${fontSettings.sizes.h2}px`
                          }}
                        >
                          {aboutSettings.title}
                        </h2>
                        <p className="opacity-90" style={{ color: colorPalette.bodyText }}>
                          {aboutSettings.paragraph}
                        </p>
                        <ul className="space-y-2">
                          {aboutSettings.bullets.map((bullet) => (
                            <li key={bullet.id} className="flex items-start gap-2" style={{ color: colorPalette.bodyText }}>
                              <span className="text-[#755DFF] mt-1">•</span>
                              <span>{bullet.text}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-4">
                          {aboutSettings.buttons.map((button) => (
                            <a key={button.id} href={button.link} className="px-5 py-3 rounded-lg border border-[#755DFF] text-sm font-medium transition-all hover:scale-105">
                              {button.label}
                            </a>
                          ))}
                        </div>
                      </div>
                      {aboutSettings.layout === 'image-right' && (
                        <div className="w-full flex justify-center">
                          <img
                            src={aboutSettings.imageUrl}
                            alt="About visual"
                            className={`w-full max-w-md ${aboutSettings.imageShadow ? 'shadow-2xl' : ''}`}
                            style={{ borderRadius: aboutSettings.imageRadius }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Program / Schedule */}
              {componentState.program && (
                <section 
                  id="schedule-section"
                  data-component-id="program"
                  onClick={(e) => handleComponentClick('program', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: programSettings.backgroundColor }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-5xl relative z-20">
                    <div className="text-center mb-4 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Planning
                    </div>
                    <h2 
                      className="text-4xl font-bold text-center mb-12"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Toernooi Schema
                    </h2>
                    {programSettings.layout === 'timeline' ? (
                      <div className="space-y-4">
                        {programSettings.items.map((item, idx) => (
                          <div 
                            key={item.id}
                            className="flex gap-6 p-6 rounded-xl border"
                            style={{ 
                              backgroundColor: colorPalette.cardBackground,
                              borderColor: programSettings.borderColor
                            }}
                          >
                            <div className="text-2xl font-bold whitespace-nowrap" style={{ color: programSettings.timeColor, minWidth: `${programSettings.columnWidth}%` }}>
                              {item.time}
                            </div>
                            <div className="flex-1">
                              <h3 
                                className="text-xl font-semibold mb-2 flex items-center gap-2"
                                style={{ 
                                  color: colorPalette.headingText,
                                  fontSize: `${fontSettings.sizes.h3}px`
                                }}
                              >
                                {item.icon && <span>{item.icon}</span>}
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="text-sm opacity-80" style={{ color: colorPalette.bodyText }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: programSettings.borderColor }}>
                        <table className="w-full text-left">
                          <thead style={{ backgroundColor: colorPalette.cardBackground }}>
                            <tr>
                              <th className="px-6 py-4" style={{ color: programSettings.timeColor }}>Tijd</th>
                              <th className="px-6 py-4 text-white">Titel</th>
                              <th className="px-6 py-4 text-white">Beschrijving</th>
                            </tr>
                          </thead>
                          <tbody>
                            {programSettings.items.map((item, idx) => (
                              <tr key={item.id} style={{ borderTop: `1px solid ${programSettings.borderColor}` }}>
                                <td className="px-6 py-3" style={{ color: programSettings.timeColor }}>{item.time}</td>
                                <td className="px-6 py-3 text-white flex items-center gap-2">
                                  {item.icon && <span>{item.icon}</span>}
                                  {item.title}
                                </td>
                                <td className="px-6 py-3 text-white/70">{item.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Group Stage */}
              {componentState['group-stage'] && (
                <section 
                  id="bracket-section"
                  data-component-id="group-stage"
                  onClick={(e) => handleComponentClick('group-stage', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.pageBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-4 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Competitie Formaat
                    </div>
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Groepsfase Indeling
                    </h2>
                    <p className="text-center mb-12 opacity-90" style={{ color: colorPalette.bodyText }}>
                      16 teams verdeeld over 4 groepen. Top 2 van elke groep gaat door naar kwartfinales.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {['A', 'B', 'C', 'D'].map((group) => (
                        <div 
                          key={group}
                          className="p-6 rounded-xl border"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border
                          }}
                        >
                          <h3 
                            className="text-2xl font-bold mb-4"
                            style={{ color: colorPalette.primary }}
                          >
                            Groep {group}
                          </h3>
                          <div className="space-y-2">
                            {[
                              { seed: '#1', name: 'Arctic Wolves', tag: 'ARCT' },
                              { seed: '#8', name: 'Thunder Strike', tag: 'THND' },
                              { seed: '#9', name: 'Ice Phoenix', tag: 'ICEP' },
                              { seed: '#16', name: 'Snow Leopards', tag: 'SNLP' }
                            ].map((team, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: colorPalette.pageBackground }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xs opacity-60">{team.seed}</span>
                                  <div>
                                    <div className="font-semibold text-sm" style={{ color: colorPalette.headingText }}>
                                      {team.name}
                                    </div>
                                    <div className="text-xs opacity-60" style={{ color: colorPalette.bodyText }}>
                                      {team.tag}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Bracket */}
              {componentState.bracket && (
                <section 
                  id="bracket-section"
                  data-component-id="bracket"
                  onClick={(e) => handleComponentClick('bracket', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.sectionBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Tournament Bracket
                    </h2>
                    {bracketSettings.source === 'api' && (
                      <p className="text-center text-sm mb-4" style={{ color: colorPalette.bodyText }}>
                        Koppeling met {bracketSettings.apiEndpoint || 'extern API'} actief
                      </p>
                    )}
                    <div className={`grid gap-4 ${bracketSettings.rounds.length < 3 ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
                      {bracketSettings.rounds.map((round, roundIdx) => (
                        <div key={round.id} className="space-y-4">
                          <h3 
                            className="text-lg font-semibold mb-4 text-center"
                            style={{ color: bracketSettings.style.lineColor }}
                          >
                            {round.name}
                          </h3>
                          {round.matches.map((match, matchIdx) => (
                            <div 
                              key={match.id}
                              className={`p-4 rounded-lg border transition ${bracketSettings.style.animations ? 'hover:scale-[1.01]' : ''}`}
                              style={{ 
                                backgroundColor: bracketSettings.style.teamBlockColor,
                                borderColor: bracketSettings.style.lineColor,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${bracketSettings.style.mode === 'compact' ? 'text-xs' : ''}`} style={{ color: colorPalette.headingText }}>
                                  {match.teamA || 'TBD'}
                                </span>
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: (Number(match.scoreA) || 0) >= (Number(match.scoreB) || 0) ? bracketSettings.style.winnerColor : colorPalette.bodyText }}
                                >
                                  {match.scoreA || '-'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${bracketSettings.style.mode === 'compact' ? 'text-xs' : ''}`} style={{ color: colorPalette.headingText }}>
                                  {match.teamB || 'TBD'}
                                </span>
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: (Number(match.scoreB) || 0) > (Number(match.scoreA) || 0) ? bracketSettings.style.winnerColor : colorPalette.bodyText }}
                                >
                                  {match.scoreB || '-'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Teams */}
              {componentState.teams && (
                <section 
                  id="teams-section"
                  data-component-id="teams"
                  onClick={(e) => handleComponentClick('teams', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.pageBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-4 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Deelnemers
                    </div>
                    <h2 
                      className="text-4xl font-bold text-center mb-12"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Geregistreerde Teams
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { initials: 'AR', name: 'Arctic Wolves', tag: 'ARCT', players: ['Player1', 'Player2', 'Player3'] },
                        { initials: 'TH', name: 'Thunder Strike', tag: 'THND', players: ['Player1', 'Player2', 'Player3'] },
                        { initials: 'IC', name: 'Ice Phoenix', tag: 'ICEP', players: ['Player 1', 'Player 2', 'Player 3'] },
                        { initials: 'SN', name: 'Snow Leopards', tag: 'SNLP', players: ['Player 1', 'Player 2', 'Player 3'] }
                      ].map((team, idx) => (
                        <div 
                          key={idx}
                          className="p-6 rounded-xl border"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border
                          }}
                        >
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto"
                            style={{ backgroundColor: colorPalette.primary, color: 'white' }}
                          >
                            {team.initials}
                          </div>
                          <h3 
                            className="text-xl font-semibold text-center mb-2"
                            style={{ 
                              color: colorPalette.headingText,
                              fontSize: `${fontSettings.sizes.h3}px`
                            }}
                          >
                            {team.name}
                          </h3>
                          <p className="text-center text-sm opacity-60 mb-4" style={{ color: colorPalette.bodyText }}>
                            {team.tag}
                          </p>
                          <div className="space-y-1">
                            {team.players.map((player, pIdx) => (
                              <div 
                                key={pIdx}
                                className="text-sm text-center opacity-80"
                                style={{ color: colorPalette.bodyText }}
                              >
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Stats */}
              {componentState.stats && (
                <section 
                  id="stats-section"
                  data-component-id="stats"
                  onClick={(e) => handleComponentClick('stats', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.sectionBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { value: '16', label: 'Teams' },
                        { value: '€25.000', label: 'Prijzenpot (€)' },
                        { value: '48', label: 'Spelers' },
                        { value: '1.2K', label: 'Live Toeschouwers' }
                      ].map((stat, idx) => (
                        <div 
                          key={idx}
                          className="text-center p-6 rounded-xl border"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border
                          }}
                        >
                          <div 
                            className="text-4xl font-bold mb-2"
                            style={{ color: colorPalette.primary }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-sm opacity-80" style={{ color: colorPalette.bodyText }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Registration Form */}
              {componentState.registration && (
                <section 
                  id="register-section"
                  data-component-id="registration"
                  onClick={(e) => handleComponentClick('registration', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.pageBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-2xl">
                    <div className="text-center mb-4 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Inschrijven
                    </div>
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Doe mee aan Winter Championship
                    </h2>
                    <p className="text-center mb-8 opacity-90" style={{ color: colorPalette.bodyText }}>
                      Registratie sluit op 10 januari 2026. Wees er snel bij!
                    </p>
                    <form 
                      className="space-y-6 p-8 rounded-xl border"
                      style={{ 
                        backgroundColor: colorPalette.cardBackground,
                        borderColor: colorPalette.border
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium" style={{ color: colorPalette.headingText }}>
                            Teamnaam
                          </span>
                          <input
                            type="text"
                            placeholder="Voer je teamnaam in"
                            className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ 
                              backgroundColor: colorPalette.pageBackground,
                              borderColor: colorPalette.border,
                              color: colorPalette.bodyText
                            }}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium" style={{ color: colorPalette.headingText }}>
                            Team Tag
                          </span>
                          <input
                            type="text"
                            placeholder="bijv. WC26"
                            className="px-4 py-3 rounded-lg border focus:outline-none"
                            style={{ 
                              backgroundColor: colorPalette.pageBackground,
                              borderColor: colorPalette.border,
                              color: colorPalette.bodyText
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium" style={{ color: colorPalette.headingText }}>
                            Captain Naam
                          </span>
                          <input
                            type="text"
                            placeholder="Volledige naam"
                            className="px-4 py-3 rounded-lg border focus:outline-none"
                            style={{ 
                              backgroundColor: colorPalette.pageBackground,
                              borderColor: colorPalette.border,
                              color: colorPalette.bodyText
                            }}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium" style={{ color: colorPalette.headingText }}>
                            Captain Email
                          </span>
                          <input
                            type="email"
                            placeholder="email@voorbeeld.nl"
                            className="px-4 py-3 rounded-lg border focus:outline-none"
                            style={{ 
                              backgroundColor: colorPalette.pageBackground,
                              borderColor: colorPalette.border,
                              color: colorPalette.bodyText
                            }}
                          />
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: colorPalette.buttonPrimary,
                          color: colorPalette.buttonPrimaryText
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colorPalette.buttonPrimaryHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorPalette.buttonPrimary}
                      >
                        Schrijf team in
                      </button>
                    </form>
                  </div>
                </section>
              )}

              {/* FAQ */}
              {componentState.faq && (
                <section 
                  id="faq-section"
                  data-component-id="faq"
                  onClick={(e) => handleComponentClick('faq', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.sectionBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-4 text-sm uppercase tracking-widest opacity-70" style={{ color: colorPalette.mutedText }}>
                      Veelgestelde vragen
                    </div>
                    <h2 
                      className="text-4xl font-bold text-center mb-12"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      FAQ
                    </h2>
                    <div className="space-y-4">
                      {[
                        { q: 'Wat is het inschrijfgeld?', a: 'Het inschrijfgeld bedraagt €150 per team. Dit dekt de volledige dag inclusief faciliteiten, setup en prijs contributions.' },
                        { q: 'Wat zijn de rank requirements?', a: 'Minimaal één speler moet Champion I of hoger zijn. De gemiddelde team rank moet minimaal Diamond III zijn.' },
                        { q: 'Is een substitute speler toegestaan?', a: 'Ja, elk team mag één officiële substitute registreren. Deze moet bij inschrijving worden opgegeven.' }
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-6 rounded-xl border"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border
                          }}
                        >
                          <h3 
                            className="text-lg font-semibold mb-3"
                            style={{ 
                              color: colorPalette.headingText,
                              fontSize: `${fontSettings.sizes.h3}px`
                            }}
                          >
                            {item.q}
                          </h3>
                          <p className="text-sm opacity-80" style={{ color: colorPalette.bodyText }}>
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Twitch Stream */}
              {componentState.twitch && (
                <section 
                  id="twitch-section"
                  data-component-id="twitch"
                  onClick={(e) => handleComponentClick('twitch', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: twitchSettings.background }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-5xl">
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Live Stream
                    </h2>
                    <p className="text-center mb-8 opacity-90" style={{ color: colorPalette.bodyText }}>
                      Bekijk de wedstrijden live op Twitch
                    </p>
                    <div className={`flex ${twitchSettings.layout === 'side-by-side' ? 'flex-col md:flex-row gap-6' : 'flex-col gap-4'}`}>
                      <div 
                        className="rounded-xl border flex items-center justify-center"
                        style={{ 
                          backgroundColor: colorPalette.cardBackground,
                          borderColor: colorPalette.border,
                          width: twitchSettings.layout === 'side-by-side' ? `${twitchSettings.width}%` : '100%',
                          minHeight: twitchSettings.height,
                        }}
                      >
                        <div className="text-center space-y-3">
                          <div className="text-4xl">📺</div>
                          <p className="text-sm opacity-80" style={{ color: colorPalette.bodyText }}>
                            Twitch kanaal: <span className="font-semibold text-white">{twitchSettings.channel}</span>
                          </p>
                          <div className="flex gap-3 justify-center text-xs uppercase tracking-widest text-white/60">
                            {twitchSettings.autoplay && <span>Autoplay</span>}
                            {twitchSettings.showChat && <span>Chat</span>}
                          </div>
                        </div>
                      </div>
                      {twitchSettings.showChat && twitchSettings.layout !== 'stream-only' && (
                        <div 
                          className="rounded-xl border p-4 text-sm"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border,
                            minHeight: twitchSettings.layout === 'side-by-side' ? twitchSettings.height : 240,
                          }}
                        >
                          <p className="text-white/60">Chat placeholder voor #{twitchSettings.channel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Sponsors */}
              {componentState.sponsors && (
                <section 
                  id="sponsors-section"
                  data-component-id="sponsors"
                  onClick={(e) => handleComponentClick('sponsors', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: sponsorSettings.backgroundColor }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Onze Sponsors
                    </h2>
                    <p className="text-center mb-12 opacity-90" style={{ color: colorPalette.bodyText }}>
                      Met dank aan onze partners
                    </p>
                    <div
                      className={`${sponsorSettings.layout === 'carousel' ? 'flex overflow-x-auto gap-6 pb-4' : 'grid'} `}
                      style={
                        sponsorSettings.layout === 'grid'
                          ? { gridTemplateColumns: `repeat(${sponsorSettings.columns}, minmax(0, 1fr))`, gap: sponsorSettings.gap }
                          : { gap: sponsorSettings.gap }
                      }
                    >
                      {sponsorSettings.logos.map((logo) => (
                        <a
                          key={logo.id}
                          href={logo.link}
                          className="rounded-xl border flex items-center justify-center transition-all"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: sponsorSettings.divider ? colorPalette.border : 'transparent',
                            minWidth: sponsorSettings.layout === 'carousel' ? '180px' : undefined,
                            filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                          }}
                          onMouseEnter={(e) => sponsorSettings.grayscaleHover && (e.currentTarget.style.filter = 'grayscale(0%)')}
                          onMouseLeave={(e) => sponsorSettings.grayscaleHover && (e.currentTarget.style.filter = 'grayscale(100%)')}
                        >
                          {logo.url ? (
                            <img src={logo.url} alt={logo.name} style={{ maxHeight: sponsorSettings.logoSize }} className="object-contain" />
                          ) : (
                            <span className="text-sm font-medium opacity-80" style={{ color: colorPalette.bodyText }}>
                              {logo.name}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Socials */}
              {componentState.socials && (
                <section 
                  id="socials-section"
                  data-component-id="socials"
                  onClick={(e) => handleComponentClick('socials', e)}
                  className="py-20 px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.pageBackground }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-4xl">
                    <h2 
                      className="text-4xl font-bold text-center mb-6"
                      style={{ 
                        color: colorPalette.headingText,
                        fontFamily: fontSettings.headingFamily,
                        fontSize: `${fontSettings.sizes.h2}px`
                      }}
                    >
                      Volg Ons
                    </h2>
                    <p className="text-center mb-12 opacity-90" style={{ color: colorPalette.bodyText }}>
                      Blijf op de hoogte via social media
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                      {socialSettings.icons.filter((icon) => icon.enabled).map((iconItem) => (
                        <a
                          key={iconItem.id}
                          href={iconItem.link}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all hover:scale-105 ${socialSettings.display === 'icon' ? 'justify-center' : ''}`}
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border,
                            color: colorPalette.bodyText,
                            fontSize: socialSettings.size,
                            borderRadius: socialSettings.style === 'rounded' ? 999 : 12
                          }}
                        >
                          <span>{iconItem.label.slice(0, 2)}</span>
                          {socialSettings.display === 'icon-text' && <span className="text-sm">{iconItem.label}</span>}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Footer */}
              {componentState.footer && (
                <footer 
                  data-component-id="footer"
                  onClick={(e) => handleComponentClick('footer', e)}
                  className="py-12 px-6 border-t cursor-pointer relative group"
                  style={{ 
                    backgroundColor: footerSettings.backgroundColor,
                    borderColor: colorPalette.border
                  }}
                >
                  <div className="absolute inset-0 border-2 border-[#755DFF] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10" />
                  <div className="container mx-auto max-w-6xl">
                    <div
                      className="grid mb-8"
                      style={{ 
                        gridTemplateColumns:
                          footerSettings.layout === 'centered'
                            ? '1fr'
                            : footerSettings.layout === 'two-columns'
                            ? 'repeat(2, minmax(0, 1fr))'
                            : 'repeat(3, minmax(0, 1fr))',
                        gap: footerSettings.spacing,
                      }}
                    >
                      <div>
                        {footerSettings.logoUrl ? (
                          <img src={footerSettings.logoUrl} alt="Footer logo" className="h-10 mb-4 object-contain" />
                        ) : (
                          <h3 
                            className="text-xl font-bold mb-4"
                            style={{ color: footerSettings.textColor }}
                          >
                            Winter Championship 2026
                          </h3>
                        )}
                        <p className="text-sm opacity-80" style={{ color: footerSettings.textColor }}>
                          {footerSettings.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: footerSettings.textColor }}>
                          Toernooi
                        </h4>
                        <ul className="space-y-2">
                          {footerSettings.links.tournament.map((link) => (
                            <li key={link.id}>
                              <a 
                                href={link.link}
                                className="text-sm opacity-80 hover:opacity-100 transition"
                                style={{ color: footerSettings.textColor }}
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: footerSettings.textColor }}>
                          Informatie
                        </h4>
                        <ul className="space-y-2">
                          {footerSettings.links.info.map((link) => (
                            <li key={link.id}>
                              <a 
                                href={link.link}
                                className="text-sm opacity-80 hover:opacity-100 transition"
                                style={{ color: footerSettings.textColor }}
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {footerSettings.showSocials && (
                        <div>
                          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: footerSettings.textColor }}>
                            Social Media
                          </h4>
                          <ul className="space-y-2">
                            {socialSettings.icons.filter((icon) => icon.enabled).map((icon) => (
                              <li key={icon.id}>
                                <a href={icon.link} className="text-sm opacity-80 hover:opacity-100 transition" style={{ color: footerSettings.textColor }}>
                                  {icon.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="pt-8 text-center text-sm opacity-60" style={{ borderTop: footerSettings.divider ? `1px solid ${colorPalette.border}` : 'none', color: footerSettings.textColor }}>
                      {footerSettings.copyright}
                    </div>
                  </div>
                </footer>
              )}
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="w-[360px] bg-[#0E1020] border-l border-white/10 flex flex-col fixed right-0 top-[85px] h-[calc(100vh-85px)] overflow-y-auto z-10">
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">{activeComponentLabel}</p>
            <h2 className="text-lg font-semibold">Configureer de {activeComponentLabel}</h2>
          </div>
          {renderSettingsPanel()}
        </aside>
      </main>
    </div>
  );
}

