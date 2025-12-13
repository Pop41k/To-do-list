import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TodoPage.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setShowLogin(false);
      loadTodos(userData.id);
    }
  }, []);

  const loadTodos = async (userId?: string) => {
    try {
      setLoading(true);
      const url = userId ? `${API_URL}/todos?userId=${userId}` : `${API_URL}/todos`;
      const response = await fetch(url);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setShowLogin(false);
        setEmail('');
        setPassword('');
        loadTodos(userData.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setShowLogin(false);
        setEmail('');
        setPassword('');
        loadTodos(userData.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        loadTodos(user?.id);
      }
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTodos(user?.id);
      }
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      alert('Пожалуйста, введите текст задачи');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newTaskText,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        setNewTaskText('');
        setShowCreateForm(false);
        loadTodos(user?.id);
      } else {
        alert('Ошибка создания задачи');
      }
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setShowLogin(true);
    setShowRegister(false);
    setTodos([]);
  };

  return (
    <div className="todo-page">
      <div className="section todo-section">
        <h1 className="section-title">to-do list (если есть аккаунт)</h1>
        <h2 className="app-name">Chaos Manager</h2>

        {!user ? (
          <div className="auth-section">
            {showLogin && (
              <form className="auth-form" onSubmit={handleLogin}>
                <h3>Вход в аккаунт</h3>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button type="submit" className="purple-button" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </button>
                <p>
                  Нет аккаунта?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(false); setShowRegister(true); }}>
                    Зарегистрироваться
                  </a>
                </p>
              </form>
            )}

            {showRegister && (
              <form className="auth-form" onSubmit={handleRegister}>
                <h3>Регистрация</h3>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button type="submit" className="purple-button" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
                <p>
                  Уже есть аккаунт?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); setShowRegister(false); }}>
                    Войти
                  </a>
                </p>
              </form>
            )}
          </div>
        ) : (
          <>
            <div className="user-info">
              <p>Вы вошли как: <strong>{user?.email}</strong></p>
              <button onClick={handleLogout} className="logout-button">
                Выйти
              </button>
            </div>

            <div className="todo-list-box">
              {loading && todos.length === 0 ? (
                <div className="empty-state">Загрузка...</div>
              ) : todos.length === 0 ? (
                <div className="empty-state">Нет задач. Создайте первую задачу!</div>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className={`todo-list-item ${todo.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    />
                    <label htmlFor={`todo-${todo.id}`}>{todo.text}</label>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              className="purple-button create-task-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              Создать задачу
            </button>

            {showCreateForm && (
              <form className="create-task-form" onSubmit={handleCreateTask}>
                <input
                  type="text"
                  placeholder="Введите текст задачи"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
                <div className="form-buttons">
                  <button type="submit" className="purple-button" disabled={loading}>
                    {loading ? 'Создание...' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTaskText('');
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="back-link">
          <Link to="/">← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;

