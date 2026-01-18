/**
 * Сущность Todo (Задача)
 * Определяет структуру таблицы задач в базе данных
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  text!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ nullable: true })
  userId?: string;

  // Связь с пользователем (опционально)
  // При удалении пользователя удаляются и его задачи
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
