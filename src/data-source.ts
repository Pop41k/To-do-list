/**
 * Конфигурация источника данных TypeORM
 * Настраивает подключение к базе данных SQLite
 */

import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Todo } from './entity/Todo';
import * as path from 'path';

const dbPath = path.join(__dirname, '..', 'database', 'chaos_manager.db');

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: dbPath,
  // Синхронизация схемы только в development (в production используйте миграции)
  synchronize: process.env.NODE_ENV !== 'production',
  // Логирование SQL только в development
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Todo],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
});
