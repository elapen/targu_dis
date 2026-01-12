'use client'

import { Phone, Wifi, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const { logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

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

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Security badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>E2E</span>
          </div>

          {/* WebRTC status */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>WebRTC</span>
          </div>

          {/* Logout button */}
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Шығу</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
