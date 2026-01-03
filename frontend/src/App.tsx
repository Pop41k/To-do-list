/**
 * Главный компонент приложения
 * 
 * Настраивает маршрутизацию приложения с помощью React Router.
 * Определяет все доступные маршруты и соответствующие им компоненты страниц.
 */

// Импорт React для создания компонентов
import React from 'react';
// Импорт компонентов маршрутизации из react-router-dom
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Импорт компонентов страниц
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
// Импорт стилей для главного компонента
import './App.css';

/**
 * Компонент App - корневой компонент приложения
 * Оборачивает все маршруты в Router и определяет структуру навигации
 * 
 * @returns JSX элемент с маршрутизацией приложения
 */
function App() {
  return (
    // BrowserRouter обеспечивает клиентскую маршрутизацию (HTML5 History API)
    <Router>
      {/* Routes содержит все маршруты приложения */}
      <Routes>
        {/* Главная страница - отображается при переходе на корневой путь */}
        <Route path="/" element={<HomePage />} />
        {/* Страница с задачами - отображается при переходе на /tasks */}
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </Router>
  );
}

export default App;

