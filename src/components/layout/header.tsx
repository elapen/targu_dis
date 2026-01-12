'use client'

import { Phone, Wifi } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center animate-glow">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <Wifi className="absolute -top-1 -right-1 w-4 h-4 text-green-500" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold gradient-text">
              Конвергенция
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
              Бірыңғай желі платформасы
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>WebRTC</span>
          </div>
        </div>
      </div>
    </header>
  )
}
