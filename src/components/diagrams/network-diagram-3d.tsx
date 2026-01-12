'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Box, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

interface NetworkDiagram3DProps {
  isCallActive: boolean
  diagramType: 'convergent' | 'traditional'
}

// Анимированная линия передачи данных
function DataPacket({ start, end, color, speed = 1 }: { start: [number, number, number]; end: [number, number, number]; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(Math.random())

  useFrame((_, delta) => {
    setProgress((prev) => (prev + delta * speed * 0.5) % 1)
  })

  const x = start[0] + (end[0] - start[0]) * progress
  const y = start[1] + (end[1] - start[1]) * progress
  const z = start[2] + (end[2] - start[2]) * progress

  return (
    <Sphere ref={ref} args={[0.08, 16, 16]} position={[x, y, z]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Sphere>
  )
}

// Смартфон 3D модель
function Smartphone({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Phone body */}
      <Box args={[0.4, 0.8, 0.05]} castShadow>
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Screen */}
      <Box args={[0.35, 0.65, 0.01]} position={[0, 0.03, 0.03]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Box>
      {/* Camera notch */}
      <Sphere args={[0.03, 16, 16]} position={[0, 0.32, 0.03]}>
        <meshStandardMaterial color="#0f0f23" />
      </Sphere>
      {/* Label */}
      <Html position={[0, -0.6, 0]} center>
        <div className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  )
}

// Сервер 3D модель
function Server({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={ref} position={position}>
      <Box args={[0.6, 0.4, 0.3]} castShadow>
        <meshStandardMaterial color="#16213e" metalness={0.7} roughness={0.3} />
      </Box>
      {/* LED indicators */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <Sphere key={i} args={[0.03, 16, 16]} position={[x, 0.1, 0.16]}>
          <meshStandardMaterial 
            color={['#22c55e', '#facc15', '#3b82f6'][i]} 
            emissive={['#22c55e', '#facc15', '#3b82f6'][i]} 
            emissiveIntensity={0.8} 
          />
        </Sphere>
      ))}
      <Html position={[0, -0.4, 0]} center>
        <div className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          Signaling Server
        </div>
      </Html>
    </group>
  )
}

// IP Cloud - центральное облако сети
function IPCloud({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.7, 32, 32]}>
        <meshStandardMaterial 
          color="#6366f1" 
          transparent 
          opacity={0.3} 
          emissive="#6366f1"
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </Sphere>
      <Html center>
        <div className="text-center">
          <div className="text-sm font-bold text-white">IP Желісі</div>
          <div className="text-[10px] text-white/70">Бірыңғай инфрақұрылым</div>
        </div>
      </Html>
    </group>
  )
}

// Линия соединения
function ConnectionLine({ start, end, color, dashed = false }: { 
  start: [number, number, number]; 
  end: [number, number, number]; 
  color: string;
  dashed?: boolean 
}) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={2}
      dashed={dashed}
      dashSize={0.1}
      dashScale={5}
    />
  )
}

// Конвергентная сеть
function ConvergentNetwork({ isCallActive }: { isCallActive: boolean }) {
  return (
    <group>
      {/* IP Cloud в центре */}
      <IPCloud position={[0, 0, 0]} isActive={isCallActive} />
      
      {/* Устройство A - слева */}
      <Smartphone position={[-2.5, 0.5, 0]} label="Құрылғы A" color="#3b82f6" />
      
      {/* Устройство B - справа */}
      <Smartphone position={[2.5, 0.5, 0]} label="Құрылғы B" color="#8b5cf6" />
      
      {/* Сервер - внизу */}
      <Server position={[0, -1.5, 0]} />
      
      {/* Линии соединения */}
      <ConnectionLine start={[-2, 0, 0]} end={[-0.7, 0, 0]} color="#3b82f6" />
      <ConnectionLine start={[2, 0, 0]} end={[0.7, 0, 0]} color="#8b5cf6" />
      <ConnectionLine start={[0, -0.7, 0]} end={[0, -1.1, 0]} color="#facc15" dashed />
      
      {/* P2P соединение когда активно */}
      {isCallActive && (
        <>
          <ConnectionLine start={[-2, 0.8, 0]} end={[2, 0.8, 0]} color="#22c55e" />
          {/* Анимированные пакеты данных */}
          <DataPacket start={[-2, 0.5, 0]} end={[2, 0.5, 0]} color="#ef4444" speed={1} />
          <DataPacket start={[2, 0.5, 0]} end={[-2, 0.5, 0]} color="#22c55e" speed={1.2} />
          <DataPacket start={[-2, 0.3, 0]} end={[2, 0.3, 0]} color="#3b82f6" speed={0.8} />
        </>
      )}
      
      {/* Текст заголовка */}
      <Text position={[0, 2, 0]} fontSize={0.25} color="white" anchorX="center">
        Конвергентті IP Желісі
      </Text>
      
      {/* Легенда */}
      <group position={[-2.5, -2.2, 0]}>
        <Sphere args={[0.06, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </Sphere>
        <Text position={[0.3, 0, 0]} fontSize={0.12} color="white" anchorX="left">Видео</Text>
        
        <Sphere args={[0.06, 16, 16]} position={[1, 0, 0]}>
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </Sphere>
        <Text position={[1.3, 0, 0]} fontSize={0.12} color="white" anchorX="left">Аудио</Text>
        
        <Sphere args={[0.06, 16, 16]} position={[2, 0, 0]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </Sphere>
        <Text position={[2.3, 0, 0]} fontSize={0.12} color="white" anchorX="left">Деректер</Text>
      </group>
    </group>
  )
}

// Традиционная сеть
function TraditionalNetwork() {
  return (
    <group>
      {/* Три отдельных сети */}
      {/* PSTN */}
      <group position={[-2, 0.5, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#ef4444" transparent opacity={0.3} />
        </Sphere>
        <Text position={[0, 0, 0.6]} fontSize={0.15} color="#ef4444">PSTN</Text>
        <Box args={[0.3, 0.2, 0.1]} position={[0, -0.8, 0]}>
          <meshStandardMaterial color="#1a1a2e" />
        </Box>
        <Html position={[0, -1.1, 0]} center>
          <div className="text-[10px] text-red-400">📞 Телефон</div>
        </Html>
      </group>
      
      {/* ISDN */}
      <group position={[0, 0.5, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#22c55e" transparent opacity={0.3} />
        </Sphere>
        <Text position={[0, 0, 0.6]} fontSize={0.15} color="#22c55e">ISDN</Text>
        <Box args={[0.4, 0.25, 0.1]} position={[0, -0.8, 0]}>
          <meshStandardMaterial color="#1a1a2e" />
        </Box>
        <Html position={[0, -1.1, 0]} center>
          <div className="text-[10px] text-green-400">📹 Видео</div>
        </Html>
      </group>
      
      {/* LAN/WAN */}
      <group position={[2, 0.5, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
        </Sphere>
        <Text position={[0, 0, 0.6]} fontSize={0.15} color="#3b82f6">LAN</Text>
        <Box args={[0.35, 0.25, 0.05]} position={[0, -0.8, 0]}>
          <meshStandardMaterial color="#1a1a2e" />
        </Box>
        <Html position={[0, -1.1, 0]} center>
          <div className="text-[10px] text-blue-400">💻 ПК</div>
        </Html>
      </group>
      
      {/* Линии */}
      <ConnectionLine start={[-2, 0, 0]} end={[-2, -0.5, 0]} color="#ef4444" dashed />
      <ConnectionLine start={[0, 0, 0]} end={[0, -0.5, 0]} color="#22c55e" dashed />
      <ConnectionLine start={[2, 0, 0]} end={[2, -0.5, 0]} color="#3b82f6" dashed />
      
      {/* Заголовок */}
      <Text position={[0, 2, 0]} fontSize={0.25} color="white" anchorX="center">
        Дәстүрлі Бөлек Желілер
      </Text>
      
      {/* Недостатки */}
      <group position={[-2.5, -2, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.1} color="#f87171" anchorX="left">❌ Бөлек инфрақұрылым</Text>
        <Text position={[0, -0.2, 0]} fontSize={0.1} color="#f87171" anchorX="left">❌ Жоғары шығындар</Text>
        <Text position={[2, 0, 0]} fontSize={0.1} color="#f87171" anchorX="left">❌ Күрделі басқару</Text>
        <Text position={[2, -0.2, 0]} fontSize={0.1} color="#f87171" anchorX="left">❌ Интеграция жоқ</Text>
      </group>
    </group>
  )
}

// Основной компонент
export function NetworkDiagram3D({ isCallActive, diagramType }: NetworkDiagram3DProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center">
        <div className="text-muted-foreground">Жүктелуде...</div>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        
        <Suspense fallback={null}>
          {diagramType === 'convergent' ? (
            <ConvergentNetwork isCallActive={isCallActive} />
          ) : (
            <TraditionalNetwork />
          )}
        </Suspense>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate={!isCallActive}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
