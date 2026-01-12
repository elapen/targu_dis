'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network, GitCompare } from 'lucide-react'

// Динамический импорт 3D компонента (без SSR)
const NetworkDiagram3D = dynamic(
  () => import('./network-diagram-3d').then(mod => mod.NetworkDiagram3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">3D жүктелуде...</div>
      </div>
    )
  }
)

interface NetworkDiagramProps {
  isCallActive: boolean
  stats: {
    latency: number
    bandwidth: number
    packets: number
    jitter: number
  }
}

type DiagramType = 'convergent' | 'traditional' | 'comparison'

export function NetworkDiagram({ isCallActive, stats }: NetworkDiagramProps) {
  const [mounted, setMounted] = useState(false)
  const [diagramType, setDiagramType] = useState<DiagramType>('convergent')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="aspect-[4/3] bg-muted rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Network className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
            <span className="hidden xs:inline">Желі Архитектурасы</span>
            <span className="xs:hidden">Желі</span>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={diagramType === 'convergent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('convergent')}
              className="text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Конвергентті</span>
              <span className="sm:hidden">Конв.</span>
            </Button>
            <Button
              variant={diagramType === 'traditional' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('traditional')}
              className="text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Дәстүрлі</span>
              <span className="sm:hidden">Дәст.</span>
            </Button>
            <Button
              variant={diagramType === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('comparison')}
              className="px-2"
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="relative rounded-xl overflow-hidden">
          {diagramType === 'comparison' ? (
            <ComparisonView />
          ) : (
            <NetworkDiagram3D isCallActive={isCallActive} diagramType={diagramType} />
          )}
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          <StatCard label="Кідіріс" value={`${stats.latency.toFixed(1)} ms`} color="green" />
          <StatCard label="Жылдамдық" value={`${stats.bandwidth.toFixed(0)} kbps`} color="blue" />
          <StatCard label="Пакеттер" value={stats.packets.toString()} color="pink" />
          <StatCard label="Джиттер" value={`${stats.jitter.toFixed(1)} ms`} color="yellow" />
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    pink: 'text-pink-500',
    yellow: 'text-yellow-500',
  }

  return (
    <div className="bg-secondary/50 rounded-lg p-1.5 sm:p-2 text-center">
      <div className="text-[9px] sm:text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-[10px] sm:text-sm font-mono font-medium ${colorClasses[color]}`}>{value}</div>
    </div>
  )
}

function ComparisonView() {
  return (
    <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 sm:p-6">
      <h3 className="text-center text-white font-semibold mb-4 sm:mb-6 text-sm sm:text-base">
        Салыстырмалы Талдау
      </h3>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4 h-[calc(100%-3rem)]">
        {/* Дәстүрлі */}
        <div className="bg-red-500/10 rounded-xl p-2 sm:p-4 border border-red-500/30">
          <h4 className="text-red-400 font-medium text-center mb-2 sm:mb-4 text-xs sm:text-sm">Дәстүрлі</h4>
          <div className="space-y-1 sm:space-y-2">
            <div className="bg-red-500/20 rounded p-1 sm:p-2 text-center">
              <span className="text-red-300 text-[10px] sm:text-xs">PSTN</span>
            </div>
            <div className="bg-green-500/20 rounded p-1 sm:p-2 text-center">
              <span className="text-green-300 text-[10px] sm:text-xs">ISDN</span>
            </div>
            <div className="bg-blue-500/20 rounded p-1 sm:p-2 text-center">
              <span className="text-blue-300 text-[10px] sm:text-xs">LAN</span>
            </div>
          </div>
          <p className="text-red-400 text-center mt-2 sm:mt-4 text-[10px] sm:text-xs font-medium">3 желі</p>
        </div>

        {/* Стрелка */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-500 text-lg sm:text-2xl mb-1 sm:mb-2">→</div>
            <span className="text-green-400 text-[10px] sm:text-xs">Конвергенция</span>
          </div>
        </div>

        {/* Конвергентті */}
        <div className="bg-green-500/10 rounded-xl p-2 sm:p-4 border border-green-500/30">
          <h4 className="text-green-400 font-medium text-center mb-2 sm:mb-4 text-xs sm:text-sm">Конвергентті</h4>
          <div className="flex items-center justify-center h-20 sm:h-28">
            <div className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center border-2 border-purple-500/50">
              <div className="text-center">
                <span className="text-white text-[10px] sm:text-xs font-medium">IP</span>
                <br />
                <span className="text-white/70 text-[8px] sm:text-[10px]">Желісі</span>
              </div>
            </div>
          </div>
          <p className="text-green-400 text-center mt-2 sm:mt-4 text-[10px] sm:text-xs font-medium">1 желі</p>
        </div>
      </div>

      {/* Артықшылықтар */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 text-[9px] sm:text-xs">
        <div className="text-green-400">✓ Шығын -60%</div>
        <div className="text-green-400">✓ Оңай басқару</div>
        <div className="text-green-400">✓ QoS қолдау</div>
      </div>
    </div>
  )
}
