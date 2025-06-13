import { users, tasks, type User, type InsertUser, type Task, type InsertTask, type UpdateTask } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, userId: number, updates: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<boolean>;
  getTask(id: number, userId: number): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        status: taskData.status || "pending",
        priority: taskData.priority || "P3",
        assignee: taskData.assignee || null,
        dueDate: taskData.dueDate || null,
      })
      .returning();
    return task;
  }

  async updateTask(id: number, userId: number, updates: UpdateTask): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updatedTask || updatedTask.userId !== userId) {
      return undefined;
    }
    
    return updatedTask;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const task = await this.getTask(id, userId);
    if (!task) return false;
    
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async getTask(id: number, userId: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task || task.userId !== userId) {
      return undefined;
    }
    return task;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...taskData,
      id,
      status: taskData.status || "pending",
      priority: taskData.priority || "P3",
      assignee: taskData.assignee || null,
      dueDate: taskData.dueDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, userId: number, updates: UpdateTask): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return false;
    }
    return this.tasks.delete(id);
  }

  async getTask(id: number, userId: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return undefined;
    }
    return task;
  }
}

export const storage = new DatabaseStorage();
