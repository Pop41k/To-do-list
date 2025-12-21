import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Todo } from './entity/Todo';
import * as path from 'path';

// Путь к файлу базы данных в папке database
const dbPath = path.join(__dirname, '..', 'database', 'chaos_manager.db');

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: dbPath,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Todo],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
});
