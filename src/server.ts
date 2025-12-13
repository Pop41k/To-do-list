import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { Todo } from './entity/Todo';
import { User } from './entity/User';
import * as bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend/build'));

// Инициализация базы данных
AppDataSource.initialize()
  .then(() => {
    console.log('База данных подключена');
  })
  .catch((error) => {
    console.error('Ошибка подключения к базе данных:', error);
  });

// Получить все задачи
app.get('/api/todos', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const todoRepository = AppDataSource.getRepository(Todo);
    
    const todos = await todoRepository.find({
      where: userId ? { userId } : { userId: null },
      order: { createdAt: 'DESC' }
    });
    
    res.json(todos);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать задачу
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

// Обновить задачу
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({ where: { id } });
    
    if (!todo) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    if (updates.text !== undefined) todo.text = updates.text;
    if (updates.completed !== undefined) todo.completed = updates.completed;

    const updatedTodo = await todoRepository.save(todo);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить задачу
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

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.password = hashedPassword;

    const savedUser = await userRepository.save(user);
    res.status(201).json({ id: savedUser.id, email: savedUser.email });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Fallback для React Router
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'frontend/build' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
