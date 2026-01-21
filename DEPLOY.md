# Деплой Stoneflower на Easypanel

## Архитектура

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL │
│  nginx:80   │     │ express:3001│     │    :5432    │
└─────────────┘     └─────────────┘     └─────────────┘
```

| Сервис     | Порт | Доступ                       |
| ---------- | ---- | ---------------------------- |
| PostgreSQL | 5432 | Только внутренний            |
| Backend    | 3001 | Через nginx proxy            |
| Frontend   | 80   | Внешний (HTTPS через Easypanel) |

---

## Шаг 1: Создание проекта в Easypanel

1. Войдите в панель Easypanel
2. Нажмите **Create Project**
3. Введите имя проекта: `stoneflower`

---

## Шаг 2: PostgreSQL

1. В проекте нажмите **+ Service** → **Database** → **PostgreSQL**
2. Настройки:
   - **Service Name:** `postgres`
   - **Database:** `stoneflower`
   - **Username:** `stoneflower`
   - **Password:** (сгенерируйте надёжный пароль)
3. Нажмите **Create**
4. Запомните/скопируйте connection string:
   ```
   postgresql://stoneflower:PASSWORD@postgres:5432/stoneflower
   ```

---

## Шаг 3: Backend

1. Нажмите **+ Service** → **App**
2. Настройки:
   - **Service Name:** `backend`
   - **Source:** GitHub repo / Docker image
   - **Build Path:** `/backend` (если из репозитория)
   - **Port:** `3001`

### Environment Variables

| Переменная           | Значение                                              |
| -------------------- | ----------------------------------------------------- |
| `DATABASE_URL`       | `postgresql://stoneflower:PASSWORD@postgres:5432/stoneflower` |
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather                                   |
| `TELEGRAM_WEBAPP_URL`| `https://your-domain.com` (будет после настройки фронта) |
| `FRONTEND_URL`       | `https://your-domain.com`                             |
| `PORT`               | `3001`                                                |
| `NODE_ENV`           | `production`                                          |

### Если деплоите из Docker Hub

```bash
# Локально собрать и запушить
cd backend
docker build -t your-dockerhub/stoneflower-backend:latest .
docker push your-dockerhub/stoneflower-backend:latest
```

В Easypanel укажите образ: `your-dockerhub/stoneflower-backend:latest`

---

## Шаг 4: Frontend

1. Нажмите **+ Service** → **App**
2. Настройки:
   - **Service Name:** `frontend`
   - **Source:** GitHub repo / Docker image
   - **Build Path:** `/frontend` (если из репозитория)
   - **Port:** `80`

### Domains

1. Перейдите в **Domains**
2. Добавьте домен: `your-domain.com`
3. Включите **HTTPS** (Let's Encrypt)

### Если деплоите из Docker Hub

```bash
cd frontend
docker build -t your-dockerhub/stoneflower-frontend:latest .
docker push your-dockerhub/stoneflower-frontend:latest
```

---

## Шаг 5: Настройка Telegram Bot

1. Откройте @BotFather в Telegram
2. Отправьте `/mybots` → выберите вашего бота
3. **Bot Settings** → **Menu Button** → **Configure menu button**
4. Отправьте URL: `https://your-domain.com`
5. **Bot Settings** → **Domain** → Добавьте домен `your-domain.com`

---

## Проверка работоспособности

```bash
# Frontend health check
curl https://your-domain.com/health

# Backend health check (через nginx proxy)
curl https://your-domain.com/api/health

# Прямой запрос к backend (изнутри сети Easypanel)
curl http://backend:3001/health
```

---

## Troubleshooting

### Ошибка подключения к БД

1. Проверьте `DATABASE_URL` в backend
2. Убедитесь, что PostgreSQL запущен
3. Проверьте, что backend и postgres в одной сети

```bash
# В консоли backend контейнера
npx prisma migrate status
```

### CORS ошибки

1. Проверьте `FRONTEND_URL` в backend
2. Убедитесь, что URL указан с `https://`

### Telegram WebApp не открывается

1. Убедитесь, что домен добавлен в @BotFather
2. Проверьте HTTPS (обязательно для Mini Apps)
3. Проверьте, что Menu Button настроен

### Миграции не применяются

Миграции запускаются автоматически при старте backend. Если нужно запустить вручную:

```bash
# В консоли backend контейнера
npx prisma migrate deploy
```

---

## Обновление приложения

### Из GitHub

Easypanel автоматически подхватит изменения, если настроен webhook. Или нажмите **Redeploy** вручную.

### Из Docker Hub

```bash
# Локально
docker build -t your-dockerhub/stoneflower-backend:latest ./backend
docker push your-dockerhub/stoneflower-backend:latest

docker build -t your-dockerhub/stoneflower-frontend:latest ./frontend
docker push your-dockerhub/stoneflower-frontend:latest
```

В Easypanel нажмите **Redeploy** для каждого сервиса.

---

## Локальная проверка Docker-образов

```bash
# Backend
cd backend
docker build -t stoneflower-backend .
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e TELEGRAM_BOT_TOKEN="..." \
  stoneflower-backend

# Frontend
cd frontend
docker build -t stoneflower-frontend .
docker run --rm -p 80:80 stoneflower-frontend
```

---

## Переменные окружения (полный список)

### Backend

| Переменная           | Обязательная | Описание                              |
| -------------------- | ------------ | ------------------------------------- |
| `DATABASE_URL`       | ✅           | PostgreSQL connection string          |
| `TELEGRAM_BOT_TOKEN` | ✅           | Токен от @BotFather                   |
| `TELEGRAM_WEBAPP_URL`| ✅           | Публичный URL Mini App                |
| `FRONTEND_URL`       | ✅           | URL фронтенда (для CORS)              |
| `PORT`               | ❌           | Порт сервера (по умолчанию 3001)      |
| `NODE_ENV`           | ❌           | Окружение (production/development)    |

### Frontend

| Переменная    | Обязательная | Описание                                    |
| ------------- | ------------ | ------------------------------------------- |
| `BACKEND_URL` | ❌           | URL backend сервиса (по умолчанию `http://backend:3001`) |

API URL проксируется nginx на backend. По умолчанию используется `http://backend:3001`, что работает в сети Docker/Easypanel.
