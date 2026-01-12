# 🚀 Деплой и обновление

## Сервер
- **Домен:** https://targu.shyrak.kz
- **SSH:** `ssh -p 7000 bekzat@shyrak.kz`
- **Путь:** `~/projects/targu_dis`
- **Порт:** 3003
- **Запуск:** Docker Compose

## ⚡ Быстрое обновление (Docker)

```bash
ssh -p 7000 bekzat@shyrak.kz "cd ~/projects/targu_dis && git pull && docker compose down && docker compose up -d --build"
```

## 📋 Команды на сервере

```bash
# Подключение
ssh -p 7000 bekzat@shyrak.kz

# Перейти в проект
cd ~/projects/targu_dis

# Обновить код
git pull

# Пересобрать и запустить Docker
docker compose down
docker compose up -d --build

# Логи контейнера
docker logs convergence-app -f

# Статус контейнера
docker ps | grep convergence

# Перезапустить контейнер
docker compose restart
```

## 📁 Структура

```
~/projects/targu_dis/
├── docker-compose.yml  # Конфигурация Docker
├── Dockerfile          # Сборка образа
├── server.js           # Сервер + Socket.IO
├── .next/              # Сборка Next.js
└── src/                # Исходники
```

## 🔧 Конфигурация

**Docker Compose:** Порт 3003, автоперезапуск

**Nginx:** `/etc/nginx/sites-available/targu.conf`
```bash
# Проверить конфиг
sudo nginx -t

# Перезагрузить nginx
sudo systemctl reload nginx
```

**SSL:** Certbot (автообновление)
```bash
# Проверить сертификат
sudo certbot certificates
```

## ⚠️ Важно

1. **После git pull** — всегда делай `docker compose up -d --build`
2. **Docker** автоматически перезапускается при падении
3. **Логи** смотреть через `docker logs convergence-app -f`
