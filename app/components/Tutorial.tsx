'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TutorialStep {
  id: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  title?: string;
  content: string;
  highlight?: boolean;
  actionBefore?: (() => void) | string;
}

export interface TutorialConfig {
  steps: TutorialStep[];
  skipText?: string;
  nextText?: string;
  previousText?: string;
  closeText?: string;
  progressText?: string;
}

interface TutorialProps {
  config: TutorialConfig;
  isActive: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export default function Tutorial({
  config,
  isActive,
  onClose,
  onComplete,
  onStepChange,
}: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const step = config.steps[currentStep];

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!targetElement || !tooltipRef.current) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spacing = 16;

    let top = 0;
    let left = 0;
    let arrowPos: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    // Center position for welcome step
    if (step.position === 'center') {
      top = viewportHeight / 2 - tooltipRect.height / 2;
      left = viewportWidth / 2 - tooltipRect.width / 2;
      arrowPos = 'bottom';
    } else {
      // Calculate best position based on available space
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;

      const preferredPosition = step.position;

      if (preferredPosition === 'top' && spaceAbove > tooltipRect.height + spacing) {
        top = rect.top - tooltipRect.height - spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        arrowPos = 'bottom';
      } else if (preferredPosition === 'bottom' && spaceBelow > tooltipRect.height + spacing) {
        top = rect.bottom + spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        arrowPos = 'top';
      } else if (preferredPosition === 'left' && spaceLeft > tooltipRect.width + spacing) {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - spacing;
        arrowPos = 'right';
      } else if (preferredPosition === 'right' && spaceRight > tooltipRect.width + spacing) {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + spacing;
        arrowPos = 'left';
      } else {
        // Fallback: use best available space
        if (spaceBelow > spaceAbove) {
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          arrowPos = 'top';
        } else {
          top = rect.top - tooltipRect.height - spacing;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          arrowPos = 'bottom';
        }
      }

      // Ensure tooltip stays within viewport
      top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));
      left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
    }

    setTooltipPosition({ top, left });
    setArrowPosition(arrowPos);
  }, [targetElement, step.position]);

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !step) return;

    // Execute action before step if provided
    if (step.actionBefore && typeof step.actionBefore === 'function') {
      try {
        step.actionBefore();
      } catch (error) {
        console.warn('Tutorial actionBefore error:', error);
      }
      // Wait a bit for DOM to update
      setTimeout(() => {
        const element = document.querySelector(step.targetSelector) as HTMLElement;
        if (element) {
          setTargetElement(element);
        } else {
          console.warn(`Tutorial step "${step.id}": Target element not found: ${step.targetSelector}`);
          setTargetElement(null);
        }
      }, 200);
    } else {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
      } else {
        console.warn(`Tutorial step "${step.id}": Target element not found: ${step.targetSelector}`);
        setTargetElement(null);
      }
    }
  }, [isActive, step, currentStep]);

  // Calculate position when target element or step changes
  useEffect(() => {
    if (targetElement && isActive) {
      // Small delay to ensure tooltip is rendered
      setTimeout(() => {
        calculatePosition();
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(false);
    }
  }, [targetElement, isActive, calculatePosition]);

  // Define handlers first
  const handleComplete = useCallback(() => {
    setIsVisible(false);
    onComplete?.();
    onClose();
  }, [onComplete, onClose]);

  const handleNext = useCallback(() => {
    if (currentStep < config.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setIsVisible(false);
      onStepChange?.(nextStep);
    } else {
      handleComplete();
    }
  }, [currentStep, config.steps.length, onStepChange, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setIsVisible(false);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Tab' && tooltipRef.current) {
        e.preventDefault();
        tooltipRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNext, handlePrevious, onClose]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        handleNext();
      } else {
        // Swipe right - previous
        handlePrevious();
      }
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isActive || !step) return null;

  // Fallback position if target element not found
  const hasTarget = targetElement !== null;

  const progressText = config.progressText || 'Stap';
  const nextText = config.nextText || 'Volgende';
  const previousText = config.previousText || 'Vorige';
  const skipText = config.skipText || 'Sla over';
  const closeText = config.closeText || 'Sluit';

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998] transition-opacity"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Highlight */}
      {hasTarget && targetElement && step.highlight !== false && (() => {
        const rect = targetElement.getBoundingClientRect();
        
        // For preview section, account for the exact visual edges
        // The section uses absolute positioning with left-[420px] and right-[368px]
        let highlightLeft = rect.left - 4;
        let highlightWidth = rect.width + 8;
        
        if (step.id === 'preview') {
          // Use the exact left edge and calculate width from right edge
          const viewportWidth = window.innerWidth;
          const rightEdge = viewportWidth - 368; // right-[368px] means 368px from right
          const leftEdge = 420; // left-[420px] means 420px from left
          
          // Calculate exact bounds - align precisely with section edges
          // Left: 4px border offset (keep in place)
          highlightLeft = leftEdge - 4;
          // Right: calculate from right edge, also with 4px border offset, but shift 30px to the left
          const highlightRight = rightEdge + 4 - 30;
          highlightWidth = highlightRight - highlightLeft;
        }
        
        return (
          <div
            ref={highlightRef}
            className="fixed z-[9999] pointer-events-none transition-all duration-300"
            style={{
              top: rect.top - 4,
              left: highlightLeft,
              width: highlightWidth,
              height: rect.height + 8,
              boxShadow: '0 0 0 4px rgba(117, 93, 255, 0.5), 0 0 20px rgba(117, 93, 255, 0.3)',
              borderRadius: '8px',
              opacity: isVisible ? 1 : 0,
              boxSizing: 'border-box',
            }}
            aria-hidden="true"
          />
        );
      })()}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-live="polite"
        aria-label={`${progressText} ${currentStep + 1} van ${config.steps.length}`}
        className={`fixed z-[10000] bg-[#111730] border-2 border-[#755DFF] rounded-xl shadow-2xl p-5 max-w-sm transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: hasTarget ? tooltipPosition.top : '50%',
          left: hasTarget ? tooltipPosition.left : '50%',
          transform: hasTarget ? 'none' : 'translate(-50%, -50%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={-1}
      >
        {/* Arrow */}
        {step.position !== 'center' && (
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${
              arrowPosition === 'top'
                ? '-top-4 left-1/2 -translate-x-1/2 border-b-[#755DFF]'
                : arrowPosition === 'bottom'
                ? '-bottom-4 left-1/2 -translate-x-1/2 border-t-[#755DFF]'
                : arrowPosition === 'left'
                ? '-left-4 top-1/2 -translate-y-1/2 border-r-[#755DFF]'
                : '-right-4 top-1/2 -translate-y-1/2 border-l-[#755DFF]'
            }`}
          />
        )}

        {/* Progress */}
        <div className="text-xs text-white/60 mb-3 uppercase tracking-wider">
          {progressText} {currentStep + 1} van {config.steps.length}
        </div>

        {/* Title */}
        {step.title && (
          <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm text-white/90 leading-relaxed">{step.content}</p>
          {!hasTarget && (
            <p className="text-xs text-yellow-400 mt-2 italic">
              Element niet gevonden — volg deze instructie voor nu.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label={previousText}
            >
              {previousText}
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm rounded-lg bg-[#755DFF] text-white hover:bg-[#755DFF]/80 transition"
              aria-label={currentStep === config.steps.length - 1 ? closeText : nextText}
            >
              {currentStep === config.steps.length - 1 ? closeText : nextText}
            </button>
          </div>
          <button
            onClick={handleSkip}
            className="px-3 py-2 text-xs rounded-lg text-white/60 hover:text-white transition"
            aria-label={skipText}
          >
            {skipText}
          </button>
        </div>

        {/* More info link (if needed) */}
        {step.id === 'welcome' && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <a
              href="#help"
              className="text-xs text-[#755DFF] hover:text-[#755DFF]/80 transition"
              onClick={(e) => {
                e.preventDefault();
                // Could open help documentation
              }}
            >
              Meer weten →
            </a>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

