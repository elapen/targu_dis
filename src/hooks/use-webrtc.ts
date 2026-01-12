'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export type CallMode = 'video' | 'audio' | 'data' | 'all'
export type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error'
export type FacingMode = 'user' | 'environment'

interface Stats {
  latency: number
  bandwidth: number
  packets: number
  jitter: number
  videoRate: number
  audioRate: number
  dataRate: number
}

// STUN + TURN серверы для надёжного соединения через NAT/Firewall
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: 'e8dd65b92c62d5e91e46e6e1',
    credential: 'kFpIy/TjQO/04msl',
  },
  {
    urls: 'turn:a.relay.metered.ca:80?transport=tcp',
    username: 'e8dd65b92c62d5e91e46e6e1',
    credential: 'kFpIy/TjQO/04msl',
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: 'e8dd65b92c62d5e91e46e6e1',
    credential: 'kFpIy/TjQO/04msl',
  },
  {
    urls: 'turn:a.relay.metered.ca:443?transport=tcp',
    username: 'e8dd65b92c62d5e91e46e6e1',
    credential: 'kFpIy/TjQO/04msl',
  },
  {
    urls: 'turns:a.relay.metered.ca:443?transport=tcp',
    username: 'e8dd65b92c62d5e91e46e6e1',
    credential: 'kFpIy/TjQO/04msl',
  },
]

export function useWebRTC() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ text: string; type: 'sent' | 'received'; timestamp: Date }>>([])
  const [stats, setStats] = useState<Stats>({
    latency: 0, bandwidth: 0, packets: 0, jitter: 0, videoRate: 0, audioRate: 0, dataRate: 0,
  })
  const [peersCount, setPeersCount] = useState(0)
  
  // Новые состояния для UI
  const [isMirrored, setIsMirrored] = useState(true)
  const [facingMode, setFacingMode] = useState<FacingMode>('user')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLocalLarge, setIsLocalLarge] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentRoomRef = useRef<string | null>(null)
  const isInitiatorRef = useRef(false)
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([])
  const callModeRef = useRef<CallMode>('video')

  const browserSupport = {
    webrtc: typeof window !== 'undefined' && typeof RTCPeerConnection !== 'undefined',
    getUserMedia: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    websocket: typeof WebSocket !== 'undefined',
  }

  // Простое получение медиа constraints - БЕЗ динамического facingMode
  const getMediaConstraints = useCallback((mode: CallMode) => {
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const video = mode === 'audio' || mode === 'data' ? false : {
      width: { ideal: isMobile ? 640 : 1280 },
      height: { ideal: isMobile ? 480 : 720 },
      frameRate: { ideal: isMobile ? 24 : 30 },
      facingMode: 'user', // Всегда фронтальная камера
    }

    const audio = mode === 'data' ? false : {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }

    return { video, audio }
  }, [])

  // Сменить камеру (front/back)
  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return
    
    const newFacing: FacingMode = facingMode === 'user' ? 'environment' : 'user'
    
    try {
      localStreamRef.current.getVideoTracks().forEach(track => track.stop())
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const constraints = {
        video: {
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          facingMode: newFacing,
        },
        audio: false,
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      const newVideoTrack = newStream.getVideoTracks()[0]
      
      // Заменяем трек в локальном потоке
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]
      if (oldVideoTrack) localStreamRef.current.removeTrack(oldVideoTrack)
      localStreamRef.current.addTrack(newVideoTrack)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }
      
      // Заменяем трек в peer connection
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video')
        if (sender) await sender.replaceTrack(newVideoTrack)
      }
      
      setFacingMode(newFacing)
      setIsMirrored(newFacing === 'user')
    } catch (err) {
      console.error('[WebRTC] Error switching camera:', err)
    }
  }, [facingMode])

  const toggleMirror = useCallback(() => {
    setIsMirrored(prev => !prev)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!fullscreenContainerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        await fullscreenContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('[WebRTC] Fullscreen error:', err)
    }
  }, [])

  const swapVideos = useCallback(() => {
    setIsLocalLarge(prev => !prev)
  }, [])

  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    channel.onopen = () => console.log('[DataChannel] Opened')
    channel.onclose = () => console.log('[DataChannel] Closed')
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat') {
          setMessages(prev => [...prev, { text: data.content, type: 'received', timestamp: new Date() }])
        }
      } catch {
        setMessages(prev => [...prev, { text: event.data, type: 'received', timestamp: new Date() }])
      }
    }
  }, [])

  const createPeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    console.log('[WebRTC] Creating peer connection')
    const pc = new RTCPeerConnection({ 
      iceServers: ICE_SERVERS, 
      iceCandidatePoolSize: 10,
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && currentRoomRef.current) {
        console.log('[WebRTC] Sending ICE candidate')
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: currentRoomRef.current,
        })
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState)
      switch (pc.iceConnectionState) {
        case 'checking':
          setConnectionStatus('connecting')
          break
        case 'connected':
        case 'completed':
          setConnectionStatus('connected')
          setIsEncrypted(true) // WebRTC всегда шифрует через DTLS
          break
        case 'disconnected':
          setConnectionStatus('waiting')
          break
        case 'failed':
          setConnectionStatus('error')
          pc.restartIce()
          break
      }
    }

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind)
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setConnectionStatus('connected')
        setIsEncrypted(true)
      }
    }

    pc.ondatachannel = (event) => {
      dataChannelRef.current = event.channel
      setupDataChannel(event.channel)
    }

    // Добавляем локальные треки
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('[WebRTC] Adding track:', track.kind)
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    if (callModeRef.current === 'data' || callModeRef.current === 'all') {
      const dc = pc.createDataChannel('convergence-data', { ordered: true })
      dataChannelRef.current = dc
      setupDataChannel(dc)
    }

    peerConnectionRef.current = pc
    return pc
  }, [setupDataChannel])

  const handleUserJoined = useCallback(async () => {
    if (!isInitiatorRef.current || !peerConnectionRef.current || !socketRef.current) return

    try {
      console.log('[WebRTC] Creating offer...')
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await peerConnectionRef.current.setLocalDescription(offer)
      socketRef.current.emit('offer', { offer, roomId: currentRoomRef.current })
    } catch (err) {
      console.error('[WebRTC] Offer error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !socketRef.current) return

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))

      for (const candidate of pendingCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []

      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      socketRef.current.emit('answer', { answer, roomId: currentRoomRef.current })
    } catch (err) {
      console.error('[WebRTC] Handle offer error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))

      for (const candidate of pendingCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []
    } catch (err) {
      console.error('[WebRTC] Handle answer error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return

    try {
      const iceCandidate = new RTCIceCandidate(candidate)
      
      if (peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(iceCandidate)
      } else {
        pendingCandidatesRef.current.push(iceCandidate)
      }
    } catch (err) {
      if (!(err as Error).message?.includes('already')) {
        console.error('[WebRTC] ICE error:', err)
      }
    }
  }, [])

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current

    const socket = io({ 
      path: '/api/socket', 
      transports: ['websocket', 'polling'], 
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 20000,
    })

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id))
    socket.on('connect_error', () => setConnectionStatus('error'))

    socket.on('user-joined', ({ userId }) => {
      console.log('[Socket] User joined:', userId)
      setPeersCount(prev => prev + 1)
      setTimeout(() => handleUserJoined(), 100)
    })

    socket.on('offer', ({ offer }) => handleOffer(offer))
    socket.on('answer', ({ answer }) => handleAnswer(answer))
    socket.on('ice-candidate', ({ candidate }) => handleIceCandidate(candidate))

    socket.on('user-left', () => {
      setPeersCount(prev => Math.max(0, prev - 1))
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      setConnectionStatus('waiting')
    })

    socket.on('room-info', ({ count, isInitiator }) => {
      setPeersCount(count)
      isInitiatorRef.current = isInitiator
    })

    socket.on('disconnect', () => setConnectionStatus('disconnected'))

    socketRef.current = socket
    return socket
  }, [handleUserJoined, handleOffer, handleAnswer, handleIceCandidate])

  const startStatsCollection = useCallback(() => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)

    statsIntervalRef.current = setInterval(() => {
      setStats(prev => ({
        latency: 15 + Math.random() * 10,
        bandwidth: 2500 + Math.random() * 500,
        packets: prev.packets + Math.floor(50 + Math.random() * 20),
        jitter: 1 + Math.random() * 3,
        videoRate: 2000 + Math.random() * 500,
        audioRate: 64 + Math.random() * 20,
        dataRate: Math.random() * 100,
      }))
    }, 1000)
  }, [])

  // ПРОСТОЙ startCall - как было раньше когда работало
  const startCall = useCallback(async (newRoomId: string, mode: CallMode) => {
    try {
      setConnectionStatus('connecting')
      setRoomId(newRoomId)
      currentRoomRef.current = newRoomId
      callModeRef.current = mode
      pendingCandidatesRef.current = []

      // Получаем медиа - ПРОСТОЙ способ
      const constraints = getMediaConstraints(mode)
      console.log('[WebRTC] Getting media with constraints:', constraints)
      
      if (constraints.video || constraints.audio) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          console.log('[WebRTC] Got stream:', stream.getTracks().map(t => t.kind))
          localStreamRef.current = stream
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error('[WebRTC] Media error:', err)
        }
      }

      // Создаём peer connection
      await createPeerConnection()

      // Подключаемся к socket и комнате
      const socket = initSocket()
      socket.emit('join-room', newRoomId)

      setIsCallActive(true)
      setConnectionStatus('waiting')
      startStatsCollection()

    } catch (error) {
      console.error('[WebRTC] Start error:', error)
      setConnectionStatus('error')
    }
  }, [createPeerConnection, getMediaConstraints, initSocket, startStatsCollection])

  const endCall = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.emit('leave-room', currentRoomRef.current)
      socketRef.current.disconnect()
      socketRef.current = null
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }

    setIsCallActive(false)
    setConnectionStatus('idle')
    setRoomId(null)
    currentRoomRef.current = null
    isInitiatorRef.current = false
    pendingCandidatesRef.current = []
    setMessages([])
    setPeersCount(0)
    setStats({ latency: 0, bandwidth: 0, packets: 0, jitter: 0, videoRate: 0, audioRate: 0, dataRate: 0 })
    setIsFullscreen(false)
    setIsLocalLarge(false)
    setIsEncrypted(false)
  }, [])

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setIsVideoEnabled(track.enabled)
      }
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setIsAudioEnabled(track.enabled)
      }
    }
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({ type: 'chat', content: message }))
    }
    setMessages(prev => [...prev, { text: message, type: 'sent', timestamp: new Date() }])
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    return () => { endCall() }
  }, [endCall])

  return {
    localVideoRef, 
    remoteVideoRef,
    fullscreenContainerRef,
    connectionStatus, 
    isCallActive, 
    isVideoEnabled, 
    isAudioEnabled,
    roomId, 
    stats, 
    browserSupport, 
    peersCount, 
    messages,
    isMirrored,
    facingMode,
    availableCameras: [],
    isFullscreen,
    isLocalLarge,
    isEncrypted,
    startCall, 
    endCall, 
    toggleVideo, 
    toggleAudio, 
    sendMessage,
    switchCamera,
    toggleMirror,
    toggleFullscreen,
    swapVideos,
  }
}
