import { Task } from "../types/task";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) {
    throw new Error(`Ошибка запроса задач: ${res.status}`);
  }
  return res.json();
}

export async function createTask(title: string): Promise<Task> {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`Ошибка удаления задачи: ${res.status}`);
  }
}