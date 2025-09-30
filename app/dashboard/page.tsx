'use client';

import { useState, useEffect } from 'react';
import TemplateSelection from './template-selection';
import { getTemplateById, getEnabledComponentsFromTemplate } from './templates';

// Type definities
interface GradientStop {
  position: number;
  color: string;
  id: number;
}
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'create-tournament', 'manage-tournament', 'template-selection'
  const [editingTournament, setEditingTournament] = useState<string | null>(null);
  const [editingTournamentStatus, setEditingTournamentStatus] = useState<'draft' | 'published' | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
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
    backgroundType: 'solid',
    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6',
    gradientDirection: 'to-r',
    gradientType: 'linear',
    gradientStops: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    entryFee: '',
    prizePool: '',
    twitchUrl: '',
    chatEnabled: 'false'
  });

  // Componenten configuratie - livestream standaard ingeschakeld
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
    livestream: true
  });

  const [componentOrder, setComponentOrder] = useState<string[]>(['livestream']);

  // Tab state voor linker paneel
  const [leftPanelTab, setLeftPanelTab] = useState<'edit' | 'add'>('edit');
  
  // Viewport state voor live preview
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [animationDuration, setAnimationDuration] = useState(300);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'scale' | 'width' | 'complete'>('complete');
  
  // State voor component dropdowns
  const [expandedComponents, setExpandedComponents] = useState<{[key: string]: boolean}>({});
  
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
    status: 'draft' | 'published';
    createdAt: string;
  }>>([]);

  // Laad toernooien uit localStorage bij component mount
  useEffect(() => {
    const savedTournaments = localStorage.getItem('tournaments');
    if (savedTournaments) {
      try {
        const parsedTournaments = JSON.parse(savedTournaments);
        setTournaments(parsedTournaments);
      } catch (error) {
        console.error('Error loading tournaments from localStorage:', error);
      }
    }
  }, []);

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

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    // Haal template configuratie op
    const template = getTemplateById(templateId);
    if (!template) return;
    
    // Reset tournament config met template defaults
    setTournamentConfig({
      name: '',
      description: '',
      logo: '',
      image: '',
      primaryColor: template.defaultConfig?.primaryColor || '#0044cc',
      secondaryColor: template.defaultConfig?.secondaryColor || '#ff6600',
      backgroundColor: template.defaultConfig?.backgroundColor || '#ffffff',
      textColor: '#000000',
      backgroundType: 'solid',
      gradientStart: '#3b82f6',
      gradientEnd: '#8b5cf6',
      gradientDirection: 'to-r',
      gradientType: 'linear',
      gradientStops: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: '',
      entryFee: '',
      prizePool: '',
      twitchUrl: '',
      chatEnabled: 'false'
    });
    
    // Zet enabled components op basis van template
    const templateComponents = getEnabledComponentsFromTemplate(templateId);
    setEnabledComponents(templateComponents);
    
    // Zet component order
    setComponentOrder(template.components);
    
    // Ga naar editor
    setCurrentView('create-tournament');
  };

  const handleConfigChange = (field: string, value: string) => {
    setTournamentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = () => {
    if (!tournamentConfig.name.trim()) {
      alert('Voer eerst een toernooi naam in!');
      return;
    }

    let updatedTournaments;

    if (editingTournament) {
      // Bewerken van bestaand toernooi
      updatedTournaments = tournaments.map(t => 
        t.id === editingTournament 
          ? {
              ...t,
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
              status: 'draft' as const
            }
          : t
      );
      alert('Toernooi bijgewerkt!');
    } else {
      // Nieuw toernooi aanmaken
      const newTournament = {
        id: Date.now().toString(),
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
        status: 'draft' as const,
        createdAt: new Date().toISOString()
      };

      updatedTournaments = [...tournaments, newTournament];
      alert('Draft opgeslagen!');
    }
    
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    setCurrentView('manage-tournament');
    setEditingTournament(null);
  };

  const handlePublish = () => {
    if (!tournamentConfig.name.trim()) {
      alert('Voer eerst een toernooi naam in!');
      return;
    }

    let updatedTournaments;

    if (editingTournament) {
      // Bewerken van bestaand toernooi en publiceren
      updatedTournaments = tournaments.map(t => 
        t.id === editingTournament 
          ? {
              ...t,
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
              status: 'published' as const
            }
          : t
      );
      alert('Toernooi gepubliceerd!');
    } else {
      // Nieuw toernooi aanmaken en publiceren
      const newTournament = {
        id: Date.now().toString(),
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
        status: 'published' as const,
        createdAt: new Date().toISOString()
      };

      updatedTournaments = [...tournaments, newTournament];
      alert('Toernooi gepubliceerd!');
    }
    
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    setCurrentView('manage-tournament');
    setEditingTournament(null);
  };

  const handleDeleteTournament = (tournamentId: string) => {
    if (confirm('Weet je zeker dat je dit toernooi wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
      setTournaments(updatedTournaments);
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      alert('Toernooi verwijderd!');
    }
  };

  const handlePublishFromManage = (tournamentId: string) => {
    const updatedTournaments = tournaments.map(t => 
      t.id === tournamentId 
        ? { ...t, status: 'published' as const }
        : t
    );
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    alert('Toernooi gepubliceerd!');
  };

  const handleUnpublish = (tournamentId: string) => {
    const updatedTournaments = tournaments.map(t => 
      t.id === tournamentId 
        ? { ...t, status: 'draft' as const }
        : t
    );
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    alert('Toernooi unpublished!');
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


  // const moveComponent = (fromIndex: number, toIndex: number) => {
  //   const newOrder = [...componentOrder];
  //   const [movedComponent] = newOrder.splice(fromIndex, 1);
  //   newOrder.splice(toIndex, 0, movedComponent);
  //   setComponentOrder(newOrder);
  // };

  // Drag & Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Sla de component data op (alleen als component bestaat)
    const component = allComponents[active.id as keyof typeof allComponents];
    if (component) {
      setDraggedComponent(component);
      // Check of het van de library komt (niet in componentOrder)
      setIsDraggingFromLibrary(!componentOrder.includes(active.id as string));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
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
   const allComponents: Record<string, {id: string, name: string, description: string, icon: string, category?: string}> = {
     livestream: {
       id: 'livestream',
       name: 'Livestream',
       description: 'Twitch livestream embed met chat',
       icon: '📺',
       category: 'Interactie'
     }
   };

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
      backgroundType: 'solid',
      gradientStart: '#3b82f6',
      gradientEnd: '#8b5cf6',
      gradientDirection: 'to-r',
      gradientType: 'linear',
      gradientStops: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: '',
      entryFee: '',
      prizePool: '',
      twitchUrl: '',
      chatEnabled: 'false'
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
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      setTournamentConfig({
        name: tournament.name,
        description: tournament.description,
        logo: '',
        image: '',
        primaryColor: tournament.primaryColor,
        secondaryColor: tournament.secondaryColor,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        backgroundType: 'solid',
        gradientStart: '#3b82f6',
        gradientEnd: '#8b5cf6',
        gradientDirection: 'to-r',
        gradientType: 'linear',
        gradientStops: '',
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        location: tournament.location,
        maxParticipants: tournament.maxParticipants,
        entryFee: tournament.entryFee,
        prizePool: tournament.prizePool,
        twitchUrl: '',
        chatEnabled: 'false'
      });
      setEditingTournament(tournamentId);
      setEditingTournamentStatus(tournament.status);
      setCurrentView('create-tournament');
    }
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600">
                Log in om toegang te krijgen tot het toernooi dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Gebruikersnaam
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-600"
                  placeholder="Voer gebruikersnaam in"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-600"
                  placeholder="Voer wachtwoord in"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-600 text-sm text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Inloggen
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p>Gebruikersnaam: admin</p>
              <p>Wachtwoord: admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Toernooi aanmaken view
  if (currentView === 'create-tournament') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {editingTournament ? 'Toernooi Bewerken' : 'Toernooi Aanmaken'}
              </h1>
              <p className="text-lg text-gray-600">
                {editingTournament ? 'Bewerk je toernooi en bekijk een live preview' : 'Configureer je toernooi en bekijk een live preview'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('manage-tournament')}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Terug naar Toernooien
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Uitloggen
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Linker paneel - Configuratie */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Toernooi Manager</h2>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setLeftPanelTab('edit')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        leftPanelTab === 'edit'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Bewerk
                    </button>
                    <button
                      onClick={() => setLeftPanelTab('add')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        leftPanelTab === 'add'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Toevoeg
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {leftPanelTab === 'edit' ? (
                    <>
                      {/* Kleuren */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kleuren</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Achtergrond Type
                            </label>
                            <div className="flex space-x-2 mb-3">
                              <button
                                onClick={() => handleConfigChange('backgroundType', 'solid')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  tournamentConfig.backgroundType === 'solid' || !tournamentConfig.backgroundType
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                Effen Kleur
                              </button>
                              <button
                                onClick={() => {
                                  handleConfigChange('backgroundType', 'gradient');
                                  if (!tournamentConfig.gradientDirection) {
                                    handleConfigChange('gradientDirection', 'to right');
                                  }
                                  if (!tournamentConfig.gradientType) {
                                    handleConfigChange('gradientType', 'linear');
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  tournamentConfig.backgroundType === 'gradient'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                Gradient
                              </button>
                            </div>
                          </div>

                          {(tournamentConfig.backgroundType === 'solid' || !tournamentConfig.backgroundType) && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Achtergrond Kleur
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={tournamentConfig.backgroundColor}
                                  onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={tournamentConfig.backgroundColor}
                                  onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-600"
                                />
                              </div>
                            </div>
                          )}

                          {tournamentConfig.backgroundType === 'gradient' && (
                            <div className="space-y-4">
                              {/* Gradient Type & Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={tournamentConfig.gradientType || 'linear'}
                                    onChange={(e) => handleConfigChange('gradientType', e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                  >
                                    <option value="linear">Linear</option>
                                    <option value="radial">Radial</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const current = tournamentConfig.gradientDirection || 'to-r';
                                      const reversed = current.replace('to-', 'to-').replace('r', 'l').replace('l', 'r').replace('b', 't').replace('t', 'b');
                                      handleConfigChange('gradientDirection', reversed);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Omkeren"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const current = tournamentConfig.gradientDirection || 'to-r';
                                      const angle = current === 'to-r' ? '45deg' : current === 'to-b' ? '135deg' : current === 'to-l' ? '225deg' : '315deg';
                                      handleConfigChange('gradientDirection', angle);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Roteren"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Gradient Preview Bar */}
                              <div className="relative">
                                <div 
                                  className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
                                  style={{
                                    background: tournamentConfig.gradientType === 'radial'
                                      ? `radial-gradient(circle, ${tournamentConfig.gradientStart || '#3b82f6'}, ${tournamentConfig.gradientEnd || '#8b5cf6'})`
                                      : `linear-gradient(${tournamentConfig.gradientDirection || 'to right'}, ${tournamentConfig.gradientStart || '#3b82f6'}, ${tournamentConfig.gradientEnd || '#8b5cf6'})`
                                  }}
                                  onClick={(e) => {
                                    // const rect = e.currentTarget.getBoundingClientRect();
                                    // const x = e.clientX - rect.left;
                                    // const percentage = Math.round((x / rect.width) * 100);
                                    // Hier zou je een nieuwe color stop kunnen toevoegen
                                  }}
                                />
                              </div>

                              {/* Color Stops */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-medium text-gray-700">Stops</label>
                                  <button
                                    onClick={() => {
                                      // Voeg nieuwe color stop toe
                                      const newStop = {
                                        position: 50,
                                        color: '#ffffff',
                                        id: Date.now()
                                      };
                                      const currentStops: GradientStop[] = tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) : [
                                        { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                        { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                      ];
                                      const updatedStops = [...currentStops, newStop].sort((a: GradientStop, b: GradientStop) => a.position - b.position);
                                      handleConfigChange('gradientStops', JSON.stringify(updatedStops));
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {(tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) as GradientStop[] : [
                                    { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                    { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                  ]).map((stop: GradientStop, index: number) => (
                                    <div key={stop.id || index} className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: stop.color }} />
                                      <input
                                        type="text"
                                        value={stop.position}
                                        onChange={(e) => {
                                          const newPosition = parseInt(e.target.value) || 0;
                                          const currentStops: GradientStop[] = tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) : [
                                            { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                            { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                          ];
                                          const updatedStops = currentStops.map((s: GradientStop) => 
                                            s.id === stop.id ? { ...s, position: newPosition } : s
                                          ).sort((a: GradientStop, b: GradientStop) => a.position - b.position);
                                          handleConfigChange('gradientStops', JSON.stringify(updatedStops));
                                        }}
                                        className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                                      />
                                      <span className="text-xs text-gray-500">%</span>
                                      <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => {
                                          const currentStops: GradientStop[] = tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) : [
                                            { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                            { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                          ];
                                          const updatedStops = currentStops.map((s: GradientStop) => 
                                            s.id === stop.id ? { ...s, color: e.target.value } : s
                                          );
                                          handleConfigChange('gradientStops', JSON.stringify(updatedStops));
                                        }}
                                        className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={stop.color}
                                        onChange={(e) => {
                                          const currentStops: GradientStop[] = tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) : [
                                            { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                            { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                          ];
                                          const updatedStops = currentStops.map((s: GradientStop) => 
                                            s.id === stop.id ? { ...s, color: e.target.value } : s
                                          );
                                          handleConfigChange('gradientStops', JSON.stringify(updatedStops));
                                        }}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                                      />
                                      <span className="text-xs text-gray-500">100%</span>
                                      <button
                                        onClick={() => {
                                          const currentStops: GradientStop[] = tournamentConfig.gradientStops ? JSON.parse(tournamentConfig.gradientStops) : [
                                            { position: 0, color: tournamentConfig.gradientStart || '#3b82f6', id: 1 },
                                            { position: 100, color: tournamentConfig.gradientEnd || '#8b5cf6', id: 2 }
                                          ];
                                          if (currentStops.length > 2) {
                                            const updatedStops = currentStops.filter((s: GradientStop) => s.id !== stop.id);
                                            handleConfigChange('gradientStops', JSON.stringify(updatedStops));
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        disabled={!tournamentConfig.gradientStops || JSON.parse(tournamentConfig.gradientStops).length <= 2}
                                      >
                                        −
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Gradient Direction */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Richting
                                </label>
                                <select
                                  value={tournamentConfig.gradientDirection || 'to-r'}
                                  onChange={(e) => handleConfigChange('gradientDirection', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                >
                                  <option value="to-r">Links naar Rechts</option>
                                  <option value="to-l">Rechts naar Links</option>
                                  <option value="to-b">Boven naar Beneden</option>
                                  <option value="to-t">Beneden naar Boven</option>
                                  <option value="to-br">Linksboven naar Rechtsbeneden</option>
                                  <option value="to-tl">Rechtsbeneden naar Linksboven</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                       {/* Ingeschakelde Componenten */}
                       <div className="mb-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Bewerk Componenten</h3>
                         <p className="text-sm text-gray-600 mb-4">Configureer je huidige componenten</p>
                         
                         <div className="space-y-4">
                           {componentOrder.map((componentId) => {
                             const component = allComponents[componentId as keyof typeof allComponents];
                             if (!component) return null;
                             const isExpanded = expandedComponents[component.id];
                             return (
                               <div key={component.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                 {/* Component Header */}
                                 <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                   <div className="flex items-center justify-between">
                                     <button
                                       onClick={() => toggleComponentDropdown(component.id)}
                                       className="flex items-center gap-3 flex-1 text-left hover:bg-gray-100 rounded-md p-2 -m-2 transition-colors"
                                     >
                                       <span className="text-lg">{component.icon}</span>
                                       <div>
                                         <div className="font-medium text-gray-900">{component.name}</div>
                                         <div className="text-sm text-gray-500">{component.description}</div>
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
                                             : 'bg-gray-300'
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
                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-600"
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
                    </>
                  ) : (
                     /* Toevoeg Tab - Alle beschikbare componenten met Drag & Drop */
                     <div>
                       <h3 className="text-lg font-semibold text-gray-800 mb-4">Component Bibliotheek</h3>
                       <p className="text-sm text-gray-600 mb-6">Sleep componenten naar de preview om ze toe te voegen of beheer ze hier</p>
                       
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
                                           <div className="font-medium text-gray-900">{component.name}</div>
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
                  )}
                </div>

                {/* Actie knoppen */}
                <div className="p-6 border-t border-gray-200">
                  <div className="space-y-3">
                    {(!editingTournament || editingTournamentStatus === 'draft') && (
                      <button
                        onClick={handleSaveDraft}
                        className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
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
                        className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={handlePublish}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {editingTournament ? (editingTournamentStatus === 'published' ? 'Update & Publish' : 'Publish') : 'Publish'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

                  {/* Rechter paneel - Live Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg p-6 h-[80vh] flex flex-col">
                      {/* Preview Header met Viewport Controls */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
                        
                        {/* Viewport Controls */}
                        <div className="flex items-center gap-3">
                          {/* Viewport Indicator */}
                          <div className="text-sm text-gray-500 font-medium">
                            {previewViewport === 'desktop' && 'Desktop (1920px)'}
                            {previewViewport === 'tablet' && 'Tablet (768px)'}
                            {previewViewport === 'mobile' && 'Mobile (375px)'}
                          </div>
                          
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => handleViewportChange('desktop')}
                            className={`p-2 rounded-md transition-colors ${
                              previewViewport === 'desktop'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
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
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
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
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
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
                                  background: tournamentConfig.backgroundType === 'gradient'
                                    ? (() => {
                                      if (tournamentConfig.gradientStops) {
                                      const stops = JSON.parse(tournamentConfig.gradientStops) as Array<{position: number, color: string, id: number}>;
                                      const colorStops = stops.map((stop: {position: number, color: string, id: number}) => `${stop.color} ${stop.position}%`).join(', ');
                                        return tournamentConfig.gradientType === 'radial'
                                          ? `radial-gradient(circle, ${colorStops})`
                                          : `linear-gradient(${tournamentConfig.gradientDirection || 'to right'}, ${colorStops})`;
                                      }
                                      return tournamentConfig.gradientType === 'radial'
                                        ? `radial-gradient(circle, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`
                                        : `linear-gradient(${tournamentConfig.gradientDirection || 'to right'}, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`;
                                    })()
                                    : tournamentConfig.backgroundColor,
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
                                  background: tournamentConfig.backgroundType === 'gradient'
                                    ? (() => {
                                        if (tournamentConfig.gradientStops) {
                                      const stops = JSON.parse(tournamentConfig.gradientStops) as Array<{position: number, color: string, id: number}>;
                                      const colorStops = stops.map((stop: {position: number, color: string, id: number}) => `${stop.color} ${stop.position}%`).join(', ');
                                        return tournamentConfig.gradientType === 'radial'
                                          ? `radial-gradient(circle, ${colorStops})`
                                          : `linear-gradient(${tournamentConfig.gradientDirection || 'to right'}, ${colorStops})`;
                                        }
                                        return tournamentConfig.gradientType === 'radial'
                                          ? `radial-gradient(circle, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`
                                          : `linear-gradient(${tournamentConfig.gradientDirection}, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`;
                                      })()
                                    : tournamentConfig.backgroundColor,
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
                                            case 'livestream':
                                              return (
                                                <div 
                                                  className="px-4 py-8"
                                                  style={{
                                                    background: tournamentConfig.backgroundType === 'gradient'
                                                      ? (() => {
                                                          if (tournamentConfig.gradientStops) {
                                      const stops = JSON.parse(tournamentConfig.gradientStops) as Array<{position: number, color: string, id: number}>;
                                      const colorStops = stops.map((stop: {position: number, color: string, id: number}) => `${stop.color} ${stop.position}%`).join(', ');
                                        return tournamentConfig.gradientType === 'radial'
                                          ? `radial-gradient(circle, ${colorStops})`
                                          : `linear-gradient(${tournamentConfig.gradientDirection || 'to right'}, ${colorStops})`;
                                                          }
                                                          return tournamentConfig.gradientType === 'radial'
                                                            ? `radial-gradient(circle, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`
                                                            : `linear-gradient(${tournamentConfig.gradientDirection}, ${tournamentConfig.gradientStart}, ${tournamentConfig.gradientEnd})`;
                                                        })()
                                                      : tournamentConfig.backgroundColor,
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
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Twitch Livestream</h3>
                                                        <p className="text-gray-600">Voer een Twitch URL in om de livestream te tonen</p>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            default:
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
                             <div className="bg-white border border-gray-200 rounded-lg shadow-lg opacity-90">
                               {/* Render het echte component preview */}
                               {(() => {
                                 // Als het van de library komt, toon het echte component
                                 if (isDraggingFromLibrary && draggedComponent.id) {
                                   switch (draggedComponent.id) {
                                  
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
                                              <h3 className="font-semibold text-gray-900 mb-2">Locatie</h3>
                                              <p className="text-gray-600">{tournamentConfig.location || 'Niet opgegeven'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                              <h3 className="font-semibold text-gray-900 mb-2">Max. Deelnemers</h3>
                                              <p className="text-gray-600">{tournamentConfig.maxParticipants || 'Onbeperkt'}</p>
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
                                              className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold"
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
                                             <h3 className="text-lg font-semibold text-gray-900 mb-2">Twitch Livestream</h3>
                                             <p className="text-gray-600">Voer een Twitch URL in om de livestream te tonen</p>
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
                                             <p className="text-gray-600">{draggedComponent.description}</p>
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
                                          <p className="text-gray-600">{draggedComponent.description}</p>
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
      </div>
    );
  }

  // Template selectie view
  if (currentView === 'template-selection') {
    return <TemplateSelection onSelectTemplate={handleTemplateSelection} />;
  }

  // Toernooi beheren view
  if (currentView === 'manage-tournament') {
    const draftTournaments = tournaments.filter(t => t.status === 'draft');
    const publishedTournaments = tournaments.filter(t => t.status === 'published');

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Toernooi Beheren
              </h1>
              <p className="text-lg text-gray-600">
                Beheer je toernooien en bekijk hun status
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Terug naar Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Uitloggen
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Drafts Sectie */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Drafts ({draftTournaments.length})</h2>
              </div>

              {draftTournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen drafts</h3>
                  <p className="text-gray-600 mb-4">Je hebt nog geen toernooi drafts opgeslagen.</p>
                   <button
                     onClick={() => {
                       setEditingTournament(null);
                       setEditingTournamentStatus(null);
                       setSelectedTemplateId(null);
                       setCurrentView('template-selection');
                     }}
                     className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                   >
                     Eerste Toernooi Aanmaken
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftTournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: tournament.primaryColor }}
                        >
                          {tournament.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Draft
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
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
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Bewerken
                        </button>
                        <button 
                          onClick={() => handlePublishFromManage(tournament.id)}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Publiceren
                        </button>
                        <button 
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Published ({publishedTournaments.length})</h2>
              </div>

              {publishedTournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen gepubliceerde toernooien</h3>
                  <p className="text-gray-600">Publiceer je eerste toernooi om het hier te zien.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedTournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: tournament.primaryColor }}
                        >
                          {tournament.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Published
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
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
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                        >
                          Bekijk Pagina
                        </a>
                        <button 
                          onClick={() => handleEditTournament(tournament.id)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Bewerken
                        </button>
                        <button 
                          onClick={() => handleUnpublish(tournament.id)}
                          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                          Unpublish
                        </button>
                        <button 
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header met logout knop */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Toernooi Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welkom, {username}! Kies wat je wilt doen met toernooien
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Uitloggen
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Toernooi Aanmaken */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Toernooi Aanmaken
              </h2>
              <p className="text-gray-600 mb-6">
                Maak een nieuw toernooi aan met alle benodigde instellingen en deelnemers.
              </p>
               <button 
                 onClick={() => {
                   // Reset editing state
                   setEditingTournament(null);
                   setEditingTournamentStatus(null);
                   setSelectedTemplateId(null);
                   setCurrentView('template-selection');
                 }}
                 className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
               >
                 Nieuw Toernooi Aanmaken
               </button>
            </div>
          </div>

          {/* Toernooi Beheren */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Toernooi Beheren
              </h2>
              <p className="text-gray-600 mb-6">
                Beheer bestaande toernooien, bekijk resultaten en pas instellingen aan.
              </p>
              <button 
                onClick={() => setCurrentView('manage-tournament')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Toernooien Beheren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}