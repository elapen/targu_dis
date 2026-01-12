'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { DemoSection } from '@/components/sections/demo-section'
import { TheorySection } from '@/components/sections/theory-section'
import { ArchitectureSection } from '@/components/sections/architecture-section'
import { LoginScreen } from '@/components/auth/login-screen'
import { useAuth } from '@/contexts/auth-context'
import { Video, BookOpen, Layers, Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('demo')

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Жүктелуде...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Authenticated - show main app
  return (
    <main className="min-h-screen animated-gradient">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="demo" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Демонстрация</span>
              <span className="sm:hidden">Демо</span>
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Теория</span>
              <span className="sm:hidden">Теория</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Архитектура</span>
              <span className="sm:hidden">Арх.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="mt-0">
            <DemoSection />
          </TabsContent>

          <TabsContent value="theory" className="mt-0">
            <TheorySection />
          </TabsContent>

          <TabsContent value="architecture" className="mt-0">
            <ArchitectureSection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
