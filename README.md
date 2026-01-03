# Chaos Manager - To-Do List Application

## Установка и запуск

### Предварительные требования
- Node.js (v18 или выше)
- PostgreSQL (или используйте Docker Compose)
- npm или yarn

### Локальная разработка

1. **Клонируйте репозиторий** (если еще не сделали)

2. **Установите Node.js**

3. **Установите зависимости бэкенда:**
   ```bash
   npm install
   ```

4. **Установите зависимости фронтенда:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Создайте файл `.env` в корне проекта:**
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

6. **Запустите PostgreSQL:**
   - Локально: убедитесь, что PostgreSQL запущен и создана база данных `chaos_manager`
   - Или используйте Docker Compose

7. **Запустите бэкенд:**
   ```bash
   npm run dev
   ```

8. **В другом терминале запустите фронтенд:**
   ```bash
   npm run dev:frontend
   ```
Подтвердите Would you like to run the app on another port instead? Нажав Y.

Бэкенд будет доступен на `http://localhost:3000`
Фронтенд будет доступен на `http://localhost:3001` (или другом порту, который выберет React)

