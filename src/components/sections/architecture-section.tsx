'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Zap, TrendingUp, Monitor, Server, Database, Cloud, Lock, Globe, Cpu } from 'lucide-react'

const architectureLayers = [
  {
    name: 'Клиент қабаты',
    color: 'border-blue-500',
    items: [
      { name: 'Веб-браузер', sub: 'WebRTC API' },
      { name: 'iOS/Android', sub: 'Native SDK' },
      { name: 'Desktop', sub: 'Electron' },
    ],
  },
  {
    name: 'Сигнализация қабаты',
    color: 'border-purple-500',
    items: [
      { name: 'WebSocket Server', sub: 'Socket.IO' },
      { name: 'SIP Proxy', sub: 'Kamailio' },
    ],
  },
  {
    name: 'Медиа қабаты',
    color: 'border-cyan-500',
    items: [
      { name: 'STUN сервер', sub: 'NAT Discovery' },
      { name: 'TURN сервер', sub: 'Media Relay' },
      { name: 'Media сервер', sub: 'Janus/Mediasoup' },
    ],
  },
  {
    name: 'Деректер қабаты',
    color: 'border-green-500',
    items: [
      { name: 'PostgreSQL', sub: 'Users/Sessions' },
      { name: 'Redis Cache', sub: 'Real-time data' },
    ],
  },
]

const features = [
  {
    icon: Shield,
    title: 'Қауіпсіздік',
    description: 'SRTP шифрлау, DTLS қорғау, токен-негізіндегі аутентификация',
  },
  {
    icon: Zap,
    title: 'Өнімділік',
    description: 'P2P байланыс, медиа сервер арқылы өту, адаптивті битрейт',
  },
  {
    icon: TrendingUp,
    title: 'Масштабтау',
    description: 'Көлденең масштабтау, жүктемені балансыру, геораспределение',
  },
]

const techStack = [
  { icon: Globe, name: 'Next.js', desc: 'React Framework' },
  { icon: Server, name: 'Socket.IO', desc: 'Real-time' },
  { icon: Lock, name: 'WebRTC', desc: 'P2P Media' },
  { icon: Database, name: 'PostgreSQL', desc: 'Database' },
  { icon: Cpu, name: 'Redis', desc: 'Caching' },
  { icon: Cloud, name: 'Docker', desc: 'Container' },
]

export function ArchitectureSection() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
          Жүйе Архитектурасы
        </h1>
        <p className="text-muted-foreground text-sm">
          Қабаттарға бөлінген микросервис архитектурасы
        </p>
      </motion.div>

      {/* Architecture Diagram */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {architectureLayers.map((layer, layerIndex) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: layerIndex * 0.15 }}
                className={`rounded-xl border-2 ${layer.color} bg-secondary/30 p-4`}
              >
                <h3 className="text-sm font-semibold mb-3 text-center">{layer.name}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {layer.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: layerIndex * 0.15 + itemIndex * 0.05 }}
                      className="bg-card rounded-lg px-4 py-2 text-center min-w-[100px]"
                    >
                      <div className="text-xs font-medium">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connection arrows (simplified for mobile) */}
          <div className="hidden sm:flex justify-center gap-4 my-4 text-muted-foreground text-2xl">
            ↓ ↓ ↓
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm text-center hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <feature.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tech Stack */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-center mb-4">Технологиялар стегі</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <tech.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-xs font-medium">{tech.name}</div>
                <div className="text-[10px] text-muted-foreground">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left text-muted-foreground font-medium">Параметр</th>
                <th className="p-3 text-center text-red-400 font-medium">Дәстүрлі</th>
                <th className="p-3 text-center text-green-400 font-medium">Конвергентті</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">Желілер саны</td>
                <td className="p-3 text-center text-red-400">3 бөлек</td>
                <td className="p-3 text-center text-green-400">1 бірыңғай</td>
              </tr>
              <tr>
                <td className="p-3">Шығындар</td>
                <td className="p-3 text-center text-red-400">Жоғары</td>
                <td className="p-3 text-center text-green-400">40-60% төмен</td>
              </tr>
              <tr>
                <td className="p-3">Басқару</td>
                <td className="p-3 text-center text-red-400">Күрделі</td>
                <td className="p-3 text-center text-green-400">Оңай</td>
              </tr>
              <tr>
                <td className="p-3">Масштабтау</td>
                <td className="p-3 text-center text-red-400">Қиын</td>
                <td className="p-3 text-center text-green-400">Оңай</td>
              </tr>
              <tr>
                <td className="p-3">Интеграция</td>
                <td className="p-3 text-center text-red-400">Шектеулі</td>
                <td className="p-3 text-center text-green-400">Толық</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
