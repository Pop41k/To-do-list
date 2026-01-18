/**
 * Сущность User (Пользователь)
 * Определяет структуру таблицы пользователей в базе данных
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Todo } from './Todo';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Связь один-ко-многим с задачами
  @OneToMany(() => Todo, (todo) => todo.user)
  todos!: Todo[];
}
