// Storage implementation for Replit Auth integration
// Referenced from javascript_log_in_with_replit and javascript_database blueprints

import {
  users,
  apiUsage,
  systemLogs,
  type User,
  type UpsertUser,
  type ApiUsage,
  type SystemLog,
  type InsertApiUsage,
  type InsertSystemLog,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from 'crypto';

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations for Perrett & Associates
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserRole(userId: string, role: string, permissions: string[]): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  
  // API usage tracking
  logApiUsage(usage: InsertApiUsage): Promise<void>;
  getApiUsage(userId: string, endpoint?: string): Promise<ApiUsage[]>;
  
  // System logging for security
  logSystemEvent(log: InsertSystemLog): Promise<void>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  
  // Security operations
  hashApiKey(apiKey: string): string;
  verifyApiKey(apiKey: string, hash: string): boolean;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Additional user operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserRole(userId: string, role: string, permissions: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  // API usage tracking
  async logApiUsage(usage: InsertApiUsage): Promise<void> {
    await db.insert(apiUsage).values(usage);
  }

  async getApiUsage(userId: string, endpoint?: string): Promise<ApiUsage[]> {
    const conditions = [eq(apiUsage.userId, userId)];
    if (endpoint) {
      conditions.push(eq(apiUsage.apiEndpoint, endpoint));
    }
    
    return await db
      .select()
      .from(apiUsage)
      .where(and(...conditions))
      .orderBy(desc(apiUsage.lastRequestAt));
  }

  // System logging
  async logSystemEvent(log: InsertSystemLog): Promise<void> {
    await db.insert(systemLogs).values(log);
  }

  async getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  // Security operations
  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  verifyApiKey(apiKey: string, hash: string): boolean {
    return this.hashApiKey(apiKey) === hash;
  }
}

export const storage = new DatabaseStorage();