/**
 * Главный файл сервера приложения
 * 
 * Этот файл настраивает Express сервер, инициализирует подключение к базе данных,
 * определяет API endpoints для работы с задачами (todos) и пользователями,
 * а также обрабатывает статические файлы фронтенда.
 */

// Импорт метаданных для декораторов TypeORM
import 'reflect-metadata';
// Импорт Express фреймворка для создания REST API сервера
import express from 'express';
// Импорт CORS middleware для разрешения cross-origin запросов
import cors from 'cors';
// Импорт источника данных TypeORM для работы с базой данных
import { AppDataSource } from './data-source';
// Импорт оператора IsNull для поиска записей с null значениями
import { IsNull } from 'typeorm';
// Импорт сущностей Todo и User для работы с данными
import { Todo } from './entity/Todo';
import { User } from './entity/User';
// Импорт библиотеки для хеширования паролей
import * as bcrypt from 'bcryptjs';
// Импорт модуля path для работы с путями файловой системы
import * as path from 'path';
// Импорт модуля fs для проверки существования файлов
import * as fs from 'fs';

// Создание экземпляра Express приложения
const app = express();
// Получение порта из переменных окружения или использование порта по умолчанию 3000
const PORT = process.env.PORT || 3000;

// Настройка middleware
// Включение CORS для разрешения запросов с других доменов
app.use(cors());
// Парсинг JSON тел запросов
app.use(express.json());

// Обслуживание статических файлов из папки сборки фронтенда (только если папка существует)
// В режиме разработки фронтенд запускается отдельно, поэтому эта папка может отсутствовать
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// Инициализация подключения к базе данных
// При успешном подключении выводится сообщение в консоль
AppDataSource.initialize()
  .then(() => {
    console.log('База данных подключена');
  })
  .catch((error) => {
    console.error('Ошибка подключения к базе данных:', error);
  });

/**
 * Mock данные для задач (временное решение для тестирования)
 * Эти данные используются эндпоинтом /api/tasks
 */
const mockTasks = [
  {
    id: 1,
    title: 'Первая задача',
    description: 'Описание',
    completed: false
  },
  {
    id: 2,
    title: 'Вторая задача',
    description: 'Описание второй задачи',
    completed: false
  },
  {
    id: 3,
    title: 'Третья задача',
    description: 'Описание третьей задачи',
    completed: true
  }
];

/**
 * GET /api/tasks
 * Получение всех задач (mock данные)
 * Возвращает массив тестовых задач для проверки работы API
 */
app.get('/api/tasks', (req, res) => {
  res.json(mockTasks);
});

/**
 * GET /api/todos
 * Получение всех задач из базы данных
 * Поддерживает фильтрацию по userId через query параметр
 * Если userId не указан, возвращаются задачи без привязки к пользователю
 * Результаты отсортированы по дате создания (новые первыми)
 */
app.get('/api/todos', async (req, res) => {
  try {
    // Получение userId из query параметров (опционально)
    const userId = req.query.userId as string | undefined;
    // Получение репозитория для работы с сущностью Todo
    const todoRepository = AppDataSource.getRepository(Todo);
    
    // Поиск задач с учетом фильтра по userId
    // Если userId указан, фильтруем по нему, иначе берем задачи без userId (null)
    // Используем оператор IsNull() для корректного поиска записей с null значениями
    const todos = await todoRepository.find({
      where: userId ? { userId } : { userId: IsNull() },
      order: { createdAt: 'DESC' } // Сортировка по убыванию даты создания
    });
    
    // Возврат найденных задач в формате JSON
    res.json(todos);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/todos
 * Создание новой задачи
 * Принимает text (обязательно) и userId (опционально) в теле запроса
 * Создает новую задачу со статусом completed = false
 * Возвращает созданную задачу со статусом 201
 */
app.post('/api/todos', async (req, res) => {
  try {
    // Извлечение данных из тела запроса
    const { text, userId } = req.body;
    
    // Валидация: проверка наличия текста задачи
    if (!text) {
      return res.status(400).json({ error: 'Текст задачи обязателен' });
    }

    // Получение репозитория для работы с сущностью Todo
    const todoRepository = AppDataSource.getRepository(Todo);
    // Создание нового экземпляра задачи
    const todo = new Todo();
    todo.text = text;
    todo.completed = false; // Новая задача всегда не выполнена
    todo.userId = userId || undefined; // Привязка к пользователю, если указан

    // Сохранение задачи в базу данных
    const savedTodo = await todoRepository.save(todo);
    // Возврат созданной задачи со статусом 201 (Created)
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PATCH /api/todos/:id
 * Обновление существующей задачи
 * Принимает id задачи в URL параметрах
 * Поддерживает частичное обновление полей text и completed
 * Возвращает обновленную задачу или ошибку 404, если задача не найдена
 */
app.patch('/api/todos/:id', async (req, res) => {
  try {
    // Извлечение id задачи из URL параметров
    const { id } = req.params;
    // Получение данных для обновления из тела запроса
    const updates = req.body;

    // Получение репозитория для работы с сущностью Todo
    const todoRepository = AppDataSource.getRepository(Todo);
    // Поиск задачи по id
    const todo = await todoRepository.findOne({ where: { id } });
    
    // Проверка существования задачи
    if (!todo) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    // Частичное обновление полей (только если они указаны в запросе)
    if (updates.text !== undefined) todo.text = updates.text;
    if (updates.completed !== undefined) todo.completed = updates.completed;

    // Сохранение обновленной задачи в базу данных
    const updatedTodo = await todoRepository.save(todo);
    // Возврат обновленной задачи
    res.json(updatedTodo);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/todos/:id
 * Удаление задачи по id
 * Принимает id задачи в URL параметрах
 * Возвращает статус 204 (No Content) при успешном удалении
 * Возвращает ошибку 404, если задача не найдена
 */
app.delete('/api/todos/:id', async (req, res) => {
  try {
    // Извлечение id задачи из URL параметров
    const { id } = req.params;
    // Получение репозитория для работы с сущностью Todo
    const todoRepository = AppDataSource.getRepository(Todo);
    
    // Удаление задачи из базы данных
    const result = await todoRepository.delete(id);
    
    // Проверка, была ли задача найдена и удалена
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    // Возврат статуса 204 (No Content) при успешном удалении
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/auth/register
 * Регистрация нового пользователя
 * Принимает email и password в теле запроса
 * Проверяет уникальность email
 * Хеширует пароль перед сохранением в базу данных
 * Возвращает id и email созданного пользователя (без пароля)
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    // Извлечение данных из тела запроса
    const { email, password } = req.body;

    // Валидация: проверка наличия обязательных полей
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Получение репозитория для работы с сущностью User
    const userRepository = AppDataSource.getRepository(User);
    // Проверка, существует ли пользователь с таким email
    const existingUser = await userRepository.findOne({ where: { email } });
    
    // Если пользователь уже существует, возвращаем ошибку
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля с использованием bcrypt (10 раундов хеширования)
    const hashedPassword = await bcrypt.hash(password, 10);
    // Создание нового экземпляра пользователя
    const user = new User();
    user.email = email;
    user.password = hashedPassword; // Сохранение хешированного пароля

    // Сохранение пользователя в базу данных
    const savedUser = await userRepository.save(user);
    // Возврат данных пользователя без пароля (безопасность)
    res.status(201).json({ id: savedUser.id, email: savedUser.email });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/auth/login
 * Аутентификация пользователя
 * Принимает email и password в теле запроса
 * Проверяет существование пользователя и корректность пароля
 * Возвращает id и email пользователя при успешной аутентификации
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    // Извлечение данных из тела запроса
    const { email, password } = req.body;

    // Валидация: проверка наличия обязательных полей
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Получение репозитория для работы с сущностью User
    const userRepository = AppDataSource.getRepository(User);
    // Поиск пользователя по email
    const user = await userRepository.findOne({ where: { email } });
    
    // Если пользователь не найден, возвращаем ошибку аутентификации
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сравнение введенного пароля с хешем из базы данных
    const isValidPassword = await bcrypt.compare(password, user.password);
    // Если пароль неверный, возвращаем ошибку аутентификации
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // При успешной аутентификации возвращаем данные пользователя (без пароля)
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET *
 * Fallback роут для React Router
 * Обрабатывает все GET запросы, которые не соответствуют API endpoints
 * Отдает index.html из папки сборки фронтенда для поддержки клиентской маршрутизации
 * Работает только если папка frontend/build существует (production режим)
 * В режиме разработки пропускает запросы, так как фронтенд работает отдельно
 */
app.get('*', (req, res) => {
  // Пропускаем API запросы (они обрабатываются выше)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint не найден' });
  }
  
  const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    // В production режиме отдаем index.html для поддержки React Router
    res.sendFile(indexHtmlPath);
  } else {
    // В режиме разработки возвращаем информативное сообщение с инструкцией
    res.status(404).json({ 
      message: 'Backend API сервер',
      info: 'В режиме разработки фронтенд работает отдельно на порту 3001',
      frontendUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:3000/api',
      note: 'Откройте фронтенд по адресу http://localhost:3001'
    });
  }
});

/**
 * Запуск сервера на указанном порту
 * После успешного запуска выводит сообщение с адресом сервера
 */
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
