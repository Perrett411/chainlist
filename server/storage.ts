// Storage implementation for Replit Auth integration
// Referenced from javascript_log_in_with_replit and javascript_database blueprints

import {
  users,
  apiUsage,
  systemLogs,
  portfolios,
  portfolioAssets,
  exchangeConnections,
  priceAlerts,
  marketData,
  portfolioPerformance,
  type User,
  type UpsertUser,
  type ApiUsage,
  type SystemLog,
  type InsertApiUsage,
  type InsertSystemLog,
  type Portfolio,
  type InsertPortfolio,
  type PortfolioAsset,
  type InsertPortfolioAsset,
  type ExchangeConnection,
  type InsertExchangeConnection,
  type PriceAlert,
  type InsertPriceAlert,
  type MarketData,
  type InsertMarketData,
  type PortfolioPerformance,
  type InsertPortfolioPerformance,
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
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserRole(userId: string, role: string, permissions: string[]): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  
  // API usage tracking
  logApiUsage(usage: InsertApiUsage): Promise<void>;
  getApiUsage(userId: string, endpoint?: string): Promise<ApiUsage[]>;
  
  // System logging for security
  logSystemEvent(log: InsertSystemLog): Promise<void>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  
  // Portfolio operations
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(portfolioId: string): Promise<Portfolio | undefined>;
  updatePortfolio(portfolioId: string, updates: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(portfolioId: string): Promise<void>;
  
  // Portfolio asset operations
  addPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset>;
  getPortfolioAssets(portfolioId: string): Promise<PortfolioAsset[]>;
  updatePortfolioAsset(assetId: string, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset>;
  deletePortfolioAsset(assetId: string): Promise<void>;
  
  // Exchange operations
  addExchangeConnection(connection: InsertExchangeConnection): Promise<ExchangeConnection>;
  getExchangeConnections(userId: string): Promise<ExchangeConnection[]>;
  updateExchangeConnection(connectionId: string, updates: Partial<InsertExchangeConnection>): Promise<ExchangeConnection>;
  deleteExchangeConnection(connectionId: string): Promise<void>;
  
  // Price alert operations
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  updatePriceAlert(alertId: string, updates: Partial<InsertPriceAlert>): Promise<PriceAlert>;
  deletePriceAlert(alertId: string): Promise<void>;
  
  // Market data operations
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
  getMarketData(symbols?: string[]): Promise<MarketData[]>;
  getLatestMarketData(symbol: string): Promise<MarketData | undefined>;
  
  // Portfolio performance operations
  recordPortfolioPerformance(performance: InsertPortfolioPerformance): Promise<PortfolioPerformance>;
  getPortfolioPerformance(portfolioId: string, limit?: number): Promise<PortfolioPerformance[]>;
  
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

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
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

  // Portfolio operations
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [createdPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return createdPortfolio;
  }

  async getPortfolios(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, portfolioId));
    return portfolio;
  }

  async updatePortfolio(portfolioId: string, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, portfolioId))
      .returning();
    return updatedPortfolio;
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, portfolioId));
  }

  // Portfolio asset operations
  async addPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const [createdAsset] = await db.insert(portfolioAssets).values(asset).returning();
    return createdAsset;
  }

  async getPortfolioAssets(portfolioId: string): Promise<PortfolioAsset[]> {
    return await db.select().from(portfolioAssets).where(eq(portfolioAssets.portfolioId, portfolioId));
  }

  async updatePortfolioAsset(assetId: string, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset> {
    const [updatedAsset] = await db
      .update(portfolioAssets)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(portfolioAssets.id, assetId))
      .returning();
    return updatedAsset;
  }

  async deletePortfolioAsset(assetId: string): Promise<void> {
    await db.delete(portfolioAssets).where(eq(portfolioAssets.id, assetId));
  }

  // Exchange operations
  async addExchangeConnection(connection: InsertExchangeConnection): Promise<ExchangeConnection> {
    const [createdConnection] = await db.insert(exchangeConnections).values(connection).returning();
    return createdConnection;
  }

  async getExchangeConnections(userId: string): Promise<ExchangeConnection[]> {
    return await db.select().from(exchangeConnections).where(eq(exchangeConnections.userId, userId));
  }

  async updateExchangeConnection(connectionId: string, updates: Partial<InsertExchangeConnection>): Promise<ExchangeConnection> {
    const [updatedConnection] = await db
      .update(exchangeConnections)
      .set(updates)
      .where(eq(exchangeConnections.id, connectionId))
      .returning();
    return updatedConnection;
  }

  async deleteExchangeConnection(connectionId: string): Promise<void> {
    await db.delete(exchangeConnections).where(eq(exchangeConnections.id, connectionId));
  }

  // Price alert operations
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [createdAlert] = await db.insert(priceAlerts).values(alert).returning();
    return createdAlert;
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return await db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId));
  }

  async updatePriceAlert(alertId: string, updates: Partial<InsertPriceAlert>): Promise<PriceAlert> {
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set(updates)
      .where(eq(priceAlerts.id, alertId))
      .returning();
    return updatedAlert;
  }

  async deletePriceAlert(alertId: string): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, alertId));
  }

  // Market data operations
  async upsertMarketData(data: InsertMarketData): Promise<MarketData> {
    const [upsertedData] = await db
      .insert(marketData)
      .values(data)
      .onConflictDoUpdate({
        target: marketData.symbol,
        set: {
          ...data,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return upsertedData;
  }

  async getMarketData(symbols?: string[]): Promise<MarketData[]> {
    const query = db.select().from(marketData);
    if (symbols?.length) {
      return await query.where(sql`${marketData.symbol} = ANY(${symbols})`);
    }
    return await query.orderBy(desc(marketData.lastUpdated));
  }

  async getLatestMarketData(symbol: string): Promise<MarketData | undefined> {
    const [data] = await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, symbol))
      .orderBy(desc(marketData.lastUpdated))
      .limit(1);
    return data;
  }

  // Portfolio performance operations
  async recordPortfolioPerformance(performance: InsertPortfolioPerformance): Promise<PortfolioPerformance> {
    const [recordedPerformance] = await db.insert(portfolioPerformance).values(performance).returning();
    return recordedPerformance;
  }

  async getPortfolioPerformance(portfolioId: string, limit: number = 30): Promise<PortfolioPerformance[]> {
    return await db
      .select()
      .from(portfolioPerformance)
      .where(eq(portfolioPerformance.portfolioId, portfolioId))
      .orderBy(desc(portfolioPerformance.recordedAt))
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