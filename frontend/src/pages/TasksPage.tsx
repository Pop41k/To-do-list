/**
 * Компонент страницы задач
 * Отображает список задач, полученных с сервера через API
 */

import React, { useState, useEffect } from 'react';
import './TasksPage.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/tasks`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки задач');
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      setError('Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="section tasks-section">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <div className="section tasks-section">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="section tasks-section">
        <pre>{JSON.stringify(tasks, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TasksPage;

