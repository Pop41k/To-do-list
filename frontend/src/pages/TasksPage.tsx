/**
 * Компонент страницы задач (TasksPage)
 * 
 * Отображает список задач, полученных с сервера через API endpoint /api/tasks.
 * Поддерживает состояния загрузки и ошибки, отображает данные в формате JSON.
 */

// Импорт React и хуков для управления состоянием и побочными эффектами
import React, { useState, useEffect } from 'react';
// Импорт стилей для страницы задач
import './TasksPage.css';

/**
 * Интерфейс Task определяет структуру объекта задачи
 */
interface Task {
  id: number;           // Уникальный идентификатор задачи
  title: string;        // Заголовок задачи
  description: string;  // Описание задачи
  completed: boolean;   // Статус выполнения задачи
}

/**
 * Базовый URL API сервера
 * Используется переменная окружения REACT_APP_API_URL или значение по умолчанию
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Функциональный компонент TasksPage
 * Загружает и отображает список задач с сервера
 * 
 * @returns JSX элемент страницы задач
 */
const TasksPage: React.FC = () => {
  // Состояние для хранения списка задач
  const [tasks, setTasks] = useState<Task[]>([]);
  // Состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для хранения сообщения об ошибке (если возникла)
  const [error, setError] = useState<string | null>(null);

  /**
   * Эффект для загрузки задач при монтировании компонента
   * Выполняется один раз при первом рендере компонента
   */
  useEffect(() => {
    loadTasks();
  }, []); // Пустой массив зависимостей означает выполнение только при монтировании

  /**
   * Асинхронная функция для загрузки задач с сервера
   * Выполняет GET запрос к API endpoint /api/tasks
   * Обновляет состояние tasks, loading и error в зависимости от результата
   */
  const loadTasks = async () => {
    try {
      // Установка состояния загрузки в true и очистка предыдущих ошибок
      setLoading(true);
      setError(null);
      // Выполнение GET запроса к API
      const response = await fetch(`${API_URL}/tasks`);
      // Проверка успешности ответа (статус 200-299)
      if (!response.ok) {
        throw new Error('Ошибка загрузки задач');
      }
      // Парсинг JSON ответа
      const data = await response.json();
      // Обновление состояния tasks загруженными данными
      setTasks(data);
    } catch (err) {
      // Обработка ошибок: логирование в консоль и установка сообщения об ошибке
      console.error('Ошибка загрузки задач:', err);
      setError('Не удалось загрузить задачи');
    } finally {
      // Установка состояния загрузки в false в любом случае (успех или ошибка)
      setLoading(false);
    }
  };

  /**
   * Рендеринг состояния загрузки
   * Отображается пока данные загружаются с сервера
   */
  if (loading) {
    return (
      <div className="tasks-page">
        <div className="section tasks-section">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  /**
   * Рендеринг состояния ошибки
   * Отображается если произошла ошибка при загрузке данных
   */
  if (error) {
    return (
      <div className="tasks-page">
        <div className="section tasks-section">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Рендеринг списка задач
   * Отображает задачи в формате JSON с красивым форматированием
   */
  return (
    <div className="tasks-page">
      <div className="section tasks-section">
        {/* Отображение задач в формате JSON с отступами для читаемости */}
        <pre>{JSON.stringify(tasks, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TasksPage;

