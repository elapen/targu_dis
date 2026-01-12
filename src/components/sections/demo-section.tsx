'use client'

import { useState } from 'react'
import { useWebRTC, type CallMode, type ConnectionStatus } from '@/hooks/use-webrtc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toaster'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageSquare, Send, Copy, Users, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { NetworkDiagram } from '@/components/diagrams/network-diagram'
import { DataFlowVisualization } from '@/components/diagrams/data-flow'
import { cn } from '@/lib/utils'

const callModes: { value: CallMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'video', label: 'Видео', icon: <Video className="w-5 h-5" />, desc: 'Видео + Аудио' },
  { value: 'audio', label: 'Аудио', icon: <Mic className="w-5 h-5" />, desc: 'Тек дыбыс' },
  { value: 'data', label: 'Деректер', icon: <MessageSquare className="w-5 h-5" />, desc: 'Чат' },
  { value: 'all', label: 'Барлығы', icon: <Users className="w-5 h-5" />, desc: 'Конвергенция' },
]

export function DemoSection() {
  const [selectedMode, setSelectedMode] = useState<CallMode>('video')
  const [roomInput, setRoomInput] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const {
    localVideoRef, remoteVideoRef, connectionStatus, isCallActive, isVideoEnabled, isAudioEnabled,
    roomId, stats, browserSupport, peersCount, startCall, endCall, toggleVideo, toggleAudio, sendMessage, messages,
  } = useWebRTC()

  const handleStartCall = async () => {
    const room = roomInput.trim() || `room-${Math.random().toString(36).substr(2, 6)}`
    setRoomInput(room)

    if (!browserSupport.webrtc) {
      toast({ title: 'WebRTC қолдамайды', description: 'Басқа браузер қолданыңыз', variant: 'destructive' })
      return
    }

    await startCall(room, selectedMode)
    toast({ title: 'Бөлмеге қосылуда', description: `ID: ${room}` })
  }

  const handleEndCall = () => {
    endCall()
    toast({ title: 'Байланыс аяқталды' })
  }

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      toast({ title: 'Көшірілді!', description: roomId })
    }
  }

  const StatusBadge = () => {
    const statusConfig: Record<ConnectionStatus, { icon: typeof Clock; text: string; color: string; bg: string; spin?: boolean }> = {
      idle: { icon: Clock, text: 'Күту', color: 'text-muted-foreground', bg: 'bg-muted' },
      connecting: { icon: Loader2, text: 'Қосылуда...', color: 'text-yellow-500', bg: 'bg-yellow-500/10', spin: true },
      waiting: { icon: Users, text: 'Әріптес күтуде', color: 'text-blue-500', bg: 'bg-blue-500/10' },
      connected: { icon: CheckCircle, text: 'Қосылды', color: 'text-green-500', bg: 'bg-green-500/10' },
      disconnected: { icon: XCircle, text: 'Ажыратылды', color: 'text-orange-500', bg: 'bg-orange-500/10' },
      error: { icon: XCircle, text: 'Қате', color: 'text-red-500', bg: 'bg-red-500/10' },
    }
    const config = statusConfig[connectionStatus]
    const Icon = config.icon

    return (
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', config.bg, config.color)}>
        <Icon className={cn('w-4 h-4', config.spin && 'animate-spin')} />
        <span>{config.text}</span>
        {peersCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{peersCount}</span>}
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Video Call Panel */}
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Видео байланыс</CardTitle>
            <StatusBadge />
          </div>
          <CardDescription>Екі құрылғы арасында P2P байланыс орнатыңыз</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Local Video */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border-2 border-primary/20">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60">
                <p className="text-xs text-white font-medium">Сіз</p>
              </div>
              {!isVideoEnabled && isCallActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border-2 border-secondary">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60">
                <p className="text-xs text-white font-medium">Әріптес</p>
              </div>
              {connectionStatus !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 gap-3">
                  {connectionStatus === 'waiting' ? (
                    <>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 animate-ping absolute" />
                        <Users className="w-12 h-12 text-primary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">Әріптесті күтуде...</p>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Қосылуда...</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Байланыс жоқ</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Room ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Бөлме ID</label>
            <div className="flex gap-2">
              <Input
                placeholder="Бөлме ID енгізіңіз немесе бос қалдырыңыз"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                disabled={isCallActive}
              />
              {roomId && (
                <Button variant="outline" size="icon" onClick={copyRoomId} title="Көшіру">
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            {roomId && (
              <p className="text-xs text-muted-foreground">
                Бөлме: <span className="font-mono text-primary">{roomId}</span> - осы ID-ді әріптесіңізге жіберіңіз
              </p>
            )}
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Байланыс түрі</label>
            <div className="grid grid-cols-4 gap-2">
              {callModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setSelectedMode(mode.value)}
                  disabled={isCallActive}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all',
                    selectedMode === mode.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30',
                    isCallActive && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {mode.icon}
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isVideoEnabled ? 'outline' : 'destructive'}
              size="lg"
              onClick={toggleVideo}
              disabled={!isCallActive || selectedMode === 'audio' || selectedMode === 'data'}
              className="w-14 h-14 rounded-full p-0"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>

            <Button
              variant={isAudioEnabled ? 'outline' : 'destructive'}
              size="lg"
              onClick={toggleAudio}
              disabled={!isCallActive || selectedMode === 'data'}
              className="w-14 h-14 rounded-full p-0"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>

            {!isCallActive ? (
              <Button size="lg" onClick={handleStartCall} disabled={!browserSupport.webrtc} className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-700">
                <Phone className="w-5 h-5 mr-2" />
                Бастау
              </Button>
            ) : (
              <Button variant="destructive" size="lg" onClick={handleEndCall} className="h-14 px-8 rounded-full">
                <PhoneOff className="w-5 h-5 mr-2" />
                Аяқтау
              </Button>
            )}

            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" disabled={!isCallActive} className="w-14 h-14 rounded-full p-0">
                  <MessageSquare className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Хабарламалар</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col h-80">
                  <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-lg">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Хабарлама жоқ</p>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className={cn('max-w-[80%] p-2 rounded-lg text-sm', msg.type === 'sent' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-secondary')}>
                          {msg.text}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Хабарлама..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (sendMessage(chatInput.trim()), setChatInput(''))}
                    />
                    <Button onClick={() => (sendMessage(chatInput.trim()), setChatInput(''))} disabled={!chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          {isCallActive && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Кідіріс', value: `${stats.latency.toFixed(0)}ms`, color: 'text-green-500' },
                { label: 'Жылдамдық', value: `${(stats.bandwidth / 1000).toFixed(1)}Mb`, color: 'text-blue-500' },
                { label: 'Видео', value: `${stats.videoRate.toFixed(0)}kb`, color: 'text-purple-500' },
                { label: 'Аудио', value: `${stats.audioRate.toFixed(0)}kb`, color: 'text-orange-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-sm font-mono font-medium', stat.color)}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Diagram */}
      <div className="space-y-4">
        <NetworkDiagram isCallActive={isCallActive} stats={stats} />
        <DataFlowVisualization stats={stats} isActive={isCallActive && connectionStatus === 'connected'} />
      </div>
    </div>
  )
}
