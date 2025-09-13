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

// Transaction approval tables for company asset management
export const transactionApprovals = pgTable("transaction_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").unique().notNull(), // External transaction reference
  entityId: varchar("entity_id").notNull(), // Which entity the transaction is for
  entityName: varchar("entity_name").notNull(),
  entityType: varchar("entity_type").notNull(),
  
  // Transaction details
  fromAccount: varchar("from_account").notNull(),
  toAccount: varchar("to_account").notNull(),
  amount: varchar("amount").notNull(), // Store as string to preserve precision
  currency: varchar("currency").default("USD").notNull(),
  transferType: varchar("transfer_type").notNull(), // internal, external, crypto, wire
  memo: text("memo"),
  
  // Approval workflow
  status: varchar("status").default("pending_approval").notNull(), // pending_approval, approved, rejected, cancelled
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id, { onDelete: 'set null' }),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Metadata
  initiatedBy: varchar("initiated_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval notifications for admin alerts
export const approvalNotifications = pgTable("approval_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => transactionApprovals.transactionId, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // pending_approval, approved, rejected, cancelled
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
export type InsertSystemLog = typeof systemLogs.$inferInsert;
export type TransactionApproval = typeof transactionApprovals.$inferSelect;
export type InsertTransactionApproval = typeof transactionApprovals.$inferInsert;
export type ApprovalNotification = typeof approvalNotifications.$inferSelect;
export type InsertApprovalNotification = typeof approvalNotifications.$inferInsert;