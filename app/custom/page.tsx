'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode, MouseEvent as ReactMouseEvent, ChangeEvent, CSSProperties, JSX } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LivestreamEmbed } from '../components/livestream';

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <path d="M3 14h8v8" />
    </svg>
  ),
  colors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  fonts: (
    <div className="flex items-center justify-center gap-[2px] font-semibold text-lg">
      <span style={{ fontSize: '1rem' }}>A</span>
      <span style={{ fontSize: '0.75rem' }}>a</span>
    </div>
  ),
  uploads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

type SortableComponentItemProps = {
  component: ComponentToggle;
  isActive: boolean;
  isVisible: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
};

// Draggable Upload Item Component
function DraggableUploadItem({ 
  item, 
  onDelete, 
  onRename,
  onUseInComponent 
}: { 
  item: UploadItem; 
  onDelete: (id: string) => void; 
  onRename: (id: string, name: string) => void;
  onUseInComponent: (componentId: string, imageUrl: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `upload-${item.id}`,
    data: {
      type: 'upload',
      item,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const imageOptions = [
    { id: 'navigation', label: 'Navigation Logo', icon: 'navigation' as IconName },
    { id: 'hero', label: 'Hero Section', icon: 'hero' as IconName },
    { id: 'about', label: 'About Image', icon: 'about' as IconName },
    { id: 'footer', label: 'Footer Logo', icon: 'footer' as IconName },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#11132A] border border-white/10 rounded-2xl p-4 flex gap-4 items-center relative"
    >
      <div 
        {...listeners}
        {...attributes}
        className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1B1F3E] to-[#0B0E1C] border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-grab active:cursor-grabbing"
      >
        <img 
          src={item.url} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <input
          value={item.name}
          onChange={(e) => onRename(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent text-sm font-semibold w-full focus:outline-none focus:border-b focus:border-[#755DFF]"
        />
        <p className="text-xs text-white/40">{item.size}</p>
        {item.usedIn.length > 0 && (
          <p className="text-[11px] text-white/50 mt-1">
            Used in: {item.usedIn.join(', ')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className="text-xs text-white/60 hover:text-white transition bg-[#755DFF]/10 hover:bg-[#755DFF]/20 px-3 py-1.5 rounded-lg border border-[#755DFF]/30 flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Use
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-8 z-50 bg-[#0E1020] border border-white/20 rounded-xl shadow-2xl py-2 min-w-[180px]">
              <div className="px-3 py-2 text-xs uppercase tracking-wider text-white/40 border-b border-white/10">
                Use in component
              </div>
              {imageOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseInComponent(option.id, item.url);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-[#755DFF]/10 flex items-center gap-2 transition-colors"
                >
                  <Icon name={option.icon} className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(item.url).then(() => {
              const button = e.currentTarget;
              const originalText = button.textContent;
              button.textContent = 'Copied!';
              setTimeout(() => {
                if (button) button.textContent = originalText;
              }, 2000);
            });
          }}
          className="text-xs text-white/60 hover:text-white transition"
        >
          Copy URL
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="text-xs text-red-400 hover:text-red-300 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Droppable Image Field Component (for settings panel)
function DroppableImageField({ 
  id, 
  onChange, 
  label, 
  children 
}: { 
  id: string; 
  onChange: (url: string) => void;
  label?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'image-field',
      onChange,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 ${isOver ? 'bg-[#755DFF]/20 border border-[#755DFF] rounded-lg p-2' : ''}`}
    >
      {label && <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">{label}</h3>}
      {children}
    </div>
  );
}

// Droppable Image Area Component (for preview)
function DroppableImageArea({ 
  id, 
  onChange, 
  className = '',
  style,
  children
}: { 
  id: string; 
  onChange: (url: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'image-field',
      onChange,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative ${className} ${isOver ? 'ring-2 ring-[#755DFF] ring-offset-2 ring-offset-transparent' : ''}`}
      style={style}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-[#755DFF]/20 border-2 border-dashed border-[#755DFF] rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="text-[#755DFF] font-semibold text-sm">Drop image here</div>
        </div>
      )}
    </div>
  );
}

function SortableComponentItem({ component, isActive, isVisible, onSelect, onToggle }: SortableComponentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all cursor-pointer ${
        isActive ? 'border-[#755DFF] bg-[#1a1d36]' : 'border-white/10 hover:border-white/30'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-center gap-3 text-left flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/60 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5" />
            <circle cx="12" cy="4" r="1.5" />
            <circle cx="4" cy="8" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="4" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        </div>
        <Icon name={component.icon} className="w-5 h-5" />
        <div>
          <p className="font-medium text-sm">{component.label}</p>
          <p className="text-xs text-white/40 capitalize">
            {isVisible ? 'visible on canvas' : 'click to show'}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          isVisible ? 'bg-[#755DFF]' : 'bg-white/15'
        }`}
        role="switch"
        aria-checked={isVisible}
      >
        <span
          className={`inline-block h-5 w-5 bg-white rounded-full transform transition ${
            isVisible ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

type ComponentToggle = {
  id: string;
  label: string;
  icon: IconName;
};

type NavigationMenuItem = {
  id: string;
  label: string;
  type: 'section' | 'external';
  value: string;
  icon: string;
  enabled: boolean;
};

type NavigationCTASettings = {
  enabled: boolean;
  label: string;
  link: string;
  background: string;
  textColor: string;
  radius: number;
};

type NavigationSettingsState = {
  logoUrl: string;
  logoWidth: number;
  linkType: 'home' | 'custom';
  customUrl: string;
  sticky: boolean;
  textColor: string;
  hoverColor: string;
  activeColor: string;
  backgroundColor: string;
  padding: {
    top: number;
    bottom: number;
  };
  cta: NavigationCTASettings;
  menuItems: NavigationMenuItem[];
};

type NavigationSettingsOverrides = Partial<Omit<NavigationSettingsState, 'padding' | 'cta'>> & {
  padding?: Partial<NavigationSettingsState['padding']>;
  cta?: Partial<NavigationCTASettings>;
};

type NavigationLayoutConfig = {
  wrapperClass: string;
  logoWrapperClass?: string;
  menuWrapperClass?: string;
  menuGapClass?: string;
  uppercaseLinks?: boolean;
  ctaPlacement?: 'inline' | 'stacked';
  ctaVisibility?: 'respect' | 'force-hide';
};

type NavigationFormatOption = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  layout: NavigationLayoutConfig;
  settings?: NavigationSettingsOverrides;
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

const NAVIGATION_FORMATS: NavigationFormatOption[] = [
  {
    id: 'default',
    label: 'Default Design',
    subLabel: 'Logo left',
    description: 'Klassieke verdeling met CTA rechts',
    layout: {
      wrapperClass: 'flex-col md:flex-row items-center justify-between gap-4 md:gap-8',
      logoWrapperClass: 'justify-start',
      menuWrapperClass: 'justify-center flex-1',
      menuGapClass: 'gap-6',
      ctaPlacement: 'inline',
      ctaVisibility: 'respect',
    },
    settings: {
      padding: { top: 16, bottom: 16 },
      cta: { enabled: true },
    },
  },
  {
    id: 'centered',
    label: 'Centered Logo',
    subLabel: 'Logo mid',
    description: 'Logo en menu gecentreerd met CTA eronder',
    layout: {
      wrapperClass: 'flex-col items-center text-center gap-4',
      logoWrapperClass: 'justify-center',
      menuWrapperClass: 'justify-center',
      menuGapClass: 'gap-5',
      ctaPlacement: 'stacked',
      ctaVisibility: 'respect',
    },
    settings: {
      padding: { top: 28, bottom: 28 },
      cta: { enabled: true },
    },
  },
  {
    id: 'minimal',
    label: 'Minimal Spacing',
    subLabel: 'Logo right',
    description: 'Compacte balk met menu rechts en geen CTA',
    layout: {
      wrapperClass: 'flex-col md:flex-row items-center justify-between gap-3',
      logoWrapperClass: 'md:order-3 order-1 justify-end',
      menuWrapperClass: 'md:order-2 order-2 justify-end flex-1',
      menuGapClass: 'gap-4',
      uppercaseLinks: true,
      ctaPlacement: 'inline',
      ctaVisibility: 'force-hide',
    },
    settings: {
      padding: { top: 10, bottom: 10 },
      cta: { enabled: false },
    },
  },
  {
    id: 'spacious',
    label: 'Spacious Layout',
    subLabel: 'Logo left',
    description: 'Extra ademruimte en prominente CTA',
    layout: {
      wrapperClass: 'flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12',
      logoWrapperClass: 'justify-start',
      menuWrapperClass: 'justify-center flex-1',
      menuGapClass: 'gap-8',
      ctaPlacement: 'inline',
      ctaVisibility: 'respect',
    },
    settings: {
      padding: { top: 24, bottom: 24 },
      cta: { enabled: true, radius: 999 },
    },
  },
];

const HERO_TEMPLATES = [
  {
    id: 'classic-center',
    label: 'Classic Center',
    description: 'Tekst gecentreerd met dubbele CTA',
    layout: 'text',
    defaultAlignment: 'center' as 'left' | 'center' | 'right',
    requiresImage: false,
  },
  {
    id: 'story-left',
    label: 'Story Left',
    description: 'Links uitgelijnde storytelling lay-out',
    layout: 'text',
    defaultAlignment: 'left' as 'left' | 'center' | 'right',
    requiresImage: false,
  },
  {
    id: 'split-image-left',
    label: 'Split Image Left',
    description: 'Afbeelding links & content rechts',
    layout: 'split',
    imagePosition: 'left' as 'left' | 'right',
    requiresImage: true,
  },
  {
    id: 'split-image-right',
    label: 'Split Image Right',
    description: 'Afbeelding rechts & content links',
    layout: 'split',
    imagePosition: 'right' as 'left' | 'right',
    requiresImage: true,
  },
];

const ABOUT_LAYOUT_OPTIONS: Array<{
  id: AboutLayout;
  label: string;
  description: string;
}> = [
  {
    id: 'image-left',
    label: 'Afbeelding links',
    description: 'Visual aan de linkerkant met tekst rechts',
  },
  {
    id: 'image-right',
    label: 'Afbeelding rechts',
    description: 'Tekst links en beeldmateriaal rechts',
  },
  {
    id: 'stacked',
    label: 'Stacked',
    description: 'Afbeelding bovenaan, content gecentreerd daaronder',
  },
  {
    id: 'spotlight',
    label: 'Spotlight banner',
    description: 'Volledige breedte hero met overlay en kaarten',
  },
  {
    id: 'feature-grid',
    label: 'Feature grid',
    description: 'Tekst naast een kaart/grid presentatie',
  },
];

const VIEWPORTS: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];

type EditorTab = 'components' | 'colors' | 'fonts' | 'uploads';

const HEADING_FONT_OPTIONS = [
  'Space Grotesk',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Oswald',
  'Bebas Neue',
];

const BODY_FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Nunito',
  'Work Sans',
  'Lexend',
  'DM Sans',
];

const WEIGHT_OPTIONS = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi-bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra-bold (800)' },
];

const GOOGLE_FONT_CONFIG: Record<string, string> = {
  'Space Grotesk': 'Space+Grotesk:wght@400;500;700',
  Montserrat: 'Montserrat:wght@400;500;600;700',
  Poppins: 'Poppins:wght@400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;600;700',
  Oswald: 'Oswald:wght@400;500;600;700',
  'Bebas Neue': 'Bebas+Neue',
  Inter: 'Inter:wght@400;500;600;700',
  Roboto: 'Roboto:wght@400;500;700',
  Nunito: 'Nunito:wght@400;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
  Lexend: 'Lexend:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
};

const formatFontStack = (font: string, fallback = 'sans-serif') => {
  if (!font) {
    return fallback;
  }
  const needsQuotes = /\s/.test(font);
  const normalized = needsQuotes ? `'${font}'` : font;
  return `${normalized}, ${fallback}`;
};

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

type BaseColorKey = 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'surface' | 'surfaceAlt';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const normalizeHex = (color: string) => {
  if (!color) return '000000';
  let hex = color.trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (hex.length !== 6 || Number.isNaN(Number.parseInt(hex, 16))) {
    return '000000';
  }
  return hex.toLowerCase();
};

const hexToRgb = (color: string) => {
  const hex = normalizeHex(color);
  const int = Number.parseInt(hex, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixColors = (colorA: string, colorB: string, amount: number) => {
  const mixAmount = clamp(amount, 0, 1);
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const mixChannel = (channel: keyof typeof a) => a[channel] + (b[channel] - a[channel]) * mixAmount;
  return rgbToHex({
    r: mixChannel('r'),
    g: mixChannel('g'),
    b: mixChannel('b'),
  });
};

const lightenColor = (color: string, amount = 0.1) => mixColors(color, '#ffffff', amount);
const darkenColor = (color: string, amount = 0.1) => mixColors(color, '#000000', amount);

const DEFAULT_BASE_COLORS: Record<BaseColorKey, string> = {
  primary: '#755DFF',
  secondary: '#3A7AFE',
  accent: '#FF5F8D',
  background: '#05060D',
  text: '#FFFFFF',
  surface: '#090B18',
  surfaceAlt: '#11132A',
};

const generateColorPalette = (baseColors: Record<BaseColorKey, string>): Record<ThemeColorKey, string> => {
  const { primary, secondary, accent, background, text, surface, surfaceAlt } = baseColors;
  const resolvedSurface = surface ?? lightenColor(background, 0.07);
  const resolvedSurfaceAlt = surfaceAlt ?? lightenColor(resolvedSurface, 0.08);
  const link = lightenColor(primary, 0.15);
  const linkHover = lightenColor(primary, 0.3);
  const sectionBackground = resolvedSurface;
  const cardBackground = resolvedSurfaceAlt;
  const navBackground = resolvedSurfaceAlt;
  const footerBackground = resolvedSurface;
  const footerText = lightenColor(text, 0.2);
  const footerLink = lightenColor(primary, 0.2);
  const footerLinkHover = lightenColor(primary, 0.35);
  const buttonPrimaryHover = lightenColor(primary, 0.15);
  const buttonSecondary = resolvedSurfaceAlt;
  const buttonSecondaryHover = lightenColor(resolvedSurfaceAlt, 0.08);
  const mutedText = mixColors(text, background, 0.4);
  const border = lightenColor(resolvedSurfaceAlt, 0.18);
  const divider = lightenColor(resolvedSurface, 0.15);
  const overlay = darkenColor(resolvedSurface, 0.25);
  const shadow = darkenColor(resolvedSurfaceAlt, 0.4);

  return {
    primary,
    secondary,
    accent,
    link,
    linkHover,
    bodyText: text,
    headingText: text,
    mutedText,
    pageBackground: background,
    sectionBackground,
    cardBackground,
    navBackground,
    navText: text,
    navHover: lightenColor(primary, 0.25),
    footerBackground,
    footerText,
    footerLink,
    footerLinkHover,
    buttonPrimary: primary,
    buttonPrimaryText: '#FFFFFF',
    buttonPrimaryHover,
    buttonSecondary,
    buttonSecondaryText: text,
    buttonSecondaryHover,
    border,
    divider,
    overlay,
    shadow,
  };
};

const BASE_COLOR_FIELDS: Array<{ key: BaseColorKey; label: string; helper?: string }> = [
  { key: 'primary', label: 'Primary Accent', helper: 'Buttons, highlights en CTA\'s' },
  { key: 'secondary', label: 'Secondary Accent', helper: 'Badges en secundaire CTA\'s' },
  { key: 'accent', label: 'Accent Detail', helper: 'Decoratieve accenten' },
  { key: 'background', label: 'Background', helper: 'Pagina- en kaartachtergrond' },
  { key: 'surface', label: 'Surface Base', helper: 'Sectie-achtergrond en grote vlakken' },
  { key: 'surfaceAlt', label: 'Surface Elevated', helper: 'Cards, panelen en blockquotes' },
  { key: 'text', label: 'Text', helper: 'Body- en headingtekst' },
];

const THEME_PRESETS: Array<{ id: string; name: string; baseColors: Partial<Record<BaseColorKey, string>> }> = [
  {
    id: 'default',
    name: 'Default Purple',
    baseColors: {
      primary: '#755DFF',
      secondary: '#3A7AFE',
      accent: '#FF5F8D',
      background: '#05060D',
      text: '#FFFFFF',
      surface: '#090B18',
      surfaceAlt: '#11132A',
    },
  },
  {
    id: 'neon',
    name: 'Neon Pulse',
    baseColors: {
      primary: '#9C1AFF',
      secondary: '#00D5FF',
      accent: '#FF4ECD',
      background: '#01040E',
      text: '#F7F7FF',
      surface: '#020510',
      surfaceAlt: '#030718',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Heat',
    baseColors: {
      primary: '#FF7A18',
      secondary: '#AF002D',
      accent: '#FFD447',
      background: '#120404',
      text: '#FFF8F2',
      surface: '#1A0505',
      surfaceAlt: '#220606',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Frost',
    baseColors: {
      primary: '#5ED6FF',
      secondary: '#93A1FF',
      accent: '#B8FFCB',
      background: '#030711',
      text: '#E2F4FF',
      surface: '#050A15',
      surfaceAlt: '#080E1D',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Rush',
    baseColors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#041B0D',
      text: '#ECFDF5',
      surface: '#052E16',
      surfaceAlt: '#064E2B',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson Arena',
    baseColors: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F87171',
      background: '#0F0202',
      text: '#FEF2F2',
      surface: '#1A0404',
      surfaceAlt: '#240606',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Depth',
    baseColors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      background: '#020617',
      text: '#EFF6FF',
      surface: '#030A1C',
      surfaceAlt: '#050F26',
    },
  },
  {
    id: 'gold',
    name: 'Champion Gold',
    baseColors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#0F0A00',
      text: '#FFFBEB',
      surface: '#1A1200',
      surfaceAlt: '#241A00',
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

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
type BodyVariant = 'body' | 'small';
type AboutLayout = 'image-left' | 'image-right' | 'stacked' | 'spotlight' | 'feature-grid';
type TextElementTag = keyof JSX.IntrinsicElements;
type ColorInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
};

function ColorInputField({ label, value, onChange, helper }: ColorInputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.3em] text-white/50">
        <span>{label}</span>
        {helper && <p className="text-[11px] text-white/40 normal-case mt-0.5">{helper}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl border border-white/15 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-[140px] bg-[#0B0E1F] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-[0.1em] focus:outline-none focus:border-[#755DFF]"
        />
      </div>
    </div>
  );
}

const DEFAULT_FONT_SETTINGS: FontSettings = {
  headingFamily: 'Space Grotesk',
  bodyFamily: 'Inter',
  sizes: { h1: 48, h2: 36, h3: 22, h4: 20, body: 16, small: 13 },
  weights: { heading: 700, body: 400 },
  lineHeight: 140,
  letterSpacing: 2,
};

const DEFAULT_UPLOADS: UploadItem[] = [];

const DEFAULT_OVERLAY_OPACITY = 0.72;

const HEADING_SIZE_MAP: Record<HeadingLevel, keyof FontSettings['sizes']> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
};

const BODY_SIZE_MAP: Record<BodyVariant, keyof FontSettings['sizes']> = {
  body: 'body',
  small: 'small',
};

const getDefaultFontSettings = (): FontSettings => ({
  headingFamily: DEFAULT_FONT_SETTINGS.headingFamily,
  bodyFamily: DEFAULT_FONT_SETTINGS.bodyFamily,
  sizes: { ...DEFAULT_FONT_SETTINGS.sizes },
  weights: { ...DEFAULT_FONT_SETTINGS.weights },
  lineHeight: DEFAULT_FONT_SETTINGS.lineHeight,
  letterSpacing: DEFAULT_FONT_SETTINGS.letterSpacing,
});

const getDefaultNavigationSettings = (): NavigationSettingsState => ({
  logoUrl: '',
  logoWidth: 140,
  linkType: 'home',
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

const getDefaultHeroSettings = () => ({
  template: 'classic-center',
  heroImageUrl: 'https://images.rosh.gg/hero-banner.jpg',
  backgroundImageUrl: '',
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

const getDefaultAboutSettings = () => ({
  layout: 'image-left' as AboutLayout,
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
  buttons: [{ id: createId(), label: 'Bekijk schema', link: '#schedule-section' }],
  backgroundColor: '#05060D',
  padding: { top: 80, bottom: 80 },
});

const getDefaultProgramSettings = () => ({
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

const getDefaultBracketSettings = () => ({
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
      matches: [{ id: createId(), teamA: 'Team Alpha', teamB: 'Team Delta', scoreA: '16', scoreB: '14' }],
    },
  ],
});

const getDefaultGroupStageSettings = () => ({
  numberOfGroups: 4,
  teamsPerGroup: 4,
  fontSizes: {
    title: 36,
    subtitle: 16,
    groupName: 24,
    teamName: 14,
    teamTag: 12,
  },
  colors: {
    backgroundColor: '#05060D',
    subtitleColor: '#FFFFFF',
    titleColor: '#FFFFFF',
    bodyTextColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    groupNameColor: '#755DFF',
    teamItemBackground: '#05060D',
    teamNameColor: '#FFFFFF',
    teamTagColor: '#FFFFFF',
    seedColor: '#FFFFFF',
  },
  groups: [
    {
      id: createId(),
      name: 'A',
      teams: [
        { id: createId(), seed: '#1', name: 'Arctic Wolves', tag: 'ARCT' },
        { id: createId(), seed: '#8', name: 'Thunder Strike', tag: 'THND' },
        { id: createId(), seed: '#9', name: 'Ice Phoenix', tag: 'ICEP' },
        { id: createId(), seed: '#16', name: 'Snow Leopards', tag: 'SNLP' },
      ],
    },
    {
      id: createId(),
      name: 'B',
      teams: [
        { id: createId(), seed: '#2', name: 'Fire Dragons', tag: 'FIRE' },
        { id: createId(), seed: '#7', name: 'Storm Riders', tag: 'STORM' },
        { id: createId(), seed: '#10', name: 'Lightning Bolt', tag: 'LIGHT' },
        { id: createId(), seed: '#15', name: 'Thunder Hawks', tag: 'HAWK' },
      ],
    },
    {
      id: createId(),
      name: 'C',
      teams: [
        { id: createId(), seed: '#3', name: 'Shadow Wolves', tag: 'SHAD' },
        { id: createId(), seed: '#6', name: 'Night Stalkers', tag: 'NIGHT' },
        { id: createId(), seed: '#11', name: 'Dark Knights', tag: 'DARK' },
        { id: createId(), seed: '#14', name: 'Midnight Riders', tag: 'MID' },
      ],
    },
    {
      id: createId(),
      name: 'D',
      teams: [
        { id: createId(), seed: '#4', name: 'Golden Eagles', tag: 'GOLD' },
        { id: createId(), seed: '#5', name: 'Silver Lions', tag: 'SILV' },
        { id: createId(), seed: '#12', name: 'Bronze Bears', tag: 'BRON' },
        { id: createId(), seed: '#13', name: 'Copper Tigers', tag: 'COPP' },
      ],
    },
  ],
});

const resetGroupStageFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
    groupName: 24,
    teamName: 14,
    teamTag: 12,
  };
};

const resetGroupStageColors = () => {
  return {
    backgroundColor: '#05060D',
    subtitleColor: '#FFFFFF',
    titleColor: '#FFFFFF',
    bodyTextColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    groupNameColor: '#755DFF',
    teamItemBackground: '#05060D',
    teamNameColor: '#FFFFFF',
    teamTagColor: '#FFFFFF',
    seedColor: '#FFFFFF',
  };
};

type StatsLayout = 'grid' | 'list' | 'cards' | 'minimal';

const STATS_LAYOUT_OPTIONS: { id: StatsLayout; label: string; description: string }[] = [
  { id: 'grid', label: 'Grid', description: '4-kolom grid layout' },
  { id: 'list', label: 'Lijst', description: 'Verticale lijst weergave' },
  { id: 'cards', label: 'Cards', description: 'Grote card weergave' },
  { id: 'minimal', label: 'Minimaal', description: 'Compacte weergave' },
];

const getDefaultStatsSettings = () => ({
  layout: 'grid' as StatsLayout,
  title: 'Live Statistieken',
  subtitle: 'Real-time toernooi overzicht',
  stats: [
    { id: createId(), value: '16', label: 'Teams', icon: '' },
    { id: createId(), value: '€25.000', label: 'Prijzenpot (€)', icon: '' },
    { id: createId(), value: '48', label: 'Spelers', icon: '' },
    { id: createId(), value: '1.2K', label: 'Live Toeschouwers', icon: '' },
  ],
  fontSizes: {
    title: 36,
    subtitle: 16,
    statValue: 32,
    statLabel: 14,
  },
  colors: {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    statValueColor: '#755DFF',
    statLabelColor: '#FFFFFF',
  },
});

const resetStatsFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
    statValue: 32,
    statLabel: 14,
  };
};

const resetStatsColors = () => {
  return {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    statValueColor: '#755DFF',
    statLabelColor: '#FFFFFF',
  };
};

type FAQLayout = 'accordion' | 'cards' | 'list' | 'minimal';

const FAQ_LAYOUT_OPTIONS: { id: FAQLayout; label: string; description: string }[] = [
  { id: 'accordion', label: 'Accordion', description: 'Uitklapbare items' },
  { id: 'cards', label: 'Cards', description: 'Card weergave' },
  { id: 'list', label: 'Lijst', description: 'Verticale lijst' },
  { id: 'minimal', label: 'Minimaal', description: 'Compacte weergave' },
];

const getDefaultFAQSettings = () => ({
  layout: 'accordion' as FAQLayout,
  title: 'FAQ',
  subtitle: 'Veelgestelde vragen',
  items: [] as Array<{ id: string; question: string; answer: string }>,
  fontSizes: {
    title: 36,
    subtitle: 16,
    question: 20,
    answer: 14,
  },
  colors: {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    questionColor: '#FFFFFF',
    answerColor: '#FFFFFF',
  },
});

const resetFAQFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
    question: 20,
    answer: 14,
  };
};

const resetFAQColors = () => {
  return {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    questionColor: '#FFFFFF',
    answerColor: '#FFFFFF',
  };
};

const getDefaultTwitchSettings = () => ({
  channel: 'roshlive',
  autoplay: false,
  showChat: true,
  layout: 'stacked' as 'stacked' | 'side-by-side' | 'stream-only',
  width: 100,
  height: 420,
  background: '#05060D',
});

type SponsorLayout = 'grid' | 'carousel' | 'rows' | 'centered' | 'minimal';

const SPONSOR_LAYOUT_OPTIONS: { id: SponsorLayout; label: string; description: string }[] = [
  { id: 'grid', label: 'Grid', description: 'Raster weergave' },
  { id: 'carousel', label: 'Carousel', description: 'Horizontale scroll' },
  { id: 'rows', label: 'Rijen', description: 'Verticale rijen' },
  { id: 'centered', label: 'Gecentreerd', description: 'Gecentreerde weergave' },
  { id: 'minimal', label: 'Minimaal', description: 'Compacte weergave' },
];

const getDefaultSponsorSettings = () => ({
  layout: 'grid' as SponsorLayout,
  title: 'Onze Sponsors',
  subtitle: 'Met dank aan onze partners',
  columns: 3,
  logoSize: 80,
  gap: 20,
  grayscaleHover: true,
  backgroundColor: '#0E1020',
  divider: false,
  logos: [] as Array<{ id: string; name: string; url: string; link: string }>,
  fontSizes: {
    title: 36,
    subtitle: 16,
  },
  colors: {
    backgroundColor: '#0E1020',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
  },
});

const resetSponsorFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
  };
};

const resetSponsorColors = () => {
  return {
    backgroundColor: '#0E1020',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
  };
};

const getDefaultSocialSettings = () => ({
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

const FOOTER_TEMPLATES = [
  {
    id: 'three-columns',
    label: 'Classic',
    description: 'Logo + beschrijving links, drie link kolommen rechts (Toernooi, Informatie, Contact)',
    layout: 'three-columns' as const,
    showSocials: true,
  },
  {
    id: 'two-columns',
    label: 'Two Column',
    description: 'Logo + beschrijving links, alle links in één kolom rechts, socials onderaan',
    layout: 'two-columns' as const,
    showSocials: true,
  },
  {
    id: 'centered',
    label: 'Stacked',
    description: 'Alles verticaal gestapeld en gecentreerd: logo, beschrijving, links, socials',
    layout: 'centered' as const,
    showSocials: true,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Alleen logo, beschrijving en copyright gecentreerd',
    layout: 'centered' as const,
    showSocials: false,
  },
];

const getDefaultFooterSettings = () => ({
  template: 'three-columns',
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
    ],
    contact: [
      { id: createId(), label: 'Email', link: 'mailto:info@example.com' },
      { id: createId(), label: 'Discord', link: '#' },
      { id: createId(), label: 'Twitter', link: '#' },
    ],
  },
  showSocials: true,
});

const getDefaultRegistrationSettings = () => ({
  title: 'Doe mee aan Winter Championship',
  subtitle: 'Inschrijven',
  description: 'Registratie sluit op 10 januari 2026. Wees er snel bij!',
  buttonText: 'Schrijf team in',
  formFields: {
    teamName: { enabled: true, label: 'Teamnaam', placeholder: 'Voer je teamnaam in' },
    teamTag: { enabled: true, label: 'Team Tag', placeholder: 'bijv. WC26' },
    captainName: { enabled: true, label: 'Captain Naam', placeholder: 'Volledige naam' },
    captainEmail: { enabled: true, label: 'Captain Email', placeholder: 'email@voorbeeld.nl' },
  },
  fontSizes: {
    title: 36,
    subtitle: 16,
    description: 14,
    button: 16,
    label: 14,
  },
  colors: {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    descriptionColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    inputBackground: '#05060D',
    inputBorder: '#755DFF',
    inputText: '#FFFFFF',
    labelColor: '#FFFFFF',
    buttonBackground: '#755DFF',
    buttonText: '#FFFFFF',
    buttonHover: '#8B6FFF',
  },
});

const resetRegistrationFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
    description: 14,
    button: 16,
    label: 14,
  };
};

const resetRegistrationColors = () => {
  return {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    descriptionColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    inputBackground: '#05060D',
    inputBorder: '#755DFF',
    inputText: '#FFFFFF',
    labelColor: '#FFFFFF',
    buttonBackground: '#755DFF',
    buttonText: '#FFFFFF',
    buttonHover: '#8B6FFF',
  };
};

const getDefaultTeamsSettings = () => ({
  title: 'Geregistreerde Teams',
  subtitle: 'Deelnemers',
  teams: [] as Array<{ id: string; initials: string; name: string; tag: string; logoUrl: string; players: Array<{ id: string; name: string; avatarUrl: string }> }>,
  numberOfTeams: 4,
  playersPerTeam: 3,
  columns: 4,
  fontSizes: {
    title: 36,
    subtitle: 16,
    teamName: 20,
    teamTag: 14,
    playerName: 14,
  },
  colors: {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    initialsBackground: '#755DFF',
    initialsText: '#FFFFFF',
    teamNameColor: '#FFFFFF',
    teamTagColor: '#FFFFFF',
    playerNameColor: '#FFFFFF',
  },
});

const resetTeamsFontSizes = () => {
  return {
    title: 36,
    subtitle: 16,
    teamName: 20,
    teamTag: 14,
    playerName: 14,
  };
};

const resetTeamsColors = () => {
  return {
    backgroundColor: '#05060D',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    cardBackground: '#11132A',
    cardBorder: '#755DFF',
    initialsBackground: '#755DFF',
    initialsText: '#FFFFFF',
    teamNameColor: '#FFFFFF',
    teamTagColor: '#FFFFFF',
    playerNameColor: '#FFFFFF',
  };
};

const getDefaultUploads = (): UploadItem[] =>
  DEFAULT_UPLOADS.map((upload) => ({ ...upload, usedIn: [...upload.usedIn] }));

const getDefaultComponentOrder = () => COMPONENTS.map((comp) => comp.id);

const getDefaultComponentVisibility = () =>
  COMPONENTS.reduce((acc, comp) => {
    acc[comp.id] = false;
    return acc;
  }, {} as Record<string, boolean>);

interface HeadingTextProps {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}

interface BodyTextProps {
  children: ReactNode;
  variant?: BodyVariant;
  as?: TextElementTag;
  className?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}

// Back button component
function BackButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-x-1 cursor-pointer"
    >
      <svg 
        className={`w-5 h-5 text-white transition-all duration-300 ${isHovered ? 'transform -translate-x-1' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-300">
        Terug
      </span>
    </button>
  );
}

export default function CustomTemplatePage() {
  const router = useRouter();
  const [componentOrder, setComponentOrder] = useState<string[]>(() => getDefaultComponentOrder());
  const [componentState, setComponentState] = useState<Record<string, boolean>>(() => getDefaultComponentVisibility());
  const [activeComponent, setActiveComponent] = useState<string>('navigation');
  const [isHydrated, setIsHydrated] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [navFormat, setNavFormat] = useState<string>('default');
  const [activeTab, setActiveTab] = useState<EditorTab>('components');
  const [baseColors, setBaseColors] = useState<Record<BaseColorKey, string>>(() => ({ ...DEFAULT_BASE_COLORS }));
  const [colorPalette, setColorPalette] = useState<Record<ThemeColorKey, string>>(() => generateColorPalette(DEFAULT_BASE_COLORS));
  const colorPaletteRef = useRef(colorPalette);
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OVERLAY_OPACITY);
  const [copiedColorKey, setCopiedColorKey] = useState<BaseColorKey | null>(null);
  const navigationLogoInputRef = useRef<HTMLInputElement | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const heroBackgroundImageInputRef = useRef<HTMLInputElement | null>(null);
  const aboutImageInputRef = useRef<HTMLInputElement | null>(null);
  const sponsorLogoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const teamLogoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const playerAvatarInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const footerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [fontSettings, setFontSettings] = useState<FontSettings>(() => getDefaultFontSettings());
  const [uploads, setUploads] = useState<UploadItem[]>(() => getDefaultUploads());

  const [navigationSettings, setNavigationSettings] = useState<NavigationSettingsState>(() => getDefaultNavigationSettings());

  const [heroSettings, setHeroSettings] = useState(() => getDefaultHeroSettings());

  const [aboutSettings, setAboutSettings] = useState(() => getDefaultAboutSettings());

  const [programSettings, setProgramSettings] = useState(() => getDefaultProgramSettings());

  const [bracketSettings, setBracketSettings] = useState(() => getDefaultBracketSettings());

  const [groupStageSettings, setGroupStageSettings] = useState(() => getDefaultGroupStageSettings());
  const [statsSettings, setStatsSettings] = useState(() => getDefaultStatsSettings());
  const [faqSettings, setFaqSettings] = useState(() => getDefaultFAQSettings());
  const [expandedStatsSections, setExpandedStatsSections] = useState<Record<string, boolean>>({
    layout: true,
    text: true,
    stats: true,
    fontSizes: false,
    colors: false,
  });
  const [expandedNavSections, setExpandedNavSections] = useState<Record<string, boolean>>({
    format: true,
    logo: true,
    menu: true,
    style: false,
    cta: false,
  });
  const [expandedHeroSections, setExpandedHeroSections] = useState<Record<string, boolean>>({
    template: true,
    content: true,
    image: true,
    style: false,
  });
  const [expandedAboutSections, setExpandedAboutSections] = useState<Record<string, boolean>>({
    layout: true,
    content: true,
    image: true,
    style: false,
  });
  const [expandedProgramSections, setExpandedProgramSections] = useState<Record<string, boolean>>({
    items: true,
    layout: true,
    colors: false,
  });
  const [expandedBracketSections, setExpandedBracketSections] = useState<Record<string, boolean>>({
    source: true,
    rounds: true,
    style: false,
  });
  const [expandedTwitchSections, setExpandedTwitchSections] = useState<Record<string, boolean>>({
    settings: true,
    layout: true,
  });
  const [expandedSponsorSections, setExpandedSponsorSections] = useState<Record<string, boolean>>({
    layout: true,
    logos: true,
    layoutOptions: false,
    fontSizes: false,
    colors: false,
  });
  const [expandedSocialSections, setExpandedSocialSections] = useState<Record<string, boolean>>({
    links: true,
    style: false,
  });
  const [expandedFooterSections, setExpandedFooterSections] = useState<Record<string, boolean>>({
    template: true,
    content: true,
    links: true,
    style: false,
  });
  const [expandedFAQSections, setExpandedFAQSections] = useState<Record<string, boolean>>({
    layout: true,
    content: true,
    fontSizes: false,
    colors: false,
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const defaultSettings = getDefaultGroupStageSettings();
    defaultSettings.groups.forEach((group) => {
      initial[group.id] = true; // Start with all groups expanded
    });
    return initial;
  });
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [expandedTeamItems, setExpandedTeamItems] = useState<Record<string, boolean>>({});
  const [expandedRegistrationSections, setExpandedRegistrationSections] = useState<Record<string, boolean>>({
    content: true,
    formFields: true,
    fontSizes: false,
    colors: false,
  });
  const [expandedTeamsComponentSections, setExpandedTeamsComponentSections] = useState<Record<string, boolean>>({
    content: true,
    teams: true,
    fontSizes: false,
    colors: false,
  });

  const [twitchSettings, setTwitchSettings] = useState(() => getDefaultTwitchSettings());

  const [sponsorSettings, setSponsorSettings] = useState(() => getDefaultSponsorSettings());

  const [socialSettings, setSocialSettings] = useState(() => getDefaultSocialSettings());

  const [footerSettings, setFooterSettings] = useState(() => getDefaultFooterSettings());

  const [registrationSettings, setRegistrationSettings] = useState(() => getDefaultRegistrationSettings());

  const [teamsSettings, setTeamsSettings] = useState(() => getDefaultTeamsSettings());
  const loadedFontsRef = useRef<Record<string, boolean>>({});

  // Ensure numberOfTeams and playersPerTeam are always defined
  useEffect(() => {
    setTeamsSettings((prev) => {
      if (prev.numberOfTeams === undefined || prev.playersPerTeam === undefined) {
        return {
          ...prev,
          numberOfTeams: prev.numberOfTeams ?? prev.teams.length,
          playersPerTeam: prev.playersPerTeam ?? (prev.teams[0]?.players.length ?? 3),
        };
      }
      return prev;
    });
  }, []);

  const ensureFontLoaded = useCallback((fontName: string) => {
    if (typeof document === 'undefined') {
      return;
    }
    const trimmed = fontName?.trim();
    if (!trimmed || loadedFontsRef.current[trimmed]) {
      return;
    }
    const googleConfig = GOOGLE_FONT_CONFIG[trimmed];
    if (!googleConfig) {
      loadedFontsRef.current[trimmed] = true;
      return;
    }
    if (document.querySelector(`link[data-font="${trimmed}"]`)) {
      loadedFontsRef.current[trimmed] = true;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleConfig}&display=swap`;
    link.setAttribute('data-font', trimmed);
    document.head.appendChild(link);
    loadedFontsRef.current[trimmed] = true;
  }, []);

  const HeadingText = ({ level, children, className = '', color, align, style }: HeadingTextProps) => {
    const Tag = level;
    return (
      <Tag
        className={className}
        style={{
          color: color ?? colorPalette.headingText,
          fontFamily: formatFontStack(fontSettings.headingFamily),
          fontSize: `${fontSettings.sizes[HEADING_SIZE_MAP[level]]}px`,
          fontWeight: fontSettings.weights.heading,
          lineHeight: `${fontSettings.lineHeight}%`,
          textAlign: align,
          ...style,
        }}
      >
        {children}
      </Tag>
    );
  };

  const BodyText = ({
    children,
    variant = 'body',
    as = 'p',
    className = '',
    color,
    align,
    style,
  }: BodyTextProps) => {
    const Component = as as keyof JSX.IntrinsicElements;
    return (
      <Component
        className={className}
        style={{
          color: color ?? colorPalette.bodyText,
          fontFamily: formatFontStack(fontSettings.bodyFamily),
          fontSize: `${fontSettings.sizes[BODY_SIZE_MAP[variant]]}px`,
          fontWeight: fontSettings.weights.body,
          lineHeight: `${fontSettings.lineHeight}%`,
          textAlign: align,
          ...style,
        }}
      >
        {children}
      </Component>
    );
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    ensureFontLoaded(fontSettings.headingFamily);
    ensureFontLoaded(fontSettings.bodyFamily);
  }, [fontSettings.headingFamily, fontSettings.bodyFamily, ensureFontLoaded]);

  // Ensure colorPalette is always in sync with baseColors
  useEffect(() => {
    const newPalette = generateColorPalette(baseColors);
    setColorPalette(newPalette);
    colorPaletteRef.current = newPalette;
  }, [baseColors]);

  useEffect(() => {
    const prevPalette = colorPaletteRef.current;

    setNavigationSettings((prev) => {
      let changed = false;
      const next = { ...prev };

      if (prev.backgroundColor === prevPalette.navBackground && prev.backgroundColor !== colorPalette.navBackground) {
        next.backgroundColor = colorPalette.navBackground;
        changed = true;
      }
      if (prev.textColor === prevPalette.navText && prev.textColor !== colorPalette.navText) {
        next.textColor = colorPalette.navText;
        changed = true;
      }
      if (prev.hoverColor === prevPalette.navHover && prev.hoverColor !== colorPalette.navHover) {
        next.hoverColor = colorPalette.navHover;
        changed = true;
      }
      if (prev.activeColor === prevPalette.primary && prev.activeColor !== colorPalette.primary) {
        next.activeColor = colorPalette.primary;
        changed = true;
      }

      const nextCta = { ...next.cta };
      let ctaChanged = false;
      if (nextCta.background === prevPalette.buttonPrimary && nextCta.background !== colorPalette.buttonPrimary) {
        nextCta.background = colorPalette.buttonPrimary;
        ctaChanged = true;
      }
      if (nextCta.textColor === prevPalette.buttonPrimaryText && nextCta.textColor !== colorPalette.buttonPrimaryText) {
        nextCta.textColor = colorPalette.buttonPrimaryText;
        ctaChanged = true;
      }
      if (ctaChanged) {
        next.cta = nextCta;
        changed = true;
      }

      return changed ? next : prev;
    });

    setHeroSettings((prev) => {
      let changed = false;
      const next = { ...prev };

      if (prev.overlayColor === prevPalette.overlay && prev.overlayColor !== colorPalette.overlay) {
        next.overlayColor = colorPalette.overlay;
        changed = true;
      }

      const nextPrimary = { ...next.primaryButton };
      let primaryChanged = false;
      if (nextPrimary.background === prevPalette.buttonPrimary && nextPrimary.background !== colorPalette.buttonPrimary) {
        nextPrimary.background = colorPalette.buttonPrimary;
        primaryChanged = true;
      }
      if (nextPrimary.textColor === prevPalette.buttonPrimaryText && nextPrimary.textColor !== colorPalette.buttonPrimaryText) {
        nextPrimary.textColor = colorPalette.buttonPrimaryText;
        primaryChanged = true;
      }
      if (primaryChanged) {
        next.primaryButton = nextPrimary;
        changed = true;
      }

      const nextSecondary = { ...next.secondaryButton };
      let secondaryChanged = false;
      if (nextSecondary.borderColor === prevPalette.buttonSecondary && nextSecondary.borderColor !== colorPalette.buttonSecondary) {
        nextSecondary.borderColor = colorPalette.buttonSecondary;
        secondaryChanged = true;
      }
      if (nextSecondary.textColor === prevPalette.buttonSecondaryText && nextSecondary.textColor !== colorPalette.buttonSecondaryText) {
        nextSecondary.textColor = colorPalette.buttonSecondaryText;
        secondaryChanged = true;
      }
      if (secondaryChanged) {
        next.secondaryButton = nextSecondary;
        changed = true;
      }

      return changed ? next : prev;
    });

    setAboutSettings((prev) => {
      if (prev.backgroundColor === prevPalette.sectionBackground && prev.backgroundColor !== colorPalette.sectionBackground) {
        return { ...prev, backgroundColor: colorPalette.sectionBackground };
      }
      return prev;
    });

    setProgramSettings((prev) => {
      let changed = false;
      const next = { ...prev };
      if (prev.backgroundColor === prevPalette.sectionBackground && prev.backgroundColor !== colorPalette.sectionBackground) {
        next.backgroundColor = colorPalette.sectionBackground;
        changed = true;
      }
      if (prev.borderColor === prevPalette.border && prev.borderColor !== colorPalette.border) {
        next.borderColor = colorPalette.border;
        changed = true;
      }
      if (prev.timeColor === prevPalette.primary && prev.timeColor !== colorPalette.primary) {
        next.timeColor = colorPalette.primary;
        changed = true;
      }
      return changed ? next : prev;
    });

    setBracketSettings((prev) => {
      let changed = false;
      const next = { ...prev, style: { ...prev.style } };
      if (prev.style.lineColor === prevPalette.primary && prev.style.lineColor !== colorPalette.primary) {
        next.style.lineColor = colorPalette.primary;
        changed = true;
      }
      if (prev.style.teamBlockColor === prevPalette.cardBackground && prev.style.teamBlockColor !== colorPalette.cardBackground) {
        next.style.teamBlockColor = colorPalette.cardBackground;
        changed = true;
      }
      return changed ? next : prev;
    });

    setTwitchSettings((prev) => {
      if (prev.background === prevPalette.sectionBackground && prev.background !== colorPalette.sectionBackground) {
        return { ...prev, background: colorPalette.sectionBackground };
      }
      return prev;
    });

    setSponsorSettings((prev) => {
      if (prev.backgroundColor === prevPalette.sectionBackground && prev.backgroundColor !== colorPalette.sectionBackground) {
        return { ...prev, backgroundColor: colorPalette.sectionBackground };
      }
      return prev;
    });

    setFooterSettings((prev) => {
      let changed = false;
      const next = { ...prev };
      if (prev.backgroundColor === prevPalette.footerBackground && prev.backgroundColor !== colorPalette.footerBackground) {
        next.backgroundColor = colorPalette.footerBackground;
        changed = true;
      }
      if (prev.textColor === prevPalette.footerText && prev.textColor !== colorPalette.footerText) {
        next.textColor = colorPalette.footerText;
        changed = true;
      }
      return changed ? next : prev;
    });

    colorPaletteRef.current = colorPalette;
  }, [colorPalette]);

  const activeComponentLabel = useMemo(
    () => COMPONENTS.find((comp) => comp.id === activeComponent)?.label || 'Navigation',
    [activeComponent]
  );


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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Handle upload item drop on image field
    if (active.id.toString().startsWith('upload-') && over) {
      const uploadId = active.id.toString().replace('upload-', '');
      const upload = uploads.find(u => u.id === uploadId);
      
      if (upload && over.data.current?.type === 'image-field') {
        const onChange = over.data.current.onChange as (url: string) => void;
        if (onChange) {
          onChange(upload.url);
          
          // Detect component name from drop zone ID
          let componentName = activeComponentLabel;
          const dropZoneId = over.id.toString();
          if (dropZoneId.includes('navigation')) {
            componentName = 'Navigation';
          } else if (dropZoneId.includes('hero')) {
            componentName = 'Hero';
          } else if (dropZoneId.includes('about')) {
            componentName = 'About';
          } else if (dropZoneId.includes('footer')) {
            componentName = 'Footer';
          }
          
          // Update usedIn for the upload
          setUploads((prev) =>
            prev.map((item) => {
              if (item.id === uploadId) {
                const usedIn = item.usedIn.includes(componentName) 
                  ? item.usedIn 
                  : [...item.usedIn, componentName];
                return { ...item, usedIn };
              }
              return item;
            })
          );
        }
      }
    }

    // Handle component reordering
    if (over && active.id !== over.id && typeof active.id === 'string' && typeof over.id === 'string') {
      if (!active.id.toString().startsWith('upload-')) {
        setComponentOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex);
          }
          return items;
        });
      }
    }

    setActiveDragId(null);
  };

  const sortedComponents = useMemo(() => {
    return componentOrder
      .map(id => COMPONENTS.find(comp => comp.id === id))
      .filter((comp): comp is ComponentToggle => comp !== undefined);
  }, [componentOrder]);

  const selectedNavigationFormat = useMemo(() => {
    return NAVIGATION_FORMATS.find((format) => format.id === navFormat) ?? NAVIGATION_FORMATS[0];
  }, [navFormat]);

  const selectedHeroTemplate = useMemo(() => {
    return HERO_TEMPLATES.find((template) => template.id === heroSettings.template) ?? HERO_TEMPLATES[0];
  }, [heroSettings.template]);

  const navigationLayout = selectedNavigationFormat.layout;
  const navigationWrapperClass = navigationLayout.wrapperClass || 'items-center justify-between gap-8';
  const navigationLogoWrapperClass = navigationLayout.logoWrapperClass ?? 'justify-start';
  const navigationMenuWrapperClass = navigationLayout.menuWrapperClass ?? 'justify-center flex-1';
  const navigationMenuGapClass = navigationLayout.menuGapClass ?? 'gap-6';
  const navigationMenuLinkClass = `text-sm font-medium transition-colors hover:opacity-80 ${
    navigationLayout.uppercaseLinks ? 'uppercase tracking-[0.2em] text-xs' : ''
  }`;
  const shouldShowNavigationCta = navigationSettings.cta.enabled && navigationLayout.ctaVisibility !== 'force-hide';
  const isStackedNavigationCta = navigationLayout.ctaPlacement === 'stacked';
  const navigationCtaElement = (
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
  );

  const componentOrderMap = useMemo(() => {
    const orderMap: Record<string, number> = {};
    componentOrder.forEach((id, index) => {
      orderMap[id] = index;
    });
    return orderMap;
  }, [componentOrder]);

  const headingFontSelectValue = HEADING_FONT_OPTIONS.includes(fontSettings.headingFamily) ? fontSettings.headingFamily : 'custom';
  const bodyFontSelectValue = BODY_FONT_OPTIONS.includes(fontSettings.bodyFamily) ? fontSettings.bodyFamily : 'custom';

  const setBaseColorsAndPalette = (updater: (prev: Record<BaseColorKey, string>) => Record<BaseColorKey, string>) => {
    setBaseColors((prev) => {
      const next = updater(prev);
      const palette = generateColorPalette(next);
      setColorPalette(palette);
      colorPaletteRef.current = palette;
      return next;
    });
  };

  const resetFontSizes = () => {
    setFontSettings((prev) => ({
      ...prev,
      sizes: { ...DEFAULT_FONT_SETTINGS.sizes },
    }));
  };

  const normalizeColorInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')) {
      return trimmed;
    }
    const hexCandidate = trimmed.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    return hexCandidate ? `#${hexCandidate}` : trimmed;
  };

  const handleBaseColorChange = (key: BaseColorKey, value: string) => {
    const normalized = normalizeColorInput(value);
    if (!normalized) return;
    setBaseColorsAndPalette((prev) => ({
      ...prev,
      [key]: normalized,
    }));
  };

  const handleBaseColorTextInput = (key: BaseColorKey, value: string) => {
    setBaseColorsAndPalette((prev) => ({
      ...prev,
      [key]: normalizeColorInput(value),
    }));
  };

  const resetBaseColorValue = (key: BaseColorKey) => {
    setBaseColorsAndPalette((prev) => ({
      ...prev,
      [key]: DEFAULT_BASE_COLORS[key],
    }));
  };

  const baseColorIsDefault = (key: BaseColorKey) => baseColors[key] === DEFAULT_BASE_COLORS[key];

  const copyBaseColorValue = async (key: BaseColorKey) => {
    const colorValue = baseColors[key];
    if (!colorValue || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(colorValue);
      setCopiedColorKey(key);
      setTimeout(() => {
        setCopiedColorKey((current) => (current === key ? null : current));
      }, 1500);
    } catch (error) {
      console.warn('Failed to copy color value:', error);
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((preset) => preset.id === presetId);
    if (!preset) return;
    setBaseColorsAndPalette((prev) => ({
      ...prev,
      ...preset.baseColors,
    }));
  };

  const resetColors = () => {
    setBaseColorsAndPalette(() => ({ ...DEFAULT_BASE_COLORS }));
  };

  const resetAllSettings = () => {
    setComponentOrder(getDefaultComponentOrder());
    setComponentState(getDefaultComponentVisibility());
    setActiveComponent('navigation');
    setNavFormat('default');
    setBaseColorsAndPalette(() => ({ ...DEFAULT_BASE_COLORS }));
    setOverlayOpacity(DEFAULT_OVERLAY_OPACITY);
    setFontSettings(getDefaultFontSettings());
    setUploads(getDefaultUploads());
    setNavigationSettings(getDefaultNavigationSettings());
    setHeroSettings(getDefaultHeroSettings());
    setAboutSettings(getDefaultAboutSettings());
    setProgramSettings(getDefaultProgramSettings());
    setBracketSettings(getDefaultBracketSettings());
    setGroupStageSettings(getDefaultGroupStageSettings());
    setStatsSettings(getDefaultStatsSettings());
    setFaqSettings(getDefaultFAQSettings());
    setTwitchSettings(getDefaultTwitchSettings());
    setSponsorSettings(getDefaultSponsorSettings());
    setSocialSettings(getDefaultSocialSettings());
    setFooterSettings(getDefaultFooterSettings());
    setCopiedColorKey(null);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      callback(reader.result as string);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const mergeNavigationSettings = (
    prev: NavigationSettingsState,
    overrides?: NavigationSettingsOverrides
  ): NavigationSettingsState => {
    if (!overrides) return prev;
    return {
      ...prev,
      ...overrides,
      padding: overrides.padding ? { ...prev.padding, ...overrides.padding } : prev.padding,
      cta: overrides.cta ? { ...prev.cta, ...overrides.cta } : prev.cta,
    };
  };

  const handleNavigationFormatSelect = (formatId: string) => {
    setNavFormat(formatId);
    const preset = NAVIGATION_FORMATS.find((format) => format.id === formatId);
    if (preset?.settings) {
      setNavigationSettings((prev) => mergeNavigationSettings(prev, preset.settings));
    }
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

  const updateFAQItem = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqSettings((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addFAQItem = () => {
    setFaqSettings((prev) => ({
      ...prev,
      items: [...prev.items, { id: createId(), question: 'Nieuwe vraag?', answer: 'Antwoord hier...' }],
    }));
  };

  const removeFAQItem = (id: string) => {
    setFaqSettings((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const moveFAQItem = (from: number, to: number) => {
    setFaqSettings((prev) => ({
      ...prev,
      items: moveItem(prev.items, from, to),
    }));
  };

  const updateTeam = (id: string, field: 'initials' | 'name' | 'tag' | 'logoUrl', value: string) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.map((team) => (team.id === id ? { ...team, [field]: value } : team)),
    }));
  };

  const addTeam = () => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: [
        ...prev.teams,
        { 
          id: createId(), 
          initials: 'TM', 
          name: 'Nieuw Team', 
          tag: 'NEW', 
          logoUrl: '',
          players: [
            { id: createId(), name: 'Player 1', avatarUrl: '' },
            { id: createId(), name: 'Player 2', avatarUrl: '' },
            { id: createId(), name: 'Player 3', avatarUrl: '' }
          ] 
        },
      ],
    }));
  };

  const removeTeam = (id: string) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team.id !== id),
    }));
    // Clean up refs and state
    delete teamLogoInputRefs.current[id];
    setExpandedTeamItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Clean up player avatar refs for this team
    const team = teamsSettings.teams.find((t) => t.id === id);
    if (team) {
      team.players.forEach((player) => {
        delete playerAvatarInputRefs.current[`${id}-${player.id}`];
      });
    }
  };

  const moveTeam = (from: number, to: number) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: moveItem(prev.teams, from, to),
    }));
  };

  const updateTeamPlayer = (teamId: string, playerId: string, field: 'name' | 'avatarUrl', value: string) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              players: team.players.map((player) => (player.id === playerId ? { ...player, [field]: value } : player)),
            }
          : team
      ),
    }));
  };

  const addTeamPlayer = (teamId: string) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId 
          ? { 
              ...team, 
              players: [...team.players, { id: createId(), name: 'Nieuwe speler', avatarUrl: '' }] 
            } 
          : team
      ),
    }));
  };

  const removeTeamPlayer = (teamId: string, playerId: string) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId 
          ? { ...team, players: team.players.filter((player) => player.id !== playerId) } 
          : team
      ),
    }));
    // Clean up player avatar ref
    delete playerAvatarInputRefs.current[`${teamId}-${playerId}`];
  };

  const moveTeamPlayer = (teamId: string, from: number, to: number) => {
    setTeamsSettings((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              players: moveItem(team.players, from, to),
            }
          : team
      ),
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

  const updateFooterLinks = (section: 'tournament' | 'info' | 'contact', id: string, field: 'label' | 'link', value: string) => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: prev.links[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const addFooterLink = (section: 'tournament' | 'info' | 'contact') => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: [...prev.links[section], { id: createId(), label: 'Nieuwe link', link: '#' }],
      },
    }));
  };

  const removeFooterLink = (section: 'tournament' | 'info' | 'contact', id: string) => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: prev.links[section].filter((link) => link.id !== id),
      },
    }));
  };

  const moveFooterLink = (section: 'tournament' | 'info' | 'contact', from: number, to: number) => {
    setFooterSettings((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: moveItem(prev.links[section], from, to),
      },
    }));
  };

  const updateGroupStageGroup = (groupId: string, field: 'name', value: string) => {
    setGroupStageSettings((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (group.id === groupId ? { ...group, [field]: value } : group)),
    }));
  };

  const updateGroupStageTeam = (groupId: string, teamId: string, field: 'seed' | 'name' | 'tag', value: string) => {
    setGroupStageSettings((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              teams: group.teams.map((team) => (team.id === teamId ? { ...team, [field]: value } : team)),
            }
          : group
      ),
    }));
  };

  const handleGroupStageNumberOfGroupsChange = (value: number) => {
    setGroupStageSettings((prev) => {
      const newValue = Math.max(1, Math.min(8, value));
      if (newValue > prev.groups.length) {
        const newGroups = Array.from({ length: newValue - prev.groups.length }, (_, i) => {
          const groupName = String.fromCharCode(65 + prev.groups.length + i);
          return {
            id: createId(),
            name: groupName,
            teams: Array.from({ length: prev.teamsPerGroup }, (_, j) => ({
              id: createId(),
              seed: `#${j + 1}`,
              name: `Team ${groupName}${j + 1}`,
              tag: `T${groupName}${j + 1}`,
            })),
          };
        });
        // Auto-expand new groups
        setExpandedGroups((prevExpanded) => {
          const updated = { ...prevExpanded };
          newGroups.forEach((group) => {
            updated[group.id] = true;
          });
          return updated;
        });
        return {
          ...prev,
          numberOfGroups: newValue,
          groups: [...prev.groups, ...newGroups],
        };
      } else if (newValue < prev.groups.length) {
        // Remove expanded state for removed groups
        setExpandedGroups((prevExpanded) => {
          const updated = { ...prevExpanded };
          const removedGroups = prev.groups.slice(newValue);
          removedGroups.forEach((group) => {
            delete updated[group.id];
          });
          return updated;
        });
        return {
          ...prev,
          numberOfGroups: newValue,
          groups: prev.groups.slice(0, newValue),
        };
      }
      return { ...prev, numberOfGroups: newValue };
    });
  };

  const handleGroupStageTeamsPerGroupChange = (value: number) => {
    setGroupStageSettings((prev) => {
      const newValue = Math.max(2, Math.min(8, value));
      return {
        ...prev,
        teamsPerGroup: newValue,
        groups: prev.groups.map((group) => {
          if (group.teams.length < newValue) {
            const newTeams = Array.from({ length: newValue - group.teams.length }, (_, i) => ({
              id: createId(),
              seed: `#${group.teams.length + i + 1}`,
              name: `Team ${group.name}${group.teams.length + i + 1}`,
              tag: `T${group.name}${group.teams.length + i + 1}`,
            }));
            return { ...group, teams: [...group.teams, ...newTeams] };
          } else if (group.teams.length > newValue) {
            return { ...group, teams: group.teams.slice(0, newValue) };
          }
          return group;
        }),
      };
    });
  };

  const addGroupStageTeam = (groupId: string) => {
    setGroupStageSettings((prev) => ({
      ...prev,
      teamsPerGroup: prev.teamsPerGroup + 1,
      groups: prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              teams: [
                ...group.teams,
                {
                  id: createId(),
                  seed: `#${group.teams.length + 1}`,
                  name: `Team ${group.name}${group.teams.length + 1}`,
                  tag: `T${group.name}${group.teams.length + 1}`,
                },
              ],
            }
          : group
      ),
    }));
  };

  const removeGroupStageTeam = (groupId: string, teamId: string) => {
    setGroupStageSettings((prev) => {
      const updatedGroups = prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              teams: group.teams.filter((team) => team.id !== teamId),
            }
          : group
      );
      const minTeams = Math.min(...updatedGroups.map((g) => g.teams.length));
      return {
        ...prev,
        teamsPerGroup: Math.max(2, minTeams),
        groups: updatedGroups,
      };
    });
  };

  const renderCollapsibleSection = (
    id: string,
    title: string,
    isExpanded: boolean,
    onToggle: () => void,
    children: React.ReactNode,
    badge?: string
  ) => (
    <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden min-w-0">
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition min-w-0 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold text-white truncate">{title}</span>
          {badge && <span className="text-xs text-white/40 flex-shrink-0">({badge})</span>}
        </div>
      </div>
      {isExpanded && <div className="px-4 pb-4 min-w-0 overflow-x-hidden">{children}</div>}
    </div>
  );

  const renderSettingsPanel = () => {
    const panelClass = 'flex-1 px-6 py-6 space-y-3 overflow-x-hidden min-w-0';
    switch (activeComponent) {
      case 'navigation':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'nav-format',
              'Format',
              expandedNavSections.format,
              () => setExpandedNavSections((prev) => ({ ...prev, format: !prev.format })),
              <div className="space-y-2">
                {NAVIGATION_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    aria-pressed={navFormat === format.id}
                    onClick={() => handleNavigationFormatSelect(format.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all space-y-1 ${
                      navFormat === format.id
                        ? 'border-[#755DFF] bg-[#1a1d36] shadow-[0_0_20px_rgba(117,93,255,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{format.label}</p>
                        <p className="text-xs uppercase tracking-widest text-white/40">{format.subLabel}</p>
                      </div>
                      {navFormat === format.id && <span className="text-xs text-[#B8A4FF]">Actief</span>}
                    </div>
                    <p className="text-xs text-white/60">{format.description}</p>
                  </button>
                ))}
              </div>
            )}

            {renderCollapsibleSection(
              'nav-logo',
              'Logo',
              expandedNavSections.logo,
              () => setExpandedNavSections((prev) => ({ ...prev, logo: !prev.logo })),
              <DroppableImageField
              id="navigation-logo"
              value={navigationSettings.logoUrl}
              onChange={(url) => setNavigationSettings((prev) => ({ ...prev, logoUrl: url }))}
              label="Logo"
            >
              <div className="rounded-xl border border-white/10 bg-[#0E1020] p-3 space-y-2 min-w-0">
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigationLogoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('uploads')}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                  >
                    Library
                  </button>
                  {navigationSettings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setNavigationSettings((prev) => ({ ...prev, logoUrl: '' }))}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={navigationSettings.logoUrl}
                  onChange={(e) => setNavigationSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="URL"
                  className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#11132A] border border-white/10 text-xs"
                />
              </div>
              <input
                ref={navigationLogoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, (url) => setNavigationSettings((prev) => ({ ...prev, logoUrl: url })))}
              />
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
              </DroppableImageField>
            )}

            {renderCollapsibleSection(
              'nav-menu',
              'Menu-items',
              expandedNavSections.menu,
              () => setExpandedNavSections((prev) => ({ ...prev, menu: !prev.menu })),
              <div className="space-y-3">
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
              </div>,
              `${navigationSettings.menuItems.length} items`
            )}

            {renderCollapsibleSection(
              'nav-style',
              'Stijl',
              expandedNavSections.style,
              () => setExpandedNavSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <ColorInputField
                    label="Tekstkleur"
                    value={navigationSettings.textColor}
                    onChange={(value) => setNavigationSettings((prev) => ({ ...prev, textColor: value }))}
                  />
                  <ColorInputField
                    label="Hover kleur"
                    value={navigationSettings.hoverColor}
                    onChange={(value) => setNavigationSettings((prev) => ({ ...prev, hoverColor: value }))}
                  />
                  <ColorInputField
                    label="Actieve kleur"
                    value={navigationSettings.activeColor}
                    onChange={(value) => setNavigationSettings((prev) => ({ ...prev, activeColor: value }))}
                  />
                  <ColorInputField
                    label="Achtergrond"
                    value={navigationSettings.backgroundColor}
                    onChange={(value) => setNavigationSettings((prev) => ({ ...prev, backgroundColor: value }))}
                  />
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
              </div>
            )}

            {renderCollapsibleSection(
              'nav-cta',
              'CTA-knop',
              expandedNavSections.cta,
              () => setExpandedNavSections((prev) => ({ ...prev, cta: !prev.cta })),
              <div className="space-y-3">
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
                  <div className="space-y-2">
                    <ColorInputField
                      label="Kleur"
                      value={navigationSettings.cta.background}
                      onChange={(value) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, background: value } }))}
                    />
                    <ColorInputField
                      label="Tekstkleur"
                      value={navigationSettings.cta.textColor}
                      onChange={(value) => setNavigationSettings((prev) => ({ ...prev, cta: { ...prev.cta, textColor: value } }))}
                    />
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
              </div>
            )}
          </div>
        );
      case 'hero':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'hero-template',
              'Templates',
              expandedHeroSections.template,
              () => setExpandedHeroSections((prev) => ({ ...prev, template: !prev.template })),
              <div className="space-y-2">
                {HERO_TEMPLATES.map((template) => {
                  const isSelected = heroSettings.template === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleHeroTemplateChange(template.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all bg-[#11132A] ${
                        isSelected
                          ? 'border-[#755DFF] shadow-[0_0_25px_rgba(117,93,255,0.3)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <p className="font-semibold flex items-center justify-between">
                        {template.label}
                        {template.requiresImage && (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 border border-white/20 px-2 py-0.5 rounded-full">
                            Image
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {renderCollapsibleSection(
              'hero-content',
              'Content',
              expandedHeroSections.content,
              () => setExpandedHeroSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-2">
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
              </div>
            )}

            {renderCollapsibleSection(
              'hero-image',
              'Afbeelding',
              expandedHeroSections.image,
              () => setExpandedHeroSections((prev) => ({ ...prev, image: !prev.image })),
              <div className="space-y-3">
                {selectedHeroTemplate.requiresImage ? (
                  <DroppableImageField
                    id="hero-image"
                    value={heroSettings.heroImageUrl}
                    onChange={(url) => setHeroSettings((prev) => ({ ...prev, heroImageUrl: url }))}
                    label="Hero afbeelding"
                  >
                    <div className="rounded-xl border border-white/10 bg-[#0E1020] p-3 space-y-2 min-w-0">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => heroImageInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('uploads')}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                        >
                          Library
                        </button>
                        {heroSettings.heroImageUrl && (
                          <button
                            type="button"
                            onClick={() => setHeroSettings((prev) => ({ ...prev, heroImageUrl: '' }))}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={heroSettings.heroImageUrl}
                        onChange={(e) => setHeroSettings((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                        placeholder="URL"
                        className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#11132A] border border-white/10 text-xs"
                      />
                    </div>
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setHeroSettings((prev) => ({ ...prev, heroImageUrl: url })))}
                    />
                  </DroppableImageField>
                ) : (
                  <DroppableImageField
                    id="hero-background-image"
                    value={heroSettings.backgroundImageUrl}
                    onChange={(url) => setHeroSettings((prev) => ({ ...prev, backgroundImageUrl: url }))}
                    label="Achtergrond afbeelding"
                  >
                    <div className="rounded-xl border border-white/10 bg-[#0E1020] p-3 space-y-2 min-w-0">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => heroBackgroundImageInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('uploads')}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                        >
                          Library
                        </button>
                        {heroSettings.backgroundImageUrl && (
                          <button
                            type="button"
                            onClick={() => setHeroSettings((prev) => ({ ...prev, backgroundImageUrl: '' }))}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={heroSettings.backgroundImageUrl}
                        onChange={(e) => setHeroSettings((prev) => ({ ...prev, backgroundImageUrl: e.target.value }))}
                        placeholder="URL"
                        className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#11132A] border border-white/10 text-xs"
                      />
                    </div>
                    <input
                      ref={heroBackgroundImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setHeroSettings((prev) => ({ ...prev, backgroundImageUrl: url })))}
                    />
                  </DroppableImageField>
                )}
              </div>
            )}

            {renderCollapsibleSection(
              'hero-style',
              'Stijl',
              expandedHeroSections.style,
              () => setExpandedHeroSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-3">
                <div className="space-y-3 text-xs text-white/60">
                  <ColorInputField
                    label="Overlay kleur"
                    value={heroSettings.overlayColor}
                    onChange={(value) => setHeroSettings((prev) => ({ ...prev, overlayColor: value }))}
                  />
                  <label>
                    Opacity ({heroSettings.overlayOpacity}%)
                    <input type="range" min={0} max={100} value={heroSettings.overlayOpacity} onChange={(e) => setHeroSettings((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) }))} />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" checked={heroSettings.blurOverlay} onChange={(e) => setHeroSettings((prev) => ({ ...prev, blurOverlay: e.target.checked }))} />
                  Blur overlay
                </label>
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-white/50">Uitlijning</h4>
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
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-white/50">Knoppen</h4>
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
                      <div className="space-y-2">
                        <ColorInputField
                          label="Achtergrond"
                          value={heroSettings.primaryButton.background}
                          onChange={(value) =>
                            setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, background: value } }))
                          }
                        />
                        <ColorInputField
                          label="Tekstkleur"
                          value={heroSettings.primaryButton.textColor}
                          onChange={(value) =>
                            setHeroSettings((prev) => ({ ...prev, primaryButton: { ...prev.primaryButton, textColor: value } }))
                          }
                        />
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
                      <div className="space-y-2">
                        <ColorInputField
                          label="Randkleur"
                          value={heroSettings.secondaryButton.borderColor}
                          onChange={(value) =>
                            setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, borderColor: value } }))
                          }
                        />
                        <ColorInputField
                          label="Tekstkleur"
                          value={heroSettings.secondaryButton.textColor}
                          onChange={(value) =>
                            setHeroSettings((prev) => ({ ...prev, secondaryButton: { ...prev.secondaryButton, textColor: value } }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'about':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'about-layout',
              'Layouts',
              expandedAboutSections.layout,
              () => setExpandedAboutSections((prev) => ({ ...prev, layout: !prev.layout })),
              <div className="space-y-2">
                {ABOUT_LAYOUT_OPTIONS.map((layout) => {
                  const isSelected = aboutSettings.layout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => setAboutSettings((prev) => ({ ...prev, layout: layout.id }))}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all bg-[#11132A] ${
                        isSelected
                          ? 'border-[#755DFF] shadow-[0_0_25px_rgba(117,93,255,0.3)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{layout.label}</p>
                          <p className="text-xs text-white/50 mt-1">{layout.description}</p>
                        </div>
                        {isSelected && <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8A4FF]">Actief</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {renderCollapsibleSection(
              'about-image',
              'Afbeelding',
              expandedAboutSections.image,
              () => setExpandedAboutSections((prev) => ({ ...prev, image: !prev.image })),
              <div className="space-y-3">
                <DroppableImageField
                  id="about-image"
                  value={aboutSettings.imageUrl}
                  onChange={(url) => setAboutSettings((prev) => ({ ...prev, imageUrl: url }))}
                  label=""
                >
                  <div className="rounded-xl border border-white/10 bg-[#0E1020] p-3 space-y-2 min-w-0">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => aboutImageInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('uploads')}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                      >
                        Library
                      </button>
                      {aboutSettings.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setAboutSettings((prev) => ({ ...prev, imageUrl: '' }))}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={aboutSettings.imageUrl}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#11132A] border border-white/10 text-xs"
                      placeholder="URL"
                    />
                    <input
                      ref={aboutImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setAboutSettings((prev) => ({ ...prev, imageUrl: url })))}
                    />
                  </div>
                </DroppableImageField>
                <div className="space-y-2 text-xs text-white/60">
                  <label className="flex flex-col gap-1">
                    Ronde hoeken ({aboutSettings.imageRadius}px)
                    <input
                      type="range"
                      min={0}
                      max={64}
                      value={aboutSettings.imageRadius}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageRadius: Number(e.target.value) }))}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={aboutSettings.imageShadow}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, imageShadow: e.target.checked }))}
                    />
                    Shadow effect
                  </label>
                </div>
              </div>
            )}

            {renderCollapsibleSection(
              'about-content',
              'Content',
              expandedAboutSections.content,
              () => setExpandedAboutSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#11132A]/40 p-4 space-y-3">
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Subtitel
                    <input
                      value={aboutSettings.subtitle}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                      placeholder="Subtitel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Titel
                    <input
                      value={aboutSettings.title}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                      placeholder="Titel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Beschrijving
                    <textarea
                      value={aboutSettings.paragraph}
                      onChange={(e) => setAboutSettings((prev) => ({ ...prev, paragraph: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                      placeholder="Paragraaf"
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-white/50">Bullet points</h4>
                  <div className="space-y-3">
                    {aboutSettings.bullets.map((bullet, index) => (
                      <div key={bullet.id} className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>Bullet #{index + 1}</span>
                          <button
                            onClick={() => removeAboutItem('bullets', bullet.id)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70"
                          >
                            Verwijder
                          </button>
                        </div>
                        <label className="text-xs text-white/60 flex flex-col gap-1">
                          Tekst
                          <input
                            value={bullet.text}
                            onChange={(e) => updateAboutList('bullets', bullet.id, 'text', e.target.value)}
                            className="px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          />
                        </label>
                      </div>
                    ))}
                    <button
                      onClick={() => addAboutItem('bullets')}
                      className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                    >
                      + Punt toevoegen
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-white/50">Knoppen</h4>
                  <div className="space-y-3">
                    {aboutSettings.buttons.map((button, index) => (
                      <div key={button.id} className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Knop #{index + 1}</span>
                      <button
                        onClick={() => removeAboutItem('buttons', button.id)}
                        className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70"
                      >
                        Verwijder
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Tekst
                  <input
                    value={button.label}
                    onChange={(e) => updateAboutList('buttons', button.id, 'label', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                    placeholder="Tekst"
                  />
                      </label>
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Link
                  <input
                    value={button.link}
                    onChange={(e) => updateAboutList('buttons', button.id, 'link', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          placeholder="https://"
                  />
                      </label>
                    </div>
                </div>
              ))}
                <button
                  onClick={() => addAboutItem('buttons')}
                  className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                >
                  + Knop toevoegen
                </button>
                  </div>
                </div>
              </div>
            )}

            {renderCollapsibleSection(
              'about-style',
              'Stijl',
              expandedAboutSections.style,
              () => setExpandedAboutSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#11132A]/40 p-4 space-y-3 text-xs text-white/60">
                <ColorInputField
                  label="Achtergrondkleur"
                  value={aboutSettings.backgroundColor}
                  onChange={(value) => setAboutSettings((prev) => ({ ...prev, backgroundColor: value }))}
                />
                <label className="flex flex-col gap-1">
                Padding top ({aboutSettings.padding.top}px)
                  <input
                    type="range"
                    min={40}
                    max={160}
                    value={aboutSettings.padding.top}
                    onChange={(e) => setAboutSettings((prev) => ({ ...prev, padding: { ...prev.padding, top: Number(e.target.value) } }))}
                  />
              </label>
                <label className="flex flex-col gap-1">
                Padding bottom ({aboutSettings.padding.bottom}px)
                  <input
                    type="range"
                    min={40}
                    max={160}
                    value={aboutSettings.padding.bottom}
                    onChange={(e) => setAboutSettings((prev) => ({ ...prev, padding: { ...prev.padding, bottom: Number(e.target.value) } }))}
                  />
              </label>
              </div>
              </div>
            )}
          </div>
        );
      case 'program':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'program-items',
              'Items in schema',
              expandedProgramSections.items,
              () => setExpandedProgramSections((prev) => ({ ...prev, items: !prev.items })),
              <div className="space-y-2">
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
              </div>,
              `${programSettings.items.length} items`
            )}

            {renderCollapsibleSection(
              'program-layout',
              'Layout',
              expandedProgramSections.layout,
              () => setExpandedProgramSections((prev) => ({ ...prev, layout: !prev.layout })),
              <div className="space-y-3">
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
              </div>
            )}

            {renderCollapsibleSection(
              'program-colors',
              'Kleuren',
              expandedProgramSections.colors,
              () => setExpandedProgramSections((prev) => ({ ...prev, colors: !prev.colors })),
              <div className="space-y-3 text-xs text-white/60">
                <ColorInputField
                  label="Achtergrondkleur"
                  value={programSettings.backgroundColor}
                  onChange={(value) => setProgramSettings((prev) => ({ ...prev, backgroundColor: value }))}
                />
                <ColorInputField
                  label="Borderkleur"
                  value={programSettings.borderColor}
                  onChange={(value) => setProgramSettings((prev) => ({ ...prev, borderColor: value }))}
                />
                <ColorInputField
                  label="Tijdkleur"
                  value={programSettings.timeColor}
                  onChange={(value) => setProgramSettings((prev) => ({ ...prev, timeColor: value }))}
                />
              </div>
            )}
          </div>
        );
      case 'bracket':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'bracket-source',
              'Bron',
              expandedBracketSections.source,
              () => setExpandedBracketSections((prev) => ({ ...prev, source: !prev.source })),
              <div className="space-y-2">
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
              </div>
            )}

            {bracketSettings.source === 'manual' && renderCollapsibleSection(
              'bracket-rounds',
              'Rondes',
              expandedBracketSections.rounds,
              () => setExpandedBracketSections((prev) => ({ ...prev, rounds: !prev.rounds })),
              <div className="space-y-3">
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
              </div>,
              `${bracketSettings.rounds.length} rondes`
            )}

            {renderCollapsibleSection(
              'bracket-style',
              'Stijl',
              expandedBracketSections.style,
              () => setExpandedBracketSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-3 text-xs text-white/60">
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
              <div className="space-y-3">
                <ColorInputField
                  label="Lijn kleur"
                  value={bracketSettings.style.lineColor}
                  onChange={(value) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, lineColor: value } }))}
                />
                <ColorInputField
                  label="Team block"
                  value={bracketSettings.style.teamBlockColor}
                  onChange={(value) =>
                    setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, teamBlockColor: value } }))
                  }
                />
                <ColorInputField
                  label="Winnaar kleur"
                  value={bracketSettings.style.winnerColor}
                  onChange={(value) => setBracketSettings((prev) => ({ ...prev, style: { ...prev.style, winnerColor: value } }))}
                />
              </div>
              </div>
            )}
          </div>
        );
      case 'group-stage':
        return (
          <div className={panelClass}>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Groep instellingen</h3>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">Aantal groepen</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={groupStageSettings.numberOfGroups}
                    onChange={(e) => handleGroupStageNumberOfGroupsChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-white/70 w-10 text-right">{groupStageSettings.numberOfGroups}</span>
                </div>
                </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">Teams per groep</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={groupStageSettings.teamsPerGroup}
                    onChange={(e) => handleGroupStageTeamsPerGroupChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-white/70 w-10 text-right">{groupStageSettings.teamsPerGroup}</span>
                </div>
                </label>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Groepen en teams</h3>
              <div className="space-y-3">
                {groupStageSettings.groups.map((group) => {
                  const isGroupExpanded = expandedGroups[group.id] ?? true;
                  return (
                    <div key={group.id} className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                      <button
                        onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.id]: !isGroupExpanded }))}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-4 h-4 text-white/60 transition-transform ${isGroupExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm font-semibold text-white">Groep {group.name}</span>
                          <span className="text-xs text-white/40">({group.teams.length} teams)</span>
                        </div>
                      </button>
                      {isGroupExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <label className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Groep naam</span>
                            <input
                              value={group.name}
                              onChange={(e) => updateGroupStageGroup(group.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm font-semibold focus:outline-none focus:border-[#755DFF]"
                              placeholder="A"
                            />
                </label>
                          <div className="space-y-2">
                            {group.teams.map((team, teamIdx) => {
                              const isTeamExpanded = expandedTeams[team.id] ?? false;
                              return (
                                <div key={team.id} className="rounded-xl border border-white/5 bg-[#11132A]/50 overflow-hidden">
                                  <div className="w-full flex items-center justify-between p-3">
                                    <button
                                      onClick={() => setExpandedTeams((prev) => ({ ...prev, [team.id]: !isTeamExpanded }))}
                                      className="flex-1 flex items-center gap-2 hover:bg-white/5 transition rounded-lg p-2 -ml-2"
                                    >
                                      <svg
                                        className={`w-3 h-3 text-white/50 transition-transform ${isTeamExpanded ? 'rotate-90' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                      <span className="text-xs uppercase tracking-[0.2em] text-white/60">Team {teamIdx + 1}</span>
                                      {team.name && (
                                        <span className="text-xs text-white/70 ml-2">- {team.name}</span>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => removeGroupStageTeam(group.id, team.id)}
                                      className="px-2 py-1 border border-white/10 rounded-lg text-xs text-white/70 hover:border-white/40 hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                      disabled={group.teams.length <= 2}
                                    >
                                      Verwijder
                                    </button>
                                  </div>
                                  {isTeamExpanded && (
                                    <div className="px-3 pb-3 space-y-2">
                                      <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50">Seed</span>
                                        <input
                                          value={team.seed}
                                          onChange={(e) => updateGroupStageTeam(group.id, team.id, 'seed', e.target.value)}
                                          className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                                          placeholder="#1"
                                        />
                                      </label>
                                      <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50">Team naam</span>
                                        <input
                                          value={team.name}
                                          onChange={(e) => updateGroupStageTeam(group.id, team.id, 'name', e.target.value)}
                                          className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                                          placeholder="Team naam"
                                        />
                                      </label>
                                      <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50">Tag</span>
                                        <input
                                          value={team.tag}
                                          onChange={(e) => updateGroupStageTeam(group.id, team.id, 'tag', e.target.value)}
                                          className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                                          placeholder="Tag"
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => addGroupStageTeam(group.id)}
                            className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={group.teams.length >= 8}
                          >
                            + Team toevoegen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="space-y-3">
              <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Kleuren</h3>
                  <button
                    type="button"
                    onClick={() => setGroupStageSettings((prev) => ({ ...prev, colors: resetGroupStageColors() }))}
                    className="text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                  >
                    Standaard
                  </button>
                </div>
                <div className="space-y-3">
                  <ColorInputField
                    label="Achtergrondkleur"
                    value={groupStageSettings.colors.backgroundColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, backgroundColor: value } }))}
                  />
                  <ColorInputField
                    label="Ondertitel kleur"
                    value={groupStageSettings.colors.subtitleColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, subtitleColor: value } }))}
                  />
                  <ColorInputField
                    label="Titel kleur"
                    value={groupStageSettings.colors.titleColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, titleColor: value } }))}
                  />
                  <ColorInputField
                    label="Body tekst kleur"
                    value={groupStageSettings.colors.bodyTextColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, bodyTextColor: value } }))}
                  />
                  <ColorInputField
                    label="Card achtergrond"
                    value={groupStageSettings.colors.cardBackground}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBackground: value } }))}
                  />
                  <ColorInputField
                    label="Card border"
                    value={groupStageSettings.colors.cardBorder}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBorder: value } }))}
                  />
                  <ColorInputField
                    label="Groep naam kleur"
                    value={groupStageSettings.colors.groupNameColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, groupNameColor: value } }))}
                  />
                  <ColorInputField
                    label="Team item achtergrond"
                    value={groupStageSettings.colors.teamItemBackground}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, teamItemBackground: value } }))}
                  />
                  <ColorInputField
                    label="Team naam kleur"
                    value={groupStageSettings.colors.teamNameColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, teamNameColor: value } }))}
                  />
                  <ColorInputField
                    label="Team tag kleur"
                    value={groupStageSettings.colors.teamTagColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, teamTagColor: value } }))}
                  />
                  <ColorInputField
                    label="Seed kleur"
                    value={groupStageSettings.colors.seedColor}
                    onChange={(value) => setGroupStageSettings((prev) => ({ ...prev, colors: { ...prev.colors, seedColor: value } }))}
                  />
                </div>
              </div>
            </section>
            <section className="space-y-3">
              <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Tekst grootte</h3>
                  <button
                    type="button"
                    onClick={() => setGroupStageSettings((prev) => ({ ...prev, fontSizes: resetGroupStageFontSizes() }))}
                    className="text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                  >
                    Standaard
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Titel (H1)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={20}
                        max={60}
                        value={groupStageSettings.fontSizes.title}
                        onChange={(e) => setGroupStageSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, title: Number(e.target.value) } }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-white/70 w-10 text-right">{groupStageSettings.fontSizes.title}px</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Ondertitel (H2)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={12}
                        max={40}
                        value={groupStageSettings.fontSizes.subtitle}
                        onChange={(e) => setGroupStageSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) } }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-white/70 w-10 text-right">{groupStageSettings.fontSizes.subtitle}px</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Groep naam (H2)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={16}
                        max={40}
                        value={groupStageSettings.fontSizes.groupName}
                        onChange={(e) => setGroupStageSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, groupName: Number(e.target.value) } }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-white/70 w-10 text-right">{groupStageSettings.fontSizes.groupName}px</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Team naam (H3)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={24}
                        value={groupStageSettings.fontSizes.teamName}
                        onChange={(e) => setGroupStageSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, teamName: Number(e.target.value) } }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-white/70 w-10 text-right">{groupStageSettings.fontSizes.teamName}px</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Team tag</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={18}
                        value={groupStageSettings.fontSizes.teamTag}
                        onChange={(e) => setGroupStageSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, teamTag: Number(e.target.value) } }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-white/70 w-10 text-right">{groupStageSettings.fontSizes.teamTag}px</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </div>
        );
      case 'stats':
        return (
          <div className={panelClass}>
            <div className="space-y-3">
              {/* Layout Section */}
              <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                <button
                  onClick={() => setExpandedStatsSections((prev) => ({ ...prev, layout: !prev.layout }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform ${expandedStatsSections.layout ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Layout</span>
                  </div>
                </button>
                {expandedStatsSections.layout && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      {STATS_LAYOUT_OPTIONS.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => setStatsSettings((prev) => ({ ...prev, layout: layout.id }))}
                          className={`p-3 rounded-xl border text-left transition ${
                            statsSettings.layout === layout.id
                              ? 'border-[#755DFF] bg-[#755DFF]/10'
                              : 'border-white/10 bg-[#11132A] hover:border-white/20'
                          }`}
                        >
                          <div className="text-sm font-semibold text-white mb-1">{layout.label}</div>
                          <div className="text-xs text-white/50">{layout.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Section */}
              <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                <button
                  onClick={() => setExpandedStatsSections((prev) => ({ ...prev, text: !prev.text }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform ${expandedStatsSections.text ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Tekst</span>
                  </div>
                </button>
                {expandedStatsSections.text && (
                  <div className="px-4 pb-4 space-y-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/50">Titel</span>
                      <input
                        value={statsSettings.title}
                        onChange={(e) => setStatsSettings((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                        placeholder="Live Statistieken"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/50">Ondertitel</span>
                      <input
                        value={statsSettings.subtitle}
                        onChange={(e) => setStatsSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                        placeholder="Real-time toernooi overzicht"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Stats Section */}
              <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                <button
                  onClick={() => setExpandedStatsSections((prev) => ({ ...prev, stats: !prev.stats }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform ${expandedStatsSections.stats ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Statistieken</span>
                    <span className="text-xs text-white/40">({statsSettings.stats.length})</span>
                  </div>
                </button>
                {expandedStatsSections.stats && (
                  <div className="px-4 pb-4 space-y-3">
                    {statsSettings.stats.map((stat) => (
                      <div key={stat.id} className="rounded-xl border border-white/5 bg-[#11132A]/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-[0.2em] text-white/50">Stat {idx + 1}</span>
                          {statsSettings.stats.length > 1 && (
                            <button
                              onClick={() => setStatsSettings((prev) => ({ ...prev, stats: prev.stats.filter((s) => s.id !== stat.id) }))}
                              className="px-2 py-1 border border-white/10 rounded-lg text-xs text-white/70 hover:border-white/40 transition"
                            >
                              Verwijder
                            </button>
                          )}
                        </div>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs text-white/50">Waarde</span>
                          <input
                            value={stat.value}
                            onChange={(e) =>
                              setStatsSettings((prev) => ({
                                ...prev,
                                stats: prev.stats.map((s) => (s.id === stat.id ? { ...s, value: e.target.value } : s)),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                            placeholder="16"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs text-white/50">Label</span>
                          <input
                            value={stat.label}
                            onChange={(e) =>
                              setStatsSettings((prev) => ({
                                ...prev,
                                stats: prev.stats.map((s) => (s.id === stat.id ? { ...s, label: e.target.value } : s)),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#0E1020] border border-white/10 text-sm focus:outline-none focus:border-[#755DFF]"
                            placeholder="Teams"
                          />
                        </label>
                      </div>
                    ))}
                    {statsSettings.stats.length < 8 && (
                      <button
                        onClick={() =>
                          setStatsSettings((prev) => ({
                            ...prev,
                            stats: [...prev.stats, { id: createId(), value: '', label: '', icon: '' }],
                          }))
                        }
                        className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white transition"
                      >
                        + Stat toevoegen
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Font Sizes Section */}
              <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                <button
                  onClick={() => setExpandedStatsSections((prev) => ({ ...prev, fontSizes: !prev.fontSizes }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform ${expandedStatsSections.fontSizes ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Tekst grootte</span>
                  </div>
                </button>
                {expandedStatsSections.fontSizes && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setStatsSettings((prev) => ({ ...prev, fontSizes: resetStatsFontSizes() }))}
                        className="text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                      >
                        Standaard
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Titel (H1)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={20}
                            max={60}
                            value={statsSettings.fontSizes.title}
                            onChange={(e) => setStatsSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, title: Number(e.target.value) } }))}
                            className="flex-1"
                          />
                          <span className="text-xs text-white/70 w-10 text-right">{statsSettings.fontSizes.title}px</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Ondertitel (H2)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={12}
                            max={40}
                            value={statsSettings.fontSizes.subtitle}
                            onChange={(e) => setStatsSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) } }))}
                            className="flex-1"
                          />
                          <span className="text-xs text-white/70 w-10 text-right">{statsSettings.fontSizes.subtitle}px</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Stat waarde</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={16}
                            max={60}
                            value={statsSettings.fontSizes.statValue}
                            onChange={(e) => setStatsSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, statValue: Number(e.target.value) } }))}
                            className="flex-1"
                          />
                          <span className="text-xs text-white/70 w-10 text-right">{statsSettings.fontSizes.statValue}px</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Stat label</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={10}
                            max={24}
                            value={statsSettings.fontSizes.statLabel}
                            onChange={(e) => setStatsSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, statLabel: Number(e.target.value) } }))}
                            className="flex-1"
                          />
                          <span className="text-xs text-white/70 w-10 text-right">{statsSettings.fontSizes.statLabel}px</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Colors Section */}
              <div className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                <button
                  onClick={() => setExpandedStatsSections((prev) => ({ ...prev, colors: !prev.colors }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform ${expandedStatsSections.colors ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Kleuren</span>
                  </div>
                </button>
                {expandedStatsSections.colors && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setStatsSettings((prev) => ({ ...prev, colors: resetStatsColors() }))}
                        className="text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                      >
                        Standaard
                      </button>
                    </div>
                    <div className="space-y-3">
                      <ColorInputField
                        label="Achtergrondkleur"
                        value={statsSettings.colors.backgroundColor}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, backgroundColor: value } }))}
                      />
                      <ColorInputField
                        label="Titel kleur"
                        value={statsSettings.colors.titleColor}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, titleColor: value } }))}
                      />
                      <ColorInputField
                        label="Ondertitel kleur"
                        value={statsSettings.colors.subtitleColor}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, subtitleColor: value } }))}
                      />
                      <ColorInputField
                        label="Card achtergrond"
                        value={statsSettings.colors.cardBackground}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBackground: value } }))}
                      />
                      <ColorInputField
                        label="Card border"
                        value={statsSettings.colors.cardBorder}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBorder: value } }))}
                      />
                      <ColorInputField
                        label="Stat waarde kleur"
                        value={statsSettings.colors.statValueColor}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, statValueColor: value } }))}
                      />
                      <ColorInputField
                        label="Stat label kleur"
                        value={statsSettings.colors.statLabelColor}
                        onChange={(value) => setStatsSettings((prev) => ({ ...prev, colors: { ...prev.colors, statLabelColor: value } }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'twitch':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'twitch-settings',
              'Stream instellingen',
              expandedTwitchSections.settings,
              () => setExpandedTwitchSections((prev) => ({ ...prev, settings: !prev.settings })),
              <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm text-white/70">
                  Twitch Stream Link
                </label>
              <input
                  type="url"
                value={twitchSettings.channel}
                onChange={(e) => setTwitchSettings((prev) => ({ ...prev, channel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://twitch.tv/roshlive of roshlive"
              />
                <p className="text-xs text-white/50">
                  Voer een Twitch kanaalnaam (bijv. roshlive) of volledige URL in (bijv. https://twitch.tv/roshlive)
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={twitchSettings.autoplay} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, autoplay: e.target.checked }))} />
                Autoplay
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={twitchSettings.showChat} onChange={(e) => setTwitchSettings((prev) => ({ ...prev, showChat: e.target.checked }))} />
                Chat tonen
              </label>
              </div>
            )}

            {renderCollapsibleSection(
              'twitch-layout',
              'Layout',
              expandedTwitchSections.layout,
              () => setExpandedTwitchSections((prev) => ({ ...prev, layout: !prev.layout })),
              <div className="space-y-2">
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
              <ColorInputField
                label="Achtergrondkleur"
                value={twitchSettings.background}
                onChange={(value) => setTwitchSettings((prev) => ({ ...prev, background: value }))}
              />
              </div>
            )}
          </div>
        );
      case 'sponsors':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'sponsor-layout',
              'Layout',
              expandedSponsorSections.layout,
              () => setExpandedSponsorSections((prev) => ({ ...prev, layout: !prev.layout })),
              <div className="space-y-2">
                {SPONSOR_LAYOUT_OPTIONS.map((layout) => {
                  const isSelected = sponsorSettings.layout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => setSponsorSettings((prev) => ({ ...prev, layout: layout.id }))}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all bg-[#11132A] ${
                        isSelected
                          ? 'border-[#755DFF] shadow-[0_0_25px_rgba(117,93,255,0.3)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{layout.label}</p>
                          <p className="text-xs text-white/50 mt-1">{layout.description}</p>
                        </div>
                        {isSelected && <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8A4FF]">Actief</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {renderCollapsibleSection(
              'sponsor-logos',
              'Sponsorlogos',
              expandedSponsorSections.logos,
              () => setExpandedSponsorSections((prev) => ({ ...prev, logos: !prev.logos })),
              <div className="space-y-3">
                {sponsorSettings.logos.map((logo, index) => (
                  <div key={logo.id} className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Logo #{index + 1}</span>
                      <button
                        onClick={() => removeSponsorLogo(logo.id)}
                        className="px-2 py-1 border border-white/10 rounded-lg hover:border-red-400 transition text-red-300"
                      >
                        Verwijder
                      </button>
                    </div>
                    <DroppableImageField
                      id={`sponsor-logo-${logo.id}`}
                      value={logo.url}
                      onChange={(url) => updateSponsorLogo(logo.id, 'url', url)}
                      label="Logo afbeelding"
                    >
                      <div className="rounded-xl border border-white/10 bg-[#0E1020] p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {logo.url ? (
                              <img
                                src={logo.url}
                                alt={logo.name || 'Logo preview'}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Icon name="image" className="w-6 h-6 text-white/30" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => sponsorLogoInputRefs.current[logo.id]?.click()}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition"
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('uploads')}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition"
                              >
                                Library
                              </button>
                              {logo.url && (
                                <button
                                  type="button"
                                  onClick={() => updateSponsorLogo(logo.id, 'url', '')}
                                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={logo.url}
                              onChange={(e) => updateSponsorLogo(logo.id, 'url', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-[#11132A] border border-white/10 text-xs"
                              placeholder="URL"
                            />
                          </div>
                        </div>
                        <input
                          ref={(el) => { sponsorLogoInputRefs.current[logo.id] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => updateSponsorLogo(logo.id, 'url', url))}
                        />
                      </div>
                    </DroppableImageField>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Naam
                        <input
                          value={logo.name}
                          onChange={(e) => updateSponsorLogo(logo.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          placeholder="Sponsor naam"
                        />
                      </label>
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Link
                        <input
                          value={logo.link}
                          onChange={(e) => updateSponsorLogo(logo.id, 'link', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          placeholder="https://"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSponsorLogo}
                  className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                >
                  + Voeg sponsor toe
                </button>
              </div>,
              `${sponsorSettings.logos.length} logos`
            )}

            {renderCollapsibleSection(
              'sponsor-content',
              'Content',
              expandedSponsorSections.layoutOptions,
              () => setExpandedSponsorSections((prev) => ({ ...prev, layoutOptions: !prev.layoutOptions })),
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Titel
                    <input
                      value={sponsorSettings.title}
                      onChange={(e) => setSponsorSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Titel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Ondertitel
                    <input
                      value={sponsorSettings.subtitle}
                      onChange={(e) => setSponsorSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Ondertitel"
                    />
                  </label>
                </div>
                <div className="space-y-3 text-xs text-white/60">
                  {(sponsorSettings.layout === 'grid' || sponsorSettings.layout === 'rows') && (
                    <label>
                      Logos per rij ({sponsorSettings.columns})
                      <input type="range" min={2} max={6} value={sponsorSettings.columns} onChange={(e) => setSponsorSettings((prev) => ({ ...prev, columns: Number(e.target.value) }))} />
                    </label>
                  )}
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
                </div>
              </div>
            )}

            {renderCollapsibleSection(
              'sponsor-fontSizes',
              'Tekst grootte',
              expandedSponsorSections.fontSizes,
              () => setExpandedSponsorSections((prev) => ({ ...prev, fontSizes: !prev.fontSizes })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Titel (H1) ({sponsorSettings.fontSizes.title}px)
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={sponsorSettings.fontSizes.title}
                      onChange={(e) => setSponsorSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, title: Number(e.target.value) } }))}
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Ondertitel (H2) ({sponsorSettings.fontSizes.subtitle}px)
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={sponsorSettings.fontSizes.subtitle}
                      onChange={(e) => setSponsorSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) } }))}
                    />
                  </label>
                </div>
                <button
                  onClick={() => setSponsorSettings((prev) => ({ ...prev, fontSizes: resetSponsorFontSizes() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}

            {renderCollapsibleSection(
              'sponsor-colors',
              'Kleuren',
              expandedSponsorSections.colors,
              () => setExpandedSponsorSections((prev) => ({ ...prev, colors: !prev.colors })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <ColorInputField
                    label="Achtergrondkleur"
                    value={sponsorSettings.colors.backgroundColor}
                    onChange={(value) => setSponsorSettings((prev) => ({ ...prev, colors: { ...prev.colors, backgroundColor: value } }))}
                  />
                  <ColorInputField
                    label="Titel kleur"
                    value={sponsorSettings.colors.titleColor}
                    onChange={(value) => setSponsorSettings((prev) => ({ ...prev, colors: { ...prev.colors, titleColor: value } }))}
                  />
                  <ColorInputField
                    label="Ondertitel kleur"
                    value={sponsorSettings.colors.subtitleColor}
                    onChange={(value) => setSponsorSettings((prev) => ({ ...prev, colors: { ...prev.colors, subtitleColor: value } }))}
                  />
                  <ColorInputField
                    label="Card achtergrond"
                    value={sponsorSettings.colors.cardBackground}
                    onChange={(value) => setSponsorSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBackground: value } }))}
                  />
                  <ColorInputField
                    label="Card border"
                    value={sponsorSettings.colors.cardBorder}
                    onChange={(value) => setSponsorSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBorder: value } }))}
                  />
                </div>
                <button
                  onClick={() => setSponsorSettings((prev) => ({ ...prev, colors: resetSponsorColors() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}
          </div>
        );
      case 'socials':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'social-links',
              'Social opties',
              expandedSocialSections.links,
              () => setExpandedSocialSections((prev) => ({ ...prev, links: !prev.links })),
              <div className="space-y-2">
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
              </div>
            )}

            {renderCollapsibleSection(
              'social-style',
              'Stijl',
              expandedSocialSections.style,
              () => setExpandedSocialSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-2 text-xs text-white/60">
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
                <input type="range" min={12} max={32} value={socialSettings.size}                 onChange={(e) => setSocialSettings((prev) => ({ ...prev, size: Number(e.target.value) }))} />
              </label>
              </div>
            )}
          </div>
        );
      case 'footer':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'footer-template',
              'Template',
              expandedFooterSections.template,
              () => setExpandedFooterSections((prev) => ({ ...prev, template: !prev.template })),
              <div className="space-y-2">
                {FOOTER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setFooterSettings((prev) => ({
                        ...prev,
                        template: template.id,
                        layout: template.layout,
                        showSocials: template.showSocials,
                      }));
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      footerSettings.template === template.id
                        ? 'border-[#755DFF] bg-[#755DFF]/10'
                        : 'border-white/10 bg-[#0E1020] hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white mb-1">{template.label}</div>
                    <div className="text-xs text-white/60">{template.description}</div>
                  </button>
                ))}
              </div>
            )}

            {renderCollapsibleSection(
              'footer-content',
              'Content',
              expandedFooterSections.content,
              () => setExpandedFooterSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-3">
                <DroppableImageField
                  id="footer-logo"
                  value={footerSettings.logoUrl}
                  onChange={(url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url }))}
                  label="Logo"
                >
                  <div className="rounded-xl border border-white/10 bg-[#05060F] p-3 space-y-2 min-w-0">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => footerLogoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('uploads')}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                      >
                        Library
                      </button>
                      {footerSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFooterSettings((prev) => ({ ...prev, logoUrl: '' }))}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={footerSettings.logoUrl}
                      onChange={(e) => setFooterSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                      className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#0B0D1E] border border-white/10 text-xs"
                      placeholder="URL"
                    />
                    <input
                      ref={footerLogoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url })))}
                    />
                  </div>
                </DroppableImageField>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Beschrijving
                  <textarea
                    value={footerSettings.description}
                    onChange={(e) => setFooterSettings((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                    rows={2}
                    placeholder="Beschrijving"
                  />
                </label>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Copyright
                  <input
                    value={footerSettings.copyright}
                    onChange={(e) => setFooterSettings((prev) => ({ ...prev, copyright: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                    placeholder="Copyright tekst"
                  />
                </label>
              </div>
            )}

            {renderCollapsibleSection(
              'footer-links',
              'Navigatie links',
              expandedFooterSections.links,
              () => setExpandedFooterSections((prev) => ({ ...prev, links: !prev.links })),
              <div className="space-y-3">
                {['tournament', 'info', 'contact'].map((section) => (
                  <div key={section} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white/80">
                        {section === 'tournament' ? 'Toernooi' : section === 'info' ? 'Informatie' : 'Contact'}
                      </h4>
                      <button
                        onClick={() => addFooterLink(section as 'tournament' | 'info' | 'contact')}
                        className="text-xs px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70"
                      >
                        + Link
                      </button>
                    </div>
                    <div className="space-y-2">
                      {footerSettings.links[section as 'tournament' | 'info' | 'contact'].map((link, linkIndex) => (
                        <div key={link.id} className="rounded-xl border border-white/10 bg-[#05060F] p-2 space-y-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              value={link.label}
                              onChange={(e) => updateFooterLinks(section as 'tournament' | 'info' | 'contact', link.id, 'label', e.target.value)}
                              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                              placeholder="Label"
                            />
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                disabled={linkIndex === 0}
                                onClick={() => moveFooterLink(section as 'tournament' | 'info' | 'contact', linkIndex, linkIndex - 1)}
                                className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                              >
                                ↑
                              </button>
                              <button
                                disabled={linkIndex === footerSettings.links[section as 'tournament' | 'info' | 'contact'].length - 1}
                                onClick={() => moveFooterLink(section as 'tournament' | 'info' | 'contact', linkIndex, linkIndex + 1)}
                                className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => removeFooterLink(section as 'tournament' | 'info' | 'contact', link.id)}
                                className="px-2 py-1 border border-white/10 rounded-lg hover:border-red-400 transition text-red-300 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <input
                            value={link.link}
                            onChange={(e) => updateFooterLinks(section as 'tournament' | 'info' | 'contact', link.id, 'link', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-[#0B0D1E] border border-white/10 text-xs"
                            placeholder="URL"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {renderCollapsibleSection(
              'footer-style',
              'Stijl',
              expandedFooterSections.style,
              () => setExpandedFooterSections((prev) => ({ ...prev, style: !prev.style })),
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white/80">Layout</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'two-columns', label: '2 Kolommen' },
                      { value: 'three-columns', label: '3 Kolommen' },
                      { value: 'centered', label: 'Gecentreerd' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-[#05060F] cursor-pointer hover:border-white/20 transition">
                        <input
                          type="radio"
                          name="footer-layout"
                          value={option.value}
                          checked={footerSettings.layout === option.value}
                          onChange={(e) => setFooterSettings((prev) => ({ ...prev, layout: e.target.value as typeof footerSettings.layout }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-white/80">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Spacing ({footerSettings.spacing}px)
                  <input
                    type="range"
                    min={16}
                    max={64}
                    value={footerSettings.spacing}
                    onChange={(e) => setFooterSettings((prev) => ({ ...prev, spacing: Number(e.target.value) }))}
                    className="w-full"
                  />
                </label>
                <ColorInputField
                  label="Achtergrondkleur"
                  value={footerSettings.backgroundColor}
                  onChange={(value) => setFooterSettings((prev) => ({ ...prev, backgroundColor: value }))}
                />
                <ColorInputField
                  label="Tekstkleur"
                  value={footerSettings.textColor}
                  onChange={(value) => setFooterSettings((prev) => ({ ...prev, textColor: value }))}
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={footerSettings.divider}
                    onChange={(e) => setFooterSettings((prev) => ({ ...prev, divider: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Divider
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={footerSettings.showSocials}
                    onChange={(e) => setFooterSettings((prev) => ({ ...prev, showSocials: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Socials weergeven
                </label>
              </div>
            )}
          </div>
        );
      case 'faq':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'faq-layout',
              'Layout',
              expandedFAQSections.layout,
              () => setExpandedFAQSections((prev) => ({ ...prev, layout: !prev.layout })),
              <div className="space-y-2">
                {FAQ_LAYOUT_OPTIONS.map((layout) => {
                  const isSelected = faqSettings.layout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => setFaqSettings((prev) => ({ ...prev, layout: layout.id }))}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all bg-[#11132A] ${
                        isSelected
                          ? 'border-[#755DFF] shadow-[0_0_25px_rgba(117,93,255,0.3)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{layout.label}</p>
                          <p className="text-xs text-white/50 mt-1">{layout.description}</p>
                        </div>
                        {isSelected && <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8A4FF]">Actief</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {renderCollapsibleSection(
              'faq-content',
              'Content',
              expandedFAQSections.content,
              () => setExpandedFAQSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Titel
                    <input
                      value={faqSettings.title}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Titel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Ondertitel
                    <input
                      value={faqSettings.subtitle}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Ondertitel"
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-white/50">FAQ Items</h4>
                  {faqSettings.items.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Item #{index + 1}</span>
                        <div className="flex gap-2">
                          <button
                            disabled={index === 0}
                            onClick={() => moveFAQItem(index, index - 1)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            disabled={index === faqSettings.items.length - 1}
                            onClick={() => moveFAQItem(index, index + 1)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeFAQItem(item.id)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-red-400 transition text-red-300"
                          >
                            Verwijder
                          </button>
                        </div>
                      </div>
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Vraag
                        <input
                          value={item.question}
                          onChange={(e) => updateFAQItem(item.id, 'question', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          placeholder="Vraag"
                        />
                      </label>
                      <label className="text-xs text-white/60 flex flex-col gap-1">
                        Antwoord
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFAQItem(item.id, 'answer', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                          placeholder="Antwoord"
                        />
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={addFAQItem}
                    className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                  >
                    + Voeg FAQ item toe
                  </button>
                </div>
              </div>,
              `${faqSettings.items.length} items`
            )}

            {renderCollapsibleSection(
              'faq-fontSizes',
              'Tekst grootte',
              expandedFAQSections.fontSizes,
              () => setExpandedFAQSections((prev) => ({ ...prev, fontSizes: !prev.fontSizes })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Titel (H1) ({faqSettings.fontSizes.title}px)
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={faqSettings.fontSizes.title}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, title: Number(e.target.value) } }))}
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Ondertitel (H2) ({faqSettings.fontSizes.subtitle}px)
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={faqSettings.fontSizes.subtitle}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) } }))}
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Vraag ({faqSettings.fontSizes.question}px)
                    <input
                      type="range"
                      min={14}
                      max={32}
                      value={faqSettings.fontSizes.question}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, question: Number(e.target.value) } }))}
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Antwoord ({faqSettings.fontSizes.answer}px)
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={faqSettings.fontSizes.answer}
                      onChange={(e) => setFaqSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, answer: Number(e.target.value) } }))}
                    />
                  </label>
                </div>
                <button
                  onClick={() => setFaqSettings((prev) => ({ ...prev, fontSizes: resetFAQFontSizes() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}

            {renderCollapsibleSection(
              'faq-colors',
              'Kleuren',
              expandedFAQSections.colors,
              () => setExpandedFAQSections((prev) => ({ ...prev, colors: !prev.colors })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <ColorInputField
                    label="Achtergrondkleur"
                    value={faqSettings.colors.backgroundColor}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, backgroundColor: value } }))}
                  />
                  <ColorInputField
                    label="Titel kleur"
                    value={faqSettings.colors.titleColor}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, titleColor: value } }))}
                  />
                  <ColorInputField
                    label="Ondertitel kleur"
                    value={faqSettings.colors.subtitleColor}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, subtitleColor: value } }))}
                  />
                  <ColorInputField
                    label="Card achtergrond"
                    value={faqSettings.colors.cardBackground}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBackground: value } }))}
                  />
                  <ColorInputField
                    label="Card border"
                    value={faqSettings.colors.cardBorder}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, cardBorder: value } }))}
                  />
                  <ColorInputField
                    label="Vraag kleur"
                    value={faqSettings.colors.questionColor}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, questionColor: value } }))}
                  />
                  <ColorInputField
                    label="Antwoord kleur"
                    value={faqSettings.colors.answerColor}
                    onChange={(value) => setFaqSettings((prev) => ({ ...prev, colors: { ...prev.colors, answerColor: value } }))}
                  />
                </div>
                <button
                  onClick={() => setFaqSettings((prev) => ({ ...prev, colors: resetFAQColors() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}
          </div>
        );
      case 'registration':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'registration-content',
              'Content',
              expandedRegistrationSections.content,
              () => setExpandedRegistrationSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Titel
                    <input
                      value={registrationSettings.title}
                      onChange={(e) => setRegistrationSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Titel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Ondertitel
                    <input
                      value={registrationSettings.subtitle}
                      onChange={(e) => setRegistrationSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Ondertitel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Beschrijving
                    <textarea
                      value={registrationSettings.description}
                      onChange={(e) => setRegistrationSettings((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Beschrijving"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Button tekst
                    <input
                      value={registrationSettings.buttonText}
                      onChange={(e) => setRegistrationSettings((prev) => ({ ...prev, buttonText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Button tekst"
                    />
                  </label>
                </div>
              </div>
            )}

            {renderCollapsibleSection(
              'registration-formFields',
              'Formulier velden',
              expandedRegistrationSections.formFields,
              () => setExpandedRegistrationSections((prev) => ({ ...prev, formFields: !prev.formFields })),
              <div className="space-y-3">
                {Object.entries(registrationSettings.formFields).map(([key, field]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{field.label}</h4>
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          onChange={(e) =>
                            setRegistrationSettings((prev) => ({
                              ...prev,
                              formFields: { ...prev.formFields, [key]: { ...field, enabled: e.target.checked } },
                            }))
                          }
                        />
                        Ingeschakeld
                      </label>
                    </div>
                    {field.enabled && (
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 flex flex-col gap-1">
                          Label
                          <input
                            value={field.label}
                            onChange={(e) =>
                              setRegistrationSettings((prev) => ({
                                ...prev,
                                formFields: { ...prev.formFields, [key]: { ...field, label: e.target.value } },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                            placeholder="Label"
                          />
                        </label>
                        <label className="text-xs text-white/60 flex flex-col gap-1">
                          Placeholder
                          <input
                            value={field.placeholder}
                            onChange={(e) =>
                              setRegistrationSettings((prev) => ({
                                ...prev,
                                formFields: { ...prev.formFields, [key]: { ...field, placeholder: e.target.value } },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                            placeholder="Placeholder"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {renderCollapsibleSection(
              'registration-fontSizes',
              'Tekst grootte',
              expandedRegistrationSections.fontSizes,
              () => setExpandedRegistrationSections((prev) => ({ ...prev, fontSizes: !prev.fontSizes })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Titel (H1) ({registrationSettings.fontSizes.title}px)
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={registrationSettings.fontSizes.title}
                      onChange={(e) =>
                        setRegistrationSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, title: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Ondertitel (H2) ({registrationSettings.fontSizes.subtitle}px)
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={registrationSettings.fontSizes.subtitle}
                      onChange={(e) =>
                        setRegistrationSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Beschrijving ({registrationSettings.fontSizes.description}px)
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={registrationSettings.fontSizes.description}
                      onChange={(e) =>
                        setRegistrationSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, description: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Button ({registrationSettings.fontSizes.button}px)
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={registrationSettings.fontSizes.button}
                      onChange={(e) =>
                        setRegistrationSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, button: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Label ({registrationSettings.fontSizes.label}px)
                    <input
                      type="range"
                      min={10}
                      max={18}
                      value={registrationSettings.fontSizes.label}
                      onChange={(e) =>
                        setRegistrationSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, label: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                </div>
                <button
                  onClick={() => setRegistrationSettings((prev) => ({ ...prev, fontSizes: resetRegistrationFontSizes() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}

            {renderCollapsibleSection(
              'registration-colors',
              'Kleuren',
              expandedRegistrationSections.colors,
              () => setExpandedRegistrationSections((prev) => ({ ...prev, colors: !prev.colors })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <ColorInputField
                    label="Achtergrondkleur"
                    value={registrationSettings.colors.backgroundColor}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, backgroundColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Titel kleur"
                    value={registrationSettings.colors.titleColor}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, titleColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Ondertitel kleur"
                    value={registrationSettings.colors.subtitleColor}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, subtitleColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Beschrijving kleur"
                    value={registrationSettings.colors.descriptionColor}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, descriptionColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Card achtergrond"
                    value={registrationSettings.colors.cardBackground}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, cardBackground: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Card border"
                    value={registrationSettings.colors.cardBorder}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, cardBorder: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Input achtergrond"
                    value={registrationSettings.colors.inputBackground}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, inputBackground: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Input border"
                    value={registrationSettings.colors.inputBorder}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, inputBorder: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Input tekst"
                    value={registrationSettings.colors.inputText}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, inputText: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Label kleur"
                    value={registrationSettings.colors.labelColor}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, labelColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Button achtergrond"
                    value={registrationSettings.colors.buttonBackground}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, buttonBackground: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Button tekst"
                    value={registrationSettings.colors.buttonText}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, buttonText: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Button hover"
                    value={registrationSettings.colors.buttonHover}
                    onChange={(value) =>
                      setRegistrationSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, buttonHover: value },
                      }))
                    }
                  />
                </div>
                <button
                  onClick={() => setRegistrationSettings((prev) => ({ ...prev, colors: resetRegistrationColors() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}
          </div>
        );
      case 'teams':
        return (
          <div className={panelClass}>
            {renderCollapsibleSection(
              'teams-content',
              'Content',
              expandedTeamsComponentSections.content,
              () => setExpandedTeamsComponentSections((prev) => ({ ...prev, content: !prev.content })),
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Titel
                    <input
                      value={teamsSettings.title}
                      onChange={(e) => setTeamsSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Titel"
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-1">
                    Ondertitel
                    <input
                      value={teamsSettings.subtitle}
                      onChange={(e) => setTeamsSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#11132A] border border-white/10 text-sm"
                      placeholder="Ondertitel"
                    />
                  </label>
                </div>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Kolommen ({teamsSettings.columns})
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={teamsSettings.columns}
                    onChange={(e) => setTeamsSettings((prev) => ({ ...prev, columns: Number(e.target.value) }))}
                  />
                </label>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Aantal Teams ({teamsSettings.numberOfTeams ?? teamsSettings.teams.length})
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={teamsSettings.numberOfTeams ?? teamsSettings.teams.length}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setTeamsSettings((prev) => {
                        const currentCount = prev.teams.length;
                        let updatedTeams = [...prev.teams];
                        
                        if (newValue > currentCount) {
                          // Add teams
                          const teamsToAdd = newValue - currentCount;
                          const teamNames = ['Arctic Wolves', 'Thunder Strike', 'Ice Phoenix', 'Snow Leopards', 'Fire Dragons', 'Storm Riders', 'Shadow Hunters', 'Crystal Guardians', 'Blaze Warriors', 'Frost Titans', 'Lightning Bolts', 'Dark Knights'];
                          const teamInitials = ['AR', 'TH', 'IC', 'SN', 'FD', 'SR', 'SH', 'CG', 'BW', 'FT', 'LB', 'DK'];
                          const teamTags = ['ARCT', 'THND', 'ICEP', 'SNLP', 'FDRG', 'SRID', 'SHUN', 'CGUA', 'BWAR', 'FTIT', 'LBOL', 'DKNI'];
                          
                          for (let i = 0; i < teamsToAdd; i++) {
                            const index = currentCount + i;
                            const playersPerTeam = prev.playersPerTeam ?? (prev.teams[0]?.players.length ?? 3);
                            const defaultPlayers = Array.from({ length: playersPerTeam }, (_, j) => ({
                              id: createId(),
                              name: `Player ${j + 1}`,
                              avatarUrl: ''
                            }));
                            
                            updatedTeams.push({
                              id: createId(),
                              initials: teamInitials[index] || `T${index + 1}`,
                              name: teamNames[index] || `Team ${index + 1}`,
                              tag: teamTags[index] || `T${index + 1}`,
                              logoUrl: '',
                              players: defaultPlayers
                            });
                          }
                        } else if (newValue < currentCount) {
                          // Remove teams and clean up refs
                          const removedTeams = prev.teams.slice(newValue);
                          removedTeams.forEach((team) => {
                            delete teamLogoInputRefs.current[team.id];
                            team.players.forEach((player) => {
                              delete playerAvatarInputRefs.current[`${team.id}-${player.id}`];
                            });
                          });
                          updatedTeams = prev.teams.slice(0, newValue);
                        }
                        
                        return {
                          ...prev,
                          numberOfTeams: newValue,
                          teams: updatedTeams
                        };
                      });
                    }}
                  />
                </label>
                <label className="text-xs text-white/60 flex flex-col gap-1">
                  Spelers per Team ({teamsSettings.playersPerTeam ?? (teamsSettings.teams[0]?.players.length ?? 3)})
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={teamsSettings.playersPerTeam ?? (teamsSettings.teams[0]?.players.length ?? 3)}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setTeamsSettings((prev) => ({
                        ...prev,
                        playersPerTeam: newValue,
                        teams: prev.teams.map((team) => {
                          const currentPlayerCount = team.players.length;
                          let updatedPlayers = [...team.players];
                          
                          if (newValue > currentPlayerCount) {
                            // Add players
                            const playersToAdd = newValue - currentPlayerCount;
                            for (let i = 0; i < playersToAdd; i++) {
                              updatedPlayers.push({
                                id: createId(),
                                name: `Player ${currentPlayerCount + i + 1}`,
                                avatarUrl: ''
                              });
                            }
                          } else if (newValue < currentPlayerCount) {
                            // Remove players and clean up refs
                            const removedPlayers = team.players.slice(newValue);
                            removedPlayers.forEach((player) => {
                              delete playerAvatarInputRefs.current[`${team.id}-${player.id}`];
                            });
                            updatedPlayers = team.players.slice(0, newValue);
                          }
                          
                          return {
                            ...team,
                            players: updatedPlayers
                          };
                        })
                      }));
                    }}
                  />
                </label>
              </div>
            )}

            {renderCollapsibleSection(
              'teams-teams',
              'Teams',
              expandedTeamsComponentSections.teams,
              () => setExpandedTeamsComponentSections((prev) => ({ ...prev, teams: !prev.teams })),
              <div className="space-y-2">
                {teamsSettings.teams.map((team, index) => {
                  const isTeamExpanded = expandedTeamItems[team.id] ?? false;
                  return (
                    <div key={team.id} className="rounded-2xl border border-white/10 bg-[#0E1020] overflow-hidden">
                      <div className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition">
                        <button
                          onClick={() => setExpandedTeamItems((prev) => ({ ...prev, [team.id]: !isTeamExpanded }))}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <svg
                            className={`w-4 h-4 text-white/60 transition-transform ${isTeamExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex items-center gap-2">
                            {team.logoUrl ? (
                              <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: teamsSettings.colors.initialsBackground, color: teamsSettings.colors.initialsText }}>
                                {team.initials}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-white">{team.name || `Team ${index + 1}`}</span>
                            <span className="text-xs text-white/40">({team.players.length} spelers)</span>
                          </div>
                        </button>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            disabled={index === 0}
                            onClick={() => moveTeam(index, index - 1)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                          >
                            ↑
                          </button>
                          <button
                            disabled={index === teamsSettings.teams.length - 1}
                            onClick={() => moveTeam(index, index + 1)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeTeam(team.id)}
                            className="px-2 py-1 border border-white/10 rounded-lg hover:border-red-400 transition text-red-300 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {isTeamExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                          <DroppableImageField
                            id={`team-logo-${team.id}`}
                            value={team.logoUrl}
                            onChange={(url) => updateTeam(team.id, 'logoUrl', url)}
                            label="Team Logo"
                          >
                            <div className="rounded-xl border border-white/10 bg-[#05060F] p-3 space-y-2 min-w-0">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => teamLogoInputRefs.current[team.id]?.click()}
                                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                                >
                                  Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('uploads')}
                                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:border-white/40 transition flex-shrink-0"
                                >
                                  Library
                                </button>
                                {team.logoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => updateTeam(team.id, 'logoUrl', '')}
                                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-red-300 hover:border-red-400 transition flex-shrink-0"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={team.logoUrl}
                                onChange={(e) => updateTeam(team.id, 'logoUrl', e.target.value)}
                                className="w-full min-w-0 px-2 py-1.5 rounded-lg bg-[#0B0D1E] border border-white/10 text-xs"
                                placeholder="URL"
                              />
                              <input
                                ref={(el) => { teamLogoInputRefs.current[team.id] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, (url) => updateTeam(team.id, 'logoUrl', url))}
                              />
                            </div>
                          </DroppableImageField>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-xs text-white/60 flex flex-col gap-1">
                              Initials
                              <input
                                value={team.initials}
                                onChange={(e) => updateTeam(team.id, 'initials', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                                placeholder="AR"
                                maxLength={4}
                              />
                            </label>
                            <label className="text-xs text-white/60 flex flex-col gap-1">
                              Tag
                              <input
                                value={team.tag}
                                onChange={(e) => updateTeam(team.id, 'tag', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                                placeholder="ARCT"
                                maxLength={6}
                              />
                            </label>
                          </div>
                          
                          <label className="text-xs text-white/60 flex flex-col gap-1">
                            Team naam
                            <input
                              value={team.name}
                              onChange={(e) => updateTeam(team.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                              placeholder="Team naam"
                            />
                          </label>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-white/80">Spelers</h4>
                              <button
                                onClick={() => addTeamPlayer(team.id)}
                                className="text-xs px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70"
                              >
                                + Speler
                              </button>
                            </div>
                            <div className="space-y-2">
                              {team.players.map((player, playerIndex) => {
                                return (
                                  <div key={player.id} className="rounded-xl border border-white/10 bg-[#05060F] p-2 space-y-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => playerAvatarInputRefs.current[`${team.id}-${player.id}`]?.click()}
                                        className="w-10 h-10 flex-shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-white/30 transition"
                                      >
                                        {player.avatarUrl ? (
                                          <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-5 h-5 text-white/30 flex items-center justify-center text-xs">👤</div>
                                        )}
                                      </button>
                                      <input
                                        ref={(el) => { playerAvatarInputRefs.current[`${team.id}-${player.id}`] = el; }}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, (url) => updateTeamPlayer(team.id, player.id, 'avatarUrl', url))}
                                      />
                                      <input
                                        value={player.name}
                                        onChange={(e) => updateTeamPlayer(team.id, player.id, 'name', e.target.value)}
                                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0B0D1E] border border-white/10 text-sm"
                                        placeholder="Speler naam"
                                      />
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button
                                          disabled={playerIndex === 0}
                                          onClick={() => moveTeamPlayer(team.id, playerIndex, playerIndex - 1)}
                                          className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          disabled={playerIndex === team.players.length - 1}
                                          onClick={() => moveTeamPlayer(team.id, playerIndex, playerIndex + 1)}
                                          className="px-2 py-1 border border-white/10 rounded-lg hover:border-white/40 transition text-white/70 disabled:opacity-30 text-xs"
                                        >
                                          ↓
                                        </button>
                                        <button
                                          onClick={() => removeTeamPlayer(team.id, player.id)}
                                          className="px-2 py-1 border border-white/10 rounded-lg hover:border-red-400 transition text-red-300 text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                    {player.avatarUrl && (
                                      <input
                                        type="text"
                                        value={player.avatarUrl}
                                        onChange={(e) => updateTeamPlayer(team.id, player.id, 'avatarUrl', e.target.value)}
                                        className="w-full px-2 py-1 rounded-lg bg-[#0B0D1E] border border-white/10 text-xs"
                                        placeholder="URL"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={addTeam}
                  className="w-full border border-dashed border-white/20 rounded-lg py-2 text-sm text-white/70 hover:text-white"
                >
                  + Voeg team toe
                </button>
              </div>,
              `${teamsSettings.teams.length} teams`
            )}

            {renderCollapsibleSection(
              'teams-fontSizes',
              'Tekst grootte',
              expandedTeamsComponentSections.fontSizes,
              () => setExpandedTeamsComponentSections((prev) => ({ ...prev, fontSizes: !prev.fontSizes })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Titel (H1) ({teamsSettings.fontSizes.title}px)
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={teamsSettings.fontSizes.title}
                      onChange={(e) =>
                        setTeamsSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, title: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Ondertitel (H2) ({teamsSettings.fontSizes.subtitle}px)
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={teamsSettings.fontSizes.subtitle}
                      onChange={(e) =>
                        setTeamsSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, subtitle: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Team naam ({teamsSettings.fontSizes.teamName}px)
                    <input
                      type="range"
                      min={14}
                      max={32}
                      value={teamsSettings.fontSizes.teamName}
                      onChange={(e) =>
                        setTeamsSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, teamName: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Team tag ({teamsSettings.fontSizes.teamTag}px)
                    <input
                      type="range"
                      min={10}
                      max={20}
                      value={teamsSettings.fontSizes.teamTag}
                      onChange={(e) =>
                        setTeamsSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, teamTag: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs text-white/60 flex flex-col gap-2">
                    Speler naam ({teamsSettings.fontSizes.playerName}px)
                    <input
                      type="range"
                      min={10}
                      max={18}
                      value={teamsSettings.fontSizes.playerName}
                      onChange={(e) =>
                        setTeamsSettings((prev) => ({
                          ...prev,
                          fontSizes: { ...prev.fontSizes, playerName: Number(e.target.value) },
                        }))
                      }
                    />
                  </label>
                </div>
                <button
                  onClick={() => setTeamsSettings((prev) => ({ ...prev, fontSizes: resetTeamsFontSizes() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}

            {renderCollapsibleSection(
              'teams-colors',
              'Kleuren',
              expandedTeamsComponentSections.colors,
              () => setExpandedTeamsComponentSections((prev) => ({ ...prev, colors: !prev.colors })),
              <div className="space-y-3">
                <div className="space-y-3">
                  <ColorInputField
                    label="Achtergrondkleur"
                    value={teamsSettings.colors.backgroundColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, backgroundColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Titel kleur"
                    value={teamsSettings.colors.titleColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, titleColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Ondertitel kleur"
                    value={teamsSettings.colors.subtitleColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, subtitleColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Card achtergrond"
                    value={teamsSettings.colors.cardBackground}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, cardBackground: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Card border"
                    value={teamsSettings.colors.cardBorder}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, cardBorder: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Initials achtergrond"
                    value={teamsSettings.colors.initialsBackground}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, initialsBackground: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Initials tekst"
                    value={teamsSettings.colors.initialsText}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, initialsText: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Team naam kleur"
                    value={teamsSettings.colors.teamNameColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, teamNameColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Team tag kleur"
                    value={teamsSettings.colors.teamTagColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, teamTagColor: value },
                      }))
                    }
                  />
                  <ColorInputField
                    label="Speler naam kleur"
                    value={teamsSettings.colors.playerNameColor}
                    onChange={(value) =>
                      setTeamsSettings((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, playerNameColor: value },
                      }))
                    }
                  />
                </div>
                <button
                  onClick={() => setTeamsSettings((prev) => ({ ...prev, colors: resetTeamsColors() }))}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-[#11132A] text-sm text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Standaard
                </button>
              </div>
            )}
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image, skipping.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileUrl = reader.result as string;
        const fileSize = formatFileSize(file.size);
        
        setUploads((prev) => [
          ...prev,
          {
            id: createId(),
            name: file.name,
            url: fileUrl,
            size: fileSize,
            usedIn: [],
          },
        ]);
      };
      reader.onerror = () => {
        console.error(`Error reading file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input zodat dezelfde file opnieuw geselecteerd kan worden
    if (event.target) {
      event.target.value = '';
    }
  };

  const addUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const changeEvent = {
          target,
        } as ChangeEvent<HTMLInputElement>;
        handleFileUpload(changeEvent);
      }
    };
    input.click();
  };

  const deleteUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const renameUpload = (id: string, name: string) => {
    setUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleHeroTemplateChange = (templateId: string) => {
    const template = HERO_TEMPLATES.find((t) => t.id === templateId);
    setHeroSettings((prev) => ({
      ...prev,
      template: templateId,
      alignment: (template?.defaultAlignment as typeof prev.alignment | undefined) ?? prev.alignment,
    }));
  };

  const applyImageToComponent = (componentId: string, imageUrl: string, uploadId: string) => {
    // Update the appropriate component setting based on componentId
    switch (componentId) {
      case 'navigation':
        setNavigationSettings((prev) => ({ ...prev, logoUrl: imageUrl }));
        break;
      case 'hero':
        setHeroSettings((prev) => ({ ...prev, heroImageUrl: imageUrl }));
        break;
      case 'about':
        setAboutSettings((prev) => ({ ...prev, imageUrl: imageUrl }));
        break;
      case 'footer':
        setFooterSettings((prev) => ({ ...prev, logoUrl: imageUrl }));
        break;
    }

    // Update the component label for tracking
    const componentLabels: Record<string, string> = {
      navigation: 'Navigation',
      hero: 'Hero',
      about: 'About',
      footer: 'Footer',
    };

    const componentName = componentLabels[componentId] || componentId;
    
    // Update usedIn for the upload
    setUploads((prev) =>
      prev.map((item) => {
        if (item.id === uploadId) {
          const usedIn = item.usedIn.includes(componentName) 
            ? item.usedIn 
            : [...item.usedIn, componentName];
          return { ...item, usedIn };
        }
        return item;
      })
    );

    // Select the component so the user can see it
    setActiveComponent(componentId);
  };

  // Clone preview content to fullscreen modal
  useEffect(() => {
    if (isFullscreen) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const previewContainer = document.querySelector('[data-preview-scroll-container]') as HTMLElement;
        const fullscreenContainer = document.getElementById('fullscreen-preview-container');
        
        if (previewContainer && fullscreenContainer) {
          // Clone the inner content (first child of preview container)
          const innerContent = previewContainer.firstElementChild as HTMLElement;
          if (innerContent) {
            const cloned = innerContent.cloneNode(true) as HTMLElement;
            // Preserve all styles and ensure full width/height, remove margins/padding
            cloned.style.minHeight = '100%';
            cloned.style.width = '100%';
            cloned.style.display = 'flex';
            cloned.style.flexDirection = 'column';
            cloned.style.margin = '0';
            cloned.style.padding = '0';
            fullscreenContainer.innerHTML = '';
            fullscreenContainer.appendChild(cloned);
            
            // Ensure the first child (navigation) also has no margin-top
            const firstChild = cloned.firstElementChild as HTMLElement;
            if (firstChild) {
              firstChild.style.marginTop = '0';
            }
          }
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen, componentState, colorPalette, fontSettings, navigationSettings, heroSettings, viewport, aboutSettings, programSettings, bracketSettings]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#05060D] text-white flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/10 bg-[#0E1020] px-8 py-5 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Live Editor</p>
          <h1 className="text-2xl font-semibold mt-1">Bouw een geheel eigen pagina</h1>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3">
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
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm transition flex items-center gap-2"
            title="Fullscreen preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Fullscreen
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end gap-3">
          <BackButton onClick={() => router.push('/dashboard')} />
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative pt-[85px]">
        {/* Left panel */}
        <aside className="w-[420px] bg-[#0E1020] border-r border-white/10 flex fixed left-0 top-[85px] h-[calc(100vh-85px)] overflow-hidden z-10 flex-shrink-0">
          <div className="w-20 border-r border-white/10 flex flex-col items-center py-6 px-3 gap-4">
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

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">Editor</p>
                <h2 className="text-lg font-semibold capitalize">
                  {activeTab === 'components' && 'Select and change your components'}
                  {activeTab === 'colors' && 'Global theme colors'}
                  {activeTab === 'fonts' && 'Typography system'}
                  {activeTab === 'uploads' && 'Asset library'}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetAllSettings}
                className="group text-[11px] uppercase tracking-[0.35em] text-white flex items-center gap-2 bg-gradient-to-r from-[#755DFF] to-[#4AD4FF] px-4 py-2 rounded-full shadow-[0_10px_25px_rgba(117,93,255,0.45)] hover:shadow-[0_12px_30px_rgba(117,93,255,0.65)] transition whitespace-nowrap"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                  ↺
                </span>
                Reset
              </button>
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-5 py-5 pr-10 -mr-6 space-y-4">
              {activeTab === 'components' && (
                isHydrated ? (
                <>
                  <div className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                    COMPONENTS.every(comp => componentState[comp.id]) 
                      ? 'border-[#4AD4FF] bg-gradient-to-r from-[#755DFF]/20 to-[#4AD4FF]/20' 
                      : 'border-white/20 bg-[#11132A] hover:border-white/40'
                  }`}>
                    <div className="flex items-center gap-3 text-left flex-1">
                      <div className={`p-2 rounded-lg ${
                        COMPONENTS.every(comp => componentState[comp.id]) 
                          ? 'bg-gradient-to-br from-[#755DFF] to-[#4AD4FF]' 
                          : 'bg-white/10'
                      }`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Select All</p>
                        <p className="text-xs text-white/50">
                          {COMPONENTS.every(comp => componentState[comp.id]) ? 'all components visible' : 'click to show all'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const allVisible = COMPONENTS.every(comp => componentState[comp.id]);
                        setComponentState((prev) => {
                          const newState = COMPONENTS.reduce((acc, comp) => {
                            acc[comp.id] = !allVisible;
                            return acc;
                          }, {} as Record<string, boolean>);
                          return { ...prev, ...newState };
                        });
                      }}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-all duration-300 shadow-lg ${
                        COMPONENTS.every(comp => componentState[comp.id]) 
                          ? 'bg-gradient-to-r from-[#755DFF] to-[#4AD4FF] shadow-[#755DFF]/50' 
                          : 'bg-white/20 shadow-none'
                      }`}
                      role="switch"
                      aria-checked={COMPONENTS.every(comp => componentState[comp.id])}
                    >
                      <span
                        className={`inline-block h-5 w-5 bg-white rounded-full transform transition-all duration-300 shadow-md ${
                          COMPONENTS.every(comp => componentState[comp.id]) ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <SortableContext
                    items={componentOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedComponents.map((component) => {
                    const isActive = activeComponent === component.id;
                    return (
                      <SortableComponentItem
                        key={component.id}
                        component={component}
                        isActive={isActive}
                        isVisible={componentState[component.id]}
                        onSelect={() => handleComponentSelect(component.id)}
                        onToggle={(e) => {
                          e.stopPropagation();
                          setComponentState((prev) => ({
                            ...prev,
                            [component.id]: !prev[component.id],
                          }));
                        }}
                      />
                    );
                  })}
                  </SortableContext>
                </>
                ) : (
                  <div className="text-sm text-white/50">Componenten laden...</div>
                )
              )}

              {activeTab === 'colors' && (
                <div className="space-y-5 w-full max-w-full min-w-0">
                  <div className="flex flex-col gap-4 w-full max-w-full min-w-0">
                    {BASE_COLOR_FIELDS.map(({ key, label, helper }) => {
                      const value = baseColors[key] ?? DEFAULT_BASE_COLORS[key];
                      const colorInputId = `base-color-input-${key}`;
                      return (
                        <div key={key} className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#11132A] p-4 space-y-3 overflow-hidden">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-white/50">{label}</p>
                              {helper && <p className="text-[11px] text-white/40 mt-1">{helper}</p>}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                              <button
                                type="button"
                                onClick={() => copyBaseColorValue(key)}
                                className="px-2 py-1 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                              >
                                {copiedColorKey === key ? 'Gekopieerd' : 'Copy'}
                              </button>
                              {!baseColorIsDefault(key) && (
                                <button
                                  type="button"
                                  onClick={() => resetBaseColorValue(key)}
                                  className="px-2 py-1 rounded-lg border border-white/10 text-white/60 hover:border-white/40 transition"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <label
                                  htmlFor={colorInputId}
                                  className="w-12 h-12 rounded-xl border border-white/10 shadow-inner cursor-pointer flex items-center justify-center"
                                  style={{ background: value }}
                                >
                                  <span className="sr-only">Selecteer kleur voor {label}</span>
                                </label>
                                <input
                                  id={colorInputId}
                                  type="color"
                                  value={value}
                                  onChange={(e) => handleBaseColorChange(key, e.target.value)}
                                  className="sr-only"
                                />
                                <div className="flex-1 min-w-[180px]">
                                  <input
                                    value={value}
                                    onChange={(e) => handleBaseColorTextInput(key, e.target.value)}
                                    className="w-full bg-[#0E1020] border border-white/10 rounded-lg px-3 py-2 font-mono text-sm uppercase tracking-[0.1em] focus:outline-none focus:border-[#755DFF]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Hero overlay intensiteit</p>
                        <p className="text-[11px] text-white/40 mt-1">Bepaalt hoe donker de hero achtergrond is</p>
                      </div>
                      <span className="text-sm font-semibold text-white/70">{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(overlayOpacity * 100)}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                    />
                  </div>
                  <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Theme presets</p>
                        <p className="text-xs text-white/50">Selecteer een palette als startpunt</p>
                      </div>
                      <button
                        onClick={resetColors}
                        className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white transition"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset.id)}
                          className="rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#0E1020] py-3 px-3 text-left"
                        >
                          <span className="text-xs uppercase tracking-[0.3em] block mb-2 text-white/60">
                            {preset.name}
                          </span>
                          <div className="flex gap-2">
                            {BASE_COLOR_FIELDS.map(({ key }) => (
                              <span
                                key={`${preset.id}-${key}`}
                                className="flex-1 h-4 rounded-full"
                                style={{ background: preset.baseColors[key] ?? baseColors[key] ?? DEFAULT_BASE_COLORS[key] }}
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
                      <select
                        value={headingFontSelectValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'custom') {
                            return;
                          }
                          updateFontSetting('headingFamily', value);
                        }}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      >
                        <option value="custom">Custom font</option>
                        {HEADING_FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                      {headingFontSelectValue === 'custom' && (
                        <input
                          value={fontSettings.headingFamily}
                          onChange={(e) => updateFontSetting('headingFamily', e.target.value)}
                          className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                          placeholder="Google Fonts naam (bijv. Lora)"
                        />
                      )}
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Body font</span>
                      <select
                        value={bodyFontSelectValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'custom') {
                            return;
                          }
                          updateFontSetting('bodyFamily', value);
                        }}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      >
                        <option value="custom">Custom font</option>
                        {BODY_FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                      {bodyFontSelectValue === 'custom' && (
                        <input
                          value={fontSettings.bodyFamily}
                          onChange={(e) => updateFontSetting('bodyFamily', e.target.value)}
                          className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                          placeholder="Google Fonts naam (bijv. Lato)"
                        />
                      )}
                    </label>
                  </div>

                  <div className="bg-[#11132A] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-semibold">Font sizes</p>
                      <button
                        type="button"
                        onClick={resetFontSizes}
                        className="text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-white/40 transition"
                      >
                        Standaard
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(fontSettings.sizes).map(([key, value]) => (
                        <label key={key} className="flex flex-col gap-2">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">{key}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={12}
                              max={60}
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

                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                        <span>Heading weight</span>
                        <span className="text-white/70 tracking-[0.1em]">{fontSettings.weights.heading}</span>
                      </div>
                      <select
                        value={fontSettings.weights.heading}
                        onChange={(e) => updateFontSetting('weights.heading', Number(e.target.value))}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      >
                        {WEIGHT_OPTIONS.map((option) => (
                          <option key={`heading-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                        <span>Body weight</span>
                        <span className="text-white/70 tracking-[0.1em]">{fontSettings.weights.body}</span>
                      </div>
                      <select
                        value={fontSettings.weights.body}
                        onChange={(e) => updateFontSetting('weights.body', Number(e.target.value))}
                        className="bg-[#11132A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#755DFF]"
                      >
                        {WEIGHT_OPTIONS.map((option) => (
                          <option key={`body-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                        <span>Line height</span>
                        <span className="text-white/70 tracking-[0.1em]">{fontSettings.lineHeight}%</span>
                      </div>
                      <input
                        type="range"
                        min={110}
                        max={180}
                        value={fontSettings.lineHeight}
                        onChange={(e) => updateFontSetting('lineHeight', Number(e.target.value))}
                      />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0E1020] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                        <span>Letter spacing</span>
                        <span className="text-white/70 tracking-[0.1em]">{fontSettings.letterSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={fontSettings.letterSpacing}
                        onChange={(e) => updateFontSetting('letterSpacing', Number(e.target.value))}
                      />
                    </div>
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
                      <DraggableUploadItem
                        key={asset.id}
                        item={asset}
                        onDelete={deleteUpload}
                        onRename={renameUpload}
                        onUseInComponent={(componentId, imageUrl) => applyImageToComponent(componentId, imageUrl, asset.id)}
                      />
                    ))}
                  </div>
                  {uploads.length === 0 && (
                    <div className="text-center py-12 text-white/40 text-sm">
                      <Icon name="image" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No assets uploaded yet</p>
                      <p className="text-xs mt-1">Click &quot;Upload new asset&quot; to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Middle preview area */}
        <section className="bg-[#03040B] absolute left-[420px] right-[368px] top-[85px] bottom-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-10 -mr-6" data-preview-scroll-container>
            <div 
              className="w-full min-h-full bg-gradient-to-br from-[#0B0E1F] to-[#020308] flex flex-col mx-auto"
              style={{ 
                backgroundColor: colorPalette.pageBackground,
                fontFamily: formatFontStack(fontSettings.bodyFamily),
                color: colorPalette.bodyText,
                maxWidth: viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px',
                width: viewport === 'desktop' ? '100%' : 'auto',
                boxShadow: viewport !== 'desktop' ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none',
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
                    order: componentOrderMap['navigation'] ?? 0,
                  }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className={`container mx-auto px-4 sm:px-6 flex relative z-20 ${navigationWrapperClass}`}>
                    <DroppableImageArea
                      id="preview-navigation-logo"
                      value={navigationSettings.logoUrl}
                      onChange={(url) => setNavigationSettings((prev) => ({ ...prev, logoUrl: url }))}
                      className={`flex items-center gap-2 sm:gap-4 ${navigationLogoWrapperClass}`}
                    >
                      {navigationSettings.logoUrl ? (
                        <img
                          src={navigationSettings.logoUrl}
                          alt="Logo"
                          style={{ width: viewport === 'mobile' ? Math.min(navigationSettings.logoWidth, 80) : navigationSettings.logoWidth, height: 'auto' }}
                          className="object-contain"
                        />
                      ) : (
                        <span
                          className="text-lg sm:text-xl font-bold tracking-[0.3em]"
                          style={{ color: navigationSettings.textColor, fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          H
                        </span>
                      )}
                    </DroppableImageArea>
                    <ul className={`flex items-center flex-wrap ${navigationMenuGapClass} ${navigationMenuWrapperClass}`}>
                      {navigationSettings.menuItems
                        .filter((item) => item.enabled && item.label.trim())
                        .map((item) => (
                          <li key={item.id} className="relative">
                            <a 
                              href={item.type === 'section' ? item.value : item.value || '#'}
                              className={`${navigationMenuLinkClass} text-sm sm:text-base`}
                              style={{ color: navigationSettings.textColor }}
                              onMouseEnter={(e) => e.currentTarget.style.color = navigationSettings.hoverColor}
                              onMouseLeave={(e) => e.currentTarget.style.color = navigationSettings.textColor}
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                    </ul>
                    {shouldShowNavigationCta && !isStackedNavigationCta && navigationCtaElement}
                  </div>
                  {shouldShowNavigationCta && isStackedNavigationCta && (
                    <div className="container mx-auto px-4 sm:px-6 mt-4 flex justify-center">
                      {navigationCtaElement}
                    </div>
                  )}
                </nav>
              )}

              {/* Hero Section */}
              {componentState.hero && (
                <section 
                  id="hero-section"
                  data-component-id="hero"
                  onClick={(e) => handleComponentClick('hero', e)}
                  className={`relative overflow-hidden cursor-pointer group flex ${
                    selectedHeroTemplate.layout === 'split' 
                      ? 'py-12 px-4 sm:py-16 md:py-24 lg:py-32 sm:px-6' 
                      : 'py-12 px-4 sm:py-16 md:py-20 sm:px-6'
                  }`}
                  style={{ 
                    backgroundColor: colorPalette.sectionBackground, 
                    order: componentOrderMap['hero'] ?? 1,
                    ...(heroSettings.backgroundImageUrl && !selectedHeroTemplate.requiresImage ? {
                      backgroundImage: `url(${heroSettings.backgroundImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } : {})
                  }}
                >
                  {heroSettings.backgroundImageUrl && !selectedHeroTemplate.requiresImage && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${heroSettings.backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: heroSettings.overlayColor,
                      opacity: heroSettings.overlayOpacity / 100,
                      filter: heroSettings.blurOverlay ? 'blur(8px)' : 'none',
                      zIndex: 1,
                    }}
                  />
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  {(() => {
                    const isSplitLayout = selectedHeroTemplate.layout === 'split';
                    const imageFirst = selectedHeroTemplate.imagePosition === 'left';
                    const textAlignment = isSplitLayout ? 'left' : heroSettings.alignment;
                    const justifyContent =
                      heroSettings.verticalAlignment === 'top'
                        ? 'flex-start'
                        : heroSettings.verticalAlignment === 'bottom'
                        ? 'flex-end'
                        : 'center';

                    const textBlock = (
                      <div
                        className={`flex flex-col gap-3 sm:gap-4 md:gap-6 ${isSplitLayout ? 'max-w-xl' : ''}`}
                        style={{
                          textAlign: textAlignment,
                          alignItems:
                            textAlignment === 'center'
                              ? 'center'
                              : textAlignment === 'right'
                              ? 'flex-end'
                              : 'flex-start',
                        }}
                      >
                        <HeadingText
                          level="h2"
                          className="mb-1 sm:mb-2 text-sm sm:text-base uppercase tracking-widest opacity-70"
                          color={colorPalette.mutedText}
                          align={textAlignment}
                        >
                          Rocket League
                        </HeadingText>
                        <HeadingText
                          level="h1"
                          className="font-bold mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                          align={textAlignment}
                        >
                          {heroSettings.title}
                        </HeadingText>
                        <BodyText
                          className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 max-w-3xl"
                          align={textAlignment}
                          style={{
                            marginLeft: textAlignment === 'center' ? 'auto' : undefined,
                            marginRight: textAlignment === 'center' ? 'auto' : undefined,
                          }}
                        >
                          {heroSettings.subtitle}
                        </BodyText>
                        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8" style={{ justifyContent: textAlignment === 'left' ? 'flex-start' : textAlignment === 'right' ? 'flex-end' : 'center' }}>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-lg sm:text-xl md:text-2xl">📅</span>
                            <span className="text-xs sm:text-sm">17 januari 2026</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-lg sm:text-xl md:text-2xl">📍</span>
                            <span className="text-xs sm:text-sm">Rotterdam Ahoy</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-lg sm:text-xl md:text-2xl">👥</span>
                            <span className="text-xs sm:text-sm">16 Teams</span>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap" style={{ justifyContent: textAlignment === 'left' ? 'flex-start' : textAlignment === 'right' ? 'flex-end' : 'center' }}>
                          <a 
                            href={heroSettings.primaryButton.link}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: heroSettings.primaryButton.background,
                              color: heroSettings.primaryButton.textColor
                            }}
                          >
                            {heroSettings.primaryButton.label}
                          </a>
                          <a 
                            href={heroSettings.secondaryButton.link}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg font-semibold border text-sm sm:text-base transition-all hover:scale-105"
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
                    );

                    const imageBlock = selectedHeroTemplate.requiresImage ? (
                      <DroppableImageArea
                        id="preview-hero-image"
                        value={heroSettings.heroImageUrl}
                        onChange={(url) => setHeroSettings((prev) => ({ ...prev, heroImageUrl: url }))}
                        className="w-full flex justify-center"
                        minHeight="260px"
                        style={{ padding: '1rem 0' }}
                      >
                        {heroSettings.heroImageUrl && (
                          <img
                            src={heroSettings.heroImageUrl}
                            alt="Hero visual"
                            className="w-full max-w-xl rounded-3xl shadow-2xl object-cover"
                            style={{ maxHeight: isSplitLayout ? '500px' : undefined }}
                          />
                        )}
                      </DroppableImageArea>
                    ) : null;

                    return (
                      <div
                        className={`container mx-auto relative z-10 ${isSplitLayout ? 'max-w-6xl grid gap-12 md:grid-cols-2 items-center px-4' : 'max-w-5xl flex flex-col gap-6 px-4'}`}
                        style={{ justifyContent: isSplitLayout ? undefined : justifyContent }}
                      >
                        {isSplitLayout && imageFirst && imageBlock}
                        {textBlock}
                        {isSplitLayout && !imageFirst && imageBlock}
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* About Section */}
              {componentState.about && (
                <section 
                  id="about-section"
                  data-component-id="about"
                  onClick={(e) => handleComponentClick('about', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: aboutSettings.backgroundColor, paddingTop: aboutSettings.padding.top, paddingBottom: aboutSettings.padding.bottom, order: componentOrderMap['about'] ?? 2 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl relative z-20 px-4 sm:px-6">
                    {(() => {
                      const renderAboutButtons = (align: 'left' | 'center' = 'left', tone: 'default' | 'inverted' = 'default') => {
                        if (!aboutSettings.buttons.length) return null;
                        const textColor = tone === 'inverted' ? '#F9FAFB' : colorPalette.primary;
                        const borderColor = tone === 'inverted' ? 'rgba(255,255,255,0.55)' : colorPalette.primary;
                        const backgroundColor = tone === 'inverted' ? 'rgba(255,255,255,0.08)' : 'transparent';

                        return (
                          <div className={`flex flex-wrap gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
                            {aboutSettings.buttons.map((button) => (
                              <a
                                key={button.id}
                                href={button.link}
                                className="px-4 py-2 sm:px-5 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all hover:scale-105"
                                style={{ borderColor, color: textColor, backgroundColor }}
                              >
                                {button.label}
                              </a>
                            ))}
                          </div>
                        );
                      };

                      const renderAboutBullets = ({
                        variant = 'list',
                        align = 'left',
                        tone = 'default',
                      }: {
                        variant?: 'list' | 'grid';
                        align?: 'left' | 'center';
                        tone?: 'default' | 'inverted';
                      } = {}) => {
                        if (aboutSettings.bullets.length === 0) return null;

                        if (variant === 'grid') {
                          return (
                            <div className={`grid gap-4 ${aboutSettings.bullets.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                              {aboutSettings.bullets.map((bullet) => (
                                <div
                                  key={bullet.id}
                                  className="rounded-2xl border p-4 text-left"
                                  style={{
                                    borderColor: tone === 'inverted' ? 'rgba(255,255,255,0.35)' : colorPalette.border,
                                    backgroundColor: tone === 'inverted' ? 'rgba(255,255,255,0.05)' : colorPalette.cardBackground,
                                  }}
                                >
                                  <BodyText as="p" className="opacity-90" color={tone === 'inverted' ? '#F9FAFB' : undefined}>
                                    {bullet.text}
                                  </BodyText>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        return (
                          <ul className={`space-y-2 ${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
                            {aboutSettings.bullets.map((bullet) => (
                              <li
                                key={bullet.id}
                                className={`flex items-start gap-2 ${align === 'center' ? 'justify-center text-left' : ''}`}
                              >
                                <span className="mt-1" style={{ color: tone === 'inverted' ? '#F9FAFB' : colorPalette.primary }}>•</span>
                                <BodyText as="span" color={tone === 'inverted' ? '#F9FAFB' : undefined}>
                                  {bullet.text}
                                </BodyText>
                              </li>
                            ))}
                          </ul>
                        );
                      };

                      const renderAboutMainText = ({
                        align = 'left',
                        includeBullets = true,
                        bulletVariant = 'list',
                        includeButtons = true,
                        subtitleColor,
                        titleColor,
                        bodyColor,
                        bulletTone = 'default',
                        buttonTone = 'default',
                      }: {
                        align?: 'left' | 'center';
                        includeBullets?: boolean;
                        bulletVariant?: 'list' | 'grid';
                        includeButtons?: boolean;
                        subtitleColor?: string;
                        titleColor?: string;
                        bodyColor?: string;
                        bulletTone?: 'default' | 'inverted';
                        buttonTone?: 'default' | 'inverted';
                      } = {}) => (
                        <div className={`space-y-4 ${align === 'center' ? 'text-center' : ''}`}>
                        <HeadingText
                          level="h2"
                          className="uppercase tracking-widest opacity-70"
                            color={subtitleColor ?? colorPalette.mutedText}
                            align={align}
                        >
                          {aboutSettings.subtitle}
                        </HeadingText>
                          <HeadingText level="h1" className="font-bold" color={titleColor} align={align}>
                          {aboutSettings.title}
                        </HeadingText>
                          <BodyText className="opacity-90" align={align} color={bodyColor}>
                          {aboutSettings.paragraph}
                        </BodyText>
                          {includeBullets && renderAboutBullets({ variant: bulletVariant, align, tone: bulletTone })}
                          {includeButtons && renderAboutButtons(align, buttonTone)}
                        </div>
                      );

                      const renderAboutImage = (
                        idSuffix: string,
                        options: {
                          className?: string;
                          minHeight?: string;
                          imageClassName?: string;
                          imageCover?: boolean;
                        } = {}
                      ) => {
                        const minHeight = options.minHeight ?? '280px';
                        return (
                          <DroppableImageArea
                            id={`preview-about-image-${idSuffix}`}
                            value={aboutSettings.imageUrl}
                            onChange={(url) => setAboutSettings((prev) => ({ ...prev, imageUrl: url }))}
                            className={`w-full flex justify-center items-center ${options.className ?? ''}`}
                            style={{ minHeight }}
                          >
                            {aboutSettings.imageUrl ? (
                              <img
                                src={aboutSettings.imageUrl}
                                alt="About visual"
                                className={`w-full ${options.imageClassName ?? 'max-w-md'} ${aboutSettings.imageShadow ? 'shadow-2xl' : ''}`}
                                style={{
                                  borderRadius: aboutSettings.imageRadius,
                                  objectFit: options.imageCover ? 'cover' : 'contain',
                                  height: options.imageCover ? '100%' : undefined,
                                }}
                              />
                            ) : (
                              <div
                                className="w-full border border-dashed rounded-3xl flex items-center justify-center text-white/40 text-sm"
                                style={{ minHeight, borderColor: colorPalette.border }}
                              >
                                Voeg een afbeelding toe
                        </div>
                            )}
                          </DroppableImageArea>
                        );
                      };

                      const renderSplitLayout = (position: 'left' | 'right') => (
                        <div className="grid gap-10 items-center md:grid-cols-2">
                          {position === 'left' && renderAboutImage('left')}
                          {renderAboutMainText()}
                          {position === 'right' && renderAboutImage('right')}
                      </div>
                      );

                      const renderStackedLayout = () => (
                        <div className="space-y-10">
                          {renderAboutImage('stacked', { imageClassName: 'max-w-3xl rounded-3xl', minHeight: '320px' })}
                          {renderAboutMainText({ align: 'center' })}
                        </div>
                      );

                      const renderSpotlightLayout = () => (
                        <DroppableImageArea
                          id="preview-about-spotlight"
                          value={aboutSettings.imageUrl}
                          onChange={(url) => setAboutSettings((prev) => ({ ...prev, imageUrl: url }))}
                          className="w-full"
                          style={{ minHeight: '320px' }}
                        >
                          <div className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[320px]">
                            {aboutSettings.imageUrl ? (
                            <img
                              src={aboutSettings.imageUrl}
                              alt="About visual"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ filter: 'brightness(0.6)' }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-r from-[#11132A] to-[#0A0C1B]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                            <div className="relative p-8 md:p-12 space-y-6">
                              {renderAboutMainText({
                                align: 'left',
                                includeBullets: false,
                                includeButtons: false,
                                subtitleColor: '#E0E7FF',
                                titleColor: '#FFFFFF',
                                bodyColor: '#F3F4F6',
                              })}
                              <div className="space-y-6">
                                {renderAboutBullets({ variant: 'grid', tone: 'inverted' })}
                                {renderAboutButtons('left', 'inverted')}
                              </div>
                            </div>
                          </div>
                        </DroppableImageArea>
                      );

                      const renderFeatureGridLayout = () => (
                        <div className="grid gap-8 lg:grid-cols-2 items-start">
                          {renderAboutMainText({ align: 'left', includeBullets: false })}
                          <div className="space-y-5">
                            {renderAboutBullets({ variant: 'grid', align: 'left' })}
                            {renderAboutImage('feature', {
                              className: 'justify-center',
                              minHeight: '240px',
                              imageClassName: 'w-full h-60 object-cover rounded-3xl',
                              imageCover: true,
                            })}
                    </div>
                        </div>
                      );

                      let aboutLayoutContent: ReactNode;

                      switch (aboutSettings.layout) {
                        case 'image-right':
                          aboutLayoutContent = renderSplitLayout('right');
                          break;
                        case 'stacked':
                          aboutLayoutContent = renderStackedLayout();
                          break;
                        case 'spotlight':
                          aboutLayoutContent = renderSpotlightLayout();
                          break;
                        case 'feature-grid':
                          aboutLayoutContent = renderFeatureGridLayout();
                          break;
                        case 'image-left':
                        default:
                          aboutLayoutContent = renderSplitLayout('left');
                      }

                      return aboutLayoutContent;
                    })()}
                  </div>
                </section>
              )}

              {/* Program / Schedule */}
              {componentState.program && (
                <section 
                  id="schedule-section"
                  data-component-id="program"
                  onClick={(e) => handleComponentClick('program', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: programSettings.backgroundColor, order: componentOrderMap['program'] ?? 3 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-5xl relative z-20 px-4 sm:px-6">
                    <HeadingText
                      level="h2"
                      className="text-center mb-4 uppercase tracking-widest opacity-70"
                      color={colorPalette.mutedText}
                    >
                      Planning
                    </HeadingText>
                    <HeadingText level="h1" className="text-center mb-12">
                      Toernooi Schema
                    </HeadingText>
                    {programSettings.layout === 'timeline' ? (
                      <div className="space-y-4">
                        {programSettings.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex gap-6 p-6 rounded-xl border"
                            style={{ 
                              backgroundColor: colorPalette.cardBackground,
                              borderColor: programSettings.borderColor
                            }}
                          >
                            <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap" style={{ color: programSettings.timeColor, minWidth: `${programSettings.columnWidth}%` }}>
                              {item.time}
                            </div>
                            <div className="flex-1">
                              <HeadingText
                                level="h2"
                                className="mb-2 flex items-center gap-2"
                              >
                                {item.icon && <span>{item.icon}</span>}
                                {item.title}
                              </HeadingText>
                              {item.description && (
                                <BodyText variant="small" className="opacity-80">
                                  {item.description}
                                </BodyText>
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
                            {programSettings.items.map((item) => (
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
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: groupStageSettings.colors.backgroundColor, order: componentOrderMap['group-stage'] ?? 4 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <HeadingText
                      level="h2"
                      className="text-center mb-4 uppercase tracking-widest opacity-70"
                      color={groupStageSettings.colors.subtitleColor}
                      style={{ fontSize: `${groupStageSettings.fontSizes.subtitle}px` }}
                    >
                      Competitie Formaat
                    </HeadingText>
                    <HeadingText 
                      level="h1" 
                      className="text-center mb-6"
                      color={groupStageSettings.colors.titleColor}
                      style={{ fontSize: `${groupStageSettings.fontSizes.title}px` }}
                    >
                      Groepsfase Indeling
                    </HeadingText>
                    <BodyText 
                      className="text-center mb-12 opacity-90"
                      color={groupStageSettings.colors.bodyTextColor}
                      style={{ fontSize: `${groupStageSettings.fontSizes.subtitle}px` }}
                    >
                      {groupStageSettings.numberOfGroups * groupStageSettings.teamsPerGroup} teams verdeeld over {groupStageSettings.numberOfGroups} groepen. Top 2 van elke groep gaat door naar kwartfinales.
                    </BodyText>
                        <div 
                      className="grid gap-4 md:gap-6 w-full"
                          style={{ 
                        gridTemplateColumns: `repeat(${groupStageSettings.numberOfGroups}, minmax(0, 1fr))`,
                      }}
                    >
                      {groupStageSettings.groups.map((group) => (
                        <div 
                          key={group.id}
                          className={`rounded-xl border ${groupStageSettings.numberOfGroups > 4 ? 'p-3' : groupStageSettings.numberOfGroups > 2 ? 'p-4' : 'p-6'}`}
                          style={{ 
                            backgroundColor: groupStageSettings.colors.cardBackground,
                            borderColor: groupStageSettings.colors.cardBorder
                          }}
                        >
                          <HeadingText
                            level="h2"
                            className={`${groupStageSettings.numberOfGroups > 4 ? 'mb-2' : groupStageSettings.numberOfGroups > 2 ? 'mb-3' : 'mb-4'}`}
                            color={groupStageSettings.colors.groupNameColor}
                            style={{ fontSize: `${groupStageSettings.fontSizes.groupName}px` }}
                          >
                            Groep {group.name}
                          </HeadingText>
                          <div className={`${groupStageSettings.numberOfGroups > 4 ? 'space-y-1' : 'space-y-2'}`}>
                            {group.teams.map((team) => {
                              const groupColor = groupStageSettings.colors.groupNameColor;
                              const hoverBgColor = groupColor + '15';
                              const hoverBorderColor = groupColor + '40';
                              
                              return (
                                <div 
                                  key={team.id}
                                  className={`group/team flex items-center justify-between rounded-lg transition-all duration-200 cursor-pointer ${groupStageSettings.numberOfGroups > 4 ? 'p-2' : 'p-3'} hover:scale-[1.02] hover:shadow-lg`}
                                  style={{ 
                                    backgroundColor: groupStageSettings.colors.teamItemBackground,
                                    border: `1px solid transparent`,
                                    '--hover-bg': hoverBgColor,
                                    '--hover-border': hoverBorderColor,
                                  } as React.CSSProperties & { '--hover-bg': string; '--hover-border': string }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = hoverBgColor;
                                    e.currentTarget.style.borderColor = hoverBorderColor;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = groupStageSettings.colors.teamItemBackground;
                                    e.currentTarget.style.borderColor = 'transparent';
                                  }}
                                >
                                  <div className={`flex items-center ${groupStageSettings.numberOfGroups > 4 ? 'gap-2' : 'gap-3'} min-w-0`}>
                                    <span 
                                      className="opacity-60 flex-shrink-0 transition-opacity group-hover/team:opacity-100"
                                      style={{ 
                                        fontSize: `${groupStageSettings.fontSizes.teamTag}px`,
                                        color: groupStageSettings.colors.seedColor
                                      }}
                                    >
                                      {team.seed}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <HeadingText 
                                        level="h3" 
                                        className="truncate transition-colors group-hover/team:opacity-100" 
                                        color={groupStageSettings.colors.teamNameColor}
                                        style={{ fontSize: `${groupStageSettings.fontSizes.teamName}px` }}
                                      >
                                      {team.name}
                                    </HeadingText>
                                      <BodyText 
                                        as="div" 
                                        variant="small" 
                                        className="opacity-60 truncate transition-opacity group-hover/team:opacity-80"
                                        style={{ 
                                          fontSize: `${groupStageSettings.fontSizes.teamTag}px`,
                                          color: groupStageSettings.colors.teamTagColor
                                        }}
                                      >
                                      {team.tag}
                                    </BodyText>
                                  </div>
                                </div>
                              </div>
                              );
                            })}
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
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.sectionBackground, order: componentOrderMap['bracket'] ?? 5 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <HeadingText level="h1" className="text-center mb-6">
                      Tournament Bracket
                    </HeadingText>
                    {bracketSettings.source === 'api' && (
                      <BodyText className="text-center mb-4" variant="small">
                        Koppeling met {bracketSettings.apiEndpoint || 'extern API'} actief
                      </BodyText>
                    )}
                    <div className={`grid gap-4 ${bracketSettings.rounds.length < 3 ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
                      {bracketSettings.rounds.map((round) => (
                        <div key={round.id} className="space-y-4">
                          <HeadingText
                            level="h2"
                            className="mb-4 text-center"
                            color={bracketSettings.style.lineColor}
                          >
                            {round.name}
                          </HeadingText>
                          {round.matches.map((match) => (
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
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: teamsSettings.colors.backgroundColor, order: componentOrderMap['teams'] ?? 6 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <HeadingText
                      level="h2"
                      className="text-center mb-4 uppercase tracking-widest opacity-70"
                      color={teamsSettings.colors.subtitleColor}
                      style={{ fontSize: `${teamsSettings.fontSizes.subtitle}px` }}
                    >
                      {teamsSettings.subtitle}
                    </HeadingText>
                    <HeadingText 
                      level="h1" 
                      className="text-center mb-12"
                      color={teamsSettings.colors.titleColor}
                      style={{ fontSize: `${teamsSettings.fontSizes.title}px` }}
                    >
                      {teamsSettings.title}
                    </HeadingText>
                    <div 
                      className="grid gap-6"
                      style={{ 
                        gridTemplateColumns: `repeat(${Math.min(teamsSettings.columns, 6)}, 1fr)`,
                        display: 'grid'
                      }}
                    >
                      {teamsSettings.teams.map((team) => (
                        <div 
                          key={team.id}
                          className="p-6 rounded-xl border flex flex-col h-full"
                          style={{ 
                            backgroundColor: teamsSettings.colors.cardBackground,
                            borderColor: teamsSettings.colors.cardBorder
                          }}
                        >
                          <div className="flex justify-center mb-4">
                            {team.logoUrl ? (
                              <img 
                                src={team.logoUrl} 
                                alt={team.name}
                                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl object-cover"
                              />
                            ) : (
                              <div 
                                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold"
                                style={{ 
                                  backgroundColor: teamsSettings.colors.initialsBackground, 
                                  color: teamsSettings.colors.initialsText 
                                }}
                              >
                                {team.initials}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center mb-4 min-h-[60px] justify-center">
                            <HeadingText 
                              level="h2" 
                              className="text-center mb-2"
                              color={teamsSettings.colors.teamNameColor}
                              style={{ fontSize: `${teamsSettings.fontSizes.teamName}px` }}
                            >
                              {team.name}
                            </HeadingText>
                            <BodyText 
                              className="text-center opacity-60" 
                              variant="small"
                              color={teamsSettings.colors.teamTagColor}
                              style={{ fontSize: `${teamsSettings.fontSizes.teamTag}px` }}
                            >
                              {team.tag}
                            </BodyText>
                          </div>
                          <div className="space-y-2 mt-auto">
                            {team.players.map((player) => (
                              <div key={player.id} className="flex items-center gap-2 justify-center">
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                  {player.avatarUrl ? (
                                    <img 
                                      src={player.avatarUrl} 
                                      alt={player.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                      {player.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <BodyText
                                  className="opacity-80 flex-1 text-center"
                                  variant="small"
                                  color={teamsSettings.colors.playerNameColor}
                                  style={{ fontSize: `${teamsSettings.fontSizes.playerName}px` }}
                                >
                                  {player.name}
                                </BodyText>
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
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: statsSettings.colors.backgroundColor, order: componentOrderMap['stats'] ?? 7 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    {(statsSettings.title || statsSettings.subtitle) && (
                      <div className="text-center mb-12">
                        {statsSettings.title && (
                          <HeadingText 
                            level="h1" 
                            className="mb-4"
                            color={statsSettings.colors.titleColor}
                            style={{ fontSize: `${statsSettings.fontSizes.title}px` }}
                          >
                            {statsSettings.title}
                          </HeadingText>
                        )}
                        {statsSettings.subtitle && (
                          <BodyText 
                            className="opacity-90"
                            color={statsSettings.colors.subtitleColor}
                            style={{ fontSize: `${statsSettings.fontSizes.subtitle}px` }}
                          >
                            {statsSettings.subtitle}
                          </BodyText>
                        )}
                      </div>
                    )}
                    {statsSettings.layout === 'grid' && (
                      <div className={`grid gap-6 ${statsSettings.stats.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : statsSettings.stats.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                        {statsSettings.stats.map((stat) => (
                          <div 
                            key={stat.id}
                            className="text-center p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                          style={{ 
                              backgroundColor: statsSettings.colors.cardBackground,
                              borderColor: statsSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h1" 
                              className="mb-2" 
                              color={statsSettings.colors.statValueColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statValue}px` }}
                            >
                            {stat.value}
                          </HeadingText>
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={statsSettings.colors.statLabelColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statLabel}px` }}
                            >
                            {stat.label}
                          </BodyText>
                        </div>
                      ))}
                    </div>
                    )}
                    {statsSettings.layout === 'list' && (
                      <div className="space-y-4">
                        {statsSettings.stats.map((stat) => (
                          <div 
                            key={stat.id}
                            className="flex items-center justify-between p-6 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                            style={{ 
                              backgroundColor: statsSettings.colors.cardBackground,
                              borderColor: statsSettings.colors.cardBorder
                            }}
                          >
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={statsSettings.colors.statLabelColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statLabel}px` }}
                            >
                              {stat.label}
                            </BodyText>
                            <HeadingText 
                              level="h1" 
                              color={statsSettings.colors.statValueColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statValue}px` }}
                            >
                              {stat.value}
                            </HeadingText>
                          </div>
                        ))}
                      </div>
                    )}
                    {statsSettings.layout === 'cards' && (
                      <div className={`grid gap-6 ${statsSettings.stats.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {statsSettings.stats.map((stat) => (
                          <div 
                            key={stat.id}
                            className="text-center p-8 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                            style={{ 
                              backgroundColor: statsSettings.colors.cardBackground,
                              borderColor: statsSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h1" 
                              className="mb-4" 
                              color={statsSettings.colors.statValueColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statValue + 8}px` }}
                            >
                              {stat.value}
                            </HeadingText>
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={statsSettings.colors.statLabelColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statLabel + 2}px` }}
                            >
                              {stat.label}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                    {statsSettings.layout === 'minimal' && (
                      <div className="flex flex-wrap justify-center gap-8">
                        {statsSettings.stats.map((stat) => (
                          <div 
                            key={stat.id}
                            className="text-center transition-all duration-200 hover:scale-105"
                          >
                            <HeadingText 
                              level="h1" 
                              className="mb-1" 
                              color={statsSettings.colors.statValueColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statValue}px` }}
                            >
                              {stat.value}
                            </HeadingText>
                            <BodyText 
                              className="opacity-60" 
                              variant="small"
                              color={statsSettings.colors.statLabelColor}
                              style={{ fontSize: `${statsSettings.fontSizes.statLabel - 2}px` }}
                            >
                              {stat.label}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Registration Form */}
              {componentState.registration && (
                <section 
                  id="register-section"
                  data-component-id="registration"
                  onClick={(e) => handleComponentClick('registration', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: registrationSettings.colors.backgroundColor, order: componentOrderMap['registration'] ?? 8 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-2xl px-4 sm:px-6">
                    <HeadingText
                      level="h2"
                      className="text-center mb-4 uppercase tracking-widest opacity-70"
                      color={registrationSettings.colors.subtitleColor}
                      style={{ fontSize: `${registrationSettings.fontSizes.subtitle}px` }}
                    >
                      {registrationSettings.subtitle}
                    </HeadingText>
                    <HeadingText 
                      level="h1" 
                      className="text-center mb-6"
                      color={registrationSettings.colors.titleColor}
                      style={{ fontSize: `${registrationSettings.fontSizes.title}px` }}
                    >
                      {registrationSettings.title}
                    </HeadingText>
                    <BodyText 
                      className="text-center mb-8 opacity-90"
                      color={registrationSettings.colors.descriptionColor}
                      style={{ fontSize: `${registrationSettings.fontSizes.description}px` }}
                    >
                      {registrationSettings.description}
                    </BodyText>
                    <form 
                      className="space-y-6 p-8 rounded-xl border"
                      style={{ 
                        backgroundColor: registrationSettings.colors.cardBackground,
                        borderColor: registrationSettings.colors.cardBorder
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {registrationSettings.formFields.teamName.enabled && (
                          <label className="flex flex-col gap-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ 
                                color: registrationSettings.colors.labelColor,
                                fontSize: `${registrationSettings.fontSizes.label}px`
                              }}
                            >
                              {registrationSettings.formFields.teamName.label}
                            </span>
                            <input
                              type="text"
                              placeholder={registrationSettings.formFields.teamName.placeholder}
                              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ 
                                backgroundColor: registrationSettings.colors.inputBackground,
                                borderColor: registrationSettings.colors.inputBorder,
                                color: registrationSettings.colors.inputText
                              }}
                            />
                          </label>
                        )}
                        {registrationSettings.formFields.teamTag.enabled && (
                          <label className="flex flex-col gap-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ 
                                color: registrationSettings.colors.labelColor,
                                fontSize: `${registrationSettings.fontSizes.label}px`
                              }}
                            >
                              {registrationSettings.formFields.teamTag.label}
                            </span>
                            <input
                              type="text"
                              placeholder={registrationSettings.formFields.teamTag.placeholder}
                              className="px-4 py-3 rounded-lg border focus:outline-none"
                              style={{ 
                                backgroundColor: registrationSettings.colors.inputBackground,
                                borderColor: registrationSettings.colors.inputBorder,
                                color: registrationSettings.colors.inputText
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {registrationSettings.formFields.captainName.enabled && (
                          <label className="flex flex-col gap-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ 
                                color: registrationSettings.colors.labelColor,
                                fontSize: `${registrationSettings.fontSizes.label}px`
                              }}
                            >
                              {registrationSettings.formFields.captainName.label}
                            </span>
                            <input
                              type="text"
                              placeholder={registrationSettings.formFields.captainName.placeholder}
                              className="px-4 py-3 rounded-lg border focus:outline-none"
                              style={{ 
                                backgroundColor: registrationSettings.colors.inputBackground,
                                borderColor: registrationSettings.colors.inputBorder,
                                color: registrationSettings.colors.inputText
                              }}
                            />
                          </label>
                        )}
                        {registrationSettings.formFields.captainEmail.enabled && (
                          <label className="flex flex-col gap-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ 
                                color: registrationSettings.colors.labelColor,
                                fontSize: `${registrationSettings.fontSizes.label}px`
                              }}
                            >
                              {registrationSettings.formFields.captainEmail.label}
                            </span>
                            <input
                              type="email"
                              placeholder={registrationSettings.formFields.captainEmail.placeholder}
                              className="px-4 py-3 rounded-lg border focus:outline-none"
                              style={{ 
                                backgroundColor: registrationSettings.colors.inputBackground,
                                borderColor: registrationSettings.colors.inputBorder,
                                color: registrationSettings.colors.inputText
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: registrationSettings.colors.buttonBackground,
                          color: registrationSettings.colors.buttonText,
                          fontSize: `${registrationSettings.fontSizes.button}px`
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = registrationSettings.colors.buttonHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = registrationSettings.colors.buttonBackground}
                      >
                        {registrationSettings.buttonText}
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
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ 
                    backgroundColor: faqSettings.colors.backgroundColor, 
                    order: componentOrderMap['faq'] ?? 9 
                  }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-4xl px-4 sm:px-6">
                    <HeadingText
                      level="h2"
                      className="text-center mb-4 uppercase tracking-widest opacity-70"
                      color={faqSettings.colors.subtitleColor}
                      style={{ fontSize: `${faqSettings.fontSizes.subtitle}px` }}
                    >
                      {faqSettings.subtitle}
                    </HeadingText>
                    <HeadingText 
                      level="h1" 
                      className="text-center mb-12"
                      color={faqSettings.colors.titleColor}
                      style={{ fontSize: `${faqSettings.fontSizes.title}px` }}
                    >
                      {faqSettings.title}
                    </HeadingText>
                    {faqSettings.layout === 'accordion' && (
                      <div className="space-y-4">
                        {faqSettings.items.map((item) => (
                          <div 
                            key={item.id}
                            className="p-6 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                            style={{ 
                              backgroundColor: faqSettings.colors.cardBackground,
                              borderColor: faqSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h2" 
                              className="mb-3"
                              color={faqSettings.colors.questionColor}
                              style={{ fontSize: `${faqSettings.fontSizes.question}px` }}
                            >
                              {item.question}
                            </HeadingText>
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={faqSettings.colors.answerColor}
                              style={{ fontSize: `${faqSettings.fontSizes.answer}px` }}
                            >
                              {item.answer}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                    {faqSettings.layout === 'cards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqSettings.items.map((item) => (
                          <div 
                            key={item.id}
                            className="p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                            style={{ 
                              backgroundColor: faqSettings.colors.cardBackground,
                              borderColor: faqSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h2" 
                              className="mb-3"
                              color={faqSettings.colors.questionColor}
                              style={{ fontSize: `${faqSettings.fontSizes.question}px` }}
                            >
                              {item.question}
                            </HeadingText>
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={faqSettings.colors.answerColor}
                              style={{ fontSize: `${faqSettings.fontSizes.answer}px` }}
                            >
                              {item.answer}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                    {faqSettings.layout === 'list' && (
                      <div className="space-y-3">
                        {faqSettings.items.map((item) => (
                          <div 
                            key={item.id}
                            className="p-4 rounded-lg border transition-all duration-200 hover:bg-white/5"
                            style={{ 
                              backgroundColor: faqSettings.colors.cardBackground,
                              borderColor: faqSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h3" 
                              className="mb-2"
                              color={faqSettings.colors.questionColor}
                              style={{ fontSize: `${faqSettings.fontSizes.question}px` }}
                            >
                              {item.question}
                            </HeadingText>
                            <BodyText 
                              className="opacity-80" 
                              variant="small"
                              color={faqSettings.colors.answerColor}
                              style={{ fontSize: `${faqSettings.fontSizes.answer}px` }}
                            >
                              {item.answer}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                    {faqSettings.layout === 'minimal' && (
                      <div className="space-y-2">
                        {faqSettings.items.map((item) => (
                          <div 
                            key={item.id}
                            className="p-3 rounded border-b transition-all duration-200 hover:bg-white/5"
                            style={{ 
                              borderColor: faqSettings.colors.cardBorder
                            }}
                          >
                            <HeadingText 
                              level="h3" 
                              className="mb-1"
                              color={faqSettings.colors.questionColor}
                              style={{ fontSize: `${faqSettings.fontSizes.question}px` }}
                            >
                              {item.question}
                            </HeadingText>
                            <BodyText 
                              className="opacity-70" 
                              variant="small"
                              color={faqSettings.colors.answerColor}
                              style={{ fontSize: `${faqSettings.fontSizes.answer}px` }}
                            >
                              {item.answer}
                            </BodyText>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Twitch Stream */}
              {componentState.twitch && (
                <section 
                  id="twitch-section"
                  data-component-id="twitch"
                  onClick={(e) => handleComponentClick('twitch', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: twitchSettings.background, order: componentOrderMap['twitch'] ?? 10 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-5xl px-4 sm:px-6">
                    <HeadingText level="h1" className="text-center mb-6">
                      Live Stream
                    </HeadingText>
                    <BodyText className="text-center mb-8 opacity-90">
                      Bekijk de wedstrijden live op Twitch
                    </BodyText>
                    {twitchSettings.channel ? (
                      <div 
                        className="rounded-xl overflow-hidden p-4 md:p-6"
                        style={{ 
                          backgroundColor: colorPalette.cardBackground,
                          borderColor: colorPalette.border,
                          border: `1px solid ${colorPalette.border}`,
                          minHeight: twitchSettings.height,
                        }}
                      >
                        <LivestreamEmbed
                          urlOverride={twitchSettings.channel.includes('://') || twitchSettings.channel.includes('.') 
                            ? twitchSettings.channel 
                            : `https://www.twitch.tv/${twitchSettings.channel}`}
                          layoutOverride={twitchSettings.layout === 'side-by-side' ? 'row' : twitchSettings.layout === 'stream-only' ? 'row' : 'column'}
                          chatEnabledOverride={twitchSettings.showChat && twitchSettings.layout !== 'stream-only'}
                          enabledOverride={true}
                        />
                          </div>
                    ) : (
                        <div 
                        className="rounded-xl border flex items-center justify-center"
                          style={{ 
                            backgroundColor: colorPalette.cardBackground,
                            borderColor: colorPalette.border,
                          minHeight: twitchSettings.height,
                        }}
                      >
                        <div className="text-center space-y-3">
                          <div className="text-2xl sm:text-3xl md:text-4xl">📺</div>
                          <BodyText className="opacity-80" variant="small">
                            Voer een Twitch kanaal of URL in om de stream te tonen
                          </BodyText>
                        </div>
                        </div>
                      )}
                  </div>
                </section>
              )}

              {/* Sponsors */}
              {componentState.sponsors && (
                <section 
                  id="sponsors-section"
                  data-component-id="sponsors"
                  onClick={(e) => handleComponentClick('sponsors', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ 
                    backgroundColor: sponsorSettings.colors.backgroundColor, 
                    order: componentOrderMap['sponsors'] ?? 11 
                  }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <HeadingText 
                      level="h1" 
                      className="text-center mb-6"
                      color={sponsorSettings.colors.titleColor}
                      style={{ fontSize: `${sponsorSettings.fontSizes.title}px` }}
                    >
                      {sponsorSettings.title}
                    </HeadingText>
                    <BodyText 
                      className="text-center mb-12 opacity-90"
                      color={sponsorSettings.colors.subtitleColor}
                      style={{ fontSize: `${sponsorSettings.fontSizes.subtitle}px` }}
                    >
                      {sponsorSettings.subtitle}
                    </BodyText>
                    {sponsorSettings.layout === 'grid' && (
                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                        style={{ 
                          gridTemplateColumns: viewport === 'mobile' ? `repeat(2, minmax(0, 1fr))` : viewport === 'tablet' ? `repeat(${Math.min(3, sponsorSettings.logos.length)}, minmax(0, 1fr))` : `repeat(${sponsorSettings.logos.length}, minmax(0, 1fr))`, 
                          gap: `${sponsorSettings.gap}px` 
                        }}
                      >
                        {sponsorSettings.logos.map((logo) => (
                          <a
                            key={logo.id}
                            href={logo.link}
                            className="rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
                            style={{ 
                              backgroundColor: sponsorSettings.colors.cardBackground,
                              borderColor: sponsorSettings.divider ? sponsorSettings.colors.cardBorder : 'transparent',
                              filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(0%)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(100%)';
                              }
                            }}
                          >
                            {logo.url ? (
                              <img
                                src={logo.url}
                                alt={logo.name}
                                style={{ width: `${sponsorSettings.logoSize}px`, height: 'auto' }}
                                className="p-4"
                              />
                            ) : (
                              <div className="p-4 text-white/40 text-sm">{logo.name}</div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    {sponsorSettings.layout === 'carousel' && (
                      <div
                        className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
                        style={{ gap: `${sponsorSettings.gap}px` }}
                      >
                        {sponsorSettings.logos.map((logo) => (
                          <a
                            key={logo.id}
                            href={logo.link}
                            className="rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-[1.05] hover:shadow-lg flex-shrink-0"
                            style={{ 
                              backgroundColor: sponsorSettings.colors.cardBackground,
                              borderColor: sponsorSettings.divider ? sponsorSettings.colors.cardBorder : 'transparent',
                              minWidth: '180px',
                              filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(0%)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(100%)';
                              }
                            }}
                          >
                            {logo.url ? (
                              <img
                                src={logo.url}
                                alt={logo.name}
                                style={{ width: `${sponsorSettings.logoSize}px`, height: 'auto' }}
                                className="p-4"
                              />
                            ) : (
                              <div className="p-4 text-white/40 text-sm">{logo.name}</div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    {sponsorSettings.layout === 'rows' && (
                      <div className="space-y-4">
                        {Array.from({ length: Math.ceil(sponsorSettings.logos.length / sponsorSettings.columns) }).map((_, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="grid"
                            style={{ 
                              gridTemplateColumns: `repeat(${sponsorSettings.columns}, minmax(0, 1fr))`, 
                              gap: `${sponsorSettings.gap}px` 
                            }}
                          >
                            {sponsorSettings.logos.slice(rowIndex * sponsorSettings.columns, (rowIndex + 1) * sponsorSettings.columns).map((logo) => (
                              <a
                                key={logo.id}
                                href={logo.link}
                                className="rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
                                style={{ 
                                  backgroundColor: sponsorSettings.colors.cardBackground,
                                  borderColor: sponsorSettings.divider ? sponsorSettings.colors.cardBorder : 'transparent',
                                  filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                                }}
                                onMouseEnter={(e) => {
                                  if (sponsorSettings.grayscaleHover) {
                                    e.currentTarget.style.filter = 'grayscale(0%)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (sponsorSettings.grayscaleHover) {
                                    e.currentTarget.style.filter = 'grayscale(100%)';
                                  }
                                }}
                              >
                                {logo.url ? (
                                  <img
                                    src={logo.url}
                                    alt={logo.name}
                                    style={{ width: `${sponsorSettings.logoSize}px`, height: 'auto' }}
                                    className="p-4"
                                  />
                                ) : (
                                  <div className="p-4 text-white/40 text-sm">{logo.name}</div>
                                )}
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {sponsorSettings.layout === 'centered' && (
                      <div className="flex flex-wrap justify-center items-center gap-6">
                        {sponsorSettings.logos.map((logo) => (
                          <a
                            key={logo.id}
                            href={logo.link}
                            className="rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
                            style={{ 
                              backgroundColor: sponsorSettings.colors.cardBackground,
                              borderColor: sponsorSettings.divider ? sponsorSettings.colors.cardBorder : 'transparent',
                              filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(0%)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(100%)';
                              }
                            }}
                          >
                            {logo.url ? (
                              <img
                                src={logo.url}
                                alt={logo.name}
                                style={{ width: `${sponsorSettings.logoSize}px`, height: 'auto' }}
                                className="p-4"
                              />
                            ) : (
                              <div className="p-4 text-white/40 text-sm">{logo.name}</div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    {sponsorSettings.layout === 'minimal' && (
                      <div className="flex flex-wrap justify-center items-center gap-4">
                        {sponsorSettings.logos.map((logo) => (
                          <a
                            key={logo.id}
                            href={logo.link}
                            className="rounded-lg border flex items-center justify-center transition-all duration-200 hover:opacity-80"
                            style={{ 
                              backgroundColor: sponsorSettings.colors.cardBackground,
                              borderColor: sponsorSettings.colors.cardBorder,
                              filter: sponsorSettings.grayscaleHover ? 'grayscale(100%)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(0%)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (sponsorSettings.grayscaleHover) {
                                e.currentTarget.style.filter = 'grayscale(100%)';
                              }
                            }}
                          >
                            {logo.url ? (
                              <img
                                src={logo.url}
                                alt={logo.name}
                                style={{ width: `${Math.min(sponsorSettings.logoSize, 60)}px`, height: 'auto' }}
                                className="p-2"
                              />
                            ) : (
                              <div className="p-2 text-white/40 text-xs">{logo.name}</div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Socials */}
              {componentState.socials && (
                <section 
                  id="socials-section"
                  data-component-id="socials"
                  onClick={(e) => handleComponentClick('socials', e)}
                  className="py-12 px-4 sm:py-16 md:py-20 sm:px-6 cursor-pointer relative group"
                  style={{ backgroundColor: colorPalette.pageBackground, order: componentOrderMap['socials'] ?? 12 }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-4xl px-4 sm:px-6">
                    <HeadingText level="h1" className="text-center mb-6">
                      Volg Ons
                    </HeadingText>
                    <BodyText className="text-center mb-12 opacity-90">
                      Blijf op de hoogte via social media
                    </BodyText>
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
                    borderColor: colorPalette.border,
                    order: componentOrderMap['footer'] ?? 13
                  }}
                >
                  <div
                    className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-10"
                    style={{ borderColor: colorPalette.primary }}
                  />
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    {/* Minimal template - only logo, description and copyright */}
                    {footerSettings.template === 'minimal' ? (
                      <div className="flex flex-col items-center text-center space-y-4 mb-6">
                        <DroppableImageArea
                          id="preview-footer-logo"
                          value={footerSettings.logoUrl}
                          onChange={(url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url }))}
                          className="mb-3"
                          minHeight="40px"
                        >
                          {footerSettings.logoUrl ? (
                            <img src={footerSettings.logoUrl} alt="Footer logo" className="h-8 object-contain" />
                          ) : (
                            <div className="text-sm font-semibold" style={{ color: footerSettings.textColor }}>
                              Winter Championship 2026
                            </div>
                          )}
                        </DroppableImageArea>
                        <p className="text-xs opacity-80 leading-relaxed max-w-md" style={{ color: footerSettings.textColor }}>
                          {footerSettings.description}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`mb-6 ${
                          footerSettings.template === 'centered'
                            ? 'flex flex-col items-center text-center'
                            : 'grid'
                        }`}
                        style={{ 
                          gridTemplateColumns:
                            footerSettings.template === 'centered'
                              ? undefined
                              : footerSettings.template === 'three-columns' || footerSettings.template === 'two-columns'
                              ? 'repeat(4, minmax(0, 1fr))'
                              : 'repeat(3, minmax(0, 1fr))',
                          gap: footerSettings.spacing,
                        }}
                      >
                        {/* Logo column - only shown for three-columns, hidden for two-columns */}
                        {footerSettings.template === 'three-columns' && (
                          <div>
                            <DroppableImageArea
                              id="preview-footer-logo"
                              value={footerSettings.logoUrl}
                              onChange={(url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url }))}
                              className="mb-3"
                              minHeight="40px"
                            >
                              {footerSettings.logoUrl ? (
                                <img src={footerSettings.logoUrl} alt="Footer logo" className="h-8 object-contain" />
                              ) : (
                                <div className="text-sm font-semibold" style={{ color: footerSettings.textColor }}>
                                  Winter Championship 2026
                                </div>
                              )}
                            </DroppableImageArea>
                            <p className="text-xs opacity-80 leading-relaxed" style={{ color: footerSettings.textColor }}>
                              {footerSettings.description}
                            </p>
                          </div>
                        )}
                        {/* Classic template: 3 separate columns */}
                        {footerSettings.template === 'three-columns' && (
                            <>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                  Toernooi
                                </h3>
                                <ul className="space-y-1.5">
                                  {footerSettings.links.tournament.map((link) => (
                                    <li key={link.id}>
                                      <a 
                                        href={link.link}
                                        className="text-xs opacity-80 hover:opacity-100 transition"
                                        style={{ color: footerSettings.textColor }}
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                  Informatie
                                </h3>
                                <ul className="space-y-1.5">
                                  {footerSettings.links.info.map((link) => (
                                    <li key={link.id}>
                                      <a 
                                        href={link.link}
                                        className="text-xs opacity-80 hover:opacity-100 transition"
                                        style={{ color: footerSettings.textColor }}
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                  Contact
                                </h3>
                                <ul className="space-y-1.5">
                                  {footerSettings.links.contact.map((link) => (
                                    <li key={link.id}>
                                      <a 
                                        href={link.link}
                                        className="text-xs opacity-80 hover:opacity-100 transition"
                                        style={{ color: footerSettings.textColor }}
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}

                        {/* Two Column template: Logo in middle, 3 link columns */}
                        {footerSettings.template === 'two-columns' && (
                          <>
                            {/* Empty first column */}
                            <div></div>
                            
                            {/* Logo in middle (second column) */}
                            <div className="flex flex-col items-center text-center">
                              <DroppableImageArea
                                id="preview-footer-logo-two"
                                value={footerSettings.logoUrl}
                                onChange={(url) => setFooterSettings((prev) => ({ ...prev, logoUrl: url }))}
                                className="mb-3"
                                minHeight="40px"
                              >
                                {footerSettings.logoUrl ? (
                                  <img src={footerSettings.logoUrl} alt="Footer logo" className="h-8 object-contain" />
                                ) : (
                                  <div className="text-sm font-semibold" style={{ color: footerSettings.textColor }}>
                                    Winter Championship 2026
                                  </div>
                                )}
                              </DroppableImageArea>
                              <p className="text-xs opacity-80 leading-relaxed max-w-xs" style={{ color: footerSettings.textColor }}>
                                {footerSettings.description}
                              </p>
                            </div>
                            
                            {/* Links column (third column) */}
                            <div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                    Toernooi
                                  </h3>
                                  <ul className="space-y-1.5">
                                    {footerSettings.links.tournament.map((link) => (
                                      <li key={link.id}>
                                        <a 
                                          href={link.link}
                                          className="text-xs opacity-80 hover:opacity-100 transition"
                                          style={{ color: footerSettings.textColor }}
                                        >
                                          {link.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                    Informatie
                                  </h3>
                                  <ul className="space-y-1.5">
                                    {footerSettings.links.info.map((link) => (
                                      <li key={link.id}>
                                        <a 
                                          href={link.link}
                                          className="text-xs opacity-80 hover:opacity-100 transition"
                                          style={{ color: footerSettings.textColor }}
                                        >
                                          {link.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Contact column (fourth column) */}
                            <div>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                  Contact
                                </h3>
                                <ul className="space-y-1.5">
                                  {footerSettings.links.contact.map((link) => (
                                    <li key={link.id}>
                                      <a 
                                        href={link.link}
                                        className="text-xs opacity-80 hover:opacity-100 transition"
                                        style={{ color: footerSettings.textColor }}
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {footerSettings.showSocials && (
                                <div className="pt-4 mt-4 border-t" style={{ borderColor: colorPalette.border }}>
                                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                    Social Media
                                  </h3>
                                  <ul className="space-y-1.5">
                                    {socialSettings.icons.filter((icon) => icon.enabled).map((icon) => (
                                      <li key={icon.id}>
                                        <a href={icon.link} className="text-xs opacity-80 hover:opacity-100 transition" style={{ color: footerSettings.textColor }}>
                                          {icon.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Stacked/Centered template: All links vertically stacked */}
                        {footerSettings.template === 'centered' && (
                          <div className="w-full space-y-6">
                            <div>
                              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                Toernooi
                              </h3>
                              <ul className="space-y-1.5">
                                {footerSettings.links.tournament.map((link) => (
                                  <li key={link.id}>
                                    <a 
                                      href={link.link}
                                      className="text-xs opacity-80 hover:opacity-100 transition"
                                      style={{ color: footerSettings.textColor }}
                                    >
                                      {link.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                Informatie
                              </h3>
                              <ul className="space-y-1.5">
                                {footerSettings.links.info.map((link) => (
                                  <li key={link.id}>
                                    <a 
                                      href={link.link}
                                      className="text-xs opacity-80 hover:opacity-100 transition"
                                      style={{ color: footerSettings.textColor }}
                                    >
                                      {link.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                Contact
                              </h3>
                              <ul className="space-y-1.5">
                                {footerSettings.links.contact.map((link) => (
                                  <li key={link.id}>
                                    <a 
                                      href={link.link}
                                      className="text-xs opacity-80 hover:opacity-100 transition"
                                      style={{ color: footerSettings.textColor }}
                                    >
                                      {link.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {footerSettings.showSocials && (
                              <div className="pt-4 border-t" style={{ borderColor: colorPalette.border }}>
                                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: footerSettings.textColor }}>
                                  Social Media
                                </h3>
                                <ul className="flex flex-wrap justify-center gap-4">
                                  {socialSettings.icons.filter((icon) => icon.enabled).map((icon) => (
                                    <li key={icon.id}>
                                      <a href={icon.link} className="text-xs opacity-80 hover:opacity-100 transition" style={{ color: footerSettings.textColor }}>
                                        {icon.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Social Media for Classic template - shown below links */}
                    {footerSettings.showSocials && footerSettings.template === 'three-columns' && (
                      <div className="mt-6 pt-6 border-t w-full" style={{ borderColor: colorPalette.border }}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: footerSettings.textColor }}>
                          Volg ons
                        </h3>
                        <ul className="flex flex-wrap justify-center gap-4">
                          {socialSettings.icons.filter((icon) => icon.enabled).map((icon) => (
                            <li key={icon.id}>
                              <a href={icon.link} className="text-xs opacity-80 hover:opacity-100 transition" style={{ color: footerSettings.textColor }}>
                                {icon.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div
                      className="pt-6 text-center"
                      style={{ 
                        borderTop: footerSettings.divider && footerSettings.template !== 'three-columns' ? `1px solid ${colorPalette.border}` : 'none',
                        paddingTop: footerSettings.divider && footerSettings.template !== 'three-columns' ? '1.5rem' : footerSettings.template === 'three-columns' && footerSettings.showSocials ? '0' : '1.5rem'
                      }}
                    >
                      <p className="text-xs opacity-60" style={{ color: footerSettings.textColor }}>
                        {footerSettings.copyright}
                      </p>
                    </div>
                  </div>
                </footer>
              )}
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="w-[400px] bg-[#0E1020] border-l border-white/10 flex flex-col fixed right-0 top-[85px] h-[calc(100vh-85px)] overflow-hidden z-10 flex-shrink-0">
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">{activeComponentLabel}</p>
            <h2 className="text-lg font-semibold">Configureer de {activeComponentLabel}</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-8 -mr-6">
          {renderSettingsPanel()}
          </div>
        </aside>
      </main>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#05060D] flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0E1020]">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Live Preview - Fullscreen</h2>
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
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Sluiten
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-[#03040B] flex items-start justify-center">
            <div className="w-full h-full overflow-y-auto flex items-start justify-center pr-10 -mr-6">
            <div 
              className="bg-gradient-to-br from-[#0B0E1F] to-[#020308] w-full transition-all"
              style={{ 
                backgroundColor: colorPalette.pageBackground,
                fontFamily: formatFontStack(fontSettings.bodyFamily),
                color: colorPalette.bodyText,
                maxWidth: viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px',
                width: viewport === 'desktop' ? '100%' : 'auto',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
                minHeight: '100%'
              }}
            >
              {/* Preview content will be cloned here via useEffect */}
              <div 
                id="fullscreen-preview-container" 
                className="w-full flex flex-col"
                style={{ 
                  backgroundColor: colorPalette.pageBackground,
                  fontFamily: formatFontStack(fontSettings.bodyFamily),
                  color: colorPalette.bodyText,
                  width: '100%',
                  minHeight: '100%',
                  margin: 0,
                  padding: 0
                }} 
              />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global DragOverlay for uploads */}
      <DragOverlay>
        {activeDragId && activeDragId.toString().startsWith('upload-') ? (
          (() => {
            const uploadId = activeDragId.toString().replace('upload-', '');
            const item = uploads.find(u => u.id === uploadId);
            return item ? (
              <div className="bg-[#11132A] border border-[#755DFF] rounded-2xl p-4 flex gap-4 items-center opacity-90 shadow-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1B1F3E] to-[#0B0E1C] border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-white/40">{item.size}</p>
                </div>
              </div>
            ) : null;
          })()
        ) : null}
      </DragOverlay>
      </div>
    </DndContext>
  );
}
