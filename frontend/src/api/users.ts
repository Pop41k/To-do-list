const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface User {
  id: string;
  email: string;
}

export async function createOrGetUser(email: string): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }));
    throw new Error(error.error || `Ошибка сохранения пользователя: ${res.status}`);
  }
  
  return res.json();
}

