export type Priority = 'haute' | 'moyenne' | 'basse';
export type Category = 'travail' | 'perso' | 'courses' | 'autre';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'priority' | 'category'>;

export interface User {
  name: string;
}
