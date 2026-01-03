/**
 * Компонент страницы To-Do списка (TodoPage)
 * 
 * Главный компонент для управления задачами. Предоставляет функционал:
 * - Просмотр списка задач
 * - Создание новых задач
 * - Отметка задач как выполненных/невыполненных
 * - Удаление задач
 * 
 * Взаимодействует с API через endpoints /api/todos
 */

// Импорт React и хуков для управления состоянием и побочными эффектами
import React, { useState, useEffect } from 'react';
// Импорт Link из react-router-dom для навигации
import { Link } from 'react-router-dom';
// Импорт стилей для страницы To-Do списка
import './TodoPage.css';

/**
 * Интерфейс Todo определяет структуру объекта задачи
 */
interface Todo {
  id: string;           // Уникальный идентификатор задачи (UUID)
  text: string;         // Текст задачи
  completed: boolean;   // Статус выполнения задачи
  createdAt: string;    // Дата и время создания задачи
  updatedAt: string;    // Дата и время последнего обновления задачи
}

/**
 * Базовый URL API сервера
 * Используется переменная окружения REACT_APP_API_URL или значение по умолчанию
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Функциональный компонент TodoPage
 * Управляет состоянием задач и предоставляет UI для CRUD операций
 * 
 * @returns JSX элемент страницы To-Do списка
 */
const TodoPage: React.FC = () => {
  // Состояние для хранения списка задач
  const [todos, setTodos] = useState<Todo[]>([]);
  // Состояние для управления видимостью формы создания задачи
  const [showCreateForm, setShowCreateForm] = useState(false);
  // Состояние для хранения текста новой задачи в форме создания
  const [newTaskText, setNewTaskText] = useState('');
  // Состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = useState(false);

  /**
   * Эффект для загрузки задач при монтировании компонента
   * Выполняется один раз при первом рендере компонента
   */
  useEffect(() => {
    loadTodos();
  }, []); // Пустой массив зависимостей означает выполнение только при монтировании

  /**
   * Асинхронная функция для загрузки задач с сервера
   * Выполняет GET запрос к API endpoint /api/todos
   * Обновляет состояние todos и loading в зависимости от результата
   */
  const loadTodos = async () => {
    try {
      // Установка состояния загрузки в true
      setLoading(true);
      // Выполнение GET запроса к API
      const response = await fetch(`${API_URL}/todos`);
      // Парсинг JSON ответа
      const data = await response.json();
      // Обновление состояния todos загруженными данными
      setTodos(data);
    } catch (error) {
      // Обработка ошибок: логирование в консоль
      console.error('Ошибка загрузки задач:', error);
    } finally {
      // Установка состояния загрузки в false в любом случае
      setLoading(false);
    }
  };

  /**
   * Обработчик переключения статуса выполнения задачи
   * Выполняет PATCH запрос для обновления статуса completed задачи
   * 
   * @param id - идентификатор задачи
   * @param completed - текущий статус выполнения задачи
   */
  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      // Выполнение PATCH запроса для обновления статуса задачи
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Переключение статуса на противоположный
        body: JSON.stringify({ completed: !completed }),
      });

      // Если запрос успешен, перезагружаем список задач
      if (response.ok) {
        loadTodos();
      }
    } catch (error) {
      // Обработка ошибок: логирование в консоль
      console.error('Ошибка обновления задачи:', error);
    }
  };

  /**
   * Обработчик удаления задачи
   * Показывает подтверждение перед удалением
   * Выполняет DELETE запрос для удаления задачи
   * 
   * @param id - идентификатор задачи для удаления
   */
  const handleDeleteTodo = async (id: string) => {
    // Запрос подтверждения от пользователя
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return; // Если пользователь отменил, прерываем выполнение
    }

    try {
      // Выполнение DELETE запроса для удаления задачи
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      // Если запрос успешен, перезагружаем список задач
      if (response.ok) {
        loadTodos();
      }
    } catch (error) {
      // Обработка ошибок: логирование в консоль
      console.error('Ошибка удаления задачи:', error);
    }
  };

  /**
   * Обработчик создания новой задачи
   * Выполняет POST запрос для создания новой задачи
   * Валидирует введенный текст перед отправкой
   * 
   * @param e - событие формы
   */
  const handleCreateTask = async (e: React.FormEvent) => {
    // Предотвращение стандартного поведения формы (перезагрузка страницы)
    e.preventDefault();
    // Валидация: проверка наличия непустого текста
    if (!newTaskText.trim()) {
      alert('Пожалуйста, введите текст задачи');
      return;
    }

    try {
      // Установка состояния загрузки в true
      setLoading(true);
      // Выполнение POST запроса для создания новой задачи
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Отправка текста задачи в теле запроса
        body: JSON.stringify({
          text: newTaskText,
        }),
      });

      // Если запрос успешен, очищаем форму и перезагружаем список
      if (response.ok) {
        setNewTaskText(''); // Очистка поля ввода
        setShowCreateForm(false); // Скрытие формы создания
        loadTodos(); // Перезагрузка списка задач
      } else {
        // Если запрос неуспешен, показываем ошибку
        alert('Ошибка создания задачи');
      }
    } catch (error) {
      // Обработка ошибок: логирование и показ сообщения пользователю
      console.error('Ошибка создания задачи:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      // Установка состояния загрузки в false в любом случае
      setLoading(false);
    }
  };

  /**
   * Рендеринг компонента TodoPage
   * Отображает список задач, форму создания и навигацию
   */
  return (
    <div className="todo-page">
      <div className="section todo-section">
        {/* Заголовок страницы */}
        <h1 className="section-title">to-do list</h1>
        <h2 className="app-name">Chaos Manager</h2>

        {/* Контейнер со списком задач */}
        <div className="todo-list-box">
          {/* Условный рендеринг в зависимости от состояния загрузки и наличия задач */}
          {loading && todos.length === 0 ? (
            // Отображение индикатора загрузки при первой загрузке
            <div className="empty-state">Загрузка...</div>
          ) : todos.length === 0 ? (
            // Отображение сообщения, если задач нет
            <div className="empty-state">Нет задач. Создайте первую задачу!</div>
          ) : (
            // Отображение списка задач
            todos.map((todo: Todo) => (
              <div key={todo.id} className={`todo-list-item ${todo.completed ? 'completed' : ''}`}>
                {/* Чекбокс для переключения статуса выполнения */}
                <input
                  type="checkbox"
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                />
                {/* Текст задачи с привязкой к чекбоксу через label */}
                <label htmlFor={`todo-${todo.id}`}>{todo.text}</label>
                {/* Кнопка удаления задачи */}
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

        {/* Кнопка для открытия/закрытия формы создания задачи */}
        <button
          className="purple-button create-task-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Создать задачу
        </button>

        {/* Условный рендеринг формы создания задачи */}
        {showCreateForm && (
          <form className="create-task-form" onSubmit={handleCreateTask}>
            {/* Поле ввода текста новой задачи */}
            <input
              type="text"
              placeholder="Введите текст задачи"
              value={newTaskText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
            {/* Контейнер с кнопками формы */}
            <div className="form-buttons">
              {/* Кнопка отправки формы (создание задачи) */}
              <button type="submit" className="purple-button" disabled={loading}>
                {loading ? 'Создание...' : 'Создать'}
              </button>
              {/* Кнопка отмены (закрытие формы и очистка поля ввода) */}
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

        {/* Ссылка для возврата на главную страницу */}
        <div className="back-link">
          <Link to="/">← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
