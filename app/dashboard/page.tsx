'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/header';
import DarkVeil from '../components/DarkVeil';

// Type definities
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: string;
  entryFee: string;
  prizePool: string;
  primaryColor: string;
  secondaryColor: string;
  customComponents?: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>;
  status: 'draft' | 'published';
  createdAt: string;
}

// Type definities
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableItem({ 
  id, 
  children, 
  isPreview = false, 
  isLibrary = false 
}: { 
  id: string; 
  children: React.ReactNode; 
  isPreview?: boolean;
  isLibrary?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: isLibrary // Library items zijn niet sortable, alleen draggable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isLibrary ? {} : listeners)}
      className={`${isLibrary ? 'cursor-grab active:cursor-grabbing' : (isPreview ? 'cursor-grab active:cursor-grabbing' : '')} ${isDragging ? 'z-50' : ''} relative group`}
    >
      {/* Drag Handle voor Preview */}
      {isPreview && !isDragging && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'template-selection', 'create-tournament', 'manage-tournament', 'template-wizard', 'wizard-result'
  const [editingTournament, setEditingTournament] = useState<string | null>(null);
  const [editingTournamentStatus, setEditingTournamentStatus] = useState<'draft' | 'published' | null>(null);
  
  // Template wizard state - not used anymore (redirected to /editor/wizard)
  // const [wizardStep, setWizardStep] = useState(0);
  // const [wizardAnswers, setWizardAnswers] = useState<Record<string, string | number | boolean>>({});
  // const [generatedCode, setGeneratedCode] = useState<string>('');
  // const [isGenerating, setIsGenerating] = useState(false);
  
  // Toernooi configuratie state
  const [tournamentConfig, setTournamentConfig] = useState({
    name: '',
    description: '',
    logo: '',
    image: '',
    primaryColor: '#0044cc',
    secondaryColor: '#ff6600',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    entryFee: '',
    prizePool: '',
    twitchUrl: '',
    chatEnabled: 'false',
    headerBackgroundColor: '#ffffff',
    headerTextColor: '#000000',
    customComponents: [] as Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
  });

  // Componenten configuratie - alle componenten standaard uitgeschakeld
  const [enabledComponents, setEnabledComponents] = useState<Record<string, boolean>>({
    header: false,
    description: false,
    tournamentDetails: false,
    registration: false,
    stats: false,
    schedule: false,
    rules: false,
    prizes: false,
    sponsors: false,
    social: false,
    contact: false,
    livestream: false
  });

  const [componentOrder, setComponentOrder] = useState<string[]>([]);

  // Tab state voor linker paneel
  const [leftPanelTab, setLeftPanelTab] = useState<'edit' | 'add'>('edit');
  
  // Viewport state voor live preview
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [animationDuration, setAnimationDuration] = useState(300);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'scale' | 'width' | 'complete'>('complete');
  
  // State voor component dropdowns
  const [expandedComponents, setExpandedComponents] = useState<{[key: string]: boolean}>({});
  
  // State voor hoofdsectie dropdowns
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    colors: true,
    components: true,
    library: true
  });
  
  // Functie om animatie duur te berekenen op basis van viewport verandering
  const getAnimationDuration = (from: string, to: string) => {
    const viewportSizes = {
      'desktop': 1920,
      'tablet': 768,
      'mobile': 375
    };
    
    const sizeDiff = Math.abs(viewportSizes[from as keyof typeof viewportSizes] - viewportSizes[to as keyof typeof viewportSizes]);
    
    // Base duration van 500ms + 0.03ms per pixel verschil
    const baseDuration = 500;
    const pixelMultiplier = 0.03;
    
    return Math.min(baseDuration + (sizeDiff * pixelMultiplier), 1000); // Max 1 seconde
  };

  // Handler voor viewport verandering
  const handleViewportChange = (newViewport: 'desktop' | 'tablet' | 'mobile') => {
    if (isAnimating) return; // Voorkom dubbele animaties
    
    const duration = getAnimationDuration(previewViewport, newViewport);
    setAnimationDuration(duration);
    setIsAnimating(true);
    setAnimationPhase('scale');
    
    // Eerst de scale animeren (60% van de tijd)
    const scaleDuration = duration * 0.6;
    
    // Start met scale animatie
    setPreviewViewport(newViewport);
    
    // Na scale animatie, start width animatie
    setTimeout(() => {
      setAnimationPhase('width');
    }, scaleDuration);
    
    // Reset animatie state na de volledige animatie
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationPhase('complete');
    }, duration);
  };

  // Drag & Drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<{id: string, name: string, description: string, icon: string} | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Database tournament type
  interface DatabaseTournament {
    id: string
    name: string
    description: string
    location: string
    start_date: string
    end_date: string | null
    max_participants: string
    entry_fee: string
    prize_pool: string
    primary_color: string
    secondary_color: string
    status: 'draft' | 'published'
    created_at: string
    custom_components?: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
    wizard_answers?: Record<string, unknown>
    generated_code_html?: string
    generated_code_css?: string
    generated_code_js?: string
    generated_code_full?: string
  }

  // Toernooien state
  const [tournaments, setTournaments] = useState<Array<{
    id: string;
    name: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    maxParticipants: string;
    entryFee: string;
    prizePool: string;
    primaryColor: string;
    secondaryColor: string;
    customComponents?: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>;
    status: 'draft' | 'published';
    createdAt: string;
  }>>([]);

  // Laad toernooien uit localStorage bij component mount - wordt later gedefinieerd na addCustomComponentsToLibrary

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simpele login check (in echte app zou je dit via een API doen)
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Ongeldige gebruikersnaam of wachtwoord');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setLoginError('');
    setCurrentView('dashboard');
  };

  const handleConfigChange = (field: string, value: string) => {
    setTournamentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = async () => {
    if (!tournamentConfig.name.trim()) {
      alert('Voer eerst een toernooi naam in!');
      return;
    }

    try {
      if (editingTournament) {
        // Bewerken van bestaand toernooi - update in Supabase
        const response = await fetch('/api/tournaments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTournament,
            name: tournamentConfig.name,
            description: tournamentConfig.description,
            location: tournamentConfig.location,
            startDate: tournamentConfig.startDate,
            endDate: tournamentConfig.endDate,
            maxParticipants: tournamentConfig.maxParticipants,
            entryFee: tournamentConfig.entryFee,
            prizePool: tournamentConfig.prizePool,
            primaryColor: tournamentConfig.primaryColor,
            secondaryColor: tournamentConfig.secondaryColor,
            status: 'draft',
            customComponents: tournamentConfig.customComponents || []
          })
        })

        if (response.ok) {
          alert('Toernooi bijgewerkt!');
          // Herlaad toernooien uit database
          const loadResponse = await fetch('/api/tournaments')
          if (loadResponse.ok) {
            const data = await loadResponse.json()
            const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
              id: t.id,
              name: t.name,
              description: t.description || '',
              location: t.location || '',
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              maxParticipants: t.max_participants || '8',
              entryFee: t.entry_fee || '',
              prizePool: t.prize_pool || '',
              primaryColor: t.primary_color || '#0044cc',
              secondaryColor: t.secondary_color || '#ff6600',
              customComponents: t.custom_components || [],
              status: t.status,
              createdAt: t.created_at || new Date().toISOString()
            }))
            setTournaments(mappedTournaments)
            localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
          }
        } else {
          const error = await response.json()
          alert(`Fout bij bijwerken: ${error.error || 'Onbekende fout'}`)
          return
        }
      } else {
        // Nieuw toernooi aanmaken - save in Supabase
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tournamentConfig.name,
            description: tournamentConfig.description,
            location: tournamentConfig.location,
            startDate: tournamentConfig.startDate,
            endDate: tournamentConfig.endDate,
            maxParticipants: tournamentConfig.maxParticipants,
            entryFee: tournamentConfig.entryFee,
            prizePool: tournamentConfig.prizePool,
            primaryColor: tournamentConfig.primaryColor,
            secondaryColor: tournamentConfig.secondaryColor,
            status: 'draft',
            generatedCode: {},
            wizardAnswers: {},
            customComponents: tournamentConfig.customComponents || []
          })
        })

        if (response.ok) {
          alert('Draft opgeslagen!');
          // Herlaad toernooien uit database
          const loadResponse = await fetch('/api/tournaments')
          if (loadResponse.ok) {
            const data = await loadResponse.json()
            const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
              id: t.id,
              name: t.name,
              description: t.description || '',
              location: t.location || '',
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              maxParticipants: t.max_participants || '8',
              entryFee: t.entry_fee || '',
              prizePool: t.prize_pool || '',
              primaryColor: t.primary_color || '#0044cc',
              secondaryColor: t.secondary_color || '#ff6600',
              customComponents: t.custom_components || [],
              status: t.status,
              createdAt: t.created_at || new Date().toISOString()
            }))
            setTournaments(mappedTournaments)
            localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
          }
        } else {
          const error = await response.json()
          alert(`Fout bij opslaan: ${error.error || 'Onbekende fout'}`)
          return
        }
      }
      
      setCurrentView('manage-tournament');
      setEditingTournament(null);
    } catch (error) {
      console.error('Error saving tournament:', error)
      alert('Fout bij opslaan van toernooi. Probeer het opnieuw.')
    }
  };

  const handlePublish = async () => {
    if (!tournamentConfig.name.trim()) {
      alert('Voer eerst een toernooi naam in!');
      return;
    }

    try {
      if (editingTournament) {
        // Bewerken van bestaand toernooi en publiceren - update in Supabase
        const response = await fetch('/api/tournaments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTournament,
            name: tournamentConfig.name,
            description: tournamentConfig.description,
            location: tournamentConfig.location,
            startDate: tournamentConfig.startDate,
            endDate: tournamentConfig.endDate,
            maxParticipants: tournamentConfig.maxParticipants,
            entryFee: tournamentConfig.entryFee,
            prizePool: tournamentConfig.prizePool,
            primaryColor: tournamentConfig.primaryColor,
            secondaryColor: tournamentConfig.secondaryColor,
            status: 'published',
            customComponents: tournamentConfig.customComponents || []
          })
        })

        if (response.ok) {
          alert('Toernooi gepubliceerd!');
          // Herlaad toernooien uit database
          const loadResponse = await fetch('/api/tournaments')
          if (loadResponse.ok) {
            const data = await loadResponse.json()
            const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
              id: t.id,
              name: t.name,
              description: t.description || '',
              location: t.location || '',
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              maxParticipants: t.max_participants || '8',
              entryFee: t.entry_fee || '',
              prizePool: t.prize_pool || '',
              primaryColor: t.primary_color || '#0044cc',
              secondaryColor: t.secondary_color || '#ff6600',
              customComponents: t.custom_components || [],
              status: t.status,
              createdAt: t.created_at || new Date().toISOString()
            }))
            setTournaments(mappedTournaments)
            localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
          }
        } else {
          const error = await response.json()
          alert(`Fout bij publiceren: ${error.error || 'Onbekende fout'}`)
          return
        }
      } else {
        // Nieuw toernooi aanmaken en publiceren - save in Supabase
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tournamentConfig.name,
            description: tournamentConfig.description,
            location: tournamentConfig.location,
            startDate: tournamentConfig.startDate,
            endDate: tournamentConfig.endDate,
            maxParticipants: tournamentConfig.maxParticipants,
            entryFee: tournamentConfig.entryFee,
            prizePool: tournamentConfig.prizePool,
            primaryColor: tournamentConfig.primaryColor,
            secondaryColor: tournamentConfig.secondaryColor,
            status: 'published',
            generatedCode: {},
            wizardAnswers: {},
            customComponents: tournamentConfig.customComponents || []
          })
        })

        if (response.ok) {
          alert('Toernooi gepubliceerd!');
          // Herlaad toernooien uit database
          const loadResponse = await fetch('/api/tournaments')
          if (loadResponse.ok) {
            const data = await loadResponse.json()
            const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
              id: t.id,
              name: t.name,
              description: t.description || '',
              location: t.location || '',
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              maxParticipants: t.max_participants || '8',
              entryFee: t.entry_fee || '',
              prizePool: t.prize_pool || '',
              primaryColor: t.primary_color || '#0044cc',
              secondaryColor: t.secondary_color || '#ff6600',
              customComponents: t.custom_components || [],
              status: t.status,
              createdAt: t.created_at || new Date().toISOString()
            }))
            setTournaments(mappedTournaments)
            localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
          }
        } else {
          const error = await response.json()
          alert(`Fout bij publiceren: ${error.error || 'Onbekende fout'}`)
          return
        }
      }
      
      setCurrentView('manage-tournament');
      setEditingTournament(null);
    } catch (error) {
      console.error('Error publishing tournament:', error)
      alert('Fout bij publiceren van toernooi. Probeer het opnieuw.')
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (confirm('Weet je zeker dat je dit toernooi wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        const response = await fetch(`/api/tournaments?id=${tournamentId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Toernooi verwijderd!');
          // Herlaad toernooien uit database
          const loadResponse = await fetch('/api/tournaments')
          if (loadResponse.ok) {
            const data = await loadResponse.json()
            const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
              id: t.id,
              name: t.name,
              description: t.description || '',
              location: t.location || '',
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              maxParticipants: t.max_participants || '8',
              entryFee: t.entry_fee || '',
              prizePool: t.prize_pool || '',
              primaryColor: t.primary_color || '#0044cc',
              secondaryColor: t.secondary_color || '#ff6600',
              customComponents: t.custom_components || [],
              status: t.status,
              createdAt: t.created_at || new Date().toISOString()
            }))
            setTournaments(mappedTournaments)
            localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
          }
        } else {
          const error = await response.json()
          alert(`Fout bij verwijderen: ${error.error || 'Onbekende fout'}`)
        }
      } catch (error) {
        console.error('Error deleting tournament:', error)
        alert('Fout bij verwijderen van toernooi. Probeer het opnieuw.')
      }
    }
  };

  const handlePublishFromManage = async (tournamentId: string) => {
    try {
      const tournament = tournaments.find(t => t.id === tournamentId)
      if (!tournament) return

      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tournamentId,
          name: tournament.name,
          description: tournament.description,
          location: tournament.location,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          maxParticipants: tournament.maxParticipants,
          entryFee: tournament.entryFee,
          prizePool: tournament.prizePool,
          primaryColor: tournament.primaryColor,
          secondaryColor: tournament.secondaryColor,
          status: 'published',
          customComponents: tournament.customComponents || []
        })
      })

      if (response.ok) {
        alert('Toernooi gepubliceerd!');
        // Herlaad toernooien uit database
        const loadResponse = await fetch('/api/tournaments')
        if (loadResponse.ok) {
          const data = await loadResponse.json()
          const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            location: t.location || '',
            startDate: t.start_date || '',
            endDate: t.end_date || '',
            maxParticipants: t.max_participants || '8',
            entryFee: t.entry_fee || '',
            prizePool: t.prize_pool || '',
            primaryColor: t.primary_color || '#0044cc',
            secondaryColor: t.secondary_color || '#ff6600',
            customComponents: t.custom_components || [],
            status: t.status,
            createdAt: t.created_at || new Date().toISOString()
          }))
          setTournaments(mappedTournaments)
          localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
        }
      } else {
        const error = await response.json()
        alert(`Fout bij publiceren: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Error publishing tournament:', error)
      alert('Fout bij publiceren van toernooi. Probeer het opnieuw.')
    }
  };

  const handleUnpublish = async (tournamentId: string) => {
    try {
      const tournament = tournaments.find(t => t.id === tournamentId)
      if (!tournament) return

      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tournamentId,
          name: tournament.name,
          description: tournament.description,
          location: tournament.location,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          maxParticipants: tournament.maxParticipants,
          entryFee: tournament.entryFee,
          prizePool: tournament.prizePool,
          primaryColor: tournament.primaryColor,
          secondaryColor: tournament.secondaryColor,
          status: 'draft',
          customComponents: tournament.customComponents || []
        })
      })

      if (response.ok) {
        alert('Toernooi unpublished!');
        // Herlaad toernooien uit database
        const loadResponse = await fetch('/api/tournaments')
        if (loadResponse.ok) {
          const data = await loadResponse.json()
          const mappedTournaments = (data.tournaments || []).map((t: DatabaseTournament) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            location: t.location || '',
            startDate: t.start_date || '',
            endDate: t.end_date || '',
            maxParticipants: t.max_participants || '8',
            entryFee: t.entry_fee || '',
            prizePool: t.prize_pool || '',
            primaryColor: t.primary_color || '#0044cc',
            secondaryColor: t.secondary_color || '#ff6600',
            customComponents: t.custom_components || [],
            status: t.status,
            createdAt: t.created_at || new Date().toISOString()
          }))
          setTournaments(mappedTournaments)
          localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
        }
      } else {
        const error = await response.json()
        alert(`Fout bij unpubliceren: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Error unpublishing tournament:', error)
      alert('Fout bij unpubliceren van toernooi. Probeer het opnieuw.')
    }
  };

  // Functie om URL slug te genereren van toernooi naam
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Verwijder speciale karakters
      .replace(/\s+/g, '-') // Vervang spaties met streepjes
      .replace(/-+/g, '-') // Vervang meerdere streepjes met één
      .trim();
  };

  // Component beheer functies
  // const toggleComponent = (componentId: string) => {
  //   setEnabledComponents(prev => ({
  //     ...prev,
  //     [componentId]: !prev[componentId as keyof typeof prev]
  //   }));
  //   
  //   // Update componentOrder - voeg toe als ingeschakeld, verwijder als uitgeschakeld
  //   setComponentOrder(prev => {
  //     const isEnabled = !enabledComponents[componentId as keyof typeof enabledComponents];
  //     if (isEnabled) {
  //       // Component wordt ingeschakeld - voeg toe aan het einde als het er nog niet in zit
  //       if (!prev.includes(componentId)) {
  //         return [...prev, componentId];
  //       }
  //       return prev;
  //     } else {
  //       // Component wordt uitgeschakeld - verwijder uit de lijst
  //       return prev.filter(id => id !== componentId);
  //     }
  //   });
  // };

  // Toggle component zonder uit componentOrder te verwijderen (voor bewerk pagina)
  const toggleComponentVisibility = (componentId: string) => {
    setEnabledComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId as keyof typeof prev]
    }));
    // Component blijft ALTIJD in componentOrder - NOOIT verwijderen
    // Alleen toevoegen als het er nog niet in zit
    setComponentOrder(prev => {
      if (!prev.includes(componentId)) {
        return [...prev, componentId];
      }
      return prev; // Blijf zoals het is - verwijder NIET
    });
  };

  // Voeg component toe aan componentOrder als het er nog niet in zit
  // const ensureComponentInOrder = (componentId: string) => {
  //   setComponentOrder(prev => {
  //     if (!prev.includes(componentId)) {
  //       return [...prev, componentId];
  //     }
  //     return prev;
  //   });
  // };

  // Component verwijder functie (alleen voor de verwijder knop)
  const removeComponent = (componentId: string) => {
    setEnabledComponents(prev => ({
      ...prev,
      [componentId]: false
    }));
    
    setComponentOrder(prev => prev.filter(id => id !== componentId));
  };

  // Toggle component dropdown
  const toggleComponentDropdown = (componentId: string) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const toggleSectionDropdown = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };


  // const moveComponent = (fromIndex: number, toIndex: number) => {
  //   const newOrder = [...componentOrder];
  //   const [movedComponent] = newOrder.splice(fromIndex, 1);
  //   newOrder.splice(toIndex, 0, movedComponent);
  //   setComponentOrder(newOrder);
  // };

  // Drag & Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active: _active } = event;
    setActiveId(_active.id as string);
    
    // Sla de component data op (alleen als component bestaat)
    const component = allComponents[_active.id as keyof typeof allComponents];
    if (component) {
      setDraggedComponent(component);
      // Check of het van de library komt (niet in componentOrder)
      setIsDraggingFromLibrary(!componentOrder.includes(_active.id as string));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active: _active, over } = event; // eslint-disable-line @typescript-eslint/no-unused-vars
    
    if (!over) {
      setDragOverIndex(null);
      return;
    }
    
    // Als we over een bestaand component slepen
    if (over.id !== 'preview-area' && componentOrder.includes(over.id as string)) {
      const newIndex = componentOrder.indexOf(over.id as string);
      setDragOverIndex(newIndex);
    } else if (over.id === 'preview-area') {
      // Als we over de preview area slepen, zet aan het einde
      setDragOverIndex(componentOrder.length);
    } else {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedComponent(null);
    setDragOverIndex(null);
    setIsDraggingFromLibrary(false);
    
    if (!over) return;
    
    // Herordenen binnen preview
    if (over.id !== 'preview-area' && active.id !== over.id) {
      const oldIndex = componentOrder.indexOf(active.id as string);
      const newIndex = componentOrder.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setComponentOrder((items) => {
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

   // Componenten worden straks uit de components map geladen
   const allComponents = useMemo(() => ({
     header: {
       id: 'header',
       name: 'Header',
       type: 'header',
       description: 'Aanpasbare header met logo en navigatie',
       icon: '🎨',
       category: 'Basis'
     },
     livestream: {
       id: 'livestream',
       name: 'Livestream',
       type: 'livestream',
       description: 'Twitch livestream embed met chat',
       icon: '📺',
       category: 'Interactie'
     },
     description: {
       id: 'description',
       name: 'Beschrijving',
       type: 'description',
       description: 'Toernooi beschrijving en details',
       icon: '📝',
       category: 'Content'
     },
     tournamentDetails: {
       id: 'tournamentDetails',
       name: 'Toernooi Details',
       type: 'tournamentDetails',
       description: 'Datum, locatie, prijzen en regels',
       icon: 'ℹ️',
       category: 'Content'
     },
     schedule: {
       id: 'schedule',
       name: 'Schema',
       type: 'schedule',
       description: 'Wedstrijd schema en tijden',
       icon: '📅',
       category: 'Content'
     },
     stats: {
       id: 'stats',
       name: 'Statistieken',
       type: 'stats',
       description: 'Live scores en rankings',
       icon: '📊',
       category: 'Data'
     },
     prizes: {
       id: 'prizes',
       name: 'Prijzen',
       type: 'prizes',
       description: 'Prijsuitreiking en beloningen',
       icon: '🏆',
       category: 'Content'
     },
     registration: {
       id: 'registration',
       name: 'Registratie',
       type: 'registration',
       description: 'Inschrijfformulier voor deelnemers',
       icon: '📝',
       category: 'Interactie'
     },
     rules: {
       id: 'rules',
       name: 'Regels',
       type: 'rules',
       description: 'Toernooi regels en voorwaarden',
       icon: '📋',
       category: 'Content'
     },
     sponsors: {
       id: 'sponsors',
       name: 'Sponsors',
       type: 'sponsors',
       description: 'Sponsor logos en informatie',
       icon: '🤝',
       category: 'Content'
     },
     social: {
       id: 'social',
       name: 'Social Media',
       type: 'social',
       description: 'Social media links en feeds',
       icon: '📱',
       category: 'Interactie'
     },
     contact: {
       id: 'contact',
       name: 'Contact',
       type: 'contact',
       description: 'Contact informatie en formulier',
       icon: '📞',
      category: 'Content'
    }
   }), []);

  // Functie om custom componenten toe te voegen aan allComponents
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addCustomComponentsToLibrary = useCallback((customComponents: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>) => {
    if (customComponents && customComponents.length > 0) {
      customComponents.forEach((customComp: {id: string, name: string, type: string, description: string, icon: string, category?: string}) => {
        (allComponents as unknown as Record<string, {id: string, name: string, type: string, description: string, icon: string, category?: string}>)[customComp.id] = customComp;
      });
    }
  }, [allComponents]);

  // Alleen de momenteel ingeschakelde componenten (wordt straks uit components map geladen)
  // const enabledComponentsList = Object.values(allComponents).filter(comp => 
  //   enabledComponents[comp.id as keyof typeof enabledComponents]
  // );

  const handleReset = () => {
    setTournamentConfig({
      name: '',
      description: '',
      logo: '',
      image: '',
      primaryColor: '#0044cc',
      secondaryColor: '#ff6600',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: '',
      entryFee: '',
      prizePool: '',
      twitchUrl: '',
      chatEnabled: 'false',
      headerBackgroundColor: '#ffffff',
      headerTextColor: '#000000',
      customComponents: [] as Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
    });
    
    // Reset enabled components - alle componenten uitgeschakeld
    setEnabledComponents({
      header: false,
      description: false,
      tournamentDetails: false,
      registration: false,
      stats: false,
      schedule: false,
      rules: false,
      prizes: false,
      sponsors: false,
      social: false,
      contact: false,
      livestream: false
    });
    
    // Reset component order - lege lijst
    setComponentOrder([]);
    
    setEditingTournament(null);
    setEditingTournamentStatus(null);
  };

  const handleEditTournament = (tournamentId: string) => {
    // Navigeer naar wizard editor pagina met tournament ID in URL
    // De wizard pagina haalt de data direct uit de database
    router.push(`/editor/wizard?edit=true&id=${tournamentId}`)
  };

  // Template wizard view - Redirect naar nieuwe AI wizard (moet voor alle conditional returns)
  useEffect(() => {
    if (currentView === 'template-wizard') {
      router.push('/editor/wizard')
    }
  }, [currentView, router])

  // Laad toernooien uit Supabase database
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments')
        if (response.ok) {
          const data = await response.json()
          // Map database format naar frontend format
          const mappedTournaments = (data.tournaments || []).map((t: {
            id: string
            name: string
            description: string
            location: string
            start_date: string
            end_date: string | null
            max_participants: string
            entry_fee: string
            prize_pool: string
            primary_color: string
            secondary_color: string
            status: 'draft' | 'published'
            created_at: string
            custom_components?: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
          }) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            location: t.location || '',
            startDate: t.start_date || '',
            endDate: t.end_date || '',
            maxParticipants: t.max_participants || '8',
            entryFee: t.entry_fee || '',
            prizePool: t.prize_pool || '',
            primaryColor: t.primary_color || '#0044cc',
            secondaryColor: t.secondary_color || '#ff6600',
            customComponents: t.custom_components || [],
            status: t.status,
            createdAt: t.created_at || new Date().toISOString()
          }))
          setTournaments(mappedTournaments)
          // Ook opslaan in localStorage als backup
          localStorage.setItem('tournaments', JSON.stringify(mappedTournaments))
        } else {
          // Probeer error details te krijgen
          let errorMessage = 'Unknown error'
          let errorCode: string | undefined
          
          // Check of response bestaat
          if (!response) {
            console.error('Failed to load tournaments: No response object')
            setTournaments([])
            return
          }
          
          // Eerst status-based message als fallback
          const status = response.status || 0
          if (status === 503) {
            errorMessage = 'Supabase is not configured. Please check your environment variables.'
          } else if (status === 500) {
            errorMessage = 'Internal server error. Please check the server logs.'
          } else if (status === 401) {
            errorMessage = 'Unauthorized. Please check your Supabase API key.'
          } else if (status === 403) {
            errorMessage = 'Forbidden. You may not have permission to access this resource.'
          } else if (status === 404) {
            errorMessage = 'API endpoint not found.'
          } else if (status > 0) {
            errorMessage = `HTTP ${status}: ${response.statusText || 'Unknown error'}`
          } else {
            errorMessage = 'Failed to connect to server'
          }
          
          try {
            // Probeer error response te parsen
            const responseText = await response.text()
            
            if (responseText && responseText.trim()) {
              try {
                const errorData = JSON.parse(responseText)
                if (errorData.error) {
                  errorMessage = errorData.error
                } else if (errorData.message) {
                  errorMessage = errorData.message
                }
                if (errorData.code) {
                  errorCode = errorData.code
                }
              } catch {
                // Response is geen JSON, gebruik als plain text als het niet leeg is
                if (responseText.trim().length > 0) {
                  errorMessage = responseText.trim()
                }
              }
            }
          } catch (parseError) {
            // Als parsing faalt, gebruik de status-based message die we al hebben
            console.warn('Could not parse error response:', parseError)
          }
          
          // Log error - altijd met betekenisvolle informatie
          // Zorg dat alle velden altijd een waarde hebben
          const errorLogData: Record<string, string | number> = {
            status: status,
            statusText: response?.statusText ?? 'No status text',
            error: errorMessage
          }
          
          // Voeg code alleen toe als het bestaat
          if (errorCode) {
            errorLogData.code = errorCode
          }
          
          // Log altijd met duidelijke informatie
          console.error('Failed to load tournaments:', errorLogData)
          
          // Fallback naar localStorage als API faalt
          const localTournaments = localStorage.getItem('tournaments')
          if (localTournaments) {
            try {
              setTournaments(JSON.parse(localTournaments))
              console.log('Loaded tournaments from localStorage as fallback')
            } catch (e) {
              console.error('Failed to parse localStorage tournaments:', e)
              setTournaments([])
            }
          } else {
            // Geen tournaments in localStorage, toon lege lijst
            setTournaments([])
          }
        }
      } catch (error) {
        console.error('Error loading tournaments:', error)
        // Fallback naar localStorage als API faalt
        const localTournaments = localStorage.getItem('tournaments')
        if (localTournaments) {
          try {
            setTournaments(JSON.parse(localTournaments))
            console.log('Loaded tournaments from localStorage as fallback')
          } catch (e) {
            console.error('Failed to parse localStorage tournaments:', e)
            setTournaments([])
          }
        } else {
          setTournaments([])
        }
      }
    }

    if (isLoggedIn) {
      loadTournaments()
    }
  }, [isLoggedIn])

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.05}
            scanlineIntensity={0}
            speed={0.3}
            scanlineFrequency={0.5}
            warpAmount={0.1}
            resolutionScale={1}
          />
        </div>
        <div className="max-w-md w-full relative z-10">
          <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Login
              </h1>
              <p className="text-gray-300">
                Log in om toegang te krijgen tot het toernooi dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative floating-label-input">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400 ${username ? 'has-value' : ''}`}
                  placeholder="Voer gebruikersnaam in"
                  required
                />
                <label htmlFor="username" className="floating-label">
                  Voer gebruikersnaam in
                </label>
              </div>

              <div className="relative floating-label-input">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400 ${password ? 'has-value' : ''}`}
                  placeholder="Voer wachtwoord in"
                  required
                />
                <label htmlFor="password" className="floating-label">
                  Voer wachtwoord in
                </label>
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Inloggen</span>
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-700/70 backdrop-blur-sm rounded-lg border border-white/20 text-center text-sm">
              <p className="text-gray-300 mb-1">Demo credentials:</p>
              <p className="text-gray-400">Gebruikersnaam: admin</p>
              <p className="text-gray-400">Wachtwoord: admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template selectie view
  if (currentView === 'template-selection') {
    // const TOURNAMENT_TEMPLATES: Array<{id: string, name: string, description: string}> = [];

    const CUSTOM_TEMPLATE = {
      id: 'custom',
      name: 'Custom',
      description: 'Start met een volledig lege pagina en bouw je eigen unieke layout vanaf nul. Geen vooraf ingestelde secties, volledige creatieve vrijheid.',
      category: 'Custom',
      layoutStyle: 'Vrije indeling, start vanaf nul',
      components: [],
      defaultConfig: {
        primaryColor: '#0044cc',
        secondaryColor: '#ff6600',
        backgroundColor: '#ffffff'
      }
    };

    const handleTemplateSelect = (templateId: string) => {
      if (templateId === 'custom') {
        // Custom template - alleen livestream
        setEnabledComponents({
          header: false,
          description: false,
          tournamentDetails: false,
          registration: false,
          stats: false,
          schedule: false,
          rules: false,
          prizes: false,
          sponsors: false,
          social: false,
          contact: false,
          livestream: true
        });
        setComponentOrder(['livestream']);
      
      // Naar create-tournament view
      setCurrentView('create-tournament');
      }
    };

    // WizardCard Component
    const WizardCard = ({ onSelect }: { onSelect: () => void }) => {
      const [isHovered, setIsHovered] = useState(false);

      return (
        <div
          className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 overflow-hidden transition-all duration-300 hover:border-green-500 hover:shadow-xl cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onSelect}
        >
          {/* Wizard Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
              Wizard
            </span>
          </div>

          {/* Icon Area */}
          <div className="relative h-56 flex items-center justify-center">
            <div className="relative">
              {/* Animated Background Circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-yellow-400 bg-opacity-20 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-400 bg-opacity-10 rounded-full animate-pulse delay-75"></div>
              </div>
              
              {/* Magic Wand Icon */}
              <svg 
                className="relative w-20 h-20 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                />
              </svg>
            </div>
            
            {/* Hover Overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                Start Wizard
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-gray-900 bg-opacity-50">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
              Template Wizard
            </h3>
            <p className="text-white text-sm leading-relaxed mb-4 opacity-90">
              Beantwoord een paar vragen en laat ons de perfecte template voor je toernooi genereren op basis van jouw wensen.
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                🎯 Persoonlijk
              </span>
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                ⚡ Snel
              </span>
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                🧙‍♂️ Slim
              </span>
            </div>
          </div>
        </div>
      );
    };

    // CustomCard Component
    const CustomCard = ({ onSelect }: { onSelect: () => void }) => {
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
    };

    return (
      <div className="min-h-screen relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.04}
            scanlineIntensity={0}
            speed={0.3}
            scanlineFrequency={0.2}
            warpAmount={0.15}
            resolutionScale={1}
          />
        </div>
        {/* Header */}
        <div className="bg-transparent border-b border-gray-600/50 shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-3">
                Kies hoe je je Toernooi Pagina wilt Maken
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Laat onze wizard de perfecte template voor je genereren op basis van je wensen, of start met een volledig lege pagina en bouw alles zelf op.
              </p>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="max-w-[1600px] mx-auto px-6 py-12 relative z-20">
          {/* Category Filter Info */}
          <div className="mb-8 text-center">
            <p className="text-gray-300">
              <span className="font-semibold text-white">2 Opties</span> - Wizard of Custom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Wizard Card */}
            <WizardCard onSelect={() => router.push('/editor/wizard')} />

            {/* Custom Card */}
            <CustomCard onSelect={() => handleTemplateSelect('custom')} />
          </div>

        </div>
      </div>
    );
  }

  // AI Website generatie functie
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateWebsiteFromAnswers = (answers: Record<string, string | number | boolean>) => {
    const tournamentName = answers.tournament_name || 'Toernooi';
    const tournamentDate = answers.tournament_date || 'Datum TBD';
    const bracketType = answers.bracket_type || 'Single Elimination';
    const participants = answers.participants || '16';
    const gameType = answers.game_type || 'Counter-Strike';
    const brandStyle = answers.brand_style || 'Gaming';
    
    // Bepaal kleuren op basis van game en stijl
    let primaryColor = '#2563eb';
    let secondaryColor = '#7c3aed';
    let backgroundColor = '#0f172a';
    
    if (gameType === 'Counter-Strike') {
      primaryColor = '#ff6b35';
      secondaryColor = '#f7931e';
    } else if (gameType === 'Valorant') {
      primaryColor = '#ff4655';
      secondaryColor = '#0f1923';
    } else if (gameType === 'League of Legends') {
      primaryColor = '#c89b3c';
      secondaryColor = '#463714';
    } else if (gameType === 'Dota 2') {
      primaryColor = '#d32f2f';
      secondaryColor = '#1976d2';
    } else if (gameType === 'Rocket League') {
      primaryColor = '#ff6b35';
      secondaryColor = '#4ecdc4';
    }
    
    if (brandStyle === 'Futuristic') {
      primaryColor = '#00d4ff';
      secondaryColor = '#0099cc';
      backgroundColor = '#0a0a0a';
    } else if (brandStyle === 'Minimalist') {
      primaryColor = '#2d3748';
      secondaryColor = '#4a5568';
      backgroundColor = '#ffffff';
    }
    
    // Genereer HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournamentName} - Esports Tournament</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, ${backgroundColor} 0%, #1a1a2e 100%);
            color: white;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            padding: 2rem 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .tournament-title {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .tournament-subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .tournament-info {
            display: flex;
            justify-content: center;
            gap: 3rem;
            flex-wrap: wrap;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-label {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }
        
        .info-value {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .main-content {
            padding: 4rem 0;
        }
        
        .section {
            margin-bottom: 4rem;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-align: center;
            background: linear-gradient(45deg, ${primaryColor}, ${secondaryColor});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .bracket-info {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .bracket-type {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: ${primaryColor};
        }
        
        .participants-count {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .game-info {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .game-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, ${primaryColor}, ${secondaryColor});
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }
        
        .game-name {
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .schedule {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 3rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .schedule-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            margin-bottom: 1rem;
            border-left: 4px solid ${primaryColor};
        }
        
        .schedule-time {
            font-weight: 600;
            color: ${primaryColor};
        }
        
        .schedule-event {
            font-size: 1.1rem;
        }
        
        .prizes {
            background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            border: 1px solid ${primaryColor}40;
        }
        
        .prize-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .prize-item {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 2rem;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .prize-position {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 1rem;
        }
        
        .prize-amount {
            font-size: 2rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
        }
        
        .cta-section {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            border-radius: 20px;
            padding: 4rem;
            text-align: center;
            margin-top: 4rem;
        }
        
        .cta-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: ${primaryColor};
            padding: 1rem 3rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.2rem;
            margin-top: 2rem;
            transition: transform 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .footer {
            background: rgba(0,0,0,0.5);
            padding: 2rem 0;
            text-align: center;
            margin-top: 4rem;
        }
        
        @media (max-width: 768px) {
            .tournament-title {
                font-size: 2.5rem;
            }
            
            .tournament-info {
                gap: 1.5rem;
            }
            
            .game-info {
                flex-direction: column;
                gap: 1rem;
            }
            
            .schedule-item {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <h1 class="tournament-title">${tournamentName}</h1>
                <p class="tournament-subtitle">Esports Tournament</p>
                <div class="tournament-info">
                    <div class="info-item">
                        <div class="info-label">Datum</div>
                        <div class="info-value">${tournamentDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Format</div>
                        <div class="info-value">${bracketType}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Deelnemers</div>
                        <div class="info-value">${participants} teams</div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <section class="section">
                <h2 class="section-title">Tournament Format</h2>
                <div class="bracket-info">
                    <div class="bracket-type">${bracketType}</div>
                    <div class="participants-count">${participants} teams strijden om de overwinning</div>
                    <div class="game-info">
                        <div class="game-icon">🎮</div>
                        <div class="game-name">${gameType}</div>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2 class="section-title">Schedule</h2>
                <div class="schedule">
                    <div class="schedule-item">
                        <div class="schedule-time">09:00</div>
                        <div class="schedule-event">Registratie & Check-in</div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-time">10:00</div>
                        <div class="schedule-event">Opening Ceremony</div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-time">10:30</div>
                        <div class="schedule-event">Eerste Ronde Begint</div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-time">14:00</div>
                        <div class="schedule-event">Lunch Break</div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-time">15:00</div>
                        <div class="schedule-event">Finale Rondes</div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-time">18:00</div>
                        <div class="schedule-event">Awards Ceremony</div>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2 class="section-title">Prize Pool</h2>
                <div class="prizes">
                    <div class="prize-grid">
                        <div class="prize-item">
                            <div class="prize-position">1st Place</div>
                            <div class="prize-amount">€${getPrizeAmount(String(participants), 1)}</div>
                            <div>Champion</div>
                        </div>
                        <div class="prize-item">
                            <div class="prize-position">2nd Place</div>
                            <div class="prize-amount">€${getPrizeAmount(String(participants), 2)}</div>
                            <div>Runner-up</div>
                        </div>
                        <div class="prize-item">
                            <div class="prize-position">3rd Place</div>
                            <div class="prize-amount">€${getPrizeAmount(String(participants), 3)}</div>
                            <div>Third Place</div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cta-section">
                <h2 class="cta-title">Ready to Compete?</h2>
                <p>Registreer je team en maak kans op de hoofdprijs!</p>
                <a href="#" class="cta-button">Registreer Nu</a>
            </section>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${tournamentName}. Alle rechten voorbehouden.</p>
        </div>
    </footer>
</body>
</html>`;

    return {
      html: htmlContent,
      css: '',
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor
      },
      metadata: {
        title: tournamentName,
        game: gameType,
        format: bracketType,
        participants: participants,
        date: tournamentDate
      }
    };
  };

  // Helper functie voor prize amounts
  const getPrizeAmount = (participants: string, position: number) => {
    const baseAmount = parseInt(participants) * 50;
    switch (position) {
      case 1: return Math.floor(baseAmount * 0.5);
      case 2: return Math.floor(baseAmount * 0.3);
      case 3: return Math.floor(baseAmount * 0.2);
      default: return 0;
    }
  };

  // Template generatie functie (buiten views)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateTemplateFromAnswers = (answers: Record<string, string | number | boolean>) => {
    const components: string[] = ['description', 'tournamentDetails'];
    let primaryColor = '#2563eb';
    let secondaryColor = '#7c3aed';
    let backgroundColor = '#ffffff';
    const customComponents: Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}> = [];

    // Op basis van bracket type
    if (answers.bracket_type === 'single_elimination') {
      components.push('schedule', 'stats');
      customComponents.push({
        id: 'single-elimination-bracket',
        name: 'Single Elimination Bracket',
        description: 'Eliminatie bracket na één verlies',
        icon: '⚔️',
        category: 'Bracket',
        type: 'custom'
      });
    } else if (answers.bracket_type === 'group_stage') {
      components.push('schedule', 'stats', 'registration');
      customComponents.push({
        id: 'group-stage-bracket',
        name: 'Group Stage Bracket',
        description: 'Groepsfase gevolgd door knock-out',
        icon: '👥',
        category: 'Bracket',
        type: 'custom'
      });
    } else if (answers.bracket_type === 'double_elimination') {
      components.push('schedule', 'stats', 'livestream');
      customComponents.push({
        id: 'double-elimination-bracket',
        name: 'Double Elimination Bracket',
        description: 'Twee levens per deelnemer',
        icon: '🔄',
        category: 'Bracket',
        type: 'custom'
      });
    } else if (answers.bracket_type === 'round_robin') {
      components.push('schedule', 'stats', 'registration');
      customComponents.push({
        id: 'round-robin-bracket',
        name: 'Round Robin Bracket',
        description: 'Iedereen speelt tegen iedereen',
        icon: '🔄',
        category: 'Bracket',
        type: 'custom'
      });
    }

    // Op basis van aantal deelnemers
    const participantCount = parseInt(String(answers.participants)) || 16;
    if (participantCount <= 16) {
      components.push('registration', 'rules');
    } else if (participantCount <= 64) {
      components.push('registration', 'rules', 'sponsors');
    } else {
      components.push('registration', 'rules', 'sponsors', 'social', 'contact');
    }

    // Op basis van game type
    if (answers.game_type === 'fifa') {
      primaryColor = '#00a651';
      secondaryColor = '#ff6b35';
      customComponents.push({
        id: 'fifa-stats',
        name: 'FIFA Statistieken',
        description: 'Goals, assists en andere FIFA stats',
        icon: '⚽',
        category: 'Game Stats',
        type: 'custom'
      });
    } else if (answers.game_type === 'lol') {
      primaryColor = '#c89b3c';
      secondaryColor = '#463714';
      backgroundColor = '#0f1419';
      customComponents.push({
        id: 'lol-stats',
        name: 'LoL Statistieken',
        description: 'KDA, CS, gold en andere LoL stats',
        icon: '⚔️',
        category: 'Game Stats',
        type: 'custom'
      });
    } else if (answers.game_type === 'cs2') {
      primaryColor = '#ff6b35';
      secondaryColor = '#c89b3c';
      customComponents.push({
        id: 'cs2-stats',
        name: 'CS2 Statistieken',
        description: 'Kills, deaths, assists en andere CS2 stats',
        icon: '🔫',
        category: 'Game Stats',
        type: 'custom'
      });
    } else if (answers.game_type === 'valorant') {
      primaryColor = '#ff4655';
      secondaryColor = '#0f1419';
      customComponents.push({
        id: 'valorant-stats',
        name: 'Valorant Statistieken',
        description: 'Kills, deaths, assists en andere Valorant stats',
        icon: '🎯',
        category: 'Game Stats',
        type: 'custom'
      });
    } else if (answers.game_type === 'rocket_league') {
      primaryColor = '#ff6b35';
      secondaryColor = '#c89b3c';
      customComponents.push({
        id: 'rocket-league-stats',
        name: 'Rocket League Statistieken',
        description: 'Goals, saves, assists en andere RL stats',
        icon: '🚗',
        category: 'Game Stats',
        type: 'custom'
      });
    }

    // Op basis van brand style
    if (answers.brand_style === 'esl') {
      primaryColor = '#ff6b35';
      secondaryColor = '#c89b3c';
      backgroundColor = '#0f1419';
      customComponents.push({
        id: 'esl-branding',
        name: 'ESL Branding',
        description: 'ESL stijl logo\'s en branding elementen',
        icon: '🏆',
        category: 'Branding',
        type: 'custom'
      });
    } else if (answers.brand_style === 'riot') {
      primaryColor = '#c89b3c';
      secondaryColor = '#463714';
      backgroundColor = '#0f1419';
      customComponents.push({
        id: 'riot-branding',
        name: 'Riot Branding',
        description: 'Riot Games stijl logo\'s en branding',
        icon: '⚔️',
        category: 'Branding',
        type: 'custom'
      });
    } else if (answers.brand_style === 'fifa') {
      primaryColor = '#00a651';
      secondaryColor = '#ff6b35';
      customComponents.push({
        id: 'fifa-branding',
        name: 'FIFA Branding',
        description: 'FIFA stijl logo\'s en branding',
        icon: '⚽',
        category: 'Branding',
        type: 'custom'
      });
    } else if (answers.brand_style === 'minimal') {
      primaryColor = '#374151';
      secondaryColor = '#6b7280';
      backgroundColor = '#f9fafb';
      customComponents.push({
        id: 'minimal-design',
        name: 'Minimaal Design',
        description: 'Clean en minimalistisch design',
        icon: '✨',
        category: 'Design',
        type: 'custom'
      });
    }

    // Op basis van toernooi naam keywords
    const tournamentName = String(answers.tournament_name || '').toLowerCase();
    if (tournamentName.includes('championship') || tournamentName.includes('kampioenschap')) {
      customComponents.push({
        id: 'championship-badge',
        name: 'Kampioenschap Badge',
        description: 'Speciale badge voor kampioenschappen',
        icon: '🏆',
        category: 'Special',
        type: 'custom'
      });
    }
    if (tournamentName.includes('cup') || tournamentName.includes('beker')) {
      customComponents.push({
        id: 'cup-trophy',
        name: 'Beker Trofee',
        description: 'Trofee component voor beker toernooien',
        icon: '🥇',
        category: 'Special',
        type: 'custom'
      });
    }

    // Op basis van datum keywords
    const tournamentDate = String(answers.tournament_date || '').toLowerCase();
    if (tournamentDate.includes('kerst') || tournamentDate.includes('christmas')) {
      customComponents.push({
        id: 'christmas-theme',
        name: 'Kerst Thema',
        description: 'Speciale kerst styling en componenten',
        icon: '🎄',
        category: 'Thema',
        type: 'custom'
      });
    }

    return {
      components,
      customComponents,
      primaryColor,
      secondaryColor,
      backgroundColor
    };
  };

  // Oude wizard code is verwijderd - alle wizard functionaliteit is nu in /editor/wizard
  
  // Wizard resultaat view (voor oude flows die hier nog naartoe redirecten)
  if (currentView === 'wizard-result') {
    // const generatedWebsite = generateWebsiteFromAnswers(wizardAnswers);
    // const generatedTemplate = generateTemplateFromAnswers(wizardAnswers);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* Header */}
        <div className="bg-gray-800 shadow-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Template Wizard Voltooid!</h1>
                  <p className="text-gray-300">Je gepersonaliseerde template is klaar</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/editor/wizard')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Nieuwe Wizard Starten</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultaat Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-4">Template gegenereerd met de oude wizard.</p>
            <p className="text-gray-400 mb-8">Gebruik de nieuwe AI Wizard voor betere resultaten!</p>
            <button
              onClick={() => router.push('/editor/wizard')}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              Ga naar Nieuwe AI Wizard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Oude wizard code hier verwijderd - alle functionaliteit is nu in /editor/wizard
  
  // Wizard resultaat view - redirect naar nieuwe wizard
  if (currentView === 'wizard-result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* Header */}
        <div className="bg-gray-800 shadow-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Template Wizard Voltooid!</h1>
                  <p className="text-gray-300">Je gepersonaliseerde template is klaar</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/editor/wizard')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Ga naar AI Wizard</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultaat Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
            <p className="text-gray-300 mb-4">De oude wizard is vervangen door de nieuwe AI-powered wizard.</p>
            <button
              onClick={() => router.push('/editor/wizard')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Open AI Website Maker
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Oude wizard resultaat view - verwijderd omdat wizardAnswers niet meer bestaat
  // Deze code is vervangen door redirect naar /editor/wizard
  
  // Toernooi aanmaken view
  if (currentView === 'create-tournament') {
    return (
      <div className="h-screen overflow-hidden relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.06}
            scanlineIntensity={0}
            speed={0.5}
            scanlineFrequency={0.2}
            warpAmount={0.25}
            resolutionScale={1}
          />
        </div>
        {/* Top Navigation */}
        <div className="bg-gray-800/40 backdrop-blur-md shadow-lg border-b border-white/20 px-6 py-4 relative z-20">
          <div className="max-w-7xl mx-auto flex justify-end">
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('manage-tournament')}
                className="bg-gray-600/20 backdrop-blur-md border border-gray-500/30 text-gray-300 py-2 px-4 rounded-xl font-medium hover:bg-gray-600/30 hover:border-gray-500/50 hover:text-gray-200 transition-all duration-300 shadow-lg hover:shadow-gray-500/20"
              >
                Terug naar Toernooien
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-300 py-2 px-4 rounded-xl font-medium hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-200 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-3 p-6 gap-6 overflow-hidden relative z-20">
          {/* Linker paneel - Configuratie */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 h-[calc(100vh-80px-48px)] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Toernooi Manager</h2>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-700/70 backdrop-blur-sm p-1 rounded-lg border border-white/20">
                  <button
                    onClick={() => setLeftPanelTab('edit')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      leftPanelTab === 'edit'
                        ? 'bg-gray-600 text-white shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Bewerk
                  </button>
                  <button
                    onClick={() => setLeftPanelTab('add')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      leftPanelTab === 'add'
                        ? 'bg-gray-600 text-white shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Toevoeg
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 pb-0">
                {leftPanelTab === 'edit' ? (
                  <>
                    {/* Kleuren */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Kleuren</h3>
                        <button
                          onClick={() => toggleSectionDropdown('colors')}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedSections.colors ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Achtergrond Kleur
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <input
                                  type="color"
                                  value={tournamentConfig.backgroundColor}
                                  onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                  className="w-12 h-10 opacity-0 absolute cursor-pointer"
                                />
                                <div 
                                  className="w-12 h-10 border-2 border-gray-600 rounded cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                  style={{ backgroundColor: tournamentConfig.backgroundColor }}
                                />
                              </div>
                              <input
                                type="text"
                                value={tournamentConfig.backgroundColor}
                                onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                              />
                            </div>
                          </div>

                          </div>
                        </div>
                      </div>

                       {/* Ingeschakelde Componenten */}
                       <div className="mb-6">
                         <div className="flex items-center justify-between mb-4">
                           <div>
                             <h3 className="text-lg font-semibold text-white">Bewerk Componenten</h3>
                             <p className="text-sm text-gray-400">Configureer je huidige componenten</p>
                           </div>
                           <button
                             onClick={() => toggleSectionDropdown('components')}
                             className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                           >
                             <svg 
                               className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.components ? 'rotate-180' : ''}`} 
                               fill="none" 
                               stroke="currentColor" 
                               viewBox="0 0 24 24"
                             >
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                             </svg>
                           </button>
                         </div>
                         
                         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                           expandedSections.components ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                         }`}>
                           <div className="space-y-4">
                           {componentOrder.map((componentId) => {
                             const component = allComponents[componentId as keyof typeof allComponents];
                             if (!component) return null;
                             const isExpanded = expandedComponents[component.id];
                             return (
                               <div key={component.id} className="border border-white/20 rounded-xl overflow-hidden bg-gray-700/70 backdrop-blur-sm">
                                 {/* Component Header */}
                                 <div className="bg-gray-700/70 backdrop-blur-sm px-4 py-3 border-b border-white/20">
                                   <div className="flex items-center justify-between">
                                     <button
                                       onClick={() => toggleComponentDropdown(component.id)}
                                       className="flex items-center gap-3 flex-1 text-left hover:bg-gray-600 rounded-md p-2 -m-2 transition-colors"
                                     >
                                       <span className="text-lg">{component.icon}</span>
                                       <div>
                                         <div className="font-medium text-white">{component.name}</div>
                                         <div className="text-sm text-gray-400">{component.description}</div>
                                       </div>
                                       <div className="ml-auto">
                                         <svg 
                                           className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                           fill="none" 
                                           stroke="currentColor" 
                                           viewBox="0 0 24 24"
                                         >
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                         </svg>
                                       </div>
                                     </button>
                                     <div className="flex items-center gap-2 ml-2">
                                       {/* Toggle Switch - Tijdelijk aan/uit */}
                                       <button
                                         onClick={() => toggleComponentVisibility(component.id)}
                                         className={`w-12 h-6 rounded-full transition-colors ${
                                           enabledComponents[component.id as keyof typeof enabledComponents]
                                             ? 'bg-green-500'
                                             : 'bg-gray-600'
                                         }`}
                                         title={enabledComponents[component.id as keyof typeof enabledComponents] ? 'Component uitschakelen' : 'Component inschakelen'}
                                       >
                                         <div
                                           className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                             enabledComponents[component.id as keyof typeof enabledComponents]
                                               ? 'translate-x-6'
                                               : 'translate-x-0.5'
                                           }`}
                                         />
                                       </button>
                                       
                                       {/* Remove Button - Volledig verwijderen */}
                                       <button
                                         onClick={() => removeComponent(component.id)}
                                         className="text-gray-400 hover:text-red-500 transition-colors"
                                         title="Component volledig verwijderen"
                                       >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                         </svg>
                                       </button>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Component Content - Collapsible */}
                                 <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                   isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                 }`}>
                                   <div className="p-4">
                                     {component.id === 'header' && (
                                       <div className="space-y-4">
                                         <div>
                                           <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Logo URL
                                           </label>
                                           <input
                                             type="url"
                                             value={tournamentConfig.logo || ''}
                                             onChange={(e) => handleConfigChange('logo', e.target.value)}
                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white placeholder-gray-600"
                                             placeholder="https://example.com/logo.png"
                                           />
                                         </div>
                                         <div>
                                           <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Logo Upload
                                           </label>
                                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                             <input
                                               type="file"
                                               accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                               onChange={(e) => {
                                                 const file = e.target.files?.[0];
                                                 if (file && file.type.startsWith('image/')) {
                                                   const reader = new FileReader();
                                                   reader.onload = (event) => {
                                                     const result = event.target?.result as string;
                                                     handleConfigChange('logo', result);
                                                   };
                                                   reader.readAsDataURL(file);
                                                 }
                                               }}
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
                                               <span className="text-sm text-gray-300">Klik om logo te uploaden</span>
                                               <span className="text-xs text-gray-500">PNG, JPG, SVG (max 5MB)</span>
                                             </label>
                                           </div>
                                         </div>
                                         {tournamentConfig.logo && (
                                           <div className="mt-3">
                                             <p className="text-sm text-gray-300 mb-2">Preview:</p>
                                             <Image
                                               src={tournamentConfig.logo}
                                               alt="Logo preview"
                                               width={128}
                                               height={80}
                                               className="max-h-20 max-w-32 object-contain border rounded"
                                             />
                                           </div>
                                         )}
                                         <div className="grid grid-cols-2 gap-4">
                                           <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                               Achtergrond Kleur
                                             </label>
                                             <div className="flex items-center gap-3">
                                               <div className="relative">
                                                 <input
                                                   type="color"
                                                   value={tournamentConfig.headerBackgroundColor || '#ffffff'}
                                                   onChange={(e) => handleConfigChange('headerBackgroundColor', e.target.value)}
                                                   className="w-12 h-10 opacity-0 absolute cursor-pointer"
                                                 />
                                                 <div 
                                                   className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                   style={{ backgroundColor: tournamentConfig.headerBackgroundColor || '#ffffff' }}
                                                 />
                                               </div>
                                               <input
                                                 type="text"
                                                 value={tournamentConfig.headerBackgroundColor || '#ffffff'}
                                                 onChange={(e) => handleConfigChange('headerBackgroundColor', e.target.value)}
                                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white"
                                                 placeholder="#ffffff"
                                               />
                                             </div>
                                           </div>
                                           <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                               Tekst Kleur
                                             </label>
                                             <div className="flex items-center gap-3">
                                               <div className="relative">
                                                 <input
                                                   type="color"
                                                   value={tournamentConfig.headerTextColor || '#000000'}
                                                   onChange={(e) => handleConfigChange('headerTextColor', e.target.value)}
                                                   className="w-12 h-10 opacity-0 absolute cursor-pointer"
                                                 />
                                                 <div 
                                                   className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                   style={{ backgroundColor: tournamentConfig.headerTextColor || '#000000' }}
                                                 />
                                               </div>
                                               <input
                                                 type="text"
                                                 value={tournamentConfig.headerTextColor || '#000000'}
                                                 onChange={(e) => handleConfigChange('headerTextColor', e.target.value)}
                                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white"
                                                 placeholder="#000000"
                                               />
                                             </div>
                                           </div>
                                         </div>
                                       </div>
                                     )}
                                     {component.id === 'livestream' && (
                                       <div className="space-y-4">
                                         <div>
                                           <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Twitch URL
                                           </label>
                                           <input
                                             type="url"
                                             value={tournamentConfig.twitchUrl || ''}
                                             onChange={(e) => handleConfigChange('twitchUrl', e.target.value)}
                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white placeholder-gray-600"
                                             placeholder="https://www.twitch.tv/jouwkanaal"
                                           />
                                         </div>
                                         <div className="flex items-center justify-between">
                                           <span className="text-sm font-medium text-gray-700">Chat inschakelen</span>
                                           <button
                                             onClick={() => handleConfigChange('chatEnabled', tournamentConfig.chatEnabled === 'true' ? 'false' : 'true')}
                                             className={`w-12 h-6 rounded-full transition-colors ${
                                               tournamentConfig.chatEnabled === 'true'
                                                 ? 'bg-green-500'
                                                 : 'bg-gray-300'
                                             }`}
                                           >
                                             <div
                                               className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                 tournamentConfig.chatEnabled === 'true'
                                                   ? 'translate-x-6'
                                                   : 'translate-x-0.5'
                                               }`}
                                             />
                                           </button>
                                         </div>
                                         <div className="text-xs text-gray-500">
                                           Voer een Twitch URL in om de livestream te tonen
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                           </div>
                         </div>
                       </div>
                    </>
                  ) : (
                     /* Toevoeg Tab - Alle beschikbare componenten met Drag & Drop */
                     <div>
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <h3 className="text-lg font-semibold text-gray-800">Component Bibliotheek</h3>
                           <p className="text-sm text-gray-300">Sleep componenten naar de preview om ze toe te voegen of beheer ze hier</p>
                         </div>
                         <button
                           onClick={() => toggleSectionDropdown('library')}
                           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                         >
                           <svg 
                             className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.library ? 'rotate-180' : ''}`} 
                             fill="none" 
                             stroke="currentColor" 
                             viewBox="0 0 24 24"
                           >
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </button>
                       </div>
                       
                       <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                         expandedSections.library ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                       }`}>
                         <div className="grid grid-cols-1 gap-3">
                         {['Basis', 'Informatie', 'Interactie', 'Marketing'].map(category => (
                           <div key={category} className="mb-6">
                             <h4 className="text-md font-semibold text-gray-700 mb-3">{category}</h4>
                             <div className="grid grid-cols-1 gap-2">
                               {Object.values(allComponents)
                                 .filter(comp => comp.category === category)
                                 .map((component) => {
                                   const isEnabled = enabledComponents[component.id as keyof typeof enabledComponents];
                                   return (
                                     <div
                                       key={component.id}
                                       draggable={!isEnabled} // Alleen draggable als niet toegevoegd
                                       onDragStart={(e) => {
                                         if (!isEnabled) {
                                           e.dataTransfer.setData('text/plain', component.id);
                                           setActiveId(component.id);
                                           setDraggedComponent(component);
                                           setIsDraggingFromLibrary(true);
                                         }
                                       }}
                                       className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                         isEnabled
                                           ? 'border-green-300 bg-green-50 cursor-default'
                                           : 'border-gray-200 hover:bg-gray-50 cursor-grab active:cursor-grabbing'
                                       }`}
                                     >
                                       <div className="flex items-center gap-3">
                                         <span className="text-lg">{component.icon}</span>
                                         <div>
                                           <div className="font-medium text-white">{component.name}</div>
                                           <div className="text-sm text-gray-500">{component.description}</div>
                                         </div>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         {/* Toggle Switch */}
                                         <button
                                           onClick={() => toggleComponentVisibility(component.id)}
                                           className={`w-12 h-6 rounded-full transition-colors ${
                                             isEnabled
                                               ? 'bg-green-500'
                                               : 'bg-gray-300'
                                           }`}
                                         >
                                           <div
                                             className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                               isEnabled
                                                 ? 'translate-x-6'
                                                 : 'translate-x-0.5'
                                             }`}
                                           />
                                         </button>
                                         
                                         
                                         {/* Remove Button (alleen zichtbaar als toegevoegd) */}
                                         {isEnabled && (
                                           <button
                                             onClick={() => removeComponent(component.id)}
                                             className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                                             title="Component verwijderen"
                                           >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                             </svg>
                                           </button>
                                         )}
                                       </div>
                                     </div>
                                   );
                                 })}
                             </div>
                           </div>
                         ))}
                         </div>
                       </div>
                     </div>
                  )}
                </div>

                {/* Actie knoppen */}
                <div className="p-6 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-3">
                    {(!editingTournament || editingTournamentStatus === 'draft') && (
                      <button
                        onClick={handleSaveDraft}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-colors text-sm shadow-lg"
                      >
                        Save Draft
                      </button>
                    )}
                    {editingTournament && editingTournamentStatus === 'published' && (
                      <button
                        onClick={() => {
                          const tournamentId = editingTournament;
                          if (tournamentId) {
                            handleUnpublish(tournamentId);
                            setCurrentView('manage-tournament');
                            setEditingTournament(null);
                            setEditingTournamentStatus(null);
                          }
                        }}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-colors text-sm shadow-lg"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={handlePublish}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors text-sm shadow-lg"
                    >
                      {editingTournament ? (editingTournamentStatus === 'published' ? 'Update' : 'Publish') : 'Publish'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-colors text-sm shadow-lg"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechter paneel - Live Preview */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 h-[calc(100vh-80px-48px)] flex flex-col">
                {/* Preview Header met Viewport Controls */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Live Preview</h2>
                  
                  {/* Viewport Controls */}
                  <div className="flex items-center gap-3">
                    {/* Viewport Indicator */}
                    <div className="text-sm text-gray-400 font-medium">
                      {previewViewport === 'desktop' && 'Desktop (1920px)'}
                      {previewViewport === 'tablet' && 'Tablet (768px)'}
                      {previewViewport === 'mobile' && 'Mobile (375px)'}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-700/70 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                      <button
                        onClick={() => handleViewportChange('desktop')}
                        className={`p-2 rounded-md transition-colors ${
                          previewViewport === 'desktop'
                            ? 'bg-gray-600 text-blue-400 shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Desktop View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleViewportChange('tablet')}
                        className={`p-2 rounded-md transition-colors ${
                          previewViewport === 'tablet'
                            ? 'bg-gray-600 text-blue-400 shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Tablet View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleViewportChange('mobile')}
                        className={`p-2 rounded-md transition-colors ${
                          previewViewport === 'mobile'
                            ? 'bg-gray-600 text-blue-400 shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Mobile View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={componentOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      id="preview-area"
                      className="border rounded-lg overflow-hidden flex-1 overflow-y-auto min-h-[400px] mx-auto transition-all ease-in-out"
                      style={{ 
                        background: tournamentConfig.backgroundColor,
                        color: tournamentConfig.textColor,
                        transitionDuration: animationPhase === 'scale' 
                          ? `${animationDuration * 0.6}ms`
                          : animationPhase === 'width'
                          ? `${animationDuration * 0.4}ms`
                          : '0ms',
                        width: previewViewport === 'desktop' 
                          ? '100%' 
                          : previewViewport === 'tablet'
                          ? '768px'
                          : '375px',
                        maxWidth: previewViewport === 'desktop' 
                          ? 'none' 
                          : previewViewport === 'tablet'
                          ? '768px'
                          : '375px',
                        transform: previewViewport === 'desktop' 
                          ? 'scale(1)' 
                          : previewViewport === 'tablet'
                          ? 'scale(0.95)'
                          : 'scale(0.9)',
                        transformOrigin: 'center top'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                        
                        // Eenvoudigere methode: bepaal positie op basis van scroll positie
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const scrollTop = e.currentTarget.scrollTop;
                        const totalY = y + scrollTop;
                        
                        // Bepaal de index op basis van de positie
                        let targetIndex = componentOrder.length;
                        
                        // Als we over bestaande componenten slepen
                        if (componentOrder.length > 0) {
                          // Gebruik de werkelijke component elementen om de positie te bepalen
                          const componentElements = e.currentTarget.querySelectorAll('[data-component-index]');
                          let foundIndex = componentOrder.length;
                          
                          componentElements.forEach((element, index) => {
                            const elementRect = element.getBoundingClientRect();
                            const elementTop = elementRect.top - rect.top + scrollTop;
                            // const elementBottom = elementRect.bottom - rect.top + scrollTop;
                            
                            // Als de muis boven het midden van het element is, plaats ervoor
                            if (totalY < elementTop + (elementRect.height / 2)) {
                              foundIndex = Math.min(foundIndex, index);
                            }
                          });
                          
                          targetIndex = foundIndex;
                        }
                        
                        setDragOverIndex(targetIndex);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const componentId = e.dataTransfer.getData('text/plain');
                        
                        // Alleen toevoegen als component bestaat in allComponents
                        if (componentId && allComponents[componentId as keyof typeof allComponents] && !enabledComponents[componentId as keyof typeof enabledComponents]) {
                          setEnabledComponents(prev => ({
                            ...prev,
                            [componentId]: true
                          }));
                          
                          // Voeg component toe op de gewenste positie
                          setComponentOrder(prev => {
                            if (!prev.includes(componentId)) {
                              const dropIndex = dragOverIndex !== null ? dragOverIndex : prev.length;
                              const newOrder = [...prev];
                              newOrder.splice(dropIndex, 0, componentId);
                              return newOrder;
                            }
                            return prev;
                          });
                        }
                      }}
                    >
                      {/* Drop Zone Indicator */}
                      {componentOrder.length === 0 && (
                        <div 
                          className="h-full min-h-[400px] rounded-lg"
                          style={{
                            background: tournamentConfig.backgroundColor,
                            color: tournamentConfig.textColor
                          }}
                        >
                        </div>
                      )}

                      {/* Modulaire Preview - Componenten worden dynamisch gerenderd */}
                      {componentOrder.map((componentId, index) => {
                        const component = allComponents[componentId as keyof typeof allComponents];
                        if (!component) return null;
                        
                        const isEnabled = enabledComponents[componentId as keyof typeof enabledComponents];

                        // Toon alleen ingeschakelde componenten in live preview
                        if (!isEnabled) return null;

                        // Drop indicator voor nieuwe componenten
                        const showDropIndicator = isDraggingFromLibrary && dragOverIndex === index;

                        return (
                          <div key={`${componentId}-${index}`} data-component-index={index}>
                            {/* Drop indicator */}
                            {showDropIndicator && (
                              <div className="h-2 bg-blue-500 rounded-full mx-4 mb-2 shadow-lg animate-pulse">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                              </div>
                            )}
                            
                            <SortableItem key={componentId} id={componentId} isPreview={true}>
                              {(() => {
                                switch (componentId) {
                                  case 'header':
                                              return (
                                                <Header 
                                                  config={{
                                                    logo: {
                                                      src: tournamentConfig.logo || '/logoheader.png',
                                                      alt: tournamentConfig.name || 'Logo',
                                                      width: 200,
                                                      height: 80
                                                    },
                                                    backgroundColor: tournamentConfig.headerBackgroundColor || '#ffffff',
                                                    textColor: tournamentConfig.headerTextColor || '#000000'
                                                  }}
                                                />
                                              );
                                            case 'livestream':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <div>
                                                    <h2 
                                                      className="text-2xl font-bold mb-4"
                                                      style={{ color: tournamentConfig.primaryColor }}
                                                    >
                                                      Live Stream
                                                    </h2>
                                                    {tournamentConfig.twitchUrl ? (
                                                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                                                        <div className={`flex ${tournamentConfig.chatEnabled === 'true' ? (previewViewport === 'desktop' ? 'flex-row' : 'flex-col') : ''}`}>
                                                          {/* Twitch Stream */}
                                                          <div className={`${tournamentConfig.chatEnabled === 'true' ? (previewViewport === 'desktop' ? 'w-3/4' : 'w-full') : 'w-full'}`}>
                                                            <div className="aspect-video">
                                                              <iframe
                                                                src={`https://player.twitch.tv/?channel=${tournamentConfig.twitchUrl.split('/').pop()}&parent=${window.location.hostname}&autoplay=true&muted=false`}
                                                                allow="autoplay; encrypted-media; picture-in-picture"
                                                                allowFullScreen
                                                                className="w-full h-full"
                                                              />
                                                            </div>
                                                          </div>
                                                          
                                                          {/* Twitch Chat */}
                                                          {tournamentConfig.chatEnabled === 'true' && (
                                                            <div className={`${tournamentConfig.chatEnabled === 'true' ? (previewViewport === 'desktop' ? 'w-1/4 border-l border-gray-700' : 'w-full') : ''}`}>
                                                            <div className={previewViewport === 'desktop' ? 'h-96' : 'h-80'}>
                                                              <iframe
                                                                src={`https://www.twitch.tv/embed/${tournamentConfig.twitchUrl.split('/').pop()}/chat?parent=${window.location.hostname}`}
                                                                className="w-full h-full"
                                                              />
                                                            </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="bg-gray-100 p-8 rounded-lg text-center">
                                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                          </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white mb-2">Twitch Livestream</h3>
                                                        <p className="text-gray-300">Voer een Twitch URL in om de livestream te tonen</p>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            case 'description':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-4"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Over dit Toernooi
                                                  </h2>
                                                  <p className="text-gray-700 leading-relaxed">
                                                    {tournamentConfig.description || 'Voeg een beschrijving toe voor je toernooi...'}
                                                  </p>
                                                </div>
                                              );
                                            case 'tournamentDetails':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Toernooi Details
                                                  </h2>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                      <h3 className="font-semibold text-white mb-2">📅 Datum</h3>
                                                      <p className="text-gray-300">
                                                        {tournamentConfig.startDate || 'Startdatum'} - {tournamentConfig.endDate || 'Einddatum'}
                                                      </p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                      <h3 className="font-semibold text-white mb-2">📍 Locatie</h3>
                                                      <p className="text-gray-300">{tournamentConfig.location || 'Locatie nog niet bekend'}</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                      <h3 className="font-semibold text-white mb-2">👥 Deelnemers</h3>
                                                      <p className="text-gray-300">
                                                        Max {tournamentConfig.maxParticipants || 'onbeperkt'} deelnemers
                                                      </p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                      <h3 className="font-semibold text-white mb-2">💰 Inschrijfgeld</h3>
                                                      <p className="text-gray-300">
                                                        {tournamentConfig.entryFee ? `€${tournamentConfig.entryFee}` : 'Gratis'}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'schedule':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Wedstrijd Schema
                                                  </h2>
                                                  <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                      <div className="flex justify-between items-center">
                                                        <div>
                                                          <h3 className="font-semibold text-white">Kwalificaties</h3>
                                                          <p className="text-sm text-gray-300">Eerste ronde</p>
                                                        </div>
                                                        <div className="text-right">
                                                          <p className="font-semibold text-white">10:00 - 12:00</p>
                                                          <p className="text-sm text-gray-300">Zaal A</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                      <div className="flex justify-between items-center">
                                                        <div>
                                                          <h3 className="font-semibold text-white">Halve Finales</h3>
                                                          <p className="text-sm text-gray-300">Tweede ronde</p>
                                                        </div>
                                                        <div className="text-right">
                                                          <p className="font-semibold text-white">14:00 - 16:00</p>
                                                          <p className="text-sm text-gray-300">Zaal A</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                      <div className="flex justify-between items-center">
                                                        <div>
                                                          <h3 className="font-semibold text-white">Finale</h3>
                                                          <p className="text-sm text-gray-300">Eindstrijd</p>
                                                        </div>
                                                        <div className="text-right">
                                                          <p className="font-semibold text-white">18:00 - 20:00</p>
                                                          <p className="text-sm text-gray-300">Hoofdpodium</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'stats':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Live Statistieken
                                                  </h2>
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="text-3xl font-bold mb-2" style={{ color: tournamentConfig.primaryColor }}>24</div>
                                                      <p className="text-gray-300">Deelnemers</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="text-3xl font-bold mb-2" style={{ color: tournamentConfig.secondaryColor }}>12</div>
                                                      <p className="text-gray-300">Wedstrijden</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="text-3xl font-bold mb-2" style={{ color: tournamentConfig.primaryColor }}>8</div>
                                                      <p className="text-gray-300">Teams</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="text-3xl font-bold mb-2" style={{ color: tournamentConfig.secondaryColor }}>3</div>
                                                      <p className="text-gray-300">Rondes</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'prizes':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Prijzen
                                                  </h2>
                                                  <div className="space-y-4">
                                                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                                                      <div className="flex items-center space-x-4">
                                                        <div className="text-4xl">🥇</div>
                                                        <div>
                                                          <h3 className="text-xl font-bold text-white">1e Plaats</h3>
                                                          <p className="text-lg font-semibold text-yellow-600">
                                                            {tournamentConfig.prizePool ? `€${Math.floor(parseInt(tournamentConfig.prizePool) * 0.5)}` : '€500'}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                                                      <div className="flex items-center space-x-4">
                                                        <div className="text-4xl">🥈</div>
                                                        <div>
                                                          <h3 className="text-xl font-bold text-white">2e Plaats</h3>
                                                          <p className="text-lg font-semibold text-gray-300">
                                                            {tournamentConfig.prizePool ? `€${Math.floor(parseInt(tournamentConfig.prizePool) * 0.3)}` : '€300'}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                                                      <div className="flex items-center space-x-4">
                                                        <div className="text-4xl">🥉</div>
                                                        <div>
                                                          <h3 className="text-xl font-bold text-white">3e Plaats</h3>
                                                          <p className="text-lg font-semibold text-orange-600">
                                                            {tournamentConfig.prizePool ? `€${Math.floor(parseInt(tournamentConfig.prizePool) * 0.2)}` : '€200'}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'registration':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Inschrijven
                                                  </h2>
                                                  <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border">
                                                    <form className="space-y-4">
                                                      <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Naam</label>
                                                        <input 
                                                          type="text" 
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          placeholder="Jouw naam"
                                                        />
                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                        <input 
                                                          type="email" 
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          placeholder="jouw@email.com"
                                                        />
                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Team naam</label>
                                                        <input 
                                                          type="text" 
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          placeholder="Team naam (optioneel)"
                                                        />
                                                      </div>
                                                      <button 
                                                        type="submit"
                                                        className="w-full py-2 px-4 rounded-md text-white font-medium"
                                                        style={{ backgroundColor: tournamentConfig.primaryColor }}
                                                      >
                                                        Inschrijven
                                                      </button>
                                                    </form>
                                                  </div>
                                                </div>
                                              );
                                            case 'rules':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Toernooi Regels
                                                  </h2>
                                                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                    <div className="space-y-4">
                                                      <div>
                                                        <h3 className="font-semibold text-white mb-2">1. Algemene Regels</h3>
                                                        <p className="text-gray-300">Alle deelnemers moeten zich houden aan de algemene gedragscode en fair play principes.</p>
                                                      </div>
                                                      <div>
                                                        <h3 className="font-semibold text-white mb-2">2. Inschrijving</h3>
                                                        <p className="text-gray-300">Inschrijving is verplicht en sluit 24 uur voor aanvang van het toernooi.</p>
                                                      </div>
                                                      <div>
                                                        <h3 className="font-semibold text-white mb-2">3. Wedstrijdregels</h3>
                                                        <p className="text-gray-300">Elke wedstrijd duurt maximaal 30 minuten. Bij gelijkspel volgt een penalty shootout.</p>
                                                      </div>
                                                      <div>
                                                        <h3 className="font-semibold text-white mb-2">4. Disciplinaire Maatregelen</h3>
                                                        <p className="text-gray-300">Overtreding van de regels kan leiden tot diskwalificatie van het toernooi.</p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'sponsors':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6 text-center"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Onze Sponsors
                                                  </h2>
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                        <span className="text-gray-500 font-semibold">Logo</span>
                                                      </div>
                                                      <p className="text-sm text-gray-300">Hoofdsponsor</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                        <span className="text-gray-500 font-semibold">Logo</span>
                                                      </div>
                                                      <p className="text-sm text-gray-300">Partner</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                        <span className="text-gray-500 font-semibold">Logo</span>
                                                      </div>
                                                      <p className="text-sm text-gray-300">Supporter</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                        <span className="text-gray-500 font-semibold">Logo</span>
                                                      </div>
                                                      <p className="text-sm text-gray-300">Partner</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            case 'social':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6 text-center"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Volg ons
                                                  </h2>
                                                  <div className="flex justify-center space-x-6">
                                                    <a href="#" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                                      </svg>
                                                      <span>Twitter</span>
                                                    </a>
                                                    <a href="#" className="flex items-center space-x-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                                      </svg>
                                                      <span>Facebook</span>
                                                    </a>
                                                    <a href="#" className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                                                      </svg>
                                                      <span>Instagram</span>
                                                    </a>
                                                  </div>
                                                </div>
                                              );
                                            case 'contact':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundColor,
                                                    color: tournamentConfig.textColor
                                                  }}
                                                >
                                                  <h2 
                                                    className="text-2xl font-bold mb-6"
                                                    style={{ color: tournamentConfig.primaryColor }}
                                                  >
                                                    Contact
                                                  </h2>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div>
                                                      <h3 className="text-lg font-semibold text-white mb-4">Organisatie</h3>
                                                      <div className="space-y-3">
                                                        <div className="flex items-center space-x-3">
                                                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                          </svg>
                                                          <span className="text-gray-300">info@toernooi.nl</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                          </svg>
                                                          <span className="text-gray-300">+31 6 12345678</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                          </svg>
                                                          <span className="text-gray-300">Amsterdam, Nederland</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div>
                                                      <h3 className="text-lg font-semibold text-white mb-4">Stel een vraag</h3>
                                                      <form className="space-y-4">
                                                        <input 
                                                          type="text" 
                                                          placeholder="Jouw naam"
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <input 
                                                          type="email" 
                                                          placeholder="Email adres"
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <textarea 
                                                          placeholder="Jouw vraag"
                                                          rows={4}
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        ></textarea>
                                                        <button 
                                                          type="submit"
                                                          className="w-full py-2 px-4 rounded-md text-white font-medium"
                                                          style={{ backgroundColor: tournamentConfig.primaryColor }}
                                                        >
                                                          Verstuur
                                                        </button>
                                                      </form>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            default:
                                              // Voor custom componenten
                                              if ((component as {type?: string}).type === 'custom') {
                                                return (
                                                  <div 
                                                    className="px-4 py-8"
                                                    style={{
                                                      background: tournamentConfig.backgroundColor,
                                                      color: tournamentConfig.textColor
                                                    }}
                                                  >
                                                    <h2 
                                                      className="text-2xl font-bold mb-6"
                                                      style={{ color: tournamentConfig.primaryColor }}
                                                    >
                                                      {component.name}
                                                    </h2>
                                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                      <div className="flex items-center space-x-4 mb-4">
                                                        <div className="text-4xl">{component.icon}</div>
                                                        <div>
                                                          <h3 className="text-lg font-semibold text-white">{component.name}</h3>
                                                          <p className="text-gray-300">{component.description}</p>
                                                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {component.category}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-gray-300 text-sm">
                                                          Dit is een custom component gegenereerd door de wizard. 
                                                          Hier kun je specifieke content toevoegen voor {component.name.toLowerCase()}.
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                              return null;
                                          }
                                        })()}
                                   </SortableItem>
                                 </div>
                               );
                             })}

                              {/* Drop indicator aan het einde */}
                              {isDraggingFromLibrary && dragOverIndex !== null && dragOverIndex >= componentOrder.length && componentOrder.length > 0 && (
                              <div className="h-2 bg-blue-500 rounded-full mx-4 mt-2 shadow-lg animate-pulse">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                              </div>
                            )}
                          </div>
                      </SortableContext>
                      
                      {/* Drag Overlay */}
                      <DragOverlay>
                        {activeId && draggedComponent ? (
                          <div className="bg-white rounded-lg shadow-lg opacity-90">
                            {/* Render het echte component preview */}
                            {(() => {
                              // Als het van de library komt, toon het echte component
                              if (isDraggingFromLibrary && draggedComponent.id) {
                                switch (draggedComponent.id) {
                                  case 'header':
                                    return (
                                      <Header 
                                        config={{
                                          logo: {
                                            src: tournamentConfig.logo || '/logoheader.png',
                                            alt: tournamentConfig.name || 'Logo',
                                            width: 200,
                                            height: 80
                                          },
                                          backgroundColor: tournamentConfig.headerBackgroundColor || '#ffffff',
                                          textColor: tournamentConfig.headerTextColor || '#000000'
                                        }}
                                      />
                                    );
                                  case 'description':
                                    return (
                                      <div className="px-4 py-8">
                                        <div>
                                          <h2 
                                            className="text-2xl font-bold mb-4"
                                            style={{ color: tournamentConfig.primaryColor }}
                                          >
                                            Over dit toernooi
                                          </h2>
                                          <p className="text-lg leading-relaxed text-gray-700">
                                            {tournamentConfig.description || 'Beschrijf hier je toernooi...'}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  
                                  case 'tournamentDetails':
                                    return (
                                      <div className="px-4 py-8">
                                        <div>
                                          <h2 
                                            className="text-2xl font-bold mb-4"
                                            style={{ color: tournamentConfig.primaryColor }}
                                          >
                                            Toernooi Details
                                          </h2>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                              <h3 className="font-semibold text-white mb-2">Locatie</h3>
                                              <p className="text-gray-300">{tournamentConfig.location || 'Niet opgegeven'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                              <h3 className="font-semibold text-white mb-2">Max. Deelnemers</h3>
                                              <p className="text-gray-300">{tournamentConfig.maxParticipants || 'Onbeperkt'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  
                                  case 'registration':
                                    return (
                                      <div className="px-4 py-8">
                                        <div className="max-w-md mx-auto">
                                          <div 
                                            className="p-6 rounded-lg text-white"
                                            style={{ backgroundColor: tournamentConfig.primaryColor }}
                                          >
                                            <h3 className="text-xl font-bold mb-4">Inschrijven</h3>
                                            <p className="mb-4">Schrijf je nu in voor dit toernooi!</p>
                                            <button 
                                              className="w-full bg-white text-white py-3 px-4 rounded-lg font-semibold"
                                              style={{ color: tournamentConfig.primaryColor }}
                                            >
                                              Inschrijven voor Toernooi
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  
                                   case 'stats':
                                     return (
                                       <div className="px-4 py-8">
                                         <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                                           <div 
                                             className="p-4 rounded-lg text-center text-white"
                                             style={{ backgroundColor: tournamentConfig.secondaryColor }}
                                           >
                                             <div className="text-2xl font-bold">{tournamentConfig.maxParticipants || '∞'}</div>
                                             <div className="text-sm opacity-90">Max. Deelnemers</div>
                                           </div>
                                           <div 
                                             className="p-4 rounded-lg text-center text-white"
                                             style={{ backgroundColor: tournamentConfig.primaryColor }}
                                           >
                                             <div className="text-2xl font-bold">€{tournamentConfig.prizePool || '0'}</div>
                                             <div className="text-sm opacity-90">Prijzenpot</div>
                                           </div>
                                         </div>
                                       </div>
                                     );
                                   
                                   case 'livestream':
                                     return (
                                       <div className="px-4 py-8">
                                         <div>
                                           <h2 
                                             className="text-2xl font-bold mb-4"
                                             style={{ color: tournamentConfig.primaryColor }}
                                           >
                                             Live Stream
                                           </h2>
                                           <div className="bg-gray-100 p-8 rounded-lg text-center">
                                             <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                               <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                               </svg>
                                             </div>
                                             <h3 className="text-lg font-semibold text-white mb-2">Twitch Livestream</h3>
                                             <p className="text-gray-300">Voer een Twitch URL in om de livestream te tonen</p>
                                           </div>
                                         </div>
                                       </div>
                                     );
                                   
                                   default:
                                     return (
                                       <div className="px-4 py-8">
                                         <div>
                                           <h2 
                                             className="text-2xl font-bold mb-4"
                                             style={{ color: tournamentConfig.primaryColor }}
                                           >
                                             {draggedComponent.name}
                                           </h2>
                                           <div className="bg-gray-50 p-4 rounded-lg">
                                             <p className="text-gray-300">{draggedComponent.description}</p>
                                           </div>
                                         </div>
                                       </div>
                                     );
                                  }
                                } else {
                                  // Als het van de preview komt, toon een eenvoudige preview
                                  return (
                                    <div className="px-4 py-8">
                                      <div>
                                        <h2 
                                          className="text-2xl font-bold mb-4"
                                          style={{ color: tournamentConfig.primaryColor }}
                                        >
                                          {draggedComponent.name}
                                        </h2>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <p className="text-gray-300">{draggedComponent.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </div>
              </div>
            </div>
    );
  }

  // Toernooi beheren view
  if (currentView === 'manage-tournament') {
    const draftTournaments = tournaments.filter(t => t.status === 'draft');
    const publishedTournaments = tournaments.filter(t => t.status === 'published');

    return (
      <div className="min-h-screen p-8 relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0.05}
            scanlineIntensity={0}
            speed={0.4}
            scanlineFrequency={0.3}
            warpAmount={0.2}
            resolutionScale={1}
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Toernooi Beheren
              </h1>
                <p className="text-lg text-gray-300">
                Beheer je toernooien en bekijk hun status
              </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-gray-600/20 backdrop-blur-md border border-gray-500/30 text-gray-300 py-2 px-4 rounded-xl font-medium hover:bg-gray-600/30 hover:border-gray-500/50 hover:text-gray-200 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-gray-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Terug naar Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-300 py-2 px-4 rounded-xl font-medium hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-200 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-red-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span>Uitloggen</span>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Drafts Sectie */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Drafts ({draftTournaments.length})</h2>
              </div>

              {draftTournaments.length === 0 ? (
                <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen drafts</h3>
                  <p className="text-gray-300 mb-4">Je hebt nog geen toernooi drafts opgeslagen.</p>
                   <button
                     onClick={() => {
                       // Reset tournament config voor nieuwe toernooi
                       setTournamentConfig({
                         name: '',
                         description: '',
                         logo: '',
                         image: '',
                         primaryColor: '#0044cc',
                         secondaryColor: '#ff6600',
                         backgroundColor: '#ffffff',
                         textColor: '#000000',
                         startDate: '',
                         endDate: '',
                         location: '',
                         maxParticipants: '',
                         entryFee: '',
                         prizePool: '',
                         twitchUrl: '',
                         chatEnabled: 'false',
                         headerBackgroundColor: '#ffffff',
                         headerTextColor: '#000000',
                         customComponents: [] as Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
                       });
                       
                       // Reset enabled components - alle componenten uitgeschakeld
                       setEnabledComponents({
                         header: false,
                         description: false,
                         tournamentDetails: false,
                         registration: false,
                         stats: false,
                         schedule: false,
                         rules: false,
                         prizes: false,
                         sponsors: false,
                         social: false,
                         contact: false,
                         livestream: false
                       });
                       
                       // Reset component order - lege lijst
                       setComponentOrder([]);
                       
                       // Reset editing state
                       setEditingTournament(null);
                       setEditingTournamentStatus(null);
                       setCurrentView('template-selection');
                     }}
                     className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                   >
                     Eerste Toernooi Aanmaken
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftTournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: tournament.primaryColor }}
                        >
                          {tournament.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Draft
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{tournament.name}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tournament.location || 'Geen locatie'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('nl-NL') : 'Geen datum'}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => handleEditTournament(tournament.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-lg"
                        >
                          Bewerken
                        </button>
                        <button 
                          onClick={() => handlePublishFromManage(tournament.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-colors shadow-lg"
                        >
                          Publiceren
                        </button>
                        <button 
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Published Sectie */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Published ({publishedTournaments.length})</h2>
              </div>

              {publishedTournaments.length === 0 ? (
                <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Geen gepubliceerde toernooien</h3>
                  <p className="text-gray-300">Publiceer je eerste toernooi om het hier te zien.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedTournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: tournament.primaryColor }}
                        >
                          {tournament.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Published
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{tournament.name}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tournament.location || 'Geen locatie'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('nl-NL') : 'Geen datum'}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a
                          href={`/${generateSlug(tournament.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-colors text-center shadow-lg"
                        >
                          Bekijk Pagina
                        </a>
                        <button 
                          onClick={() => handleEditTournament(tournament.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-lg"
                        >
                          Bewerken
                        </button>
                        <button 
                          onClick={() => handleUnpublish(tournament.id)}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-800 transition-colors shadow-lg"
                        >
                          Unpublish
                        </button>
                        <button 
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard content
  return (
    <div className="min-h-screen p-8 relative">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.06}
          scanlineIntensity={0}
          speed={0.4}
          scanlineFrequency={0.3}
          warpAmount={0.15}
          resolutionScale={1}
        />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header met logout knop */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Toernooi Dashboard
            </h1>
              <p className="text-lg text-gray-300">
              Welkom, {username}! Kies wat je wilt doen met toernooien
            </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-300 py-2 px-4 rounded-xl font-medium hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-200 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>Uitloggen</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Toernooi Aanmaken */}
          <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8 hover:shadow-xl hover:bg-gray-800/50 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Toernooi Aanmaken
              </h2>
              <p className="text-gray-300 mb-6">
                Maak een nieuw toernooi aan met alle benodigde instellingen en deelnemers.
              </p>
               <button 
                 onClick={() => {
                   // Reset tournament config voor nieuwe toernooi
                   setTournamentConfig({
                     name: '',
                     description: '',
                     logo: '',
                     image: '',
                     primaryColor: '#0044cc',
                     secondaryColor: '#ff6600',
                     backgroundColor: '#ffffff',
                     textColor: '#000000',
                     startDate: '',
                     endDate: '',
                     location: '',
                     maxParticipants: '',
                     entryFee: '',
                     prizePool: '',
                     twitchUrl: '',
                     chatEnabled: 'false',
                     headerBackgroundColor: '#ffffff',
                     headerTextColor: '#000000',
                     customComponents: [] as Array<{id: string, name: string, type: string, description: string, icon: string, category?: string}>
                   });
                   
                   // Reset enabled components - alle componenten uitgeschakeld
                   setEnabledComponents({
                     header: false,
                     description: false,
                     tournamentDetails: false,
                     registration: false,
                     stats: false,
                     schedule: false,
                     rules: false,
                     prizes: false,
                     sponsors: false,
                     social: false,
                     contact: false,
                     livestream: false
                   });
                   
                   // Reset component order - lege lijst
                   setComponentOrder([]);
                   
                   // Reset editing state
                   setEditingTournament(null);
                   setEditingTournamentStatus(null);
                   setCurrentView('template-selection');
                 }}
                 className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
               >
                 Nieuw Toernooi Aanmaken
               </button>
            </div>
          </div>

          {/* Toernooi Beheren */}
          <div className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8 hover:shadow-xl hover:bg-gray-800/50 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Toernooi Beheren
              </h2>
              <p className="text-gray-300 mb-6">
                Beheer bestaande toernooien, bekijk resultaten en pas instellingen aan.
              </p>
              <button 
                onClick={() => setCurrentView('manage-tournament')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Toernooien Beheren</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}