'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, Radio, Target, Coins, Shield, Zap, Globe, Server } from 'lucide-react'

const theories = [
  {
    icon: Link2,
    color: 'text-blue-500',
    title: 'Конвергенция дегеніміз не?',
    description: 'Конвергенция — бұл бұрын бөлек болған телекоммуникация қызметтерін (дауыс, видео, деректер) бірыңғай IP-негізіндегі желіде біріктіру процесі.',
    items: ['Барлық трафик IP пакеттері арқылы', 'Бірыңғай инфрақұрылым', 'Интеграцияланған қызметтер'],
  },
  {
    icon: Radio,
    color: 'text-green-500',
    title: 'WebRTC технологиясы',
    description: 'WebRTC (Web Real-Time Communication) — браузерлер мен мобильді қосымшалар арасында нақты уақытта байланыс орнатуға мүмкіндік беретін ашық стандарт.',
    items: ['P2P байланыс', 'Шифрлау (SRTP/DTLS)', 'NAT traversal (ICE/STUN/TURN)'],
  },
  {
    icon: Target,
    color: 'text-purple-500',
    title: 'QoS (Quality of Service)',
    description: 'Қызмет сапасын қамтамасыз ету — конвергентті желілерде әртүрлі трафик түрлеріне басымдық беру механизмі.',
    items: ['Дауысқа жоғары басымдық', 'Видеоға орташа басымдық', 'Деректерге икемді басымдық'],
  },
  {
    icon: Coins,
    color: 'text-yellow-500',
    title: 'Экономикалық тиімділік',
    description: 'Конвергенция ұйымдарға айтарлықтай шығындарды үнемдеуге мүмкіндік береді.',
    items: ['Инфрақұрылым шығындары 40-60% төмен', 'Бір басқару жүйесі', 'Оңай масштабтау'],
  },
]

const protocolStack = [
  { name: 'Қолданба', protocols: 'VoIP, Video, WebRTC, SIP', color: 'border-red-500 bg-red-500/10' },
  { name: 'Тасымалдау', protocols: 'RTP, RTCP, SRTP, SCTP', color: 'border-orange-500 bg-orange-500/10' },
  { name: 'Сессия', protocols: 'ICE, STUN, TURN, DTLS', color: 'border-yellow-500 bg-yellow-500/10' },
  { name: 'Желі', protocols: 'IP, IPv4, IPv6', color: 'border-green-500 bg-green-500/10' },
  { name: 'Канал', protocols: 'Ethernet, Wi-Fi, LTE/5G', color: 'border-blue-500 bg-blue-500/10' },
]

const features = [
  { icon: Shield, title: 'Қауіпсіздік', desc: 'End-to-end шифрлау' },
  { icon: Zap, title: 'Жылдамдық', desc: 'Төмен кідіріс' },
  { icon: Globe, title: 'Қолжетімділік', desc: 'Кез келген құрылғыда' },
  { icon: Server, title: 'Масштабтау', desc: 'Шексіз өсу мүмкіндігі' },
]

export function TheorySection() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl border border-border/50"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3">
          Конвергенция принципі
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Телефония, видеобайланыс және деректер тасымалын бірыңғай желіде ұйымдастыру
        </p>
      </motion.div>

      {/* Theory Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {theories.map((theory, index) => (
          <motion.div
            key={theory.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-secondary ${theory.color}`}>
                    <theory.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{theory.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{theory.description}</p>
                    <ul className="space-y-1">
                      {theory.items.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-cyan-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Protocol Stack */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-center mb-6">Протокол стегі</h2>
          <div className="max-w-md mx-auto space-y-2">
            {protocolStack.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${layer.color}`}
              >
                <span className="font-medium text-sm">{layer.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{layer.protocols}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center p-4 hover:border-primary/50 transition-colors">
              <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
