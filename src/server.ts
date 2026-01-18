/**
 * Главный файл сервера приложения
 * Настраивает Express сервер, API endpoints и подключение к БД
 */

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { IsNull } from 'typeorm';
import { Todo } from './entity/Todo';
import { User } from './entity/User';
import * as path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка middleware
app.use(cors());
app.use(express.json());

// Тестовый endpoint для проверки работы API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API работает',
    endpoints: {
      'GET /api': 'Информация об API',
      'GET /api/tasks': 'Получить задачи из БД',
      'GET /api/todos': 'Получить все задачи',
      'POST /api/todos': 'Создать задачу',
      'PATCH /api/todos/:id': 'Обновить задачу',
      'DELETE /api/todos/:id': 'Удалить задачу',
      'GET /api/users': 'Получить всех пользователей',
      'GET /api/users/:email': 'Получить пользователя по email',
      'POST /api/users': 'Создать или получить пользователя по email'
    }
  });
});

// Обслуживание статических файлов фронтенда (только в production)
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// Подключение к базе данных
let dbInitialized = false;
AppDataSource.initialize()
  .then(async () => {
    console.log('База данных подключена');
    dbInitialized = true;
    // Инициализируем начальные задачи, если их нет
    await initializeDefaultTasks();
  })
  .catch((error) => {
    console.error('Ошибка подключения к базе данных:', error);
    dbInitialized = false;
  });

// Middleware для проверки подключения к БД
app.use('/api', (req, res, next) => {
  if (!dbInitialized && req.method !== 'GET' && !req.path.includes('/api')) {
    return res.status(503).json({ error: 'База данных не подключена' });
  }
  next();
});

// Функция для инициализации начальных задач в БД (если их нет)
async function initializeDefaultTasks() {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const count = await todoRepository.count();
    
    if (count === 0) {
      const defaultTasks = [
        { text: 'Первая задача', completed: false },
        { text: 'Вторая задача', completed: false },
        { text: 'Третья задача', completed: true }
      ];
      
      for (const taskData of defaultTasks) {
        const todo = new Todo();
        todo.text = taskData.text;
        todo.completed = taskData.completed;
        await todoRepository.save(todo);
      }
      
      console.log('Созданы начальные задачи в базе данных');
    }
  } catch (error) {
    console.error('Ошибка инициализации начальных задач:', error);
  }
}

// GET /api/tasks - получение задач из базы данных
app.get('/api/tasks', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const todoRepository = AppDataSource.getRepository(Todo);
    const todos = await todoRepository.find({
      order: { createdAt: 'DESC' }
    });
    
    // Преобразуем формат для совместимости с фронтендом (text -> title)
    const tasks = todos.map(todo => ({
      id: todo.id,
      title: todo.text,
      completed: todo.completed
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/todos - получение всех задач (с фильтрацией по userId)
app.get('/api/todos', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const todoRepository = AppDataSource.getRepository(Todo);
    
    const todos = await todoRepository.find({
      where: userId ? { userId } : { userId: IsNull() },
      order: { createdAt: 'DESC' }
    });
    
    res.json(todos);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/todos - создание новой задачи
app.post('/api/todos', async (req, res) => {
  try {
    const { text, userId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Текст задачи обязателен' });
    }

    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = new Todo();
    todo.text = text;
    todo.completed = false;
    todo.userId = userId || undefined;

    const savedTodo = await todoRepository.save(todo);
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/todos/:id - обновление задачи (частичное)
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const todoRepository = AppDataSource.getRepository(Todo);
    
    const todo = await todoRepository.findOne({ where: { id } });
    if (!todo) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    // Обновляем только переданные поля
    if (updates.text !== undefined) todo.text = updates.text;
    if (updates.completed !== undefined) todo.completed = updates.completed;

    const updatedTodo = await todoRepository.save(todo);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/todos/:id - удаление задачи
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todoRepository = AppDataSource.getRepository(Todo);
    const result = await todoRepository.delete(id);
    
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/users - получение всех пользователей
app.get('/api/users', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      order: { createdAt: 'DESC' }
    });
    
    // Возвращаем только id и email (без паролей)
    const usersData = users.map(user => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    res.json(usersData);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/users/:email - получение пользователя по email
app.get('/api/users/:email', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const { email } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/users - создание или получение пользователя по email
app.post('/api/users', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const { email } = req.body;
    console.log('Получен запрос на создание пользователя:', email);

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    // Простая валидация email
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Проверяем, существует ли пользователь с таким email
    let user = await userRepository.findOne({ where: { email: email.trim() } });
    
    if (!user) {
      // Создаем нового пользователя
      user = new User();
      user.email = email.trim();
      user = await userRepository.save(user);
      console.log('Создан новый пользователь:', user.id, user.email);
    } else {
      console.log('Найден существующий пользователь:', user.id, user.email);
    }

    // Возвращаем данные пользователя
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Ошибка сохранения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : String(error) });
  }
});

// Fallback роут для React Router (только в production)
// Важно: этот роут должен быть последним, после всех API роутов
app.get('*', (req, res) => {
  // Если запрос к API, но endpoint не найден
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint не найден',
      path: req.path,
      method: req.method,
      hint: 'Проверьте правильность пути и метода запроса (GET, POST, PATCH, DELETE)',
      availableEndpoints: [
        'GET /api',
        'GET /api/tasks - получить задачи из БД',
        'GET /api/todos',
        'POST /api/todos',
        'PATCH /api/todos/:id',
        'DELETE /api/todos/:id',
        'GET /api/users - получить всех пользователей',
        'GET /api/users/:email - получить пользователя по email',
        'POST /api/users - создать или получить пользователя по email'
      ]
    });
  }
  
  // В production отдаем index.html для React Router
  const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    // В development показываем информационное сообщение
    res.status(404).json({ 
      message: 'Backend API сервер',
      info: 'В режиме разработки фронтенд работает отдельно на порту 3001',
      frontendUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:3000/api',
      testApi: 'http://localhost:3000/api'
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
