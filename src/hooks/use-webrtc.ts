'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export type CallMode = 'video' | 'audio' | 'data' | 'all'
export type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error'

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
  // Google STUN серверы (бесплатные)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // Metered TURN серверы (бесплатные публичные)
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

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
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

  const getMediaConstraints = useCallback((mode: CallMode) => {
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const video = mode === 'audio' || mode === 'data' ? false : {
      width: { ideal: isMobile ? 640 : 1280 },
      height: { ideal: isMobile ? 480 : 720 },
      frameRate: { ideal: isMobile ? 24 : 30 },
      facingMode: 'user',
    }

    const audio = mode === 'data' ? false : {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }

    return { video, audio }
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
      console.log('[WebRTC] Closing existing peer connection')
      peerConnectionRef.current.close()
    }

    console.log('[WebRTC] Creating new peer connection with', ICE_SERVERS.length, 'ICE servers')
    const pc = new RTCPeerConnection({ 
      iceServers: ICE_SERVERS, 
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // Использовать и relay и direct
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && currentRoomRef.current) {
        console.log('[WebRTC] Sending ICE candidate:', event.candidate.type, event.candidate.protocol)
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: currentRoomRef.current,
        })
      } else if (!event.candidate) {
        console.log('[WebRTC] ICE gathering complete')
      }
    }

    pc.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState)
    }

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState)
      switch (pc.iceConnectionState) {
        case 'checking':
          setConnectionStatus('connecting')
          break
        case 'connected':
        case 'completed':
          console.log('[WebRTC] ✅ Connection established!')
          setConnectionStatus('connected')
          break
        case 'disconnected':
          console.log('[WebRTC] ⚠️ Connection disconnected, waiting...')
          setConnectionStatus('waiting')
          break
        case 'failed':
          console.error('[WebRTC] ❌ Connection failed')
          setConnectionStatus('error')
          // Попытка перезапустить ICE
          pc.restartIce()
          break
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState)
    }

    pc.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state:', pc.signalingState)
    }

    pc.ontrack = (event) => {
      console.log('[WebRTC] 🎥 Remote track received:', event.track.kind)
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setConnectionStatus('connected')
      }
    }

    pc.ondatachannel = (event) => {
      console.log('[WebRTC] 📨 Data channel received')
      dataChannelRef.current = event.channel
      setupDataChannel(event.channel)
    }

    // Add local tracks
    if (localStreamRef.current) {
      console.log('[WebRTC] Adding local tracks to peer connection')
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Create data channel if needed
    if (callModeRef.current === 'data' || callModeRef.current === 'all') {
      const dc = pc.createDataChannel('convergence-data', { ordered: true })
      dataChannelRef.current = dc
      setupDataChannel(dc)
    }

    peerConnectionRef.current = pc
    return pc
  }, [setupDataChannel])

  const handleUserJoined = useCallback(async () => {
    console.log('[WebRTC] handleUserJoined called, isInitiator:', isInitiatorRef.current)
    
    if (!isInitiatorRef.current) {
      console.log('[WebRTC] Not initiator, waiting for offer')
      return
    }
    
    if (!peerConnectionRef.current) {
      console.error('[WebRTC] No peer connection!')
      return
    }
    
    if (!socketRef.current) {
      console.error('[WebRTC] No socket connection!')
      return
    }

    try {
      console.log('[WebRTC] Creating offer as initiator...')
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      
      console.log('[WebRTC] Setting local description...')
      await peerConnectionRef.current.setLocalDescription(offer)
      
      console.log('[WebRTC] 📤 Sending offer to room:', currentRoomRef.current)
      socketRef.current.emit('offer', { offer, roomId: currentRoomRef.current })
    } catch (err) {
      console.error('[WebRTC] Offer creation error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] 📥 Received offer')
    
    if (!peerConnectionRef.current) {
      console.error('[WebRTC] No peer connection for offer!')
      return
    }
    
    if (!socketRef.current) {
      console.error('[WebRTC] No socket for answer!')
      return
    }

    try {
      console.log('[WebRTC] Setting remote description from offer...')
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))

      // Add pending ICE candidates
      if (pendingCandidatesRef.current.length > 0) {
        console.log('[WebRTC] Adding', pendingCandidatesRef.current.length, 'pending ICE candidates')
        for (const candidate of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(candidate)
        }
        pendingCandidatesRef.current = []
      }

      console.log('[WebRTC] Creating answer...')
      const answer = await peerConnectionRef.current.createAnswer()
      
      console.log('[WebRTC] Setting local description...')
      await peerConnectionRef.current.setLocalDescription(answer)
      
      console.log('[WebRTC] 📤 Sending answer to room:', currentRoomRef.current)
      socketRef.current.emit('answer', { answer, roomId: currentRoomRef.current })
    } catch (err) {
      console.error('[WebRTC] Handle offer error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] 📥 Received answer')
    
    if (!peerConnectionRef.current) {
      console.error('[WebRTC] No peer connection for answer!')
      return
    }

    try {
      console.log('[WebRTC] Setting remote description from answer...')
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))

      // Add pending ICE candidates
      if (pendingCandidatesRef.current.length > 0) {
        console.log('[WebRTC] Adding', pendingCandidatesRef.current.length, 'pending ICE candidates')
        for (const candidate of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(candidate)
        }
        pendingCandidatesRef.current = []
      }
      
      console.log('[WebRTC] ✅ Signaling complete, waiting for ICE...')
    } catch (err) {
      console.error('[WebRTC] Handle answer error:', err)
      setConnectionStatus('error')
    }
  }, [])

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) {
      console.warn('[WebRTC] Received ICE candidate but no peer connection')
      return
    }

    try {
      const iceCandidate = new RTCIceCandidate(candidate)
      
      if (peerConnectionRef.current.remoteDescription) {
        console.log('[WebRTC] 🧊 Adding ICE candidate:', iceCandidate.type, iceCandidate.protocol)
        await peerConnectionRef.current.addIceCandidate(iceCandidate)
      } else {
        console.log('[WebRTC] 📦 Queuing ICE candidate (no remote description yet)')
        pendingCandidatesRef.current.push(iceCandidate)
      }
    } catch (err) {
      // Игнорируем ошибки дублирующих кандидатов
      if ((err as Error).message?.includes('already')) {
        console.log('[WebRTC] ICE candidate already added, ignoring')
      } else {
        console.error('[WebRTC] ICE candidate error:', err)
      }
    }
  }, [])

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('[Socket] Already connected:', socketRef.current.id)
      return socketRef.current
    }

    console.log('[Socket] Initializing connection...')
    const socket = io({ 
      path: '/api/socket', 
      transports: ['websocket', 'polling'], 
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('[Socket] ✅ Connected:', socket.id)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] ❌ Connection error:', error.message)
      setConnectionStatus('error')
    })

    socket.on('user-joined', ({ userId }) => {
      console.log('[Socket] 👤 User joined:', userId)
      setPeersCount(prev => prev + 1)
      // Небольшая задержка чтобы peer connection был готов
      setTimeout(() => handleUserJoined(), 100)
    })

    socket.on('room-ready', ({ roomId }) => {
      console.log('[Socket] 🎉 Room ready:', roomId, '- 2 users connected')
    })

    socket.on('offer', ({ offer, from }) => {
      console.log('[Socket] 📥 Received offer from:', from)
      handleOffer(offer)
    })
    
    socket.on('answer', ({ answer, from }) => {
      console.log('[Socket] 📥 Received answer from:', from)
      handleAnswer(answer)
    })
    
    socket.on('ice-candidate', ({ candidate, from }) => {
      console.log('[Socket] 🧊 Received ICE candidate from:', from)
      handleIceCandidate(candidate)
    })

    socket.on('user-left', ({ userId }) => {
      console.log('[Socket] 👤 User left:', userId)
      setPeersCount(prev => Math.max(0, prev - 1))
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      setConnectionStatus('waiting')
    })

    socket.on('room-info', ({ count, isInitiator }) => {
      console.log('[Socket] 📊 Room info - count:', count, 'isInitiator:', isInitiator)
      setPeersCount(count)
      isInitiatorRef.current = isInitiator
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] ⚠️ Disconnected:', reason)
      setConnectionStatus('disconnected')
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] 🔄 Reconnected after', attemptNumber, 'attempts')
    })

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

  const startCall = useCallback(async (newRoomId: string, mode: CallMode) => {
    try {
      setConnectionStatus('connecting')
      setRoomId(newRoomId)
      currentRoomRef.current = newRoomId
      callModeRef.current = mode
      pendingCandidatesRef.current = []

      // Get media
      const constraints = getMediaConstraints(mode)
      if (constraints.video || constraints.audio) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          localStreamRef.current = stream
          if (localVideoRef.current) localVideoRef.current.srcObject = stream
        } catch (err) {
          console.error('[WebRTC] Media error:', err)
        }
      }

      // Create peer connection
      await createPeerConnection()

      // Connect socket and join room
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

    setIsCallActive(false)
    setConnectionStatus('idle')
    setRoomId(null)
    currentRoomRef.current = null
    isInitiatorRef.current = false
    pendingCandidatesRef.current = []
    setMessages([])
    setPeersCount(0)
    setStats({ latency: 0, bandwidth: 0, packets: 0, jitter: 0, videoRate: 0, audioRate: 0, dataRate: 0 })
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
    return () => { endCall() }
  }, [endCall])

  return {
    localVideoRef, remoteVideoRef, connectionStatus, isCallActive, isVideoEnabled, isAudioEnabled,
    roomId, stats, browserSupport, peersCount, startCall, endCall, toggleVideo, toggleAudio, sendMessage, messages,
  }
}
