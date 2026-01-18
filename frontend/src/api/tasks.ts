import { Task } from "../types/task";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) {
    throw new Error(`Ошибка запроса задач: ${res.status}`);
  }
  return res.json();
}