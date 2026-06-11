import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type TaskCategory = "personal" | "work" | "health" | "creative";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  createdAt: string;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (title: string, category: TaskCategory) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  todayTasks: Task[];
  completedCount: number;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const STORAGE_KEY = "@calm_tasks";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const DEFAULT_TASKS: Task[] = [
  {
    id: generateId(),
    title: "Morning meditation (10 min)",
    completed: false,
    category: "health",
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: "Journal 3 gratitudes",
    completed: false,
    category: "personal",
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: "Drink 8 glasses of water",
    completed: false,
    category: "health",
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: "Read for 20 minutes",
    completed: false,
    category: "personal",
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: "Evening walk",
    completed: false,
    category: "health",
    createdAt: new Date().toISOString(),
  },
];

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(DEFAULT_TASKS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
      }
    } catch {
      setTasks(DEFAULT_TASKS);
    }
  };

  const saveTasks = async (updated: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const addTask = (title: string, category: TaskCategory) => {
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      category,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const todayTasks = tasks.slice(0, 5);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        todayTasks,
        completedCount,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
