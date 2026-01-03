/**
 * TypeScript декларации для React приложения
 * 
 * Этот файл содержит TypeScript определения типов для переменных окружения
 * и других глобальных объектов, используемых в React приложении.
 */

// Ссылка на типы из react-scripts для поддержки всех типов Create React App
/// <reference types="react-scripts" />

/**
 * Расширение интерфейса ProcessEnv для типизации переменных окружения
 * Определяет доступные переменные окружения, которые можно использовать в приложении
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * URL API сервера (опционально)
     * Используется для подключения к backend API
     * Если не установлен, используется значение по умолчанию в коде
     */
    readonly REACT_APP_API_URL?: string;
    /**
     * Режим работы приложения
     * - development: режим разработки
     * - production: production режим
     * - test: режим тестирования
     */
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

/**
 * Глобальное объявление объекта process для использования в браузере
 * Позволяет TypeScript понимать, что process.env доступен в коде
 */
declare var process: {
  env: NodeJS.ProcessEnv;
};
