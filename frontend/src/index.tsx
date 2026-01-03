/**
 * Точка входа в React приложение
 * 
 * Этот файл выполняет инициализацию React приложения:
 * - Получает корневой DOM элемент
 * - Создает корень React (React 18+ API)
 * - Рендерит главный компонент App в DOM
 * - Включает StrictMode для дополнительных проверок в development режиме
 */

// Импорт React для использования JSX и возможностей библиотеки
import React from 'react';
// Импорт ReactDOM для рендеринга компонентов в DOM (React 18+ API)
import ReactDOM from 'react-dom/client';
// Импорт глобальных стилей приложения
import './index.css';
// Импорт главного компонента приложения
import App from './App';

/**
 * Получение корневого DOM элемента и создание корня React
 * Корневой элемент определен в public/index.html с id="root"
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

/**
 * Рендеринг главного компонента App в корневой DOM элемент
 * StrictMode включает дополнительные проверки и предупреждения в development режиме:
 * - Обнаружение устаревших API
 * - Предупреждения о небезопасных жизненных циклах
 * - Детектирование побочных эффектов
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
