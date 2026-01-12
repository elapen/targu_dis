'use client'

import { useState, useEffect } from 'react'
import { useWebRTC, type CallMode, type ConnectionStatus } from '@/hooks/use-webrtc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toaster'
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Send, Copy, Users, Loader2, CheckCircle, XCircle, Clock, Plus, LogIn, ArrowLeft } from 'lucide-react'
import { NetworkDiagram } from '@/components/diagrams/network-diagram'
import { DataFlowVisualization } from '@/components/diagrams/data-flow'
import { cn } from '@/lib/utils'

const callModes: { value: CallMode; label: string; icon: React.ReactNode }[] = [
  { value: 'video', label: 'Видео', icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { value: 'audio', label: 'Аудио', icon: <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { value: 'data', label: 'Чат', icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { value: 'all', label: 'Барлығы', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
]

// Генерация 4-значного ID
const generateRoomId = () => Math.floor(1000 + Math.random() * 9000).toString()

type RoomMode = 'select' | 'create' | 'join'

export function DemoSection() {
  const [mounted, setMounted] = useState(false)
  const [selectedMode, setSelectedMode] = useState<CallMode>('video')
  const [roomMode, setRoomMode] = useState<RoomMode>('select')
  const [roomInput, setRoomInput] = useState('')
  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const {
    localVideoRef, remoteVideoRef, connectionStatus, isCallActive, isVideoEnabled, isAudioEnabled,
    roomId, stats, browserSupport, peersCount, startCall, endCall, toggleVideo, toggleAudio, sendMessage, messages,
  } = useWebRTC()

  // Fix hydration - wait for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateRoom = async () => {
    if (!mounted) return
    const newRoomId = generateRoomId()
    setGeneratedRoomId(newRoomId)

    if (!browserSupport.webrtc) {
      toast({ title: 'WebRTC қолдамайды', description: 'Басқа браузер қолданыңыз', variant: 'destructive' })
      return
    }

    await startCall(newRoomId, selectedMode)
    toast({ title: 'Бөлме жасалды', description: `ID: ${newRoomId}` })
  }

  const handleJoinRoom = async () => {
    if (!mounted) return
    if (roomInput.length !== 4 || !/^\d{4}$/.test(roomInput)) {
      toast({ title: 'Қате ID', description: '4 санды енгізіңіз', variant: 'destructive' })
      return
    }

    if (!browserSupport.webrtc) {
      toast({ title: 'WebRTC қолдамайды', description: 'Басқа браузер қолданыңыз', variant: 'destructive' })
      return
    }

    await startCall(roomInput, selectedMode)
    toast({ title: 'Бөлмеге қосылуда', description: `ID: ${roomInput}` })
  }

  const handleEndCall = () => {
    endCall()
    setRoomMode('select')
    setGeneratedRoomId(null)
    setRoomInput('')
    toast({ title: 'Байланыс аяқталды' })
  }

  const copyRoomId = () => {
    const id = generatedRoomId || roomId
    if (id) {
      navigator.clipboard.writeText(id)
      toast({ title: 'Көшірілді!', description: id })
    }
  }

  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRoomInput(value)
  }

  const StatusBadge = () => {
    const statusConfig: Record<ConnectionStatus, { icon: typeof Clock; text: string; color: string; bg: string; spin?: boolean }> = {
      idle: { icon: Clock, text: 'Күту', color: 'text-muted-foreground', bg: 'bg-muted' },
      connecting: { icon: Loader2, text: 'Қосылуда...', color: 'text-yellow-500', bg: 'bg-yellow-500/10', spin: true },
      waiting: { icon: Users, text: 'Күтуде', color: 'text-blue-500', bg: 'bg-blue-500/10' },
      connected: { icon: CheckCircle, text: 'Қосылды', color: 'text-green-500', bg: 'bg-green-500/10' },
      disconnected: { icon: XCircle, text: 'Ажыратылды', color: 'text-orange-500', bg: 'bg-orange-500/10' },
      error: { icon: XCircle, text: 'Қате', color: 'text-red-500', bg: 'bg-red-500/10' },
    }
    const config = statusConfig[connectionStatus]
    const Icon = config.icon

    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium', config.bg, config.color)}>
        <Icon className={cn('w-3 h-3 sm:w-4 sm:h-4', config.spin && 'animate-spin')} />
        <span className="hidden xs:inline">{config.text}</span>
        {peersCount > 0 && <span className="px-1 py-0.5 bg-black/20 rounded text-[10px]">{peersCount}</span>}
      </div>
    )
  }

  // Loading state during hydration
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 lg:gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="aspect-video bg-muted rounded-xl" />
                <div className="aspect-video bg-muted rounded-xl" />
              </div>
              <div className="h-16 bg-muted rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Video Call Panel */}
      <Card>
        <CardHeader className="p-4 sm:p-6 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-xl">Видео байланыс</CardTitle>
            <StatusBadge />
          </div>
          <CardDescription className="text-xs sm:text-sm">P2P байланыс орнатыңыз</CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
          {/* Video Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* Local Video */}
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-muted border-2 border-primary/20">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/60">
                <p className="text-[10px] sm:text-xs text-white font-medium">Сіз</p>
              </div>
              {!isVideoEnabled && isCallActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-muted border-2 border-secondary">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/60">
                <p className="text-[10px] sm:text-xs text-white font-medium">Әріптес</p>
              </div>
              {connectionStatus !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 gap-2">
                  {connectionStatus === 'waiting' ? (
                    <>
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-primary/30 animate-ping absolute" />
                        <Users className="w-8 h-8 sm:w-12 sm:h-12 text-primary/50" />
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Күтуде...</p>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Қосылуда...</p>
                    </>
                  ) : (
                    <p className="text-[10px] sm:text-sm text-muted-foreground">Байланыс жоқ</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Room Selection / Join UI */}
          {!isCallActive ? (
            <div className="space-y-3 sm:space-y-4">
              {roomMode === 'select' && (
                <>
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Байланыс түрі</label>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {callModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSelectedMode(mode.value)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg border-2 transition-all',
                            selectedMode === mode.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          {mode.icon}
                          <span className="text-[10px] sm:text-xs font-medium">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Create or Join Buttons */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Button
                      size="lg"
                      onClick={() => { setRoomMode('create'); handleCreateRoom(); }}
                      disabled={!browserSupport.webrtc}
                      className="h-14 sm:h-16 rounded-xl bg-green-600 hover:bg-green-700 flex flex-col gap-0.5 sm:gap-1"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Бөлме жасау</span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setRoomMode('join')}
                      disabled={!browserSupport.webrtc}
                      className="h-14 sm:h-16 rounded-xl flex flex-col gap-0.5 sm:gap-1"
                    >
                      <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Қосылу</span>
                    </Button>
                  </div>
                </>
              )}

              {roomMode === 'join' && (
                <div className="space-y-3 sm:space-y-4">
                  <Button variant="ghost" size="sm" onClick={() => setRoomMode('select')} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Артқа
                  </Button>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Байланыс түрі</label>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {callModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSelectedMode(mode.value)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg border-2 transition-all',
                            selectedMode === mode.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          {mode.icon}
                          <span className="text-[10px] sm:text-xs font-medium">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room ID Input */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Бөлме ID (4 сан)</label>
                    <Input
                      placeholder="1234"
                      value={roomInput}
                      onChange={handleRoomInputChange}
                      className="text-center text-xl sm:text-2xl font-mono tracking-widest h-12 sm:h-14"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                    />
                  </div>

                  <Button
                    size="lg"
                    onClick={handleJoinRoom}
                    disabled={roomInput.length !== 4}
                    className="w-full h-12 sm:h-14 rounded-xl bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Қосылу
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Room ID Display */}
              <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border-2 border-primary/20 text-center space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Бөлме ID</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-primary">
                    {generatedRoomId || roomId}
                  </span>
                  <Button variant="outline" size="icon" onClick={copyRoomId} title="Көшіру" className="h-8 w-8 sm:h-10 sm:w-10">
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Осы ID-ді әріптесіңізге жіберіңіз
                </p>
              </div>

              {/* Mode Display */}
              <div className="flex justify-center">
                <div className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2',
                  'border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm'
                )}>
                  {callModes.find(m => m.value === selectedMode)?.icon}
                  <span className="font-medium">
                    {callModes.find(m => m.value === selectedMode)?.label}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          {isCallActive && (
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Button
                variant={isVideoEnabled ? 'outline' : 'destructive'}
                size="lg"
                onClick={toggleVideo}
                disabled={selectedMode === 'audio' || selectedMode === 'data'}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full p-0"
              >
                {isVideoEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              <Button
                variant={isAudioEnabled ? 'outline' : 'destructive'}
                size="lg"
                onClick={toggleAudio}
                disabled={selectedMode === 'data'}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full p-0"
              >
                {isAudioEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              <Button variant="destructive" size="lg" onClick={handleEndCall} className="h-11 sm:h-14 px-4 sm:px-8 rounded-full">
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Аяқтау</span>
              </Button>

              <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="w-11 h-11 sm:w-14 sm:h-14 rounded-full p-0">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Хабарламалар</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col h-60 sm:h-80">
                    <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-lg">
                      {messages.length === 0 ? (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">Хабарлама жоқ</p>
                      ) : (
                        messages.map((msg, i) => (
                          <div key={i} className={cn('max-w-[80%] p-2 rounded-lg text-xs sm:text-sm', msg.type === 'sent' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-secondary')}>
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
          )}

          {/* Stats */}
          {isCallActive && (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
              {[
                { label: 'Кідіріс', value: `${stats.latency.toFixed(0)}ms`, color: 'text-green-500' },
                { label: 'Жылдамдық', value: `${(stats.bandwidth / 1000).toFixed(1)}Mb`, color: 'text-blue-500' },
                { label: 'Видео', value: `${stats.videoRate.toFixed(0)}kb`, color: 'text-purple-500' },
                { label: 'Аудио', value: `${stats.audioRate.toFixed(0)}kb`, color: 'text-orange-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-1.5 sm:p-2 rounded-lg bg-muted/50">
                  <p className="text-[9px] sm:text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-[10px] sm:text-sm font-mono font-medium', stat.color)}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Diagram - Hidden on very small screens when call is not active */}
      <div className={cn("space-y-4", !isCallActive && "hidden sm:block")}>
        <NetworkDiagram isCallActive={isCallActive} stats={stats} />
        <DataFlowVisualization stats={stats} isActive={isCallActive && connectionStatus === 'connected'} />
      </div>
    </div>
  )
}
