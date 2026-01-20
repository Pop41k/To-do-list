import { Task } from "../types/task";
import { getUserEmail } from "../utils/email";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Создает заголовки для API запросов, включая email пользователя
 */
function createHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  const userEmail = getUserEmail();
  if (userEmail) {
    headers['X-User-Email'] = userEmail;
  }

  return headers;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: createHeaders()
  });
  if (!res.ok) {
    throw new Error(`Ошибка запроса задач: ${res.status}`);
  }
  return res.json();
}

export async function createTask(title: string): Promise<Task> {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ text: title })
  });
  if (!res.ok) {
    throw new Error(`Ошибка создания задачи: ${res.status}`);
  }
  const todo = await res.json();
  // Преобразуем формат из БД (text) в формат фронтенда (title)
  return {
    id: todo.id,
    title: todo.text,
    completed: todo.completed
  };
}

export async function updateTask(id: string, completed: boolean): Promise<Task> {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: createHeaders(),
    body: JSON.stringify({ completed })
  });
  if (!res.ok) {
    throw new Error(`Ошибка обновления задачи: ${res.status}`);
  }
  const todo = await res.json();
  // Преобразуем формат из БД (text) в формат фронтенда (title)
  return {
    id: todo.id,
    title: todo.text,
    completed: todo.completed
  };
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: createHeaders()
  });
  if (!res.ok) {
    throw new Error(`Ошибка удаления задачи: ${res.status}`);
  }
}