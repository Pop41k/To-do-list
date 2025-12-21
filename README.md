# Chaos Manager - To-Do List Application

## Установка и запуск

### Предварительные требования
- Node.js (v18 или выше)
- PostgreSQL (или используйте Docker Compose)
- npm или yarn

### Локальная разработка

1. **Клонируйте репозиторий** (если еще не сделали)

2. **Установите зависимости бэкенда:**
   ```bash
   npm install
   ```

3. **Установите зависимости фронтенда:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Создайте файл `.env` в корне проекта:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=chaos_manager

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

5. **Запустите PostgreSQL:**
   - Локально: убедитесь, что PostgreSQL запущен и создана база данных `chaos_manager`
   - Или используйте Docker Compose (см. ниже)

6. **Запустите бэкенд:**
   ```bash
   npm run dev
   ```

7. **В другом терминале запустите фронтенд:**
   ```bash
   npm run dev:frontend
   ```

Бэкенд будет доступен на `http://localhost:3000`
Фронтенд будет доступен на `http://localhost:3001` (или другом порту, который выберет React)

