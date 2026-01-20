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

// Middleware для сохранения пользователя по email из заголовка
app.use(async (req, res, next) => {
  const userEmail = req.headers['x-user-email'] as string;
  console.log(`Запрос ${req.method} ${req.path}, email: ${userEmail || 'не указан'}`);

  if (userEmail && userEmail.trim()) {
    try {
      if (dbInitialized) {
        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOne({ where: { email: userEmail.trim() } });

        if (!user) {
          user = new User();
          user.email = userEmail.trim();
          await userRepository.save(user);
          console.log('✅ Создан новый пользователь из заголовка:', user.id, user.email);
        } else {
          console.log('✅ Найден существующий пользователь из заголовка:', user.id, user.email);
        }

        // Добавляем информацию о пользователе в request для использования в обработчиках
        (req as any).currentUser = user;
      } else {
        console.log('⚠️  БД не инициализирована, пропускаю сохранение пользователя');
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения пользователя из заголовка:', error);
      // Не прерываем выполнение запроса при ошибке сохранения пользователя
    }
  }

  next();
});

// Тестовый endpoint для проверки работы API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API работает',
    endpoints: {
      'GET /api': 'Информация об API',
      'GET /api/tasks': 'Получить задачи из БД',
      'GET /api/todos': 'Получить все задачи (с авто-фильтрацией по email из заголовка X-User-Email)',
      'POST /api/todos': 'Создать задачу (автоматически привязывается к пользователю из заголовка X-User-Email)',
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
  })
  .catch((error) => {
    console.error('Ошибка подключения к базе данных:', error);
    dbInitialized = false;
  });

// Middleware для проверки подключения к БД
app.use('/api', (req, res, next) => {
  if (!dbInitialized && req.method !== 'GET') {
    return res.status(503).json({ error: 'База данных не подключена' });
  }
  next();
});


// GET /api/tasks - получение задач из базы данных
app.get('/api/tasks', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const currentUser = (req as any).currentUser;
    const todoRepository = AppDataSource.getRepository(Todo);

    // Если есть текущий пользователь - возвращаем только его задачи
    // Иначе - возвращаем пустой массив (новые пользователи всегда начинают с пустого списка)
    let whereCondition: any;
    if (currentUser) {
      whereCondition = { userId: currentUser.id };
    } else {
      return res.json([]);
    }

    const todos = await todoRepository.find({
      where: whereCondition,
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

// GET /api/todos - получение всех задач (с фильтрацией по userId или текущему пользователю)
app.get('/api/todos', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const currentUser = (req as any).currentUser;

    const todoRepository = AppDataSource.getRepository(Todo);

    // Если передан userId - фильтруем по нему
    // Если есть текущий пользователь - фильтруем по его ID
    // Иначе - возвращаем пустой массив (новые пользователи всегда начинают с пустого списка)
    let whereCondition: any;
    if (userId) {
      whereCondition = { userId };
    } else if (currentUser) {
      whereCondition = { userId: currentUser.id };
    } else {
      // Для анонимных пользователей возвращаем пустой массив
      return res.json([]);
    }

    const todos = await todoRepository.find({
      where: whereCondition,
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
    // Используем userId из тела запроса или из текущего пользователя (из заголовка)
    todo.userId = userId || ((req as any).currentUser?.id);

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
    console.log('Получение списка пользователей');
    if (!dbInitialized) {
      console.log('БД не инициализирована');
      return res.status(503).json({ error: 'База данных не подключена' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      order: { createdAt: 'DESC' }
    });

    console.log(`Найдено ${users.length} пользователей`);

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

// Fallback роут для React Router
app.get('*', (req, res) => {
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
    res.status(404).json({ 
      message: 'Backend API сервер',
      info: 'В режиме разработки фронтенд работает отдельно на порту 3001',
      frontendUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:3000/api',
      testApi: 'http://localhost:3000/api'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
