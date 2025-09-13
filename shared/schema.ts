// Schema for Replit Auth integration with Perrett & Associates platform
// Referenced from javascript_log_in_with_replit blueprint

import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
} from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Additional fields for Perrett & Associates platform
  role: varchar("role").default("user").notNull(), // user, admin, cfo
  permissions: text("permissions").array().default(sql`ARRAY['read']::text[]`).notNull(),
  apiKeyHash: varchar("api_key_hash"), // Hashed API key for API access
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API usage tracking for rate limiting and monitoring
export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  apiEndpoint: varchar("api_endpoint").notNull(),
  requestCount: varchar("request_count").default("0").notNull(),
  lastRequestAt: timestamp("last_request_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System logs for security auditing
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  action: varchar("action").notNull(), // LOGIN, LOGOUT, API_CALL, ADMIN_ACTION, etc.
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  severity: varchar("severity").default("info").notNull(), // info, warning, error, critical
  timestamp: timestamp("timestamp").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
export type InsertSystemLog = typeof systemLogs.$inferInsert;