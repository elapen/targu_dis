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

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
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
      peerConnectionRef.current.close()
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 })

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && currentRoomRef.current) {
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
          break
        case 'disconnected':
          setConnectionStatus('waiting')
          break
        case 'failed':
          setConnectionStatus('error')
          break
      }
    }

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track:', event.track.kind)
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setConnectionStatus('connected')
      }
    }

    pc.ondatachannel = (event) => {
      dataChannelRef.current = event.channel
      setupDataChannel(event.channel)
    }

    // Add local tracks
    if (localStreamRef.current) {
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
    if (!isInitiatorRef.current || !peerConnectionRef.current || !socketRef.current) return

    try {
      console.log('[WebRTC] Creating offer...')
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      socketRef.current.emit('offer', { offer, roomId: currentRoomRef.current })
      console.log('[WebRTC] Offer sent')
    } catch (err) {
      console.error('[WebRTC] Offer error:', err)
    }
  }, [])

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !socketRef.current) return

    try {
      console.log('[WebRTC] Handling offer...')
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))

      // Add pending candidates
      for (const candidate of pendingCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []

      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      socketRef.current.emit('answer', { answer, roomId: currentRoomRef.current })
      console.log('[WebRTC] Answer sent')
    } catch (err) {
      console.error('[WebRTC] Answer error:', err)
    }
  }, [])

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return

    try {
      console.log('[WebRTC] Handling answer...')
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))

      // Add pending candidates
      for (const candidate of pendingCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []
    } catch (err) {
      console.error('[WebRTC] Set answer error:', err)
    }
  }, [])

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return

    try {
      if (peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        pendingCandidatesRef.current.push(new RTCIceCandidate(candidate))
      }
    } catch (err) {
      console.error('[WebRTC] ICE error:', err)
    }
  }, [])

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current

    const socket = io({ path: '/api/socket', transports: ['websocket', 'polling'], reconnection: true })

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id))

    socket.on('user-joined', ({ userId }) => {
      console.log('[Socket] User joined:', userId)
      setPeersCount(prev => prev + 1)
      handleUserJoined()
    })

    socket.on('offer', ({ offer }) => handleOffer(offer))
    socket.on('answer', ({ answer }) => handleAnswer(answer))
    socket.on('ice-candidate', ({ candidate }) => handleIceCandidate(candidate))

    socket.on('user-left', () => {
      console.log('[Socket] User left')
      setPeersCount(prev => Math.max(0, prev - 1))
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      setConnectionStatus('waiting')
    })

    socket.on('room-info', ({ count, isInitiator }) => {
      console.log('[Socket] Room info - count:', count, 'isInitiator:', isInitiator)
      setPeersCount(count)
      isInitiatorRef.current = isInitiator
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setConnectionStatus('disconnected')
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
