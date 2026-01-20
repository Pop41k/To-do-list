/**
 * Утилиты для управления email пользователя в localStorage
 */

const EMAIL_STORAGE_KEY = 'chaos_manager_user_email';

/**
 * Сохраняет email пользователя в localStorage
 */
export function saveUserEmail(email: string): void {
  if (email && email.trim()) {
    localStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
  }
}

/**
 * Получает email пользователя из localStorage
 */
export function getUserEmail(): string | null {
  const email = localStorage.getItem(EMAIL_STORAGE_KEY);
  return email && email.trim() ? email : null;
}

/**
 * Удаляет email пользователя из localStorage
 */
export function clearUserEmail(): void {
  localStorage.removeItem(EMAIL_STORAGE_KEY);
}

/**
 * Проверяет, сохранен ли email пользователя
 */
export function hasUserEmail(): boolean {
  return getUserEmail() !== null;
}

