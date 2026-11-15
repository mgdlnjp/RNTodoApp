import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User } from '../types';

const USER_KEY = '@opla/user';
const TASKS_KEY = '@opla/tasks';

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.warn(`[storage] lecture de ${key} impossible`, e);
    return null;
  }
}

async function write(key: string, value: unknown) {
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] écriture de ${key} impossible`, e);
  }
}

export const loadUser = () => read<User>(USER_KEY);
export const saveUser = (user: User | null) => write(USER_KEY, user);
export const loadTasks = async () => (await read<Task[]>(TASKS_KEY)) ?? [];
export const saveTasks = (tasks: Task[]) => write(TASKS_KEY, tasks);
