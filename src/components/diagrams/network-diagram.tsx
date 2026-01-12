'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network, GitCompare } from 'lucide-react'

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
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900/80 rounded-xl overflow-hidden">
          {diagramType === 'convergent' && (
            <ConvergentDiagram isCallActive={isCallActive} />
          )}
          {diagramType === 'traditional' && <TraditionalDiagram />}
          {diagramType === 'comparison' && <ComparisonDiagram />}
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

function ConvergentDiagram({ isCallActive }: { isCallActive: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        {/* Градиенты */}
        <linearGradient id="grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="grad-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cloud-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
        </radialGradient>
        
        {/* Свечение */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Заголовок */}
      <text x="200" y="28" textAnchor="middle" className="fill-white text-sm font-bold">
        Конвергентті IP Желісі
      </text>

      {/* Центральное облако IP сети */}
      <motion.ellipse
        cx="200" cy="145" rx="85" ry="50"
        fill="url(#cloud-grad)"
        stroke="url(#grad-main)"
        strokeWidth="2"
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Внутренний круг облака */}
      <ellipse cx="200" cy="145" rx="60" ry="35" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 200 145" to="360 200 145" dur="20s" repeatCount="indefinite" />
      </ellipse>
      
      <text x="200" y="140" textAnchor="middle" className="fill-white text-xs font-semibold">IP Желісі</text>
      <text x="200" y="155" textAnchor="middle" className="fill-white/60 text-[9px]">(Бірыңғай инфрақұрылым)</text>

      {/* Устройство A - слева */}
      <g transform="translate(55, 100)">
        {/* Тень телефона */}
        <ellipse cx="0" cy="75" rx="18" ry="5" fill="black" opacity="0.3" />
        {/* Корпус телефона */}
        <rect x="-22" y="-35" width="44" height="78" rx="8" fill="#1e1e2e" stroke="#3b82f6" strokeWidth="2" />
        {/* Экран */}
        <rect x="-18" y="-28" width="36" height="58" rx="4" fill="#0f172a">
          <animate attributeName="fill" values="#0f172a;#1e3a5f;#0f172a" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* Динамик */}
        <rect x="-8" y="-32" width="16" height="2" rx="1" fill="#374151" />
        {/* Камера */}
        <circle cx="0" cy="38" r="5" fill="#374151" />
        <circle cx="0" cy="38" r="3" fill="#1f2937" />
        {/* Подпись */}
        <text x="0" y="58" textAnchor="middle" className="fill-white text-[10px] font-medium">Құрылғы A</text>
        <text x="0" y="70" textAnchor="middle" className="fill-blue-400 text-[8px]">📱 Смартфон</text>
      </g>

      {/* Устройство B - справа */}
      <g transform="translate(345, 100)">
        <ellipse cx="0" cy="75" rx="18" ry="5" fill="black" opacity="0.3" />
        <rect x="-22" y="-35" width="44" height="78" rx="8" fill="#1e1e2e" stroke="#8b5cf6" strokeWidth="2" />
        <rect x="-18" y="-28" width="36" height="58" rx="4" fill="#0f172a">
          <animate attributeName="fill" values="#0f172a;#3b1e5f;#0f172a" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="-8" y="-32" width="16" height="2" rx="1" fill="#374151" />
        <circle cx="0" cy="38" r="5" fill="#374151" />
        <circle cx="0" cy="38" r="3" fill="#1f2937" />
        <text x="0" y="58" textAnchor="middle" className="fill-white text-[10px] font-medium">Құрылғы B</text>
        <text x="0" y="70" textAnchor="middle" className="fill-purple-400 text-[8px]">📱 Смартфон</text>
      </g>

      {/* Сервер - внизу */}
      <g transform="translate(200, 248)">
        <ellipse cx="0" cy="28" rx="30" ry="8" fill="black" opacity="0.3" />
        <rect x="-35" y="-20" width="70" height="45" rx="4" fill="#1e1e2e" stroke="#06b6d4" strokeWidth="2" />
        {/* Индикаторы */}
        <line x1="-25" y1="-8" x2="25" y2="-8" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="-25" y1="2" x2="25" y2="2" stroke="#facc15" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </line>
        <line x1="-25" y1="12" x2="25" y2="12" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite" />
        </line>
        <text x="0" y="40" textAnchor="middle" className="fill-cyan-400 text-[10px] font-medium">Signaling Server</text>
      </g>

      {/* Линии соединения к облаку */}
      <path d="M 78 115 Q 120 130 135 145" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" fill="none" opacity="0.7">
        <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="0.8s" repeatCount="indefinite" />
      </path>
      <path d="M 322 115 Q 280 130 265 145" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6,4" fill="none" opacity="0.7">
        <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="0.8s" repeatCount="indefinite" />
      </path>
      <path d="M 200 195 L 200 228" stroke="#facc15" strokeWidth="2" strokeDasharray="4,4" fill="none" opacity="0.6" />

      {/* P2P соединение (когда активно) */}
      {isCallActive && (
        <>
          {/* Линия P2P */}
          <path d="M 78 75 Q 200 30 322 75" stroke="#22c55e" strokeWidth="3" fill="none" filter="url(#glow-strong)">
            <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
          </path>
          
          {/* Анимированные пакеты */}
          <circle r="6" fill="#ef4444" filter="url(#glow)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 78 90 Q 200 50 322 90" />
          </circle>
          <circle r="6" fill="#22c55e" filter="url(#glow)">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 322 90 Q 200 50 78 90" />
          </circle>
          <circle r="5" fill="#3b82f6" filter="url(#glow)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 78 100 Q 200 140 322 100" />
          </circle>
          
          {/* P2P метка */}
          <rect x="175" y="35" width="50" height="18" rx="9" fill="#22c55e" opacity="0.9" />
          <text x="200" y="48" textAnchor="middle" className="fill-white text-[9px] font-bold">P2P</text>
        </>
      )}

      {/* Легенда */}
      <g transform="translate(20, 278)">
        <circle cx="8" cy="0" r="5" fill="#ef4444" />
        <text x="20" y="4" className="fill-white/70 text-[9px]">Видео</text>
        <circle cx="75" cy="0" r="5" fill="#22c55e" />
        <text x="87" y="4" className="fill-white/70 text-[9px]">Аудио</text>
        <circle cx="140" cy="0" r="5" fill="#3b82f6" />
        <text x="152" y="4" className="fill-white/70 text-[9px]">Деректер</text>
      </g>
      
      {/* Преимущества */}
      <g transform="translate(240, 270)">
        <text x="0" y="4" className="fill-green-400 text-[8px]">✓ Бір инфрақұрылым</text>
        <text x="80" y="4" className="fill-green-400 text-[8px]">✓ P2P байланыс</text>
      </g>
    </svg>
  )
}

function TraditionalDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>

      <text x="200" y="28" textAnchor="middle" className="fill-white text-sm font-bold">
        Дәстүрлі Бөлек Желілер
      </text>

      {/* PSTN Network */}
      <g transform="translate(70, 110)">
        <ellipse cx="0" cy="0" rx="50" ry="35" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="35" ry="22" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        <text x="0" y="5" textAnchor="middle" className="fill-red-400 text-[11px] font-bold">PSTN</text>
        <text x="0" y="55" textAnchor="middle" className="fill-white/60 text-[9px]">Телефония желісі</text>
        
        {/* Телефон */}
        <g transform="translate(0, 85)">
          <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#1e1e2e" stroke="#ef4444" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" className="fill-white text-base">📞</text>
          <text x="0" y="25" textAnchor="middle" className="fill-red-300 text-[8px]">Телефон</text>
        </g>
        
        <line x1="0" y1="35" x2="0" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
      </g>

      {/* Video Network */}
      <g transform="translate(200, 110)">
        <ellipse cx="0" cy="0" rx="50" ry="35" fill="#22c55e" opacity="0.15" stroke="#22c55e" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="35" ry="22" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        <text x="0" y="5" textAnchor="middle" className="fill-green-400 text-[11px] font-bold">ISDN</text>
        <text x="0" y="55" textAnchor="middle" className="fill-white/60 text-[9px]">Видео желісі</text>
        
        {/* Видеокамера */}
        <g transform="translate(0, 85)">
          <rect x="-20" y="-12" width="40" height="24" rx="4" fill="#1e1e2e" stroke="#22c55e" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" className="fill-white text-base">📹</text>
          <text x="0" y="25" textAnchor="middle" className="fill-green-300 text-[8px]">Видео жүйе</text>
        </g>
        
        <line x1="0" y1="35" x2="0" y2="60" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,4" />
      </g>

      {/* Data Network */}
      <g transform="translate(330, 110)">
        <ellipse cx="0" cy="0" rx="50" ry="35" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="35" ry="22" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        <text x="0" y="5" textAnchor="middle" className="fill-blue-400 text-[11px] font-bold">LAN/WAN</text>
        <text x="0" y="55" textAnchor="middle" className="fill-white/60 text-[9px]">Деректер желісі</text>
        
        {/* Компьютер */}
        <g transform="translate(0, 85)">
          <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#1e1e2e" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" className="fill-white text-base">💻</text>
          <text x="0" y="25" textAnchor="middle" className="fill-blue-300 text-[8px]">Компьютер</text>
        </g>
        
        <line x1="0" y1="35" x2="0" y2="60" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" />
      </g>

      {/* Разделители между сетями */}
      <line x1="135" y1="60" x2="135" y2="220" stroke="white" strokeWidth="1" strokeDasharray="2,4" opacity="0.2" />
      <line x1="265" y1="60" x2="265" y2="220" stroke="white" strokeWidth="1" strokeDasharray="2,4" opacity="0.2" />

      {/* Недостатки */}
      <g transform="translate(25, 255)">
        <text x="0" y="0" className="fill-red-400 text-[9px]">❌ Бөлек инфрақұрылым</text>
        <text x="0" y="14" className="fill-red-400 text-[9px]">❌ Жоғары шығындар</text>
        <text x="130" y="0" className="fill-red-400 text-[9px]">❌ Күрделі басқару</text>
        <text x="130" y="14" className="fill-red-400 text-[9px]">❌ Интеграция жоқ</text>
        <text x="260" y="0" className="fill-red-400 text-[9px]">❌ Масштабтау қиын</text>
        <text x="260" y="14" className="fill-red-400 text-[9px]">❌ 3 бөлек желі!</text>
      </g>
    </svg>
  )
}

function ComparisonDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="arrow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      <text x="200" y="28" textAnchor="middle" className="fill-white text-sm font-bold">
        Салыстырмалы Талдау
      </text>

      {/* Традиционная сторона */}
      <g transform="translate(85, 145)">
        <text x="0" y="-85" textAnchor="middle" className="fill-white text-[11px] font-semibold">Дәстүрлі</text>
        <rect x="-70" y="-70" width="140" height="160" rx="10" fill="#1e1e2e" stroke="#ef4444" strokeWidth="2" opacity="0.8" />

        <rect x="-55" y="-55" width="110" height="38" rx="6" fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="1" />
        <text x="0" y="-30" textAnchor="middle" className="fill-red-400 text-[10px] font-medium">PSTN желісі</text>

        <rect x="-55" y="-8" width="110" height="38" rx="6" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1" />
        <text x="0" y="17" textAnchor="middle" className="fill-green-400 text-[10px] font-medium">Видео желісі</text>

        <rect x="-55" y="38" width="110" height="38" rx="6" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1" />
        <text x="0" y="63" textAnchor="middle" className="fill-blue-400 text-[10px] font-medium">Деректер желісі</text>

        <text x="0" y="100" textAnchor="middle" className="fill-red-400 text-[12px] font-bold">3 бөлек желі</text>
      </g>

      {/* Стрелка конвергенции */}
      <g transform="translate(200, 145)">
        <path d="M -25 0 L 25 0 M 15 -10 L 25 0 L 15 10" stroke="url(#arrow-grad)" strokeWidth="3" fill="none">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </path>
        <text x="0" y="-20" textAnchor="middle" className="fill-green-400 text-[10px] font-semibold">
          <tspan>Конвер-</tspan>
        </text>
        <text x="0" y="-8" textAnchor="middle" className="fill-green-400 text-[10px] font-semibold">
          <tspan>генция</tspan>
        </text>
      </g>

      {/* Конвергентная сторона */}
      <g transform="translate(315, 145)">
        <text x="0" y="-85" textAnchor="middle" className="fill-white text-[11px] font-semibold">Конвергентті</text>
        <rect x="-70" y="-70" width="140" height="160" rx="10" fill="#1e1e2e" stroke="#22c55e" strokeWidth="2" opacity="0.8" />

        {/* Единое облако */}
        <ellipse cx="0" cy="5" rx="55" ry="40" fill="#6366f1" opacity="0.2" stroke="#6366f1" strokeWidth="2">
          <animate attributeName="rx" values="53;57;53" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <text x="0" y="0" textAnchor="middle" className="fill-white text-[10px] font-medium">Бірыңғай</text>
        <text x="0" y="14" textAnchor="middle" className="fill-white text-[10px] font-medium">IP желісі</text>

        {/* Три типа данных в одном */}
        <circle cx="-28" cy="55" r="14" fill="#ef4444" opacity="0.8">
          <animate attributeName="r" values="13;15;13" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x="-28" y="59" textAnchor="middle" className="fill-white text-[9px] font-bold">V</text>

        <circle cx="0" cy="55" r="14" fill="#22c55e" opacity="0.8">
          <animate attributeName="r" values="13;15;13" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <text x="0" y="59" textAnchor="middle" className="fill-white text-[9px] font-bold">A</text>

        <circle cx="28" cy="55" r="14" fill="#3b82f6" opacity="0.8">
          <animate attributeName="r" values="13;15;13" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <text x="28" y="59" textAnchor="middle" className="fill-white text-[9px] font-bold">D</text>

        <text x="0" y="100" textAnchor="middle" className="fill-green-400 text-[12px] font-bold">1 бірыңғай желі</text>
      </g>

      {/* Преимущества */}
      <g transform="translate(25, 260)">
        <text x="0" y="0" className="fill-green-400 text-[9px]">✓ Шығындарды азайту (40-60%)</text>
        <text x="0" y="14" className="fill-green-400 text-[9px]">✓ Оңай басқару</text>
        <text x="145" y="0" className="fill-green-400 text-[9px]">✓ Жоғары икемділік</text>
        <text x="145" y="14" className="fill-green-400 text-[9px]">✓ QoS қолдау</text>
        <text x="280" y="0" className="fill-green-400 text-[9px]">✓ Масштабтау оңай</text>
        <text x="280" y="14" className="fill-green-400 text-[9px]">✓ P2P мүмкіндігі</text>
      </g>
    </svg>
  )
}
