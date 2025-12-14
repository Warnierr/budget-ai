'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 py-2.5 sm:py-2">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="hidden sm:inline">📚</span>
          <div className="text-center">
            <strong>Projet Portfolio</strong>
            <span className="hidden md:inline">
              {' '}- Développé avec Next.js 14, TypeScript, Prisma & IA
            </span>
            <span className="ml-2">
              <a 
                href="https://github.com/votre-username/budget-ai" 
                className="underline hover:text-blue-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le code source →
              </a>
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Fermer la bannière"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

