'use client'

import { useEffect, useState } from 'react'

interface LoadingOverlayProps {
  isVisible: boolean
  status?: string
  progress?: number // 0-100
}

export default function LoadingOverlay({ isVisible, status, progress }: LoadingOverlayProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [dots, setDots] = useState('')

  // Simuleer progress als er geen echte progress is
  useEffect(() => {
    if (!isVisible) {
      setAnimatedProgress(0)
      return
    }

    // Als er geen progress is, simuleer een langzame vooruitgang
    if (progress === undefined) {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= 90) return prev // Stop bij 90% tot echt klaar
          return Math.min(90, prev + Math.random() * 2)
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isVisible, progress])

  // Smooth update animated progress wanneer progress prop verandert
  useEffect(() => {
    if (!isVisible || progress === undefined) return
    
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        const diff = progress - prev
        if (Math.abs(diff) < 0.5) return progress
        return prev + (diff * 0.2)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isVisible, progress])

  // Animated dots
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-gray-800 bg-opacity-95 backdrop-blur-md rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{
            background: 'linear-gradient(45deg, #8B5CF6, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Website Genereren
          </h2>
          <p className="text-gray-400 text-sm">
            {status || `Claude AI is hard aan het werk${dots}`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Voortgang</span>
            <span className="text-sm font-semibold text-purple-400">{Math.round(animatedProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
              style={{ 
                width: `${animatedProgress}%`,
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-2 text-sm">
          <div className={`flex items-center space-x-2 ${animatedProgress > 10 ? 'text-green-400' : 'text-gray-500'}`}>
            <span>{animatedProgress > 10 ? '✓' : '○'}</span>
            <span>Verwerken van configuratie...</span>
          </div>
          <div className={`flex items-center space-x-2 ${animatedProgress > 30 ? 'text-green-400' : 'text-gray-500'}`}>
            <span>{animatedProgress > 30 ? '✓' : '○'}</span>
            <span>HTML genereren...</span>
          </div>
          <div className={`flex items-center space-x-2 ${animatedProgress > 50 ? 'text-green-400' : 'text-gray-500'}`}>
            <span>{animatedProgress > 50 ? '✓' : '○'}</span>
            <span>CSS styling toevoegen...</span>
          </div>
          <div className={`flex items-center space-x-2 ${animatedProgress > 70 ? 'text-green-400' : 'text-gray-500'}`}>
            <span>{animatedProgress > 70 ? '✓' : '○'}</span>
            <span>JavaScript functionaliteit...</span>
          </div>
          <div className={`flex items-center space-x-2 ${animatedProgress > 90 ? 'text-green-400' : 'text-gray-500'}`}>
            <span>{animatedProgress > 90 ? '✓' : '○'}</span>
            <span>Finaliseren...</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Dit kan 30-60 seconden duren, afhankelijk van de complexiteit
          </p>
        </div>
      </div>
    </div>
  )
}
