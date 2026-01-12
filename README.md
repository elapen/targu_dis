# Конвергенция - Телефония, Видеобайланыс және Деректер Тасымалы

## Диссертация тақырыбы
**КОНВЕРГЕНЦИЯ ПРИНЦИПІ БОЙЫНША ТЕЛЕФОНИЯ, ВИДЕОБАЙЛАНЫС ЖӘНЕ ДЕРЕКТЕР ТАСЫМАЛЫН ҰЙЫМДАСТЫРУ**

---

## Жылдам бастау

### Локальды орнату

```bash
# Тәуелділіктерді орнату
npm install

# Development режимде іске қосу
npm run dev

# Production build
npm run build
npm start
```

Браузерде: **http://localhost:3000**

---

## Docker арқылы іске қосу

```bash
# Docker image құру және іске қосу
docker-compose up -d --build

# Логтарды көру
docker-compose logs -f

# Тоқтату
docker-compose down
```

---

## Серверге орнату

### 1. Серверге файлдарды көшіру
```bash
scp -r ./* user@server:/opt/convergence/
```

### 2. Docker іске қосу
```bash
cd /opt/convergence
docker-compose up -d --build
```

### 3. Nginx конфигурациясы
```bash
# Конфигурацияны көшіру
sudo cp nginx.conf /etc/nginx/sites-available/convergence.conf

# Домен атын өзгерту
sudo nano /etc/nginx/sites-available/convergence.conf
# server_name convergence.example.com -> server_name yourdomain.com

# Symlink құру
sudo ln -s /etc/nginx/sites-available/convergence.conf /etc/nginx/sites-enabled/

# Nginx-ті тексеру және қайта іске қосу
sudo nginx -t
sudo systemctl reload nginx
```

---

## Функционалдық мүмкіндіктер

### Байланыс түрлері
- **Видео + Аудио**: Толық мультимедиа байланыс
- **Тек Аудио**: Дауыстық байланыс
- **Деректер**: Мәтін және файл алмасу
- **Конвергенция**: Барлығы бірге

### Демонстрация
- **Конвергентті желі диаграммасы**: Бірыңғай IP желісі
- **Дәстүрлі желі диаграммасы**: Бөлек PSTN, ISDN, LAN
- **Салыстырмалы талдау**: Артықшылықтар мен кемшіліктер

### Мобильді қолдау
- PWA (Progressive Web App)
- Толық мобильді браузер қолдауы
- Touch-friendly интерфейс

---

## Технологиялар

| Технология | Қолданылуы |
|------------|-----------|
| Next.js 14 | React Framework |
| Socket.IO | Real-time signaling |
| WebRTC | P2P медиа байланыс |
| Tailwind CSS | Стильдеу |
| shadcn/ui | UI компоненттер |
| Framer Motion | Анимациялар |
| Docker | Контейнеризация |

---

## Файлдар құрылымы

```
targu_dis/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React компоненттер
│   │   ├── ui/             # shadcn/ui
│   │   ├── layout/         # Layout компоненттер
│   │   ├── sections/       # Бет секциялары
│   │   └── diagrams/       # SVG диаграммалар
│   ├── hooks/              # React hooks
│   └── lib/                # Утилиталар
├── public/                  # Статикалық файлдар
├── server.js               # Custom server (Socket.IO)
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker Compose
├── nginx.conf              # Nginx конфигурациясы
└── package.json            # Dependencies
```

---

## Екі құрылғыны қосу

1. Екі браузер терезесін ашыңыз
2. Бірдей **Room ID** енгізіңіз
3. **"Бастау"** батырмасын басыңыз
4. Камера мен микрофонға рұқсат беріңіз

---

## Браузер қолдауы

| Браузер | Қолдау |
|---------|--------|
| Chrome | ✅ Толық |
| Firefox | ✅ Толық |
| Safari | ✅ Толық |
| Edge | ✅ Толық |
| iOS Safari | ✅ Толық |
| Android Chrome | ✅ Толық |

---

## Конвергенция артықшылықтары

| Дәстүрлі желілер | Конвергентті желі |
|------------------|-------------------|
| 3 бөлек желі | 1 бірыңғай желі |
| Жоғары шығындар | 40-60% үнемдеу |
| Күрделі басқару | Оңай басқару |
| Интеграция жоқ | Толық интеграция |
| Масштабтау қиын | Оңай масштабтау |

---

## Қолдау

Сұрақтар болса, автормен байланысыңыз.

**© 2024 Диссертация жұмысы**
