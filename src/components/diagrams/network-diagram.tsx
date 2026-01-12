'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network, GitCompare, ArrowLeftRight } from 'lucide-react'

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
  const [diagramType, setDiagramType] = useState<DiagramType>('convergent')

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="w-5 h-5 text-cyan-500" />
            Желі Архитектурасы
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={diagramType === 'convergent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('convergent')}
            >
              Конвергентті
            </Button>
            <Button
              variant={diagramType === 'traditional' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('traditional')}
            >
              Дәстүрлі
            </Button>
            <Button
              variant={diagramType === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDiagramType('comparison')}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative aspect-[4/3] bg-background/50 rounded-xl overflow-hidden">
          {diagramType === 'convergent' && (
            <ConvergentDiagram isCallActive={isCallActive} stats={stats} />
          )}
          {diagramType === 'traditional' && <TraditionalDiagram />}
          {diagramType === 'comparison' && <ComparisonDiagram />}
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
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
    <div className="bg-secondary/50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-sm font-mono font-medium ${colorClasses[color]}`}>{value}</div>
    </div>
  )
}

function ConvergentDiagram({ isCallActive, stats }: { isCallActive: boolean; stats: NetworkDiagramProps['stats'] }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Title */}
      <text x="200" y="25" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        Конвергентті IP Желісі
      </text>

      {/* Central IP Network Cloud */}
      <ellipse cx="200" cy="150" rx="80" ry="45" fill="url(#grad)" opacity="0.2" stroke="url(#grad)" strokeWidth="2" />
      <text x="200" y="145" textAnchor="middle" className="fill-foreground text-xs font-medium">
        IP Желісі
      </text>
      <text x="200" y="160" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (Бірыңғай инфрақұрылым)
      </text>

      {/* Device A */}
      <g transform="translate(60, 80)">
        <rect x="-25" y="-40" width="50" height="80" rx="8" className="fill-secondary stroke-blue-500" strokeWidth="2" />
        <rect x="-20" y="-32" width="40" height="55" rx="4" className="fill-background" />
        <circle cx="0" cy="30" r="6" className="fill-muted" />
        <text x="0" y="55" textAnchor="middle" className="fill-foreground text-[10px]">Құрылғы A</text>
        <text x="0" y="67" textAnchor="middle" className="fill-muted-foreground text-[8px]">📱 Смартфон</text>
      </g>

      {/* Device B */}
      <g transform="translate(340, 80)">
        <rect x="-25" y="-40" width="50" height="80" rx="8" className="fill-secondary stroke-purple-500" strokeWidth="2" />
        <rect x="-20" y="-32" width="40" height="55" rx="4" className="fill-background" />
        <circle cx="0" cy="30" r="6" className="fill-muted" />
        <text x="0" y="55" textAnchor="middle" className="fill-foreground text-[10px]">Құрылғы B</text>
        <text x="0" y="67" textAnchor="middle" className="fill-muted-foreground text-[8px]">📱 Смартфон</text>
      </g>

      {/* Server */}
      <g transform="translate(200, 250)">
        <rect x="-35" y="-25" width="70" height="50" rx="4" className="fill-secondary stroke-cyan-500" strokeWidth="2" />
        <line x1="-25" y1="-12" x2="25" y2="-12" stroke="#4ade80" strokeWidth="2" />
        <line x1="-25" y1="0" x2="25" y2="0" stroke="#facc15" strokeWidth="2" />
        <line x1="-25" y1="12" x2="25" y2="12" stroke="#f87171" strokeWidth="2" />
        <text x="0" y="40" textAnchor="middle" className="fill-foreground text-[10px]">Signaling Server</text>
      </g>

      {/* Connection Lines */}
      <path d="M 60 120 Q 120 140 140 150" className="stroke-blue-500" strokeWidth="2" strokeDasharray="4,4" fill="none">
        <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M 340 120 Q 280 140 260 150" className="stroke-purple-500" strokeWidth="2" strokeDasharray="4,4" fill="none">
        <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M 200 195 L 200 225" className="stroke-yellow-500" strokeWidth="2" strokeDasharray="3,3" fill="none" />

      {/* P2P Connection (when active) */}
      {isCallActive && (
        <path d="M 85 60 Q 200 20 315 60" className="stroke-green-500" strokeWidth="3" fill="none" filter="url(#glow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
        </path>
      )}

      {/* Animated Packets */}
      {isCallActive && (
        <>
          <circle r="5" fill="#ef4444">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 60 120 Q 200 80 340 120" />
          </circle>
          <circle r="5" fill="#22c55e">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 340 120 Q 200 80 60 120" />
          </circle>
          <circle r="5" fill="#3b82f6">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 60 120 Q 120 140 200 150 Q 280 140 340 120" />
          </circle>
        </>
      )}

      {/* Legend */}
      <g transform="translate(20, 280)">
        <circle cx="8" cy="0" r="5" fill="#ef4444" />
        <text x="20" y="4" className="fill-muted-foreground text-[9px]">Видео</text>
        <circle cx="68" cy="0" r="5" fill="#22c55e" />
        <text x="80" y="4" className="fill-muted-foreground text-[9px]">Аудио</text>
        <circle cx="128" cy="0" r="5" fill="#3b82f6" />
        <text x="140" y="4" className="fill-muted-foreground text-[9px]">Деректер</text>
      </g>
    </svg>
  )
}

function TraditionalDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <text x="200" y="25" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        Дәстүрлі Бөлек Желілер
      </text>

      {/* PSTN Network */}
      <g transform="translate(70, 100)">
        <ellipse cx="0" cy="0" rx="50" ry="30" fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-red-500 text-[10px] font-medium">PSTN</text>
        <text x="0" y="50" textAnchor="middle" className="fill-muted-foreground text-[9px]">Телефония</text>
      </g>

      {/* Video Network */}
      <g transform="translate(200, 100)">
        <ellipse cx="0" cy="0" rx="50" ry="30" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-green-500 text-[10px] font-medium">ISDN</text>
        <text x="0" y="50" textAnchor="middle" className="fill-muted-foreground text-[9px]">Видеоконференция</text>
      </g>

      {/* Data Network */}
      <g transform="translate(330, 100)">
        <ellipse cx="0" cy="0" rx="50" ry="30" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-blue-500 text-[10px] font-medium">LAN/WAN</text>
        <text x="0" y="50" textAnchor="middle" className="fill-muted-foreground text-[9px]">Деректер</text>
      </g>

      {/* Devices */}
      <g transform="translate(70, 200)">
        <rect x="-20" y="-15" width="40" height="30" rx="4" className="fill-secondary stroke-red-500" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-foreground text-base">📞</text>
        <text x="0" y="30" textAnchor="middle" className="fill-muted-foreground text-[9px]">Телефон</text>
      </g>

      <g transform="translate(200, 200)">
        <rect x="-20" y="-15" width="40" height="30" rx="4" className="fill-secondary stroke-green-500" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-foreground text-base">📹</text>
        <text x="0" y="30" textAnchor="middle" className="fill-muted-foreground text-[9px]">Видео жүйе</text>
      </g>

      <g transform="translate(330, 200)">
        <rect x="-20" y="-15" width="40" height="30" rx="4" className="fill-secondary stroke-blue-500" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" className="fill-foreground text-base">💻</text>
        <text x="0" y="30" textAnchor="middle" className="fill-muted-foreground text-[9px]">Компьютер</text>
      </g>

      {/* Connection lines */}
      <line x1="70" y1="130" x2="70" y2="185" className="stroke-red-500" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="200" y1="130" x2="200" y2="185" className="stroke-green-500" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="330" y1="130" x2="330" y2="185" className="stroke-blue-500" strokeWidth="2" strokeDasharray="4,4" />

      {/* Disadvantages */}
      <g transform="translate(30, 260)">
        <text x="0" y="0" className="fill-red-400 text-[9px]">❌ Бөлек инфрақұрылым</text>
        <text x="0" y="14" className="fill-red-400 text-[9px]">❌ Жоғары шығындар</text>
        <text x="140" y="0" className="fill-red-400 text-[9px]">❌ Күрделі басқару</text>
        <text x="140" y="14" className="fill-red-400 text-[9px]">❌ Интеграция жоқ</text>
        <text x="270" y="0" className="fill-red-400 text-[9px]">❌ Масштабтау қиын</text>
        <text x="270" y="14" className="fill-red-400 text-[9px]">❌ Ескі технологиялар</text>
      </g>
    </svg>
  )
}

function ComparisonDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <text x="200" y="25" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        Салыстырмалы Талдау
      </text>

      {/* Traditional side */}
      <g transform="translate(100, 140)">
        <text x="0" y="-70" textAnchor="middle" className="fill-foreground text-[11px] font-medium">Дәстүрлі</text>
        <rect x="-70" y="-55" width="140" height="150" rx="8" className="fill-secondary/50 stroke-border" />

        <rect x="-55" y="-40" width="110" height="30" rx="4" fill="#ef4444" opacity="0.3" />
        <text x="0" y="-20" textAnchor="middle" className="fill-red-400 text-[10px]">PSTN желісі</text>

        <rect x="-55" y="0" width="110" height="30" rx="4" fill="#22c55e" opacity="0.3" />
        <text x="0" y="20" textAnchor="middle" className="fill-green-400 text-[10px]">Видео желісі</text>

        <rect x="-55" y="40" width="110" height="30" rx="4" fill="#3b82f6" opacity="0.3" />
        <text x="0" y="60" textAnchor="middle" className="fill-blue-400 text-[10px]">Деректер желісі</text>

        <text x="0" y="85" textAnchor="middle" className="fill-red-400 text-[11px] font-medium">3 бөлек желі</text>
      </g>

      {/* Arrow */}
      <g transform="translate(200, 140)">
        <path d="M -15 0 L 15 0 M 5 -8 L 15 0 L 5 8" className="stroke-green-500" strokeWidth="2" fill="none" />
        <text x="0" y="-15" textAnchor="middle" className="fill-green-500 text-[9px]">Конвергенция</text>
      </g>

      {/* Convergent side */}
      <g transform="translate(300, 140)">
        <text x="0" y="-70" textAnchor="middle" className="fill-foreground text-[11px] font-medium">Конвергентті</text>
        <rect x="-70" y="-55" width="140" height="150" rx="8" className="fill-secondary/50 stroke-green-500" />

        <ellipse cx="0" cy="10" rx="50" ry="35" fill="url(#grad)" opacity="0.3" />
        <text x="0" y="5" textAnchor="middle" className="fill-foreground text-[10px]">Бірыңғай</text>
        <text x="0" y="18" textAnchor="middle" className="fill-foreground text-[10px]">IP желісі</text>

        <circle cx="-25" cy="55" r="12" fill="#ef4444" opacity="0.7" />
        <text x="-25" y="59" textAnchor="middle" className="fill-white text-[9px]">V</text>

        <circle cx="0" cy="55" r="12" fill="#22c55e" opacity="0.7" />
        <text x="0" y="59" textAnchor="middle" className="fill-white text-[9px]">A</text>

        <circle cx="25" cy="55" r="12" fill="#3b82f6" opacity="0.7" />
        <text x="25" y="59" textAnchor="middle" className="fill-white text-[9px]">D</text>

        <text x="0" y="85" textAnchor="middle" className="fill-green-400 text-[11px] font-medium">1 бірыңғай желі</text>
      </g>

      {/* Benefits */}
      <g transform="translate(30, 260)">
        <text x="0" y="0" className="fill-green-400 text-[9px]">✓ Шығындарды азайту (40-60%)</text>
        <text x="0" y="14" className="fill-green-400 text-[9px]">✓ Оңай басқару</text>
        <text x="140" y="0" className="fill-green-400 text-[9px]">✓ Жоғары икемділік</text>
        <text x="140" y="14" className="fill-green-400 text-[9px]">✓ Жаңа мүмкіндіктер</text>
        <text x="280" y="0" className="fill-green-400 text-[9px]">✓ QoS қолдау</text>
        <text x="280" y="14" className="fill-green-400 text-[9px]">✓ Масштабтау оңай</text>
      </g>
    </svg>
  )
}
