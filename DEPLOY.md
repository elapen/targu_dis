# 🚀 Деплой и обновление

## Сервер
- **Домен:** https://targu.shyrak.kz
- **SSH:** `ssh -p 7000 bekzat@shyrak.kz`
- **Путь:** `~/projects/targu_dis`
- **Порт:** 3003
- **PM2:** `targu`

## ⚡ Быстрое обновление

```bash
ssh -p 7000 bekzat@shyrak.kz "source ~/.nvm/nvm.sh && cd ~/projects/targu_dis && git pull && npm install && npm run build && pm2 restart targu"
```

## 📋 Команды на сервере

```bash
# Подключение
ssh -p 7000 bekzat@shyrak.kz

# Активировать Node.js
source ~/.nvm/nvm.sh

# Перейти в проект
cd ~/projects/targu_dis

# Обновить код
git pull

# Установить зависимости (если изменились)
npm install

# Пересобрать (обязательно после изменений)
npm run build

# Перезапустить
pm2 restart targu

# Логи
pm2 logs targu

# Статус
pm2 status
```

## 📁 Структура

```
~/projects/targu_dis/
├── .env          # Переменные окружения (PORT=3003)
├── server.js     # Сервер + Socket.IO
├── .next/        # Сборка Next.js
└── src/          # Исходники
```

## 🔧 Конфигурация

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

1. **После git pull** — всегда делай `npm run build`
2. **После npm install** — всегда делай `npm run build`  
3. **.env** не в git — создаётся вручную на сервере
4. **Node.js** через nvm — сначала `source ~/.nvm/nvm.sh`
