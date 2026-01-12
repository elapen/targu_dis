'use client'

import { useState } from 'react'
import { useWebRTC, type CallMode, type ConnectionStatus } from '@/hooks/use-webrtc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toaster'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageSquare, Send, Copy, Users, Loader2, CheckCircle, XCircle, Clock, Plus, LogIn, ArrowLeft } from 'lucide-react'
import { NetworkDiagram } from '@/components/diagrams/network-diagram'
import { DataFlowVisualization } from '@/components/diagrams/data-flow'
import { cn } from '@/lib/utils'

const callModes: { value: CallMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'video', label: 'Видео', icon: <Video className="w-5 h-5" />, desc: 'Видео + Аудио' },
  { value: 'audio', label: 'Аудио', icon: <Mic className="w-5 h-5" />, desc: 'Тек дыбыс' },
  { value: 'data', label: 'Деректер', icon: <MessageSquare className="w-5 h-5" />, desc: 'Чат' },
  { value: 'all', label: 'Барлығы', icon: <Users className="w-5 h-5" />, desc: 'Конвергенция' },
]

// Генерация 4-значного ID
const generateRoomId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

type RoomMode = 'select' | 'create' | 'join'

export function DemoSection() {
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

  // Создать комнату
  const handleCreateRoom = async () => {
    const newRoomId = generateRoomId()
    setGeneratedRoomId(newRoomId)

    if (!browserSupport.webrtc) {
      toast({ title: 'WebRTC қолдамайды', description: 'Басқа браузер қолданыңыз', variant: 'destructive' })
      return
    }

    await startCall(newRoomId, selectedMode)
    toast({ title: 'Бөлме жасалды', description: `ID: ${newRoomId}` })
  }

  // Присоединиться к комнате
  const handleJoinRoom = async () => {
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

  const handleBack = () => {
    setRoomMode('select')
    setRoomInput('')
  }

  const copyRoomId = () => {
    const id = generatedRoomId || roomId
    if (id) {
      navigator.clipboard.writeText(id)
      toast({ title: 'Көшірілді!', description: id })
    }
  }

  // Обработка ввода только цифр
  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRoomInput(value)
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

          {/* Room Selection / Join UI */}
          {!isCallActive ? (
            <div className="space-y-4">
              {roomMode === 'select' && (
                <>
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Байланыс түрі</label>
                    <div className="grid grid-cols-4 gap-2">
                      {callModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSelectedMode(mode.value)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all',
                            selectedMode === mode.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          {mode.icon}
                          <span className="text-xs font-medium">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Create or Join Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      onClick={() => { setRoomMode('create'); handleCreateRoom(); }}
                      disabled={!browserSupport.webrtc}
                      className="h-16 rounded-xl bg-green-600 hover:bg-green-700 flex flex-col gap-1"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-sm">Бөлме жасау</span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setRoomMode('join')}
                      disabled={!browserSupport.webrtc}
                      className="h-16 rounded-xl flex flex-col gap-1"
                    >
                      <LogIn className="w-6 h-6" />
                      <span className="text-sm">Қосылу</span>
                    </Button>
                  </div>
                </>
              )}

              {roomMode === 'join' && (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Артқа
                  </Button>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Байланыс түрі</label>
                    <div className="grid grid-cols-4 gap-2">
                      {callModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSelectedMode(mode.value)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all',
                            selectedMode === mode.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          {mode.icon}
                          <span className="text-xs font-medium">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room ID Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Бөлме ID (4 сан)</label>
                    <Input
                      placeholder="1234"
                      value={roomInput}
                      onChange={handleRoomInputChange}
                      className="text-center text-2xl font-mono tracking-widest h-14"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>

                  <Button
                    size="lg"
                    onClick={handleJoinRoom}
                    disabled={roomInput.length !== 4}
                    className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700"
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
              <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Бөлме ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-mono font-bold tracking-widest text-primary">
                    {generatedRoomId || roomId}
                  </span>
                  <Button variant="outline" size="icon" onClick={copyRoomId} title="Көшіру">
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Осы ID-ді әріптесіңізге жіберіңіз
                </p>
              </div>

              {/* Mode Display */}
              <div className="flex justify-center">
                <div className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2',
                  'border-primary/30 bg-primary/5 text-primary'
                )}>
                  {callModes.find(m => m.value === selectedMode)?.icon}
                  <span className="text-sm font-medium">
                    {callModes.find(m => m.value === selectedMode)?.label}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          {isCallActive && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isVideoEnabled ? 'outline' : 'destructive'}
                size="lg"
                onClick={toggleVideo}
                disabled={selectedMode === 'audio' || selectedMode === 'data'}
                className="w-14 h-14 rounded-full p-0"
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>

              <Button
                variant={isAudioEnabled ? 'outline' : 'destructive'}
                size="lg"
                onClick={toggleAudio}
                disabled={selectedMode === 'data'}
                className="w-14 h-14 rounded-full p-0"
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>

              <Button variant="destructive" size="lg" onClick={handleEndCall} className="h-14 px-8 rounded-full">
                <PhoneOff className="w-5 h-5 mr-2" />
                Аяқтау
              </Button>

              <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="w-14 h-14 rounded-full p-0">
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
          )}

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
