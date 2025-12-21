import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TodoPage.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
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
        loadTodos();
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
        loadTodos();
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
        }),
      });

      if (response.ok) {
        setNewTaskText('');
        setShowCreateForm(false);
        loadTodos();
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

  return (
    <div className="todo-page">
      <div className="section todo-section">
        <h1 className="section-title">to-do list</h1>
        <h2 className="app-name">Chaos Manager</h2>

        <div className="todo-list-box">
          {loading && todos.length === 0 ? (
            <div className="empty-state">Загрузка...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">Нет задач. Создайте первую задачу!</div>
          ) : (
            todos.map((todo: Todo) => (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
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

        <div className="back-link">
          <Link to="/">← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
