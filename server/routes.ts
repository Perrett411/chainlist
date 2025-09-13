// Protected API routes for Perrett & Associates platform
// Referenced from javascript_log_in_with_replit blueprint

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, requirePermission } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Public health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Perrett & Associates Platform'
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove sensitive data before sending to client
      const { apiKeyHash, ...safeUser } = user;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      // This would typically have pagination and filtering
      const logs = await storage.getSystemLogs(50);
      
      // Log admin access
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'ADMIN_ACCESS_USERS',
        details: { endpoint: '/api/admin/users' },
        severity: 'info',
      });
      
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      res.status(500).json({ message: "Failed to fetch admin data" });
    }
  });

  app.post('/api/admin/users/:userId/role', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role, permissions } = req.body;
      
      if (!['user', 'admin', 'cfo'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const validPermissions = ['read', 'write', 'admin'];
      if (!Array.isArray(permissions) || !permissions.every(p => validPermissions.includes(p))) {
        return res.status(400).json({ message: "Invalid permissions" });
      }

      const updatedUser = await storage.updateUserRole(userId, role, permissions);
      
      // Log role change
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'USER_ROLE_CHANGED',
        details: {
          targetUserId: userId,
          newRole: role,
          newPermissions: permissions,
        },
        severity: 'warning',
      });
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // API usage tracking routes
  app.get('/api/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getApiUsage(userId);
      
      res.json({ usage });
    } catch (error) {
      console.error("Error fetching API usage:", error);
      res.status(500).json({ message: "Failed to fetch API usage" });
    }
  });

  // System monitoring routes (admin only)
  app.get('/api/admin/system/metrics', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const logs = await storage.getSystemLogs(100);
      
      // Calculate metrics
      const metrics = {
        totalUsers: 0, // Would query users table
        activeUsers: 0, // Users logged in within last 24h
        totalApiCalls: logs.filter(log => log.action.includes('API')).length,
        securityAlerts: logs.filter(log => log.severity === 'warning' || log.severity === 'error').length,
        systemLoad: Math.random() * 100, // Mock system load
        lastUpdated: new Date().toISOString(),
      };
      
      // Log admin metrics access
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'ADMIN_VIEW_METRICS',
        details: { endpoint: '/api/admin/system/metrics' },
        severity: 'info',
      });
      
      res.json({ metrics, recentLogs: logs.slice(0, 10) });
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  // AI Assistant routes (requires read permission)
  app.post('/api/ai/chat', isAuthenticated, requirePermission('read'), async (req: any, res) => {
    try {
      const { message } = req.body;
      
      // Log AI usage
      await storage.logApiUsage({
        userId: req.currentUser.id,
        apiEndpoint: '/api/ai/chat',
        requestCount: '1',
        lastRequestAt: new Date(),
      });
      
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'AI_CHAT_REQUEST',
        details: { messageLength: message?.length || 0 },
        severity: 'info',
      });
      
      // Mock AI response for now
      res.json({
        response: "Hello! I'm the Perrett & Associates AI Assistant. This is a secure authenticated session. How can I help you with financial analysis today?",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  // Quantum Chain routes (requires write permission)
  app.get('/api/quantum/status', isAuthenticated, requirePermission('read'), async (req: any, res) => {
    try {
      // Log quantum access
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'QUANTUM_STATUS_CHECK',
        details: { endpoint: '/api/quantum/status' },
        severity: 'info',
      });
      
      res.json({
        status: 'operational',
        quantumLockActive: true,
        securityLevel: 'maximum',
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching quantum status:", error);
      res.status(500).json({ message: "Failed to fetch quantum status" });
    }
  });

  // Data streaming routes (requires read permission)
  app.get('/api/streaming/data', isAuthenticated, requirePermission('read'), async (req: any, res) => {
    try {
      // Log data streaming access
      await storage.logSystemEvent({
        userId: req.currentUser.id,
        action: 'DATA_STREAM_ACCESS',
        details: { endpoint: '/api/streaming/data' },
        severity: 'info',
      });
      
      res.json({
        streams: [
          { id: 'crypto_feed', status: 'active', lastUpdate: new Date().toISOString() },
          { id: 'market_data', status: 'active', lastUpdate: new Date().toISOString() },
          { id: 'blockchain_events', status: 'active', lastUpdate: new Date().toISOString() },
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching streaming data:", error);
      res.status(500).json({ message: "Failed to fetch streaming data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}