'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface DataFlowVisualizationProps {
  stats: {
    videoRate: number
    audioRate: number
    dataRate: number
  }
  isActive: boolean
}

export function DataFlowVisualization({ stats, isActive }: DataFlowVisualizationProps) {
  const lanes = [
    {
      label: 'Видео',
      value: stats.videoRate,
      color: 'bg-red-500',
      textColor: 'text-red-500',
    },
    {
      label: 'Аудио',
      value: stats.audioRate,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      label: 'Деректер',
      value: stats.dataRate,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
  ]

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-4 h-4 text-purple-500" />
          Нақты уақыттағы деректер ағыны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lanes.map((lane) => (
          <div key={lane.label} className="flex items-center gap-3">
            <span className={`w-16 text-sm font-medium ${lane.textColor}`}>
              {lane.label}
            </span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative">
              {isActive && (
                <>
                  <div
                    className={`flow-particle ${lane.color}`}
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className={`flow-particle ${lane.color}`}
                    style={{ animationDelay: '0.7s' }}
                  />
                  <div
                    className={`flow-particle ${lane.color}`}
                    style={{ animationDelay: '1.4s' }}
                  />
                </>
              )}
            </div>
            <span className="w-20 text-right text-xs font-mono text-muted-foreground">
              {isActive ? `${lane.value.toFixed(0)} kbps` : '0 kbps'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
