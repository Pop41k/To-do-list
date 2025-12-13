# Многоступенчатая сборка
# Этап 1: Сборка фронтенда
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Копируем package.json и устанавливаем зависимости
COPY frontend/package*.json ./
RUN npm install

# Копируем исходники и собираем
COPY frontend/ ./
RUN npm run build

# Этап 2: Сборка бэкенда
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники TypeScript
COPY tsconfig.json ./
COPY src/ ./src/

# Собираем TypeScript
RUN npm run build

# Этап 3: Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем только production зависимости
COPY package*.json ./
RUN npm install --production

# Копируем собранный бэкенд
COPY --from=backend-builder /app/dist ./dist

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "dist/server.js"]

