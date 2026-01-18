/**
 * Конфигурация источника данных TypeORM
 * 
 * Этот файл настраивает подключение к базе данных SQLite,
 * определяет используемые сущности, миграции и подписчиков,
 * а также настраивает синхронизацию схемы и логирование в зависимости от окружения.
 */

// Импорт DataSource из TypeORM для создания подключения к базе данных
import { DataSource } from 'typeorm';
// Импорт сущностей User и Todo для регистрации в TypeORM
import { User } from './entity/User';
import { Todo } from './entity/Todo';
// Импорт модуля path для работы с путями файловой системы
import * as path from 'path';

/**
 * Формирование пути к файлу базы данных SQLite
 * База данных сохраняется в папке database в корне проекта
 */
const dbPath = path.join(__dirname, '..', 'database', 'chaos_manager.db');

/**
 * Экспортируемый источник данных TypeORM
 * Настраивает подключение к базе данных и параметры работы ORM
 */
export const AppDataSource = new DataSource({
  // Тип базы данных: better-sqlite3 (SQLite с улучшенной производительностью)
  type: 'better-sqlite3',
  // Путь к файлу базы данных
  database: dbPath,
  // Синхронизация схемы БД с сущностями (включена только в development режиме)
  // В production используется только через миграции для безопасности
  synchronize: process.env.NODE_ENV !== 'production',
  // Логирование SQL запросов (включено только в development режиме)
  logging: process.env.NODE_ENV === 'development',
  // Массив сущностей, которые будут использоваться в приложении
  entities: [User, Todo],
  // Путь к файлам миграций (для управления изменениями схемы БД)
  migrations: ['src/migration/**/*.ts'],
  // Путь к подписчикам (для обработки событий БД)
  subscribers: ['src/subscriber/**/*.ts'],
});
